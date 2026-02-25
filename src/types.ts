export interface Starch {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
}

export interface Region {
  name: string;
  seeds: (string | null)[]; // starchId for seeds 1-16
}

export interface TournamentConfig {
  name: string;
  createdAt: string;
  starches: Starch[];
  regions: Region[];
}

// Standard March Madness first-round matchup order by seed
// Each pair represents a first-round game
export const MATCHUP_ORDER: [number, number][] = [
  [1, 16],
  [8, 9],
  [5, 12],
  [4, 13],
  [6, 11],
  [3, 14],
  [7, 10],
  [2, 15],
];

export const REGION_NAMES = ["Grain", "Tuber", "Noodle", "Dough"];
