import type { Config } from 'drizzle-kit';
// import { defineConfig } from 'drizzle-kit';
import { z } from 'zod';

const DATABASE_URL = z.string().url().parse(process.env.DATABASE_URL);

const connectionString = DATABASE_URL + '?ssl=true&sslmode=require';

export default {
	// dialect: 'pg',
	schema: './server/**/*.sql.ts',
	out: './server/db/_migrations',
	driver: 'pg',
	dbCredentials: {
		connectionString,
	},
} satisfies Config;

// export default defineConfig({
// 	dialect: 'postgresql',
// 	schema: './server/**/*.sql.ts',
// 	out: './server/db/_migrations',
// 	// driver: 'pg',
// 	dbCredentials: {
// 		url: connectionString,
// 	},
// });
