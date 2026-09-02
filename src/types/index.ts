// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types for EAF Client
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'LANDING' | 'CLUB' | 'ATHLETE';
export type ToastType = 'success' | 'error' | 'info';
export type LicenseStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'NONE' | 'UNLICENSED';
export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type MeetStatus = 'REGISTRATION_OPEN' | 'UPCOMING' | 'LIVE' | 'REGISTRATION_CLOSED' | 'COMPLETED';

export interface Toast {
  message: string;
  type: ToastType;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  region: string;
  manager: string;
  email: string;
  phone: string;
  licensedAthletes: number;
  pendingVerifications: number;
  unlicensedAthletes: number;
  transfersCount: number;
  logo: string;
  clubRank: number;
  totalPoints: number;
}

export interface PersonalBest {
  event: string;
  mark?: string;
  date?: string;
  venue?: string;
  time?: string;
}

export interface AppliedCompetition {
  meetId: string;
  meetTitle: string;
  disciplines: string[];
  status: string;
  appliedDate: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: string;
  read: boolean;
}

export interface WeightLogEntry {
  date: string;
  kg: number;
}

export interface TrainingLogEntry {
  date: string;
  type: string;
  distance: number;
  duration: string;
  notes?: string;
}

export interface Athlete {
  id: string;
  name: string;
  amharicName?: string;
  dob: string;
  gender: string;
  ageTier: string;
  club?: string;
  clubId?: string;
  clubName?: string;
  region?: string;
  faydaFin?: string;
  faydaHash?: string;
  faydaStatus?: 'VERIFIED' | 'PENDING' | 'NOT_SUBMITTED';
  secondaryDoc?: { type?: string; docNumber?: string; fileName?: string; uploadDate?: string; verificationStatus?: string } | null;
  licenseStatus: LicenseStatus;
  licenseNumber?: string;
  licenseExpiry?: string;
  worldAthleticsId?: string;
  primaryEvent?: string;
  pb?: string;
  coach?: string;
  specialties?: string[];
  personalBests?: PersonalBest[];
  seasonBests?: PersonalBest[];
  appliedCompetitions?: AppliedCompetition[];
  notifications?: AppNotification[];
  weightLog?: WeightLogEntry[];
  trainingLog?: TrainingLogEntry[];
  restingHR?: number;
  trainingLoad?: string;
  photoUrl: string;
  nationalRank?: number;
  worldRank?: number;
  coachName?: string;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  bloodType?: string;
  medicalConditions?: string;
  medicalNotes?: string;
  height?: number;
  weight?: number;
  bio?: string;
  achievements?: string[];
  checkinStatus?: string;
  lastCheckin?: string;
  checkinLocation?: string;
}

export interface Transfer {
  id: string;
  athleteId?: string;
  athleteName: string;
  fromClubId?: string;
  fromClubName?: string;
  toClubId?: string;
  toClubName?: string;
  status?: string;
  requestDate?: string;
  reason?: string;
  fromClub?: string;
  toClub?: string;
  transferFee?: string;
  contractHash?: string;
  eafClearanceStatus?: string;
  effectiveDate?: string;
}

export interface Meet {
  id: string;
  title: string;
  amharic?: string;
  venue: string;
  date: string;
  dateString: string;
  status: MeetStatus;
  disciplines: string[];
  region: string;
  img?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface PaymentData {
  athleteId: string;
  athleteName: string;
  amount: number;
  description: string;
}

export interface PaymentReceipt {
  gateway: string;
  receiptNo: string;
  amount: number;
  timestamp: string;
}

export interface AuthModalConfig {
  isOpen: boolean;
}

export interface LoginData {
  club?: Club;
  athlete?: Athlete;
}
