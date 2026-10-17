import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DashboardModule } from '../dashboard/dashboard.module';
import { AuditMiddleware } from './audit.middleware';

@Module({
  imports: [DashboardModule],
})
export class AuditModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditMiddleware).forRoutes('{*splat}');
  }
}
