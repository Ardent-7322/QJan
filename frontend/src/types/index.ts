// Office from API list
export interface Office {
  office_id: string;
  name: string;
  type: OfficeType;
  city: string;
  current_count: number;
  status: string;
}

// Full office detail from dashboard
export interface OfficeDetail {
  office_id: string;
  name: string;
  type: OfficeType;
  city: string;
  current_count: number;
  estimated_wait_mins: number;
  status: string;
  best_time_today: BestTime;
}

export interface BestTime {
  time: string;
  expected_count: number;
}

export type OfficeType = 'RTO' | 'Passport' | 'Hospital' | 'Post Office';

// Watchlist
export interface WatchEntry {
  officeName: string;
  quietThreshold: number;
  surgeThreshold: number;
  isEnRoute: boolean;
  lastCount: number | null;
  addedAt: number;
}

export interface WatchOptions {
  quietThreshold: number;
  surgeThreshold: number;
  isEnRoute: boolean;
}

export type Watchlist = Record<string, WatchEntry>;

// API responses
export interface CheckinResponse {
  message: string;
  office_id: string;
}

export interface AnomalyResult {
  anomaly: boolean;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  current_count?: number;
  historical_avg?: number;
}

export interface PlanResult {
  recommended_slot: string;
  expected_count: number;
  reason: string;
  alternative_slot: string;
  tip: string;
}

export interface SearchResult {
  matched_office_id: string | null;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}