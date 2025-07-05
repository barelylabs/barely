import type { Config } from 'drizzle-kit';
import { z } from 'zod/v4';

const DATABASE_URL = z.url().parse(process.env.DATABASE_URL);
const connectionString = DATABASE_URL + '?ssl=true&sslmode=require';

export default {
	dialect: 'postgresql',
	schema: './src/sql/**/*.sql.ts',
	out: './_migrations',
	// driver: 'pg',
	dbCredentials: { url: connectionString },
} satisfies Config;
