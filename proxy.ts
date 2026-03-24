import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/api/listings/manage(.*)",
  "/api/upload(.*)",
  "/api/user/listings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const isCreateOrMutateListingsApi =
    req.nextUrl.pathname === "/api/listings" && req.method !== "GET";

  if (isProtectedRoute(req) || isCreateOrMutateListingsApi) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
