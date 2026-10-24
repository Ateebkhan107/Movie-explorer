import { TriviaQuestion, TriviaClueType } from '@/types/trivia';
import { Movie } from '@/types';

export const STATIC_TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 't-1',
    movieId: 155,
    title: 'The Dark Knight',
    posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    releaseYear: '2008',
    genres: ['Action', 'Crime', 'Drama'],
    clueType: 'tagline',
    clueText: '"Why so serious?"',
    castClues: ['Christian Bale as Bruce Wayne', 'Heath Ledger as Joker', 'Gary Oldman as Gordon'],
    options: ['The Dark Knight', 'Batman Begins', 'The Batman', 'Joker'],
    correctAnswer: 'The Dark Knight',
    funFact: 'Heath Ledger posthumously won the Academy Award for Best Supporting Actor for his unforgettable portrayal of the Joker.',
  },
  {
    id: 't-2',
    movieId: 27205,
    title: 'Inception',
    posterPath: '/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
    releaseYear: '2010',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    clueType: 'plot',
    clueText: 'A skilled thief steals corporate secrets through dream-sharing technology and is given the impossible task of planting an idea into a CEO\'s mind.',
    castClues: ['Leonardo DiCaprio as Cobb', 'Joseph Gordon-Levitt as Arthur', 'Elliot Page as Ariadne'],
    options: ['Inception', 'Shutter Island', 'Tenet', 'Interstellar'],
    correctAnswer: 'Inception',
    funFact: 'The iconic spinning top at the end was actually an idea of Christopher Nolan to keep the audience debating reality versus illusion.',
  },
  {
    id: 't-3',
    movieId: 550,
    title: 'Fight Club',
    posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    releaseYear: '1999',
    genres: ['Drama', 'Thriller'],
    clueType: 'blurry_poster',
    clueText: '"The first rule of Fight Club is: you do not talk about Fight Club."',
    castClues: ['Edward Norton as Narrator', 'Brad Pitt as Tyler Durden', 'Helena Bonham Carter as Marla'],
    options: ['Fight Club', 'American Psycho', 'Seven', 'Memento'],
    correctAnswer: 'Fight Club',
    funFact: 'Brad Pitt and Edward Norton actually took soap-making and boxing lessons in preparation for their roles.',
  },
  {
    id: 't-4',
    movieId: 157336,
    title: 'Interstellar',
    posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    releaseYear: '2014',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    clueType: 'cast',
    clueText: 'Which film features this star-studded crew embarking on a journey through a wormhole near Saturn?',
    castClues: ['Matthew McConaughey as Cooper', 'Anne Hathaway as Brand', 'Jessica Chastain as Murph'],
    options: ['Interstellar', 'The Martian', 'Gravity', 'Ad Astra'],
    correctAnswer: 'Interstellar',
    funFact: 'Astrophysicist Kip Thorne served as scientific advisor; their calculations of a black hole were so accurate they led to published scientific papers.',
  },
  {
    id: 't-5',
    movieId: 278,
    title: 'The Shawshank Redemption',
    posterPath: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    releaseYear: '1994',
    genres: ['Drama', 'Crime'],
    clueType: 'tagline',
    clueText: '"Fear can hold you prisoner. Hope can set you free."',
    castClues: ['Tim Robbins as Andy Dufresne', 'Morgan Freeman as Red', 'Bob Gunton as Warden Norton'],
    options: ['The Shawshank Redemption', 'The Green Mile', 'Escape from Alcatraz', 'Papillon'],
    correctAnswer: 'The Shawshank Redemption',
    funFact: 'Ranked #1 on IMDb\'s Top 250 Movies of all time for over 15 consecutive years.',
  },
  {
    id: 't-6',
    movieId: 680,
    title: 'Pulp Fiction',
    posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    releaseYear: '1994',
    genres: ['Thriller', 'Crime'],
    clueType: 'blurry_poster',
    clueText: '"Say \'what\' again. Say \'what\' again, I dare you, I double dare you motherf***er, say what one more time!"',
    castClues: ['John Travolta as Vincent Vega', 'Samuel L. Jackson as Jules', 'Uma Thurman as Mia Wallace'],
    options: ['Pulp Fiction', 'Reservoir Dogs', 'GoodFellas', 'Kill Bill: Vol. 1'],
    correctAnswer: 'Pulp Fiction',
    funFact: 'The mystery briefcase contents glow orange thanks to a small hidden lightbulb, but Tarantino intentionally never revealed what was inside.',
  },
  {
    id: 't-7',
    movieId: 238,
    title: 'The Godfather',
    posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    releaseYear: '1972',
    genres: ['Drama', 'Crime'],
    clueType: 'tagline',
    clueText: '"I\'m gonna make him an offer he can\'t refuse."',
    castClues: ['Marlon Brando as Vito Corleone', 'Al Pacino as Michael Corleone', 'James Caan as Sonny'],
    options: ['The Godfather', 'Scarface', 'GoodFellas', 'Casino'],
    correctAnswer: 'The Godfather',
    funFact: 'Marlon Brando stuffed his cheeks with cotton during auditions to give Don Corleone his distinctive bulldog jaw look.',
  },
  {
    id: 't-8',
    movieId: 603,
    title: 'The Matrix',
    posterPath: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    releaseYear: '1999',
    genres: ['Action', 'Sci-Fi'],
    clueType: 'plot',
    clueText: 'A cyber hacker discovers from mysterious rebels the truth about his reality and his role in the war against its controllers.',
    castClues: ['Keanu Reeves as Neo', 'Laurence Fishburne as Morpheus', 'Carrie-Anne Moss as Trinity'],
    options: ['The Matrix', 'Blade Runner', 'Tron', 'Minority Report'],
    correctAnswer: 'The Matrix',
    funFact: 'The iconic green code raining down in the opening consists of reversed Japanese katakana characters copied from sushi cookbook recipes.',
  },
  {
    id: 't-9',
    movieId: 597,
    title: 'Titanic',
    posterPath: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    releaseYear: '1997',
    genres: ['Drama', 'Romance'],
    clueType: 'tagline',
    clueText: '"Nothing on Earth could come between them."',
    castClues: ['Leonardo DiCaprio as Jack Dawson', 'Kate Winslet as Rose DeWitt Bukater', 'Billy Zane as Cal'],
    options: ['Titanic', 'The Great Gatsby', 'Romeo + Juliet', 'Pearl Harbor'],
    correctAnswer: 'Titanic',
    funFact: 'James Cameron spent more time with the real sunken Titanic than the passengers who sailed on it in 1912.',
  },
  {
    id: 't-10',
    movieId: 120,
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    posterPath: '/6oom5QYQ2yQTMJIbnvbkBL9cDK6.jpg',
    releaseYear: '2001',
    genres: ['Adventure', 'Fantasy', 'Action'],
    clueType: 'blurry_poster',
    clueText: '"One ring to rule them all, one ring to find them, one ring to bring them all, and in the darkness bind them."',
    castClues: ['Elijah Wood as Frodo', 'Ian McKellen as Gandalf', 'Viggo Mortensen as Aragorn'],
    options: ['The Lord of the Rings: The Fellowship of the Ring', 'The Hobbit: An Unexpected Journey', 'Harry Potter and the Sorcerer\'s Stone', 'The Chronicles of Narnia'],
    correctAnswer: 'The Lord of the Rings: The Fellowship of the Ring',
    funFact: 'All nine members of the Fellowship got matching tattoos in Elvish script of the number "nine" after filming completed.',
  },
  {
    id: 't-11',
    movieId: 329,
    title: 'Jurassic Park',
    posterPath: '/b1x09rS5Da8A9hUHvXd2FniUtW1.jpg',
    releaseYear: '1993',
    genres: ['Adventure', 'Sci-Fi'],
    clueType: 'plot',
    clueText: 'A wealthy entrepreneur secretly creates a theme park featuring living cloned prehistoric creatures, leading to chaos during a security breakdown.',
    castClues: ['Sam Neill as Dr. Alan Grant', 'Laura Dern as Dr. Ellie Sattler', 'Jeff Goldblum as Ian Malcolm'],
    options: ['Jurassic Park', 'King Kong', 'Godzilla', 'The Lost World'],
    correctAnswer: 'Jurassic Park',
    funFact: 'The sound of the menacing T-Rex roar was made by combining the sounds of a baby elephant, an alligator, and a tiger.',
  },
  {
    id: 't-12',
    movieId: 105,
    title: 'Back to the Future',
    posterPath: '/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg',
    releaseYear: '1985',
    genres: ['Adventure', 'Comedy', 'Sci-Fi'],
    clueType: 'tagline',
    clueText: '"He\'s the only kid ever to get into trouble before he was even born."',
    castClues: ['Michael J. Fox as Marty McFly', 'Christopher Lloyd as Doc Brown', 'Lea Thompson as Lorraine'],
    options: ['Back to the Future', 'Bill & Ted\'s Excellent Adventure', 'Ghostbusters', 'The Terminator'],
    correctAnswer: 'Back to the Future',
    funFact: 'The original script had the time machine built inside a refrigerator rather than a DeLorean sports car!',
  },
  {
    id: 't-13',
    movieId: 299536,
    title: 'Avengers: Infinity War',
    posterPath: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    releaseYear: '2018',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    clueType: 'plot',
    clueText: 'The Earth\'s mightiest heroes and their allies must sacrifice all in an attempt to defeat the powerful warlord Thanos before his blitz of devastation wipes out half of all life.',
    castClues: ['Robert Downey Jr. as Iron Man', 'Chris Hemsworth as Thor', 'Josh Brolin as Thanos'],
    options: ['Avengers: Infinity War', 'Avengers: Endgame', 'Captain America: Civil War', 'Guardians of the Galaxy'],
    correctAnswer: 'Avengers: Infinity War',
    funFact: 'Josh Brolin played both Thanos in Infinity War and Cable in Deadpool 2, which were released in theaters within a month of each other.',
  },
  {
    id: 't-14',
    movieId: 496243,
    title: 'Parasite',
    posterPath: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    releaseYear: '2019',
    genres: ['Comedy', 'Thriller', 'Drama'],
    clueType: 'blurry_poster',
    clueText: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    castClues: ['Song Kang-ho as Kim Ki-taek', 'Lee Sun-kyun as Park Dong-ik', 'Cho Yeo-jeong as Yeon-gyo'],
    options: ['Parasite', 'Oldboy', 'The Handmaiden', 'Memories of Murder'],
    correctAnswer: 'Parasite',
    funFact: 'First non-English language film in history to win the Academy Award for Best Picture.',
  },
  {
    id: 't-15',
    movieId: 98,
    title: 'Gladiator',
    posterPath: '/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
    releaseYear: '2000',
    genres: ['Action', 'Drama', 'Adventure'],
    clueType: 'tagline',
    clueText: '"What we do in life echoes in eternity."',
    castClues: ['Russell Crowe as Maximus', 'Joaquin Phoenix as Commodus', 'Connie Nielsen as Lucilla'],
    options: ['Gladiator', 'Spartacus', 'Troy', '300'],
    correctAnswer: 'Gladiator',
    funFact: 'Russell Crowe did not like the famous line "And I will have my vengeance, in this life or the next" during rehearsals, but Ridley Scott insisted it stayed.',
  },
];

