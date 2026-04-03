import { Athlete } from '../types';

export const INITIAL_ATHLETES: Athlete[] = [
  {
    id: '1',
    name: 'Iqbal Firdaus',
    stravaNames: ['Ball Fs', 'Iqbal Firdaus'],
    weeklyData: { P1: 17.7, P2: 20.6, P3: 16.1, P4: 51.9, P5: 12.6, P6: 65.1 },
    total: 184.0, // Simplified total for mock
  },
  {
    id: '2',
    name: 'WS 01',
    stravaNames: ['WS 01'],
    weeklyData: { P1: 19.4, P2: 13, P3: 17, P4: 18.6, P5: 10.2, P6: 42 },
    total: 120.2,
  },
  {
    id: '3',
    name: 'Ham Dan',
    stravaNames: ['Ham Dan'],
    weeklyData: { P1: 26, P2: 11.2, P3: 10.5, P4: 13.8, P5: 10, P6: 46.3 },
    total: 117.8,
  },
  {
    id: '4',
    name: 'Om Tono',
    stravaNames: ['Om Tono'],
    weeklyData: { P1: 26.7, P2: 10.3, P3: 22.1, P4: 18.8, P5: 12.7, P6: 17.5 },
    total: 108.1,
  },
  {
    id: '5',
    name: 'Za Piza',
    stravaNames: ['Za Piza'],
    weeklyData: { P1: 10.3, P2: 10.3, P3: 10.9, P4: 30.2, P5: 11.9, P6: 13.6 },
    total: 87.2,
  },
  {
    id: '6',
    name: 'AQ 93',
    stravaNames: ['AQ 93'],
    weeklyData: { P1: 7.4, P2: 10.1, P3: 30.4, P4: 22.4, P5: 3.9, P6: 8.2 },
    total: 82.4,
  },
  {
    id: '7',
    name: 'Don Doni',
    stravaNames: ['Don Doni'],
    weeklyData: { P1: 22.3, P2: 15.8, P3: 11.2, P4: 15.4, P5: 11.7, P6: 14.8 },
    total: 91.2,
  },
  {
    id: '8',
    name: 'Da Dan',
    stravaNames: ['Da Dan'],
    weeklyData: { P1: 13.4, P2: 11.5, P3: 15.7, P4: 14.2, P5: 15, P6: 14.5 },
    total: 84.3,
  },
  {
    id: '9',
    name: 'Itsna',
    stravaNames: ['Itsna Okta', 'Itsna'],
    weeklyData: { P1: 0, P2: 0, P3: 7.2, P4: 17.4, P5: 10.1, P6: 7.8 },
    total: 42.5,
  },
  {
    id: '10',
    name: 'Iraa a',
    stravaNames: ['Iraa a'],
    weeklyData: { P1: 28.5, P2: 1.2, P3: 0, P4: 3.2, P5: 0, P6: 0 },
    total: 32.9,
  },
  {
    id: '11',
    name: 'Ai Mulyanah',
    stravaNames: ['Ai Mulyanah'],
    weeklyData: { P1: 10.5, P2: 1.4, P3: 0, P4: 3.2, P5: 6.9, P6: 0 },
    total: 22.0,
  },
  {
    id: '12',
    name: 'naa lail',
    stravaNames: ['naa lail'],
    weeklyData: { P1: 5, P2: 1.6, P3: 1.6, P4: 6.3, P5: 2.5, P6: 4.3 },
    total: 21.3,
  },
  {
    id: '13',
    name: 'Ihsan',
    stravaNames: ['Ihsan Muttaqi', 'Ihsan'],
    weeklyData: { P1: 0, P2: 10.4, P3: 10.1, P4: 11.1, P5: 2.5, P6: 13.6 },
    total: 47.7,
  }
];

export const calculateTotal = (weeklyData: Record<string, number>) => {
  return Object.values(weeklyData).reduce((sum, val) => sum + val, 0);
};

// Recalculate totals for initial data to be accurate
INITIAL_ATHLETES.forEach(athlete => {
  athlete.total = calculateTotal(athlete.weeklyData);
});
