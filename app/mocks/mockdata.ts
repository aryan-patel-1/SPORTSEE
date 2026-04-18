export type UserProfile = {
  firstName: string;
  lastName: string;
  createdAt: string;
  age: number;
  weight: number;
  height: number;
  profilePicture: string;
};

export type UserStatistics = {
  totalDistance: number;
  totalSessions: number;
  totalDuration: number;
};

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

export const mockUserInfo: {
  profile: UserProfile;
  statistics: UserStatistics;
} = {
  profile: {
    firstName: "Ines",
    lastName: "Dubois",
    createdAt: "2025-02-10",
    age: 28,
    weight: 72,
    height: 178,
    profilePicture: "http://localhost:8000/images/sophie.jpg",
  },
  statistics: {
    totalDistance: 61.6,
    totalSessions: 10,
    totalDuration: 400,
  },
};

export const mockUserActivity: UserActivity[] = [
  {
    date: "2025-02-12",
    distance: 4.2,
    duration: 28,
    heartRate: { min: 135, max: 170, average: 155 },
    caloriesBurned: 300,
  },
  {
    date: "2025-02-14",
    distance: 6.1,
    duration: 40,
    heartRate: { min: 138, max: 175, average: 160 },
    caloriesBurned: 430,
  },
  {
    date: "2025-02-18",
    distance: 5.5,
    duration: 36,
    heartRate: { min: 140, max: 178, average: 162 },
    caloriesBurned: 390,
  },
  {
    date: "2025-02-22",
    distance: 7.3,
    duration: 48,
    heartRate: { min: 137, max: 176, average: 159 },
    caloriesBurned: 520,
  },
  {
    date: "2025-02-25",
    distance: 3.9,
    duration: 25,
    heartRate: { min: 142, max: 180, average: 166 },
    caloriesBurned: 280,
  },
  {
    date: "2025-03-02",
    distance: 8.1,
    duration: 52,
    heartRate: { min: 136, max: 174, average: 158 },
    caloriesBurned: 560,
  },
  {
    date: "2025-03-05",
    distance: 4.7,
    duration: 30,
    heartRate: { min: 143, max: 179, average: 167 },
    caloriesBurned: 340,
  },
  {
    date: "2025-03-09",
    distance: 9.4,
    duration: 60,
    heartRate: { min: 135, max: 176, average: 157 },
    caloriesBurned: 650,
  },
  {
    date: "2025-03-12",
    distance: 5.8,
    duration: 38,
    heartRate: { min: 141, max: 178, average: 164 },
    caloriesBurned: 410,
  },
  {
    date: "2025-03-16",
    distance: 6.6,
    duration: 43,
    heartRate: { min: 139, max: 175, average: 161 },
    caloriesBurned: 470,
  },
];