/**
 * Shuffles an array randomly using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Creates dynamic trivia questions from a list of TMDB movies
 */
export function createQuestionsFromMovies(movies: Movie[], count = 10): TriviaQuestion[] {
  if (movies.length < 4) {
    return shuffleArray(STATIC_TRIVIA_QUESTIONS).slice(0, count);
  }

  const validMovies = movies.filter(m => m.poster_path && m.title && m.overview);
  const shuffled = shuffleArray(validMovies);
  const questions: TriviaQuestion[] = [];
  const clueTypes: TriviaClueType[] = ['blurry_poster', 'plot', 'tagline'];

  for (let i = 0; i < Math.min(shuffled.length, count); i++) {
    const movie = shuffled[i];
    const otherMovies = shuffled.filter(m => m.id !== movie.id);
    const distractors = shuffleArray(otherMovies).slice(0, 3).map(m => m.title);
    const options = shuffleArray([movie.title, ...distractors]);

    const clueType = clueTypes[i % clueTypes.length];
    let clueText = '';

    if (clueType === 'blurry_poster') {
      clueText = `Released in ${movie.release_date?.substring(0, 4) || 'recent years'}. Guess the movie from the unblurring poster!`;
    } else {
      // Redact movie title from overview so it doesn't give away the answer
      const titleRegex = new RegExp(movie.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      clueText = movie.overview.replace(titleRegex, '[REDACTED]');
    }

    questions.push({
      id: `dyn-${movie.id}-${i}`,
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path || '',
      releaseYear: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
      genres: [],
      clueType,
      clueText,
      options,
      correctAnswer: movie.title,
      funFact: `Rated ${movie.vote_average ? movie.vote_average.toFixed(1) : '8.0'}/10 by audience members worldwide.`,
    });
  }

  return questions;
}

export function calculateRank(score: number, totalQuestions: number): string {
  const percentage = (score / (totalQuestions * 1000)) * 100;
  if (percentage >= 90) return '🏆 Oscar Legend';
  if (percentage >= 75) return '🎬 Master Cinephile';
  if (percentage >= 55) return '🍿 Dedicated Film Buff';
  if (percentage >= 35) return '🎟️ Movie Enthusiast';
  return '🌱 Popcorn Rookie';
}
