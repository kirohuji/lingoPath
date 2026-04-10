import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
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
