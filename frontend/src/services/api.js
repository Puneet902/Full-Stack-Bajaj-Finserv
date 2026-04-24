import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://bajaj-finserv-backend-production-84d5.up.railway.app';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const submitBfhlData = async (dataArray) => {
  try {
    const response = await apiClient.post('/bfhl', { data: dataArray });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Server returned an error');
    } else if (error.request) {
      throw new Error('No response from server. Is the backend running on port 3000?');
    }
    throw new Error('Request failed: ' + error.message);
  }
};

export const sendChatMessage = async (message, context = null) => {
  try {
    const response = await apiClient.post('/chat', { message, context });
    return response.data.reply;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Chat request failed');
    } else if (error.request) {
      throw new Error('No response from server. Is the backend running?');
    }
    throw new Error('Chat request failed: ' + error.message);
  }
};

export const fetchHistory = async () => {
  try {
    const response = await apiClient.get('/bfhl/history');
    return response.data.history || [];
  } catch {
    return [];
  }
};
