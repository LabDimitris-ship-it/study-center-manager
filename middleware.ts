import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoggedIn =
    request.cookies.get("studyCenterLoggedIn")?.value === "true";

  // Η σελίδα login είναι δημόσια
  if (pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    return NextResponse.next();
  }

  // Αν δεν είναι συνδεδεμένος → Login
  if (!isLoggedIn) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/students/:path*",
    "/registrations/:path*",
    "/payments/:path*",
    "/debts/:path*",
    "/login",
  ],
};