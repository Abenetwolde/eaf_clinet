// EOSCRMS — Ethiopian Athletics Federation Registry
// NOTE: name, dob are fetched from Fayda API — not entered manually

import type { Club, Athlete, Transfer } from '../types';

export const MOCK_CLUBS: Club[] = [
  {
    id: "CLUB-001",
    name: "Defense Athletics Club (መከላከያ ስፖርት ክለብ)",
    shortName: "Defense AC",
    region: "Addis Ababa / Federal",
    manager: "Col. Tadesse Worku",
    email: "admin@defense-athletics.et",
    phone: "+251 91 123 4567",
    licensedAthletes: 28,
    pendingVerifications: 2,
    unlicensedAthletes: 1,
    transfersCount: 3,
    logo: "🛡️",
    clubRank: 1,
    totalPoints: 1420
  },
  {
    id: "CLUB-002",
    name: "Oromia Police Sports Club (ኦሮሚያ ፖሊስ)",
    shortName: "Oromia Police SC",
    region: "Oromia Region",
    manager: "Commander Derartu Tulu",
    email: "contact@oromia-police-ac.et",
    phone: "+251 91 234 5678",
    licensedAthletes: 34,
    pendingVerifications: 1,
    unlicensedAthletes: 0,
    transfersCount: 2,
    logo: "🐆",
    clubRank: 2,
    totalPoints: 1290
  },
  {
    id: "CLUB-003",
    name: "Sidama Coffee Athletics Club (ሲዳማ ቡና)",
    shortName: "Sidama Coffee AC",
    region: "Sidama Region",
    manager: "Ato Million Wolde",
    email: "info@sidamacoffee-ac.et",
    phone: "+251 91 345 6789",
    licensedAthletes: 22,
    pendingVerifications: 3,
    unlicensedAthletes: 2,
    transfersCount: 1,
    logo: "☕",
    clubRank: 3,
    totalPoints: 980
  },
  {
    id: "CLUB-004",
    name: "Commercial Bank of Ethiopia AC (ኢትዮጵያ ንግድ ባንክ)",
    shortName: "CBE AC",
    region: "Addis Ababa",
    manager: "Wzo. Firehiwot Goshu",
    email: "sports@cbe.com.et",
    phone: "+251 91 456 7890",
    licensedAthletes: 30,
    pendingVerifications: 0,
    unlicensedAthletes: 0,
    transfersCount: 4,
    logo: "🏦",
    clubRank: 4,
    totalPoints: 940
  }
];

