import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
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

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: { title?: string; description?: string; coverUrl?: string; status?: string },
  ) {
    return this.service.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post(":id/episodes")
  createEpisode(
    @Param("id") id: string,
    @Body() body: { title: string; content?: string; sort?: number },
  ) {
    return this.service.createEpisode(id, body);
  }

  @Patch("episodes/:episodeId")
  updateEpisode(
    @Param("episodeId") episodeId: string,
    @Body() body: { title?: string; content?: string; sort?: number; status?: string },
  ) {
    return this.service.updateEpisode(episodeId, body);
  }

  @Delete("episodes/:episodeId")
  removeEpisode(@Param("episodeId") episodeId: string) {
    return this.service.removeEpisode(episodeId);
  }
}
