import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Setting up database...")

    // Import Prisma
    const { prisma } = await import("@/lib/prisma")

    // Use a single transaction to avoid prepared statement conflicts
    await prisma.$transaction(async (tx) => {
      // Create enums using individual queries to avoid conflicts
      try {
        await tx.$queryRaw`CREATE TYPE "UserType" AS ENUM ('BUYER', 'SELLER')`
      } catch (error: any) {
        if (!error.message?.includes("already exists")) {
          console.log("UserType enum creation error:", error.message)
        }
      }

      try {
        await tx.$queryRaw`CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED')`
      } catch (error: any) {
        if (!error.message?.includes("already exists")) {
          console.log("ProjectStatus enum creation error:", error.message)
        }
      }

      // Create tables
      try {
        await tx.$queryRaw`
          CREATE TABLE IF NOT EXISTS "users" (
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
      } catch (error: any) {
        console.log("Users table creation:", error.message)
      }

      try {
        await tx.$queryRaw`
          CREATE TABLE IF NOT EXISTS "projects" (
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
            CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
          )
        `
      } catch (error: any) {
        console.log("Projects table creation:", error.message)
      }

      try {
        await tx.$queryRaw`
          CREATE TABLE IF NOT EXISTS "bids" (
            "id" TEXT NOT NULL,
            "amount" INTEGER NOT NULL,
            "estimatedDays" INTEGER NOT NULL,
            "message" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "projectId" TEXT NOT NULL,
            "sellerId" TEXT NOT NULL,
            CONSTRAINT "bids_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "bids_projectId_sellerId_key" UNIQUE ("projectId", "sellerId")
          )
        `
      } catch (error: any) {
        console.log("Bids table creation:", error.message)
      }

      try {
        await tx.$queryRaw`
          CREATE TABLE IF NOT EXISTS "deliverables" (
            "id" TEXT NOT NULL,
            "fileName" TEXT NOT NULL,
            "fileUrl" TEXT NOT NULL,
            "description" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "projectId" TEXT NOT NULL,
            CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
          )
        `
      } catch (error: any) {
        console.log("Deliverables table creation:", error.message)
      }

      try {
        await tx.$queryRaw`
          CREATE TABLE IF NOT EXISTS "reviews" (
            "id" TEXT NOT NULL,
            "rating" SMALLINT NOT NULL,
            "comment" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "projectId" TEXT NOT NULL,
            "buyerId" TEXT NOT NULL,
            "sellerId" TEXT NOT NULL,
            CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "reviews_projectId_key" UNIQUE ("projectId")
          )
        `
      } catch (error: any) {
        console.log("Reviews table creation:", error.message)
      }
    })

    // Add foreign keys separately to avoid conflicts
    try {
      await prisma.$queryRaw`
        ALTER TABLE "projects" 
        ADD CONSTRAINT "projects_buyerId_fkey" 
        FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `
    } catch (error: any) {
      // Constraint might already exist
    }

    try {
      await prisma.$queryRaw`
        ALTER TABLE "projects" 
        ADD CONSTRAINT "projects_selectedSellerId_fkey" 
        FOREIGN KEY ("selectedSellerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      `
    } catch (error: any) {
      // Constraint might already exist
    }

    try {
      await prisma.$queryRaw`
        ALTER TABLE "bids" 
        ADD CONSTRAINT "bids_projectId_fkey" 
        FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `
    } catch (error: any) {
      // Constraint might already exist
    }

    try {
      await prisma.$queryRaw`
        ALTER TABLE "bids" 
        ADD CONSTRAINT "bids_sellerId_fkey" 
        FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `
    } catch (error: any) {
      // Constraint might already exist
    }

    try {
      await prisma.$queryRaw`
        ALTER TABLE "deliverables" 
        ADD CONSTRAINT "deliverables_projectId_fkey" 
        FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `
    } catch (error: any) {
      // Constraint might already exist
    }

    try {
      await prisma.$queryRaw`
        ALTER TABLE "reviews" 
        ADD CONSTRAINT "reviews_projectId_fkey" 
        FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `
    } catch (error: any) {
      // Constraint might already exist
    }

    try {
      await prisma.$queryRaw`
        ALTER TABLE "reviews" 
        ADD CONSTRAINT "reviews_buyerId_fkey" 
        FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `
    } catch (error: any) {
      // Constraint might already exist
    }

    try {
      await prisma.$queryRaw`
        ALTER TABLE "reviews" 
        ADD CONSTRAINT "reviews_sellerId_fkey" 
        FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `
    } catch (error: any) {
      // Constraint might already exist
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

    // Create sample bid
    await prisma.bid.upsert({
      where: {
        projectId_sellerId: {
          projectId: project.id,
          sellerId: seller.id,
        },
      },
      update: {},
      create: {
        amount: 7500,
        estimatedDays: 21,
        message:
          "I have 5+ years of experience building e-commerce websites with React, Next.js, and modern payment systems. I can deliver a high-quality, responsive website that meets all your requirements.",
        projectId: project.id,
        sellerId: seller.id,
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
        enumsCreated: true,
      },
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database setup failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
