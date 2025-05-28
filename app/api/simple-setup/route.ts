import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Simple database setup...")

    // Import Prisma
    const { prisma } = await import("@/lib/prisma")

    // Test if database is already set up
    try {
      await prisma.user.findFirst()
      console.log("✅ Database already set up")
    } catch (error) {
      console.log("❌ Database needs setup")

      // If we can't query users, the schema doesn't exist
      // Let's create it step by step

      // Create enums first
      await prisma.$queryRaw`CREATE TYPE "UserType" AS ENUM ('BUYER', 'SELLER')`
      await prisma.$queryRaw`CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED')`

      // Create users table
      await prisma.$queryRaw`
        CREATE TABLE "users" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "userType" "UserType" NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "users_email_key" UNIQUE ("email")
        )
      `

      // Create projects table
      await prisma.$queryRaw`
        CREATE TABLE "projects" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "budgetMin" INTEGER NOT NULL,
          "budgetMax" INTEGER NOT NULL,
          "deadline" TIMESTAMP(3) NOT NULL,
          "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "buyerId" TEXT NOT NULL,
          "selectedSellerId" TEXT,
          CONSTRAINT "projects_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "projects_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "projects_selectedSellerId_fkey" FOREIGN KEY ("selectedSellerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
        )
      `

      // Create bids table
      await prisma.$queryRaw`
        CREATE TABLE "bids" (
          "id" TEXT NOT NULL,
          "amount" INTEGER NOT NULL,
          "estimatedDays" INTEGER NOT NULL,
          "message" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "projectId" TEXT NOT NULL,
          "sellerId" TEXT NOT NULL,
          CONSTRAINT "bids_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "bids_projectId_sellerId_key" UNIQUE ("projectId", "sellerId"),
          CONSTRAINT "bids_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "bids_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        )
      `

      // Create deliverables table
      await prisma.$queryRaw`
        CREATE TABLE "deliverables" (
          "id" TEXT NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileUrl" TEXT NOT NULL,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "projectId" TEXT NOT NULL,
          CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "deliverables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `

      // Create reviews table
      await prisma.$queryRaw`
        CREATE TABLE "reviews" (
          "id" TEXT NOT NULL,
          "rating" SMALLINT NOT NULL,
          "comment" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "projectId" TEXT NOT NULL,
          "buyerId" TEXT NOT NULL,
          "sellerId" TEXT NOT NULL,
          CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "reviews_projectId_key" UNIQUE ("projectId"),
          CONSTRAINT "reviews_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "reviews_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "reviews_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        )
      `
    }

    // Create sample data
    console.log("📝 Creating sample data...")

    // Create sample buyer
    const buyer = await prisma.user.upsert({
      where: { email: "buyer@example.com" },
      update: {},
      create: {
        email: "buyer@example.com",
        name: "John Buyer",
        userType: "BUYER",
      },
    })

    // Create sample seller
    const seller = await prisma.user.upsert({
      where: { email: "seller@example.com" },
      update: {},
      create: {
        email: "seller@example.com",
        name: "Jane Seller",
        userType: "SELLER",
      },
    })

    // Create sample project
    const project = await prisma.project.upsert({
      where: { id: "sample-project-1" },
      update: {},
      create: {
        id: "sample-project-1",
        title: "Build a Modern E-commerce Website",
        description:
          "We need a responsive e-commerce website with payment integration, user authentication, and admin dashboard. The site should be built using modern technologies and be mobile-friendly.",
        budgetMin: 5000,
        budgetMax: 10000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: "PENDING",
        buyerId: buyer.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully!",
      data: {
        buyer: { id: buyer.id, email: buyer.email, name: buyer.name },
        seller: { id: seller.id, email: seller.email, name: seller.name },
        project: { id: project.id, title: project.title },
        tablesCreated: true,
      },
    })
  } catch (error) {
    console.error("Simple setup error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Simple setup failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
