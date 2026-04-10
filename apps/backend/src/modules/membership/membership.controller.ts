import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "@/shared/decorators/current-user.decorator";
import { MembershipService } from "./membership.service";

@Controller("memberships")
@UseGuards(AuthGuard("jwt"))
export class MembershipController {
  constructor(private readonly service: MembershipService) {}

  @Get("account")
  account(@CurrentUser() user: { id: string }) {
    return this.service.getAccount(user.id);
  }

  @Get("ledger")
  ledger(@CurrentUser() user: { id: string }) {
    return this.service.ledger(user.id);
  }

  @Post("adjust")
  adjust(
    @CurrentUser() user: { id: string },
    @Body() body: { changeValue: number; reason: string },
  ) {
    return this.service.changePoints(user.id, body.changeValue, body.reason);
  }
}
