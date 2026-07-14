import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WalletService } from './wallet.service';
import { RegisterWalletDto, VerifyTransactionDto } from './dto/verify-transaction.dto';
import { JwtLearnerGuard } from '../auth/guards/jwt-learner.guard';

@Controller('wallet')
@UseGuards(JwtLearnerGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async registerWallet(@Body() dto: RegisterWalletDto) {
    return this.walletService.registerWallet(dto);
  }

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyTransaction(@Body() dto: VerifyTransactionDto) {
    return this.walletService.verifyTransaction(dto);
  }

  @Get('verification/:transactionId')
  async getVerificationStatus(@Param('transactionId') transactionId: string) {
    return this.walletService.getVerificationStatus(transactionId);
  }

  @Get(':address')
  async getWallet(@Param('address') address: string) {
    return this.walletService.getWallet(address);
  }

  @Get(':address/balance')
  async getWalletBalance(@Param('address') address: string) {
    return this.walletService.getWalletBalance(address);
  }

  @Get(':address/transactions')
  async getTransactionHistory(@Param('address') address: string) {
    return this.walletService.getTransactionHistory(address);
  }

  @Get()
  async getAllWallets() {
    return this.walletService.getAllWallets();
  }
}
