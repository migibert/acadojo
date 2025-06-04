import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
// Types from Auth0 SDK can be useful for getAccessTokenSilently if you pass it with stricter typing
// import { GetTokenSilentlyOptions } from '@auth0/auth0-react';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// This function configures the Axios request interceptor.
// It should be called once, early in your application's lifecycle,
// after the Auth0 client is initialized and isAuthenticated is true.
export const setupAuthInterceptor = (
  getAccessTokenSilently: (options?: any) => Promise<string> // Looser type for options for simplicity here
) => {
  apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Ensure config.headers is defined
      config.headers = config.headers || {};
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting access token for API request:', error);
        // Potentially handle token refresh errors or redirect to login
        // For now, let the request proceed without the token if it fails,
        // or you could throw an error / clear app state / force re-login.
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  console.log('Auth interceptor has been set up for the API client.');
};

// --- Example API Functions (using the apiClient) ---

// Define some basic types for mock data (replace with actual API response types)
export interface Academy {
  id: string;
  name: string;
  description?: string;
}

export interface Cycle {
  id: string;
  name: string;
  description?: string;
  academyId: string;
}

export const fetchAcademies = async (): Promise<Academy[]> => {
  console.log('fetchAcademies called (mock implementation)');
  // Example of actual API call commented out:
  // const response = await apiClient.get<Academy[]>('/academies');
  // return response.data;
  return Promise.resolve([
    { id: '1', name: 'Mock Academy Alpha', description: 'Top-tier BJJ' },
    { id: '2', name: 'Mock Academy Beta', description: 'Focus on fundamentals' },
  ]);
};

export const fetchCyclesForAcademy = async (academyId: string): Promise<Cycle[]> => {
  console.log(`fetchCyclesForAcademy called for academy ${academyId} (mock implementation)`);
  // Example of actual API call commented out:
  // const response = await apiClient.get<Cycle[]>(`/academies/${academyId}/cycles`);
  // return response.data;
  return Promise.resolve([
    { id: 'c1', name: 'Side Control Mastery', description: '4-week cycle on side control escapes and attacks', academyId },
    { id: 'c2', name: 'Guard Retention & Recovery', description: 'Deep dive into guard retention principles', academyId },
  ]);
};

// You might export individual functions or the configured apiClient itself.
// Exporting functions is often cleaner for component usage.
// export default apiClient; // If you want to allow direct apiClient usage elsewhere
