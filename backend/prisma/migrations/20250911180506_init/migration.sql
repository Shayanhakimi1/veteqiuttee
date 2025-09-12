-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "petType" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "consultationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "medicalDocuments" TEXT,
    "videos" TEXT,
    "audioFiles" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "scheduledDate" DATETIME,
    "userId" INTEGER NOT NULL,
    "petId" INTEGER NOT NULL,
    "doctorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Consultation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Consultation_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "paymentReceipt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "userId" INTEGER NOT NULL,
    "consultationId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Payment_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_consultationId_key" ON "Payment"("consultationId");
