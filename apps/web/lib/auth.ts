import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

interface JarvisUser {
  id: string
  username: string
  name: string
  avatar_url: string
  role: string
}

interface JarvisTokenResponse {
  token: string
  user: JarvisUser
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        try {
          const res = await fetch(`${API_URL}/api/auth/github`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: account.access_token }),
          })

          if (res.ok) {
            const data = (await res.json()) as JarvisTokenResponse
            token.jarvisToken = data.token
            token.jarvisUser  = data.user
          }
        } catch (err) {
          console.error("Failed to get JARVIS token:", err)
        }
      }
      return token
    },

    async session({ session, token }) {
      session.jarvisToken = (token.jarvisToken as string) ?? ""
      if (token.jarvisUser) {
        const u = token.jarvisUser as JarvisUser
        session.user.id    = u.id
        session.user.name  = u.name ?? u.username
        session.user.image = u.avatar_url ?? null
        ;(session as unknown as Record<string, unknown>).role     = u.role
        ;(session as unknown as Record<string, unknown>).username = u.username
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },
})