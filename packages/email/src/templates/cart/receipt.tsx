import { Body } from '@react-email/body';
import { Button } from '@react-email/button';
import { Column } from '@react-email/column';
import { Container } from '@react-email/container';
import { Head } from '@react-email/head';
import { Hr } from '@react-email/hr';
import { Html } from '@react-email/html';
import { Img } from '@react-email/img';
import { Preview } from '@react-email/preview';
import { Row } from '@react-email/row';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';

import {
	InformationTableColumn,
	InformationTableLabel,
	InformationTableRow,
	InformationTableValue,
} from '../../primitives';
import {
	container,
	heading,
	main,
	mutedText,
	outlineButton,
	resetText,
} from '../../styles';

export interface ReceiptEmailProps {
	cartId: string;
	sellerName: string;
	date: Date;
	supportEmail: string;
	billingAddress: {
		name: string;
		city?: string | null;
		state?: string | null;
		postalCode: string | null;
		country: string | null;
	};
	shippingAddress?: {
		name: string;
		line1: string | null;
		line2: string | null;
		city: string | null;
		state: string | null;
		postalCode: string | null;
		country: string | null;
	};
	products: {
		name: string;
		price: string;
		payWhatYouWantPrice?: string;
		shipping?: string;
	}[];
	shippingTotal?: string;
	total: string;
}

