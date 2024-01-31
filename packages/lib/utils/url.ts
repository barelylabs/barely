import { env } from "../env";
import { raise } from "./raise";

export function getBaseUrl(app: "app" | "link" | "www", absolute = false) {
  if (!absolute && typeof window !== "undefined") return ""; // browser should use relative url

  const currentApp = env.NEXT_PUBLIC_CURRENT_APP;

  const vercelEnv =
    process.env.VERCEL_ENV ??
    process.env.NEXT_PUBLIC_VERCEL_ENV ??
    raise("getBaseUrl :: VERCEL_ENV not found");

  const vercelUrl =
    process.env.VERCEL_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    raise("getBaseUrl :: VERCEL_URL not found");

  if (vercelEnv === "development") {
    const devPort =
      app === "app"
        ? env.NEXT_PUBLIC_APP_DEV_PORT ??
          raise("NEXT_PUBLIC_APP_DEV_PORT not found")
        : app === "link"
          ? env.NEXT_PUBLIC_LINK_DEV_PORT ??
            raise("NEXT_PUBLIC_LINK_DEV_PORT not found")
          : app === "www"
            ? env.NEXT_PUBLIC_WWW_DEV_PORT ??
              raise("NEXT_PUBLIC_WWW_DEV_PORT not found")
            : raise("Invalid app");

    return `http://localhost:${devPort}`; // dev SSR should use localhost
  }

  const baseUrl =
    app === "app"
      ? env.NEXT_PUBLIC_APP_BASE_URL
      : app === "link"
        ? env.NEXT_PUBLIC_LINK_BASE_URL
        : app === "www"
          ? env.NEXT_PUBLIC_WWW_BASE_URL
          : raise("Invalid app");

  if (vercelEnv === "preview") {
    const previewBaseUrl = app === currentApp ? vercelUrl : baseUrl;
    return `https://${previewBaseUrl}`; // SSR should use vercel url
  }

  if (vercelEnv === "production") {
    return `https://${baseUrl}`;
  }

  return raise("getBaseUrl :: Invalid vercel env");
}

export function getAbsoluteUrl(app: "app" | "link" | "www", path?: string) {
  const appBaseUrl = getBaseUrl(app, true);
  return `${appBaseUrl}${path ? `/${path}` : ""}`;
}
