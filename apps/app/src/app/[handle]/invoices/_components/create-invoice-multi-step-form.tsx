'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace, useZodForm } from '@barely/hooks';
import {
	formatMajorStringToMinorNumber,
	formatMinorToMajorCurrency,
} from '@barely/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { CurrencyField } from '@barely/ui/forms/currency-field';
import { DatetimeField } from '@barely/ui/forms/datetime-field';
import { Form } from '@barely/ui/forms/form';
import { NumberField } from '@barely/ui/forms/number-field';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Input } from '@barely/ui/input';
import { Label } from '@barely/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/select';
import { Separator } from '@barely/ui/separator';
import { Switch } from '@barely/ui/switch';
import { Text } from '@barely/ui/typography';

import { useClientSearchParams } from './client-context';
import { CreateOrUpdateClientModal } from './create-or-update-client-modal';
import { InvoicePreview } from './invoice-preview';

// Step 1: Invoice details schema
const lineItemSchema = z.object({
	description: z.string().min(1, 'Description is required'),
	quantity: z.number().min(1, 'Quantity must be at least 1'),
	unitPrice: z.number().min(0.01, 'Price must be greater than 0'),
});

const detailsFormSchema = z.object({
	invoiceNumber: z.string().min(1, 'Invoice number is required'),
	poNumber: z.string().optional(),
	lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
	hasTax: z.boolean().default(false),
	taxPercentage: z.number().min(0).max(100).default(0),
});

// Step 3: Payment details schema
const paymentFormSchema = z.object({
	invoiceDate: z.date(),
	dueDate: z.date(),
	payerMemo: z.string().optional(),
});

// Step 4: Review schema (just for send email preference)
const reviewFormSchema = z.object({
	sendEmail: z.boolean().default(false),
	ccEmail: z.union([z.email(), z.literal('')]),
});

const STEPS = ['client', 'details', 'payment', 'review'] as const;
type Step = (typeof STEPS)[number];

