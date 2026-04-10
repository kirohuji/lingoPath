import { Global, Module } from "@nestjs/common";
import { Redis } from "ioredis";

export const REDIS = Symbol("REDIS");

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: () => {
        if (process.env.REDIS_URL) {
          return new Redis(process.env.REDIS_URL);
        }
        return new Redis({
          host: process.env.REDIS_HOST || "127.0.0.1",
          port: Number(process.env.REDIS_PORT || 6379),
          password: process.env.REDIS_PASSWORD || undefined,
        });
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
