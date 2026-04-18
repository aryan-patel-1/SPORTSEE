import { normalizeActivityResponse } from "../utils/activity";

const API_URL = "http://localhost:8000/api";

// Effectue une requête authentifiée vers l'API et retourne les données JSON.
// Lance une erreur si la réponse n'est pas OK.
async function apiFetch(url: string, token: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Erreur API ${response.status} : ${url}`);
  }

  return response.json();
}

// Convertit une valeur en nombre si elle est définie, sinon retourne undefined.
function toOptionalNumber(value: unknown) {
  return value != null ? Number(value) : undefined;
}

// Normalise le genre reçu de l'API vers "male" ou "female".
// L'API peut retourner différentes valeurs selon la langue ou le format.
function normalizeGender(gender: unknown) {
  if (typeof gender !== "string") return null;

  const normalized = gender.trim().toLowerCase();

  if (["male", "man", "homme", "masculin", "m"].includes(normalized)) return "male";
  if (["female", "woman", "femme", "feminin", "féminin", "f"].includes(normalized)) return "female";

  return null;
}

// Convertit les champs numériques des statistiques qui peuvent arriver en string.
function normalizeStatistics(stats: any) {
  return {
    ...stats,
    totalDistance: toOptionalNumber(stats?.totalDistance),
    totalSessions: toOptionalNumber(stats?.totalSessions),
    totalDuration: toOptionalNumber(stats?.totalDuration),
  };
}

// Normalise les données utilisateur pour avoir une structure cohérente côté front.
// L'API peut retourner les infos dans "profile" ou "userInfos" selon la version.
function normalizeUserInfo(data: any) {
  const profileSource = data?.profile ?? {};
  const userInfosSource = data?.userInfos ?? {};

  return {
    ...data,
    profile: {
      ...userInfosSource,
      ...profileSource,
      gender: normalizeGender(
        profileSource.gender ?? userInfosSource.gender ?? data?.gender
      ),
    },
    statistics: normalizeStatistics(data?.statistics ?? {}),
  };
}

// Connecte l'utilisateur avec ses identifiants.
export async function loginUser(username: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Identifiants invalides");
  }

  return response.json();
}

export async function fetchUserInfo(token: string) {
  const data = await apiFetch(`${API_URL}/user-info`, token);
  return normalizeUserInfo(data);
}

export async function fetchUserGoal(token: string) {
  const data = await apiFetch(`${API_URL}/user-goal`, token);
  return typeof data.goal === "number" ? data.goal : 0;
}

export async function fetchUserActivity(token: string, startWeek: string, endWeek: string) {
  const url = `${API_URL}/user-activity?startWeek=${encodeURIComponent(startWeek)}&endWeek=${encodeURIComponent(endWeek)}`;
  const data = await apiFetch(url, token);
  return normalizeActivityResponse(data);
}