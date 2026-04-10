import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UserService } from "./user.service";

@Controller("users")
@UseGuards(AuthGuard("jwt"))
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  list() {
    return this.service.list();
  }
}
