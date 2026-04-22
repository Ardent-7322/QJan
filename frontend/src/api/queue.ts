import axios from 'axios';
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

export const getNearbyOffices = async (
  lat: number,
  lng: number,
  radius: number = 20
): Promise<Office[]> => {
  const res = await axios.get<Office[]>(
    `${BASE}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  return res.data;
};

export const getAllOffices = async (): Promise<Office[]> => {
  const res = await axios.get<Office[]>(`${BASE}/`);
  return res.data;
};

export const getOfficeQueue = async (officeId: string): Promise<OfficeDetail> => {
  const res = await axios.get<OfficeDetail>(`${BASE}/${officeId}`);
  return res.data;
};

export const checkin = async (officeId: string): Promise<CheckinResponse> => {
  const res = await axios.post<CheckinResponse>(`${BASE}/${officeId}/checkin`);
  return res.data;
};

export const checkout = async (officeId: string): Promise<CheckinResponse> => {
  const res = await axios.post<CheckinResponse>(`${BASE}/${officeId}/checkout`);
  return res.data;

  };

export const getAnomaly = async (officeId: string): Promise<AnomalyResult> => {
  const res = await axios.get<AnomalyResult>(`${AI_BASE}/anomaly/${officeId}`);
  return res.data;
};

export const planVisit = async (officeId: string, freeSlots: string[]): Promise<PlanResult> => {
  const res = await axios.post<PlanResult>(`${AI_BASE}/plan`, {
    office_id: officeId,
    free_slots: freeSlots,
  });
  return res.data;
};

export const aiSearch = async (query: string): Promise<SearchResult> => {
  const res = await axios.post<SearchResult>(`${AI_BASE}/search`, { query });
  return res.data;
};