export default function ReceiptEmail({
	cartId,
	sellerName,
	supportEmail,
	shippingAddress,
	billingAddress,
	date,
	products,
	shippingTotal,
	total,
}: ReceiptEmailProps) {
	const previewText = `Your receipt from ${sellerName}`;

	return (
		// <Tailwind>
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body style={main}>
				<Container
					style={container}
					// className='border-slate sm:border'
				>
					<Section>
						<Row>
							<Column>
								<Img
									src={'https://app.barely.io/_static/logo.png'}
									width='42'
									height='42'
									alt='Logo'
								/>
							</Column>

							<Column align='right' style={{ display: 'table-cell' }}>
								<Text style={{ ...heading, fontWeight: 'bold' }}>Receipt</Text>
							</Column>
						</Row>
					</Section>

					<Section>
						<Row>
							<Column align='right'>
								<Text>
									{date.toLocaleDateString(undefined, {
										month: 'long',
										day: 'numeric',
										year: 'numeric',
									})}
								</Text>
							</Column>
						</Row>
					</Section>

					<Section
						style={{
							borderCollapse: 'collapse',
							borderSpacing: '2px',
							borderRadius: '0.75rem',
							backgroundColor: '#f9fafb',
							fontSize: '1rem',
						}}
						// className='border-collapse border-spacing-[2px] rounded-xl bg-slate-100 text-md'
					>
						<Row>
							<InformationTableColumn>
								<InformationTableRow>
									<InformationTableLabel>Invoice</InformationTableLabel>
									<InformationTableValue>{cartId}</InformationTableValue>
								</InformationTableRow>

								<InformationTableRow>
									<InformationTableLabel>Creator</InformationTableLabel>
									<InformationTableValue>{sellerName}</InformationTableValue>
								</InformationTableRow>

								{shippingAddress && (
									<InformationTableRow>
										<InformationTableLabel>Billed to</InformationTableLabel>
										<InformationTableValue>{billingAddress.name}</InformationTableValue>
										<InformationTableValue>
											{billingAddress.state} {billingAddress.postalCode}
										</InformationTableValue>
										<InformationTableValue>
											{billingAddress.country}
										</InformationTableValue>
									</InformationTableRow>
								)}
							</InformationTableColumn>

							{shippingAddress ?
								<InformationTableColumn>
									<InformationTableLabel>Shipping to</InformationTableLabel>
									<InformationTableValue>{shippingAddress.name}</InformationTableValue>
									<InformationTableValue>{shippingAddress.line1}</InformationTableValue>
									{shippingAddress.line2 && (
										<InformationTableValue>{shippingAddress.line2}</InformationTableValue>
									)}
									<InformationTableValue>{shippingAddress.city}</InformationTableValue>
									<InformationTableValue>
										{shippingAddress.state} {shippingAddress.postalCode}
									</InformationTableValue>
									<InformationTableValue>{shippingAddress.country}</InformationTableValue>
								</InformationTableColumn>
							:	<InformationTableColumn>
									<InformationTableLabel>Billed to</InformationTableLabel>
									<InformationTableValue>{billingAddress.name}</InformationTableValue>
									<InformationTableValue>
										{billingAddress.state} {billingAddress.postalCode}
									</InformationTableValue>
									<InformationTableValue>{billingAddress.country}</InformationTableValue>
								</InformationTableColumn>
							}
						</Row>
					</Section>

					<Section
						style={{
							borderCollapse: 'collapse',
							borderSpacing: '0',
							borderRadius: '0.75rem',
							fontSize: '1rem',
						}}
					>
						<Row>
							<Column align='right'>
								<Text style={{ ...resetText, marginTop: '20px' }}>Total (USD)</Text>
								<Text style={{ ...heading, marginTop: 0 }}>{total}</Text>
							</Column>
						</Row>

						<Hr style={{ margin: 0 }} />

						<Row
							style={{
								marginTop: '8px',
							}}
							// className='mt-2'
						>
							<Column>
								<Text
									style={{
										...resetText,
										fontSize: '1.125rem',
										lineHeight: '1.5rem',
										fontWeight: 'bold',
									}}
								>
									Product
								</Text>
							</Column>
							<Column align='right'>
								<Text
									style={{
										...resetText,
										fontSize: '1.125rem',
										lineHeight: '1.5rem',
										fontWeight: 'bold',
									}}
								>
									Total
								</Text>
							</Column>
						</Row>
						{/* <Hr style={{ opacity: 0 }} /> */}

						{products.map((product, index) => {
							return (
								<Section key={index}>
									<Row style={{ padding: '10px 0' }}>
										<Column style={{ verticalAlign: 'top' }}>
											<Text
												style={{
													...resetText,
													fontSize: '14px',
													lineHeight: 1.25,
													margin: '0',
													padding: '0',
													paddingRight: '8px',
												}}
												// className='m-0 p-0 pr-2 text-sm leading-tight'
											>
												{product.name}
											</Text>

											{product.payWhatYouWantPrice && (
												<Text
													style={{
														...resetText,
														...mutedText,
														marginTop: '4px',
														fontSize: '12px',
													}}
												>
													Pay what you want: {product.payWhatYouWantPrice}
												</Text>
											)}

											{product.shipping && (
												<Text
													style={{
														...resetText,
														...mutedText,
														marginTop: '4px',
														fontSize: '12px',
													}}
												>
													Shipping: {product.shipping}
												</Text>
											)}
										</Column>

										<Column align='right' style={{ verticalAlign: 'top' }}>
											<Text
												style={{
													fontSize: '14px',
													margin: '0',
													padding: '0',
													lineHeight: 1.4,
												}}
											>
												{product.price}
											</Text>
										</Column>
									</Row>
									<Hr />
								</Section>
							);
						})}

						<Section style={{ width: 'fit-content' }} align='right'>
							{shippingTotal && (
								<>
									<Row>
										<Column style={{ display: 'table-cell' }} align='right'>
											<Text style={{ ...resetText, marginTop: '8px' }}>Shipping:</Text>
										</Column>
										<Column
											align='right'
											style={{ display: 'table-cell', width: '90px' }}
										>
											<Text style={{ ...resetText, marginTop: '8px' }}>
												{shippingTotal}
											</Text>
										</Column>
									</Row>
									<Hr />
								</>
							)}

							<Row>
								<Column style={{ display: 'table-cell' }} align='right'>
									<Text style={{ ...resetText, fontWeight: 'bold' }}>Total:</Text>
								</Column>
								<Column align='right' style={{ display: 'table-cell', width: '90px' }}>
									<Text style={{ ...resetText, fontWeight: 'bold' }}>{total}</Text>
								</Column>
							</Row>
						</Section>
					</Section>

					<Section
						style={{
							marginTop: '24px',
						}}
						// className='mt-6 sm:mt-20'
					>
						<Row>
							<Column>
								<Button style={{ ...outlineButton }} href={`mailto:${supportEmail}`}>
									Contact Support
								</Button>
							</Column>
						</Row>
						<Text
							style={{
								...resetText,
								textAlign: 'center',
								color: '#64748b',
								fontSize: '12px',
								lineHeight: '1rem',
							}}
							// className='text-slate text-center text-xs'
						>
							If you need any help, please use the link above to contact the creator
							directly.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
		// </Tailwind>
	);
}

ReceiptEmail.PreviewProps = {
	cartId: 'ML4F5L8522',
	sellerName: 'Proper Youth',
	// buyerName: 'Adam Barito',
	shippingTotal: '$5.55',
	total: '$115.55',
	date: new Date(),
	supportEmail: 'support@properyouth.com',
	billingAddress: {
		name: 'Adam Barito',
		city: 'San Francisco',
		state: 'CA',
		postalCode: '94103',
		country: 'USA',
	},
	shippingAddress: {
		name: 'Adam Barito',
		line1: '1234 Main St',
		line2: 'Apt 123',
		city: 'San Francisco',
		state: 'CA',
		postalCode: '94103',
		country: 'USA',
	},
	products: [
		{
			name: 'So Close To Paradise :: Autographed CD',
			price: '$100.00',
			payWhatYouWantPrice: '$100.00',
			shipping: '$5.55',
		},
		{
			name: 'Rusty Grand Am :: Pre-Order CD',
			price: '$10.00',
		},
	],
} satisfies ReceiptEmailProps;
