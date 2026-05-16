import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // Dipanggil setelah GitHub OAuth sukses
    // Di sini kita exchange GitHub token → JARVIS JWT
    async jwt({ token, account }) {
      if (account?.access_token) {
        try {
          const res = await fetch(`${API_URL}/api/auth/github`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: account.access_token }),
          })

          if (res.ok) {
            const data = await res.json()
            token.jarvisToken = data.token      // JWT dari Go backend
            token.jarvisUser  = data.user       // user data dari DB
          }
        } catch (err) {
          console.error("Failed to get JARVIS token:", err)
        }
      }
      return token
    },

    // Expose token ke client via useSession()
    async session({ session, token }) {
    session.jarvisToken = token.jarvisToken as string ?? ""
    if (token.jarvisUser) {
        const u = token.jarvisUser as any
        session.user.id       = u.id
        session.user.name     = u.name ?? u.username
        session.user.image    = u.avatar_url ?? null
        // custom fields
        ;(session as any).username = u.username
        ;(session as any).role     = u.role
    }
    return session
    },
  },

  pages: {
    signIn: "/login",    // redirect ke halaman login custom kita
  },
})