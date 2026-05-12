export type Athlete = {
  id: string;
  name: string;
  stravaNames: string[]; // Aliases used in Strava
  weeklyData: Record<string, number>; // e.g., { "P1": 17.7, "P2": 20.6 }
  total: number;
};

export type DailyRecap = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  exercise: string; // e.g., "Plank 2 Menit"
};
