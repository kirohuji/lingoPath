import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { LoginDto, RegisterDto } from "./dto";
import { Inject } from "@nestjs/common";
import { REDIS } from "@/infrastructure/cache/redis.module";
import type { Redis } from "ioredis";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { extension } from "mime-types";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException("Email already exists");

    const passwordHash = await hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });
    return this.signToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException("Invalid credentials");
    const ok = await compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Invalid credentials");
    return this.signToken(user.id, user.email);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
    if (user?.avatarUrl?.startsWith("data:image/")) {
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(user.avatarUrl);
      if (match) {
        const ext = extension(match[1]) || "bin";
        const fileName = `${randomUUID()}.${ext}`;
        const relativePath = `/uploads/avatars/${fileName}`;
        const fullDir = join(process.cwd(), "uploads", "avatars");
        await mkdir(fullDir, { recursive: true });
        await writeFile(join(fullDir, fileName), Buffer.from(match[2], "base64"));
        const base = process.env.ASSET_BASE_URL || `http://localhost:${process.env.PORT ? Number(process.env.PORT) : 3000}`;
        const avatarUrl = `${base}${relativePath}`;
        await this.prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });
        user.avatarUrl = avatarUrl;
      }
    }
    const permissions =
      user?.roleAssignments.flatMap((a) =>
        a.role.permissions.map((rp) => rp.permission.code),
      ) ?? [];
    return {
      user,
      permissions: [...new Set(permissions)],
      menus: [],
    };
  }

  async logout(token: string) {
    await this.redis.set(`blacklist:token:${token}`, "1", "EX", 3600);
    return { success: true };
  }

  getOAuthProviders() {
    return {
      google: false,
      github: false,
      wechat: false,
    };
  }

  private signToken(id: string, email: string) {
    return {
      accessToken: this.jwt.sign({ sub: id, email }),
      tokenType: "Bearer",
    };
  }
}
