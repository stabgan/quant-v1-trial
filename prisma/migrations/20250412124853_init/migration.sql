-- CreateTable
CREATE TABLE "NavData" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "nav" DOUBLE PRECISION NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "NavData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NavData_scheme_code_date_idx" ON "NavData"("scheme_code", "date");

-- CreateIndex
CREATE INDEX "NavData_date_idx" ON "NavData"("date");