// Athletes — name/dob sourced from Fayda; all other fields are sports-specific
export const MOCK_ATHLETES: Athlete[] = [
  {
    id: "ATH-2026-001",
    name: "Haile Demisse Tadesse",
    amharicName: "ኃይሌ ደሚሴ ታደሰ",
    dob: "2002-04-12",
    gender: "Male",
    ageTier: "Senior",
    clubId: "CLUB-001",
    club: "Defense Athletics Club",
    faydaFin: "9840-3920-1124",
    faydaStatus: "VERIFIED",
    primaryEvent: "5,000m / 10,000m",
    licenseStatus: "ACTIVE",
    licenseNumber: "EAF-LIC-2026-8891",
    licenseExpiry: "2026-12-31",
    photoUrl: "/images/runner_marathon.png",
    checkinStatus: "NOT_CHECKED_IN",
    weight: 62,
    height: 175,
    personalBests: [
      { event: "5,000m",  mark: "12:51.44", date: "2025-07-14", venue: "Addis Ababa GP" },
      { event: "10,000m", mark: "26:58.20", date: "2025-04-10", venue: "National Championships" },
      { event: "3,000m",  mark: "7:32.10",  date: "2025-02-08", venue: "Indoor Meeting" }
    ],
    achievements: ["2025 Addis Ababa GP 5000m Gold", "2024 National Championship Silver"]
  },
  {
    id: "ATH-2026-002",
    name: "Tigist Bekele Abate",
    amharicName: "ትዕግስት በቀለ አባተ",
    dob: "2007-09-24",
    gender: "Female",
    ageTier: "U20",
    clubId: "CLUB-001",
    club: "Defense Athletics Club",
    faydaFin: "4412-8809-3321",
    faydaStatus: "VERIFIED",
    primaryEvent: "800m / 1,500m",
    licenseStatus: "ACTIVE",
    licenseNumber: "EAF-LIC-2026-9042",
    licenseExpiry: "2026-12-31",
    photoUrl: "/images/runner_female.png",
    checkinStatus: "CALLROOM_PRESENT",
    weight: 52,
    height: 163,
    personalBests: [
      { event: "800m",   mark: "1:57.20", date: "2025-08-20", venue: "African U20 Championships" },
      { event: "1,500m", mark: "4:02.45", date: "2025-09-05", venue: "Hawassa Open" }
    ],
    achievements: ["African U20 Championship Gold 2025"]
  },
  {
    id: "ATH-2026-003",
    name: "Abel Gemechu Desta",
    amharicName: "አቤል ገመቹ ደስታ",
    dob: "2009-11-05",
    gender: "Male",
    ageTier: "U18",
    clubId: "CLUB-001",
    club: "Defense Athletics Club",
    faydaFin: "7102-4911-5582",
    faydaStatus: "PENDING",
    primaryEvent: "1,500m / 3,000m Steeplechase",
    licenseStatus: "EXPIRED",
    licenseNumber: "EAF-LIC-2025-4100",
    licenseExpiry: "2025-12-31",
    photoUrl: "/images/runners_training.png",
    checkinStatus: "NOT_CHECKED_IN",
    weight: 54,
    height: 168,
    personalBests: [
      { event: "1,500m", mark: "3:38.10", date: "2025-11-10", venue: "Addis Youth Games" }
    ],
    achievements: []
  },
  {
    id: "ATH-2026-004",
    name: "Sifan Mengistu Wolde",
    amharicName: "ሲፋን መንግስቱ ወልዴ",
    dob: "2004-01-30",
    gender: "Female",
    ageTier: "Senior",
    clubId: "CLUB-002",
    club: "Oromia Police Sports Club",
    faydaFin: "6021-9983-4112",
    faydaStatus: "VERIFIED",
    primaryEvent: "10,000m / Marathon",
    licenseStatus: "ACTIVE",
    licenseNumber: "EAF-LIC-2026-1184",
    licenseExpiry: "2026-12-31",
    photoUrl: "/images/runner_female.png",
    checkinStatus: "GPS_VERIFIED",
    weight: 48,
    height: 160,
    personalBests: [
      { event: "10,000m", mark: "29:42.10", date: "2025-06-05", venue: "Ethiopian Olympic Trial" },
      { event: "Half Marathon", mark: "1:04:30", date: "2025-03-10", venue: "Hawassa Half" }
    ],
    achievements: ["2025 Ethiopian Olympic Trial Champion"]
  },
  {
    id: "ATH-2026-005",
    name: "Yobiel Samuel Kifle",
    amharicName: "ዮብኤል ሳሙኤል ክፍሌ",
    dob: "2011-03-18",
    gender: "Male",
    ageTier: "U16",
    clubId: "CLUB-003",
    club: "Sidama Coffee AC",
    faydaFin: "3091-7728-1194",
    faydaStatus: "PENDING",
    primaryEvent: "800m",
    licenseStatus: "NONE",
    licenseNumber: undefined,
    licenseExpiry: undefined,
    photoUrl: "/images/runner_marathon.png",
    checkinStatus: "NOT_CHECKED_IN",
    weight: 46,
    height: 158,
    personalBests: [
      { event: "800m", mark: "2:04.50", date: "2026-04-15", venue: "Sidama Regional Meet" }
    ],
    achievements: []
  }
];

export const MOCK_TRANSFERS: Transfer[] = [
  {
    id: "TR-2026-081",
    athleteId: "ATH-2026-001",
    athleteName: "Haile Demisse Tadesse",
    fromClubId: "CLUB-002",
    fromClubName: "Oromia Police SC",
    toClubId: "CLUB-001",
    toClubName: "Defense Athletics Club",
    status: "APPROVED",
    requestDate: "2026-06-01",
    reason: "Cross-club national elite transfer finalized. Licensing updated."
  },
  {
    id: "TR-2026-092",
    athleteId: "ATH-2026-004",
    athleteName: "Sifan Mengistu Wolde",
    fromClubId: "CLUB-003",
    fromClubName: "Sidama Coffee AC",
    toClubId: "CLUB-002",
    toClubName: "Oromia Police SC",
    status: "APPROVED",
    requestDate: "2026-05-15",
    reason: "Senior 10k specialist transfer agreement."
  },
  {
    id: "TR-2026-104",
    athleteId: "ATH-2026-003",
    athleteName: "Abel Gemechu Desta",
    fromClubId: "CLUB-005",
    fromClubName: "Addis Ababa Youth AC",
    toClubId: "CLUB-001",
    toClubName: "Defense Athletics Club",
    status: "PENDING",
    requestDate: "2026-08-01",
    reason: "Youth development prospect transfer awaiting EAF clearance."
  }
];

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

