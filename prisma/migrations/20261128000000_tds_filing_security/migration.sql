-- Additive TDS Filing tables. This migration has not been applied.
CREATE TABLE "TdsCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "passwordHash" TEXT,
    "setupTokenHash" TEXT,
    "setupTokenExpiresAt" DATETIME,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TdsCredential_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "TdsSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TdsSession_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "TdsAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TdsAccess_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TdsAccess_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "TdsFiling" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deducteeName" TEXT NOT NULL,
    "deducteeNameKey" TEXT NOT NULL,
    "deducteeCategory" TEXT NOT NULL,
    "deducteeReference" TEXT,
    "deducteeEmployeeId" TEXT,
    "deducteeCollegeId" TEXT,
    "panNumber" TEXT,
    "tanNumber" TEXT,
    "financialYear" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "returnType" TEXT NOT NULL DEFAULT 'OTHER',
    "revision" INTEGER NOT NULL DEFAULT 0,
    "correctionReason" TEXT,
    "correctionOfId" TEXT,
    "tdsAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATETIME,
    "filingDate" DATETIME,
    "acknowledgementRef" TEXT,
    "assignedToId" TEXT,
    "assignedAt" DATETIME,
    "responsibilityStatus" TEXT NOT NULL DEFAULT 'UNASSIGNED',
    "responsibilityRemarks" TEXT,
    "completedAt" DATETIME,
    "remarks" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TdsFiling_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TdsFiling_deducteeEmployeeId_fkey" FOREIGN KEY ("deducteeEmployeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TdsFiling_deducteeCollegeId_fkey" FOREIGN KEY ("deducteeCollegeId") REFERENCES "College" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TdsFiling_correctionOfId_fkey" FOREIGN KEY ("correctionOfId") REFERENCES "TdsFiling" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TdsFiling_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TdsFiling_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "TdsStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filingId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TdsStatusHistory_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "TdsFiling" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TdsStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "TdsAssignmentHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filingId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "fromAssignedToId" TEXT,
    "actorId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TdsAssignmentHistory_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "TdsFiling" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TdsAssignmentHistory_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TdsAssignmentHistory_fromAssignedToId_fkey" FOREIGN KEY ("fromAssignedToId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TdsAssignmentHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TdsCredential_employeeId_key" ON "TdsCredential"("employeeId");
CREATE UNIQUE INDEX "TdsCredential_setupTokenHash_key" ON "TdsCredential"("setupTokenHash");
CREATE UNIQUE INDEX "TdsSession_tokenHash_key" ON "TdsSession"("tokenHash");
CREATE INDEX "TdsSession_employeeId_expiresAt_idx" ON "TdsSession"("employeeId", "expiresAt");
CREATE UNIQUE INDEX "TdsAccess_employeeId_key" ON "TdsAccess"("employeeId");
CREATE INDEX "TdsFiling_status_dueDate_idx" ON "TdsFiling"("status", "dueDate");
CREATE INDEX "TdsFiling_assignedToId_idx" ON "TdsFiling"("assignedToId");
CREATE UNIQUE INDEX "TdsFiling_deducteeCategory_deducteeNameKey_financialYear_quarter_returnType_revision_key" ON "TdsFiling"("deducteeCategory", "deducteeNameKey", "financialYear", "quarter", "returnType", "revision");
CREATE INDEX "TdsFiling_correctionOfId_idx" ON "TdsFiling"("correctionOfId");
CREATE INDEX "TdsFiling_deducteeEmployeeId_idx" ON "TdsFiling"("deducteeEmployeeId");
CREATE INDEX "TdsFiling_deducteeCollegeId_idx" ON "TdsFiling"("deducteeCollegeId");
CREATE INDEX "TdsFiling_responsibilityStatus_assignedToId_idx" ON "TdsFiling"("responsibilityStatus", "assignedToId");
CREATE INDEX "TdsStatusHistory_filingId_createdAt_idx" ON "TdsStatusHistory"("filingId", "createdAt");
CREATE INDEX "TdsAssignmentHistory_filingId_createdAt_idx" ON "TdsAssignmentHistory"("filingId", "createdAt");
CREATE INDEX "TdsAssignmentHistory_assignedToId_createdAt_idx" ON "TdsAssignmentHistory"("assignedToId", "createdAt");
