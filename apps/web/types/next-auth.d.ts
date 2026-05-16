import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    jarvisToken: string
    user: {
      id: string
      username: string
      name: string
      avatar_url: string
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    jarvisToken?: string
    jarvisUser?: object
  }
}
