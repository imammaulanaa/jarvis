import { auth } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

// Server-side fetch (pakai di Server Components)
export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise {
  const session = await auth()
  const token   = session?.jarvisToken

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`)
  }

  return res.json()
}
