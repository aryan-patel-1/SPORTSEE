import { normalizeActivityResponse } from "../utils/date";

// url de base de l'API backend
const API_URL = "http://localhost:8000/api";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// fait un appel API avec le token d'authentification et renvoie le JSON
async function apiFetch(url: string, token: string, failureMessage: string) {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new ApiError(
      `${failureMessage} Le serveur est peut-être indisponible pour le moment.`
    );
  }

  if (!response.ok) {
    throw new ApiError(`${failureMessage} (code ${response.status}).`, response.status);
  }

  return response.json();
}

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
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
  let response: Response;

  try {
    response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new ApiError("Connexion impossible. Vérifiez que l'API SportSee est démarrée.");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError("Identifiants incorrects.");
    }

    throw new ApiError(`Connexion impossible (code ${response.status}).`, response.status);
  }

  return response.json();
}

// récupère les infos du user connecté
export async function fetchUserInfo(token: string) {
  const data = await apiFetch(
    `${API_URL}/user-info`,
    token,
    "Impossible de charger le profil utilisateur."
  );
  return normalizeUserInfo(data);
}

// récupère l'objectif hebdomadaire du user
export async function fetchUserGoal(token: string) {
  const data = await apiFetch(
    `${API_URL}/user-goal`,
    token,
    "Impossible de charger l'objectif hebdomadaire."
  );
  return typeof data.goal === "number" ? data.goal : 0;
}

// récupère les activités du user entre deux dates
export async function fetchUserActivity(token: string, startWeek: string, endWeek: string) {
  const url = `${API_URL}/user-activity?startWeek=${encodeURIComponent(startWeek)}&endWeek=${encodeURIComponent(endWeek)}`;
  const data = await apiFetch(url, token, "Impossible de charger les activités.");
  return normalizeActivityResponse(data);
}