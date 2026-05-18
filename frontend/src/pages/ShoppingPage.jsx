import { useEffect, useMemo, useState } from "react";
import TopNav from "../components/TopNav";
import ImageWithFallback from "../components/ImageWithFallback";

export default function ShoppingPage({ api, user, onLogout }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price, 0).toFixed(2),
    [cart],
  );

  async function loadCart() {
    setLoading(true);
    setError("");

    try {
      const data = await api.getCart();
      setCart(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleDaysChange(movieId, days) {
    try {
      const data = await api.updateCartItem(movieId, Number(days));
      setCart(data);
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function handleRemove(movieId) {
    try {
      const data = await api.removeFromCart(movieId);
      setCart(data);
    } catch (removeError) {
      setError(removeError.message);
    }
  }

  async function handleCheckout() {
    setCheckingOut(true);
    setError("");

    try {
      await api.checkoutCart();
      await loadCart();
    } catch (checkoutError) {
      setError(checkoutError.message);
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="app-shell">
      <TopNav user={user} onLogout={onLogout} />

      <main className="commerce-page">
        <section className="commerce-header">
          <div>
            <p className="eyebrow">Shopping Cart</p>
            <h1>Choose your rental plan</h1>
            <p>
              Adjust rental days, review pricing, and complete checkout when your
              movie queue looks right.
            </p>
          </div>
          <div className="commerce-summary">
            <span>Total</span>
            <strong>${total}</strong>
          </div>
        </section>

        {loading ? <div className="status-screen">Loading your cart...</div> : null}
        {error ? <p className="page-error">{error}</p> : null}

        {!loading && cart.length === 0 ? (
          <div className="empty-state">
            <h2>Your shopping cart is empty</h2>
            <p>Add movies from the home page to start renting.</p>
          </div>
        ) : null}

        <div className="commerce-list">
          {cart.map((item) => (
            <article key={item.movie.id} className="commerce-card">
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
                <label className="commerce-card__control">
                  <span>Rental days</span>
                  <select
                    value={item.days}
                    onChange={(event) => handleDaysChange(item.movie.id, event.target.value)}
                  >
                    {[1, 2, 3, 5, 7, 14, 30].map((days) => (
                      <option key={days} value={days}>
                        {days} days
                      </option>
                    ))}
                  </select>
                </label>
                <div className="commerce-card__footer">
                  <strong>${item.price.toFixed(2)}</strong>
                  <button
                    type="button"
                    className="text-button text-button--danger"
                    onClick={() => handleRemove(item.movie.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {cart.length ? (
          <div className="checkout-bar">
            <div>
              <span>{cart.length} items</span>
              <strong>${total}</strong>
            </div>
            <button
              type="button"
              className="primary-button"
              disabled={checkingOut}
              onClick={handleCheckout}
            >
              {checkingOut ? "Processing..." : "Checkout Rentals"}
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
