import { NextResponse } from "next/server";

const authRoutes = ["/login", "/register"];



export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  console.log('token', token);

  if(!token){
    if(authRoutes.includes(pathname)){
      return NextResponse.next();
    }else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (token) {
    // Prevent access to login or register routes if already logged in
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard/project", request.url)); 
    }
  }

  return NextResponse.next();
}

// Matching paths that trigger the middleware
export const config = {
  matcher: ["/meeting", "/dashboard/:path*", '/login', '/register'],
};
