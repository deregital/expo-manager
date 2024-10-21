import createClient from 'openapi-fetch';
import { type paths } from 'expo-backend-types';

export const fetchClient = createClient<paths>({
  baseUrl: process.env.EXPO_BACKEND_URL,
});
