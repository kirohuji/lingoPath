import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { REDIS } from "@/infrastructure/cache/redis.module";
import type { Redis } from "ioredis";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(REDIS) private readonly redis: Redis) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "dev-secret",
      passReqToCallback: true,
    });
  }

  async validate(
    req: { headers: { authorization?: string } },
    payload: { sub: string; email: string },
  ) {
    const token = req.headers.authorization?.replace("Bearer ", "") || "";
    if (token) {
      const blocked = await this.redis.get(`blacklist:token:${token}`);
      if (blocked) throw new UnauthorizedException("Token has been revoked");
    }
    return { id: payload.sub, email: payload.email };
  }
}
