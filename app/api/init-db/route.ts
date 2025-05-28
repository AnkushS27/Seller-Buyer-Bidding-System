import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    // Test database connection
    await prisma.$connect()

    // Create sample buyer if doesn't exist
    const buyer = await prisma.user.upsert({
      where: { email: "buyer@example.com" },
      update: {},
      create: {
        email: "buyer@example.com",
        name: "John Buyer",
        userType: "BUYER",
      },
    })

    // Create sample seller if doesn't exist
    const seller = await prisma.user.upsert({
      where: { email: "seller@example.com" },
      update: {},
      create: {
        email: "seller@example.com",
        name: "Jane Seller",
        userType: "SELLER",
      },
    })

    // Create sample project if doesn't exist
    const project = await prisma.project.upsert({
      where: { id: "sample-project-id" },
      update: {},
      create: {
        id: "sample-project-id",
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
      message: "Database initialized successfully",
      data: {
        buyer: { id: buyer.id, email: buyer.email },
        seller: { id: seller.id, email: seller.email },
        project: { id: project.id, title: project.title },
      },
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
