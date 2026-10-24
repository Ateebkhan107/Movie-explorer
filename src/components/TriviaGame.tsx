'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TriviaQuestion, TriviaRoundSummary } from '@/types/trivia';
import { calculateRank, STATIC_TRIVIA_QUESTIONS, shuffleArray } from '@/lib/triviaData';
import { fireConfetti } from '@/lib/confetti';
import { sounds } from '@/lib/sound';
import { getTmdbImageUrl } from '@/lib/tmdb';
import { useWatchlist } from '@/context/WatchlistContext';
import { useLocalStorage } from 'usehooks-ts';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Lightbulb,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Film,
  Plus,
  Check,
} from 'lucide-react';

type GameState = 'lobby' | 'playing' | 'answered' | 'summary';

const QUESTION_TIME_LIMIT = 15; // 15 seconds per question

export default function TriviaGame() {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedMovies, setMissedMovies] = useState<Array<{ id: number; title: string; posterPath: string }>>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [soundMuted, setSoundMuted] = useState(false);

  // Lifelines (1 per game)
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [lifelineHintUsed, setLifelineHintUsed] = useState(false);
  const [lifelineTimeUsed, setLifelineTimeUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [hintRevealed, setHintRevealed] = useState(false);

  // High score in local storage
  const [highScore, setHighScore] = useLocalStorage<number>('movie-trivia-highscore', 0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const { addToWatchlist, isInWatchlist } = useWatchlist();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch or prepare a round of 10 questions
  const loadNewRound = useCallback(async () => {
    try {
      const res = await fetch('/api/trivia?count=10');
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setQuestions(shuffleArray(STATIC_TRIVIA_QUESTIONS).slice(0, 10));
  }, []);

  useEffect(() => {
    loadNewRound();
  }, [loadNewRound]);

  const toggleSound = () => {
    sounds.enabled = soundMuted;
    setSoundMuted(!soundMuted);
  };

  const startNewGame = () => {
    loadNewRound();
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setCorrectCount(0);
    setMissedMovies([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setLifeline5050Used(false);
    setLifelineHintUsed(false);
    setLifelineTimeUsed(false);
    setHiddenOptions([]);
    setHintRevealed(false);
    setIsNewHighScore(false);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setGameState('playing');
  };

  const currentQuestion: TriviaQuestion | undefined = questions[currentIndex];

  // Handle question timeout
  const handleTimeout = useCallback(() => {
    if (gameState !== 'playing' || !currentQuestion) return;

    sounds.playWrong();
    setSelectedAnswer('__TIMEOUT__');
    setStreak(0);
    setMissedMovies((prev) => [
      ...prev,
      {
        id: currentQuestion.movieId,
        title: currentQuestion.title,
        posterPath: currentQuestion.posterPath,
      },
    ]);
    setGameState('answered');
  }, [gameState, currentQuestion]);

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(QUESTION_TIME_LIMIT);
    setHiddenOptions([]);
    setHintRevealed(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        if (prev <= 4) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, handleTimeout]);

  // Answer handler
  const handleSelectAnswer = (chosen: string) => {
    if (gameState !== 'playing' || !currentQuestion) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(chosen);

    const isCorrect = chosen === currentQuestion.correctAnswer;

    if (isCorrect) {
      sounds.playCorrect();
      fireConfetti(1800);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setHighestStreak((h) => Math.max(h, newStreak));
      setCorrectCount((c) => c + 1);

      // Score formula: Base 500 + Speed Bonus (up to 500) * Streak Multiplier
      const multiplier = newStreak >= 4 ? 2.5 : newStreak >= 3 ? 2.0 : newStreak >= 2 ? 1.5 : 1.0;
      const speedBonus = Math.round((timeLeft / QUESTION_TIME_LIMIT) * 500);
      const earned = Math.round((500 + speedBonus) * multiplier);

      setScore((s) => s + earned);
    } else {
      sounds.playWrong();
      setStreak(0);
      setMissedMovies((prev) => [
        ...prev,
        {
          id: currentQuestion.movieId,
          title: currentQuestion.title,
          posterPath: currentQuestion.posterPath,
        },
      ]);
    }

    setGameState('answered');
  };

  // Move to next question or end game
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setGameState('playing');
    } else {
      // Game Over
      sounds.playWin();
      fireConfetti(3000);
      if (score > highScore) {
        setHighScore(score);
        setIsNewHighScore(true);
      }
      setGameState('summary');
    }
  };

  // Power-up 1: 50 / 50
  const useLifeline5050 = () => {
    if (lifeline5050Used || gameState !== 'playing' || !currentQuestion) return;
    setLifeline5050Used(true);

    const incorrect = currentQuestion.options.filter(
      (opt) => opt !== currentQuestion.correctAnswer
    );
    const toRemove = shuffleArray(incorrect).slice(0, 2);
    setHiddenOptions(toRemove);
  };

  // Power-up 2: Hint
  const useLifelineHint = () => {
    if (lifelineHintUsed || gameState !== 'playing' || !currentQuestion) return;
    setLifelineHintUsed(true);
    setHintRevealed(true);
  };

  // Power-up 3: Freeze Time (+10s)
  const useLifelineTime = () => {
    if (lifelineTimeUsed || gameState !== 'playing') return;
    setLifelineTimeUsed(true);
    setTimeLeft((prev) => prev + 10);
  };

  // Dynamic blur level for blurry poster clue: clears as time goes by
  const blurPx = currentQuestion?.clueType === 'blurry_poster'
    ? gameState === 'answered'
      ? 0
      : Math.max(0, Math.round((timeLeft / QUESTION_TIME_LIMIT) * 22))
    : 0;

  // Streak flame color
  const streakMultiplier = streak >= 4 ? '2.5x' : streak >= 3 ? '2.0x' : streak >= 2 ? '1.5x' : '1.0x';

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* LOBBY SCREEN */}
      {gameState === 'lobby' && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-8">
          <div className="inline-flex p-4 bg-gradient-to-tr from-amber-500/20 to-purple-500/20 rounded-3xl border border-white/20 shadow-inner">
            <Trophy className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Guess the Movie
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto">
              Test your cinema knowledge across 10 rounds of unblurring posters, iconic taglines, plot puzzles, and cast clues!
            </p>
          </div>

          {/* Quick rules & high score bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
            <div className="p-4 bg-black/30 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> 15s Timer
              </div>
              <p className="text-xs text-gray-300">Answer fast for max speed bonus points.</p>
            </div>

            <div className="p-4 bg-black/30 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4" /> Multiplier
              </div>
              <p className="text-xs text-gray-300">Build streaks for up to 2.5x score boosts!</p>
            </div>

            <div className="p-4 bg-black/30 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Trophy className="w-4 h-4" /> Best Score
              </div>
              <p className="text-sm font-bold text-white">{highScore.toLocaleString()} pts</p>
            </div>
          </div>

          {/* Start CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={startNewGame}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Start Game 🚀
            </button>
            <button
              onClick={toggleSound}
              className="p-3.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full border border-white/20 transition-all"
              aria-label={soundMuted ? 'Unmute sound' : 'Mute sound'}
            >
              {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>
          </div>
        </div>
      )}

      {/* PLAYING & ANSWERED SCREEN */}
      {(gameState === 'playing' || gameState === 'answered') && currentQuestion && (
        <div className="space-y-4">
          {/* Top Bar: Progress, Score, Streak & Sound */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            {/* Question Progress */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Round {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-base sm:text-lg font-bold text-white">
                {score.toLocaleString()} <span className="text-xs font-normal text-white/60">pts</span>
              </span>
            </div>

            {/* Streak Indicator */}
            {streak > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold animate-pulse">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{streak} Streak ({streakMultiplier})</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className="p-2 bg-white/5 hover:bg-white/15 rounded-full text-white/80 transition-colors"
                aria-label="Toggle sound"
              >
                {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Timer Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden border border-white/15">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 4
                  ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                  : timeLeft <= 8
                  ? 'bg-amber-400'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
            />
          </div>

          {/* Main Question Box */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
            {/* Clue Type Tag & Power-ups */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {currentQuestion.clueType === 'blurry_poster' && '🎯 Blurry Poster Challenge'}
                {currentQuestion.clueType === 'tagline' && '📜 Famous Tagline'}
                {currentQuestion.clueType === 'plot' && '📖 Mystery Plot'}
                {currentQuestion.clueType === 'cast' && '👥 Cast Connection'}
              </div>

              {/* Power-ups / Lifelines */}
              {gameState === 'playing' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={useLifeline5050}
                    disabled={lifeline5050Used}
                    title="Eliminate 2 wrong answers"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-40 text-amber-300 transition-all text-xs font-semibold"
                  >
                    <Zap className="w-3.5 h-3.5" /> 50:50
                  </button>

                  <button
                    onClick={useLifelineHint}
                    disabled={lifelineHintUsed}
                    title="Reveal hint"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-40 text-cyan-300 transition-all text-xs font-semibold"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Hint
                  </button>

                  <button
                    onClick={useLifelineTime}
                    disabled={lifelineTimeUsed}
                    title="Add 10 seconds"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-40 text-emerald-300 transition-all text-xs font-semibold"
                  >
                    <Clock className="w-3.5 h-3.5" /> +10s
                  </button>
                </div>
              )}
            </div>

            {/* Poster Clue Visual */}
            {currentQuestion.posterPath && (
              <div className="relative w-40 sm:w-48 aspect-[2/3] mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black/60">
                <Image
                  src={getTmdbImageUrl(currentQuestion.posterPath, 'w342')}
                  alt="Mystery Movie Poster"
                  fill
                  priority
                  style={{
                    filter: `blur(${blurPx}px)`,
                    transform: 'scale(1.08)',
                    transition: 'filter 0.5s ease',
                  }}
                  className="object-cover"
                />
                {blurPx > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
                      Unblurring in {timeLeft}s
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Clue Text */}
            <div className="text-center space-y-2">
              <p className="text-lg sm:text-2xl font-bold text-white drop-shadow-md leading-relaxed">
                {currentQuestion.clueText}
              </p>

              {/* Cast clues if available */}
              {currentQuestion.castClues && currentQuestion.castClues.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {currentQuestion.castClues.map((cast, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs text-gray-200"
                    >
                      {cast}
                    </span>
                  ))}
                </div>
              )}

              {/* Revealed Lifeline Hint */}
              {hintRevealed && (
                <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-xl p-2.5 text-cyan-200 text-xs sm:text-sm animate-pulse max-w-md mx-auto">
                  💡 <strong>Hint:</strong> Released in {currentQuestion.releaseYear}
                  {currentQuestion.genres.length > 0 ? ` • ${currentQuestion.genres.join(', ')}` : ''}
                </div>
              )}
            </div>

            {/* 4 Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQuestion.options.map((option) => {
                const isHidden = hiddenOptions.includes(option);
                const isCorrect = option === currentQuestion.correctAnswer;
                const isSelected = selectedAnswer === option;

                let btnStyle = 'bg-white/10 hover:bg-white/20 border-white/20 text-white';

                if (gameState === 'answered') {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500 text-white border-rose-400 font-bold';
                  } else {
                    btnStyle = 'bg-white/5 opacity-40 text-gray-400 border-white/5';
                  }
                }

                if (isHidden) {
                  return (
                    <div
                      key={option}
                      className="p-4 rounded-2xl border border-white/5 bg-white/5 opacity-20 pointer-events-none"
                    />
                  );
                }

                return (
                  <button
                    key={option}
                    disabled={gameState === 'answered'}
                    onClick={() => handleSelectAnswer(option)}
                    className={`p-4 rounded-2xl border text-left text-sm sm:text-base font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle} active:scale-98`}
                  >
                    <span>{option}</span>
                    {gameState === 'answered' && isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0 ml-2" />}
                    {gameState === 'answered' && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Post-Answer Result & Fun Fact Card */}
            {gameState === 'answered' && (
              <div className="pt-4 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">
                      {selectedAnswer === currentQuestion.correctAnswer
                        ? 'Spot on! Correct answer!'
                        : selectedAnswer === '__TIMEOUT__'
                        ? `Time ran out! The correct film was "${currentQuestion.correctAnswer}".`
                        : `Not quite! The correct answer was "${currentQuestion.correctAnswer}".`}
                    </h4>
                    <p className="text-xs sm:text-sm mt-1 text-white/80 leading-relaxed">
                      🎬 <strong>Did you know?</strong> {currentQuestion.funFact}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full text-sm shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Final Results'}</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUMMARY / GAME OVER SCREEN */}
      {gameState === 'summary' && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-8 animate-in zoom-in-95">
          <div className="space-y-3">
            <span className="text-5xl block animate-bounce">
              {correctCount >= 8 ? '🎉' : correctCount >= 5 ? '🎬' : '🍿'}
            </span>
            <div className="inline-block px-4 py-1.5 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-300 font-bold text-sm uppercase tracking-wider">
              {calculateRank(score, questions.length)}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Game Over!
            </h2>
            {isNewHighScore && (
              <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4" /> New High Score Achieved!
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            <div className="p-4 bg-black/30 border border-white/10 rounded-2xl">
              <span className="text-xs text-gray-400 block mb-1">Final Score</span>
              <span className="text-2xl font-black text-amber-400">{score.toLocaleString()}</span>
            </div>

            <div className="p-4 bg-black/30 border border-white/10 rounded-2xl">
              <span className="text-xs text-gray-400 block mb-1">Accuracy</span>
              <span className="text-2xl font-black text-emerald-400">
                {Math.round((correctCount / questions.length) * 100)}%
              </span>
            </div>

            <div className="p-4 bg-black/30 border border-white/10 rounded-2xl">
              <span className="text-xs text-gray-400 block mb-1">Correct</span>
              <span className="text-2xl font-black text-white">
                {correctCount} / {questions.length}
              </span>
            </div>

            <div className="p-4 bg-black/30 border border-white/10 rounded-2xl">
              <span className="text-xs text-gray-400 block mb-1">Top Streak</span>
              <span className="text-2xl font-black text-rose-400 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-rose-500" /> {highestStreak}
              </span>
            </div>
          </div>

          {/* Missed Movies: Save to Watchlist */}
          {missedMovies.length > 0 && (
            <div className="text-left bg-black/20 p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" />
                Films you missed — Add them to your watchlist:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {missedMovies.map((m) => {
                  const saved = isInWatchlist(m.id);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10 text-xs"
                    >
                      <span className="font-medium text-white truncate max-w-[200px]">
                        {m.title}
                      </span>
                      <button
                        onClick={() =>
                          addToWatchlist({
                            id: m.id,
                            title: m.title,
                            poster_path: m.posterPath,
                            vote_average: 8.0,
                            release_date: '',
                            genre_ids: [],
                            overview: '',
                          })
                        }
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          saved
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {saved ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Saved
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Watchlist
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={startNewGame}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold rounded-full shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another Round</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full border border-white/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Film className="w-4 h-4" />
              <span>Explore More Movies</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
