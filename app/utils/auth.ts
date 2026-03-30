// Enregistre le token après la connexion
export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

// Relit le token stocké dans le navigateur
export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

// Supprime le token lors de la déconnexion
export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}