import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deliverables = await prisma.deliverable.findMany({
      where: {
        projectId: params.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(deliverables)
  } catch (error) {
    console.error("Error fetching deliverables:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user || user.userType !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileName, fileUrl, description } = await request.json()

    const deliverable = await prisma.deliverable.create({
      data: {
        fileName,
        fileUrl,
        description,
        projectId: params.id,
      },
    })

    return NextResponse.json(deliverable)
  } catch (error) {
    console.error("Error creating deliverable:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
