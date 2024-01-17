import type { Config } from "drizzle-kit";

import env from "../../env";

const connectionString = env.DATABASE_URL + "?ssl=true&sslmode=require";

export default {
  schema: "./server/**/*.sql.ts",
  out: "./server/db/_migrations",
  driver: "pg",
  dbCredentials: {
    connectionString,
  },
} satisfies Config;
