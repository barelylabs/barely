Overview

This document provides a complete guide to implement improvements to the
invoice payment system, including dynamic button text, payment type
selection for optional recurring invoices, and optimized payment intent
initialization.

File to Modify

apps/invoice/src/app/pay/[handle]/[invoiceId]/\_components/invoice-payment
-form.tsx

Changes Required

1. Update Imports Section

Find this block (around lines 1-15):
'use client';

import type { z } from 'zod/v4';
import { useCallback, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from '@tanstack/react-query';

import type { selectInvoiceSchema } from
'@barely/validators/schemas/invoice.schema';

import { useInvoiceRenderTRPC } from
'@barely/api/public/invoice-render.trpc.react';

import { Button } from '@barely/ui/button';
import { Modal } from '@barely/ui/modal';
import { H, Text } from '@barely/ui/typography';

import { CheckoutForm } from './checkout-form';

Replace with:
'use client';

import type { z } from 'zod/v4';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from '@tanstack/react-query';

import type { selectInvoiceSchema } from
'@barely/validators/schemas/invoice.schema';

import { useInvoiceRenderTRPC } from
'@barely/api/public/invoice-render.trpc.react';

import { Button } from '@barely/ui/button';
import { Modal } from '@barely/ui/modal';
import { Switch } from '@barely/ui/switch';
import { H, Text } from '@barely/ui/typography';
import { cn } from '@barely/utils/cn';
import { formatCurrency } from '@barely/utils/currency';

import { CheckoutForm } from './checkout-form';

2. Update State Variables

Find this block (around lines 35-40):
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [clientSecret, setClientSecret] = useState<string | null>(null);
const [isRecurring, setIsRecurring] = useState(
invoice.type === 'recurring' || invoice.type === 'recurringOptional',
);

Replace with:
const [showOneTimeModal, setShowOneTimeModal] = useState(false);
const [showRecurringModal, setShowRecurringModal] = useState(false);
const [paymentIntentClientSecret, setPaymentIntentClientSecret] =
useState<string | null>(null);
const [setupIntentClientSecret, setSetupIntentClientSecret] =
useState<string | null>(null);
const [isRecurring, setIsRecurring] = useState(
invoice.type === 'recurring',
);
const [isInitializing, setIsInitializing] = useState(true);
const initializedRef = useRef(false);

3. Update Mutation and Add useEffect for Pre-initialization

Find this block (around lines 42-54):
const { mutate: initializePayment, isPending } = useMutation(
trpc.initializePayment.mutationOptions({
onSuccess: data => {
setClientSecret(data.clientSecret);
setShowPaymentModal(true);
},
onError: error => {
console.error('Failed to initialize payment:', error);
alert('Failed to initialize payment. Please try again.');
},
}),
);

Replace with:
const { mutate: initializePayment } = useMutation(
trpc.initializePayment.mutationOptions({
onError: error => {
console.error('Failed to initialize payment:', error);
},
}),
);

        // Pre-initialize payment intents on mount
        useEffect(() => {
                // Guard against multiple initializations (especially in StrictMode)
                if (initializedRef.current) {
                        return;
                }

                const initializePayments = async () => {
                        try {
                                if (invoice.type === 'oneTime') {
                                        // Initialize only payment intent
                                        initializePayment(
                                                {
                                                        invoiceId: invoice.id,
                                                        isRecurring: false,
                                                },
                                                {
                                                        onSuccess: data => {
                                                                setPaymentIntentClientSecret(data.clientSecret);
                                                                setIsInitializing(false);
                                                                initializedRef.current = true;
                                                        },
                                                },
                                        );
                                } else if (invoice.type === 'recurring') {
                                        // Initialize only setup intent
                                        initializePayment(
                                                {
                                                        invoiceId: invoice.id,
                                                        isRecurring: true,
                                                },
                                                {
                                                        onSuccess: data => {
                                                                setSetupIntentClientSecret(data.clientSecret);
                                                                setIsInitializing(false);
                                                                initializedRef.current = true;
                                                        },
                                                },
                                        );
                                } else if (invoice.type === 'recurringOptional') {
                                        // Initialize both in parallel
                                        let completedCount = 0;
                                        const checkComplete = () => {
                                                completedCount++;
                                                if (completedCount === 2) {
                                                        setIsInitializing(false);
                                                        initializedRef.current = true;
                                                }
                                        };

                                        // Initialize one-time payment
                                        initializePayment(
                                                {
                                                        invoiceId: invoice.id,
                                                        isRecurring: false,
                                                },
                                                {
                                                        onSuccess: data => {
                                                                setPaymentIntentClientSecret(data.clientSecret);
                                                                checkComplete();
                                                        },
                                                },
                                        );

                                        // Initialize recurring payment
                                        initializePayment(
                                                {
                                                        invoiceId: invoice.id,
                                                        isRecurring: true,
                                                },
                                                {
                                                        onSuccess: data => {
                                                                setSetupIntentClientSecret(data.clientSecret);
                                                                checkComplete();
                                                        },
                                                },
                                        );
                                }
                        } catch (error) {
                                console.error('Failed to initialize payment:', error);
                                setIsInitializing(false);
                                // Don't set initializedRef.current = true on error
                        }
                };

                initializePayments();
        }, [invoice.id, invoice.type, initializePayment]);

4. Replace handlePayment Function and Add Helper Functions

Find this block (around lines 139-149):
const handlePayment = useCallback(() => {
initializePayment({
invoiceId: invoice.id,
isRecurring:
invoice.type === 'recurring' ||
(invoice.type === 'recurringOptional' && isRecurring),
});
}, [invoice.id, invoice.type, isRecurring, initializePayment]);

Replace with:
const handlePayment = useCallback(() => {
if (invoice.type === 'oneTime') {
setShowOneTimeModal(true);
} else if (invoice.type === 'recurring') {
setShowRecurringModal(true);
} else if (invoice.type === 'recurringOptional') {
if (isRecurring) {
setShowRecurringModal(true);
} else {
setShowOneTimeModal(true);
}
}
}, [invoice.type, isRecurring]);

        const getButtonText = () => {
                if (invoice.type === 'oneTime') {
                        return 'Pay Now';
                } else if (invoice.type === 'recurring') {
                        return 'Set up Auto-Pay';
                } else if (invoice.type === 'recurringOptional') {
                        return isRecurring ? 'Set up Auto-Pay' : 'Pay Now';
                }
                return 'Pay';
        };

        const getDisplayAmount = () => {
                if (invoice.type === 'recurringOptional' && isRecurring &&

invoice.recurringDiscountPercent) {
const discountedAmount = invoice.amount \* (1 -
invoice.recurringDiscountPercent / 100);
return discountedAmount;
}
return invoice.amount;
};

5. Add Payment Type Toggle UI

Find the start of the return statement (around line 151):
return (
<div className='w-full max-w-md'>
<div className='rounded-lg border border-gray-200 bg-white p-6
  shadow-sm'>
<div className='mb-6'>
<H size='4' className='mb-2'>
Payment Details
</H>
<Text className='text-gray-600'>Complete your payment securely</Text>
</div>

Insert the following right after the closing </div> of the Payment
Details section:
{/_ Payment Type Toggle for recurringOptional _/}
{invoice.type === 'recurringOptional' && (
<div className='mb-6 rounded-lg bg-gray-50 p-4'>
<div className='flex items-center justify-between mb-3'>
<div>
<Text className='font-medium'>Payment Method</Text>
<Text className='text-sm text-gray-600'>
Choose between one-time or auto-pay
</Text>
</div>
</div>

                                                <div className='space-y-3'>
                                                        <label className={cn(
                                                                'flex items-center justify-between p-3 rounded-md border cursor-pointer

transition-colors',
!isRecurring ? 'border-blue-500 bg-blue-50' : 'border-gray-200
hover:bg-gray-50'
)}>
<div className='flex items-center'>
<input
type='radio'
name='paymentType'
checked={!isRecurring}
onChange={() => setIsRecurring(false)}
className='mr-3'
/>
<div>
<Text className='font-medium'>One-time payment</Text>
<Text className='text-sm text-gray-600'>
Pay {formatCurrency(invoice.amount, invoice.currency)}
</Text>
</div>
</div>
</label>

                                                        <label className={cn(
                                                                'flex items-center justify-between p-3 rounded-md border cursor-pointer

transition-colors',
isRecurring ? 'border-blue-500 bg-blue-50' : 'border-gray-200
hover:bg-gray-50'
)}>
<div className='flex items-center'>
<input
type='radio'
name='paymentType'
checked={isRecurring}
onChange={() => setIsRecurring(true)}
className='mr-3'
/>
<div>
<Text className='font-medium'>Auto-pay {invoice.recurringInterval}</Text>
{invoice.recurringDiscountPercent && invoice.recurringDiscountPercent > 0
? (
<>
<Text className='text-sm text-gray-600'>
<span className='line-through'>{formatCurrency(invoice.amount,
invoice.currency)}</span>{' '}
<span className='font-semibold text-green-600'>
{formatCurrency(getDisplayAmount(), invoice.currency)}
</span>
</Text>
<Text className='text-xs text-green-600 font-medium'>
Save {invoice.recurringDiscountPercent}%
</Text>
</>
) : (
<Text className='text-sm text-gray-600'>
{formatCurrency(invoice.amount, invoice.currency)} per
{invoice.recurringInterval}
</Text>
)}
</div>
</div>
</label>
</div>
</div>
)}

6. Update Button

Find this block (around line 170-178):
<Button
                                        onClick={handlePayment}
                                        disabled={isPending}
                                        className='w-full'
                                        size='lg'
                                >
{isPending ? 'Processing...' : 'Subscribe'}
</Button>

Replace with:
<Button
                                        onClick={handlePayment}
                                        disabled={isInitializing}
                                        className='w-full'
                                        size='lg'
                                >
{isInitializing ? 'Loading...' : getButtonText()}
</Button>

7. Replace Single Modal with Dual Modal Architecture

Find the Modal section (around lines 180-210):
{stripePromise && clientSecret && (
<Modal
                                        open={showPaymentModal}
                                        onOpenChange={setShowPaymentModal}
                                        className='sm:max-w-md'
                                >
<div className='p-6'>
<H size='3' className='mb-4'>
Complete Payment
</H>
<Elements
stripe={stripePromise}
options={{
                                                                clientSecret,
                                                                appearance: {
                                                                        theme: 'stripe',
                                                                },
                                                        }} >
<CheckoutForm
invoiceId={invoice.id}
isRecurring={
invoice.type === 'recurring' ||
(invoice.type === 'recurringOptional' && isRecurring)
}
onSuccess={() => {
setShowPaymentModal(false);
if (onPaymentSuccess) {
onPaymentSuccess();
}
}}
/>
</Elements>
</div>
</Modal>
)}

Replace with:
{/_ One-time Payment Modal _/}
{stripePromise && paymentIntentClientSecret && (
<Modal
                                        open={showOneTimeModal}
                                        onOpenChange={setShowOneTimeModal}
                                        className='sm:max-w-md'
                                >
<div className='p-6'>
<H size='3' className='mb-4'>
Complete Payment
</H>
<Text className='mb-4 text-gray-600'>
Amount: {formatCurrency(invoice.amount, invoice.currency)}
</Text>
<Elements
stripe={stripePromise}
options={{
                                                                clientSecret: paymentIntentClientSecret,
                                                                appearance: {
                                                                        theme: 'stripe',
                                                                },
                                                        }} >
<CheckoutForm
invoiceId={invoice.id}
isRecurring={false}
onSuccess={() => {
setShowOneTimeModal(false);
if (onPaymentSuccess) {
onPaymentSuccess();
}
}}
/>
</Elements>
</div>
</Modal>
)}

                        {/* Recurring Payment Modal */}
                        {stripePromise && setupIntentClientSecret && (
                                <Modal
                                        open={showRecurringModal}
                                        onOpenChange={setShowRecurringModal}
                                        className='sm:max-w-md'
                                >
                                        <div className='p-6'>
                                                <H size='3' className='mb-4'>
                                                        Set Up Auto-Pay
                                                </H>
                                                <Text className='mb-4 text-gray-600'>
                                                        {invoice.recurringDiscountPercent && invoice.recurringDiscountPercent > 0

? (
<>
Amount: <span className='line-through'>{formatCurrency(invoice.amount,
invoice.currency)}</span>{' '}
<span className='font-semibold text-green-600'>
{formatCurrency(getDisplayAmount(), invoice.currency)}
</span>
{' '}per {invoice.recurringInterval}
</>
) : (
<>Amount: {formatCurrency(invoice.amount, invoice.currency)} per
{invoice.recurringInterval}</>
)}
</Text>
<Elements
stripe={stripePromise}
options={{
                                                                clientSecret: setupIntentClientSecret,
                                                                appearance: {
                                                                        theme: 'stripe',
                                                                },
                                                        }} >
<CheckoutForm
invoiceId={invoice.id}
isRecurring={true}
onSuccess={() => {
setShowRecurringModal(false);
if (onPaymentSuccess) {
onPaymentSuccess();
}
}}
/>
</Elements>
</div>
</Modal>
)}

Testing Checklist

After implementing these changes:

1. Test oneTime invoices:


    - Button shows "Pay Now"
    - Payment intent initializes on page load
    - Modal opens instantly when button clicked
    - Payment completes successfully

2. Test recurring invoices:


    - Button shows "Set up Auto-Pay"
    - Setup intent initializes on page load
    - Modal opens instantly when button clicked
    - Subscription setup completes successfully

3. Test recurringOptional invoices:


    - Payment type toggle appears
    - Both payment and setup intents initialize on page load
    - Button text changes based on selection
    - Discount information displays correctly (if applicable)
    - Correct modal opens based on selection
    - Both payment types work correctly

4. Test edge cases:


    - React StrictMode doesn't cause double initialization
    - Closing and reopening modals doesn't re-initialize
    - Error handling works if initialization fails

Commands to Run After Changes

# Run linter

pnpm lint --filter=@barely/invoice

# Run type checking

pnpm typecheck --filter=@barely/invoice

# Start dev server to test

pnpm dev:app

Summary of Improvements

1. Dynamic Button Text: Button shows appropriate text based on invoice
   type and user selection
2. Payment Type Toggle: For optional recurring invoices, users can choose
   between one-time or auto-pay
3. Discount Display: Shows savings when choosing recurring option with
   discount
4. Pre-initialization: Payment intents initialize on page load for
   instant modal opening
5. Dual Modal Architecture: Separate modals for one-time and recurring
   payments
6. useRef Guard: Prevents double initialization in React StrictMode
7. Better UX: No waiting for payment initialization when clicking button

Notes

- The formatCurrency utility should already exist in
  @barely/utils/currency
- The cn utility should already exist in @barely/utils/cn
- The Switch component import might not be needed if using radio buttons
  instead
- Make sure the invoice schema includes recurringDiscountPercent and
  recurringInterval fields
