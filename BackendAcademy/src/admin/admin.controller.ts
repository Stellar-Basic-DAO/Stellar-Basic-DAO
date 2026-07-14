import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';

@Controller('admin')
@UseGuards(DevAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics/summary')
  async getDashboardSummary() {
    return this.adminService.getDashboardSummary();
  }
}
