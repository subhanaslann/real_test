import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateOAuthLogin(profile: any): Promise<any> {
    try {
      const { id, username, photos, emails } = profile;
      const avatarUrl = photos && photos.length > 0 ? photos[0].value : null;
      const email = emails && emails.length > 0 ? emails[0].value : null;

      const user = await this.usersService.findOrCreate({
        githubId: id,
        username,
        avatarUrl,
        email,
      });

      return user;
    } catch (err) {
      throw new UnauthorizedException('Could not validate GitHub login');
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
