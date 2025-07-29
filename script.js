// IMPORTANT: This app uses a secure backend proxy to hide API keys
// The API key is stored securely on the server, not in the frontend code

const BASE_URL = '/api'; // Use our backend proxy instead of direct TMDB API
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const searchInput = document.getElementById('search');
const genreSelect = document.getElementById('genreSelect');
const moviesContainer = document.getElementById('movies');
const resultsCount = document.getElementById('resultsCount');
const loadingSpinner = document.getElementById('loadingSpinner');

let genres = [];

function showLoading() {
  loadingSpinner.classList.add('show');
  moviesContainer.style.opacity = '0.5';
}

function hideLoading() {
  loadingSpinner.classList.remove('show');
  moviesContainer.style.opacity = '1';
}

// Fetch genres through our secure backend
async function fetchGenres() {
  try {
    const res = await fetch(`${BASE_URL}/genres`);
    if (!res.ok) {
      throw new Error('Failed to fetch genres');
    }
    const data = await res.json();
    genres = data.genres || [];

    genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching genres:', error);
    // Show fallback message
    resultsCount.textContent = 'Unable to load genres. Please try again later.';
  }
}

// Fetch movies through our secure backend
async function fetchMovies(query = '', genre = '') {
  showLoading();

  try {
    let url = `${BASE_URL}/movies`;
    const params = new URLSearchParams();
    
    if (query.trim()) {
      params.append('query', query);
    }
    if (genre) {
      params.append('genre', genre);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch movies');
    }
    
    const data = await res.json();

    setTimeout(() => {
      displayMovies(data.results || []);
      hideLoading();
    }, 500);
  } catch (error) {
    console.error('Error fetching movies:', error);
    hideLoading();
    resultsCount.textContent = 'Error loading movies. Please try again.';
    
    // Show helpful error message
    moviesContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: white;">
        <h3>⚠️ Connection Error</h3>
        <p>Unable to connect to the movie database.</p>
        <p>This might be due to:</p>
        <ul style="text-align: left; max-width: 400px; margin: 1rem auto;">
          <li>Network connectivity issues</li>
          <li>API service temporarily unavailable</li>
          <li>Server configuration</li>
        </ul>
        <p>Please try again later or check your internet connection.</p>
      </div>
    `;
  }
}

function displayMovies(movies) {
  moviesContainer.innerHTML = '';

  if (!movies || movies.length === 0) {
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
