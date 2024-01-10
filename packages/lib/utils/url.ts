import { APP_BASE_URL } from "./constants";

export function absoluteUrl_App(path: string) {
  return `${APP_BASE_URL}${path}`;
}

export function getBaseUrl(devPort?: string) {
  if (typeof window !== "undefined") {
    return ""; // browser should use relative url
  }

  if (process.env.VERCEL_ENV === "production") {
    if (!process.env.VERCEL_URL) throw new Error("VERCEL_URL not found");
    return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  }

  if (!devPort) console.error("devPort not found for base url");

  return `http://localhost:${devPort ?? ""}`; // dev SSR should use localhost
}

export function getAbsoluteBaseUrl(devPort?: string) {
  if (process.env.VERCEL_ENV === "production") {
    if (!process.env.VERCEL_URL) throw new Error("VERCEL_URL not found");
    return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  }

  if (!devPort) console.error("devPort not found for base url");

  return `http://localhost:${devPort ?? ""}`; // dev SSR should use localhost
}
