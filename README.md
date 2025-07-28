# 🎬 Movie Explorer

A beautiful, modern movie exploration app built with Node.js, Express, and the TMDB API. Features a responsive design with glassmorphism effects, smooth animations, and a comprehensive movie database.

## ✨ Features

- 🎨 **Modern UI Design** - Glassmorphism effects, gradients, and smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🔍 **Advanced Search** - Search movies by title with real-time results
- 🏷️ **Genre Filtering** - Filter movies by genre categories
- ⭐ **Rating System** - View movie ratings and release years
- 🚀 **Fast Performance** - Optimized loading with lazy images and caching
- 🔒 **Production Ready** - Security headers, rate limiting, and error handling

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: TMDB (The Movie Database)
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- TMDB API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/movie-explorer.git
   cd movie-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo TMDB_API_KEY=your_api_key_here > .env
   echo PORT=3000 >> .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🌐 Deployment

### Option 1: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

4. **Set environment variables**
   ```bash
   heroku config:set TMDB_API_KEY=your_api_key_here
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 2: Deploy to Railway

1. **Connect your GitHub repository to Railway**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on push**

### Option 3: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

### Option 4: Deploy to DigitalOcean App Platform

1. **Connect your GitHub repository**
2. **Set environment variables**
3. **Deploy with one click**

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TMDB_API_KEY` | Your TMDB API key | Yes | - |
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |

## 📁 Project Structure

```
movie-explorer/
├── public/                 # Static files
│   ├── index.html         # Main HTML file
│   ├── style.css          # Styles
│   └── script.js          # Frontend JavaScript
├── index.js               # Express server
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## 🔒 Security Features

- **Rate Limiting** - Prevents API abuse
- **Security Headers** - XSS protection, content type options
- **CORS Configuration** - Configurable for production
- **Input Validation** - Sanitized API requests
- **Error Handling** - No sensitive data leakage

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `public/style.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #ffd700;
}
```

### Adding Features
- New API endpoints in `index.js`
- Frontend functionality in `public/script.js`
- Styling updates in `public/style.css`

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/genres` | GET | Get movie genres |
| `/api/movies` | GET | Get movies (with query/genre filters) |
| `/api/health` | GET | Health check |
| `/api/test` | GET | Test TMDB API connectivity |

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