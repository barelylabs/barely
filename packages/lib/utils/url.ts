import { env } from "../env";
import { raise } from "./raise";

export function absoluteUrl(site: "app" | "link" | "www", path: string) {
  // console.log("process.env => ", process.env);
  // console.log("env => ", env);

  const siteBaseUrl =
    site === "app"
      ? env.NEXT_PUBLIC_APP_BASE_URL
      : site === "link"
        ? env.NEXT_PUBLIC_LINK_BASE_URL
        : site === "www"
          ? env.NEXT_PUBLIC_WWW_BASE_URL
          : raise(`Invalid proj`);

  return `${siteBaseUrl}/${path}`;
}

// export function getBaseUrl({
//   devPort,
//   absolute = false,
// }: {
//   devPort?: string;
//   absolute?: boolean;
// }) {
//   if (!absolute && typeof window !== "undefined") {
//     return ""; // browser should use relative url
//   }

//   if (
//     process.env.VERCEL_ENV === "production" ||
//     process.env.VERCEL_ENV === "preview"
//   ) {
//     if (!process.env.VERCEL_URL) throw new Error("VERCEL_URL not found");
//     return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
//   }

//   if (!devPort) console.error("devPort not found for base url");

//   return `http://localhost:${devPort ?? ""}`; // dev SSR should use localhost
// }

// export function absoluteUrl_App(path: string) {
//   return `${env.NEXT_PUBLIC_APP_ABSOLUTE_BASE_URL}${path}`;
// }

// export function getBaseUrl(devPort?: string) {
//   if (typeof window !== "undefined") {
//     return ""; // browser should use relative url
//   }

//   if (
//     process.env.VERCEL_ENV === "production" ||
//     process.env.VERCEL_ENV === "preview"
//   ) {
//     if (!process.env.VERCEL_URL) throw new Error("VERCEL_URL not found");
//     return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
//   }

//   if (!devPort) console.error("devPort not found for base url");

//   return `http://localhost:${devPort ?? ""}`; // dev SSR should use localhost
// }

// export function getAbsoluteBaseUrl(devPort?: string) {
//   if (
//     process.env.VERCEL_ENV === "production" ||
//     process.env.VERCEL_ENV === "preview"
//   ) {
//     if (!process.env.VERCEL_URL) throw new Error("VERCEL_URL not found");
//     return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
//   }

//   if (!devPort) console.error("devPort not found for base url");

//   return `http://localhost:${devPort ?? ""}`; // dev SSR should use localhost
// }
