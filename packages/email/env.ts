import { allClientEnvSchema, allServerEnvSchema, zEnv } from "@barely/env";

const serverEnvSchema = allServerEnvSchema.pick({
  RESEND_API_KEY: true,
});

const clientEnvSchema = allClientEnvSchema;

const env = zEnv({ serverEnvSchema, clientEnvSchema });

export default env;
