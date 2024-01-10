function getBaseUrl(devPort?: string) {
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

export const NEXT_PUBLIC_APP_BASE_URL = getBaseUrl(
  process.env.NEXT_PUBLIC_APP_DEV_PORT,
);
export const NEXT_PUBLIC_WWW_BASE_URL = getBaseUrl(
  process.env.NEXT_PUBLIC_WWW_DEV_PORT,
);
export const NEXT_PUBLIC_LINK_BASE_URL = getBaseUrl(
  process.env.NEXT_PUBLIC_LINK_DEV_PORT,
);
