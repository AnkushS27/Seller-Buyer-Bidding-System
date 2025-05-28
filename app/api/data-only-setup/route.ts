import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Data-only setup (assuming schema exists)...")

    const { prisma } = await import("@/lib/prisma")

    // Test if we can connect and if tables exist
    try {
      await prisma.user.findFirst()
      console.log("✅ Database schema exists")
    } catch (error) {
      console.log("❌ Database schema doesn't exist")
      return NextResponse.json(
        {
          success: false,
          message: "Database schema doesn't exist. Please run schema setup first.",
          error: "Tables not found",
          needsSchemaSetup: true,
        },
        { status: 400 },
      )
    }

    // Create sample data only
    console.log("📝 Creating sample data...")

    // Generate unique IDs
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
      message: "Sample data created successfully!",
      data: {
        buyer: { id: buyer.id, email: buyer.email, name: buyer.name },
        seller: { id: seller.id, email: seller.email, name: seller.name },
        project: { id: project.id, title: project.title },
        method: "data-only",
      },
    })
  } catch (error) {
    console.error("Data-only setup error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Data-only setup failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
