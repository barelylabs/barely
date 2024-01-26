import type { z } from "zod";

import { clientEnvSchema, processEnv, serverEnvSchema } from "./parent-env";

function safePick<
  T extends z.ZodObject<z.ZodRawShape>,
  K extends keyof z.infer<T>,
>(schema: T, keys: K[]) {
  const pickObj: Record<string, true> = {};
  keys.forEach((key) => {
    pickObj[key as string] = true;
  });

  return schema.pick(pickObj) as z.ZodObject<
    Pick<ReturnType<T["_def"]["shape"]>, (typeof keys)[number]>,
    "strip",
    z.ZodTypeAny
  >;
}

export function zEnv<
  KClient extends keyof z.infer<typeof clientEnvSchema>,
  KServer extends keyof z.infer<typeof serverEnvSchema>,
>({
  clientEnvKeys,
  serverEnvKeys,
}: {
  clientEnvKeys: KClient[];
  serverEnvKeys: KServer[];
}) {
  const isServer = typeof window === "undefined";

  const pickedClientEnvSchema = safePick(clientEnvSchema, clientEnvKeys);
  const pickedServerEnvSchema = safePick(serverEnvSchema, serverEnvKeys);

  const merged = pickedServerEnvSchema.merge(pickedClientEnvSchema);

  const parsed = isServer
    ? merged.safeParse(processEnv)
    : pickedClientEnvSchema.safeParse(processEnv);

  if (!parsed?.success) {
    console.error(
      "❌ Invalid environment variables ->\n",
      ...formatErrors(parsed.error.format()),
    );
    throw new Error("Invalid environment variables");
  }

  type ServerEnv = Pick<
    z.infer<typeof merged>,
    | Extract<KServer, keyof z.infer<typeof merged>>
    | Extract<KClient, keyof z.infer<typeof merged>>
  >;

  type ClientEnv = Pick<
    z.infer<typeof merged>,
    Extract<KClient, keyof z.infer<typeof merged>>
  >;

  const env = new Proxy(parsed.data, {
    get(target, prop: KClient | KServer) {
      if (typeof prop !== "string") return undefined;
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          `❌ Attempted to access server-side environment variable '${prop}' on the client`,
        );

      if (prop in target) return target[prop as keyof typeof target];

      return undefined;
    },
  }) as ServerEnv; // not ideal to cast it this way, but should be typesafe due to isServer guard above

  return { clientEnv: env as ClientEnv, env: env };
}

const formatErrors = (
  errors: z.ZodFormattedError<Map<string, string>, string>,
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}\n`;
    })
    .filter(Boolean);

export const allClientEnvKeys = Object.keys(
  clientEnvSchema.shape,
) as (keyof z.infer<typeof clientEnvSchema>)[];
export const allServerEnvKeys = Object.keys(
  serverEnvSchema.shape,
) as (keyof z.infer<typeof serverEnvSchema>)[];
