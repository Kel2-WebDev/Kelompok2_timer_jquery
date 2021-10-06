-- CreateEnum
CREATE TYPE "TimerStatus" AS ENUM ('STARTED', 'PAUSED', 'STOPPED', 'RESET');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lastUsed" BIGINT NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "TimerStatus" NOT NULL,
    "elapsedTime" BIGINT NOT NULL,
    "time" BIGINT NOT NULL,
    "workspaceId" TEXT,

    CONSTRAINT "Timer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Timer" ADD CONSTRAINT "Timer_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
