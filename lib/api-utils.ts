import { NextResponse } from "next/server"

export function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function createSuccessResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export function validateRequiredFields(data: any, fields: string[]) {
  const missing = fields.filter((field) => !data[field])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`)
  }
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}
