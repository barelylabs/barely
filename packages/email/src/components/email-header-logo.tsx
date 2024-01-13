import * as React from "react";
import { Img } from "@react-email/img";

import env from "../../env";

// import env from '~/env';

export function getBaseUrl(devPort?: string) {
  if (typeof window !== "undefined") {
    return ""; // browser should use relative url
  }

  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview"
  ) {
    if (!process.env.VERCEL_URL) throw new Error("VERCEL_URL not found");
    return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  }

  if (!devPort) console.error("devPort not found for base url");

  return `http://localhost:${devPort ?? ""}`; // dev SSR should use localhost
}

const EmailHeaderLogo = () => {
  const baseUrl = getBaseUrl(env.NEXT_PUBLIC_APP_DEV_PORT);
  const logoUrl = `${baseUrl}/_static/logo.png`;
  return (
    <div className="flex flex-col">
      <Img
        src={logoUrl}
        alt="barely.io logo"
        style={{
          paddingTop: "0.5rem",
          paddingBottom: "0.5rem",
          width: "42px",
          height: "42px",
        }}
      />
    </div>
  );
};

export { EmailHeaderLogo };
