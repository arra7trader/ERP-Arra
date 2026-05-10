export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  concept?: string;
  script?: string;
  status: 'ideation' | 'pre_production' | 'production' | 'post_production' | 'review' | 'published';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  publishDate?: string;
  duration?: number;
  category?: string;
  tags?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  youtubeId?: string;
  aiRecommendations?: string;
  aiScheduleSuggestion?: string;
  userId: string;
  budgets?: Budget[];
  videoTalents?: VideoTalent[];
  campaigns?: MarketingCampaign[];
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  videoId: string;
  userId: string;
  category: string;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  status: 'planned' | 'approved' | 'spent' | 'over_budget';
  paymentDate?: string;
  paymentMethod?: string;
  receipt?: string;
  notes?: string;
  aiRiskFlag: boolean;
  aiNotes?: string;
  video?: Video;
  createdAt: string;
  updatedAt: string;
}

export interface Talent {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  ageRange?: string;
  ethnicity?: string;
  height?: string;
  bodyType?: string;
  hairColor?: string;
  hairStyle?: string;
  skinTone?: string;
  faceReference?: string;
  bodyReference?: string;
  voiceSample?: string;
  specialty?: string;
  rate?: number;
  currency: string;
  aiConsistencyScore?: number;
  aiParameters?: string;
  isActive: boolean;
  notes?: string;
  userId: string;
  videoTalents?: VideoTalent[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoTalent {
  id: string;
  videoId: string;
  talentId: string;
  role: string;
  characterName?: string;
  agreedFee?: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  shootingDates?: string;
  notes?: string;
  video?: Video;
  talent?: Talent;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingCampaign {
  id: string;
  videoId: string;
  userId: string;
  name: string;
  platform: string;
  campaignType: string;
  scheduledDate?: string;
  publishedDate?: string;
  status: 'draft' | 'scheduled' | 'published' | 'completed';
  caption?: string;
  hashtags?: string;
  mediaUrl?: string;
  postUrl?: string;
  aiGeneratedCopy?: string;
  aiSuggestions?: string;
  impressions?: number;
  engagement?: number;
  clicks?: number;
  adBudget: number;
  adSpent: number;
  notes?: string;
  video?: Video;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai_insight';
  category?: string;
  entityType?: string;
  entityId?: string;
  link?: string;
  isRead: boolean;
  isAIGenerated: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  videoStats: {
    total: number;
    byStatus: Record<string, number>;
    inProduction: number;
    published: number;
  };
  budgetStats: {
    totalPlanned: number;
    totalActual: number;
    atRisk: number;
    overBudget: number;
  };
  talentCount: number;
  campaignStats: {
    total: number;
    scheduled: number;
    published: number;
  };
  upcomingDeadlines: Video[];
  upcomingCampaigns: MarketingCampaign[];
  recentVideos: Video[];
  financialHealth: number;
}

export interface AIBriefing {
  pendingVideos: number;
  upcomingDeadlines: any[];
  budgetAlerts: any[];
  todayTasks: string[];
  aiInsights: string;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  message?: string;
  tokensUsed?: number;
}
