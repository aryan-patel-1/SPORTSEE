// Centralise la transformation des données brutes (API / mocks) en données prêtes
// à l'affichage. Les composants se contentent de rendre ce que ces fonctions
// renvoient et ne calculent plus de totaux ou de libellés eux-mêmes.

import {
  formatActivityPeriod,
  formatLongActivityDate,
  formatTooltipActivityDate,
  formatTooltipActivityPeriod,
  getLatestWeekActivities,
  sortActivitiesByDate,
  type UserActivity,
  type WeeklyDistancePoint,
} from "./date";

// ---------- ProfileBanner ----------

export type ProfileBannerData = {
  profile: {
    firstName: string;
    lastName: string;
    createdAt: string;
    profilePicture: string;
  };
  statistics: {
    totalDistance: number;
  };
};

export type ProfileBannerViewModel = {
  fullName: string;
  profilePicture: string;
  memberSinceLabel: string;
  totalDistanceLabel: string;
};

export function getProfileBannerViewModel(data: ProfileBannerData): ProfileBannerViewModel {
  const { profile, statistics } = data;
  return {
    fullName: `${profile.firstName} ${profile.lastName}`,
    profilePicture: profile.profilePicture,
    memberSinceLabel: `Membre depuis le ${formatLongActivityDate(profile.createdAt)}`,
    totalDistanceLabel: `${Math.round(statistics.totalDistance)} km`,
  };
}

// ---------- WeeklyStats ----------

export type WeeklyStatsViewModel = {
  goal: number;
  completed: number;
  completedLabel: string;
  remainingLabel: string;
  chartData: Array<{ name: string; value: number; fill: string }>;
  totalDurationLabel: string;
  totalDistanceLabel: string;
  periodLabel: string;
};

function pluralize(count: number, label: string) {
  return `${count} ${label}${count > 1 ? "s" : ""}`;
}

export function getWeeklyStatsViewModel(
  activities: UserActivity[],
  goal: number
): WeeklyStatsViewModel {
  const latest = getLatestWeekActivities(activities);
  const completed = latest.length;
  const remaining = Math.max(0, goal - completed);

  const totalDuration = latest.reduce((acc, a) => acc + a.duration, 0);
  const totalDistance = latest.reduce((acc, a) => acc + a.distance, 0);

  const startDate = latest[0]?.date;
  const endDate = latest.at(-1)?.date;
  const periodLabel =
    startDate && endDate
      ? `Du ${formatActivityPeriod(startDate, endDate)}`
      : "Aucune activité récente";

  return {
    goal,
    completed,
    completedLabel: pluralize(completed, "réalisée"),
    remainingLabel: pluralize(remaining, "restante"),
    chartData: [
      { name: "réalisées", value: completed, fill: "#1f38ff" },
      { name: "restantes", value: remaining, fill: "#d6d9f5" },
    ],
    totalDurationLabel: `${totalDuration} minutes`,
    totalDistanceLabel: `${totalDistance.toFixed(1)} kilomètres`,
    periodLabel,
  };
}

// ---------- DistanceCard ----------

const WEEKS_PER_DISTANCE_PAGE = 4;

export type DistanceChartPoint = {
  week: string;
  distance: number;
  tooltipPeriodLabel: string;
  distanceLabel: string;
};

export type DistancePage = {
  chartData: DistanceChartPoint[];
  averageDistanceLabel: string;
  periodLabel: string;
};

// Découpe le cumul hebdomadaire en pages de 4 semaines, déjà formatées.
// La première page peut être plus courte pour que la dernière soit toujours pleine.
export function buildDistancePages(runningData: WeeklyDistancePoint[]): DistancePage[] {
  if (runningData.length === 0) {
    return [{ chartData: [], averageDistanceLabel: "0km", periodLabel: "Aucune donnée" }];
  }

  const slices: WeeklyDistancePoint[][] = [];
  const offset = runningData.length % WEEKS_PER_DISTANCE_PAGE;
  if (offset > 0) slices.push(runningData.slice(0, offset));
  for (let i = offset; i < runningData.length; i += WEEKS_PER_DISTANCE_PAGE) {
    slices.push(runningData.slice(i, i + WEEKS_PER_DISTANCE_PAGE));
  }

  return slices.map((weeks) => {
    const chartData: DistanceChartPoint[] = weeks.map((w, i) => ({
      week: `S${i + 1}`,
      distance: w.distance,
      tooltipPeriodLabel: formatTooltipActivityPeriod(w.startDate, w.endDate),
      // virgule à la place du point pour le format français
      distanceLabel: `${w.distance.toFixed(1).replace(".", ",")} km`,
    }));

    const total = chartData.reduce((acc, w) => acc + w.distance, 0);
    const average = chartData.length ? total / chartData.length : 0;

    const startDate = weeks[0]?.startDate;
    const endDate = weeks.at(-1)?.endDate;
    const periodLabel =
      startDate && endDate ? formatActivityPeriod(startDate, endDate) : "Aucune donnée";

    return {
      chartData,
      averageDistanceLabel: `${Math.round(average)}km`,
      periodLabel,
    };
  });
}

