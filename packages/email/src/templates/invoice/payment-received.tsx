import React from 'react';
import {
	Body,
	Column,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Preview,
	Row,
	Section,
	Text,
} from '@react-email/components';

import { EmailFooter } from '../../components/email-footer';
import {
	InformationTableColumn,
	InformationTableLabel,
	InformationTableRow,
	InformationTableValue,
} from '../../primitives';
import { container, heading, main, resetText } from '../../styles';

export interface PaymentReceivedEmailProps {
	invoiceNumber: string;
	workspaceName: string;
	workspaceLogo?: string;
	clientName: string;
	clientEmail: string;
	clientCompany?: string;
	amountPaid: string;
	paymentDate: Date;
	paymentMethod?: string;
	transactionId?: string;
	supportEmail: string;
}

export function PaymentReceivedEmailTemplate({
	invoiceNumber,
	workspaceName,
	workspaceLogo,
	clientName,
	clientEmail,
	clientCompany,
	amountPaid,
	paymentDate,
	paymentMethod,
	transactionId,
	supportEmail,
}: PaymentReceivedEmailProps) {
	const previewText = `Payment received for invoice ${invoiceNumber}`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body style={main}>
				<Container style={container}>
					{/* Header */}
					<Section>
						<Row>
							<Column>
								<Img
									src={workspaceLogo ?? 'https://app.barely.ai/_static/logo.png'}
									width='42'
									height='42'
									alt={workspaceName}
								/>
							</Column>

							<Column align='right' style={{ display: 'table-cell' }}>
								<Text style={{ ...heading, fontWeight: 'bold', fontSize: '24px' }}>
									PAYMENT RECEIVED
								</Text>
							</Column>
						</Row>
					</Section>

					<Hr style={{ marginTop: '20px', marginBottom: '20px' }} />

					{/* Success Message */}
					<Section style={{ textAlign: 'center', marginBottom: '30px' }}>
						<div
							style={{
								display: 'inline-block',
								backgroundColor: '#10b981',
								borderRadius: '50%',
								padding: '10px',
								marginBottom: '15px',
							}}
						>
							<Text
								style={{
									fontSize: '32px',
									lineHeight: '1',
									margin: 0,
									color: 'white',
								}}
							>
								✓
							</Text>
						</div>
						<Text style={{ ...heading, fontSize: '20px', marginBottom: '10px' }}>
							Thank you for your payment!
						</Text>
						<Text style={{ ...resetText, fontSize: '16px', color: '#64748b' }}>
							Your payment has been successfully processed.
						</Text>
					</Section>

					{/* Payment Details */}
					<Section
						style={{
							borderCollapse: 'collapse',
							borderSpacing: '2px',
							borderRadius: '0.75rem',
							backgroundColor: '#f9fafb',
							fontSize: '14px',
							marginBottom: '20px',
						}}
					>
						<Row>
							<InformationTableColumn>
								<InformationTableRow>
									<InformationTableLabel>Invoice Number</InformationTableLabel>
									<InformationTableValue>{invoiceNumber}</InformationTableValue>
								</InformationTableRow>

								<InformationTableRow>
									<InformationTableLabel>Amount Paid</InformationTableLabel>
									<InformationTableValue>
										<span style={{ fontWeight: 'bold', fontSize: '16px' }}>
											{amountPaid}
										</span>
									</InformationTableValue>
								</InformationTableRow>

								<InformationTableRow>
									<InformationTableLabel>Payment Date</InformationTableLabel>
									<InformationTableValue>
										{paymentDate.toLocaleDateString(undefined, {
											month: 'long',
											day: 'numeric',
											year: 'numeric',
										})}
									</InformationTableValue>
								</InformationTableRow>

								{paymentMethod && (
									<InformationTableRow>
										<InformationTableLabel>Payment Method</InformationTableLabel>
										<InformationTableValue>{paymentMethod}</InformationTableValue>
									</InformationTableRow>
								)}
							</InformationTableColumn>

							<InformationTableColumn>
								<InformationTableRow>
									<InformationTableLabel>Paid By</InformationTableLabel>
									<InformationTableValue>
										<span style={{ fontWeight: 'bold' }}>{clientName}</span>
									</InformationTableValue>
									{clientCompany && (
										<InformationTableValue>{clientCompany}</InformationTableValue>
									)}
									<InformationTableValue>{clientEmail}</InformationTableValue>
								</InformationTableRow>

								{transactionId && (
									<InformationTableRow>
										<InformationTableLabel>Transaction ID</InformationTableLabel>
										<InformationTableValue>
											<span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
												{transactionId}
											</span>
										</InformationTableValue>
									</InformationTableRow>
								)}
							</InformationTableColumn>
						</Row>
					</Section>

					{/* Receipt Notice */}
					<Section style={{ marginTop: '30px', marginBottom: '30px' }}>
						<Text style={{ ...resetText, fontSize: '14px', textAlign: 'center' }}>
							This email serves as your official receipt for the payment.
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '14px',
								textAlign: 'center',
								marginTop: '10px',
							}}
						>
							Please keep this email for your records.
						</Text>
					</Section>

					{/* Support */}
					<Section style={{ marginTop: '40px' }}>
						<Hr style={{ marginBottom: '20px' }} />
						<Row>
							<Column align='center'>
								<Text
									style={{
										...resetText,
										textAlign: 'center',
										color: '#64748b',
										fontSize: '12px',
									}}
								>
									Questions about this payment?{' '}
									<a
										href={`mailto:${supportEmail}`}
										style={{ color: '#000000', textDecoration: 'underline' }}
									>
										Contact us
									</a>
								</Text>
							</Column>
						</Row>
					</Section>

					{/* Footer */}
					<EmailFooter />
				</Container>
			</Body>
		</Html>
	);
}

PaymentReceivedEmailTemplate.PreviewProps = {
	invoiceNumber: 'INV-TEST-000001',
	workspaceName: 'Barely Creative',
	clientName: 'John Smith',
	clientEmail: 'john@example.com',
	clientCompany: 'Smith Industries',
	amountPaid: '$3,588.75',
	paymentDate: new Date(),
	paymentMethod: 'Credit Card (**** 4242)',
	transactionId: 'ch_1234567890abcdef',
	supportEmail: 'support@barely.ai',
} satisfies PaymentReceivedEmailProps;

export default PaymentReceivedEmailTemplate;
