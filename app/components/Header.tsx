import { NavLink } from "react-router";
import logo from "../img/Logo.png";

type HeaderProps = {
  onLogout: () => void;
};

function getNavLinkClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "dashboard-header__link dashboard-header__link--current"
    : "dashboard-header__link";
}

export default function Header({ onLogout }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <img src={logo} alt="Logo Sportsee" className="dashboard-header__logo" />

      <nav className="dashboard-header__nav" aria-label="Navigation du dashboard">
        <NavLink to="/dashboard" className={getNavLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/profil" className={getNavLinkClass}>
          Mon profil
        </NavLink>
        <span className="dashboard-header__divider" aria-hidden="true" />
        <button type="button" className="dashboard-header__logout" onClick={onLogout}>
          Se déconnecter
        </button>
      </nav>
    </header>
  );
}