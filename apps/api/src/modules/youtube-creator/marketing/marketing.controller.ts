import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';

@ApiTags('Marketing')
@Controller('api/marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post()
  @ApiOperation({ summary: 'Create marketing campaign' })
  async create(@Body() body: { userId: string; videoId: string; data: any }) {
    return this.marketingService.create(body.userId, body.videoId, body.data);
  }

  @Get('video/:videoId')
  @ApiOperation({ summary: 'Get campaigns by video' })
  async findByVideo(@Param('videoId') videoId: string) {
    return this.marketingService.findByVideo(videoId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all campaigns for user' })
  async findByUser(
    @Param('userId') userId: string,
    @Query('platform') platform?: string,
    @Query('status') status?: string,
  ) {
    return this.marketingService.findByUser(userId, { platform, status });
  }

  @Get('upcoming/:userId')
  @ApiOperation({ summary: 'Get upcoming campaigns' })
  async getUpcoming(@Param('userId') userId: string, @Query('days') days?: number) {
    return this.marketingService.getUpcomingCampaigns(userId, days || 7);
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get marketing statistics' })
  async getStats(@Param('userId') userId: string) {
    return this.marketingService.getMarketingStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  async findOne(@Param('id') id: string) {
    return this.marketingService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update campaign' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete campaign' })
  async delete(@Param('id') id: string) {
    return this.marketingService.delete(id);
  }

  @Post(':id/generate-copy')
  @ApiOperation({ summary: 'Generate AI marketing copy' })
  async generateCopy(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.marketingService.generateAICopy(body.userId, id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Mark campaign as published' })
  async publish(@Param('id') id: string, @Body() body: { postUrl?: string }) {
    return this.marketingService.publishCampaign(id, body.postUrl);
  }

  @Put(':id/metrics')
  @ApiOperation({ summary: 'Update campaign metrics' })
  async updateMetrics(
    @Param('id') id: string,
    @Body() metrics: { impressions?: number; engagement?: number; clicks?: number },
  ) {
    return this.marketingService.updateMetrics(id, metrics);
  }
}
