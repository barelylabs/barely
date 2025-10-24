import React from 'react';
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Text,
} from '@react-email/components';

import * as styles from '../../styles';

export interface TestimonialSubmissionEmailProps {
	name: string;
	bandName: string;
	tier: 'bedroom' | 'rising' | 'breakout';
	duration: 'less-3' | '3-6' | '6-12' | '12-plus';
	testimonial: string;
	consent: boolean;
}

const tierDisplay = {
	bedroom: 'Bedroom+',
	rising: 'Rising+',
	breakout: 'Breakout+',
};

const durationDisplay = {
	'less-3': 'Less than 3 months',
	'3-6': '3-6 months',
	'6-12': '6-12 months',
	'12-plus': '12+ months',
};

export function TestimonialSubmissionEmail({
	name,
	bandName,
	tier,
	duration,
	testimonial,
	consent,
}: TestimonialSubmissionEmailProps) {
	const previewText = `New testimonial from ${name} (${bandName})`;
	const eligible = duration === '6-12' || duration === '12-plus';

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={styles.main}>
				<Container style={styles.container}>
					<Heading style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
						New Testimonial Submission
					</Heading>

					{eligible && (
						<Section
							style={{
								marginBottom: '24px',
								padding: '16px',
								backgroundColor: '#f0fdf4',
								border: '1px solid #86efac',
								borderRadius: '8px',
							}}
						>
							<Text style={{ ...styles.resetText, color: '#166534', fontWeight: 'bold' }}>
								💰 Eligible for $100 Credit
							</Text>
							<Text style={{ ...styles.resetText, color: '#166534' }}>
								This client has been with Barely for{' '}
								{durationDisplay[duration].toLowerCase()}
							</Text>
						</Section>
					)}

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Client Information
						</Heading>
						<Text style={styles.resetText}>
							<strong>Name:</strong> {name}
						</Text>
						<Text style={styles.resetText}>
							<strong>Band/Artist Name:</strong> {bandName}
						</Text>
						<Text style={styles.resetText}>
							<strong>Current Tier:</strong> {tierDisplay[tier]}
						</Text>
						<Text style={styles.resetText}>
							<strong>Time with Barely:</strong> {durationDisplay[duration]}
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Testimonial
						</Heading>
						<Text style={{ ...styles.resetText, whiteSpace: 'pre-wrap' }}>
							{testimonial}
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Text style={styles.resetText}>
							<strong>Consent to Use Publicly:</strong> {consent ? '✅ Yes' : '❌ No'}
						</Text>
					</Section>

					<Section
						style={{
							marginTop: '32px',
							borderTop: '1px solid #e5e5e5',
							paddingTop: '24px',
						}}
					>
						<Text style={styles.mutedText}>
							This email was sent from the Barely NYC testimonials form.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

TestimonialSubmissionEmail.PreviewProps = {
	name: 'John Doe',
	bandName: 'The Example Band',
	tier: 'rising' as const,
	duration: '6-12' as const,
	testimonial:
		"Working with Barely has been a game-changer for our band. Before, we were throwing money at ads without understanding what worked. Now we see exactly how each campaign performs and why certain audiences convert better. We've grown from 8K to 23K monthly listeners in 4 months, and the transparency is incredible.",
	consent: true,
} as TestimonialSubmissionEmailProps;

export default TestimonialSubmissionEmail;
