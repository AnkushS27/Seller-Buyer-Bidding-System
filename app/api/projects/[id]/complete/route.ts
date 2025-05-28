import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
      },
      include: {
        buyer: true,
        selectedSeller: true,
      },
    })

    // Send email notifications
    if (project.buyer && project.selectedSeller) {
      await sendEmail(
        project.buyer.email,
        "Project Completed",
        emailTemplates.projectCompleted(project.title, project.selectedSeller.name),
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error completing project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
