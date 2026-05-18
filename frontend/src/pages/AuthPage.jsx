import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";

const REGISTER_INITIAL = {
  username: "",
  email: "",
  password: "",
};

const LOGIN_INITIAL = {
  identifier: "",
  password: "",
};

export default function AuthPage({ mode, api, onAuthenticated }) {
  const navigate = useNavigate();
  const [registerForm, setRegisterForm] = useState(REGISTER_INITIAL);
  const [loginForm, setLoginForm] = useState(LOGIN_INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useMemo(
    () => (mode === "register" ? registerForm : loginForm),
    [loginForm, mode, registerForm],
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setError("");

    if (mode === "register") {
      setRegisterForm((current) => ({ ...current, [name]: value }));
      return;
    }

    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data =
        mode === "register"
          ? await api.register(registerForm)
          : await api.login(loginForm);

      onAuthenticated(data.access_token, data.user);
      navigate("/");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSwitchMode() {
    navigate(mode === "register" ? "/login" : "/register");
  }

  return (
    <AuthCard
      mode={mode}
      form={form}
      error={error}
      loading={loading}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onSwitchMode={handleSwitchMode}
    />
  );
}

