import { mockUserInfo, mockUserActivity } from "../mocks/mockdata";
import { fetchUserInfo, fetchUserActivity, fetchUserGoal } from "./api";
import { getWeeklyDistanceData } from "../utils/activity";

// Mettre à true pour utiliser les données de test sans backend.
const USE_MOCK = false;

// Retourne une date 5 ans dans le futur, utilisée comme borne haute pour les requêtes d'activité.
export function getFutureActivityEndDate(yearsAhead = 5) {
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + yearsAhead);
  return endDate.toISOString().split("T")[0];
}

export async function getUserInfo(token: string) {
  if (USE_MOCK) return mockUserInfo;
  return fetchUserInfo(token);
}

export async function getUserGoal(token: string) {
  if (USE_MOCK) return 6;
  return fetchUserGoal(token);
}

export async function getUserActivity(token: string, startWeek?: string, endWeek?: string) {
  if (USE_MOCK) {
    return {
      activities: mockUserActivity,
      runningData: getWeeklyDistanceData(mockUserActivity),
    };
  }

  return fetchUserActivity(
    token,
    startWeek ?? "2000-01-01",
    endWeek ?? getFutureActivityEndDate()
  );
}