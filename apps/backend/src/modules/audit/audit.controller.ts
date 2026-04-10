import { Controller, Get } from "@nestjs/common";

@Controller("audit-logs")
export class AuditController {
  @Get()
  list() {
    return [];
  }
}
