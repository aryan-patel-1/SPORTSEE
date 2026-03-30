import { useEffect } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";
import { useAppContext } from "../context/AppContext";

export default function Dashboard() {
  // permet de changer de page 
  const navigate = useNavigate();
  // Le dashboard lit l'état d'authentification depuis le contexte partagé
  const { isAuthenticated, isCheckingAuth, logout } = useAppContext();

  // Une fois l'initialisation terminée, on protège la route en redirigeant
  // les visiteurs non authentifiés vers la page de connexion
  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);

  // fonction appelée quand on clique sur "Se déconnecter"
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };
  // Tant que la vérification de l'authentification est en cours, on n'affiche rien
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <Header onLogout={handleLogout} />

        <section className="dashboard-content">
          <h1 className="dashboard-content__title">Dashboard</h1>
          <p className="dashboard-content__text">Page du dashboard</p>
        </section>
      </div>
    </main>
  );
}