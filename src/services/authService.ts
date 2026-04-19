import api from '../api/axiosConfig';

export interface CheckAdminResponse {
  isAdmin: boolean;
}

class AuthService {
  /**
   * Validates if the current authenticated user has active administrator privileges
   * by verifying the token against the backend system.
   */
  async checkAdmin(): Promise<boolean> {
    try {
      const response = await api.get<CheckAdminResponse>('/auth/check-admin');
      return response.data.isAdmin;
    } catch (error) {
      console.error('[AuthService] Admin check failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
