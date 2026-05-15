import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const BASE = 'http://lostnfound.dcism.org/api/index.php';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // AsyncStorage unavailable on simulator, skip
  }
  return config;
});

export default api;

export const get = (route: string, params: Record<string, any> = {}) =>
  api.get('', { params: { route, ...params } });

export const post = (route: string, data: any = {}, params: Record<string, any> = {}) =>
  api.post('', data, { params: { route, ...params } });

export const saveAuth = async (token: string, user: object) => {
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const getUser = async () => {
  const u = await AsyncStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};
