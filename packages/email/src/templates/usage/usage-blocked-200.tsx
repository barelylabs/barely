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

export interface UsageBlocked200EmailProps {
	resourceType: string;
	resourceLabel: string;
	currentUsage: number;
	limit: number;
	workspaceName: string;
	upgradeUrl: string;
}

export function UsageBlocked200EmailTemplate({
	resourceType: _resourceType,
	resourceLabel,
	currentUsage,
	limit,
	workspaceName,
	upgradeUrl,
}: UsageBlocked200EmailProps) {
	const percentage = Math.round((currentUsage / limit) * 100);
	const previewText = `${resourceLabel} paused on your Barely workspace`;

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
								color: '#dc2626', // Red for blocked
							}}
						>
							Action Required
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#64748b',
								margin: '0',
							}}
						>
							{resourceLabel} creation has been paused
						</Text>
					</Section>

					<Hr style={{ marginTop: '30px', marginBottom: '30px' }} />

					{/* Blocked Box */}
					<Section
						style={{
							borderRadius: '8px',
							backgroundColor: '#fef2f2', // Light red background
							borderLeft: '4px solid #dc2626',
							padding: '20px',
							marginBottom: '30px',
						}}
					>
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#991b1b',
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
								color: '#7f1d1d',
								margin: '10px 0 0 0',
							}}
						>
							Your workspace <strong>{workspaceName}</strong> has exceeded 200% of its{' '}
							{resourceLabel.toLowerCase()} limit.
						</Text>
					</Section>

					{/* What's Blocked */}
					<Section
						style={{
							borderRadius: '8px',
							backgroundColor: '#f8fafc',
							padding: '20px',
							marginBottom: '30px',
						}}
					>
						<Text
							style={{
								...resetText,
								fontSize: '15px',
								color: '#0f172a',
								margin: '0',
								fontWeight: '600',
							}}
						>
							What&apos;s affected:
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
							You cannot create new {resourceLabel.toLowerCase()} until you upgrade your
							plan or your billing cycle resets.
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
							Your existing {resourceLabel.toLowerCase()} and other features remain
							accessible.
						</Text>
					</Section>

					{/* How to Unblock */}
					<Section style={{ marginBottom: '30px' }}>
						<Text
							style={{
								...resetText,
								fontSize: '15px',
								color: '#0f172a',
								margin: '0 0 15px 0',
								fontWeight: '600',
							}}
						>
							How to continue:
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '14px',
								color: '#334155',
								lineHeight: '1.6',
								margin: '0 0 10px 0',
							}}
						>
							1. <strong>Upgrade your plan</strong> - Get higher limits instantly
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '14px',
								color: '#334155',
								lineHeight: '1.6',
								margin: '0',
							}}
						>
							2. <strong>Wait for billing cycle reset</strong> - Your usage will reset at
							the start of your next billing period
						</Text>
					</Section>

					{/* CTA Button */}
					<Section style={{ textAlign: 'center', marginBottom: '40px' }}>
						<Button
							href={upgradeUrl}
							style={{
								...button,
								backgroundColor: '#dc2626',
								padding: '14px 40px',
							}}
						>
							Upgrade to Continue
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
						because you&apos;ve exceeded a usage limit on your account.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

UsageBlocked200EmailTemplate.PreviewProps = {
	resourceType: 'fans',
	resourceLabel: 'Fans/Contacts',
	currentUsage: 2100,
	limit: 1000,
	workspaceName: 'My Music Project',
	upgradeUrl: 'https://app.barely.ai/my-project/settings/billing/upgrade',
} satisfies UsageBlocked200EmailProps;

export default UsageBlocked200EmailTemplate;
