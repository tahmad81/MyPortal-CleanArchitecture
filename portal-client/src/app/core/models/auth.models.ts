export interface RegisterRequest {
  userName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  expiresAt?: string;
  userId?: string;
  email?: string;
  userName?: string;
  roles?: string[];
}

