// Code for middleware function that checks if user is authenticated
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const token = localStorage.getItem("auth_token");

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

// Apply middleware only to protected routes
export const config = {
    matcher: ["/inventory", "/map", "/orders"],
};