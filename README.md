# Movie Explorer 🎬

A modern, highly interactive movie discovery web application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. Explore the latest blockbusters, discover hidden gems, and build your perfect watchlist. 

Powered by the **TMDB API**.

## ✨ Features

- **Tinder-Style Discover Mode**: Swipe right on movies to add them to your watchlist, or swipe left to skip. Built with physics-based drag gestures using Framer Motion.
- **My Watchlist**: Save movies locally using `localStorage`. Your watchlist persists across sessions and is accessible from a dedicated page.
- **Interactive Movie Detail Modal**: View full movie details, a cast overview, and an embedded YouTube trailer right on the page without losing your context. Includes a "Similar Movies" scrollable carousel.
- **Secure Backend API Proxies**: All TMDB API calls run through server-side Next.js route handlers, ensuring your API key is never exposed on the client.
- **Debounced Search & Filtering**: Fast, responsive search and genre filtering with debouncing to prevent unnecessary API spam.
- **Beautiful Glassmorphism UI**: A polished, responsive design with smooth stagger animations, hover effects, and a custom gradient backdrop.

## 🚀 Tech Stack

- [Next.js](https://nextjs.org/) (App Router, Server API Routes)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) (Animations & Gestures)
- [Lucide React](https://lucide.dev/) (Icons)
- [usehooks-ts](https://usehooks-ts.com/) (Custom Hooks like `useLocalStorage`, `useDebounceValue`)

## 🛠️ Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Movie-explorer.git
cd Movie-explorer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory of the project and add your TMDB API Key:

```env
TMDB_API_KEY=your_tmdb_api_key_here
```

You can obtain a free API key by signing up at [The Movie Database (TMDB)](https://www.themoviedb.org/).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚀 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com). 

1. Push your code to a GitHub repository.
2. Go to Vercel and import your repository.
3. Add `TMDB_API_KEY` to the Environment Variables section in your Vercel project settings.
4. Deploy!

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

---
*Created by Ateeb Khan*
