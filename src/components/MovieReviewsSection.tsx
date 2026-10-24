'use client';

import { useState, useEffect } from 'react';
import { useReviews } from '@/context/ReviewsContext';
import { TmdbReview } from '@/types';
import StarRating from './StarRating';
import {
  MessageSquare,
  Send,
  Trash2,
  User,
  PenLine,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

interface MovieReviewsSectionProps {
  movieId: number;
  movieTitle: string;
  moviePosterPath?: string | null;
  tmdbRating?: number;
}

export default function MovieReviewsSection({
  movieId,
  movieTitle,
  moviePosterPath,
  tmdbRating,
}: MovieReviewsSectionProps) {
  const {
    getMovieReviews,
    getUserReview,
    getUserRating,
    addReview,
    deleteReview,
    setQuickRating,
  } = useReviews();

  const userReviews = getMovieReviews(movieId);
  const myReview = getUserReview(movieId);
  const userRating = getUserRating(movieId);

  const [communityReviews, setCommunityReviews] = useState<TmdbReview[]>([]);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);

  // Review form state
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [formRating, setFormRating] = useState<number>(userRating || 5);
  const [formAuthor, setFormAuthor] = useState('');
  const [formContent, setFormContent] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  // Sync form rating if user rating changes
  useEffect(() => {
    if (userRating) {
      setFormRating(userRating);
    }
  }, [userRating]);

  // If user already wrote a review, prefill form
  useEffect(() => {
    if (myReview && myReview.content) {
      setFormContent(myReview.content);
      setFormAuthor(myReview.author);
      setFormRating(myReview.rating);
    }
  }, [myReview]);

  // Fetch TMDB community reviews
  useEffect(() => {
    let isMounted = true;
    async function fetchCommunityReviews() {
      setIsLoadingCommunity(true);
      try {
        const res = await fetch(`/api/movies/${movieId}/reviews`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setCommunityReviews(data.results || []);
          }
        }
      } catch (err) {
        console.error('Failed to load community reviews:', err);
      } finally {
        if (isMounted) setIsLoadingCommunity(false);
      }
    }

    fetchCommunityReviews();
    return () => {
      isMounted = false;
    };
  }, [movieId]);

  const handleQuickRate = (starValue: number) => {
    setQuickRating(movieId, movieTitle, starValue, moviePosterPath);
    setFormRating(starValue);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) return;

    addReview({
      movieId,
      movieTitle,
      moviePosterPath,
      author: formAuthor.trim() || 'Anonymous Reviewer',
      rating: formRating,
      content: formContent.trim(),
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsWritingReview(false);
    }, 1200);
  };

  const toggleExpand = (id: string) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalReviewsCount = userReviews.length + communityReviews.length;

  return (
    <div className="pt-8 border-t border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            Ratings & Reviews
            {totalReviewsCount > 0 && (
              <span className="text-sm font-normal text-white/50 ml-1">
                ({totalReviewsCount})
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Community feedback and your personal rating
          </p>
        </div>

        {/* User quick rating box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:px-4 flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              {userRating ? 'Your Rating' : 'Rate Film'}
            </p>
            <p className="text-[11px] text-gray-400">
              {userRating ? `${userRating} of 5 Stars` : 'Tap to rate'}
            </p>
          </div>
          <StarRating
            rating={userRating || 0}
            interactive={true}
            size="md"
            onChange={handleQuickRate}
            showLabel={false}
          />
        </div>
      </div>

      {/* Review CTA & Write Form */}
      <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-md">
        {!isWritingReview ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {myReview?.content ? 'Edit your review' : 'Have you seen this movie?'}
              </h4>
              <p className="text-sm text-gray-300">
                {myReview?.content
                  ? 'Update your review or rating anytime.'
                  : 'Share your thoughts and help other movie lovers discover great cinema.'}
              </p>
            </div>
            <button
              onClick={() => setIsWritingReview(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 shrink-0"
            >
              <PenLine className="w-4 h-4" />
              {myReview?.content ? 'Edit Review' : 'Write a Review'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <PenLine className="w-5 h-5 text-indigo-400" />
                Write Your Review
              </h4>
              <button
                type="button"
                onClick={() => setIsWritingReview(false)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Form Star Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-black/30 p-3.5 rounded-2xl border border-white/10">
              <span className="text-sm text-gray-300 font-medium">Select your rating:</span>
              <StarRating
                rating={formRating}
                interactive={true}
                size="md"
                onChange={(r) => setFormRating(r)}
                showLabel={true}
              />
            </div>

            {/* Author Name */}
            <div>
              <label htmlFor="review-author" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <input
                id="review-author"
                type="text"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="e.g. MovieBuff24"
                maxLength={40}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Review Content */}
            <div>
              <label htmlFor="review-content" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Your Thoughts <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="review-content"
                rows={4}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="What did you think of the directing, acting, or story? What stood out to you?"
                required
                maxLength={1200}
                className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y custom-scrollbar"
              />
              <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1">
                <span>Markdown supported</span>
                <span>{formContent.length}/1200</span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsWritingReview(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formContent.trim() || submitSuccess}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-full font-medium text-sm transition-all shadow-lg active:scale-95"
              >
                {submitSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Published!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Review
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {/* User's own review prominently highlighted */}
        {userReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/40 shadow-xl space-y-3 relative"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-bold">
                  {rev.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm sm:text-base">{rev.author}</span>
                    <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/40">
                      Your Review
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StarRating rating={rev.rating} size="sm" showLabel={true} />
                <button
                  onClick={() => deleteReview(rev.id)}
                  aria-label="Delete your review"
                  title="Delete review"
                  className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line pl-1">
              {rev.content}
            </p>
          </div>
        ))}

        {/* Community Reviews from TMDB */}
        {communityReviews.map((rev) => {
          const isExpanded = Boolean(expandedReviews[rev.id]);
          const isLong = rev.content.length > 280;
          const displayContent = isLong && !isExpanded
            ? `${rev.content.slice(0, 280)}...`
            : rev.content;

          // TMDB ratings are out of 10, scale to 5 stars if available
          const starVal = rev.author_details?.rating
            ? Math.round(rev.author_details.rating / 2)
            : 0;

          const avatarUrl = rev.author_details?.avatar_path
            ? rev.author_details.avatar_path.startsWith('/http')
              ? rev.author_details.avatar_path.substring(1)
              : `https://image.tmdb.org/t/p/w92${rev.author_details.avatar_path}`
            : null;

          return (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={rev.author}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm sm:text-base block">
                      {rev.author_details?.name || rev.author}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {starVal > 0 && (
                  <StarRating rating={starVal} size="sm" showLabel={true} />
                )}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line pl-1 font-light">
                {displayContent}
              </p>

              {isLong && (
                <button
                  type="button"
                  onClick={() => toggleExpand(rev.id)}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors pl-1"
                >
                  {isExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Read full review</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}

        {/* Empty state when no reviews are found */}
        {!isLoadingCommunity && userReviews.length === 0 && communityReviews.length === 0 && (
          <div className="text-center py-10 px-4 bg-white/5 rounded-2xl border border-white/10">
            <MessageSquare className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <h5 className="text-base font-semibold text-white mb-1">No reviews yet</h5>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto mb-4">
              Be the first to share your thoughts and rate this film!
            </p>
            <button
              onClick={() => setIsWritingReview(true)}
              className="px-5 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-full text-xs sm:text-sm font-medium transition-colors"
            >
              Write First Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
