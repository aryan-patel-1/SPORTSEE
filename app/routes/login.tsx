import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { saveToken } from "../utils/auth";
import { UserContext } from "../context/UserContext";
import "../css/login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const context = useContext(UserContext);
  if (!context) {
    return <p>Erreur de contexte</p>;
  }
  const { setUser } = context;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.token) {
        saveToken(data.token);
        setUser({
          username: username,
          userId: data.userId,
        });
        navigate("/dashboard");
      } else {
        setError("Identifiants incorrects");
      }
    } catch (error) {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="login-page">
      <section className="login-page__left">
        <div className="login-page__logo">
          <img src="/logo.png" alt="SportSee" />
        </div>

        <div className="login-card">
          <h1 className="login-card__title">
            Transformez
            <br />
            vos stats en résultats
          </h1>

          <h2 className="login-card__subtitle">Se connecter</h2>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form__group">
              <label htmlFor="username">Adresse email</label>
              <input
                id="username"
                type="text"
                placeholder=""
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="login-form__group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button className="login-form__button" type="submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="login-card__forgot">Mot de passe oublié ?</p>

          {error && <p className="login-card__error">{error}</p>}
        </div>
      </section>

      <section className="login-page__right">
        <img
          className="login-page__image"
          src="/login-runner.png"
          alt="Course à pied"
        />
      </section>
    </main>
  );
}