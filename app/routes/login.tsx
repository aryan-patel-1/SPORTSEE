import { useState } from "react";
import { useNavigate } from "react-router";
import { saveToken } from "../utils/auth";

export default function Login() {
  //formulaire
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // message d'erreur
  const [error, setError] = useState("");

  // état de chargement
  const [loading, setLoading] = useState(false);

  // permet de changer de page
  const navigate = useNavigate();

  // envoi du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // requête vers le backend
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // on lit la réponse JSON
      const data = await response.json();

      console.log("Réponse API :", data);

      // si token reçu, on le sauvegarde
      if (data.token) {
        saveToken(data.token);
        navigate("/dashboard");
      } else {
        setError("Identifiants incorrects");
      }
    } catch (error) {
      console.error("Erreur login :", error);
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Connexion</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username"
            type="text"
            placeholder="sophiemartin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            placeholder="password123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}