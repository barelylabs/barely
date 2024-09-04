import { resend } from '@barely/email';
import { logger, task, wait } from '@trigger.dev/sdk/v3';
import { eq } from 'drizzle-orm';

import type { EmailDomain } from '../server/routes/email-domain/email-domain.schema';
import { dbHttp } from '../server/db';
import { EmailDomains } from '../server/routes/email-domain/email-domain.sql';

export const verifyEmailDomain = task({
	id: 'verify-email-domain',
	run: async (domain: EmailDomain) => {
		const verifyRes = await resend.domains.verify(domain.resendId);

		if (verifyRes.error) {
			throw new Error(verifyRes.error.message);
		} else if (!verifyRes.data) {
			throw new Error('No data returned from Resend');
		}

		const checkIntervals = [5, 10, 15, 30, 60] as const;
		const maxAttempts = 289; // 5 initial checks + 284 checks (24 hours / 5 minutes)
		let attempt = 0;

		while (attempt < maxAttempts) {
			if (attempt < checkIntervals.length) {
				await wait.for({ seconds: checkIntervals[attempt] ?? 300 });
			} else {
				await wait.for({ minutes: 5 });
			}

			const updatedDomainRes = await resend.domains.get(domain.resendId);

			if (!updatedDomainRes?.data) {
				throw new Error('No data returned from Resend');
			}

			if (updatedDomainRes.data.status === 'verified') {
				await dbHttp
					.update(EmailDomains)
					.set({
						status: updatedDomainRes.data.status,
						records: updatedDomainRes.data.records,
					})
					.where(eq(EmailDomains.id, domain.id));

				logger.info(`Email domain ${domain.id} verified successfully`);
				// todo: send pusher event to invalidate emailDomain query cache
				return;
			}

			if (updatedDomainRes.data.status === 'failed' || attempt === maxAttempts - 1) {
				await dbHttp
					.update(EmailDomains)
					.set({
						status: updatedDomainRes.data.status,
						records: updatedDomainRes.data.records,
					})
					.where(eq(EmailDomains.id, domain.id));

				logger.warn(`Email domain ${domain.id} not verified after 24 hours`);
				// todo: send pusher event to invalidate emailDomain query cache
			}

			attempt++;
		}

		return;
	},
});
