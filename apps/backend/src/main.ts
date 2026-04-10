import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import express from "express";
import { AppModule } from "./app.module";
import { requestIdMiddleware } from "./infrastructure/logger/request-id.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ limit: "5mb", extended: true }));
  app.use(requestIdMiddleware);
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: true,
    credentials: true,
  });
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

void bootstrap();
