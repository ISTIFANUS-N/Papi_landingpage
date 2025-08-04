import './index.css'
import Search from './components/Search'
import Spinner from './components/Spinner'
import { updatesearchCount } from './appwrite'
import { useDebounce } from 'react-use'
import MovieCard from './components/MovieCard'
import React, { useEffect, useState } from 'react'

const API_BASE_URL = 'https://api.themoviedb.org/3'

const API_KEY = import.meta.env.VITE_TMDB_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce the search term to avoid too many API calls
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  // Fetch movies based on the search term or fetch popular movies if no search term is provided
  const fetchMovies = async (query = "") => {
    setisLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&sort_by=popularity.desc`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      const data = await response.json();
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      if (data.results && data.results.length === 0) {
        setErrorMessage("No movies found.");
        setMoviesList([]);
        return;
      }
      setMoviesList(data.results || []);
      setErrorMessage("");

      // Update search count in Appwrite (if needed)
      if (query && data.results.length > 0) {
        const movie = data.results[0]; // Assuming you want to update the count for the first movie in the results
        await updatesearchCount(query, movie);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Failed to fetch movies. Please try again later.");
      setMoviesList([]);
    } finally {
      setisLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img className="w-28" src="logo.png" alt="Logo" />
            <img src='hero.png' alt="Hero" className="hero-image" />
            <h1 className="text-3xl">
              Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>
          <section className="all-movies">
            <h2 className="mt-[20px]">All Movies</h2>
            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="error-message">{errorMessage}</p>
            ) : (
              <ul>
                {moviesList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default App