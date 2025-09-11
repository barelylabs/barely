import * as React from 'react';
import { Link, Text } from '@react-email/components';

interface InvoiceFooterProps {
	workspaceName: string;
}

export function InvoiceFooter({ workspaceName }: InvoiceFooterProps) {
	return (
		<div
			style={{
				textAlign: 'center',
				marginTop: '40px',
				paddingTop: '20px',
				borderTop: '1px solid #e2e8f0',
			}}
		>
			<Text
				style={{
					margin: '0',
					fontSize: '12px',
					lineHeight: '1.5',
					color: '#64748b',
				}}
			>
				{workspaceName} uses Barely Invoice to manage their invoices.
				<br />
				Learn more about{' '}
				<Link
					href='https://barelyinvoice.com'
					target='_blank'
					style={{
						color: '#3182ce',
						textDecoration: 'underline',
					}}
				>
					Barely Invoice.
				</Link>
			</Text>
		</div>
	);
}
