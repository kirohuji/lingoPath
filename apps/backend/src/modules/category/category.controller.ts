import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CategoryService } from "./category.service";
import { BaseController } from "@/shared/base/base.controller";
import { Category } from "@prisma/client";

@Controller("categories")
@UseGuards(AuthGuard("jwt"))
export class CategoryController extends BaseController<
  Category,
  { parentId?: string; level: number; name: string; sort?: number },
  { name?: string; sort?: number; status?: number }
> {
  private readonly categoryService: CategoryService;

  constructor(service: CategoryService) {
    super(service);
    this.categoryService = service;
  }

  @Get("tree")
  tree() {
    return this.categoryService.tree();
  }
}
