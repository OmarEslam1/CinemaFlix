const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

function formatErrorDetail(detail) {
  if (!detail) {
    return "Something went wrong.";
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item?.msg && Array.isArray(item?.loc)) {
          return `${item.loc.slice(1).join(" -> ")}: ${item.msg}`;
        }

        if (item?.msg) {
          return item.msg;
        }

        return JSON.stringify(item);
      })
      .join(". ");
  }

  if (typeof detail === "object") {
    if (detail.message) {
      return detail.message;
    }

    return JSON.stringify(detail);
  }

  return String(detail);
}

async function request(path, options = {}) {
  const { headers: customHeaders, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(customHeaders ?? {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = formatErrorDetail(data?.detail);
    throw new Error(message);
  }

  return data;
}

export function createApiClient(token) {
  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  return {
    register(payload) {
      return request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    login(payload) {
      return request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    getMe() {
      return request("/auth/me", {
        headers: authHeaders,
      });
    },
    getHome() {
      return request("/home", {
        headers: authHeaders,
      });
    },
    getMovies() {
      return request("/movies", {
        headers: authHeaders,
      });
    },
    createMovie(payload) {
      return request("/movies", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
    },
    updateMovie(movieId, payload) {
      return request(`/movies/${movieId}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
    },
    deleteMovie(movieId) {
      return request(`/movies/${movieId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
    },
    getWishlist() {
      return request("/users/me/wishlist", {
        headers: authHeaders,
      });
    },
    addToWishlist(movieId) {
      return request(`/users/me/wishlist/${movieId}`, {
        method: "POST",
        headers: authHeaders,
      });
    },
    removeFromWishlist(movieId) {
      return request(`/users/me/wishlist/${movieId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
    },
    getCart() {
      return request("/users/me/cart", {
        headers: authHeaders,
      });
    },
    addToCart(movieId, days = 3) {
      return request(`/users/me/cart/${movieId}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ days }),
      });
    },
    updateCartItem(movieId, days) {
      return request(`/users/me/cart/${movieId}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ days }),
      });
    },
    removeFromCart(movieId) {
      return request(`/users/me/cart/${movieId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
    },
    checkoutCart() {
      return request("/users/me/cart-checkout", {
        method: "POST",
        headers: authHeaders,
      });
    },
    getRentals() {
      return request("/users/me/rentals", {
        headers: authHeaders,
      });
    },
  };
}
