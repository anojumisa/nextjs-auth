import { NextRequest, NextResponse } from "next/server";

// Define protected routes
const protectedRoutes = ["/dashboard", "/admin"];
const publicRoutes = ["/login", "/"];

export default async function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;
	const isProtectedRoute = protectedRoutes.some((route) =>
		path.startsWith(route),
	);
	const isPublicRoute = publicRoutes.includes(path);

	// Get session from request cookies (Edge runtime: use req.cookies, not cookies() from next/headers)
	const cookie = req.cookies.get("session")?.value;
	let session: { userId?: number; role?: string; expiresAt?: string } | null =
		null;

	if (cookie) {
		try {
			session = JSON.parse(cookie);
			if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
				session = null;
			}
		} catch {
			session = null;
		}
	}

	// Redirect to login if accessing protected route without session
	if (isProtectedRoute && !session?.userId) {
		const loginUrl = new URL("/login", req.url);
		loginUrl.searchParams.set("redirect", path);
		return NextResponse.redirect(loginUrl);
	}

	// Redirect authenticated users away from login page
	if (isPublicRoute && path === "/login" && session?.userId) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	// Check admin access for admin routes
	if (path.startsWith("/admin") && session?.role !== "admin") {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
