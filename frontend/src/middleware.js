import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const authRoutes = ["/login", "/register"];



export function middleware(request) {
  const { pathname } = request.nextUrl;
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  // Get token from cookies
  // const token = request.cookies.get('token')?.value;

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
