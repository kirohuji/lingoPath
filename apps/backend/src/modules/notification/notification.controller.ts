import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
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

  @Patch(":id/read")
  read(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.service.markRead(user.id, id);
  }
}
