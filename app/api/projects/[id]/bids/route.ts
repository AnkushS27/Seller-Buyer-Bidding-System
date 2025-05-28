import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bids = await prisma.bid.findMany({
      where: {
        projectId: params.id,
      },
      include: {
        seller: {
          select: { name: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(bids)
  } catch (error) {
    console.error("Error fetching bids:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user || user.userType !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, estimatedDays, message } = await request.json()

    // Check if seller already bid on this project
    const existingBid = await prisma.bid.findUnique({
      where: {
        projectId_sellerId: {
          projectId: params.id,
          sellerId: user.id,
        },
      },
    })

    if (existingBid) {
      return NextResponse.json({ error: "You have already bid on this project" }, { status: 400 })
    }

    const bid = await prisma.bid.create({
      data: {
        amount: Number.parseInt(amount),
        estimatedDays: Number.parseInt(estimatedDays),
        message,
        projectId: params.id,
        sellerId: user.id,
      },
    })

    // Send email notification to project owner
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { buyer: true },
    })

    if (project?.buyer) {
      await sendEmail(project.buyer.email, "New Bid Received", emailTemplates.newBid(project.title, user.name, amount))
    }

    return NextResponse.json(bid)
  } catch (error) {
    console.error("Error creating bid:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
