function resolveApiBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim();
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

const API_BASE_URL = resolveApiBaseUrl();

export class ApiClient {
  static getBaseUrl(): string {
    return API_BASE_URL;
  }

  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cadence_token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = ApiClient.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.message || res.statusText || 'API request failed';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }

    return res.json();
  }

  // System & Diagnostics
  static async healthCheck() {
    return this.request<{ status: string; database?: string; timestamp?: string }>('/health');
  }

  // Auth
  static async login(email: string, password: string) {
    return this.request<{ user: any; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(data: any) {
    return this.request<{ user: any; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getMe() {
    return this.request<any>('/auth/me');
  }

  // Projects
  static async getProjects() {
    return this.request<any[]>('/projects');
  }

  static async createProject(data: any) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateProject(id: string, data: any) {
    return this.request<any>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async deleteProject(id: string) {
    return this.request<any>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Reports
  static async saveDraft(data: any) {
    return this.request<any>('/reports/draft', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async submitReport(id: string, data?: any) {
    return this.request<any>(`/reports/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  static async getMyHistory(page = 1, limit = 20) {
    return this.request<any>(`/reports/my-history?page=${page}&limit=${limit}`);
  }

  static async getReports(params?: { week?: string; memberId?: string; projectId?: string; status?: string }) {
    const cleanParams: Record<string, string> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v && v !== 'undefined' && v !== 'ALL') {
          cleanParams[k] = v;
        }
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return this.request<any>(`/reports${query ? `?${query}` : ''}`);
  }

  static async getReport(id: string) {
    return this.request<any>(`/reports/${id}`);
  }

  static async reviewReport(
    id: string,
    action: 'APPROVE' | 'REQUEST_CHANGES',
    comment?: string,
    structured?: {
      taskFeedback?: Array<{ taskName: string; note: string; tags?: string[] }>;
      blockerFeedback?: Array<{ blocker: string; note: string }>;
      highlightFeedback?: Array<{ highlight: string; note: string }>;
    }
  ) {
    return this.request<any>(`/reports/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        comment,
        taskFeedback: structured?.taskFeedback,
        blockerFeedback: structured?.blockerFeedback,
        highlightFeedback: structured?.highlightFeedback,
      }),
    });
  }

  // Dashboard
  static async getDashboardSummary(week?: string) {
    const validWeek = week && week !== 'undefined' && week !== 'ALL' ? `?week=${week}` : '';
    return this.request<any>(`/dashboard/summary${validWeek}`);
  }

  static async getDashboardCharts(params?: { week?: string; projectId?: string; memberId?: string }) {
    const cleanParams: Record<string, string> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v && v !== 'undefined' && v !== 'ALL') {
          cleanParams[k] = v;
        }
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return this.request<any>(`/dashboard/charts${query ? `?${query}` : ''}`);
  }

  static async getBlockersAndAchievements(week?: string) {
    const validWeek = week && week !== 'undefined' && week !== 'ALL' ? `?week=${week}` : '';
    return this.request<any>(`/dashboard/blockers-and-achievements${validWeek}`);
  }

  // Users
  static async getUsers() {
    return ApiClient.request<any[]>('/users');
  }

  static async getUserProfile(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  static async createUser(data: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
    title?: string;
  }) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  static async changeUserPassword(id: string, newPassword: string) {
    return this.request<any>(`/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword }),
    });
  }

  static async updateProfile(data: {
    fullName?: string;
    title?: string;
    department?: string;
    avatarColor?: string;
  }) {
    return this.request<any>('/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async changeMyPassword(currentPassword: string, newPassword: string) {
    return this.request<any>('/users/me/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  static async updateUserRole(id: string, role: string) {
    return this.request<any>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  static async toggleUserStatus(id: string) {
    return this.request<any>(`/users/${id}/status`, {
      method: 'PATCH',
    });
  }

  // AI
  static async chatAi(
    query: string,
    currentTab?: string,
    currentPath?: string,
    tabContext?: any,
  ) {
    return this.request<{
      answer: string;
      modelUsed: string;
      toolCall?: { tool: string; data: any };
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query, currentTab, currentPath, tabContext }),
    });
  }
}
