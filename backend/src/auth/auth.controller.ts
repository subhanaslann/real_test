import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GitHubAuthGuard } from './guards/github-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('github')
  @UseGuards(GitHubAuthGuard)
  async githubLogin() {
    // Initiates the GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(GitHubAuthGuard)
  async githubLoginCallback(@Req() req: any, @Res() res: any) {
    const data = await this.authService.login(req.user);
    // Redirect to Frontend with token (using environment variable)
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?token=${data.access_token}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Get('repos')
  @UseGuards(JwtAuthGuard)
  async getRepos(@Req() req: any) {
    return this.authService.fetchUserRepos(req.user.userId);
  }
}
