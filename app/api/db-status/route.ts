import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma")

    // Check if tables exist by trying to count users
    const userCount = await prisma.user.count()
    const projectCount = await prisma.project.count()

    return NextResponse.json({
      success: true,
      message: "Database is ready",
      data: {
        userCount,
        projectCount,
        tablesExist: true,
      },
    })
  } catch (error) {
    console.error("Database status error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database tables not found",
        error: error instanceof Error ? error.message : "Unknown error",
        needsSetup: true,
      },
      { status: 500 },
    )
  }
}
