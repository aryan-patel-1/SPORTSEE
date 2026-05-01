// types partagés utilisés dans tout le front
export type HeartRate = {
  min: number;
  max: number;
  average: number;
};

export type UserActivity = {
  date: string;
  distance: number;
  duration: number;
  heartRate: HeartRate;
  caloriesBurned: number;
};

export type WeeklyDistancePoint = {
  distance: number;
  startDate: string;
  endDate: string;
};

export type UserActivityResponse = {
  activities: UserActivity[];
  runningData: WeeklyDistancePoint[];
};

// convertit en nombre, renvoie 0 si la valeur est invalide
function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// transforme une chaîne de date en objet Date
// si la date n'a pas d'heure on force midi UTC pour éviter les décalages de fuseau
function parseDate(dateString: string) {
  return new Date(dateString.includes("T") ? dateString : `${dateString}T12:00:00Z`);
}

// ramène n'importe quelle date au format "YYYY-MM-DD"
function toDateString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

// date courte en français, ex "12 févr" ou "12 févr 2024"
function formatShortDate(dateString: string, includeYear?: boolean) {
  return parseDate(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: includeYear ? "numeric" : undefined,
  });
}

// date longue en français, ex "10 février 2025"
export function formatLongActivityDate(dateString: string) {
  return parseDate(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// date complète pour les tooltips, ex "12/02/2025"
export function formatTooltipActivityDate(dateString: string) {
  return parseDate(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// affiche une période "début - fin"
// l'année n'est ajoutée que si la période sort de l'année en cours
// (sinon le libellé reste compact, ex "12 févr - 18 févr")
export function formatActivityPeriod(startDate: string, endDate: string) {
  const currentYear = new Date().getUTCFullYear();
  const startYear = parseDate(startDate).getUTCFullYear();
  const endYear = parseDate(endDate).getUTCFullYear();

  // si une des deux bornes n'est pas dans l'année en cours, on affiche l'année
  // (ce test couvre aussi le cas où start et end ne sont pas dans la même année)
  const includeYear = startYear !== currentYear || endYear !== currentYear;

  return `${formatShortDate(startDate, includeYear)} - ${formatShortDate(endDate, includeYear)}`;
}

// version tooltip du formatActivityPeriod
export function formatTooltipActivityPeriod(startDate: string, endDate: string) {
  if (startDate === endDate) return formatTooltipActivityDate(startDate);
  return `${formatTooltipActivityDate(startDate)} - ${formatTooltipActivityDate(endDate)}`;
}

// trie les activités par date (sans modifier le tableau d'origine)
export function sortActivitiesByDate(activities: UserActivity[]) {
  return [...activities].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
  );
}

// renvoie la date du lundi de la semaine qui contient la date donnée
// sert d'identifiant stable pour regrouper les activités par semaine
function getWeekKey(dateString: string) {
  const date = parseDate(dateString);

  // getUTCDay : dimanche = 0, lundi = 1, ..., samedi = 6
  const dayOfWeek = date.getUTCDay();

  // décalage à appliquer pour atterrir sur le lundi de la même semaine :
  //   - dimanche (0) => recule de 6 jours pour rejoindre le lundi précédent
  //   - les autres jours => 1 - dayOfWeek (ex mercredi = 3 => -2 jours)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setUTCDate(date.getUTCDate() + diffToMonday);

  return date.toISOString().slice(0, 10);
}

// renvoie uniquement les activités de la semaine la plus récente
export function getLatestWeekActivities(activities: UserActivity[]) {
  const sorted = sortActivitiesByDate(activities);
  const latest = sorted.at(-1);
  if (!latest) return [];
  const key = getWeekKey(latest.date);
  return sorted.filter((a) => getWeekKey(a.date) === key);
}

// détecte si un objet ressemble à une activité ponctuelle
function looksLikeActivityEntry(entry: any) {
  return Boolean(
    entry &&
    typeof entry === "object" &&
    (entry.heartRate ||
      entry.heart_rate ||
      entry.duration != null ||
      entry.caloriesBurned != null ||
      entry.calories_burned != null)
  );
}

// cherche le tableau d'activités dans la réponse API quelle que soit sa forme
function extractActivitiesSource(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data.some(looksLikeActivityEntry) ? data : [];
  }
  if (!data || typeof data !== "object") return [];

  const source = data as Record<string, unknown>;
  // on essaie plusieurs clés possibles selon la version de l'API
  const keys = [
    "runningData", "running_data", "activities", "activity",
    "sessions", "userActivity", "activityData", "data",
  ];

  for (const key of keys) {
    const candidate = source[key];
    if (Array.isArray(candidate) && candidate.some(looksLikeActivityEntry)) {
      return candidate;
    }
  }
  return [];
}

// convertit une liste d'activités brutes en structure UserActivity
// gère les différents noms de champs possibles (camelCase / snake_case)
function normalizeActivities(data: unknown): UserActivity[] {
  const normalized = extractActivitiesSource(data)
    .map((a: any) => {
      const hr = a?.heartRate ?? a?.heart_rate ?? {};
      return {
        date: toDateString(a?.date ?? a?.sessionDate ?? a?.performedAt),
        distance: toNumber(a?.distance ?? a?.totalDistance ?? a?.km),
        duration: toNumber(a?.duration),
        heartRate: {
          min: toNumber(hr.min ?? a?.minBpm ?? a?.min_bpm),
          max: toNumber(hr.max ?? a?.maxBpm ?? a?.max_bpm),
          average: toNumber(hr.average ?? a?.averageBpm ?? a?.average_bpm),
        },
        caloriesBurned: toNumber(a?.caloriesBurned ?? a?.calories_burned),
      };
    })
    // on retire les activités sans date valide
    .filter((a) => a.date);

  return sortActivitiesByDate(normalized);
}

// regroupe les activités quotidiennes par semaine pour calculer la distance totale
// renvoie une ligne par semaine avec la distance cumulée et les bornes effectives
export function getWeeklyDistanceData(activities: UserActivity[]): WeeklyDistancePoint[] {
  // Map clé = lundi de la semaine, valeur = ligne en cours de construction
  const weeks = new Map<string, WeeklyDistancePoint>();

  // on parcourt les activités triées pour que startDate / endDate restent cohérents
  for (const activity of sortActivitiesByDate(activities)) {
    const key = getWeekKey(activity.date);
    const week = weeks.get(key);

    if (!week) {
      // première activité de la semaine : on initialise la ligne
      // startDate et endDate pointent vers cette unique activité
      weeks.set(key, {
        distance: activity.distance,
        startDate: activity.date,
        endDate: activity.date,
      });
    } else {
      // semaine déjà commencée : on cumule la distance et on étend la borne de fin
      // (les activités étant triées, l'endDate se met à jour naturellement)
      week.distance += activity.distance;
      week.endDate = activity.date;
    }
  }

  // arrondi final à 1 décimale pour éviter les flottants type 12.300000000000004
  return Array.from(weeks.values()).map((w) => ({
    ...w,
    distance: Number(w.distance.toFixed(1)),
  }));
}

// point d'entrée utilisé par le service API, renvoie les activités et le cumul hebdo
export function normalizeActivityResponse(data: unknown): UserActivityResponse {
  const activities = normalizeActivities(data);
  return { activities, runningData: getWeeklyDistanceData(activities) };
}