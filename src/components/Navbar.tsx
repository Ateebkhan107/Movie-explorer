'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Compass, Heart } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { watchlist } = useWatchlist();
  
  const navLinks = [
    { name: 'Home', href: '/', icon: Film },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'Watchlist', href: '/watchlist', icon: Heart },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <Film className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl tracking-tight text-white">Movie Explorer</span>
            </Link>
          </div>
          
          <div className="flex space-x-1 sm:space-x-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{link.name}</span>
                  
                  {link.name === 'Watchlist' && watchlist.length > 0 && (
                    <AnimatePresence>
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                      >
                        {watchlist.length}
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
