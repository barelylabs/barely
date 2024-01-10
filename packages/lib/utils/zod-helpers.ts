import type { ZodType } from "zod";
import { z } from "zod";

import { sha256 } from "./hash";

export const z_boolean = z.preprocess((v) => {
  if (typeof v === "string") {
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return v;
}, z.boolean());

export const z_optStr_hash = z
  .string()
  .optional()
  .transform((str) => sha256(str));

export const z_optStr_lowerCase_hash = z
  .string()
  .optional()
  .transform((s) => sha256(s?.toLowerCase()));

// json

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

type Literal = z.infer<typeof literalSchema>;

type Json = Literal | { [key: string]: Json } | Json[];

const z_json: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(z_json), z.record(z_json)]),
);

export const z_stringToJson = z
  .string()
  .transform((str, ctx): z.infer<typeof z_json> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: "custom", message: "Invalid JSON" });
      return z.NEVER;
    }
  });

export function stringToJSON<Schema extends ZodType>(
  str: string,
  schema: Schema,
): z.infer<Schema> {
  const json = z_stringToJson.safeParse(str);

  if (!json.success) throw new Error(json.error.toString());

  const parsed = schema.safeParse(json.data);

  if (!parsed.success) throw new Error(parsed.error.toString());

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return parsed.data;
}

export function stringToJSONSafe<Schema extends ZodType>(
  str: string,
  schema: Schema,
):
  | { success: true; data: z.infer<Schema> }
  | { success: false; error: z.ZodError } {
  const json = z_stringToJson.safeParse(str);

  if (!json.success)
    return {
      success: false,
      error: json.error,
    };

  const parsed = schema.safeParse(json.data);

  if (!parsed.success)
    return {
      success: false,
      error: parsed.error,
    };

  return {
    success: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    data: parsed.data,
  };
}
