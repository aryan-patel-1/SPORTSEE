// enregistre le token après une connexion réussie
export function saveToken(token: string) {
  // vérifie qu'on est côté navigateur
  if (typeof window !== "undefined") {
    sessionStorage.setItem("token", token);
  }
}

// récupère le token stocké, null si absent ou côté serveur
export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem("token");
}

// supprime le token (utilisé à la déconnexion)
export function removeToken() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("token");
  }
}

// vrai si un token est présent dans le storage
export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return !!sessionStorage.getItem("token");
}