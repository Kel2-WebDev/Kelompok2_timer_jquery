/*
  Warnings:

  - You are about to alter the column `elapsedTime` on the `Timer` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `time` on the `Timer` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `lastUsed` on the `Workspace` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Timer" ALTER COLUMN "elapsedTime" SET DATA TYPE INTEGER,
ALTER COLUMN "time" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "lastUsed" SET DATA TYPE INTEGER;
