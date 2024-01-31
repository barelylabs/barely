import { generateOpenApiDocument } from "trpc-openapi";

import { getAbsoluteUrl } from "../../utils/url";
import { edgeRouter } from "./router.edge";

/* 👇 */
export const openApiDocument = generateOpenApiDocument(edgeRouter, {
  title: "tRPC OpenAPI",
  version: "1.0.0",
  baseUrl: getAbsoluteUrl("app"),
});
