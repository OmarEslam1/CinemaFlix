import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import TopNav from "../components/TopNav";

export default function MyListPage({ api, user, onLogout }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWishlist() {
    setLoading(true);
    setError("");

    try {
      const data = await api.getWishlist();
      setWishlist(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  async function handleRemoveWishlist(movie) {
    try {
      await api.removeFromWishlist(movie.id);
      await loadWishlist();
    } catch (removeError) {
      setError(removeError.message);
    }
  }

  return (
    <div className="app-shell">
      <TopNav user={user} onLogout={onLogout} />

      <main className="favorites-page">
        <section className="favorites-hero favorites-hero--cinematic">
          <div className="favorites-hero__content">
            <p className="eyebrow">Wish List</p>
            <h1>Your saved movies</h1>
            <p>
              Keep track of what you want to watch next, then move titles to your
              shopping cart whenever you are ready to rent them.
            </p>
          </div>
          <div className="favorites-hero__panel">
            <span>{wishlist.length}</span>
            <small>wishlist items</small>
          </div>
        </section>

        {loading ? <div className="status-screen">Loading your wish list...</div> : null}
        {error ? <p className="page-error">{error}</p> : null}

        {!loading && wishlist.length === 0 ? (
          <div className="empty-state">
            <h2>Your wish list is empty</h2>
            <p>
              Go back to the home page and use the heart button to save movies here.
            </p>
          </div>
        ) : null}

        <div className="favorites-grid">
          {wishlist.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              favorite
              className="favorites-grid__card"
              onFavoriteToggle={handleRemoveWishlist}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
