// EOSCRMS — Ethiopian Athletics Federation Registry
// NOTE: name, dob are fetched from Fayda API — not entered manually

import type { Club, Athlete, Transfer } from '../types';

export const MOCK_CLUBS: Club[] = [];

// Athletes — name/dob sourced from Fayda; all other fields are sports-specific
export const MOCK_ATHLETES: Athlete[] = [];

export const MOCK_TRANSFERS: Transfer[] = [];

export const MOCK_MEETS = [
  {
    id: "MEET-2026-01",
    title: "Addis Ababa International Multi-Sport Grand Prix 2026 (አዲስ አበባ ግራንድ ፕሪ)",
    venue: "Addis Ababa National Stadium (አዲስ አበባ ስታዲየም)",
    date: "August 12-14, 2026",
    status: "REGISTRATION_OPEN",
    disciplines: ["100m Sprint", "5,000m", "10,000m", "800m", "1,500m", "3,000m Steeplechase", "Marathon", "Discus Throw", "Long Jump"],
    enrolledClubsCount: 18,
    totalAthletesEnrolled: 240,
    geofenceCoordinates: { lat: 9.0108, lng: 38.7612, radiusMeters: 500 },
    bannerUrl: "/images/banner_grand_prix.png",
    enrolledAthletes: [] as string[]
  },
  {
    id: "MEET-2026-02",
    title: "Ethiopian National Youth Olympic Games U18 / U20",
    venue: "Hawassa International Stadium & Aquatics Center",
    date: "September 05-08, 2026",
    status: "REGISTRATION_OPEN",
    disciplines: ["100m Sprint", "800m", "1,500m", "5,000m", "3,000m Steeplechase", "High Jump", "Long Jump"],
    enrolledClubsCount: 24,
    totalAthletesEnrolled: 310,
    geofenceCoordinates: { lat: 7.0621, lng: 38.4764, radiusMeters: 600 },
    bannerUrl: "/images/banner_youth_games.png",
    enrolledAthletes: [] as string[]
  },
  {
    id: "MEET-2026-03",
    title: "Jan Meda National Cross-Country Olympic Trials",
    venue: "Jan Meda Race Course, Addis Ababa",
    date: "October 20, 2026",
    status: "UPCOMING",
    disciplines: ["10km Senior Men", "10km Senior Women", "8km U20 Men", "6km U18 Mixed"],
    enrolledClubsCount: 12,
    totalAthletesEnrolled: 180,
    geofenceCoordinates: { lat: 9.0380, lng: 38.7710, radiusMeters: 800 },
    bannerUrl: "/images/banner_jan_meda.png",
    enrolledAthletes: [] as string[]
  }
];

export const MOCK_NEWS = [
  {
    id: "NEWS-001",
    category: "FEDERATION",
    title: "EAF Announces 2026 National Championship Calendar",
    summary: "The Ethiopian Athletics Federation has published the full calendar for the 2026 National Championship season, covering track, road, and cross-country events across all regions.",
    date: "July 25, 2026",
    imageUrl: "https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800&auto=format&fit=crop&q=80",
    tag: "Official Announcement"
  },
  {
    id: "NEWS-002",
    category: "ATHLETE",
    title: "Tigist Bekele Breaks U20 800m National Record in Hawassa",
    summary: "Defense AC's Tigist Bekele smashed the U20 national 800m record with a stunning 1:57.20 at the Hawassa Open, qualifying her for the African Junior Championships.",
    date: "July 20, 2026",
    imageUrl: "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&auto=format&fit=crop&q=80",
    tag: "Record Broken"
  },
  {
    id: "NEWS-003",
    category: "COMPETITION",
    title: "Jan Meda Cross-Country Trials: Entry Deadline Approaching",
    summary: "Clubs have until August 30 to submit entries for the Jan Meda National Cross-Country Olympic Trials. The event will serve as the primary qualifier for the World Cross-Country Championships.",
    date: "July 18, 2026",
    imageUrl: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&auto=format&fit=crop&q=80",
    tag: "Deadline Alert"
  },
  {
    id: "NEWS-004",
    category: "ATHLETE",
    title: "Haile Demisse Selected for World Athletics Continental Tour",
    summary: "Defense AC long-distance star Haile Demisse Tadesse has been named in the Ethiopian team for the World Athletics Continental Tour Gold meeting in Brussels.",
    date: "July 14, 2026",
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80",
    tag: "Team Selection"
  },
  {
    id: "NEWS-005",
    category: "FEDERATION",
    title: "Fayda ID Integration Now Mandatory for All Club Registrations",
    summary: "Effective August 1, 2026, all new athlete registrations must be completed through the Fayda National ID API. Secondary documents remain required for U16 and U18 athletes.",
    date: "July 10, 2026",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=80",
    tag: "Policy Update"
  },
  {
    id: "NEWS-006",
    category: "COMPETITION",
    title: "Grand Prix 2026 Draw: Heat Assignments Released",
    summary: "The official heat assignments for the Addis Ababa International Grand Prix 2026 have been published. Athletes can view their lane draws and check-in times via the Athlete Portal.",
    date: "July 8, 2026",
    imageUrl: "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800&auto=format&fit=crop&q=80",
    tag: "Competition Update"
  }
];

export const MEET_META: Record<string, { title: string; date: string; venue: string }> = {
  "MEET-2026-01": {
    title: "Addis Ababa International Grand Prix 2026",
    date: "August 12–14, 2026",
    venue: "Addis Ababa National Stadium"
  },
  "MEET-2026-02": {
    title: "Ethiopian National Youth Olympic Games U18/U20",
    date: "September 5–8, 2026",
    venue: "Hawassa International Stadium"
  },
  "MEET-2026-03": {
    title: "Jan Meda National Cross-Country Trials",
    date: "October 20, 2026",
    venue: "Jan Meda Race Course, Addis Ababa"
  }
};

export const MOCK_EVENT_RESULTS: Record<string, Array<{ discipline: string; results: Array<{ pos: number; athleteName: string; club: string; time: string; pb: boolean; sb: boolean; nat: string; }> }>> = {};

export const MOCK_LIVE_SPLITS = [
  { distance: "1,000m",    splitTime: "2:33.40",  pace: "2:33/km", position: 1, leaderGap: "0.00s" },
  { distance: "2,000m",    splitTime: "5:08.12",  pace: "2:34/km", position: 1, leaderGap: "0.00s" },
  { distance: "3,000m",    splitTime: "7:44.90",  pace: "2:36/km", position: 2, leaderGap: "+0.34s" },
  { distance: "4,000m",    splitTime: "10:20.15", pace: "2:35/km", position: 1, leaderGap: "0.00s" },
  { distance: "5,000m Final", splitTime: "12:54.10", pace: "2:34/km", position: 1, leaderGap: "0.00s (GOLD)" }
];
