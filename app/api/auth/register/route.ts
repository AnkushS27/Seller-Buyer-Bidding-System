import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuthToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, userType } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        userType: userType.toUpperCase(),
      },
    })

    // Set auth cookie
    const token = createAuthToken(user.id)

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
