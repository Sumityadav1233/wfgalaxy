-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN "accessToken" TEXT;
ALTER TABLE "SocialAccount" ADD COLUMN "expiresAt" DATETIME;
ALTER TABLE "SocialAccount" ADD COLUMN "refreshToken" TEXT;
