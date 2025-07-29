<div align="center">

# 🎬 Movie Explorer

**A beautiful, modern movie exploration app with stunning UI and real-time search functionality**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20App-blue?style=for-the-badge&logo=github)](https://ateebkhan107.github.io/Movie-explorer/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Ateebkhan107/Movie-explorer)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://github.com/Ateebkhan107)

*Discover the latest and greatest films from around the world with our beautiful, responsive movie explorer*

</div>

---

## ✨ Live Demo

**🌐 [View Live App](https://ateebkhan107.github.io/Movie-explorer/)**

Experience the app in action with real-time movie search, filtering, and beautiful animations!

---

## 🎯 Features

### 🎨 **Modern Design**
- **Glassmorphism Effects** - Beautiful frosted glass UI elements
- **Gradient Backgrounds** - Stunning purple to blue gradients
- **Smooth Animations** - Hover effects, transitions, and loading animations
- **Responsive Layout** - Perfect on desktop, tablet, and mobile devices

### 🔍 **Smart Search & Filter**
- **Real-time Search** - Instant movie search as you type
- **Genre Filtering** - Filter movies by categories (Action, Drama, Comedy, etc.)
- **Advanced Results** - View ratings, release years, and movie details
- **Debounced Input** - Optimized performance with smart search timing

### ⚡ **Performance & UX**
- **Lazy Loading** - Images load as you scroll for better performance
- **Loading States** - Beautiful spinners and loading animations
- **Error Handling** - Graceful error messages and fallbacks
- **Fast API** - Direct integration with TMDB API for quick results

### 📱 **Cross-Platform**
- **Mobile-First Design** - Optimized for all screen sizes
- **Touch-Friendly** - Perfect for mobile and tablet interactions
- **Progressive Enhancement** - Works on all modern browsers

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Core web technologies |
| **Styling** | Custom CSS with Glassmorphism | Modern UI design |
| **API** | [TMDB (The Movie Database)](https://www.themoviedb.org/) | Movie data and images |
| **Icons** | [Font Awesome 6](https://fontawesome.com/) | Beautiful icons |
| **Fonts** | [Inter (Google Fonts)](https://fonts.google.com/specimen/Inter) | Modern typography |
| **Deployment** | GitHub Pages | Free hosting |

---

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API access
- No installation required! 🎉

### Option 1: Use Live Demo (Recommended)

Simply visit **[https://ateebkhan107.github.io/Movie-explorer/](https://ateebkhan107.github.io/Movie-explorer/)** to start exploring movies!

### Option 2: Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ateebkhan107/Movie-explorer.git
   cd Movie-explorer
   ```

2. **Open in your browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Then visit: http://localhost:8000
   ```

---

## 🎮 How to Use

### **Searching Movies**
1. Type any movie title in the search box
2. Results appear instantly as you type
3. Click on any movie card for more details

### **Filtering by Genre**
1. Use the genre dropdown to select a category
2. View movies filtered by your chosen genre
3. Combine search and genre filters for precise results

### **Exploring Features**
- **Hover Effects** - Cards lift and scale on hover
- **Loading Animations** - Beautiful spinners during data fetch
- **Responsive Design** - Works perfectly on all devices

---

## 📁 Project Structure

```
Movie-explorer/
├── 📄 index.html          # Main HTML file
├── 🎨 style.css           # Beautiful CSS styles
├── ⚡ script.js           # Interactive JavaScript
├── 📦 package.json        # Project configuration
├── 🚀 index.js           # Express server (for local development)
├── 📚 README.md          # This documentation
├── 🔒 .gitignore         # Git ignore rules
└── 📁 public/            # Static files (for server version)
    ├── index.html
    ├── style.css
    └── script.js
```

---

## 🎨 Customization

### **Changing Colors**
Edit the CSS variables in `style.css`:
```css
:root {
  --primary-color: #667eea;    /* Main gradient color */
  --secondary-color: #764ba2;  /* Secondary gradient color */
  --accent-color: #ffd700;     /* Gold accent color */
}
```

### **Adding Features**
- **New Search Options** - Modify `script.js` for additional filters
- **Custom Styling** - Update `style.css` for different themes
- **API Integration** - Add more movie data sources

---

## 🌐 Deployment Options

### **GitHub Pages** ✅ (Current)
- **URL**: https://ateebkhan107.github.io/Movie-explorer/
- **Status**: Live and working
- **Cost**: Free

### **Other Platforms**
- **Netlify** - Drag and drop deployment
- **Vercel** - One-click deployment
- **Firebase Hosting** - Google's hosting solution
- **Heroku** - For full-stack version

---

## 🔧 API Integration

This app uses the [TMDB API](https://www.themoviedb.org/documentation/api) for movie data:

- **Search Movies**: `/search/movie`
- **Get Genres**: `/genre/movie/list`
- **Popular Movies**: `/movie/popular`
- **Discover Movies**: `/discover/movie`

### **Getting Your Own API Key**
1. Visit [TMDB Settings](https://www.themoviedb.org/settings/api)
2. Sign up for a free account
3. Request an API key
4. Replace the API key in `script.js`

---

## 📊 Performance Features

- **Optimized Images** - TMDB provides multiple image sizes
- **Lazy Loading** - Images load only when needed
- **Debounced Search** - Reduces API calls during typing
- **Caching** - Browser caches static assets
- **Minimal Dependencies** - Fast loading with pure JavaScript

---

## 🎯 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 60+ | ✅ Full Support |
| Firefox | 55+ | ✅ Full Support |
| Safari | 12+ | ✅ Full Support |
| Edge | 79+ | ✅ Full Support |
| Mobile Browsers | Latest | ✅ Full Support |

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with a clear message**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### **Ideas for Contributions**
- 🎨 New themes and color schemes
- 🔍 Additional search filters
- 📱 Mobile app version
- 🌍 Multi-language support
- ⭐ User ratings and reviews

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[TMDB](https://www.themoviedb.org/)** - For providing the comprehensive movie database API
- **[Font Awesome](https://fontawesome.com/)** - For the beautiful icons that enhance the UI
- **[Google Fonts](https://fonts.google.com/)** - For the Inter font family
- **[GitHub Pages](https://pages.github.com/)** - For free hosting and deployment

---

## 📞 Support & Contact

- **GitHub Issues**: [Report a bug](https://github.com/Ateebkhan107/Movie-explorer/issues)
- **Live Demo**: [https://ateebkhan107.github.io/Movie-explorer/](https://ateebkhan107.github.io/Movie-explorer/)
- **Repository**: [https://github.com/Ateebkhan107/Movie-explorer](https://github.com/Ateebkhan107/Movie-explorer)

---

<div align="center">

**Made with ❤️ by [Ateeb Khan](https://github.com/Ateebkhan107)**

[![GitHub](https://img.shields.io/badge/GitHub-Ateebkhan107-black?style=for-the-badge&logo=github)](https://github.com/Ateebkhan107)

*If you like this project, please give it a ⭐ star on GitHub!*

</div> 