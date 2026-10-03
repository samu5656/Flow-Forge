-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "action" TEXT,
    "payload" JSONB NOT NULL,
    "repositoryFullName" TEXT,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_deliveryId_key" ON "WebhookEvent"("deliveryId");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_idx" ON "WebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "WebhookEvent_repositoryFullName_idx" ON "WebhookEvent"("repositoryFullName");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");
