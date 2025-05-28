import { cookies } from "next/headers"
import { prisma } from "./prisma"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AuthUser {
  id: string
  email: string
  name: string
  userType: "BUYER" | "SELLER"
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    // Simple token parsing without JWT verification for now
    // In production, you'd want proper JWT verification
    const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType as "BUYER" | "SELLER",
    }
  } catch {
    return null
  }
}

export function createAuthToken(userId: string): string {
  // Simple token creation - in production use proper JWT
  const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }
  const header = { alg: "HS256", typ: "JWT" }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")

  return `${encodedHeader}.${encodedPayload}.signature`
}
