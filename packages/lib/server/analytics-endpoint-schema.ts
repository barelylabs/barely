import type { InferModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { AnalyticsEndpoints } from "./analytics-endpoint.sql";

export const insertAnalyticsEndpointSchema =
  createInsertSchema(AnalyticsEndpoints);
export const createAnalyticsEndpointSchema = insertAnalyticsEndpointSchema.omit(
  {
    id: true,
  },
);
export const updateAnalyticsEndpointSchema = insertAnalyticsEndpointSchema
  .partial()
  .required({ id: true });
export const upsertAnalyticsEndpointSchema =
  insertAnalyticsEndpointSchema.partial({
    id: true,
  });
export const selectAnalyticsEndpointSchema =
  createSelectSchema(AnalyticsEndpoints);

export type AnalyticsEndpoint = InferModel<typeof AnalyticsEndpoints>;
export type CreateAnalyticsEndpoint = z.infer<
  typeof createAnalyticsEndpointSchema
>;
export type UpdateAnalyticsEndpoint = z.infer<
  typeof updateAnalyticsEndpointSchema
>;
export type UpsertAnalyticsEndpoint = z.infer<
  typeof upsertAnalyticsEndpointSchema
>;
export type SelectAnalyticsEndpoint = z.infer<
  typeof selectAnalyticsEndpointSchema
>;

// forms
export const workspaceAnalyticsEndpointsFormSchema = z.object({
  meta: insertAnalyticsEndpointSchema,
  google: insertAnalyticsEndpointSchema,
  tiktok: insertAnalyticsEndpointSchema,
  snapchat: insertAnalyticsEndpointSchema,
});

export const insertMetaPixelSchema = createInsertSchema(AnalyticsEndpoints, {
  id: (schema) =>
    schema.id.length(15, {
      message: "Your meta pixel id should be 15 characters",
    }),
  platform: (schema) => schema.platform.refine((p) => p === "meta"),
  accessToken: (schema) =>
    schema.accessToken.min(150, {
      message: "Your access token should be at least 150 characters",
    }),
});
