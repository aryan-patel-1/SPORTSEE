import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { saveToken } from "../utils/auth";
import { getErrorMessage, loginUser } from "../services/api";
import { UserContext } from "../context/UserContext";
import "../css/login.css";

// page de connexion affichée sur la route "/"
export default function Login() {
  // états du formulaire et du cycle de connexion
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

  // envoi du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // loginUser est centralisé dans services/api.ts pour éviter de dupliquer
      // l'URL et la logique fetch
      const data = await loginUser(username, password);

      if (data.token) {
        // on sauvegarde le token et on met à jour le contexte user
        saveToken(data.token);
        setUser({
          username,
          userId: data.userId,
        });
        navigate("/dashboard", { viewTransition: true });
      } else {
        setError("Identifiants incorrects");
      }
    } catch (error) {
      setError(getErrorMessage(error, "Connexion impossible pour le moment."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {/* bouton désactivé pendant la requête pour éviter les doubles envois */}
              <button className="login-form__button" type="submit" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <p className="login-card__forgot">Mot de passe oublié ?</p>

            {/* message d'erreur uniquement si renseigné */}
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
    </div>
  );
}