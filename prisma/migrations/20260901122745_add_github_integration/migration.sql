-- CreateTable
CREATE TABLE "GithHubAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GithHubAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRepository" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "githubRepoId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "htmlUrl" TEXT NOT NULL,
    "defaultBranch" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "githubAccountId" TEXT NOT NULL,

    CONSTRAINT "ProjectRepository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GithHubAccount_userId_key" ON "GithHubAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GithHubAccount_githubId_key" ON "GithHubAccount"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRepository_projectId_githubRepoId_key" ON "ProjectRepository"("projectId", "githubRepoId");

-- AddForeignKey
ALTER TABLE "GithHubAccount" ADD CONSTRAINT "GithHubAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRepository" ADD CONSTRAINT "ProjectRepository_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRepository" ADD CONSTRAINT "ProjectRepository_githubAccountId_fkey" FOREIGN KEY ("githubAccountId") REFERENCES "GithHubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
