import { auth } from "@/auth";

export const proxy = auth;

export const config = {
  matcher: ["/admin/:path*"],
};
