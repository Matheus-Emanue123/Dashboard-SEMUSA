import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SupabaseService } from './supabase.service';

@Module({
  controllers: [DashboardController],
  providers: [SupabaseService, DashboardService],
})
export class DashboardModule {}
