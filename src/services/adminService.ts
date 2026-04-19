import api from '../api/axiosConfig';
import type { 
  User, 
  AdminLog, 
  DashboardStats, 
  AnalyticsData, 
  ToolUsage, 
  SystemSettings 
} from '../types/admin';

export interface AdminApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class AdminService {
  private logRequest(method: string, url: string, data?: any) {
    console.log(`[AdminService] REQUEST: ${method} ${url}`, data || '');
  }

  private logResponse(url: string, response: any) {
    console.log(`[AdminService] RESPONSE: ${url}`, response);
  }

  // --- User Management ---
  async getUsers(page = 1, limit = 10, filters = {}): Promise<AdminApiResponse<User[]>> {
    const url = '/admin/users';
    const params = { page, limit, ...filters };
    this.logRequest('GET', url, params);
    const res = await api.get(url, { params });
    this.logResponse(url, res.data);
    return res.data;
  }

  async getUserDetails(userId: string): Promise<AdminApiResponse<User>> {
    const url = `/admin/users/${userId}`;
    this.logRequest('GET', url);
    const res = await api.get(url);
    this.logResponse(url, res.data);
    return res.data;
  }

  async createUser(userData: any): Promise<AdminApiResponse<User>> {
    const url = '/admin/users';
    this.logRequest('POST', url, userData);
    const res = await api.post(url, userData);
    this.logResponse(url, res.data);
    return res.data;
  }

  async updateUser(userId: string, updates: any): Promise<AdminApiResponse<User>> {
    const url = `/admin/users/${userId}`;
    this.logRequest('PATCH', url, updates);
    const res = await api.patch(url, updates);
    this.logResponse(url, res.data);
    return res.data;
  }

  async deleteUser(userId: string, sudoToken?: string): Promise<AdminApiResponse<void>> {
    const url = `/admin/users/${userId}`;
    this.logRequest('DELETE', url);
    const headers: any = {};
    if (sudoToken) headers['x-sudo-token'] = sudoToken;
    const res = await api.delete(url, { headers });
    this.logResponse(url, res.data);
    return res.data;
  }

  async blockUser(userId: string, reason?: string, sudoToken?: string): Promise<AdminApiResponse<void>> {
    const url = `/admin/users/${userId}/block`;
    const payload = { reason };
    this.logRequest('POST', url, payload);
    const headers: any = {};
    if (sudoToken) headers['x-sudo-token'] = sudoToken;
    const res = await api.post(url, payload, { headers });
    this.logResponse(url, res.data);
    return res.data;
  }

  async unblockUser(userId: string, sudoToken?: string): Promise<AdminApiResponse<void>> {
    const url = `/admin/users/${userId}/unblock`;
    this.logRequest('POST', url);
    const headers: any = {};
    if (sudoToken) headers['x-sudo-token'] = sudoToken;
    const res = await api.post(url, {}, { headers });
    this.logResponse(url, res.data);
    return res.data;
  }

  async resetPassword(userId: string, sudoToken?: string): Promise<AdminApiResponse<{ temporaryPassword: string }>> {
    const url = `/admin/users/${userId}/reset-password`;
    this.logRequest('POST', url);
    const headers: any = {};
    if (sudoToken) headers['x-sudo-token'] = sudoToken;
    const res = await api.post(url, {}, { headers });
    this.logResponse(url, res.data);
    return res.data;
  }

  // --- Analytics Intelligence ---
  async getDashboardStats(): Promise<AdminApiResponse<DashboardStats>> {
    const url = '/admin/analytics/dashboard';
    this.logRequest('GET', url);
    const res = await api.get(url);
    this.logResponse(url, res.data);
    return res.data;
  }

  async getToolUsageStats(dateRange?: any): Promise<AdminApiResponse<ToolUsage>> {
    const url = '/admin/analytics/tools-usage';
    this.logRequest('GET', url, dateRange);
    const res = await api.get(url, { params: dateRange });
    this.logResponse(url, res.data);
    return res.data;
  }

