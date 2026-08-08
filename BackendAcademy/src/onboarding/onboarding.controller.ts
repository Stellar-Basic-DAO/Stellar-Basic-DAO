import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OnboardingService } from './onboarding.service';
import { OnboardingProgress } from './onboarding.entity';
import { CreateOnboardingProgressDto } from './dto/create-onboarding-progress.dto';
import { UpdateOnboardingProgressDto } from './dto/update-onboarding-progress.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async create(
    @Body() dto: CreateOnboardingProgressDto,
  ): Promise<OnboardingProgress> {
    return this.onboardingService.create(dto);
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<OnboardingProgress | null> {
    return this.onboardingService.findByUserId(userId);
  }

  @Put(':id')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOnboardingProgressDto,
  ): Promise<OnboardingProgress | null> {
    return this.onboardingService.update(id, dto);
  }

  @Post(':id/step')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async completeStep(
    @Param('id') id: string,
    @Body('step') step: string,
  ): Promise<OnboardingProgress | null> {
    return this.onboardingService.completeStep(id, step);
  }
}
