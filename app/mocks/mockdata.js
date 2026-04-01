import profilePicture from "../img/Background_picture_sportsee.png";

export const mockUserInfo = {
  profile: {
    firstName: "Nina",
    lastName: "Moreau",
    createdAt: "3 septembre 2023",
    age: 31,
    gender: "Femme",
    height: "1m72",
    weight: "61kg",
    profilePicture,
  },
  statistics: {
    totalDistance: "286 km",
    totalSessions: "36 sessions",
    totalDuration: "24h 40min",
    caloriesBurned: "21400 cal",
    restDays: "11 jours",
  },
};

export const mockUserActivity = [
    {
        date: "2025-02-12",
        distance: 4.2,
        duration: 28,
        heartRate: { min: 135, max: 170, average: 155 },
        caloriesBurned: 300
    },
    {
        date: "2025-02-14",
        distance: 6.1,
        duration: 40,
        heartRate: { min: 138, max: 175, average: 160 },
        caloriesBurned: 430
    },
    {
        date: "2025-02-18",
        distance: 5.5,
        duration: 36,
        heartRate: { min: 140, max: 178, average: 162 },
        caloriesBurned: 390
    },
    {
        date: "2025-02-22",
        distance: 7.3,
        duration: 48,
        heartRate: { min: 137, max: 176, average: 159 },
        caloriesBurned: 520
    },
    {
        date: "2025-02-25",
        distance: 3.9,
        duration: 25,
        heartRate: { min: 142, max: 180, average: 166 },
        caloriesBurned: 280
    },
    {
        date: "2025-03-02",
        distance: 8.1,
        duration: 52,
        heartRate: { min: 136, max: 174, average: 158 },
        caloriesBurned: 560
    },
    {
        date: "2025-03-05",
        distance: 4.7,
        duration: 30,
        heartRate: { min: 143, max: 179, average: 167 },
        caloriesBurned: 340
    },
{
        date: "2025-03-09",
        distance: 9.4,
        duration: 60,
        heartRate: { min: 135, max: 176, average: 157 },
        caloriesBurned: 650
    },
    {
        date: "2025-03-12",
        distance: 5.8,
        duration: 38,
        heartRate: { min: 141, max: 178, average: 164 },
        caloriesBurned: 410
    },
    {
        date: "2025-03-16",
        distance: 6.6,
        duration: 43,
        heartRate: { min: 139, max: 175, average: 161 },
        caloriesBurned: 470
    }
];