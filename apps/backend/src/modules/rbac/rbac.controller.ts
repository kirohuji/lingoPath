import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RbacService } from "./rbac.service";

@Controller()
@UseGuards(AuthGuard("jwt"))
export class RbacController {
  constructor(private readonly service: RbacService) {}

  @Get("roles")
  roles() {
    return this.service.listRoles();
  }

  @Post("roles")
  createRole(@Body() body: { name: string; code: string }) {
    return this.service.createRole(body);
  }

  @Patch("roles/permissions")
  bindRolePermissions(@Body() body: { roleId: string; permissionIds: string[] }) {
    return this.service.bindRolePermissions(body.roleId, body.permissionIds);
  }

  @Get("permissions")
  permissions() {
    return this.service.listPermissions();
  }

  @Post("permissions")
  createPermission(@Body() body: { name: string; code: string; type: string }) {
    return this.service.createPermission(body);
  }

  @Patch("users/role")
  assignUserRole(@Body() body: { userId: string; roleId: string }) {
    return this.service.assignUserRole(body.userId, body.roleId);
  }
}
