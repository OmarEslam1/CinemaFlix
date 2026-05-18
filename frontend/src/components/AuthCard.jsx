export default function AuthCard({
  mode,
  form,
  error,
  loading,
  onChange,
  onSubmit,
  onSwitchMode,
}) {
  const isRegister = mode === "register";

  return (
    <section
      className={`auth-shell ${isRegister ? "auth-shell--register" : "auth-shell--login"}`}
    >
      <div className="auth-backdrop" />
      <header className="auth-topbar">
        <div className="brand brand--large">CINEMAFLIX</div>
      </header>

      <main className="auth-main">
        <div className={`auth-card ${isRegister ? "auth-card--register" : ""}`}>
          {isRegister ? (
            <>
              <div className="auth-card__glow" />
              <div className="auth-card__heading auth-card__heading--centered">
                <h1 className="brand">CINEMAFLIX</h1>
                <p>Join the ultimate cinematic experience.</p>
              </div>
            </>
          ) : (
            <div className="auth-card__heading">
              <h1>SIGN IN</h1>
            </div>
          )}

          <form className="auth-form" onSubmit={onSubmit}>
            {isRegister ? (
              <label className="field">
                <span className="sr-only">Username</span>
                <input
                  name="username"
                  type="text"
                  placeholder="Full Name"
                  value={form.username}
                  onChange={onChange}
                  required
                />
              </label>
            ) : null}

            <label className="field">
              <span className="sr-only">
                {isRegister ? "Email Address" : "Email or username"}
              </span>
              <input
                name={isRegister ? "email" : "identifier"}
                type={isRegister ? "email" : "text"}
                placeholder={isRegister ? "Email Address" : "Email or username"}
                value={isRegister ? form.email : form.identifier}
                onChange={onChange}
                required
              />
            </label>

            <label className="field">
              <span className="sr-only">Password</span>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={onChange}
                required
                minLength={6}
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading
                ? isRegister
                  ? "Creating account..."
                  : "Signing in..."
                : isRegister
                  ? "Sign Up"
                  : "Sign In"}
            </button>
          </form>

          {!isRegister ? (
            <>
              <div className="auth-row">
                <label className="check-row">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="text-button text-button--muted">
                  Need help?
                </button>
              </div>
              
            </>
          ) : null}

          <div className="auth-switch">
            {isRegister ? (
              <p>
                Already have an account?{" "}
                <button type="button" className="text-button" onClick={onSwitchMode}>
                  Log in
                </button>
              </p>
            ) : (
              <p>
                New to CinemaFlix?{" "}
                <button type="button" className="text-button" onClick={onSwitchMode}>
                  Sign up now.
                </button>
              </p>
            )}
          </div>

          {!isRegister ? (
            <p className="auth-note">
              This page is protected by Google reCAPTCHA to ensure you&apos;re not a
              bot. <span>Learn more.</span>
            </p>
          ) : null}
        </div>
      </main>

      <footer className="auth-footer">
        <div className="brand brand--footer">CINEMAFLIX</div>
        <nav className="footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Help Center</span>
          <span>Cookie Preferences</span>
        </nav>
        <span className="footer-copy">© 2024 CinemaFlix Inc. All rights reserved.</span>
      </footer>
    </section>
  );
}
