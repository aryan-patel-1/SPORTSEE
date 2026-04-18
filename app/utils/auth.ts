// sauvegarde le token après connexion
export function saveToken(token: string) {
  // vérifie qu'on est côté navigateur
  if (typeof window !== "undefined") {
    // stocke le token dans le sessionStorage
    sessionStorage.setItem("token", token);
  }
}

// récupère le token pour les requêtes API
export function getToken() {
  // si on est côté serveur, on ne peut pas accéder au storage
  if (typeof window === "undefined") {
    return null;
  }

  // retourne le token stocké
  return sessionStorage.getItem("token");
}

// supprime le token lors de la déconnexion
export function removeToken() {
  // vérifie qu'on est côté navigateur
  if (typeof window !== "undefined") {
    // supprime le token
    sessionStorage.removeItem("token");
  }
}

// vérifie si l'utilisateur est connecté
export function isAuthenticated() {
  // si côté serveur → pas connecté
  if (typeof window === "undefined") {
    return false;
  }

  // retourne true si un token existe
  return !!sessionStorage.getItem("token");
}