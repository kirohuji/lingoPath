import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { BaseCrudService } from "@/shared/base/base-crud.service";
import { Category } from "@prisma/client";

@Injectable()
export class CategoryService extends BaseCrudService<
  Category,
  { parentId?: string; level: number; name: string; sort?: number },
  { name?: string; sort?: number; status?: number }
> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  tree() {
    return this.prisma.category.findMany({ orderBy: [{ level: "asc" }, { sort: "asc" }] });
  }

  protected async beforeCreate(data: {
    parentId?: string;
    level: number;
    name: string;
    sort?: number;
  }) {
    if (data.level < 1 || data.level > 3) {
      throw new BadRequestException("Category level must be 1-3");
    }
  }

  protected doList() {
    return this.tree();
  }

  protected doCreate(data: {
    parentId?: string;
    level: number;
    name: string;
    sort?: number;
  }) {
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

  protected doUpdate(id: string, data: { name?: string; sort?: number; status?: number }) {
    return this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        sort: data.sort,
        status: data.status,
      },
    });
  }

  protected async beforeDelete(id: string) {
    const childCount = await this.prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException("Cannot delete category with children");
    }
  }

  protected doDelete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
