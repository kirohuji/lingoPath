import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.ticket.findMany({
      include: { replies: true, logs: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: { userId: string; subject: string; content: string; priority?: string }) {
    const ticket = await this.prisma.ticket.create({
      data: {
        userId: data.userId,
        subject: data.subject,
        content: data.content,
        priority: data.priority || "normal",
      },
    });
    await this.prisma.ticketLog.create({
      data: { ticketId: ticket.id, action: "created" },
    });
    return ticket;
  }

  async reply(ticketId: string, content: string) {
    const reply = await this.prisma.ticketReply.create({
      data: { ticketId, content },
    });
    await this.prisma.ticketLog.create({
      data: { ticketId, action: "replied", remark: content.slice(0, 60) },
    });
    return reply;
  }

  async updateStatus(ticketId: string, status: string) {
    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });
    await this.prisma.ticketLog.create({
      data: { ticketId, action: "status_changed", remark: status },
    });
    return ticket;
  }
}
