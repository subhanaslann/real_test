import { IsUrl, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsUrl()
  @IsNotEmpty()
  repoUrl: string;

  @IsOptional()
  @IsString()
  branch?: string;
}
