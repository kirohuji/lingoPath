import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TagService } from "./tag.service";

@Controller("tags")
@UseGuards(AuthGuard("jwt"))
export class TagController {
  constructor(private readonly service: TagService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.service.create(body.name);
  }
}
