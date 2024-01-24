import { allClientEnvKeys, allServerEnvKeys, zEnv } from "@barely/env";

export const { env, clientEnv } = zEnv({
  clientEnvKeys: allClientEnvKeys,
  serverEnvKeys: allServerEnvKeys,
});
