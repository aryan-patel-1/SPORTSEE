import { mockUserActivity, mockUserInfo } from "../mocks/mockdata";
import { fetchUserActivity, fetchUserInfo } from "./api";

const USE_MOCK = false;
const DAY_IN_MS = 86_400_000;

export type UserInfo = typeof mockUserInfo;
export type UserActivity = (typeof mockUserActivity)[number];

// les variations de format renvoyées par l'api
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (...values: unknown[]) =>
  values.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  );

const readNumber = (...values: unknown[]) =>
  values.find(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value)
  );

const readStat = (unit: string, ...values: unknown[]) => {
  const text = readString(...values);
  const amount = readNumber(...values);
  return text ?? (amount !== undefined ? `${amount} ${unit}` : undefined);
};

function unwrapPayload(payload: unknown) {
  if (!isObject(payload)) {
    return payload;
  }

  return (
    payload.data ??
    payload.user ??
    payload.activity ??
    payload.activities ??
    payload
  );
}

function normalizeGender(...values: unknown[]) {
  const raw = readString(...values);
  const normalizedValue = raw?.trim().toLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (["male", "man", "homme", "m"].includes(normalizedValue)) {
    return "Homme";
  }

  if (["female", "woman", "femme", "f"].includes(normalizedValue)) {
    return "Femme";
  }

  return raw;
}

// ce mapping protège l'ui si le backend change légèrement ses noms de champs
function normalizeUserInfo(payload: unknown): UserInfo {
  const source = unwrapPayload(payload);
  const data: Record<string, unknown> = isObject(source) ? source : {};
  const profile = isObject(data.profile) ? data.profile : {};
  const statistics = isObject(data.statistics) ? data.statistics : {};

  return {
    profile: {
      firstName:
        readString(
          profile.firstName,
          data.firstName,
          data.firstname,
          data.prenom
        ) ?? mockUserInfo.profile.firstName,
      lastName:
        readString(
          profile.lastName,
          data.lastName,
          data.lastname,
          data.nom
        ) ?? mockUserInfo.profile.lastName,
      createdAt:
        readString(
          profile.createdAt,
          data.createdAt,
          data.memberSince,
          data.joinedAt
        ) ?? mockUserInfo.profile.createdAt,
      age: readNumber(profile.age, data.age) ?? mockUserInfo.profile.age,
      gender:
        normalizeGender(
          profile.gender,
          profile.sex,
          data.gender,
          data.sex
        ) ?? mockUserInfo.profile.gender,
      height:
        readString(profile.height, data.height) ?? mockUserInfo.profile.height,
      weight:
        readString(profile.weight, data.weight) ?? mockUserInfo.profile.weight,
      profilePicture:
        readString(profile.profilePicture, data.profilePicture) ??
        mockUserInfo.profile.profilePicture,
    },
    statistics: {
      totalDistance:
        readStat(
          "km",
          statistics.totalDistance,
          statistics.distance,
          statistics.total_distance,
          data.totalDistance,
          data.distance
        ) ?? mockUserInfo.statistics.totalDistance,
      totalSessions:
        readStat(
          "sessions",
          statistics.totalSessions,
          statistics.sessions,
          statistics.sessionCount,
          statistics.total_sessions,
          data.totalSessions,
          data.sessions
        ) ?? mockUserInfo.statistics.totalSessions,
      totalDuration:
        readStat(
          "min",
          statistics.totalDuration,
          statistics.duration,
          statistics.minutes,
          statistics.total_duration,
          data.totalDuration,
          data.duration
        ) ?? mockUserInfo.statistics.totalDuration,
      caloriesBurned:
        readStat(
          "cal",
          statistics.caloriesBurned,
          statistics.calories,
          statistics.kcal,
          statistics.calories_burned,
          data.caloriesBurned,
          data.calories
        ) ?? mockUserInfo.statistics.caloriesBurned,
      restDays:
        readStat(
          "jours",
          statistics.restDays,
          statistics.rest_days,
          statistics.restDaysCount,
          statistics.daysOff,
          data.restDays,
          data.rest_days
        ) ?? mockUserInfo.statistics.restDays,
    },
  };
}

