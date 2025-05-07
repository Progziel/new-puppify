/*
  Warnings:

  - You are about to drop the column `advertisementId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `advertisementId` on the `Like` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_advertisementId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_advertisementId_fkey";

-- DropIndex
DROP INDEX "Like_userId_advertisementId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "advertisementId";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "advertisementId";

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_key" ON "Like"("userId");
