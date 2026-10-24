import TriviaGame from '@/components/TriviaGame';
import { Gamepad2 } from 'lucide-react';

export const metadata = {
  title: 'Movie Trivia Mini-Game | Movie Explorer',
  description: 'Test your cinema knowledge with blurry posters, famous taglines, and plot puzzles!',
};

export default function TriviaPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden min-h-[calc(100vh-64px)]">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/15 rounded-full filter blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Page Title */}
      <div className="text-center mb-8 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm font-semibold text-amber-300 shadow-lg mb-3">
          <Gamepad2 className="w-4 h-4 text-amber-400" />
          <span>Interactive Cinephile Challenge</span>
        </div>
      </div>

      <div className="w-full z-10">
        <TriviaGame />
      </div>
    </div>
  );
}
