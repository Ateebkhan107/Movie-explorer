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

// ✅ Uses your backend instead of TMDB directly
async function fetchGenres() {
  try {
    const res = await fetch('/api/genres');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    genres = data.genres || [];

    genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching genres:', error);
    // Add a fallback option
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Genres unavailable';
    genreSelect.appendChild(option);
  }
}

async function fetchMovies(query = '', genre = '') {
  showLoading();

  try {
    const res = await fetch(`/api/movies?query=${encodeURIComponent(query)}&genre=${genre}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    setTimeout(() => {
      displayMovies(data.results || []);
      hideLoading();
    }, 500);
  } catch (error) {
    console.error('Error fetching movies:', error);
    hideLoading();
    moviesContainer.innerHTML = '';
    resultsCount.textContent = 'Error loading movies. Please check your connection and try again.';
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
      <img src="${poster}" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450/667eea/ffffff?text=No+Image'">
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

    // Set initial animation state
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    moviesContainer.appendChild(card);
  });

  // Apply intersection observer to newly created cards
  setupCardAnimations();
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

// Setup intersection observer for card animations
function setupCardAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  const movieCards = document.querySelectorAll('.movie-card');
  movieCards.forEach(card => {
    observer.observe(card);
  });
}

init();
