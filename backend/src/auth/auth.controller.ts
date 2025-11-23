import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GitHubAuthGuard } from './guards/github-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('github')
  @UseGuards(GitHubAuthGuard)
  async githubLogin() {
    // Initiates the GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(GitHubAuthGuard)
  async githubLoginCallback(@Req() req: any, @Res() res: any) {
    const data = await this.authService.login(req.user);
    // Redirect to Frontend with token
    // Assuming Frontend is running on localhost:5173
    res.redirect(`http://localhost:5173/auth/callback?token=${data.access_token}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
  }
}
