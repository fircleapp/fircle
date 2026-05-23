-- CreateTable
CREATE TABLE "MediaTag" (
    "id" TEXT NOT NULL,
    "postMediaId" TEXT NOT NULL,
    "taggedMemberId" TEXT NOT NULL,
    "xPercent" DECIMAL(5,2),
    "yPercent" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaTag_postMediaId_idx" ON "MediaTag"("postMediaId");

-- CreateIndex
CREATE INDEX "MediaTag_taggedMemberId_idx" ON "MediaTag"("taggedMemberId");

-- CreateIndex
CREATE INDEX "MediaTag_postMediaId_taggedMemberId_idx" ON "MediaTag"("postMediaId", "taggedMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaTag_postMediaId_taggedMemberId_key" ON "MediaTag"("postMediaId", "taggedMemberId");

-- AddForeignKey
ALTER TABLE "MediaTag" ADD CONSTRAINT "MediaTag_postMediaId_fkey" FOREIGN KEY ("postMediaId") REFERENCES "PostMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTag" ADD CONSTRAINT "MediaTag_taggedMemberId_fkey" FOREIGN KEY ("taggedMemberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;