'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Compass, Heart, Star } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { useReviews } from '@/context/ReviewsContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { watchlist } = useWatchlist();
  const { reviews } = useReviews();

  const navLinks = [
    { name: 'Home', href: '/', icon: Film, badge: 0 },
    { name: 'Discover', href: '/discover', icon: Compass, badge: 0 },
    { name: 'Watchlist', href: '/watchlist', icon: Heart, badge: watchlist.length },
    { name: 'Reviews', href: '/reviews', icon: Star, badge: reviews.length },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <Film className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-lg sm:text-xl tracking-tight text-white">Movie Explorer</span>
            </Link>
          </div>
          
          <div className="flex space-x-1 sm:space-x-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 min-h-[40px] rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{link.name}</span>
                  
                  {link.badge > 0 && (
                    <AnimatePresence>
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={`absolute -top-1 -right-1 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ${
                          link.name === 'Reviews'
                            ? 'bg-purple-500 text-white'
                            : 'bg-yellow-400 text-black'
                        }`}
                      >
                        {link.badge}
                      </motion.span>
                    </AnimatePresence>
                  )}
                  
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-full bg-white/10 -z-10 border border-white/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
