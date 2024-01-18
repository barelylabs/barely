import { NextResponse } from "next/server";
import { absoluteUrl } from "@barely/lib/utils/url";
import { auth } from "@barely/server/auth";

export default auth((req) => {
  console.log("url => ", req.url);

  if (!req.auth?.user)
    return NextResponse.redirect(absoluteUrl("app", "login"));

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_static|_next/static|login|logout|register|privacy|terms|_next/image|favicon.ico).*)",
  ],
};
