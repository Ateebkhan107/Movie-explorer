import { Genre, Movie, MovieDetails } from '@/types';

export const FALLBACK_GENRES: Genre[] = [
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
  { id: 37, name: 'Western' },
];

export const FALLBACK_MOVIES: Movie[] = [
  {
    id: 550,
    title: 'Fight Club',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    vote_average: 8.4,
    release_date: '1999-10-15',
    genre_ids: [18],
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
  },
  {
    id: 27205,
    title: 'Inception',
    poster_path: '/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
    vote_average: 8.4,
    release_date: '2010-07-15',
    genre_ids: [28, 878, 12],
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.',
  },
  {
    id: 155,
    title: 'The Dark Knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    vote_average: 8.5,
    release_date: '2008-07-16',
    genre_ids: [18, 28, 80, 53],
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.',
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    poster_path: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    vote_average: 8.7,
    release_date: '1994-09-23',
    genre_ids: [18, 80],
    overview: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.',
  },
  {
    id: 238,
    title: 'The Godfather',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    vote_average: 8.7,
    release_date: '1972-03-14',
    genre_ids: [18, 80],
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    vote_average: 8.5,
    release_date: '1994-09-10',
    genre_ids: [53, 80],
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in four tales of violence and redemption.",
  },
  {
    id: 157336,
    title: 'Interstellar',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    vote_average: 8.4,
    release_date: '2014-11-05',
    genre_ids: [12, 18, 878],
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
  },
  {
    id: 120,
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    poster_path: '/6oom5QYQ2yQTMJIbnvbkBL9cDK6.jpg',
    vote_average: 8.4,
    release_date: '2001-12-18',
    genre_ids: [12, 14, 28],
    overview: 'Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home behind in order to destroy it.',
  },
];

export const FALLBACK_DETAILS: Record<number, MovieDetails> = {
  550: {
    ...FALLBACK_MOVIES[0],
    runtime: 139,
    genres: [{ id: 18, name: 'Drama' }],
    credits: {
      cast: [
        { id: 819, name: 'Edward Norton', character: 'The Narrator', profile_path: '/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg' },
        { id: 287, name: 'Brad Pitt', character: 'Tyler Durden', profile_path: '/cckcYc2v0yh1tc9QjRelptsqqoW.jpg' },
        { id: 1283, name: 'Helena Bonham Carter', character: 'Marla Singer', profile_path: '/DDeitjyWhql346ZpFSSSzStDCQ.jpg' },
      ],
    },
    videos: {
      results: [
        { id: '1', key: 'O1nDozs-96U', name: 'Trailer', site: 'YouTube', type: 'Trailer' },
      ],
    },
  },
  27205: {
    ...FALLBACK_MOVIES[1],
    runtime: 148,
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    credits: {
      cast: [
        { id: 6193, name: 'Leonardo DiCaprio', character: 'Dom Cobb', profile_path: '/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
        { id: 24045, name: 'Joseph Gordon-Levitt', character: 'Arthur', profile_path: '/dhv9f3bY0FqV9Hk4b08n0k3qK.jpg' },
        { id: 27578, name: 'Elliot Page', character: 'Ariadne', profile_path: '/tp157fRSHBqaEev46yOlyXF2j4G.jpg' },
      ],
    },
    videos: {
      results: [
        { id: '2', key: 'YoHD9XEInc0', name: 'Trailer', site: 'YouTube', type: 'Trailer' },
      ],
    },
  },
  155: {
    ...FALLBACK_MOVIES[2],
    runtime: 152,
    genres: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Action' }, { id: 80, name: 'Crime' }, { id: 53, name: 'Thriller' }],
    credits: {
      cast: [
        { id: 3894, name: 'Christian Bale', character: 'Bruce Wayne / Batman', profile_path: '/qCpZn2e3AcAzjq3GbKV86PO99Nm.jpg' },
        { id: 1810, name: 'Heath Ledger', character: 'Joker', profile_path: '/5Y9HnYYa9jF4D02TeIPX1wogSH8.jpg' },
        { id: 64, name: 'Gary Oldman', character: 'James Gordon', profile_path: '/2v9Fs9fJa6FStuhpsL27GQ9Gmm8.jpg' },
      ],
    },
    videos: {
      results: [
        { id: '3', key: 'EXeTwQWrcwY', name: 'Trailer', site: 'YouTube', type: 'Trailer' },
      ],
    },
  },
};
