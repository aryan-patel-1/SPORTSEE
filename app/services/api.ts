import { normalizeActivityResponse } from "../utils/activity";

// url de base de l'API backend
const API_URL = "http://localhost:8000/api";

// fait un appel API avec le token d'authentification et renvoie le JSON
async function apiFetch(url: string, token: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Erreur API ${response.status} : ${url}`);
  }

  return response.json();
}

// convertit une valeur en nombre si elle existe, sinon renvoie undefined
function toOptionalNumber(value: unknown) {
  return value != null ? Number(value) : undefined;
}

// uniformise la valeur du genre reçu par l'API en "male" ou "female"
function normalizeGender(gender: unknown) {
  if (typeof gender !== "string") return null;

  const normalized = gender.trim().toLowerCase();

  if (["male", "man", "homme", "masculin", "m"].includes(normalized)) return "male";
  if (["female", "woman", "femme", "feminin", "féminin", "f"].includes(normalized)) return "female";

  return null;
}

// force les champs numériques des stats en type number
function normalizeStatistics(stats: any) {
  return {
    ...stats,
    totalDistance: toOptionalNumber(stats?.totalDistance),
    totalSessions: toOptionalNumber(stats?.totalSessions),
    totalDuration: toOptionalNumber(stats?.totalDuration),
  };
}

// harmonise la structure du user pour le front
// l'API peut renvoyer les infos dans "profile" ou "userInfos" selon la version
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

// connecte l'utilisateur avec ses identifiants
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

// récupère les infos du user connecté
export async function fetchUserInfo(token: string) {
  const data = await apiFetch(`${API_URL}/user-info`, token);
  return normalizeUserInfo(data);
}

// récupère l'objectif hebdomadaire du user
export async function fetchUserGoal(token: string) {
  const data = await apiFetch(`${API_URL}/user-goal`, token);
  return typeof data.goal === "number" ? data.goal : 0;
}

// récupère les activités du user entre deux dates
export async function fetchUserActivity(token: string, startWeek: string, endWeek: string) {
  const url = `${API_URL}/user-activity?startWeek=${encodeURIComponent(startWeek)}&endWeek=${encodeURIComponent(endWeek)}`;
  const data = await apiFetch(url, token);
  return normalizeActivityResponse(data);
}