import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CategoryService } from "./category.service";

@Controller("categories")
@UseGuards(AuthGuard("jwt"))
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get("tree")
  tree() {
    return this.service.tree();
  }

  @Post()
  create(@Body() body: { parentId?: string; level: number; name: string; sort?: number }) {
    return this.service.create(body);
  }
}
