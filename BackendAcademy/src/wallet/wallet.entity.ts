import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'wallets' })
export class WalletEntity {
  @PrimaryColumn({ type: 'varchar', length: 56 })
  address: string;

  @Column({ type: 'varchar', length: 30, default: '0.00' })
  balance: string;

  @Column({ name: 'asset_code', type: 'varchar', length: 12 })
  assetCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial?: Partial<WalletEntity>) {
    if (partial) Object.assign(this, partial);
  }
}
