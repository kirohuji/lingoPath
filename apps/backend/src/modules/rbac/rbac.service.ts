import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  listRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  createRole(data: { name: string; code: string }) {
    return this.prisma.role.create({ data });
  }

  listPermissions() {
    return this.prisma.permission.findMany({ orderBy: { createdAt: "desc" } });
  }

  createPermission(data: { name: string; code: string; type: string }) {
    return this.prisma.permission.create({ data });
  }

  async bindRolePermissions(roleId: string, permissionIds: string[]) {
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    if (permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      });
    }
    return this.listRoles();
  }

  async assignUserRole(userId: string, roleId: string) {
    await this.prisma.roleAssignment.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId },
    });
    return { success: true };
  }
}
