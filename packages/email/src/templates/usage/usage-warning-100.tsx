import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from '@react-email/components';

import { button, container, heading, main, resetText } from '../../styles';

export interface UsageWarning100EmailProps {
	resourceType: string;
	resourceLabel: string;
	currentUsage: number;
	limit: number;
	workspaceName: string;
	upgradeUrl: string;
}

export function UsageWarning100EmailTemplate({
	resourceType: _resourceType,
	resourceLabel,
	currentUsage,
	limit,
	workspaceName,
	upgradeUrl,
}: UsageWarning100EmailProps) {
	const percentage = Math.round((currentUsage / limit) * 100);
	const previewText = `You've reached your ${resourceLabel} limit on Barely`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body style={main}>
				<Container style={container}>
					{/* Main Heading */}
					<Section style={{ textAlign: 'center', marginBottom: '20px' }}>
						<Text
							style={{
								...heading,
								fontSize: '28px',
								fontWeight: 'bold',
								margin: '0 0 10px 0',
								color: '#ea580c', // Orange for urgent warning
							}}
						>
							Limit Reached
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#64748b',
								margin: '0',
							}}
						>
							You&apos;ve reached your {resourceLabel.toLowerCase()} limit
						</Text>
					</Section>

					<Hr style={{ marginTop: '30px', marginBottom: '30px' }} />

					{/* Warning Box */}
					<Section
						style={{
							borderRadius: '8px',
							backgroundColor: '#fff7ed', // Light orange background
							borderLeft: '4px solid #ea580c',
							padding: '20px',
							marginBottom: '30px',
						}}
					>
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#9a3412',
								margin: '0',
								fontWeight: '500',
							}}
						>
							{percentage}% of your {resourceLabel.toLowerCase()} limit used
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '14px',
								color: '#7c2d12',
								margin: '10px 0 0 0',
							}}
						>
							Your workspace <strong>{workspaceName}</strong> has used{' '}
							<strong>
								{currentUsage.toLocaleString()} of {limit.toLocaleString()}
							</strong>{' '}
							{resourceLabel.toLowerCase()}.
						</Text>
					</Section>

					{/* Grace Period Notice */}
					<Section
						style={{
							borderRadius: '8px',
							backgroundColor: '#f1f5f9',
							padding: '20px',
							marginBottom: '30px',
						}}
					>
						<Text
							style={{
								...resetText,
								fontSize: '15px',
								color: '#334155',
								margin: '0',
								fontWeight: '600',
							}}
						>
							Grace Period Active
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '14px',
								color: '#475569',
								margin: '10px 0 0 0',
								lineHeight: '1.6',
							}}
						>
							You can continue creating {resourceLabel.toLowerCase()} up to 200% of your
							limit. However, we strongly recommend upgrading now to avoid any
							interruptions to your workflow.
						</Text>
					</Section>

					{/* Details */}
					<Section style={{ marginBottom: '30px' }}>
						<Text
							style={{
								...resetText,
								fontSize: '15px',
								color: '#334155',
								lineHeight: '1.6',
							}}
						>
							Once you exceed 200% of your limit, you won&apos;t be able to create new{' '}
							{resourceLabel.toLowerCase()} until you upgrade your plan or wait for your
							billing cycle to reset.
						</Text>
					</Section>

					{/* CTA Button */}
					<Section style={{ textAlign: 'center', marginBottom: '40px' }}>
						<Button
							href={upgradeUrl}
							style={{
								...button,
								backgroundColor: '#ea580c',
								padding: '14px 40px',
							}}
						>
							Upgrade Now
						</Button>
					</Section>

					{/* Footer */}
					<Hr style={{ marginBottom: '20px' }} />
					<Text
						style={{
							...resetText,
							fontSize: '12px',
							color: '#94a3b8',
							textAlign: 'center',
						}}
					>
						This is an automated notification from Barely. You&apos;re receiving this
						because you&apos;ve reached a usage limit on your account.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

UsageWarning100EmailTemplate.PreviewProps = {
	resourceType: 'fans',
	resourceLabel: 'Fans/Contacts',
	currentUsage: 1000,
	limit: 1000,
	workspaceName: 'My Music Project',
	upgradeUrl: 'https://app.barely.ai/my-project/settings/billing/upgrade',
} satisfies UsageWarning100EmailProps;

export default UsageWarning100EmailTemplate;
