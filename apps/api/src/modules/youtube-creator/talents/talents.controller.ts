import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TalentsService } from './talents.service';

@ApiTags('Talents')
@Controller('api/talents')
export class TalentsController {
  constructor(private readonly talentsService: TalentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create talent' })
  async create(@Body() body: { userId: string; data: any }) {
    return this.talentsService.create(body.userId, body.data);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all talents for user' })
  async findAll(
    @Param('userId') userId: string,
    @Query('specialty') specialty?: string,
    @Query('gender') gender?: string,
  ) {
    return this.talentsService.findAll(userId, { specialty, gender });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get talent by ID' })
  async findOne(@Param('id') id: string) {
    return this.talentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update talent' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.talentsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete talent (soft)' })
  async delete(@Param('id') id: string) {
    return this.talentsService.delete(id);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign talent to video' })
  async assignToVideo(@Body() body: { videoId: string; talentId: string; data: any }) {
    return this.talentsService.assignToVideo(body.videoId, body.talentId, body.data);
  }

  @Put('video-talent/:id')
  @ApiOperation({ summary: 'Update video-talent assignment' })
  async updateVideoTalent(@Param('id') id: string, @Body() data: any) {
    return this.talentsService.updateVideoTalent(id, data);
  }

  @Post('video-talent/:id/payment')
  @ApiOperation({ summary: 'Record talent payment' })
  async recordPayment(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.talentsService.recordTalentPayment(id, body.amount);
  }

  @Delete('video/:videoId/talent/:talentId')
  @ApiOperation({ summary: 'Remove talent from video' })
  async removeFromVideo(
    @Param('videoId') videoId: string,
    @Param('talentId') talentId: string,
  ) {
    return this.talentsService.removeFromVideo(videoId, talentId);
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get talent statistics' })
  async getStats(@Param('userId') userId: string) {
    return this.talentsService.getTalentStats(userId);
  }
}
