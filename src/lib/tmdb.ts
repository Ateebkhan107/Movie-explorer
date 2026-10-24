/**
 * TMDB API Client & Image Utilities
 * Optimized for Next.js 16 App Router performance, intelligent caching, and multi-host resilience.
 */

export const PRIMARY_BASE_URL = 'https://api.tmdb.org/3';
export const FALLBACK_BASE_URL = 'https://api.themoviedb.org/3';
export const BASE_URL = PRIMARY_BASE_URL;

export const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export type TmdbPosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type TmdbBackdropSize = 'w300' | 'w780' | 'w1280' | 'original';

/**
 * Returns an optimized TMDB image URL for the requested resolution.
 * Defaults to 'w342' for responsive poster grids (60% smaller than w500).
 */
export function getTmdbImageUrl(
  path: string | null | undefined,
  size: TmdbPosterSize | TmdbBackdropSize = 'w342'
): string {
  if (!path) {
    return 'https://via.placeholder.com/342x513/1e1b4b/ffffff?text=No+Poster';
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function hasTmdbKey(): boolean {
  return Boolean(process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.trim().length > 0);
}

export function getTmdbUrl(path: string, params: Record<string, string> = {}, baseUrl: string = PRIMARY_BASE_URL) {
  const url = new URL(`${baseUrl}${path}`);
  url.searchParams.append('api_key', process.env.TMDB_API_KEY || '');
  url.searchParams.append('language', 'en-US');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}

/** Redacts sensitive API key from URLs for secure server logging */
function sanitizeUrlForLogging(rawUrl: string): string {
  return rawUrl.replace(/api_key=[^&]+/g, 'api_key=REDACTED');
}

/** Simple in-memory LRU-like cache with TTL to eliminate redundant upstream calls */
interface CacheEntry {
  data: unknown;
  status: number;
  expiresAt: number;
}
const MEM_CACHE = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 200;

export function getFromMemCache<T>(key: string): { data: T; status: number } | null {
  const entry = MEM_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    MEM_CACHE.delete(key);
    return null;
  }
  return { data: entry.data as T, status: entry.status };
}

export function setMemCache(key: string, data: unknown, status: number, ttlSeconds: number) {
  if (MEM_CACHE.size >= MAX_CACHE_ENTRIES) {
    // Evict oldest 20% of keys
    const keysToDelete = Array.from(MEM_CACHE.keys()).slice(0, 40);
    keysToDelete.forEach((k) => MEM_CACHE.delete(k));
  }
  MEM_CACHE.set(key, {
    data,
    status,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export interface FetchTmdbOptions extends RequestInit {
  timeoutMs?: number;
  revalidate?: number;
}

/**
 * Executes a resilient, cached fetch to TMDB.
 * Features:
 * - Primary api.tmdb.org with fallback to api.themoviedb.org
 * - Configurable timeout via AbortController (default 5000ms)
 * - Exponential backoff with jitter (only for transient 5xx or network resets)
 * - Never retries 4xx client errors (respects 429 Retry-After)
 * - Next.js revalidation support
 */
export async function fetchTmdb(
  path: string,
  params: Record<string, string> = {},
  options?: FetchTmdbOptions,
  maxRetries = 1
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? 5000;
  const revalidate = options?.revalidate;

  const hosts = [PRIMARY_BASE_URL, FALLBACK_BASE_URL];
  let lastError: unknown = null;

  for (const host of hosts) {
    const targetUrl = getTmdbUrl(path, params, host);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const fetchInit: RequestInit = {
          ...options,
          signal: controller.signal,
          headers: {
            'User-Agent': 'MovieExplorer/1.0 (Next.js 16 Performance)',
            'Accept': 'application/json',
            ...options?.headers,
          },
          ...(revalidate ? { next: { revalidate } } : {}),
        };

        const res = await fetch(targetUrl, fetchInit);
        clearTimeout(timer);

        // Handle 429 Rate Limiting
        if (res.status === 429) {
          const retryAfter = res.headers.get('retry-after');
          const waitMs = retryAfter
            ? Math.min(parseInt(retryAfter, 10) * 1000, 2000)
            : 500;
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, waitMs));
            continue;
          }
          return res;
        }

        // Return immediately on 4xx (do not retry client errors)
        if (res.status >= 400 && res.status < 500) {
          return res;
        }

        // Successful 2xx or 3xx
        if (res.ok) {
          return res;
        }

        // 5xx Server Error - retry with jitter if attempts remain
        if (attempt < maxRetries) {
          const delay = Math.min(200 * Math.pow(2, attempt) + Math.random() * 80, 1000);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        return res;
      } catch (err: unknown) {
        clearTimeout(timer);
        lastError = err;

        // If aborted or connection reset, retry with backoff
        if (attempt < maxRetries) {
          const delay = Math.min(200 * Math.pow(2, attempt) + Math.random() * 80, 1000);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    // If primary host failed, try secondary host
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Host ${host} failed for ${sanitizeUrlForLogging(targetUrl)}, attempting fallback host.`);
    }
  }

  throw lastError || new Error('TMDB service unavailable across all endpoints');
}
