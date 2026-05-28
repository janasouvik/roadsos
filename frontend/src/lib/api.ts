/**
 * ROADSOS API Client
 * Centralized fetch-based HTTP client for communicating with the backend.
 * Handles: base URL, auth headers, token refresh, error normalization.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';

// ========================
// Token storage
// ========================
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

// ========================
// Response types
// ========================
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiRequestError extends Error {
  public statusCode: number;
  public errors?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode: number, errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// ========================
// Core fetch wrapper
// ========================
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiSuccessResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Attach auth header if token available
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Send cookies for refresh token
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    throw new ApiRequestError(
      errorData.message ?? 'Request failed',
      response.status,
      errorData.errors,
    );
  }

  return data as ApiSuccessResponse<T>;
}

// ========================
// HTTP method helpers
// ========================
export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

  upload: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: formData,
      headers: {}, // Let browser set multipart content-type
    }),
};

// ========================
// Type-safe API endpoints
// ========================
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'POLICE' | 'HOSPITAL';
  isBlocked: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Profile / Emergency properties
  bloodGroup?: string | null;
  address?: string | null;
  gender?: string | null;
  dob?: string | null;
  dlNumber?: string | null;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  vehicleModel?: string | null;
  medicalConditions?: string | null;
  currentMedications?: string | null;
  disabilityInfo?: string | null;
  aadhaar?: string | null;
  insurance?: string | null;
  organDonor?: string | null;
  allergies?: string | null;
  emergencyContacts?: EmergencyContact[];
}

export interface AuthTokens {
  user: UserProfile;
  accessToken: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  
  // New signup details
  bloodGroup: string;
  vehicleNumber: string;
  contactName: string;
  contactRelation: string;
  contactPhone: string;
  
  secondaryContactName?: string;
  secondaryContactRelation?: string;
  secondaryContactPhone?: string;

  address?: string;
  gender?: string;
  dob?: string;
  dlNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  medicalConditions?: string;
  currentMedications?: string;
  disabilityInfo?: string;
  aadhaar?: string;
  insurance?: string;
  organDonor?: string;
  allergies?: string;
  avatar?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SosRequest {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address?: string;
  emergencyType: 'HOSPITAL' | 'AMBULANCE' | 'POLICE' | 'TOWING' | 'RESCUE';
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  createdAt: string;
  updatedAt: string;

  // Telemetry, media and details
  googleMapsLink?: string;
  severity?: string;
  accidentImage?: string;
  accidentVideo?: string;
  accidentAudio?: string;

  // Joined user data
  user?: UserProfile;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  createdAt: string;
}

// ========================
// Typed API methods
// ========================
export const authApi = {
  signup: (data: SignupData) =>
    api.post<AuthTokens>('/api/auth/signup', data),

  login: (data: LoginData) =>
    api.post<AuthTokens>('/api/auth/login', data),

  logout: () =>
    api.post('/api/auth/logout'),

  refreshToken: () =>
    api.post<{ accessToken: string }>('/api/auth/refresh-token'),

  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post('/api/auth/reset-password', data),

  verifyOtp: (data: { email: string; otp: string; purpose?: string }) =>
    api.post('/api/auth/verify-otp', data),

  resendOtp: (data: { email: string; purpose?: string }) =>
    api.post('/api/auth/resend-otp', data),

  getMe: () =>
    api.get<UserProfile>('/api/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/api/auth/change-password', data),
};

export const userApi = {
  getProfile: () =>
    api.get<UserProfile>('/api/users/profile'),

  updateProfile: (data: { fullName?: string; phone?: string }) =>
    api.patch<UserProfile>('/api/users/profile', data),

  deleteAccount: () =>
    api.delete('/api/users/delete-account'),
};

export const sosApi = {
  create: (data: {
    latitude: number;
    longitude: number;
    emergencyType: string;
    address?: string;
    description?: string;
    severity?: string;
    googleMapsLink?: string;
    accidentImage?: string;
    accidentVideo?: string;
    accidentAudio?: string;
  }) => api.post<SosRequest>('/api/sos/create', data),

  getMyRequests: (params?: { page?: number; limit?: number }) =>
    api.get<SosRequest[]>(`/api/sos/my-requests${params ? `?page=${params.page ?? 1}&limit=${params.limit ?? 10}` : ''}`),

  getById: (id: string) =>
    api.get<SosRequest>(`/api/sos/${id}`),

  cancel: (id: string) =>
    api.patch(`/api/sos/cancel/${id}`),
};

export const contactApi = {
  getAll: () =>
    api.get<EmergencyContact[]>('/api/contacts'),

  create: (data: { name: string; relationship: string; phone: string; email?: string }) =>
    api.post<EmergencyContact>('/api/contacts', data),

  update: (id: string, data: Partial<{ name: string; relationship: string; phone: string; email: string }>) =>
    api.patch<EmergencyContact>(`/api/contacts/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/contacts/${id}`),
};

export const servicesApi = {
  getNearby: (lat: number, lng: number, type?: string) =>
    api.get(`/api/services/nearby?lat=${lat}&lng=${lng}${type ? `&type=${type}` : ''}`),

  getHospitals: (lat?: number, lng?: number) =>
    api.get(`/api/services/hospitals${lat && lng ? `?lat=${lat}&lng=${lng}` : ''}`),

  getAmbulances: (lat?: number, lng?: number) =>
    api.get(`/api/services/ambulances${lat && lng ? `?lat=${lat}&lng=${lng}` : ''}`),

  getPolice: (lat?: number, lng?: number) =>
    api.get(`/api/services/police${lat && lng ? `?lat=${lat}&lng=${lng}` : ''}`),

  getTowing: (lat?: number, lng?: number) =>
    api.get(`/api/services/towing${lat && lng ? `?lat=${lat}&lng=${lng}` : ''}`),
};

export const adminApi = {
  getUsers: (params?: { page?: number; limit?: number; role?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.role) searchParams.append('role', params.role);
    return api.get<UserProfile[]>(`/api/admin/users?${searchParams.toString()}`);
  },
  triggerSos: (userId: string, data: { emergencyType: string; latitude: number; longitude: number; address?: string; description?: string }) => 
    api.post(`/api/admin/trigger-sos/${userId}`, data),
  getSosRequests: (params?: { page?: number; limit?: number; status?: string; emergencyType?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.emergencyType) searchParams.append('emergencyType', params.emergencyType);
    if (params?.search) searchParams.append('search', params.search);
    return api.get<SosRequest[]>(`/api/admin/sos-requests?${searchParams.toString()}`);
  },
  updateSosStatus: (id: string, status: string, assignedService?: string) =>
    api.patch<SosRequest>(`/api/admin/sos-requests/${id}/status`, { status, assignedService })
};

