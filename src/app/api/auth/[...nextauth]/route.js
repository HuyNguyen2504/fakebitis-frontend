import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${apiBase}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
          });
          
          const user = await res.json();
          if (res.ok && user) {
            return user;
          }
          return null;
        } catch (error) {
          console.error(error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      if (account && user) {
        if (account.provider === 'google') {
          try {
            const res = await fetch(`${apiBase}/auth/google`, {
              method: 'POST',
              body: JSON.stringify({
                name: user.name,
                email: user.email,
                googleId: user.id
              }),
              headers: { "Content-Type": "application/json" }
            });
            const dbUser = await res.json();
            if (res.ok && dbUser) {
              token.role = dbUser.role;
              token.id = dbUser._id;
              token.accessToken = dbUser.token; // The JWT from our Express server
            }
          } catch (e) {
            console.error(e);
          }
        } else if (account.provider === 'credentials') {
          token.role = user.role;
          token.id = user._id;
          token.accessToken = user.token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.accessToken = token.accessToken; // Pass the real JWT to frontend
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_demo"
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
