import { generateOpenApiDocument } from "trpc-openapi";

import { env } from "../../env";
import { edgeRouter } from "./router.edge";

/* 👇 */
export const openApiDocument = generateOpenApiDocument(edgeRouter, {
  title: "tRPC OpenAPI",
  version: "1.0.0",
  baseUrl: env.NEXT_PUBLIC_APP_ABSOLUTE_BASE_URL,
});
