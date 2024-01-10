import { allClientEnvSchema, allServerEnvSchema, zEnv } from "@barely/env";

const serverEnvSchema = allServerEnvSchema.pick({});
const clientEnvSchema = allClientEnvSchema.pick({});

const env = zEnv({ clientEnvSchema, serverEnvSchema });

export default env;
