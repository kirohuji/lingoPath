import { Controller, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TagService } from "./tag.service";
import { BaseController } from "@/shared/base/base.controller";
import { Tag } from "@prisma/client";

@Controller("tags")
@UseGuards(AuthGuard("jwt"))
export class TagController extends BaseController<
  Tag,
  { name: string },
  { name?: string }
> {
  constructor(tagService: TagService) {
    super(tagService);
  }
}
