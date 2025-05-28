import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.userType === "BUYER") {
      const projects = await prisma.project.findMany({
        where: { buyerId: user.id },
        include: {
          selectedSeller: {
            select: { name: true, email: true },
          },
          _count: {
            select: { bids: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json({ projects })
    } else {
      const bids = await prisma.bid.findMany({
        where: { sellerId: user.id },
        include: {
          project: {
            include: {
              buyer: {
                select: { name: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      const selectedProjects = await prisma.project.findMany({
        where: { selectedSellerId: user.id },
        include: {
          buyer: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json({ bids, selectedProjects })
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
