-- CreateTable
CREATE TABLE "ClockInOut" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clockInTime" TEXT NOT NULL,
    "clockOutTime" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClockInOut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClockInOut_employeeId_date_idx" ON "ClockInOut"("employeeId", "date");

-- AddForeignKey
ALTER TABLE "ClockInOut" ADD CONSTRAINT "ClockInOut_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
