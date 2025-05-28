import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        buyer: {
          select: { name: true, email: true },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user || user.userType !== "BUYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, budgetMin, budgetMax, deadline } = await request.json()

    const project = await prisma.project.create({
      data: {
        title,
        description,
        budgetMin: Number.parseInt(budgetMin),
        budgetMax: Number.parseInt(budgetMax),
        deadline: new Date(deadline),
        buyerId: user.id,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
