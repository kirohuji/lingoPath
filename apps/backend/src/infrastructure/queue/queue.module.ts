import { Global, Module } from "@nestjs/common";
import { Queue } from "bullmq";
import { TasksService } from "./tasks.service";
import { TASK_QUEUE } from "./queue.constants";

@Global()
@Module({
  providers: [
    {
      provide: TASK_QUEUE,
      useFactory: () =>
        new Queue("lingopath-tasks", {
          connection: {
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: Number(process.env.REDIS_PORT || 6379),
            password: process.env.REDIS_PASSWORD || undefined,
          },
        }),
    },
    TasksService,
  ],
  exports: [TASK_QUEUE],
})
export class QueueModule {}
