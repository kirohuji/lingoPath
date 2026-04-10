import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { PageQueryDto } from "@/shared/dto/page-query.dto";
import { PageResultDto } from "@/shared/dto/page-result.dto";

@Injectable()
export class TextbookService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PageQueryDto, keyword?: string): Promise<PageResultDto<any>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const where = keyword ? { title: { contains: keyword, mode: "insensitive" as const } } : undefined;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.textbook.findMany({
        where,
        include: { episodes: true, tags: { include: { tag: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.textbook.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  create(data: { title: string; description?: string; coverUrl?: string }) {
    return this.prisma.textbook.create({ data });
  }

  update(id: string, data: { title?: string; description?: string; coverUrl?: string; status?: string }) {
    return this.prisma.textbook.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.textbook.delete({ where: { id } });
  }

  createEpisode(textbookId: string, data: { title: string; content?: string; sort?: number }) {
    return this.prisma.textbookEpisode.create({
      data: { textbookId, title: data.title, content: data.content, sort: data.sort ?? 0 },
    });
  }

  updateEpisode(
    id: string,
    data: { title?: string; content?: string; sort?: number; status?: string },
  ) {
    return this.prisma.textbookEpisode.update({
      where: { id },
      data,
    });
  }

  removeEpisode(id: string) {
    return this.prisma.textbookEpisode.delete({ where: { id } });
  }
}
