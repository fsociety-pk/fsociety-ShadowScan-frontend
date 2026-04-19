export interface User {
  _id: string;
  username: string;
  email?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  points: number;
  totalScans: number;
  riskScore: number;
  lastLogin?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScanHistory {
  _id: string;
  toolName: string;
  timestamp: string;
  status: 'success' | 'failed';
  details: any;
}

export interface AdminLog {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  } | string;
  action: string;
  timestamp: string;
  toolName: string;
  details: any;
  ipAddress: string;
  status: 'success' | 'failed';
}

export interface DashboardStats {
  totalUsers: number;
  totalScans: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  systemHealthStatus: {
    status: string;
    latency: string;
    uptime: string;
  };
}

export interface AnalyticsData {
  date: string;
  scans: number;
  users: number;
}

export interface ToolUsage {
  email: number;
  username: number;
  phone: number;
  metadata: number;
}

export interface SystemSettings {
  rateLimitPerHour: number;
  enableEmailLookup: boolean;
  enableUsernameScan: boolean;
  enablePhoneLookup: boolean;
  enableMetadataExtraction: boolean;
  maintenanceMode: boolean;
  maxFileUploadSize: number;
  apiIntegrations: Array<{
    name: string;
    id: string;
    isActive: boolean;
    lastChecked: string;
  }>;
}
