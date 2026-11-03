import { Module } from '@nestjs/common';
import { DashboardModule } from '../dashboard/dashboard.module';
import { AdminAuditService } from './admin-audit.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { FirstAccessController } from './first-access.controller';

@Module({
  imports: [DashboardModule],
  controllers: [AdminUsersController, FirstAccessController],
  providers: [AdminUsersService, AdminAuditService],
})
export class AdminUsersModule {}
