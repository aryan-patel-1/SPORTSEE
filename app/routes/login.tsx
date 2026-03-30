import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppContext } from "../context/AppContext";
import logo from "../img/Logo.png";
import backgroundPicture from "../img/Background_picture_sportsee.png";

export default function Login() {
  // États locaux du formulaire
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Message d'erreur affiché sous le formulaire si la connexion échoue
  const [error, setError] = useState("");

  // Permet de changer de page après connexion
  const navigate = useNavigate();

  // Le contexte gère l'état global de connexion
  const { login, isAuthenticated, isCheckingAuth } = useAppContext();

  // Si un utilisateur a déjà une session active, il ne reste pas sur login
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isCheckingAuth, isAuthenticated, navigate]);

  // Envoie les identifiants au backend pour récupérer un token
  const handleSubmit = async (e: any) => {
    // Empêche le rechargement de la page
    e.preventDefault();

    // Réinitialise l'ancien message d'erreur avant un nouvel essai
    setError("");

    try {
      // Appel API de connexion
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      // Lecture de la réponse JSON du backend
      const data = await response.json();

      // Si un token est renvoyé, on connecte l'utilisateur puis on redirige
      if (data.token) {
        login(data.token);
        navigate("/dashboard");
        return;
      }

      // Si aucun token n'est reçu, les identifiants sont considérés comme invalides
      setError("Identifiants incorrects ou mot de passe invalide");
    } catch (error) {
      // En cas d'erreur réseau ou serveur, on affiche un message générique
      console.error("Erreur login :", error);
      setError("Erreur serveur");
    }
  };

  return (
    <main className="login-page">
      {/* Partie gauche : logo et formulaire */}
      <section className="login-page__panel">
        <img
          src={logo}
          alt="Logo Sportsee"
          className="login-page__logo"
        />

        <div className="login-page__card">
          <p className="login-page__eyebrow">Transformez</p>
          <h1 className="login-page__title">vos stats en résultats</h1>
          <p className="login-page__subtitle">Se connecter</p>

          <form className="login-page__form" onSubmit={handleSubmit}>
            <div className="login-page__field">
              <label className="login-page__label" htmlFor="username">
                Adresse email
              </label>
              <input
                id="username"
                className="login-page__input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="login-page__field">
              <label className="login-page__label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                className="login-page__input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              className="login-page__submit"
              type="submit"
            >
              Se connecter
            </button>
          </form>

          {error ? <p className="login-page__error">{error}</p> : null}
        </div>
      </section>

      {/* Partie droite : image */}
      <section className="login-page__visual" aria-hidden="true">
        <img
          src={backgroundPicture}
          alt=""
          className="login-page__image"
        />
        <div className="login-page__badge">
          Analysez vos performances en un clin d&apos;oeil, suivez vos progrès
          et atteignez vos objectifs.
        </div>
      </section>
    </main>
  );
}