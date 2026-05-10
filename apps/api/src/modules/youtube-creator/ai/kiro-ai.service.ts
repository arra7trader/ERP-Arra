import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface AIResponse {
  success: boolean;
  data?: any;
  message?: string;
  tokensUsed?: number;
}

export interface BriefingData {
  pendingVideos: number;
  upcomingDeadlines: any[];
  budgetAlerts: any[];
  todayTasks: string[];
  aiInsights: string;
}

@Injectable()
export class KiroAIService {
  private readonly logger = new Logger(KiroAIService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.kiro.ai/v1/chat/completions';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('KIRO_AI_API_KEY') || '';
  }

  private async callKiroAPI(prompt: string, context?: string): Promise<AIResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'kiro-v1',
          messages: [
            {
              role: 'system',
              content: `Kamu adalah asisten AI untuk YouTube Creator ERP. Tugasmu membantu creator mengelola produksi video, anggaran, talent, dan marketing. Berikan respons dalam Bahasa Indonesia yang ringkas dan actionable. ${context || ''}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.choices?.[0]?.message?.content || '',
        tokensUsed: data.usage?.total_tokens,
      };
    } catch (error) {
      this.logger.error('Kiro AI API Error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async logAIInteraction(
    userId: string,
    requestType: string,
    prompt: string,
    response: string,
    context?: string,
    entityType?: string,
    entityId?: string,
    tokensUsed?: number,
    status: string = 'success',
    errorMessage?: string,
  ) {
    return this.prisma.aILog.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        requestType,
        prompt,
        response,
        context,
        entityType,
        entityId,
        tokensUsed,
        status,
        errorMessage,
      },
    });
  }

  async getDailyBriefing(userId: string): Promise<BriefingData> {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get pending videos
    const pendingVideos = await this.prisma.video.count({
      where: {
        userId,
        status: { in: ['ideation', 'pre_production', 'production', 'post_production'] },
      },
    });

    // Get upcoming deadlines
    const upcomingDeadlines = await this.prisma.video.findMany({
      where: {
        userId,
        plannedEndDate: {
          gte: today,
          lte: nextWeek,
        },
      },
      select: {
        id: true,
        title: true,
        plannedEndDate: true,
        status: true,
      },
      orderBy: { plannedEndDate: 'asc' },
      take: 5,
    });

    // Get budget alerts (over budget or at risk)
    const budgetAlerts = await this.prisma.budget.findMany({
      where: {
        userId,
        OR: [
          { aiRiskFlag: true },
          { status: 'over_budget' },
        ],
      },
      include: {
        video: { select: { title: true } },
      },
      take: 5,
    });

    // Generate AI insights
    const contextData = {
      pendingVideos,
      upcomingDeadlines: upcomingDeadlines.length,
      budgetAlerts: budgetAlerts.length,
    };

    const aiResponse = await this.callKiroAPI(
      `Berikan briefing harian singkat untuk creator dengan data: ${JSON.stringify(contextData)}. Fokus pada prioritas hari ini dan potensi risiko.`,
      'Ini adalah daily briefing untuk dashboard creator.'
    );

    const todayTasks = [
      pendingVideos > 0 ? `Review ${pendingVideos} video dalam produksi` : null,
      upcomingDeadlines.length > 0 ? `${upcomingDeadlines.length} deadline dalam 7 hari ke depan` : null,
      budgetAlerts.length > 0 ? `${budgetAlerts.length} alert anggaran perlu perhatian` : null,
    ].filter(Boolean) as string[];

    await this.logAIInteraction(
      userId,
      'briefing',
      'Daily briefing request',
      aiResponse.data || 'Briefing generated',
      JSON.stringify(contextData),
      undefined,
      undefined,
      aiResponse.tokensUsed,
    );

    return {
      pendingVideos,
      upcomingDeadlines,
      budgetAlerts,
      todayTasks,
      aiInsights: aiResponse.data || 'Selamat pagi! Siap untuk produktif hari ini.',
    };
  }

  async suggestSchedule(userId: string, videoId: string, videoData: any): Promise<AIResponse> {
    const prompt = `Berdasarkan data video berikut, sarankan jadwal produksi optimal:
    - Judul: ${videoData.title}
    - Konsep: ${videoData.concept || 'Belum ada'}
    - Durasi target: ${videoData.duration || 15} menit
    - Kategori: ${videoData.category || 'General'}
    
    Berikan timeline dari pre-production hingga publish dengan estimasi waktu untuk setiap tahap.`;

    const response = await this.callKiroAPI(prompt, 'Kamu ahli dalam production scheduling untuk YouTube content.');
    
    await this.logAIInteraction(
      userId,
      'schedule_suggestion',
      prompt,
      response.data || '',
      JSON.stringify(videoData),
      'video',
      videoId,
      response.tokensUsed,
      response.success ? 'success' : 'error',
      response.message,
    );

    return response;
  }

  async analyzeBudget(userId: string, videoId: string, budgetData: any[]): Promise<AIResponse> {
    const totalPlanned = budgetData.reduce((sum, b) => sum + b.plannedAmount, 0);
    const totalActual = budgetData.reduce((sum, b) => sum + b.actualAmount, 0);
    const categories = budgetData.map(b => ({ category: b.category, planned: b.plannedAmount, actual: b.actualAmount }));

    const prompt = `Analisis RAB video dengan data:
    - Total Rencana: Rp ${totalPlanned.toLocaleString()}
    - Total Aktual: Rp ${totalActual.toLocaleString()}
    - Breakdown: ${JSON.stringify(categories)}
    
    Identifikasi risiko over-budget dan berikan rekomendasi penghematan jika diperlukan.`;

    const response = await this.callKiroAPI(prompt, 'Kamu ahli dalam budget management untuk content production.');

    await this.logAIInteraction(
      userId,
      'budget_analysis',
      prompt,
      response.data || '',
      JSON.stringify(budgetData),
      'video',
      videoId,
      response.tokensUsed,
      response.success ? 'success' : 'error',
      response.message,
    );

    return response;
  }

  async generateMarketingCopy(userId: string, videoId: string, videoData: any, platform: string): Promise<AIResponse> {
    const prompt = `Buat marketing copy untuk video YouTube:
    - Judul: ${videoData.title}
    - Deskripsi: ${videoData.description || ''}
    - Kategori: ${videoData.category || 'General'}
    - Tags: ${videoData.tags || ''}
    - Platform target: ${platform}
    
    Buat caption menarik dengan hashtag yang relevan untuk ${platform}. Gunakan tone yang engaging dan sesuai platform.`;

    const response = await this.callKiroAPI(prompt, 'Kamu ahli social media marketing untuk YouTube creators.');

    await this.logAIInteraction(
      userId,
      'marketing_copy',
      prompt,
      response.data || '',
      JSON.stringify({ videoData, platform }),
      'video',
      videoId,
      response.tokensUsed,
      response.success ? 'success' : 'error',
      response.message,
    );

    return response;
  }

  async suggestOptimalPublishTime(userId: string, videoId: string, category: string): Promise<AIResponse> {
    const prompt = `Sarankan waktu publish optimal untuk video YouTube dengan kategori "${category}" untuk audience Indonesia. Pertimbangkan:
    - Peak hours YouTube Indonesia
    - Hari terbaik dalam seminggu
    - Kompetisi dengan creator lain
    
    Berikan 3 slot waktu terbaik dengan alasannya.`;

    const response = await this.callKiroAPI(prompt, 'Kamu ahli YouTube analytics dan audience behavior Indonesia.');

    await this.logAIInteraction(
      userId,
      'publish_time_suggestion',
      prompt,
      response.data || '',
      JSON.stringify({ category }),
      'video',
      videoId,
      response.tokensUsed,
      response.success ? 'success' : 'error',
      response.message,
    );

    return response;
  }

  async generateRABDraft(userId: string, videoData: any): Promise<AIResponse> {
    const prompt = `Buat draft RAB (Rencana Anggaran Biaya) untuk produksi video:
    - Judul: ${videoData.title}
    - Konsep: ${videoData.concept || 'Video standar'}
    - Durasi: ${videoData.duration || 15} menit
    - Kategori: ${videoData.category || 'General'}
    
    Berikan estimasi biaya untuk kategori: talent_fee, equipment, location, editing, marketing, misc.
    Format: JSON array dengan {category, description, estimatedAmount}`;

    const response = await this.callKiroAPI(prompt, 'Kamu ahli production budgeting untuk YouTube Indonesia.');

    await this.logAIInteraction(
      userId,
      'rab_draft',
      prompt,
      response.data || '',
      JSON.stringify(videoData),
      'video',
      undefined,
      response.tokensUsed,
      response.success ? 'success' : 'error',
      response.message,
    );

    return response;
  }
}
