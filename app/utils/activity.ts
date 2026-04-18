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

function toNumber(value: unknown) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function parseActivityDate(dateString: string) {
  if (dateString.includes("T")) {
    return new Date(dateString);
  }

  return new Date(`${dateString}T12:00:00Z`);
}

function toActivityDateString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
}

function capitalizeLabel(label: string) {
  if (!label) {
    return "";
  }

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function shouldShowYearForDate(dateString: string) {
  return parseActivityDate(dateString).getUTCFullYear() !== new Date().getUTCFullYear();
}

export function formatShortActivityDate(dateString: string, includeYear?: boolean) {
  return parseActivityDate(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: includeYear ? "numeric" : undefined,
  });
}

export function formatTooltipActivityDate(dateString: string) {
  return parseActivityDate(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatActivityPeriod(startDate: string, endDate: string) {
  const startYear = parseActivityDate(startDate).getUTCFullYear();
  const endYear = parseActivityDate(endDate).getUTCFullYear();
  const includeYear =
    startYear !== endYear ||
    shouldShowYearForDate(startDate) ||
    shouldShowYearForDate(endDate);

  return `${formatShortActivityDate(startDate, includeYear)} - ${formatShortActivityDate(endDate, includeYear)}`;
}

export function formatTooltipActivityPeriod(startDate: string, endDate: string) {
  if (startDate === endDate) {
    return formatTooltipActivityDate(startDate);
  }

  return `${formatTooltipActivityDate(startDate)} - ${formatTooltipActivityDate(endDate)}`;
}

export function formatActivityDayLabel(dateString: string) {
  const weekdayLabel = parseActivityDate(dateString)
    .toLocaleDateString("fr-FR", { weekday: "short" })
    .replace(".", "");

  return capitalizeLabel(weekdayLabel.slice(0, 3));
}

export function sortActivitiesByDate(activities: UserActivity[]) {
  return [...activities].sort(
    (left, right) =>
      parseActivityDate(left.date).getTime() -
      parseActivityDate(right.date).getTime()
  );
}

function sortRunningDataByDate(runningData: WeeklyDistancePoint[]) {
  return [...runningData].sort(
    (left, right) =>
      parseActivityDate(left.startDate).getTime() -
      parseActivityDate(right.startDate).getTime()
  );
}

function looksLikeActivityEntry(activity: any) {
  return Boolean(
    activity &&
    typeof activity === "object" &&
    (activity.heartRate ||
      activity.heart_rate ||
      activity.duration != null ||
      activity.caloriesBurned != null ||
      activity.calories_burned != null)
  );
}

function looksLikeWeeklyDistanceEntry(entry: any) {
  return Boolean(
    entry &&
    typeof entry === "object" &&
    !looksLikeActivityEntry(entry) &&
    (
      entry.startDate ||
      entry.weekStart ||
      entry.startWeek ||
      entry.endDate ||
      entry.weekEnd ||
      entry.endWeek ||
      entry.from ||
      entry.to
    )
  );
}

function extractActivitiesSource(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data.some(looksLikeActivityEntry) ? data : [];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const source = data as Record<string, unknown>;
  const candidates = [
    source.runningData,
    source.running_data,
    source.activities,
    source.activity,
    source.sessions,
    source.userActivity,
    source.activityData,
    source.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.some(looksLikeActivityEntry)) {
      return candidate;
    }
  }

  return [];
}

function extractRunningDataSource(data: unknown): unknown[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const source = data as Record<string, unknown>;
  const candidates = [
    source.runningData,
    source.running_data,
    source.weeklyRunningData,
    source.weeklyDistance,
    source.weeklyDistanceData,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      if (!candidate.some(looksLikeWeeklyDistanceEntry)) {
        continue;
      }

      return candidate;
    }
  }

  return [];
}

function getWeekKey(dateString: string) {
  const date = parseActivityDate(dateString);
  const dayOfWeek = date.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  date.setUTCDate(date.getUTCDate() + diffToMonday);

  return date.toISOString().slice(0, 10);
}

export function getLatestWeekActivities(activities: UserActivity[]) {
  const sortedActivities = sortActivitiesByDate(activities);
  const latestActivity = sortedActivities[sortedActivities.length - 1];

  if (!latestActivity) {
    return [];
  }

  const latestWeekKey = getWeekKey(latestActivity.date);

  return sortedActivities.filter(
    (activity) => getWeekKey(activity.date) === latestWeekKey
  );
}

export function normalizeActivities(data: unknown): UserActivity[] {
  const activitiesSource = extractActivitiesSource(data);

  if (!Array.isArray(activitiesSource)) {
    return [];
  }

  const normalizedActivities = activitiesSource
    .map((activity: any) => ({
      date: toActivityDateString(
        activity?.date ??
        activity?.sessionDate ??
        activity?.performedAt
      ),
      distance: toNumber(
        activity?.distance ??
        activity?.totalDistance ??
        activity?.km
      ),
      duration: toNumber(activity?.duration),
      heartRate: {
        min: toNumber(
          activity?.heartRate?.min ??
          activity?.heart_rate?.min ??
          activity?.minBpm ??
          activity?.min_bpm
        ),
        max: toNumber(
          activity?.heartRate?.max ??
          activity?.heart_rate?.max ??
          activity?.maxBpm ??
          activity?.max_bpm
        ),
        average: toNumber(
          activity?.heartRate?.average ??
          activity?.heart_rate?.average ??
          activity?.averageBpm ??
          activity?.average_bpm
        ),
      },
      caloriesBurned: toNumber(
        activity?.caloriesBurned ??
        activity?.calories_burned
      ),
    }))
    .filter((activity) => activity.date);

  return sortActivitiesByDate(normalizedActivities);
}

export function normalizeRunningData(data: unknown): WeeklyDistancePoint[] {
  const runningDataSource = extractRunningDataSource(data);

  if (!Array.isArray(runningDataSource)) {
    return [];
  }

  const normalizedRunningData = runningDataSource
    .map((item: any) => {
      const startDate = toActivityDateString(
        item?.startDate ??
        item?.weekStart ??
        item?.startWeek ??
        item?.from
      );
      const endDate = toActivityDateString(
        item?.endDate ??
        item?.weekEnd ??
        item?.endWeek ??
        item?.to ??
        startDate
      );

      return {
        distance: toNumber(
          item?.distance ??
          item?.totalDistance ??
          item?.km ??
          item?.kilometers
        ),
        startDate,
        endDate: endDate || startDate,
      };
    })
    .filter((item) => item.startDate);

  return sortRunningDataByDate(normalizedRunningData);
}

export function getWeeklyDistanceData(activities: UserActivity[]): WeeklyDistancePoint[] {
  const weeklyData = new Map<
    string,
    { distance: number; startDate: string; endDate: string }
  >();

  for (const activity of sortActivitiesByDate(activities)) {
    const weekKey = getWeekKey(activity.date);
    const currentWeek = weeklyData.get(weekKey);

    if (!currentWeek) {
      weeklyData.set(weekKey, {
        distance: activity.distance,
        startDate: activity.date,
        endDate: activity.date,
      });
      continue;
    }

    currentWeek.distance += activity.distance;
    currentWeek.endDate = activity.date;
  }

  return Array.from(weeklyData.values()).map((week) => ({
    distance: Number(week.distance.toFixed(1)),
    startDate: week.startDate,
    endDate: week.endDate,
  }));
}

export function normalizeActivityResponse(data: unknown): UserActivityResponse {
  const activities = normalizeActivities(data);

  return {
    activities,
    runningData: getWeeklyDistanceData(activities),
  };
}