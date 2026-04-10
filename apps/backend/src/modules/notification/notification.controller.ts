import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "@/shared/decorators/current-user.decorator";
import { NotificationService } from "./notification.service";

@Controller("notifications")
@UseGuards(AuthGuard("jwt"))
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.service.list(user.id);
  }

  @Get("unread-count")
  unreadCount(@CurrentUser() user: { id: string }) {
    return this.service.unreadCount(user.id);
  }

  @Post()
  create(
    @Body()
    body: { userId: string; title: string; body: string; type?: string },
  ) {
    return this.service.create(body);
  }

  @Patch(":id/read")
  read(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.service.markRead(user.id, id);
  }

  @Patch("read-all")
  readAll(@CurrentUser() user: { id: string }) {
    return this.service.markAllRead(user.id);
  }
}
