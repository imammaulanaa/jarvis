import { auth } from "@/lib/auth"

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const session = await auth()
  const token   = session?.jarvisToken

  const url = `${API_URL}${path}`
  console.log("[apiFetch] calling:", url, "token:", token ? "present" : "MISSING")

  const res = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  console.log("[apiFetch] response:", res.status, path)

  if (!res.ok) {
    const body = await res.text()
    console.error("[apiFetch] error body:", body)
    throw new Error(`API error ${res.status}: ${path}`)
  }

  return res.json()
}