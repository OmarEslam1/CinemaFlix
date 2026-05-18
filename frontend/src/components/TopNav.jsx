import { NavLink } from "react-router-dom";

export default function TopNav({ user, onLogout }) {
  return (
    <nav className="top-nav">
      <div className="top-nav__left">
        <div className="brand brand--nav">CINEMAFLIX</div>
        <div className="top-nav__links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/my-list">Wish List</NavLink>
          <NavLink to="/shopping">Shopping</NavLink>
          <NavLink to="/rentals">Rentals</NavLink>
        </div>
      </div>

      <div className="top-nav__right">
        <div className="top-nav__search">{user.is_owner ? "Owner Console" : "Search"}</div>
        <div className="avatar-badge">{user.username.slice(0, 1).toUpperCase()}</div>
        {user.is_owner ? <span className="owner-pill">Owner</span> : null}
        <button type="button" className="text-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
