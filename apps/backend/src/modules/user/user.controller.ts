import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { UserService } from "./user.service";

@Controller("users")
@UseGuards(AuthGuard("jwt"))
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true);
          return;
        }
        cb(new Error("Only image files are allowed"), false);
      },
    }),
  )
  uploadAvatar(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    return this.service.uploadAvatar(file);
  }

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(
    @Body()
    body: { email: string; name?: string; avatarUrl?: string; password?: string; roleCodes?: string[] },
  ) {
    return this.service.create(body);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: { email?: string; name?: string; avatarUrl?: string; roleCodes?: string[] },
  ) {
    return this.service.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
