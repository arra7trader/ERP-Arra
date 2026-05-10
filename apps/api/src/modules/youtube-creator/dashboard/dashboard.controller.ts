import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary/:userId')
  @ApiOperation({ summary: 'Get dashboard summary' })
  async getSummary(@Param('userId') userId: string) {
    return this.dashboardService.getDashboardSummary(userId);
  }

  @Get('briefing/:userId')
  @ApiOperation({ summary: 'Get AI daily briefing' })
  async getBriefing(@Param('userId') userId: string) {
    return this.dashboardService.getAIBriefing(userId);
  }

  @Get('calendar/:userId')
  @ApiOperation({ summary: 'Get production calendar' })
  async getCalendar(
    @Param('userId') userId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.dashboardService.getProductionCalendar(userId, month, year);
  }

  @Get('financial/:userId')
  @ApiOperation({ summary: 'Get financial overview' })
  async getFinancial(@Param('userId') userId: string) {
    return this.dashboardService.getFinancialOverview(userId);
  }
}
