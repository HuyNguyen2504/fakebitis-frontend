import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Check if user is the designated admin
      if (user) {
        token.role = user.email === 'huynguyen2542004@gmail.com' ? 'admin' : 'user';
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      // Send the token string to the client so it can be passed to our Express API
      // In a real app we might do this differently or use a custom token
      // But for simplicity we will just use the email/role in the header for demo, or sign a custom JWT.
      session.accessToken = token;
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_demo"
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
