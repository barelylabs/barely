import { env } from "../env";
import { raise } from "./raise";

export function absoluteUrl(site: "app" | "link" | "www", path: string) {
  console.log("absoluteUrl :: VERCEL_URL => ", process.env.VERCEL_URL);
  console.log(
    "absoluteURL :: app abs base url => ",
    env.NEXT_PUBLIC_APP_ABSOLUTE_BASE_URL,
  );

  const siteBaseUrl =
    site === "app"
      ? env.NEXT_PUBLIC_APP_ABSOLUTE_BASE_URL
      : site === "link"
        ? env.NEXT_PUBLIC_LINK_ABSOLUTE_BASE_URL
        : site === "www"
          ? env.NEXT_PUBLIC_WWW_ABSOLUTE_BASE_URL
          : raise(`Invalid proj`);

  return `${siteBaseUrl}/${path}`;
}
