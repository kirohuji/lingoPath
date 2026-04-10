import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { BaseCrudService } from "@/shared/base/base-crud.service";
import { Tag } from "@prisma/client";

@Injectable()
export class TagService extends BaseCrudService<
  Tag,
  { name: string },
  { name?: string }
> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected doList() {
    return this.prisma.tag.findMany({ orderBy: { createdAt: "desc" } });
  }

  protected doCreate(data: { name: string }) {
    return this.prisma.tag.create({ data });
  }

  protected doUpdate(id: string, data: { name?: string }) {
    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  protected doDelete(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }
}
