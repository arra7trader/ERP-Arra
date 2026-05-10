const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

  // Auth
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

  // Dashboard
  async getDashboardSummary(userId: string) {
    return this.request<any>(`/api/dashboard/summary/${userId}`);
  }

  async getAIBriefing(userId: string) {
    return this.request<any>(`/api/dashboard/briefing/${userId}`);
  }

  // Videos
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

  async updateVideoStatus(id: string, status: string) {
    return this.request<any>(`/api/videos/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteVideo(id: string) {
    return this.request<any>(`/api/videos/${id}`, { method: 'DELETE' });
  }

  // Budgets
  async getBudgetsByVideo(videoId: string) {
    return this.request<any[]>(`/api/budgets/video/${videoId}`);
  }

  async getBudgetsByUser(userId: string) {
    return this.request<any[]>(`/api/budgets/user/${userId}`);
  }

  async getBudgetSummary(videoId: string) {
    return this.request<any>(`/api/budgets/summary/${videoId}`);
  }

  async createBudget(userId: string, videoId: string, data: any) {
    return this.request<any>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ userId, videoId, data }),
    });
  }

  async recordExpense(id: string, amount: number, paymentMethod?: string, notes?: string) {
    return this.request<any>(`/api/budgets/${id}/expense`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod, notes }),
    });
  }

  async analyzeBudgetWithAI(userId: string, videoId: string) {
    return this.request<any>(`/api/budgets/analyze/${videoId}`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Talents
  async getTalents(userId: string, filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<any[]>(`/api/talents/user/${userId}?${params}`);
  }

  async getTalent(id: string) {
    return this.request<any>(`/api/talents/${id}`);
  }

  async createTalent(userId: string, data: any) {
    return this.request<any>('/api/talents', {
      method: 'POST',
      body: JSON.stringify({ userId, data }),
    });
  }

  async updateTalent(id: string, data: any) {
    return this.request<any>(`/api/talents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async assignTalentToVideo(videoId: string, talentId: string, data: any) {
    return this.request<any>('/api/talents/assign', {
      method: 'POST',
      body: JSON.stringify({ videoId, talentId, data }),
    });
  }

  // Marketing
  async getCampaigns(userId: string, filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<any[]>(`/api/marketing/user/${userId}?${params}`);
  }

  async getCampaignsByVideo(videoId: string) {
    return this.request<any[]>(`/api/marketing/video/${videoId}`);
  }

  async createCampaign(userId: string, videoId: string, data: any) {
    return this.request<any>('/api/marketing', {
      method: 'POST',
      body: JSON.stringify({ userId, videoId, data }),
    });
  }

  async generateMarketingCopy(userId: string, campaignId: string) {
    return this.request<any>(`/api/marketing/${campaignId}/generate-copy`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Notifications
  async getNotifications(userId: string, unreadOnly = false) {
    return this.request<any[]>(`/api/notifications/user/${userId}?unreadOnly=${unreadOnly}`);
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/api/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead(userId: string) {
    return this.request<any>(`/api/notifications/user/${userId}/read-all`, { method: 'PUT' });
  }

  // AI
  async suggestSchedule(userId: string, videoId: string, videoData: any) {
    return this.request<any>('/api/ai/suggest-schedule', {
      method: 'POST',
      body: JSON.stringify({ userId, videoId, videoData }),
    });
  }

  async generateRAB(userId: string, videoData: any) {
    return this.request<any>('/api/ai/generate-rab', {
      method: 'POST',
      body: JSON.stringify({ userId, videoData }),
    });
  }

  async suggestPublishTime(userId: string, videoId: string, category: string) {
    return this.request<any>('/api/ai/suggest-publish-time', {
      method: 'POST',
      body: JSON.stringify({ userId, videoId, category }),
    });
  }
}

export const api = new ApiClient();
export default api;
