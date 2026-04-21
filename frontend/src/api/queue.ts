import axios from 'axios';
import { Office, OfficeDetail, CheckinResponse } from '../types';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/queue';

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