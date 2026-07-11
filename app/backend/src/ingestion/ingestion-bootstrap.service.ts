import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { StellarIngestionService } from "./stellar-ingestion.service";
import { ContractRegistryService } from "../contracts/contract-registry.service";

/**
 * Reads the  RustAcademy_CONTRACT_ID environment variable and starts streaming
 * once the NestJS application is ready, with optional dual-read support.
 *
 * If no contract ID is configured the service logs a warning and skips.
 */
@Injectable()
export class IngestionBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(IngestionBootstrapService.name);

  constructor(
    private readonly ingestion: StellarIngestionService,
    private readonly registry: ContractRegistryService,
  ) {}

  async onModuleInit(): Promise<void> {
    const contractId = process.env["RustAcademy_CONTRACT_ID"];

    if (!contractId) {
      this.logger.warn(
        " RustAcademy_CONTRACT_ID is not set; Stellar ingestion will NOT start. " +
          "Set this env var to enable event streaming.",
      );
      return;
    }

    this.logger.log(`Starting Stellar ingestion for contract ${contractId}`);

    try {
      const registryData = await this.registry.getRegistry();
      const Stellar Basic DAOEntry = registryData.data.Stellar Basic DAO as Record<
        string,
        unknown
      >;

      if (Stellar Basic DAOEntry && Stellar Basic DAOEntry.previousContractId) {
        this.logger.log(
          `Contract registry has dual-read config; starting with previous contract ${Stellar Basic DAOEntry.previousContractId}`,
        );
        await this.ingestion.startStreamingWithDualRead({
          contractId,
          previousContractId: Stellar Basic DAOEntry.previousContractId as string,
          effectiveLedger: Stellar Basic DAOEntry.effectiveLedger as
            | number
            | undefined,
        });
      } else {
        await this.ingestion.startStreaming(contractId);
      }
    } catch (err) {
      this.logger.warn(
        `Could not load registry config, using basic streaming: ${(err as Error).message}`,
      );
      await this.ingestion.startStreaming(contractId);
    }
  }
}