export const MOCK_EVENT_RESULTS: Record<string, Array<{ discipline: string; results: Array<{ pos: number; athleteName: string; club: string; time: string; pb: boolean; sb: boolean; nat: string; }> }>> = {
  "MEET-2026-01": [
    {
      discipline: "5,000m",
      results: [
        { pos: 1, athleteName: "Haile Demisse Tadesse",  club: "Defense AC",        time: "12:54.10", pb: false, sb: true,  nat: "ETH" },
        { pos: 2, athleteName: "Kedir Negash Wolde",     club: "Oromia Police SC",  time: "12:56.44", pb: false, sb: false, nat: "ETH" },
        { pos: 3, athleteName: "Birhanu Alemu Fita",     club: "CBE AC",            time: "13:01.20", pb: true,  sb: true,  nat: "ETH" },
        { pos: 4, athleteName: "Getnet Wale Desta",      club: "Sidama Coffee AC",  time: "13:04.88", pb: false, sb: false, nat: "ETH" },
        { pos: 5, athleteName: "Andamlak Belihu",        club: "Defense AC",        time: "13:08.00", pb: false, sb: true,  nat: "ETH" },
      ]
    },
    {
      discipline: "800m",
      results: [
        { pos: 1, athleteName: "Tigist Bekele Abate",    club: "Defense AC",        time: "1:58.05",  pb: false, sb: true,  nat: "ETH" },
        { pos: 2, athleteName: "Worknesh Alemu",         club: "Oromia Police SC",  time: "1:59.14",  pb: true,  sb: true,  nat: "ETH" },
        { pos: 3, athleteName: "Hirut Meseret",          club: "CBE AC",            time: "2:00.20",  pb: false, sb: false, nat: "ETH" },
      ]
    },
    {
      discipline: "10,000m",
      results: [
        { pos: 1, athleteName: "Sifan Mengistu Wolde",   club: "Oromia Police SC",  time: "29:50.00", pb: false, sb: true,  nat: "ETH" },
        { pos: 2, athleteName: "Almaz Ayana Dibaba",     club: "Defense AC",        time: "30:02.10", pb: false, sb: false, nat: "ETH" },
        { pos: 3, athleteName: "Netsanet Gudeta",        club: "Sidama Coffee AC",  time: "30:15.88", pb: true,  sb: true,  nat: "ETH" },
      ]
    }
  ],
  "MEET-2026-02": [
    {
      discipline: "1,500m",
      results: [
        { pos: 1, athleteName: "Abel Gemechu Desta",     club: "Defense AC",        time: "3:40.00",  pb: false, sb: true,  nat: "ETH" },
        { pos: 2, athleteName: "Yomif Kejelcha Jr",      club: "Oromia Police SC",  time: "3:41.22",  pb: false, sb: false, nat: "ETH" },
        { pos: 3, athleteName: "Samuel Tesfaye",         club: "CBE AC",            time: "3:42.80",  pb: true,  sb: true,  nat: "ETH" },
      ]
    },
    {
      discipline: "100m Sprint",
      results: [
        { pos: 1, athleteName: "Tamiru Desta",           club: "CBE AC",            time: "10.44",    pb: true,  sb: true,  nat: "ETH" },
        { pos: 2, athleteName: "Robel Habte",            club: "Defense AC",        time: "10.52",    pb: false, sb: true,  nat: "ETH" },
        { pos: 3, athleteName: "Milion Asfaw",           club: "Oromia Police SC",  time: "10.58",    pb: false, sb: false, nat: "ETH" },
      ]
    }
  ]
};

export const MOCK_LIVE_SPLITS = [
  { distance: "1,000m",    splitTime: "2:33.40",  pace: "2:33/km", position: 1, leaderGap: "0.00s" },
  { distance: "2,000m",    splitTime: "5:08.12",  pace: "2:34/km", position: 1, leaderGap: "0.00s" },
  { distance: "3,000m",    splitTime: "7:44.90",  pace: "2:36/km", position: 2, leaderGap: "+0.34s" },
  { distance: "4,000m",    splitTime: "10:20.15", pace: "2:35/km", position: 1, leaderGap: "0.00s" },
  { distance: "5,000m Final", splitTime: "12:54.10", pace: "2:34/km", position: 1, leaderGap: "0.00s (GOLD)" }
];
