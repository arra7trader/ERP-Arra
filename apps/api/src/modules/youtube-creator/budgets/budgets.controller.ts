import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';

@ApiTags('Budgets')
@Controller('api/budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create budget item' })
  async create(@Body() body: { userId: string; videoId: string; data: any }) {
    return this.budgetsService.create(body.userId, body.videoId, body.data);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple budget items' })
  async createBulk(@Body() body: { userId: string; videoId: string; items: any[] }) {
    return this.budgetsService.createBulk(body.userId, body.videoId, body.items);
  }

  @Get('video/:videoId')
  @ApiOperation({ summary: 'Get budgets by video' })
  async findByVideo(@Param('videoId') videoId: string) {
    return this.budgetsService.findByVideo(videoId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all budgets for user' })
  async findByUser(@Param('userId') userId: string) {
    return this.budgetsService.findByUser(userId);
  }

  @Get('summary/:videoId')
  @ApiOperation({ summary: 'Get RAB summary for video' })
  async getSummary(@Param('videoId') videoId: string) {
    return this.budgetsService.getVideoRABSummary(videoId);
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get budget statistics for user' })
  async getStats(@Param('userId') userId: string) {
    return this.budgetsService.getUserBudgetStats(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update budget item' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.budgetsService.update(id, data);
  }

  @Post(':id/expense')
  @ApiOperation({ summary: 'Record expense for budget item' })
  async recordExpense(
    @Param('id') id: string,
    @Body() body: { amount: number; paymentMethod?: string; notes?: string },
  ) {
    return this.budgetsService.recordExpense(id, body.amount, body.paymentMethod, body.notes);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete budget item' })
  async delete(@Param('id') id: string) {
    return this.budgetsService.delete(id);
  }

  @Post('analyze/:videoId')
  @ApiOperation({ summary: 'Analyze budget with AI' })
  async analyzeWithAI(
    @Param('videoId') videoId: string,
    @Body() body: { userId: string },
  ) {
    return this.budgetsService.analyzeWithAI(body.userId, videoId);
  }
}
