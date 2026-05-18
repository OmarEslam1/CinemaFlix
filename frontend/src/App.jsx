import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { createApiClient } from "./lib/api";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import MyListPage from "./pages/MyListPage";
import RentalsPage from "./pages/RentalsPage";
import ShoppingPage from "./pages/ShoppingPage";

const TOKEN_KEY = "cinemaflix_token";
const USER_KEY = "cinemaflix_user";

function ProtectedRoute({ authenticated, children }) {
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) ?? "");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [booting, setBooting] = useState(Boolean(token));

  const api = useMemo(() => createApiClient(token), [token]);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setBooting(false);
        return;
      }

      try {
        const me = await api.getMe();
        setUser(me);
        localStorage.setItem(USER_KEY, JSON.stringify(me));
      } catch {
        handleLogout();
      } finally {
        setBooting(false);
      }
    }

    bootstrap();
  }, [api, token]);

  function handleAuthenticated(accessToken, authenticatedUser) {
    setToken(accessToken);
    setUser(authenticatedUser);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
  }

  function handleLogout() {
    setToken("");
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  if (booting) {
    return <div className="status-screen">Opening CinemaFlix...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token && user ? (
            <Navigate to="/" replace />
          ) : (
            <AuthPage mode="login" api={api} onAuthenticated={handleAuthenticated} />
          )
        }
      />
      <Route
        path="/register"
        element={
          token && user ? (
            <Navigate to="/" replace />
          ) : (
            <AuthPage
              mode="register"
              api={api}
              onAuthenticated={handleAuthenticated}
            />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute authenticated={Boolean(token && user)}>
            <HomePage api={api} user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-list"
        element={
          <ProtectedRoute authenticated={Boolean(token && user)}>
            <MyListPage api={api} user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shopping"
        element={
          <ProtectedRoute authenticated={Boolean(token && user)}>
            <ShoppingPage api={api} user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rentals"
        element={
          <ProtectedRoute authenticated={Boolean(token && user)}>
            <RentalsPage api={api} user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={token && user ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
