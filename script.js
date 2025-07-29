// IMPORTANT: Replace this with your own TMDB API key
// Get your free API key from: https://www.themoviedb.org/settings/api
const API_KEY = 'YOUR_TMDB_API_KEY_HERE'; // Replace with your actual API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const searchInput = document.getElementById('search');
const genreSelect = document.getElementById('genreSelect');
const moviesContainer = document.getElementById('movies');
const resultsCount = document.getElementById('resultsCount');
const loadingSpinner = document.getElementById('loadingSpinner');

let genres = [];

// Check if API key is configured
if (API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
  moviesContainer.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: white;">
      <h3>⚠️ API Key Required</h3>
      <p>Please configure your TMDB API key in script.js</p>
      <p>Get your free API key from: <a href="https://www.themoviedb.org/settings/api" target="_blank" style="color: #ffd700;">TMDB API Settings</a></p>
    </div>
  `;
  resultsCount.textContent = 'API Key not configured';
  throw new Error('TMDB API key not configured');
}

function showLoading() {
  loadingSpinner.classList.add('show');
  moviesContainer.style.opacity = '0.5';
}

function hideLoading() {
  loadingSpinner.classList.remove('show');
  moviesContainer.style.opacity = '1';
}

// Fetch genres directly from TMDB API
async function fetchGenres() {
  try {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
    const data = await res.json();
    genres = data.genres;

    genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
}

// Fetch movies directly from TMDB API
async function fetchMovies(query = '', genre = '') {
  showLoading();

  try {
    let url;
    let params = new URLSearchParams({
      api_key: API_KEY,
      language: 'en-US',
      page: 1,
      include_adult: false
    });

    if (query.trim()) {
      url = `${BASE_URL}/search/movie?${params}&query=${encodeURIComponent(query)}`;
    } else if (genre) {
      url = `${BASE_URL}/discover/movie?${params}&with_genres=${genre}&sort_by=popularity.desc`;
    } else {
      url = `${BASE_URL}/movie/popular?${params}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    setTimeout(() => {
      displayMovies(data.results);
      hideLoading();
    }, 500);
  } catch (error) {
    console.error('Error fetching movies:', error);
    hideLoading();
    resultsCount.textContent = 'Error loading movies. Please try again.';
  }
}

function displayMovies(movies) {
  moviesContainer.innerHTML = '';

  if (movies.length === 0) {
    resultsCount.textContent = 'No movies found. Try a different search.';
    return;
  }

  resultsCount.textContent = `Found ${movies.length} amazing movies`;

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const movieGenres = movie.genre_ids ?
      movie.genre_ids.slice(0, 2).map(id =>
        genres.find(g => g.id === id)?.name
      ).filter(Boolean) : [];

    const year = movie.release_date ?
      new Date(movie.release_date).getFullYear() : 'N/A';

    const rating = movie.vote_average ?
      movie.vote_average.toFixed(1) : 'N/A';

    const poster = movie.poster_path ?
      IMG_BASE + movie.poster_path :
      'https://via.placeholder.com/300x450/667eea/ffffff?text=No+Image';

    card.innerHTML = `
      <img src="${poster}" alt="${movie.title}" loading="lazy">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <div class="movie-meta">
          <div class="rating">
            <i class="fas fa-star"></i>
            <span>${rating}</span>
          </div>
          <div class="year">${year}</div>
        </div>
        ${movieGenres.length > 0 ? `
          <div class="genre-tags">
            ${movieGenres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    card.addEventListener('click', () => {
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        card.style.transform = '';
      }, 150);
    });

    moviesContainer.appendChild(card);
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

searchInput.addEventListener('input', debounce(() => {
  fetchMovies(searchInput.value, genreSelect.value);
}, 300));

genreSelect.addEventListener('change', () => {
  fetchMovies(searchInput.value, genreSelect.value);
});

async function init() {
  await fetchGenres();
  await fetchMovies();
}

document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  });

  const movieCards = document.querySelectorAll('.movie-card');
  movieCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
});

init();
