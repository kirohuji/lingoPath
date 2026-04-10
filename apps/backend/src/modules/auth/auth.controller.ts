import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  me(@Req() req: { user: { id: string } }) {
    return this.authService.me(req.user.id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("logout")
  logout(@Headers("authorization") authorization?: string) {
    const token = authorization?.replace("Bearer ", "") || "";
    return this.authService.logout(token);
  }

  @Get("oauth/:provider/start")
  oauthStart(@Param("provider") provider: string) {
    return { provider, enabled: false, message: "OAuth provider not enabled yet" };
  }

  @Get("providers")
  providers() {
    return this.authService.getOAuthProviders();
  }
}
