import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
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
}
