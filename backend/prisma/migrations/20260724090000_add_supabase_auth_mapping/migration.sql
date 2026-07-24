ALTER TABLE "User"
ADD COLUMN "authUserId" UUID;

CREATE UNIQUE INDEX "User_authUserId_key" ON "User"("authUserId");
