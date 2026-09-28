/*
  Warnings:

  - A unique constraint covering the columns `[publicApiKey]` on the table `Assistant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Assistant" ADD COLUMN     "publicApiKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_publicApiKey_key" ON "Assistant"("publicApiKey");
