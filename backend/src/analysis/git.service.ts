import { Injectable, Logger } from '@nestjs/common';
import { simpleGit, SimpleGit } from 'simple-git';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GitService {
  private readonly logger = new Logger(GitService.name);

  async cloneRepository(repoUrl: string): Promise<string> {
    const tempId = uuidv4();
    const targetDir = path.join(os.tmpdir(), 'flutter-sentinel', tempId);
    
    try {
      await fs.ensureDir(targetDir);
      this.logger.log(`Cloning ${repoUrl} to ${targetDir}`);
      
      const git: SimpleGit = simpleGit();
      await git.clone(repoUrl, targetDir);
      
      return targetDir;
    } catch (error) {
      this.logger.error(`Failed to clone repository: ${error.message}`);
      // Clean up if clone fails
      await this.removeDirectory(targetDir);
      throw error;
    }
  }

  async removeDirectory(dirPath: string): Promise<void> {
    try {
      await fs.remove(dirPath);
      this.logger.log(`Removed directory: ${dirPath}`);
    } catch (error) {
      this.logger.error(`Failed to remove directory ${dirPath}: ${error.message}`);
    }
  }
}
