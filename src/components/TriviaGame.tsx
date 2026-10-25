'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TriviaQuestion } from '@/types/trivia';
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
  Film,
  Plus,
  Check,
  Quote,
  Users,
  BookOpen,
} from 'lucide-react';

type GameState = 'lobby' | 'playing' | 'answered' | 'summary';
type GameMode = 'all_cards' | 'quotes' | 'mixed';

const QUESTION_TIME_LIMIT = 15; // 15 seconds per question

export default function TriviaGame() {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [gameMode, setGameMode] = useState<GameMode>('all_cards');
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

  // Fetch questions
  const loadNewRound = useCallback(async (mode: GameMode) => {
    try {
      const res = await fetch(`/api/trivia?mode=${mode}&count=10`);
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
    loadNewRound(gameMode);
  }, [loadNewRound, gameMode]);

  const toggleSound = () => {
    sounds.enabled = soundMuted;
    setSoundMuted(!soundMuted);
  };

  const startNewGame = async () => {
    await loadNewRound(gameMode);
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

    sounds.playFlip();
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

    sounds.playFlip();

    const isCorrect = chosen === currentQuestion.correctAnswer;

    if (isCorrect) {
      setTimeout(() => sounds.playCorrect(), 200);
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
      setTimeout(() => sounds.playWrong(), 200);
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

  const streakMultiplier = streak >= 4 ? '2.5x' : streak >= 3 ? '2.0x' : streak >= 2 ? '1.5x' : '1.0x';

  // 3D Flip Card state: flipped to poster when answered!
  const isFlipped = gameState === 'answered';

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
              Read the clue on the mystery card, choose your guess, and watch the card flip to reveal the real movie poster!
            </p>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
            <button
              onClick={() => setGameMode('all_cards')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                gameMode === 'all_cards'
                  ? 'bg-amber-500/25 border-amber-400 text-white shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-2 ring-amber-400/50'
                  : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1 text-amber-300">
                <Sparkles className="w-4 h-4" /> 3D Flip Cards
              </div>
              <p className="text-xs text-gray-400 leading-snug">
                Blank mystery card that flips around in 3D when you guess!
              </p>
            </button>

            <button
              onClick={() => setGameMode('quotes')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                gameMode === 'quotes'
                  ? 'bg-purple-500/25 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)] ring-2 ring-purple-400/50'
                  : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1 text-purple-300">
                <Quote className="w-4 h-4" /> Quotes & Lines
              </div>
              <p className="text-xs text-gray-400 leading-snug">
                Guess famous cinema lines before flipping the poster.
              </p>
            </button>

            <button
              onClick={() => setGameMode('mixed')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                gameMode === 'mixed'
                  ? 'bg-indigo-500/25 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-2 ring-indigo-400/50'
                  : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1 text-indigo-300">
                <Film className="w-4 h-4" /> Mixed Clues
              </div>
              <p className="text-xs text-gray-400 leading-snug">
                A thrilling mix of plots, quotes, cast links, and trivia.
              </p>
            </button>
          </div>

          {/* Quick rules bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
            <div className="p-3.5 bg-black/30 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> 15s Per Round
              </div>
              <p className="text-xs text-gray-300">Answer fast for max speed bonus points.</p>
            </div>

            <div className="p-3.5 bg-black/30 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4" /> Multiplier
              </div>
              <p className="text-xs text-gray-300">Keep streaks alive for up to 2.5x score!</p>
            </div>

            <div className="p-3.5 bg-black/30 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Trophy className="w-4 h-4" /> Personal Best
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
              className="p-3.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full border border-white/20 transition-all cursor-pointer"
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
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Question {currentIndex + 1} of {questions.length}
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

            {/* Sound Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className="p-2 bg-white/5 hover:bg-white/15 rounded-full text-white/80 transition-colors cursor-pointer"
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
                {currentQuestion.clueType === 'tagline' && '📜 Famous Line Clue'}
                {currentQuestion.clueType === 'plot' && '📖 Mystery Plot Clue'}
                {currentQuestion.clueType === 'cast' && '👥 Cast Connection'}
                {currentQuestion.clueType === 'blurry_poster' && '🎴 3D Mystery Card Flip'}
              </div>

              {/* Power-ups / Lifelines */}
              {gameState === 'playing' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={useLifeline5050}
                    disabled={lifeline5050Used}
                    title="Eliminate 2 wrong answers"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-40 text-amber-300 transition-all text-xs font-semibold cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" /> 50:50
                  </button>

                  <button
                    onClick={useLifelineHint}
                    disabled={lifelineHintUsed}
                    title="Reveal hint"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-40 text-cyan-300 transition-all text-xs font-semibold cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Hint
                  </button>

                  <button
                    onClick={useLifelineTime}
                    disabled={lifelineTimeUsed}
                    title="Add 10 seconds"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-40 text-emerald-300 transition-all text-xs font-semibold cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" /> +10s
                  </button>
                </div>
              )}
            </div>

            {/* 3D FLIP CARD: Blank card during question -> Flips 180° to reveal poster on answer! */}
            <div
              className="w-48 sm:w-56 aspect-[2/3] mx-auto select-none my-4"
              style={{ perspective: '1200px' }}
            >
              <div
                className="relative w-full h-full"
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.8s cubic-bezier(0.34, 1.4, 0.64, 1)',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* FRONT SIDE (Blank Mystery Card during question) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden border-2 border-amber-400/40 bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 shadow-2xl p-5 flex flex-col items-center justify-between"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {/* Top card emblem */}
                  <div className="w-full flex items-center justify-between text-amber-400/70 text-xs font-mono">
                    <span>🎬 CINE</span>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 font-bold">
                      #{currentIndex + 1}
                    </span>
                    <span>🎬</span>
                  </div>

                  {/* Center Mystery Emblem */}
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-indigo-500/20 border-2 border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.3)] animate-pulse">
                        <Film className="w-10 h-10 text-amber-300" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-black flex items-center justify-center border border-white/20 shadow-md">
                        ?
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-base font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 uppercase block drop-shadow-sm">
                        Mystery Film
                      </span>
                      <span className="text-[11px] text-gray-400 block tracking-wider">
                        Tap your guess to flip
                      </span>
                    </div>
                  </div>

                  {/* Bottom card footer */}
                  <div className="w-full flex items-center justify-between text-white/30 text-[10px] font-mono border-t border-white/10 pt-2">
                    <span>EST. {currentQuestion.releaseYear}</span>
                    <span>MOVIE EXPLORER</span>
                  </div>
                </div>

                {/* BACK SIDE (Revealed Movie Poster upon answering) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden border-2 border-emerald-400/60 shadow-[0_0_30px_rgba(16,185,129,0.35)] bg-black"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <Image
                    src={getTmdbImageUrl(currentQuestion.posterPath, 'w342')}
                    alt={currentQuestion.title}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3 pointer-events-none">
                    <span className="text-xs font-bold text-white drop-shadow-md truncate">
                      {currentQuestion.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clue description text */}
            <div className="text-center space-y-2">
              <p className="text-lg sm:text-2xl font-bold text-white drop-shadow-md leading-relaxed max-w-xl mx-auto">
                {currentQuestion.clueText}
              </p>

              {/* Cast clues if available */}
              {currentQuestion.castClues && currentQuestion.castClues.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {currentQuestion.castClues.map((cast, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs text-cyan-200"
                    >
                      ⭐ {cast}
                    </span>
                  ))}
                </div>
              )}

              {/* Revealed Lifeline Hint */}
              {hintRevealed && (
                <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-xl p-2.5 text-cyan-200 text-xs sm:text-sm animate-pulse max-w-md mx-auto text-center">
                  💡 <strong>Hint:</strong> Released in {currentQuestion.releaseYear}
                  {currentQuestion.genres.length > 0 ? ` • Genres: ${currentQuestion.genres.join(', ')}` : ''}
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
                        ? `Spot on! The film is "${currentQuestion.correctAnswer}"!`
                        : selectedAnswer === '__TIMEOUT__'
                        ? `Time ran out! The correct film was "${currentQuestion.correctAnswer}".`
                        : `Not quite! The correct film was "${currentQuestion.correctAnswer}".`}
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
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
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
