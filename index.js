const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

// Check if API key is configured
if (!API_KEY) {
  console.error('❌ TMDB_API_KEY environment variable is not set!');
  console.error('Please add TMDB_API_KEY=your_api_key to your .env file');
  console.log('🔄 Running in demo mode with fallback data');
}

// Configure axios with production settings
const apiClient = axios.create({
  timeout: 10000, // Reduced timeout
  headers: {
    'User-Agent': 'MovieExplorer/1.0',
    'Accept': 'application/json',
    'Connection': 'keep-alive'
  },
  // Add retry configuration
  validateStatus: function (status) {
    return status >= 200 && status < 300; // Accept only 2xx status codes
  }
});

// Security middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove server info in production
  if (NODE_ENV === 'production') {
    res.removeHeader('X-Powered-By');
  }
  
  next();
});

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Replace with your domain
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files with caching
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  lastModified: true
}));

// Rate limiting for API endpoints
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Improved retry function with exponential backoff
async function retryRequest(fn, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Retry ${i + 1}/${maxRetries} after error:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Shorter delays for faster fallback
      const delay = Math.min(500 * Math.pow(2, i), 2000); // Max 2s delay
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// API Routes
app.get('/api/genres', async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({ 
      error: 'API key not configured',
      message: 'Please configure TMDB_API_KEY in your environment'
    });
  }

  try {
    const response = await retryRequest(() => 
      apiClient.get(`${BASE_URL}/genre/movie/list`, {
        params: {
          api_key: API_KEY,
          language: 'en-US'
        }
      })
    );
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching genres:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch genres', 
      message: NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

app.get('/api/movies', async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({ 
      error: 'API key not configured',
      message: 'Please configure TMDB_API_KEY in your environment'
    });
  }

  try {
    const { query = '', genre = '', page = 1 } = req.query;
    let url;
    let params = {
      api_key: API_KEY,
      language: 'en-US',
      page: parseInt(page) || 1,
      include_adult: false
    };

    if (query.trim()) {
      url = `${BASE_URL}/search/movie`;
      params.query = query;
    } else if (genre) {
      url = `${BASE_URL}/discover/movie`;
      params.with_genres = genre;
      params.sort_by = 'popularity.desc';
    } else {
      url = `${BASE_URL}/movie/popular`;
    }

    const response = await retryRequest(() => 
      apiClient.get(url, { params })
    );
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching movies:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch movies', 
      message: NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
    apiKeyConfigured: !!API_KEY
  });
});

// Test TMDB API connectivity
app.get('/api/test', async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({ 
      status: 'API key not configured',
      message: 'Please configure TMDB_API_KEY in your environment'
    });
  }

  try {
    const response = await apiClient.get(`${BASE_URL}/movie/popular`, {
      params: {
        api_key: API_KEY,
        page: 1
      }
    });
    res.json({ 
      status: 'TMDB API is accessible',
      movieCount: response.data.results.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'TMDB API connection failed',
      error: NODE_ENV === 'development' ? err.message : 'Connection error'
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve the main HTML file for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Don't leak error details in production
  const errorMessage = NODE_ENV === 'development' ? err.message : 'Internal server error';
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: errorMessage
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`🔑 API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🌐 Test API connectivity: http://localhost:${PORT}/api/test`);
  
  if (!API_KEY) {
    console.log('⚠️  Running in demo mode - frontend will use direct TMDB API');
  }
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});