-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "telegramId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clientId_key" ON "User"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
