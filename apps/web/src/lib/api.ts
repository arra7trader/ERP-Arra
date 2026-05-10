const API_URL = '';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string, name: string) {
    const data = await this.request<{ access_token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.request<any>('/api/auth/me');
  }

  async getDashboardSummary(userId: string) {
    return this.request<any>(`/api/dashboard/summary/${userId}`);
  }

  async getAIBriefing(userId: string) {
    return this.request<any>(`/api/dashboard/briefing/${userId}`);
  }

  async getVideos(userId: string, filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<any[]>(`/api/videos/user/${userId}?${params}`);
  }

  async getVideo(id: string) {
    return this.request<any>(`/api/videos/${id}`);
  }

  async createVideo(userId: string, data: any) {
    return this.request<any>('/api/videos', {
      method: 'POST',
      body: JSON.stringify({ userId, data }),
    });
  }

  async updateVideo(id: string, data: any) {
    return this.request<any>(`/api/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVideo(id: string) {
    return this.request<any>(`/api/videos/${id}`, { method: 'DELETE' });
  }

  async getBudgetsByUser(userId: string) {
    return this.request<any[]>(`/api/budgets/user/${userId}`);
  }

  async getTalents(userId: string) {
    return this.request<any[]>(`/api/talents/user/${userId}`);
  }

  async getCampaigns(userId: string) {
    return this.request<any[]>(`/api/marketing/user/${userId}`);
  }

  async getNotifications(userId: string, unreadOnly = false) {
    return this.request<any[]>(`/api/notifications/user/${userId}?unreadOnly=${unreadOnly}`);
  }
}

export const api = new ApiClient();
export default api;
