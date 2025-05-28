import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user || user.userType !== "BUYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sellerId } = await request.json()

    // Update project with selected seller and status
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        selectedSellerId: sellerId,
        status: "IN_PROGRESS",
      },
      include: {
        buyer: true,
        selectedSeller: true,
      },
    })

    // Send email notification to selected seller
    if (project.selectedSeller) {
      await sendEmail(
        project.selectedSeller.email,
        "You have been selected for a project!",
        emailTemplates.sellerSelected(project.title, project.buyer.name),
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error selecting seller:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
