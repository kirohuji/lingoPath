import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { hash } from "bcryptjs";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        roleAssignments: {
          include: { role: true },
        },
      },
    });
  }

  async create(data: { email: string; name?: string; avatarUrl?: string; password?: string; roleCodes?: string[] }) {
    const roleCodes = data.roleCodes || [];
    const roles = roleCodes.length
      ? await this.prisma.role.findMany({ where: { code: { in: roleCodes } } })
      : [];
    const passwordHash = await hash(data.password || "123456", 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
        passwordHash,
        roleAssignments: roles.length
          ? {
              createMany: {
                data: roles.map((role) => ({ roleId: role.id })),
              },
            }
          : undefined,
      },
      include: {
        roleAssignments: {
          include: { role: true },
        },
      },
    });
  }

  async update(id: string, data: { email?: string; name?: string; avatarUrl?: string; roleCodes?: string[] }) {
    if (data.roleCodes) {
      const roles = await this.prisma.role.findMany({ where: { code: { in: data.roleCodes } } });
      await this.prisma.roleAssignment.deleteMany({ where: { userId: id } });
      if (roles.length) {
        await this.prisma.roleAssignment.createMany({
          data: roles.map((role) => ({ userId: id, roleId: role.id })),
        });
      }
    }
    return this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
      include: {
        roleAssignments: {
          include: { role: true },
        },
      },
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
