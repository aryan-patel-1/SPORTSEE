import { Link } from "react-router";

export default function Home() {
  return (
    <div>
      <h1>Accueil</h1>
      <p>Page publique</p>

      <Link to="/login">Aller vers la connexion</Link>
    </div>
  );
}