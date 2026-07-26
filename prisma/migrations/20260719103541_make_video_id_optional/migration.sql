-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SocialPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caption" TEXT NOT NULL,
    "targetPlatforms" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "links" TEXT,
    "videoId" TEXT,
    "productId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialPost_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "ProductVideo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SocialPost_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SocialPost" ("caption", "createdAt", "id", "links", "productId", "status", "targetPlatforms", "videoId") SELECT "caption", "createdAt", "id", "links", "productId", "status", "targetPlatforms", "videoId" FROM "SocialPost";
DROP TABLE "SocialPost";
ALTER TABLE "new_SocialPost" RENAME TO "SocialPost";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
