import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.tag.findMany({ orderBy: { createdAt: "desc" } });
  }

  create(name: string) {
    return this.prisma.tag.create({ data: { name } });
  }
}
