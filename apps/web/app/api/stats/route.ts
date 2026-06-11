import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export async function GET() {
  const session = await auth()
  const token   = session?.jarvisToken

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  try {
    const res = await fetch(API_URL + "/api/services/stats", {
      headers: { Authorization: "Bearer " + token },
      cache:   "no-store",
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "api unreachable" }, { status: 502 })
  }
}