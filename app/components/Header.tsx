import { Link, NavLink, useNavigate } from "react-router";
import { removeToken } from "../utils/auth";
import "../css/header.css";

type HeaderProps = {
  onLogout?: () => void;
};

export default function Header({ onLogout }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    if (onLogout) {
      onLogout();
    }
    navigate("/", { replace: true, viewTransition: true });
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/dashboard" className="header__logo" viewTransition>
          <img src="/logo.png" alt="Logo SportSee" className="header__logo-img" />
        </Link>
        <nav className="header__nav">
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