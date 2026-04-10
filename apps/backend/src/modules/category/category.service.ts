import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  tree() {
    return this.prisma.category.findMany({ orderBy: [{ level: "asc" }, { sort: "asc" }] });
  }

  async create(data: { parentId?: string; level: number; name: string; sort?: number }) {
    if (data.level < 1 || data.level > 3) throw new BadRequestException("Category level must be 1-3");
    return this.prisma.category.create({
      data: {
        parentId: data.parentId,
        level: data.level,
        name: data.name,
        sort: data.sort || 0,
        path: data.parentId ? `${data.parentId}` : "root",
      },
    });
  }

  update(id: string, data: { name?: string; sort?: number; status?: number }) {
    return this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        sort: data.sort,
        status: data.status,
      },
    });
  }

  async remove(id: string) {
    const childCount = await this.prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException("Cannot delete category with children");
    }
    return this.prisma.category.delete({ where: { id } });
  }
}
