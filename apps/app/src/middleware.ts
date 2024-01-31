import { NextResponse } from "next/server";
import { getAbsoluteUrl } from "@barely/lib/utils/url";
import { auth } from "@barely/server/auth";

export default auth((req) => {
  console.log("middleware :: url => ", req.url);
  console.log("middleware :: VERCEL_URL => ", process.env.VERCEL_URL);
  console.log("middleware :: process.env => ", process.env);

  if (!req.auth?.user)
    return NextResponse.redirect(getAbsoluteUrl("app", "login"));

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_static|_next/static|login|logout|register|privacy|terms|_next/image|favicon.ico).*)",
  ],
};