// ---------- BpmCard ----------

const ACTIVITIES_PER_BPM_PAGE = 7;
const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export type BpmChartPoint = {
  day: string;
  min: number;
  max: number;
  average: number;
  tooltipDateLabel: string;
};

export type BpmPage = {
  chartData: BpmChartPoint[];
  averageBpmLabel: string;
  periodLabel: string;
};

export function buildBpmPages(activities: UserActivity[]): BpmPage[] {
  const sorted = sortActivitiesByDate(activities);
  if (sorted.length === 0) {
    return [{ chartData: [], averageBpmLabel: "0 BPM", periodLabel: "Aucune donnée" }];
  }

  const pages: BpmPage[] = [];
  for (let i = 0; i < sorted.length; i += ACTIVITIES_PER_BPM_PAGE) {
    const slice = sorted.slice(i, i + ACTIVITIES_PER_BPM_PAGE);
    const chartData: BpmChartPoint[] = slice.map((a, idx) => ({
      day: DAY_LABELS[idx % DAY_LABELS.length],
      min: a.heartRate.min,
      max: a.heartRate.max,
      average: a.heartRate.average,
      tooltipDateLabel: formatTooltipActivityDate(a.date),
    }));

    const average = chartData.length
      ? chartData.reduce((acc, d) => acc + d.average, 0) / chartData.length
      : 0;

    const periodLabel = slice.length
      ? formatActivityPeriod(slice[0].date, slice.at(-1)!.date)
      : "Aucune donnée";

    pages.push({
      chartData,
      averageBpmLabel: `${Math.round(average)} BPM`,
      periodLabel,
    });
  }

  return pages;
}

// ---------- Page Profil ----------

type StatLabel = { main: string; unit: string };

export type ProfileViewModel = {
  fullName: string;
  profilePicture: string;
  memberSinceLabel: string;
  age: string;
  genderLabel: string;
  heightLabel: string;
  weightLabel: string;
  statsSubtitle: string;
  totalDuration: StatLabel;
  totalCalories: StatLabel;
  totalDistance: StatLabel;
  totalRestDays: StatLabel;
  totalSessions: StatLabel;
};

function formatGenderLabel(gender: unknown) {
  if (gender === "male") return "Homme";
  if (gender === "female") return "Femme";
  return "Non renseigné";
}

function formatHeightLabel(height: unknown) {
  const value = Number(height);
  if (!Number.isFinite(value) || value <= 0) return "Non renseignée";
  // l'API renvoie parfois en mètres (1.78), parfois en cm (178)
  const cm = Math.round(value >= 3 ? value : value * 100);
  return `${Math.floor(cm / 100)}m${String(cm % 100).padStart(2, "0")}`;
}

function getRestDaysCount(activity: UserActivity[], startDate: string | null | undefined) {
  if (!startDate) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const oneDayMs = 24 * 60 * 60 * 1000;
  const totalDays =
    Math.floor((Date.parse(today) - Date.parse(startDate)) / oneDayMs) + 1;

  const activeDays = new Set(
    activity
      .filter((item) => item.date >= startDate && item.date <= today)
      .map((item) => item.date)
  ).size;

  return Math.max(0, totalDays - activeDays);
}

export function getProfileViewModel(userInfo: any, activity: UserActivity[]): ProfileViewModel {
  const profile = userInfo?.profile ?? {};
  const statistics = userInfo?.statistics ?? {};

  // recalcul local utilisé en repli si l'API n'envoie pas les totaux
  const totals = activity.reduce(
    (acc, item) => ({
      calories: acc.calories + item.caloriesBurned,
      distance: acc.distance + item.distance,
      duration: acc.duration + item.duration,
    }),
    { calories: 0, distance: 0, duration: 0 }
  );

  const totalCalories = statistics.totalCalories ?? totals.calories;
  const totalDistance = statistics.totalDistance ?? totals.distance;
  const totalDuration = statistics.totalDuration ?? totals.duration;
  const totalSessions = statistics.totalSessions ?? activity.length;
  const totalRestDays = getRestDaysCount(activity, profile.createdAt);

  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");

  return {
    fullName,
    profilePicture: profile.profilePicture ?? "",
    memberSinceLabel: profile.createdAt
      ? `Membre depuis le ${formatLongActivityDate(profile.createdAt)}`
      : "Membre",
    age: profile.age != null ? String(profile.age) : "Non renseigné",
    genderLabel: formatGenderLabel(profile.gender),
    heightLabel: formatHeightLabel(profile.height),
    weightLabel:
      profile.weight != null && profile.weight !== ""
        ? `${profile.weight} kg`
        : "Non renseigné",
    statsSubtitle: profile.createdAt
      ? `depuis le ${formatLongActivityDate(profile.createdAt)}`
      : "",
    totalDuration: { main: `${hours}h`, unit: `${minutes}min` },
    totalCalories: { main: String(totalCalories), unit: "cal" },
    totalDistance: { main: String(Math.round(totalDistance)), unit: "km" },
    totalRestDays: { main: String(totalRestDays), unit: "jours" },
    totalSessions: { main: String(totalSessions), unit: "sessions" },
  };
}