function normalizeActivityEntry(entry: unknown): UserActivity | null {
  if (!isObject(entry)) {
    return null;
  }

  const heartRate = isObject(entry.heartRate) ? entry.heartRate : {};
  const date = readString(entry.date, entry.day, entry.sessionDate);
  const distance = readNumber(entry.distance, entry.km, entry.totalDistance);
  const duration = readNumber(entry.duration, entry.minutes, entry.totalDuration);
  const min = readNumber(heartRate.min, entry.minHeartRate, entry.min_bpm, entry.min);
  const max = readNumber(heartRate.max, entry.maxHeartRate, entry.max_bpm, entry.max);
  const average = readNumber(
    heartRate.average,
    entry.averageHeartRate,
    entry.avgHeartRate,
    entry.average_bpm,
    entry.average
  );
  const caloriesBurned = readNumber(
    entry.caloriesBurned,
    entry.calories,
    entry.kcal
  );

  if (
    !date ||
    distance === undefined ||
    duration === undefined ||
    min === undefined ||
    max === undefined ||
    average === undefined ||
    caloriesBurned === undefined
  ) {
    return null;
  }

  return {
    date,
    distance,
    duration,
    heartRate: { min, max, average },
    caloriesBurned,
  };
}

function normalizeUserActivity(payload: unknown): UserActivity[] {
  const source = unwrapPayload(payload);

  if (!Array.isArray(source)) {
    return mockUserActivity;
  }

  const activity = source
    .map(normalizeActivityEntry)
    .filter((entry): entry is UserActivity => entry !== null);

  return activity.length > 0 ? activity : mockUserActivity;
}

function buildActivityWindow() {
  const endWeek = new Date().toISOString().split("T")[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60);

  return {
    startWeek: startDate.toISOString().split("T")[0],
    endWeek,
  };
}

function countRestDays(activity: UserActivity[]) {
  const dates = [...new Set(activity.map((item) => item.date))].sort();
  const first = dates[0] ? new Date(`${dates[0]}T12:00:00`) : null;
  const last = dates.at(-1) ? new Date(`${dates.at(-1)}T12:00:00`) : null;

  if (!first || !last) {
    return 0;
  }

  return Math.max(
    Math.round((last.getTime() - first.getTime()) / DAY_IN_MS) + 1 - dates.length,
    0
  );
}

// cette étape recalcule certaines stats si le profil ne les fournit pas
export function enrichUserInfoWithActivity(
  userInfo: UserInfo,
  activity: UserActivity[]
) {
  return {
    ...userInfo,
    statistics: {
      ...userInfo.statistics,
      caloriesBurned:
        readString(userInfo.statistics.caloriesBurned) ??
        `${activity.reduce((sum, item) => sum + item.caloriesBurned, 0)} cal`,
      restDays:
        readString(userInfo.statistics.restDays) ??
        `${countRestDays(activity)} jours`,
    },
  };
}

export async function getUserInfo(token: string) {
  // en mode mock on ignore totalement le backend
  if (USE_MOCK) {
    return mockUserInfo;
  }

  try {
    return normalizeUserInfo(await fetchUserInfo(token));
  } catch (error) {
    console.warn("API profil indisponible, utilisation des mocks.", error);
    return mockUserInfo;
  }
}

export async function getUserActivity(token: string) {
  // on limite la période pour éviter de charger trop d'historique
  if (USE_MOCK) {
    return mockUserActivity;
  }

  const { startWeek, endWeek } = buildActivityWindow();

  try {
    return normalizeUserActivity(
      await fetchUserActivity(token, startWeek, endWeek)
    );
  } catch (error) {
    console.warn("API activité indisponible, utilisation des mocks.", error);
    return mockUserActivity;
  }
}
