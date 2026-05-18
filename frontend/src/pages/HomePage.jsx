import { useEffect, useMemo, useState } from "react";
import MovieCard from "../components/MovieCard";
import MovieModal, { getInitialMovieForm } from "../components/MovieModal";
import TopNav from "../components/TopNav";
import { resolveImageSource } from "../lib/images";

export default function HomePage({ api, user, onLogout }) {
  const [home, setHome] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieForm, setMovieForm] = useState(getInitialMovieForm());
  const [modalError, setModalError] = useState("");
  const [savingMovie, setSavingMovie] = useState(false);

  const wishlistIds = useMemo(
    () => new Set(home?.wishlist_movie_ids ?? user.wishlist_movie_ids ?? []),
    [home?.wishlist_movie_ids, user.wishlist_movie_ids],
  );

  async function loadData() {
    setLoading(true);
    setPageError("");

    try {
      const [homeData, allMovies] = await Promise.all([api.getHome(), api.getMovies()]);
      setHome(homeData);
      setMovies(allMovies);
    } catch (loadError) {
      setPageError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateModal() {
    if (!user.is_owner) {
      setPageError("Only the owner account can add or edit movies.");
      return;
    }

    setSelectedMovie(null);
    setMovieForm(getInitialMovieForm());
    setModalError("");
    setModalMode("create");
  }

  function openEditModal(movie) {
    if (!user.is_owner) {
      setPageError("Only the owner account can add or edit movies.");
      return;
    }

    setSelectedMovie(movie);
    setMovieForm(getInitialMovieForm(movie));
    setModalError("");
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedMovie(null);
    setMovieForm(getInitialMovieForm());
    setModalError("");
  }

  function handleMovieFormChange(event) {
    const { name, value, type, checked } = event.target;
    setMovieForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleToggleSection(section) {
    setMovieForm((current) => {
      const exists = current.sections.includes(section);
      return {
        ...current,
        sections: exists
          ? current.sections.filter((item) => item !== section)
          : [...current.sections, section],
      };
    });
  }

  async function handleMovieSubmit(event) {
    event.preventDefault();
    setSavingMovie(true);
    setModalError("");

    try {
      const payload = {
        ...movieForm,
        image: movieForm.image.trim(),
        sections: movieForm.sections.length ? movieForm.sections : ["my_movies"],
      };

      if (modalMode === "edit" && selectedMovie) {
        await api.updateMovie(selectedMovie.id, payload);
      } else {
        await api.createMovie(payload);
      }

      closeModal();
      await loadData();
    } catch (submitError) {
      setModalError(submitError.message);
    } finally {
      setSavingMovie(false);
    }
  }

  async function handleDelete(movie) {
    if (!user.is_owner) {
      setPageError("Only the owner account can delete movies.");
      return;
    }

    const confirmed = window.confirm(`Delete "${movie.title}" from the database?`);
    if (!confirmed) {
      return;
    }

    try {
      await api.deleteMovie(movie.id);
      await loadData();
    } catch (deleteError) {
      setPageError(deleteError.message);
    }
  }

  async function handleWishlistToggle(movie) {
    try {
      if (wishlistIds.has(movie.id)) {
        await api.removeFromWishlist(movie.id);
      } else {
        await api.addToWishlist(movie.id);
      }
      await loadData();
    } catch (wishlistError) {
      setPageError(wishlistError.message);
    }
  }

  async function handleRent(movie) {
    try {
      await api.addToCart(movie.id, 3);
      setPageError(`"${movie.title}" was added to your shopping cart.`);
    } catch (rentError) {
      setPageError(rentError.message);
    }
  }

  if (loading) {
    return <div className="status-screen">Loading CinemaFlix...</div>;
  }

  if (!home) {
    return <div className="status-screen">Unable to load the home page.</div>;
  }

  const featured = home.featured;

  return (
    <div className="app-shell">
      <TopNav user={user} onLogout={onLogout} />

      <header
        className="hero"
        style={{
          backgroundImage: featured
            ? `linear-gradient(90deg, rgba(7,7,10,0.92), rgba(7,7,10,0.45), rgba(7,7,10,0.88)), url('${resolveImageSource(featured.image)}')`
            : undefined,
        }}
      >
        <div className="hero__aurora hero__aurora--left" />
        <div className="hero__aurora hero__aurora--right" />
        <div className="hero__content">
          <h1>{featured?.title ?? "CinemaFlix"}</h1>
          <p>{featured?.description ?? "Your next cinematic obsession starts here."}</p>
          {featured ? (
            <div className="hero__price">Rent from ${featured.rental_price.toFixed(2)}</div>
          ) : null}
          <div className="hero__actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => featured && handleRent(featured)}
            >
              ▶ Rent Now
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => featured && handleWishlistToggle(featured)}
            >
              {featured && wishlistIds.has(featured.id) ? "♥ In Wish List" : "♡ Save"}
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        {pageError ? <p className="page-error">{pageError}</p> : null}

        <section className="content-section content-section--glass">
          <div className="section-heading">
            <h2>Daily Movies</h2>
            <span>{home.daily_movies.length} titles</span>
          </div>
          <div className="movie-grid movie-grid--swipe">
            {home.daily_movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                favorite={wishlistIds.has(movie.id)}
                onFavoriteToggle={handleWishlistToggle}
              />
            ))}
          </div>
        </section>

        <section className="content-section content-section--glass">
          <div className="section-heading">
            <h2>My Movies</h2>
            {user.is_owner ? (
              <button type="button" className="section-action" onClick={openCreateModal}>
                + Add Movie
              </button>
            ) : (
              <span>Only the owner can edit this library</span>
            )}
          </div>
          <div className="movie-grid movie-grid--swipe">
            {home.my_movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                favorite={wishlistIds.has(movie.id)}
                manageable={user.is_owner}
                onFavoriteToggle={handleWishlistToggle}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>

        <section className="content-section content-section--glass">
          <div className="section-heading">
            <h2>Trending Now</h2>
            <span>{home.trending_movies.length} titles</span>
          </div>
          <div className="movie-row">
            {home.trending_movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                compact
                favorite={wishlistIds.has(movie.id)}
                onFavoriteToggle={handleWishlistToggle}
              />
            ))}
          </div>
        </section>

        <section className="content-section content-section--library content-section--glass">
          <div className="section-heading">
            <h2>Movie Marketplace</h2>
            <span>{movies.length} total</span>
          </div>
          <div className="library-list">
            {movies.map((movie) => (
              <div key={movie.id} className="library-item">
                <div className="library-item__info">
                  <strong>{movie.title}</strong>
                  <span>
                    {movie.genre} · ${movie.rental_price.toFixed(2)} / day
                  </span>
                </div>
                <div className="library-item__actions">
                  {user.is_owner ? (
                    <button type="button" className="text-button" onClick={() => openEditModal(movie)}>
                      Edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => handleWishlistToggle(movie)}
                  >
                    {wishlistIds.has(movie.id) ? "Remove Wish" : "Add Wish"}
                  </button>
                  <button type="button" className="text-button" onClick={() => handleRent(movie)}>
                    Add To Cart
                  </button>
                  {user.is_owner ? (
                    <button
                      type="button"
                      className="text-button text-button--danger"
                      onClick={() => handleDelete(movie)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="brand brand--footer">CINEMAFLIX</div>
        <nav className="footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Help Center</span>
          <span>Cookie Preferences</span>
        </nav>
        <span className="footer-copy">© 2024 CinemaFlix Inc. All rights reserved.</span>
      </footer>

      {modalMode ? (
        <MovieModal
          mode={modalMode}
          value={movieForm}
          loading={savingMovie}
          error={modalError}
          onChange={handleMovieFormChange}
          onToggleSection={handleToggleSection}
          onSubmit={handleMovieSubmit}
          onClose={closeModal}
        />
      ) : null}
    </div>
  );
}
