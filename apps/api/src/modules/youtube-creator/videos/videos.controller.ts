import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VideosService } from './videos.service';

@ApiTags('Videos')
@Controller('api/videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @ApiOperation({ summary: 'Create new video project' })
  async create(@Body() body: { userId: string; data: any }) {
    return this.videosService.create(body.userId, body.data);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all videos for user' })
  async findAll(
    @Param('userId') userId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
  ) {
    return this.videosService.findAll(userId, { status, priority, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  async findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update video' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.videosService.update(id, data);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update video status' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.videosService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete video' })
  async delete(@Param('id') id: string) {
    return this.videosService.delete(id);
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get video statistics' })
  async getStats(@Param('userId') userId: string) {
    return this.videosService.getVideoStats(userId);
  }

  @Get('deadlines/:userId')
  @ApiOperation({ summary: 'Get upcoming deadlines' })
  async getDeadlines(
    @Param('userId') userId: string,
    @Query('days') days?: number,
  ) {
    return this.videosService.getUpcomingDeadlines(userId, days || 7);
  }
}
