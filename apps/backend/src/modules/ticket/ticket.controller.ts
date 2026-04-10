import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "@/shared/decorators/current-user.decorator";
import { TicketService } from "./ticket.service";

@Controller("tickets")
@UseGuards(AuthGuard("jwt"))
export class TicketController {
  constructor(private readonly service: TicketService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() body: { subject: string; content: string; priority?: string },
  ) {
    return this.service.create({
      userId: user.id,
      subject: body.subject,
      content: body.content,
      priority: body.priority,
    });
  }

  @Post(":id/replies")
  reply(@Param("id") id: string, @Body() body: { content: string }) {
    return this.service.reply(id, body.content);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status);
  }
}
