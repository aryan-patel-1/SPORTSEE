import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getToken, removeToken } from "../utils/auth";

export default function Dashboard() {
  // permet de changer de page 
  const navigate = useNavigate();
  // sert à attendre la vérification du token
  const [checked, setChecked] = useState(false);
  // vérifie si l'utilisateur est connecté
  useEffect(() => {
    // on récupère le token stocké dans le navigateur
    const token = getToken();
    // si aucun token → redirection vers login
    if (!token) {
      navigate("/login");
      return;
    }
    // si token présent → on autorise l'accès
    setChecked(true);
  }, [navigate]);
  // fonction appelée quand on clique sur "Se déconnecter"
  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };
  // tant que la vérification n'est pas terminée
  if (!checked) {
    return <p>Vérification...</p>;
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Page protégée</p>
      <button onClick={handleLogout}>
        Se déconnecter
      </button>

    </div>
  );
}