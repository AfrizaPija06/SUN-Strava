export type Athlete = {
  id: string;
  name: string;
  stravaNames: string[]; // Aliases used in Strava
  weeklyData: Record<string, number>; // e.g., { "P1": 17.7, "P2": 20.6 }
  total: number;
};

export type StravaRecord = {
  stravaName: string;
  distance: number;
};
