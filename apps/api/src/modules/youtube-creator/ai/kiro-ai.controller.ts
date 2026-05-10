import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KiroAIService } from './kiro-ai.service';

@ApiTags('AI')
@Controller('api/ai')
export class KiroAIController {
  constructor(private readonly kiroAIService: KiroAIService) {}

  @Get('briefing/:userId')
  @ApiOperation({ summary: 'Get daily AI briefing' })
  async getDailyBriefing(@Param('userId') userId: string) {
    return this.kiroAIService.getDailyBriefing(userId);
  }

  @Post('suggest-schedule')
  @ApiOperation({ summary: 'Get AI schedule suggestion for video' })
  async suggestSchedule(
    @Body() body: { userId: string; videoId: string; videoData: any },
  ) {
    return this.kiroAIService.suggestSchedule(body.userId, body.videoId, body.videoData);
  }

  @Post('analyze-budget')
  @ApiOperation({ summary: 'Analyze budget with AI' })
  async analyzeBudget(
    @Body() body: { userId: string; videoId: string; budgetData: any[] },
  ) {
    return this.kiroAIService.analyzeBudget(body.userId, body.videoId, body.budgetData);
  }

  @Post('generate-marketing-copy')
  @ApiOperation({ summary: 'Generate marketing copy with AI' })
  async generateMarketingCopy(
    @Body() body: { userId: string; videoId: string; videoData: any; platform: string },
  ) {
    return this.kiroAIService.generateMarketingCopy(body.userId, body.videoId, body.videoData, body.platform);
  }

  @Post('suggest-publish-time')
  @ApiOperation({ summary: 'Get optimal publish time suggestion' })
  async suggestPublishTime(
    @Body() body: { userId: string; videoId: string; category: string },
  ) {
    return this.kiroAIService.suggestOptimalPublishTime(body.userId, body.videoId, body.category);
  }

  @Post('generate-rab')
  @ApiOperation({ summary: 'Generate RAB draft with AI' })
  async generateRABDraft(
    @Body() body: { userId: string; videoData: any },
  ) {
    return this.kiroAIService.generateRABDraft(body.userId, body.videoData);
  }
}
