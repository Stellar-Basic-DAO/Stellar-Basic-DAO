import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContractsService } from './contracts.service';
import { JwtAdminGuard } from '../auth/guards/jwt-admin.guard';
import {
  DeployContractDto,
  InvokeContractDto,
} from './dto/invoke-contract.dto';
import {
  CreateProposalDto,
  CastVoteDto,
} from './dto/governance.dto';

@Controller('contracts')
@UseGuards(JwtAdminGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get('reputation/:userId')
  getReputation(@Param('userId') userId: string) {
    return this.contractsService.getReputation(userId);
  }

  @Post('reputation/:userId')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  updateReputation(
    @Param('userId') userId: string,
    @Body('score') score: number,
  ) {
    return this.contractsService.updateReputation(userId, score);
  }

  @Post('certificates/issue')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  issueCertificate(
    @Body('userId') userId: string,
    @Body('courseId') courseId: string,
  ) {
    return this.contractsService.issueCertificate(userId, courseId);
  }

  @Get('certificates/:id')
  getCertificate(@Param('id') id: string) {
    return this.contractsService.getCertificate(id);
  }

  @Get('certificates/user/:userId')
  listCertificates(@Param('userId') userId: string) {
    return this.contractsService.listCertificates(userId);
  }

  @Post('badges/issue')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  issueBadge(
    @Body('userId') userId: string,
    @Body('badgeType') badgeType: string,
  ) {
    return this.contractsService.issueBadge(userId, badgeType);
  }

  @Get('badges/:id')
  getBadge(@Param('id') id: string) {
    return this.contractsService.getBadge(id);
  }

  @Get('badges/user/:userId')
  listBadges(@Param('userId') userId: string) {
    return this.contractsService.listBadges(userId);
  }

  @Post('payouts/create')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  createPayout(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Body('currency') currency: string,
  ) {
    return this.contractsService.createPayout(userId, amount, currency);
  }

  @Get('payouts/:id')
  getPayout(@Param('id') id: string) {
    return this.contractsService.getPayout(id);
  }

  @Post('payouts/:id/release')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  releasePayout(@Param('id') id: string) {
    return this.contractsService.releasePayout(id);
  }

  @Post('invoke')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async invokeContract(@Body() dto: InvokeContractDto) {
    return this.contractsService.invokeContract(dto);
  }

  @Post('deploy')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async deployContract(@Body() dto: DeployContractDto) {
    return this.contractsService.deployContract(dto);
  }

  @Get(':contractId')
  async getContractInfo(@Param('contractId') contractId: string) {
    return this.contractsService.getContractInfo(contractId);
  }

  @Get(':contractId/health')
  async getContractHealth(@Param('contractId') contractId: string) {
    return this.contractsService.getContractHealth(contractId);
  }

  @Get(':contractId/history')
  async getInvocationHistory(@Param('contractId') contractId: string) {
    return this.contractsService.getInvocationHistory(contractId);
  }

  @Get()
  async getAllDeployments() {
    return this.contractsService.getAllDeployments();
  }

  @Post('governance/proposals')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  createProposal(@Body() dto: CreateProposalDto) {
    return this.contractsService.createProposal(
      dto.title,
      dto.description,
      dto.proposer,
    );
  }

  @Get('governance/proposals')
  listProposals() {
    return this.contractsService.listProposals();
  }

  @Get('governance/proposals/:id')
  getProposal(@Param('id') id: string) {
    return this.contractsService.getProposal(id);
  }

  @Post('governance/proposals/:id/vote')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  castVote(@Param('id') id: string, @Body() dto: CastVoteDto) {
    return this.contractsService.castVote(id, dto.userId, dto.vote);
  }
}
