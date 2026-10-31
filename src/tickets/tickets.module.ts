import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ClassifierProcessor } from "../jobs/classifier.job";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";

@Module({
  imports: [BullModule.registerQueue({ name: "classifier" })],
  providers: [TicketsService, ClassifierProcessor],
  controllers: [TicketsController],
})
export class TicketsModule {}
