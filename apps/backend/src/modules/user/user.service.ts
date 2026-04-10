import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { extension } from "mime-types";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadAvatar(file: Express.Multer.File) {
    const ext = extension(file.mimetype) || "bin";
    const fileName = `${randomUUID()}.${ext}`;
    const relativePath = `/uploads/avatars/${fileName}`;
    const fullDir = join(process.cwd(), "uploads", "avatars");
    const fullPath = join(fullDir, fileName);

    await mkdir(fullDir, { recursive: true });
    await writeFile(fullPath, file.buffer);

    const base = process.env.ASSET_BASE_URL || `http://localhost:${process.env.PORT ? Number(process.env.PORT) : 3000}`;
    return { url: `${base}${relativePath}` };
  }

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
