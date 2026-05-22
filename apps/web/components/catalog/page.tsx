import { auth } from "@/lib/auth"

export default async function CatalogPage() {
  const session = await auth()

  console.log("=== CATALOG PAGE ===")
  console.log("session:", JSON.stringify(session))
  console.log("jarvisToken:", session?.jarvisToken ? "present" : "MISSING")

  let result = null
  let error  = null

  try {
    const url = `${process.env.API_URL ?? "http://localhost:8080"}/api/services?limit=50`
    console.log("fetching:", url)

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(session?.jarvisToken
          ? { Authorization: `Bearer ${session.jarvisToken}` }
          : {}),
      },
    })

    console.log("status:", res.status)
    result = await res.json()
    console.log("result:", JSON.stringify(result))
  } catch (err) {
    error = String(err)
    console.error("fetch error:", err)
  }

  return (
    <div style={{ padding: 24, fontFamily: "monospace", fontSize: 13 }}>
      <h2>Debug Catalog</h2>
      <pre style={{ marginTop: 16, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
        {JSON.stringify({ session: !!session, jarvisToken: !!session?.jarvisToken, result, error }, null, 2)}
      </pre>
    </div>
  )
}