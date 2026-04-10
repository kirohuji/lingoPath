import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
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

  @Post()
  create(
    @Body()
    body: { email: string; name?: string; avatarUrl?: string; password?: string; roleCodes?: string[] },
  ) {
    return this.service.create(body);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: { email?: string; name?: string; avatarUrl?: string; roleCodes?: string[] },
  ) {
    return this.service.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
