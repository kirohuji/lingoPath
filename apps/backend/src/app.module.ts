import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./modules/auth/auth.module";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { MembershipModule } from "./modules/membership/membership.module";
import { CategoryModule } from "./modules/category/category.module";
import { TagModule } from "./modules/tag/tag.module";
import { TextbookModule } from "./modules/textbook/textbook.module";
import { TicketModule } from "./modules/ticket/ticket.module";
import { RedisModule } from "./infrastructure/cache/redis.module";
import { QueueModule } from "./infrastructure/queue/queue.module";
import { AuditModule } from "./modules/audit/audit.module";
import { SystemConfigModule } from "./modules/system-config/system-config.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    RedisModule,
    QueueModule,
    AuthModule,
    RealtimeModule,
    NotificationModule,
    MembershipModule,
    CategoryModule,
    TagModule,
    TextbookModule,
    TicketModule,
    AuditModule,
    SystemConfigModule,
  ],
})
export class AppModule {}
