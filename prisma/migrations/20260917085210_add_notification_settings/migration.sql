-- AlterTable
ALTER TABLE "Assistant" ADD COLUMN     "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificationEmail" TEXT,
ADD COLUMN     "notificationMessage" TEXT,
ADD COLUMN     "notificationWhatsapp" TEXT,
ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "whatsappNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false;
