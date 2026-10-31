-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('pending', 'classified', 'failed');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'pending';
