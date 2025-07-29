<div align="center">

# 🎬 Movie Explorer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20App-blue?style=for-the-badge&logo=github)](https://ateebkhan107.github.io/Movie-explorer/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Ateebkhan107/Movie-explorer)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://github.com/Ateebkhan107/Movie-explorer)

A beautiful, modern movie exploration app built with Node.js, Express, and the TMDB API. Features a responsive design with glassmorphism effects, smooth animations, and a comprehensive movie database.

## ✨ Features

- 🎨 **Modern UI Design** - Glassmorphism effects, gradients, and smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🔍 **Advanced Search** - Search movies by title with real-time results
- 🏷️ **Genre Filtering** - Filter movies by genre categories
- ⭐ **Rating System** - View movie ratings and release years
- 🚀 **Fast Performance** - Optimized loading with lazy images and caching
- 🔒 **Production Ready** - Security headers, rate limiting, and error handling
- 🌐 **Hybrid Architecture** - Works with real API data or demo data seamlessly

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **API** | TMDB (The Movie Database) |
| **Styling** | Custom CSS with glassmorphism |
| **Icons** | Font Awesome |
| **Fonts** | Inter (Google Fonts) |

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- TMDB API Key (optional for local development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ateebkhan107/Movie-explorer.git
cd Movie-explorer
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables (optional)**
```bash
# Create .env file for local development
echo TMDB_API_KEY=your_api_key_here > .env
echo PORT=3000 >> .env
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 🌐 How It Works

### 🔐 **Secure Hybrid Architecture**

This app uses a **secure hybrid approach** that works in multiple scenarios:

#### **GitHub Pages (Public Demo)**
- ✅ **Real API Data**: Uses a public demo API key for live functionality
- ✅ **No Personal Keys**: Your personal API keys are never exposed
- ✅ **Full Functionality**: Search, filter, and browse real movies
- ✅ **Rate Limited**: Safe for public use with TMDB's demo key

#### **Local Development (Private)**
- 🔒 **Secure Backend**: Uses your personal API key via environment variables
- 🔒 **Hidden Keys**: API keys stored securely in `.env` file
- 🔒 **Full Access**: Unlimited API calls with your personal key

#### **Production Deployment**
- 🚀 **Backend Server**: Deploy with Node.js backend for maximum security
- 🚀 **Environment Variables**: API keys stored securely on server
- 🚀 **Professional Setup**: Enterprise-grade security

## 🎯 How to Use

1. **Search Movies**: Type in the search box to find movies by title
2. **Filter by Genre**: Use the dropdown to filter by movie genre
3. **Browse Results**: Click on movie cards to see details
4. **Real-time Updates**: Results update automatically as you type

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/genres` | GET | Get movie genres |
| `/api/movies` | GET | Get movies (with query/genre filters) |
| `/api/health` | GET | Health check |
| `/api/test` | GET | Test TMDB API connectivity |

## 🔒 Security Features

- **Rate Limiting** - Prevents API abuse
- **Security Headers** - XSS protection, content type options
- **CORS Configuration** - Configurable for production
- **Input Validation** - Sanitized API requests
- **Error Handling** - No sensitive data leakage
- **Environment Variables** - Secure API key storage

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `style.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #ffd700;
}
```

### Adding Features
- New API endpoints in `index.js`
- Frontend functionality in `script.js`
- Styling updates in `style.css`

## 📊 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TMDB_API_KEY` | Your TMDB API key | No* | Demo key |
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |

*Required only for local development with personal API key

## 📁 Project Structure

```
movie-explorer/
├── public/           # Static files
│   ├── index.html    # Main HTML file
│   ├── style.css     # Styles
│   └── script.js     # Frontend JavaScript
├── index.js          # Express server
├── package.json      # Dependencies and scripts
├── .env              # Environment variables (private)
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

## 🚀 Deployment Options

### Option 1: GitHub Pages (Current)
- ✅ **Live Demo**: https://ateebkhan107.github.io/Movie-explorer/
- ✅ **No Setup Required**: Works immediately
- ✅ **Real API Data**: Uses secure demo key
- ✅ **Free Hosting**: GitHub Pages hosting

### Option 2: Deploy to Heroku
```bash
npm install -g heroku
heroku login
heroku create your-app-name
heroku config:set TMDB_API_KEY=your_api_key_here
git push heroku main
```

### Option 3: Deploy to Railway
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Option 4: Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Option 5: Deploy to DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with one click

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie database API
- [Font Awesome](https://fontawesome.com/) for the beautiful icons
- [Google Fonts](https://fonts.google.com/) for the Inter font family

## 📞 Support

If you have any questions or need help with deployment, please open an issue on GitHub.

---

**Made with ❤️ by Ateeb Khan** 