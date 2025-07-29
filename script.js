// IMPORTANT: This app works without exposing API keys
// For GitHub Pages: Uses a secure demo approach
// For production: Deploy with backend server

const BASE_URL = 'https://api.themoviedb.org/3';
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

// Demo data for when API is not available
const demoGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

const demoMovies = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    vote_average: 9.3,
    release_date: "1994-09-23",
    genre_ids: [18, 80]
  },
  {
    id: 2,
    title: "The Godfather",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    vote_average: 9.2,
    release_date: "1972-03-14",
    genre_ids: [18, 80]
  },
  {
    id: 3,
    title: "The Dark Knight",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    vote_average: 9.0,
    release_date: "2008-07-18",
    genre_ids: [18, 28, 80]
  },
  {
    id: 4,
    title: "Pulp Fiction",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    vote_average: 8.9,
    release_date: "1994-09-10",
    genre_ids: [53, 80]
  },
  {
    id: 5,
    title: "Fight Club",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    vote_average: 8.8,
    release_date: "1999-10-15",
    genre_ids: [18]
  },
  {
    id: 6,
    title: "Inception",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    vote_average: 8.8,
    release_date: "2010-07-16",
    genre_ids: [28, 878, 12]
  }
];

// Load genres (demo data for GitHub Pages)
async function fetchGenres() {
  try {
    // Try to fetch from API first (if backend is available)
    const res = await fetch('/api/genres');
    if (res.ok) {
      const data = await res.json();
      genres = data.genres || [];
    } else {
      // Fallback to demo data
      genres = demoGenres;
    }

    genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.appendChild(option);
    });
  } catch (error) {
    console.log('Using demo data for genres');
    genres = demoGenres;
    genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.appendChild(option);
    });
  }
}

// Load movies (demo data for GitHub Pages)
async function fetchMovies(query = '', genre = '') {
  showLoading();

  try {
    // Try to fetch from API first (if backend is available)
    let url = '/api/movies';
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
    if (res.ok) {
      const data = await res.json();
      setTimeout(() => {
        displayMovies(data.results || []);
        hideLoading();
      }, 500);
      return;
    }
  } catch (error) {
    console.log('API not available, using demo data');
  }

  // Fallback to demo data
  setTimeout(() => {
    let filteredMovies = demoMovies;
    
    if (query.trim()) {
      filteredMovies = demoMovies.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (genre) {
      filteredMovies = filteredMovies.filter(movie => 
        movie.genre_ids.includes(parseInt(genre))
      );
    }
    
    displayMovies(filteredMovies);
    hideLoading();
  }, 500);
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