  async getTrends(timeframe = '30d'): Promise<AdminApiResponse<AnalyticsData[]>> {
    const url = '/admin/analytics/trends';
    const params = { timeframe };
    this.logRequest('GET', url, params);
    const res = await api.get(url, { params });
    this.logResponse(url, res.data);
    return res.data;
  }

  async getTopUsers(): Promise<AdminApiResponse<User[]>> {
    const url = '/admin/analytics/top-users';
    this.logRequest('GET', url);
    const res = await api.get(url);
    this.logResponse(url, res.data);
    return res.data;
  }

  async getActivitySummary(): Promise<AdminApiResponse<AdminLog[]>> {
    const url = '/admin/analytics/activity';
    this.logRequest('GET', url);
    const res = await api.get(url);
    this.logResponse(url, res.data);
    return res.data;
  }

  async getPeakActivity(params?: any): Promise<AdminApiResponse<any[]>> {
    const url = '/admin/analytics/peak-activity';
    this.logRequest('GET', url, params);
    const res = await api.get(url, { params });
    this.logResponse(url, res.data);
    return res.data;
  }

  // --- Activity Auditing ---
  async getLogs(page = 1, limit = 100): Promise<AdminApiResponse<AdminLog[]>> {
    const url = '/admin/logs';
    const params = { page, limit };
    this.logRequest('GET', url, params);
    const res = await api.get(url, { params });
    this.logResponse(url, res.data);
    return res.data;
  }

  async filterLogs(filters: any): Promise<AdminApiResponse<AdminLog[]>> {
    const url = '/admin/logs/filter';
    this.logRequest('GET', url, filters);
    const res = await api.get(url, { params: filters });
    this.logResponse(url, res.data);
    return res.data;
  }

  async detectAnomalies(): Promise<AdminApiResponse<any[]>> {
    const url = '/admin/logs/anomalies';
    this.logRequest('GET', url);
    const res = await api.get(url);
    this.logResponse(url, res.data);
    return res.data;
  }

  async exportLogs(filters: any): Promise<void> {
    const url = '/admin/logs/export';
    this.logRequest('GET', url, filters);
    // For export, we typically want the binary/file, so we use a direct window open or blob handling
    const res = await api.get(url, { params: filters, responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'text/csv' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'activity_logs.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // --- Platform Governance ---
  async getSettings(): Promise<AdminApiResponse<SystemSettings>> {
    const url = '/admin/settings';
    this.logRequest('GET', url);
    const res = await api.get(url);
    this.logResponse(url, res.data);
    return res.data;
  }

  async updateSettings(settings: any): Promise<AdminApiResponse<SystemSettings>> {
    const url = '/admin/settings';
    this.logRequest('PATCH', url, settings);
    const res = await api.patch(url, settings);
    this.logResponse(url, res.data);
    return res.data;
  }

  async getAPIIntegrations(): Promise<AdminApiResponse<any[]>> {
    const url = '/admin/api-integrations';
    this.logRequest('GET', url);
    const res = await api.get(url);
    this.logResponse(url, res.data);
    return res.data;
  }

  async toggleAPIIntegration(apiId: string, status: boolean): Promise<AdminApiResponse<any>> {
    const url = '/admin/api-integrations/toggle';
    const payload = { apiId, status };
    this.logRequest('PATCH', url, payload);
    const res = await api.patch(url, payload);
    this.logResponse(url, res.data);
    return res.data;
  }

  async rotateAPIKeys(apiId: string): Promise<AdminApiResponse<{ newKey: string }>> {
    const url = '/admin/api-integrations/rotate';
    const payload = { apiId };
    this.logRequest('POST', url, payload);
    const res = await api.post(url, payload);
    this.logResponse(url, res.data);
    return res.data;
  }
}

export const adminService = new AdminService();
