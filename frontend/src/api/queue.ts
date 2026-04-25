import axios, { AxiosError } from 'axios';
import {
  Office,
  OfficeDetail,
  CheckinResponse,
  AnomalyResult,
  PlanResult,
  SearchResult,
} from '../types';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/queue';
const AI_BASE = process.env.REACT_APP_API_URL?.replace('/queue', '/ai') || 'http://localhost:8000/api/ai';

// ─── Anonymous session ID ─────────────────────────────────────────────────────
// Generated once per browser, stored in localStorage.
// No account, no personal data — just a random ID to prevent check-in spam.
function getSessionId(): string {
  const KEY = 'qjan_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

// ─── Generic error handler ────────────────────────────────────────────────────
function apiError(err: unknown): Error {
  if (err instanceof AxiosError) {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return new Error(detail);
    if (err.response?.status === 429) return new Error('rate_limited');
    if (err.response?.status === 404) return new Error('not_found');
    if (!err.response) return new Error('network_error');
  }
  return new Error('unknown_error');
}

// ─── Offices ──────────────────────────────────────────────────────────────────
export const getNearbyOffices = async (
  lat: number,
  lng: number,
  radius: number = 20
): Promise<Office[]> => {
  try {
    const res = await axios.get<Office[]>(
      `${BASE}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    return res.data;
  } catch (err) {
    throw apiError(err);
  }
};

export const getAllOffices = async (): Promise<Office[]> => {
  try {
    const res = await axios.get<Office[]>(`${BASE}/`);
    return res.data;
  } catch (err) {
    throw apiError(err);
  }
};

export const getOfficeQueue = async (officeId: string): Promise<OfficeDetail> => {
  try {
    const res = await axios.get<OfficeDetail>(`${BASE}/${officeId}`);
    return res.data;
  } catch (err) {
    throw apiError(err);
  }
};

// ─── Check-in / Check-out ─────────────────────────────────────────────────────
export const checkin = async (officeId: string): Promise<CheckinResponse> => {
  try {
    const res = await axios.post<CheckinResponse>(`${BASE}/${officeId}/checkin`, {
      session_id: getSessionId(),
    });
    return res.data;
  } catch (err) {
    throw apiError(err);
  }
};

export const checkout = async (officeId: string): Promise<CheckinResponse> => {
  try {
    const res = await axios.post<CheckinResponse>(`${BASE}/${officeId}/checkout`, {
      session_id: getSessionId(),
    });
    return res.data;
  } catch (err) {
    throw apiError(err);
  }
};

// ─── AI endpoints ─────────────────────────────────────────────────────────────
export const getAnomaly = async (officeId: string): Promise<AnomalyResult> => {
  try {
    const res = await axios.get<AnomalyResult>(`${AI_BASE}/anomaly/${officeId}`);
    return res.data;
  } catch (err) {
    throw apiError(err);
  }
};

export const planVisit = async (officeId: string, freeSlots: string[]): Promise<PlanResult> => {
  try {
    const res = await axios.post<PlanResult>(`${AI_BASE}/plan`, {
      office_id: officeId,
      free_slots: freeSlots,
    });
    return res.data;
  } catch (err) {
    throw apiError(err);
  }
};

export const aiSearch = async (query: string): Promise<SearchResult> => {
  try {
    const res = await axios.post<SearchResult>(`${AI_BASE}/search`, { query });
    return res.data;
  } catch (err) {
    throw apiError(err);
  }
};
