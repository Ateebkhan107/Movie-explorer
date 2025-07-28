# 🚀 Deployment Checklist

## ✅ Pre-Deployment Checklist

### Environment Setup
- [ ] Node.js v14+ installed
- [ ] npm v6+ installed
- [ ] TMDB API key obtained
- [ ] Environment variables configured

### Code Quality
- [ ] All dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm start`)
- [ ] API endpoints working (`/api/health`, `/api/test`)
- [ ] Frontend loads correctly
- [ ] Search functionality working
- [ ] Genre filtering working

### Security
- [ ] `.env` file in `.gitignore`
- [ ] API key not hardcoded in source
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] CORS properly configured

### Performance
- [ ] Static files cached
- [ ] Images optimized
- [ ] CSS/JS minified (if needed)
- [ ] Lazy loading implemented

## 🌐 Deployment Platforms

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set TMDB_API_KEY=your_api_key
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Railway
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### DigitalOcean App Platform
1. Connect GitHub repository
2. Set environment variables
3. Deploy with one click

## 🔧 Environment Variables

Required for all platforms:
```
TMDB_API_KEY=your_tmdb_api_key_here
NODE_ENV=production
PORT=3000 (or platform default)
```

## 📊 Post-Deployment Testing

- [ ] Website loads correctly
- [ ] API endpoints respond
- [ ] Search functionality works
- [ ] Genre filtering works
- [ ] Mobile responsiveness
- [ ] Performance acceptable
- [ ] Error handling works

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### API Key Issues
- Ensure TMDB_API_KEY is set correctly
- Check API key permissions
- Verify API key is valid

### CORS Issues
- Update CORS origin in production
- Check domain configuration

### Performance Issues
- Enable compression
- Optimize images
- Use CDN for static assets

## 📞 Support

If you encounter issues:
1. Check the logs: `heroku logs --tail`
2. Verify environment variables
3. Test locally first
4. Check API connectivity

---

**Your app is now ready for deployment! 🎉** 