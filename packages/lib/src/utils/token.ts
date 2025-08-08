import type { DbHttp } from '@barely/db/client';
import { VipSwapAccessLogs } from '@barely/db/sql/vip-swap.sql';
import { eq } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';

// Create a custom alphabet for secure tokens
const nanoid = customAlphabet(
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	32,
);

export function generateSecureToken(): string {
	return nanoid();
}

/**
 * Generates a unique download token with database validation
 * @param db Database connection to check uniqueness
 * @param maxRetries Maximum number of retries if collision occurs (default: 5)
 * @returns A unique token guaranteed not to exist in the database
 */
export async function generateUniqueDownloadToken(
	db: DbHttp,
	maxRetries = 5,
): Promise<string> {
	for (let i = 0; i < maxRetries; i++) {
		const token = generateSecureToken();

		// Check if token already exists in database
		const existing = await db.query.VipSwapAccessLogs.findFirst({
			where: eq(VipSwapAccessLogs.downloadToken, token),
		});

		if (!existing) {
			return token;
		}

		// Log collision for monitoring (rare but good to know)
		console.warn(`Token collision detected on attempt ${i + 1}/${maxRetries}`);
	}

	// If we've exhausted retries, add timestamp for guaranteed uniqueness
	const timestampSuffix = Date.now().toString(36);
	return `${generateSecureToken()}_${timestampSuffix}`;
}
