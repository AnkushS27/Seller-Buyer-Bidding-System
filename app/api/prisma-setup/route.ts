import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Prisma-only database setup...")

    const { prisma } = await import("@/lib/prisma")

    // Test database connection first
    try {
      await prisma.$connect()
      console.log("✅ Database connection successful")
    } catch (connectionError) {
      console.error("❌ Database connection failed:", connectionError)
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed. Please check your environment variables.",
          error: connectionError instanceof Error ? connectionError.message : "Connection error",
        },
        { status: 500 },
      )
    }

    // Check if schema already exists
    let schemaExists = false
    try {
      await prisma.user.findFirst()
      schemaExists = true
      console.log("✅ Database schema already exists")
    } catch (error) {
      console.log("📝 Database schema needs to be created")
    }

    // If schema doesn't exist, try to create it
    if (!schemaExists) {
      try {
        console.log("🔧 Creating database schema...")

        // Create enums using executeRawUnsafe to avoid prepared statement caching
        await prisma.$executeRawUnsafe(`
          DO $$ BEGIN
            CREATE TYPE "UserType" AS ENUM ('BUYER', 'SELLER');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `)

        await prisma.$executeRawUnsafe(`
          DO $$ BEGIN
            CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `)

        // Create tables
        await prisma.$executeRawUnsafe(`
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
        `)

        await prisma.$executeRawUnsafe(`
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
        `)

        await prisma.$executeRawUnsafe(`
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
        `)

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "deliverables" (
            "id" TEXT NOT NULL,
            "fileName" TEXT NOT NULL,
            "fileUrl" TEXT NOT NULL,
            "description" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "projectId" TEXT NOT NULL,
            CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
          )
        `)

        await prisma.$executeRawUnsafe(`
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
        `)

        // Add foreign key constraints
        const constraints = [
          `ALTER TABLE "projects" ADD CONSTRAINT IF NOT EXISTS "projects_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
          `ALTER TABLE "projects" ADD CONSTRAINT IF NOT EXISTS "projects_selectedSellerId_fkey" FOREIGN KEY ("selectedSellerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
          `ALTER TABLE "bids" ADD CONSTRAINT IF NOT EXISTS "bids_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
          `ALTER TABLE "bids" ADD CONSTRAINT IF NOT EXISTS "bids_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
          `ALTER TABLE "deliverables" ADD CONSTRAINT IF NOT EXISTS "deliverables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
          `ALTER TABLE "reviews" ADD CONSTRAINT IF NOT EXISTS "reviews_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
          `ALTER TABLE "reviews" ADD CONSTRAINT IF NOT EXISTS "reviews_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
          `ALTER TABLE "reviews" ADD CONSTRAINT IF NOT EXISTS "reviews_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        ]

        for (const constraint of constraints) {
          try {
            await prisma.$executeRawUnsafe(constraint)
          } catch (constraintError) {
            // Ignore constraint errors (likely already exists)
            console.log("Constraint might already exist:", constraintError)
          }
        }

        console.log("✅ Database schema created successfully")
      } catch (schemaError) {
        console.error("Schema creation error:", schemaError)
        // Continue to sample data creation even if schema creation had issues
      }
    }

    // Create sample data
    console.log("📝 Creating sample data...")

    const buyerId = `buyer_${Date.now()}`
    const sellerId = `seller_${Date.now()}`
    const projectId = `project_${Date.now()}`

    // Create sample buyer
    const buyer = await prisma.user.upsert({
      where: { email: "buyer@example.com" },
      update: {},
      create: {
        id: buyerId,
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
        id: sellerId,
        email: "seller@example.com",
        name: "Jane Seller",
        userType: "SELLER",
      },
    })

    // Create sample project
    const project = await prisma.project.upsert({
      where: { id: projectId },
      update: {},
      create: {
        id: projectId,
        title: "Build a Modern E-commerce Website",
        description:
          "We need a responsive e-commerce website with payment integration, user authentication, and admin dashboard. The site should be built using modern technologies and be mobile-friendly.",
        budgetMin: 5000,
        budgetMax: 10000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully!",
      data: {
        buyer: { id: buyer.id, email: buyer.email, name: buyer.name },
        seller: { id: seller.id, email: seller.email, name: seller.name },
        project: { id: project.id, title: project.title },
        schemaCreated: !schemaExists,
        method: "prisma-only",
      },
    })
  } catch (error) {
    console.error("Prisma setup error:", error)
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
