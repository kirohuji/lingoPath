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

  async markRead(userId: string, id: string) {
    const data = await this.prisma.notification.update({
      where: { id, userId },
      data: { read: true },
    });
    this.realtime.emitNotificationsChanged(userId);
    return data;
  }
}
