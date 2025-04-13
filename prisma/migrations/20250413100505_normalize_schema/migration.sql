/*
  Warnings:

  - You are about to drop the `NavData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "NavData";

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fund" (
    "id" SERIAL NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavEntry" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "nav" DOUBLE PRECISION NOT NULL,
    "fundId" INTEGER NOT NULL,

    CONSTRAINT "NavEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Fund_scheme_code_key" ON "Fund"("scheme_code");

-- CreateIndex
CREATE INDEX "Fund_categoryId_idx" ON "Fund"("categoryId");

-- CreateIndex
CREATE INDEX "NavEntry_fundId_date_idx" ON "NavEntry"("fundId", "date");

-- CreateIndex
CREATE INDEX "NavEntry_date_idx" ON "NavEntry"("date");

-- AddForeignKey
ALTER TABLE "Fund" ADD CONSTRAINT "Fund_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavEntry" ADD CONSTRAINT "NavEntry_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
