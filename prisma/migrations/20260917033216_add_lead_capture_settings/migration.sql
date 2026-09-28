-- AlterTable
ALTER TABLE "Assistant" ADD COLUMN     "collectEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "collectInterest" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "collectName" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "collectPhone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leadCaptureEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "leadCaptureMessage" TEXT;
