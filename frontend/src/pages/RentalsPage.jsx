import { useEffect, useState } from "react";
import ImageWithFallback from "../components/ImageWithFallback";
import TopNav from "../components/TopNav";

export default function RentalsPage({ api, user, onLogout }) {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRentals() {
    setLoading(true);
    setError("");

    try {
      const data = await api.getRentals();
      setRentals(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRentals();
  }, []);

  return (
    <div className="app-shell">
      <TopNav user={user} onLogout={onLogout} />

      <main className="commerce-page">
        <section className="commerce-header">
          <div>
            <p className="eyebrow">Rentals</p>
            <h1>Your active movie rentals</h1>
            <p>
              Review the titles you have already checked out and keep track of when
              each rental expires.
            </p>
          </div>
          <div className="commerce-summary">
            <span>Active rentals</span>
            <strong>{rentals.length}</strong>
          </div>
        </section>

        {loading ? <div className="status-screen">Loading your rentals...</div> : null}
        {error ? <p className="page-error">{error}</p> : null}

        {!loading && rentals.length === 0 ? (
          <div className="empty-state">
            <h2>No rentals yet</h2>
            <p>Complete checkout from the shopping page to see rented titles here.</p>
          </div>
        ) : null}

        <div className="commerce-list">
          {rentals.map((item) => (
            <article key={`${item.movie.id}-${item.rented_at}`} className="commerce-card">
              <ImageWithFallback
                src={item.movie.image}
                alt={item.movie.title}
                className="commerce-card__image"
              />
              <div className="commerce-card__body">
                <div>
                  <h3>{item.movie.title}</h3>
                  <p>{item.movie.genre}</p>
                </div>
                <div className="rental-meta">
                  <span>Days: {item.days}</span>
                  <span>Rented: {new Date(item.rented_at).toLocaleDateString()}</span>
                  <span>Expires: {new Date(item.expires_at).toLocaleDateString()}</span>
                </div>
                <div className="commerce-card__footer">
                  <strong>${item.price.toFixed(2)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
