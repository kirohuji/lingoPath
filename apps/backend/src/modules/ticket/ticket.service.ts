import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { PageQueryDto } from "@/shared/dto/page-query.dto";
import { PageResultDto } from "@/shared/dto/page-result.dto";

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PageQueryDto): Promise<PageResultDto<any>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        include: { replies: true, logs: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.ticket.count(),
    ]);

    return { items, total, page, pageSize };
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
