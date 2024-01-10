import { NextResponse } from "next/server";
import { auth } from "@barely/server/auth";

// Set the paths that don't require the user to be signed in
// const publicPaths = ['/', '/login*', '/register*', '/api*'];

export default auth((req) => {
  console.log("url => ", req.url);

  const params = new URLSearchParams(req.url.split("?")[1]);
  // console.log('params => ', params.entries);

  const callbackUrl = params.get("callbackUrl");

  // if path is '/login' or '/register' and user isn't signed in, contine
  if (
    !req.auth?.user &&
    (req.url.startsWith("/login") || req.url.startsWith("/register"))
  )
    return NextResponse.next();

  // if path is '/login' or '/register' and user is signed in, redirect to callbackUrl or '/campaigns'
  if (
    req.auth?.user &&
    (req.url.startsWith("/login") || req.url.startsWith("/register"))
  )
    return NextResponse.redirect(callbackUrl ?? "/dashboard");

  // if path is '/logout' and there is no user, redirect to '/login'
  if (!req.auth?.user && req.url.startsWith("/logout"))
    return NextResponse.redirect("/login");

  // if path is '/logout' and there is a user, sign out and redirect to '/login'

  return NextResponse.next();
});

// export const config = {
// 	matcher: ['/account/:path*', '/campaigns/:path*', '/links/:path*'],
// };
