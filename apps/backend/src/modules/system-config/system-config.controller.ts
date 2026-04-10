import { Controller, Get } from "@nestjs/common";

@Controller("system-configs")
export class SystemConfigController {
  @Get()
  getConfigs() {
    return {
      pointsRules: [
        { level: "L1", min: 0 },
        { level: "L2", min: 1000 },
        { level: "L3", min: 5000 },
      ],
      uploadLimitMb: 20,
    };
  }
}
