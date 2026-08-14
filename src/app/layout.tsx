import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WatchlistProvider } from '@/context/WatchlistContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Movie Explorer',
  description: 'Discover the latest and greatest films from around the world',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-gradient-to-br from-indigo-600 to-purple-800 text-white`}>
        <WatchlistProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </WatchlistProvider>
      </body>
    </html>
  );
}
