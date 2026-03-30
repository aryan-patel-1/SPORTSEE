import { Link } from "react-router";
import logo from "../img/Logo.png";
import backgroundPicture from "../img/Background_picture_sportsee.png";

export default function NotFound() {
  return (
    <main className="login-page">
      {/* Colonne gauche: message d'erreur */}
      <section className="login-page__panel">
        <img
          src={logo}
          alt="Logo Sportsee"
          className="login-page__logo"
        />

        <div className="login-page__card">
          <p className="login-page__eyebrow">Oups !</p>
          <h1 className="login-page__title">Page introuvable</h1>
          <p className="login-page__subtitle">Erreur 404</p>

          <p className="login-page__description">
            La page que vous cherchez n'existe pas ou a été déplacée.
          </p>

          <Link to="/" className="not-found__link">
            Retour à l'accueil
          </Link>
        </div>
      </section>

      {/* Colonne droite */}
      <section className="login-page__visual" aria-hidden="true">
        <img
          src={backgroundPicture}
          alt=""
          className="login-page__image"
        />
        <div className="login-page__badge">
          Analysez vos performances en un clin d'œil, suivez vos progrès
          et atteignez vos objectifs.
        </div>
      </section>
    </main>
  );
}