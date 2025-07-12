import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware((auth, req) => {
  // console.log("Clerk middleware is running for:", req.nextUrl.pathname);
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // all routes except static assets
    "/api/(.*)", // all API routes
  ],
};
