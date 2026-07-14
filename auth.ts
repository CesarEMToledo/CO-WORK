import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: Role;
    siteId: string;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      siteId: string;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    siteId: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.status !== "active") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          siteId: user.siteId,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin")) return auth?.user?.role === "admin";
      if (pathname.startsWith("/reportes")) return !!auth?.user;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.siteId = user.siteId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.siteId = token.siteId;
      return session;
    },
  },
});
