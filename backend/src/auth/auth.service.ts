import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateOAuthLogin(profile: any, accessToken: string): Promise<any> {
    try {
      const { id, username, photos, emails } = profile;
      const avatarUrl = photos && photos.length > 0 ? photos[0].value : null;
      const email = emails && emails.length > 0 ? emails[0].value : null;

      const user = await this.usersService.findOrCreate({
        githubId: id,
        username,
        avatarUrl,
        email,
        githubAccessToken: accessToken,
      });

      return user;
    } catch (err) {
      throw new UnauthorizedException('Could not validate GitHub login');
    }
  }

  async fetchUserRepos(userId: number) {
    const user = await this.usersService.findOne({ id: userId });
    
    console.log('[fetchUserRepos] User ID:', userId);
    console.log('[fetchUserRepos] User found:', !!user);
    console.log('[fetchUserRepos] Has token:', !!user?.githubAccessToken);
    
    if (!user || !user.githubAccessToken) {
      throw new UnauthorizedException('No GitHub access token found');
    }

    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          Authorization: `Bearer ${user.githubAccessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'FlutterSentinel-Backend',
        },
      });

      console.log('[fetchUserRepos] GitHub API Response Status:', response.status);
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[fetchUserRepos] GitHub API Error:', response.status, errorBody);
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const repos = await response.json();
      console.log('[fetchUserRepos] Fetched repos count:', repos.length);
      return repos;
    } catch (error) {
      console.error('[fetchUserRepos] Error:', error);
      throw new UnauthorizedException('Failed to fetch repositories from GitHub');
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
