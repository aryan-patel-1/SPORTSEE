import { Link, NavLink, useNavigate } from "react-router";
import { removeToken } from "../utils/auth";
import "../css/header.css";

type HeaderProps = {
  // callback appelé par la page parente lors du clic sur déconnexion
  onLogout?: () => void;
};

// en-tête commun aux pages authentifiées
export default function Header({ onLogout }: HeaderProps) {
  const navigate = useNavigate();

  // supprime le token puis redirige vers la page de connexion
  const handleLogout = () => {
    removeToken();
    onLogout?.();

    // replace évite d'empiler la page dans l'historique
    navigate("/", { replace: true, viewTransition: true });
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/dashboard" className="header__logo" viewTransition>
          <img src="/logo.png" alt="Logo SportSee" className="header__logo-img" />
        </Link>

        <nav className="header__nav">
          {/* NavLink ajoute une classe active selon l'URL courante */}
          <NavLink
            to="/dashboard"
            end
            viewTransition
            className={({ isActive }) =>
              isActive ? "header__link header__link--active" : "header__link"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            viewTransition
            className={({ isActive }) =>
              isActive ? "header__link header__link--active" : "header__link"
            }
          >
            Mon profil
          </NavLink>

          <button type="button" className="header__logout" onClick={handleLogout}>
            Se déconnecter
          </button>
        </nav>
      </div>
    </header>
  );
}