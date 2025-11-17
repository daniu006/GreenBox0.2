/*
  Warnings:

  - Added the required column `priority` to the `alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wateringFrequency` to the `plants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "priority" TEXT NOT NULL,
ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "boxes" ADD COLUMN     "lastWateringDate" TIMESTAMP(3),
ADD COLUMN     "ledStatus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pumpStatus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wateringCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "plants" ADD COLUMN     "wateringFrequency" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "alerts_resolved_idx" ON "alerts"("resolved");
