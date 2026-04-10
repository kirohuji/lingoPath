import { Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Queue } from "bullmq";
import { TASK_QUEUE } from "./queue.constants";

@Injectable()
export class TasksService {
  constructor(@Inject(TASK_QUEUE) private readonly queue: Queue) {}

  @Cron(CronExpression.EVERY_HOUR)
  async enqueueCleanupTasks() {
    await this.queue.add("cleanup-files", {});
    await this.queue.add("archive-notifications", {});
    await this.queue.add("ticket-timeout-check", {});
  }
}
