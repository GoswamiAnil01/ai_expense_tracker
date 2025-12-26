// Authentication utilities for JWT token management

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface AuthToken {
  token: string;
  user: {
    id: number;
    email: string;
    created_at: string;
  };
}

export const authUtils = {
  // Store authentication data
  setAuth(authData: AuthToken): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, authData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
    }
  },

  // Get the authentication token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // Get user data
  getUser(): { id: number; email: string; created_at: string } | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  // Clear authentication data
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  // Check if token is expired (simple check - in production, decode JWT to check exp)
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      // Simple check for JWT expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      // If token is malformed, consider it expired
      return true;
    }
  },

  // Get authorization header
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};
