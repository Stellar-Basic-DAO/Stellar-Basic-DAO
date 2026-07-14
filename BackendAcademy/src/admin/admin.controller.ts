import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAdminGuard } from '../auth/guards/jwt-admin.guard';

@Controller('admin')
@UseGuards(JwtAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics/summary')
  async getDashboardSummary() {
    return this.adminService.getDashboardSummary();
  }
}
