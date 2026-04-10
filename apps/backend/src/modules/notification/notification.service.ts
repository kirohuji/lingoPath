import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { PageQueryDto } from "@/shared/dto/page-query.dto";
import { PageResultDto } from "@/shared/dto/page-result.dto";
import { RealtimeGateway } from "../realtime/realtime.gateway";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async list(userId: string, query: PageQueryDto): Promise<PageResultDto<any>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const where = { userId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async create(data: { userId: string; title: string; body: string; type?: string }) {
    const created = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type || "system",
      },
    });
    this.realtime.emitNotificationsChanged(data.userId);
    return created;
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
    const data = await this.prisma.notification.findUnique({ where: { id } });
    this.realtime.emitNotificationsChanged(userId);
    return data;
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    this.realtime.emitNotificationsChanged(userId);
    return { success: true };
  }
}
