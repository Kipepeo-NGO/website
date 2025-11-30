-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "status" "DonationStatus" NOT NULL DEFAULT 'CONFIRMED';
