import { Controller, Post, Body, UseGuards, Req, Get, Param, ParseIntPipe } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateJobDto } from './dto/create-job.dto';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async create(@Req() req: any, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.createJob(req.user.userId, createJobDto.repoUrl);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.jobsService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id, req.user.userId);
  }
}
