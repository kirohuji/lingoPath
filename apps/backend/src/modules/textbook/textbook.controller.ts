import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TextbookService } from "./textbook.service";

@Controller("textbooks")
@UseGuards(AuthGuard("jwt"))
export class TextbookController {
  constructor(private readonly service: TextbookService) {}

  @Get()
  list(@Query("keyword") keyword?: string) {
    return this.service.list(keyword);
  }

  @Post()
  create(@Body() body: { title: string; description?: string; coverUrl?: string }) {
    return this.service.create(body);
  }

  @Post(":id/episodes")
  createEpisode(
    @Param("id") id: string,
    @Body() body: { title: string; content?: string; sort?: number },
  ) {
    return this.service.createEpisode(id, body);
  }
}
