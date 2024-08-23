'use client';

import type { EmailDomain } from '@barely/lib/server/routes/email/email.schema';
import { api } from '@barely/lib/server/api/react';
import { useSetAtom } from 'jotai';

import { Card } from '@barely/ui/elements/card';

import {
	showEmailDomainModalAtom,
	updateEmailDomainAtom,
} from '~/app/[handle]/settings/domains/email/_components/email-domain-modal';

export function EmailDomainCard(props: { domain: EmailDomain }) {
	const { data: domain } = api.email.domainByName.useQuery(props.domain.name, {
		initialData: props.domain,
	});

	const { data: domainVerification, isFetching: fetchingDomainVerification } =
		api.email.verifyDomainOnResend.useQuery(
			{
				id: domain?.id ?? '',
			},
			{
				enabled: !!domain?.id,
			},
		);

	const setUpdateEmailDomain = useSetAtom(updateEmailDomainAtom);
	const showEmailDomainModal = useSetAtom(showEmailDomainModalAtom);

	if (!domain) return null;

	return <Card>test</Card>;
}
