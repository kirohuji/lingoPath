import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";

@Injectable()
export class TextbookService {
  constructor(private readonly prisma: PrismaService) {}

  list(keyword?: string) {
    return this.prisma.textbook.findMany({
      where: keyword ? { title: { contains: keyword, mode: "insensitive" } } : undefined,
      include: { episodes: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  create(data: { title: string; description?: string; coverUrl?: string }) {
    return this.prisma.textbook.create({ data });
  }

  createEpisode(textbookId: string, data: { title: string; content?: string; sort?: number }) {
    return this.prisma.textbookEpisode.create({
      data: { textbookId, title: data.title, content: data.content, sort: data.sort ?? 0 },
    });
  }
}