export function CreateInvoiceMultiStepForm() {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle, currency, workspace } = useWorkspace();

	const [currentStep, setCurrentStep] = useState<Step>('client');
	const { showCreateModal, setShowCreateModal } = useClientSearchParams();

	// Get current date and date 2 days from now
	const today = new Date();
	const twoDaysFromNow = new Date();
	twoDaysFromNow.setDate(today.getDate() + 2);

	// Load clients for dropdown
	const { data: clientsData, refetch: refetchClients } = useQuery({
		...trpc.invoiceClient.byWorkspace.queryOptions({ handle }),
	});

	// Form data that persists across steps
	const [formData, setFormData] = useState({
		clientId: '',
		invoiceNumber: '',
		poNumber: '',
		lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
		hasTax: false,
		taxPercentage: 0,
		invoiceDate: today,
		dueDate: twoDaysFromNow,
		payerMemo: '',
		sendEmail: false,
		ccEmail: '',
	});

	// Step 1: Details form
	const detailsForm = useZodForm({
		schema: detailsFormSchema,
		defaultValues: {
			invoiceNumber: formData.invoiceNumber,
			poNumber: formData.poNumber,
			lineItems: formData.lineItems,
			hasTax: formData.hasTax,
			taxPercentage: formData.taxPercentage,
		},
	});

	// Set up useFieldArray for line items
	const { fields, append, remove } = useFieldArray({
		control: detailsForm.control,
		name: 'lineItems',
	});

	// Step 3: Payment form
	const paymentForm = useZodForm({
		schema: paymentFormSchema,
		defaultValues: {
			invoiceDate: formData.invoiceDate,
			dueDate: formData.dueDate,
			payerMemo: formData.payerMemo,
		},
	});

	// Step 4: Review form
	const reviewForm = useZodForm({
		schema: reviewFormSchema,
		defaultValues: {
			sendEmail: formData.sendEmail,
			ccEmail: formData.ccEmail,
		},
	});

	// Handle client selection
	const handleClientSelect = useCallback(
		(clientId: string) => {
			if (clientId === 'new-client') {
				void setShowCreateModal(true);
			} else {
				setFormData(prev => ({ ...prev, clientId }));
				setCurrentStep('details');
			}
		},
		[setShowCreateModal],
	);

	// Generate next invoice number based on existing invoices
	const { data: invoicesData } = useQuery({
		...trpc.invoice.byWorkspace.queryOptions({ handle }),
	});

	const getNextInvoiceNumber = useCallback(() => {
		if (!invoicesData?.invoices.length) return 'INV-1';
		const lastNumber = Math.max(
			...invoicesData.invoices
				.map(inv => {
					const match = inv.invoiceNumber ? /INV-(\d+)/.exec(inv.invoiceNumber) : null;
					return match ? parseInt(match[1] ?? '0', 10) : 0;
				})
				.filter(Boolean),
			0,
		);
		return `INV-${lastNumber + 1}`;
	}, [invoicesData]);

	// Set invoice number when we have data
	if (!detailsForm.getValues('invoiceNumber') && invoicesData) {
		detailsForm.setValue('invoiceNumber', getNextInvoiceNumber());
	}

	const { mutate: sendInvoice } = useMutation({
		...trpc.invoice.send.mutationOptions(),
	});

	const { mutate: createInvoice, isPending: isCreating } = useMutation({
		...trpc.invoice.create.mutationOptions(),
		onSuccess: data => {
			if (formData.sendEmail) {
				// Send email after creation
				sendInvoice(
					{ id: data.id, handle },
					{
						onSuccess: () => {
							toast.success('Invoice created and sent successfully');
							router.push(`/${handle}/invoices/${data.id}`);
						},
						onError: () => {
							toast.success('Invoice created but failed to send email');
							router.push(`/${handle}/invoices/${data.id}`);
						},
					},
				);
			} else {
				toast.success('Invoice created successfully');
				router.push(`/${handle}/invoices/${data.id}`);
			}
		},
		onError: error => {
			toast.error(error instanceof Error ? error.message : 'Failed to create invoice');
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: trpc.invoice.byWorkspace.queryKey(),
			});
		},
	});

	// Calculate totals
	const calculateTotals = useCallback(() => {
		const lineItems = detailsForm.watch('lineItems');
		const hasTax = detailsForm.watch('hasTax');
		const taxPercentage = detailsForm.watch('taxPercentage');

		const subtotal = lineItems.reduce((sum, item) => {
			const unitPrice =
				typeof item.unitPrice === 'string' ?
					formatMajorStringToMinorNumber(item.unitPrice)
				:	item.unitPrice;
			return sum + item.quantity * unitPrice;
		}, 0); // Convert to cents
		const taxAmount =
			hasTax && taxPercentage ? Math.round((subtotal * taxPercentage) / 100) : 0;
		const total = subtotal + taxAmount;
		return { subtotal, taxAmount, total };
	}, [detailsForm]);

	const { total } = calculateTotals();

	// Line item handlers
	const addLineItem = () => {
		append({ description: '', quantity: 1, unitPrice: 0 });
	};

	const removeLineItem = (index: number) => {
		remove(index);
	};

	// Handle form submissions for each step
	const handleDetailsSubmit = useCallback((data: z.infer<typeof detailsFormSchema>) => {
		setFormData(prev => ({ ...prev, ...data }));
		setCurrentStep('payment');
	}, []);

	const handlePaymentSubmit = useCallback((data: z.infer<typeof paymentFormSchema>) => {
		setFormData(prev => ({ ...prev, ...data }));
		setCurrentStep('review');
	}, []);

	const handleReviewSubmit = useCallback(
		(data: z.infer<typeof reviewFormSchema>) => {
			setFormData(prev => ({ ...prev, ...data }));

			// Final submission - create the invoice
			const { subtotal, total } = calculateTotals();
			const processedData = {
				clientId: formData.clientId,
				invoiceNumber: formData.invoiceNumber || getNextInvoiceNumber(),
				poNumber: formData.poNumber || undefined,
				lineItems: formData.lineItems.map(item => ({
					description: item.description,
					quantity: item.quantity,
					rate: Math.round(item.unitPrice),
					amount: Math.round(item.quantity * item.unitPrice),
				})),
				subtotal,
				total,
				tax: formData.hasTax ? Math.round((subtotal * formData.taxPercentage) / 100) : 0, // Store as percentage * 100
				invoiceDate: formData.invoiceDate,
				dueDate: formData.dueDate,
				payerMemo: formData.payerMemo || undefined,
			};

			createInvoice({ handle, ...processedData });
		},
		[formData, calculateTotals, getNextInvoiceNumber, createInvoice, handle],
	);

	// Navigation handlers
	const handleNext = () => {
		// Each form will handle its own validation on submit
		switch (currentStep) {
			case 'client':
				// Client selection doesn't need validation
				if (formData.clientId) {
					setCurrentStep('details');
				}
				break;
			case 'details':
				void detailsForm.handleSubmit(handleDetailsSubmit)();
				break;
			case 'payment':
				void paymentForm.handleSubmit(handlePaymentSubmit)();
				break;
			case 'review':
				// Review step is handled by the buttons themselves
				break;
		}
	};

	const handleBack = () => {
		const stepIndex = STEPS.indexOf(currentStep);
		if (stepIndex > 0) {
			setCurrentStep(STEPS[stepIndex - 1] ?? 'client');
		}
	};

	const selectedClientData = clientsData?.clients.find(c => c.id === formData.clientId);

	const renderStepContent = () => {
		switch (currentStep) {
			case 'client':
				return (
					<Card>
						<div className='p-6'>
							<h2 className='mb-6 text-2xl font-bold'>Create invoice for</h2>
							<div className='space-y-4'>
								<div>
									<Label htmlFor='client-select'>Name</Label>
									<Select value={formData.clientId} onValueChange={handleClientSelect}>
										<SelectTrigger id='client-select' className='mt-1.5'>
											<SelectValue placeholder='Select a client' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem
												value='new-client'
												className='font-medium text-blue-500'
											>
												<div className='flex items-center'>
													<Icon.plus className='mr-2 h-4 w-4' />
													Add new client
												</div>
											</SelectItem>
											{clientsData?.clients.length ?
												<>
													<Separator className='my-2' />
													<div className='px-2 py-1.5 text-xs font-semibold text-gray-500'>
														Clients
													</div>
												</>
											:	null}
											{clientsData?.clients.map(client => (
												<SelectItem key={client.id} value={client.id}>
													<div className='flex flex-col items-start'>
														<span className='font-medium'>{client.name}</span>
														<span className='text-xs text-gray-500'>{client.email}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</Card>
				);

			case 'details':
				return (
					<Form form={detailsForm} onSubmit={handleDetailsSubmit}>
						<Card>
							<div className='p-6'>
								<h2 className='mb-2 text-2xl font-bold'>Invoice details</h2>
								<div className='mb-6 text-sm text-muted-foreground'>
									Creating invoice for
									<div className='mt-3 flex items-center gap-3 rounded-lg bg-muted/60 p-3'>
										<div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700'>
											{selectedClientData?.name
												.split(' ')
												.map(n => n[0])
												.join('')
												.toUpperCase()}
										</div>
										<div className='flex-1'>
											<div className='font-medium'>{selectedClientData?.name}</div>
											<div className='text-xs text-muted-foreground/80'>
												{selectedClientData?.email}
											</div>
										</div>
										<Button
											type='button'
											look='link'
											size='sm'
											onClick={() => setCurrentStep('client')}
											className='text-primary/60'
										>
											Edit
										</Button>
									</div>
								</div>

								<Separator className='my-6' />

								<div className='space-y-6'>
									<h3 className='text-lg font-semibold'>Invoice details</h3>
									<div className='grid gap-4 md:grid-cols-2'>
										<TextField
											control={detailsForm.control}
											name='invoiceNumber'
											label='Invoice number'
											placeholder='INV-54'
										/>
										<TextField
											control={detailsForm.control}
											name='poNumber'
											label='PO number (Optional)'
											placeholder='Optional'
											infoTooltip='Purchase order number from your client'
										/>
									</div>

									<div className='space-y-4'>
										<div className='flex items-center gap-4'>
											<div className='grid flex-1 grid-cols-12 gap-4 text-sm font-medium text-gray-600'>
												<div className='col-span-5'>Item</div>
												<div className='col-span-3'>Quantity</div>
												<div className='col-span-4'>Unit price</div>
											</div>
											<div className='w-8'></div>
										</div>

										{fields.map((field, index) => (
											<div key={field.id} className='flex items-center gap-4'>
												<div className='grid flex-1 grid-cols-12 gap-4'>
													<div className='col-span-5'>
														<TextField
															control={detailsForm.control}
															name={`lineItems.${index}.description`}
															placeholder='Line item'
														/>
													</div>
													<div className='col-span-3'>
														<NumberField
															control={detailsForm.control}
															name={`lineItems.${index}.quantity`}
															placeholder='1'
															min={1}
														/>
													</div>
													<div className='col-span-4'>
														<CurrencyField
															control={detailsForm.control}
															name={`lineItems.${index}.unitPrice`}
															placeholder='0.00'
															outputUnit='minor'
															currency={currency}
														/>
													</div>
												</div>
												<div className='flex w-8 justify-center'>
													{fields.length > 1 && (
														<Button
															type='button'
															look='ghost'
															variant='icon'
															size='sm'
															onClick={() => removeLineItem(index)}
														>
															<Icon.x className='h-4 w-4' />
														</Button>
													)}
												</div>
											</div>
										))}

										{detailsForm.watch('hasTax') && (
											<div className='flex items-center gap-4'>
												<div className='grid flex-1 grid-cols-12 gap-4'>
													<div className='col-span-5'>
														<Input
															value='Sales tax (%)'
															disabled
															className='bg-muted/60'
														/>
													</div>
													<div className='col-span-3'></div>
													<div className='col-span-4'>
														<div className='relative'>
															<NumberField
																control={detailsForm.control}
																name='taxPercentage'
																min={0}
																max={100}
																placeholder='0'
																className='pr-7'
															/>
															<span className='absolute right-3 top-3 text-gray-500'>
																%
															</span>
														</div>
													</div>
												</div>
												<div className='flex w-8 justify-center'>
													<Button
														type='button'
														look='ghost'
														variant='icon'
														size='sm'
														onClick={() => {
															detailsForm.setValue('hasTax', false);
															detailsForm.setValue('taxPercentage', 0);
														}}
													>
														<Icon.x className='h-4 w-4' />
													</Button>
												</div>
											</div>
										)}
									</div>

									<div className='flex gap-4'>
										<Button look='secondary' onClick={addLineItem} startIcon='plus'>
											Add Line Item
										</Button>
										{!detailsForm.watch('hasTax') && (
											<Button
												startIcon='plus'
												look='ghost'
												onClick={() => {
													detailsForm.setValue('hasTax', true);
												}}
											>
												Add Sales Tax
											</Button>
										)}
									</div>

									<div className='rounded-lg bg-muted/60 p-4'>
										<div className='flex items-center justify-between text-lg font-semibold'>
											<span>Total</span>
											<span>{formatMinorToMajorCurrency(total, currency)}</span>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</Form>
				);

			case 'payment':
				return (
					<Form form={paymentForm} onSubmit={handlePaymentSubmit}>
						<Card>
							<div className='p-6'>
								<h2 className='mb-6 text-2xl font-bold'>Payment details</h2>
								<div className='space-y-6'>
									<div className='grid gap-4 md:grid-cols-2'>
										<DatetimeField
											control={paymentForm.control}
											name='invoiceDate'
											label='Invoice date'
											granularity='day'
										/>
										<DatetimeField
											control={paymentForm.control}
											name='dueDate'
											label='Due date'
											granularity='day'
										/>
									</div>

									<div className='flex items-center justify-between rounded-lg border p-4'>
										<Label htmlFor='repeat-invoice' className='cursor-pointer'>
											Repeat this invoice
										</Label>
										<Switch id='repeat-invoice' disabled />
									</div>

									<TextAreaField
										control={paymentForm.control}
										name='payerMemo'
										label='Payer memo (optional)'
										placeholder='Add a note for the payer...'
										rows={4}
									/>
								</div>
							</div>
						</Card>
					</Form>
				);

			case 'review':
				return (
					<Form form={reviewForm} onSubmit={handleReviewSubmit}>
						<Card>
							<div className='p-6'>
								<h2 className='mb-6 text-2xl font-bold'>Review and send</h2>

								<div className='space-y-6'>
									<div>
										<Text className='mb-2 text-sm font-medium text-gray-500'>
											Invoice details
										</Text>
										<div className='rounded-lg bg-muted/60 p-4'>
											<div className='mb-3 flex items-start justify-between'>
												<div>
													<div className='font-medium'>
														Invoice to {selectedClientData?.name}
													</div>
													<div className='mt-3 text-3xl font-bold'>
														{formatMinorToMajorCurrency(total, currency)}
													</div>
												</div>
												<div className='flex items-center gap-2 text-sm text-gray-600'>
													<Icon.calendar className='h-4 w-4' />
													Due on {format(paymentForm.watch('dueDate'), 'MMM d, yyyy')}
												</div>
											</div>
										</div>
									</div>

									<div>
										<Text className='mb-2 text-sm font-medium text-gray-500'>
											Share your invoice
										</Text>
										<div className='space-y-4'>
											<div>
												<Label htmlFor='email-to'>Email to</Label>
												<Input
													id='email-to'
													type='email'
													className='mt-1.5'
													value={selectedClientData?.email}
													disabled
												/>
											</div>
											<TextField
												control={reviewForm.control}
												name='ccEmail'
												label='CC'
												type='email'
												placeholder='Optional'
											/>

											<div className='flex items-center justify-between rounded-lg border p-4'>
												<div>
													<Label htmlFor='schedule-send' className='cursor-pointer'>
														Schedule send
													</Label>
													<Text className='text-sm text-gray-500'>
														Set this invoice to be sent at a later date.
													</Text>
												</div>
												<Switch id='schedule-send' disabled />
											</div>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</Form>
				);
		}
	};

	// Refetch clients when modal closes
	const handleClientModalClose = useCallback(async () => {
		await refetchClients();
		void setShowCreateModal(false);
	}, [refetchClients, setShowCreateModal]);

	return (
		<>
			<div className='grid gap-8 lg:grid-cols-2'>
				{/* Form Section */}
				<div className='mx-auto w-full max-w-2xl lg:max-w-none'>
					{renderStepContent()}

					{currentStep !== 'client' && (
						<div className='mt-6 flex justify-between'>
							<Button type='button' look='outline' onClick={handleBack}>
								<Icon.chevronLeft className='mr-2 h-4 w-4' />
								Back
							</Button>

							{currentStep === 'review' ?
								<div className='flex gap-3'>
									<Button
										type='button'
										look='outline'
										onClick={() => {
											reviewForm.setValue('sendEmail', false);
											void reviewForm.handleSubmit(handleReviewSubmit)();
										}}
										loading={isCreating && !reviewForm.watch('sendEmail')}
									>
										Create Only
									</Button>
									<Button
										type='button'
										onClick={() => {
											reviewForm.setValue('sendEmail', true);
											void reviewForm.handleSubmit(handleReviewSubmit)();
										}}
										loading={isCreating && reviewForm.watch('sendEmail')}
									>
										Create & Send Email
										<Icon.chevronRight className='ml-2 h-4 w-4' />
									</Button>
								</div>
							:	<Button type='button' onClick={handleNext}>
									{currentStep === 'payment' ? 'Review' : 'Next'}
									<Icon.chevronRight className='ml-2 h-4 w-4' />
								</Button>
							}
						</div>
					)}
				</div>

				{/* Preview Section */}
				<div className='hidden lg:block'>
					<div className='sticky top-4'>
						<InvoicePreview
							formData={formData}
							client={selectedClientData}
							workspace={{
								name: workspace.name,
								handle: handle,
								currency: currency,
							}}
						/>
					</div>
				</div>
			</div>

			{showCreateModal && (
				<CreateOrUpdateClientModal mode='create' onClose={handleClientModalClose} />
			)}
		</>
	);
}
