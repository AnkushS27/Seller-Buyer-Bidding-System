import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple health check without database connection
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "API is working",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
      },
      { status: 500 },
    )
  }
}
