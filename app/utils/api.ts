import { mockAuth } from "../mocks/mockdata";

const API_URL = "http://localhost:8000/api";
const JSON_HEADERS = {
  "Content-Type": "application/json",
};

// cette fonction évite de planter si l'api renvoie du vide ou un texte brut
async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildAuthHeaders(token: string) {
  return {
    ...JSON_HEADERS,
    Authorization: `Bearer ${token}`,
  };
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

// cette fonction teste plusieurs routes pour s'adapter aux variations du backend
async function requestApi(paths: string[], token: string) {
  let lastError: Error | null = null;

  for (const path of paths) {
    const response = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: buildAuthHeaders(token),
    });
    const payload = await readJson(response);
    if (response.ok) return payload;

    if (response.status === 404) {
      lastError = new Error(getErrorMessage(payload, `Route API introuvable: ${path}`));
      continue;
    }

    throw new Error(getErrorMessage(payload, "Erreur API"));
  }

  throw lastError ?? new Error("Erreur API");
}

export async function loginUser(username: string, password: string) {
  // ce raccourci permet de tester l'app sans backend de login
  if (username === mockAuth.username && password === mockAuth.password) {
    return { token: mockAuth.token };
  }

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Identifiants invalides");
  }

  return readJson(response);
}

export async function fetchUserInfo(token: string) {
  return requestApi(["/user-info", "/user"], token);
}

export async function fetchUserActivity(
  token: string,
  startWeek: string,
  endWeek: string
) {
  // la requête accepte une période pour limiter le volume retourné
  const query = `?startWeek=${encodeURIComponent(startWeek)}&endWeek=${encodeURIComponent(endWeek)}`;

  return requestApi(
    [`/user-activity${query}`, `/activity${query}`, "/activity"],
    token
  );
}
