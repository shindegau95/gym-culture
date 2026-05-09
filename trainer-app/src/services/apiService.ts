import axios, {AxiosInstance} from 'axios';
import {config} from '../config';
import {getIdToken} from './authService';

export interface UserResponse {
  id: number;
  firebaseUid: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'CLIENT' | 'TRAINER' | 'STAFF' | 'OWNER';
  branchId: number | null;
  branchName: string | null;
  active: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
});

api.interceptors.request.use(async req => {
  const token = await getIdToken();
  if (token) {
    req.headers = req.headers ?? {};
    (req.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return req;
});

export async function fetchMe(): Promise<UserResponse> {
  const res = await api.get<UserResponse>('/auth/me');
  return res.data;
}

export {api};
