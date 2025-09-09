# Stripe Connect Embedded Components Enhancement Documentation

## Executive Summary

This document outlines the technical implementation plan for expanding barely.ai's Stripe Connect integration with embedded components for **Account Management**, **Payments**, and **Payouts**. Building on the successful embedded onboarding implementation, these enhancements will provide users with a comprehensive financial management experience entirely within barely.ai.

### Business Impact

- **Unified Experience**: Complete financial management within barely.ai ecosystem
- **Reduced Context Switching**: No external redirects to Stripe dashboard
- **Enhanced Control**: Custom workflows, branding, and user experience
- **Improved Analytics**: Complete visibility into user financial interactions
- **Revenue Opportunities**: Foundation for premium financial features

### Timeline

- **Account Management**: 2-3 weeks
- **Payments Component**: 3-4 weeks
- **Payouts Component**: 2-3 weeks
- **Integration & Polish**: 2-3 weeks
- **Total**: ~12-15 weeks

---

## Current Infrastructure Analysis

### ✅ Existing Foundation

**Embedded Components Infrastructure:**

```typescript
// Already implemented
apps / app / src / components / stripe - connect - provider.tsx;
apps / app / src / components / stripe - onboarding.tsx;
packages / lib / src / trpc / routes / stripe - connect.route.ts;
```

**Payment Infrastructure:**

```typescript
// Payment intents and checkout
packages / lib / src / functions / invoice - payment.fns.ts;
apps / invoice / src / app / pay / [handle] / [invoiceId] / _components / embedded -
	payment -
	form.tsx;
```

**Database Schema:**

```sql
-- Workspace tracking fields
stripeConnectAccountId / stripeConnectAccountId_devMode
stripeConnectChargesEnabled / stripeConnectChargesEnabled_devMode
stripeConnectDetailsSubmitted / stripeConnectDetailsSubmitted_devMode
stripeConnectPayoutsEnabled / stripeConnectPayoutsEnabled_devMode
stripeConnectLastStatusCheck
```

**Dependencies:**

```json
"@stripe/connect-js": "^3.3.28",
"@stripe/react-connect-js": "^3.3.26"
```

---

## Technical Architecture

### Component Architecture Pattern

All embedded components follow this established pattern:

```typescript
interface EmbeddedComponentPattern {
	// 1. Account Session Creation (Backend)
	tRPCRoute: 'createAccountSession' | 'createPaymentsSession' | 'createPayoutsSession';

	// 2. Provider Component (Frontend)
	provider: 'StripeConnectProvider';

	// 3. Specific Component (Frontend)
	component:
		| 'StripeOnboarding'
		| 'StripeAccountManagement'
		| 'StripePayments'
		| 'StripePayouts';

	// 4. Integration Layer
	pages: string[];
	fallbacks: 'traditional redirect' | 'error boundaries';
}
```

### Security Model

- Account sessions are workspace-scoped and user-validated
- 24-hour session expiration with automatic renewal
- Proper permission checks for financial data access
- Audit logging for all financial interactions

---

## Account Management Component

### Technical Specifications

#### Backend Implementation

**New tRPC Route:**

```typescript
// packages/lib/src/trpc/routes/stripe-connect.route.ts

createAccountManagementSession: workspaceProcedure.mutation(async ({ ctx }) => {
	const workspace = await getWorkspaceWithStripeAccount(ctx.workspace.id);

	const accountSession = await stripe.accountSessions.create({
		account: stripeConnectAccountId,
		components: {
			account_management: {
				enabled: true,
				features: {
					external_account_collection: true,
					// Additional account management features
				},
			},
		},
	});

	return {
		client_secret: accountSession.client_secret,
		account_id: stripeConnectAccountId,
	};
});
```

#### Frontend Components

**New Component: `StripeAccountManagement.tsx`**

```typescript
'use client';

import { ConnectAccountManagement } from '@stripe/react-connect-js';
import { Card, H, Text } from '@barely/ui';

interface StripeAccountManagementProps {
  onAccountUpdate?: (account: any) => void;
  onError?: (error: string) => void;
}

export function StripeAccountManagement({
  onAccountUpdate,
  onError
}: StripeAccountManagementProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <H size="4" className="mb-2">Account Settings</H>
        <Text variant="sm/normal" >
          Manage your business information and account details
        </Text>
      </div>

      <div className="stripe-account-management-container">
        <ConnectAccountManagement
          onLoadError={(error) => onError?.(error.message)}
          // Additional event handlers
        />
      </div>
    </Card>
  );
}
```

#### Integration Points

**Enhanced Settings Page:**

```typescript
// apps/app/src/app/[handle]/settings/payouts/page.tsx

// Add account management section
{!needsOnboarding && (
  <StripeConnectProvider clientSecret={accountManagementSession?.client_secret}>
    <StripeAccountManagement
      onAccountUpdate={handleAccountUpdate}
      onError={handleError}
    />
  </StripeConnectProvider>
)}
```

**Navigation Integration:**

- Account health indicator in workspace navigation
- Quick access to account management from financial pages
- Status badges for account verification levels

---

## Payments Component

### Technical Specifications

#### Backend Implementation

**New tRPC Route:**

```typescript
// packages/lib/src/trpc/routes/stripe-connect.route.ts

createPaymentsSession: workspaceProcedure.mutation(async ({ ctx }) => {
	const workspace = await getWorkspaceWithStripeAccount(ctx.workspace.id);

	const accountSession = await stripe.accountSessions.create({
		account: stripeConnectAccountId,
		components: {
			payments: {
				enabled: true,
				features: {
					refund_management: true,
					dispute_management: true,
					capture_payments: true,
				},
			},
		},
	});

	return {
		client_secret: accountSession.client_secret,
		account_id: stripeConnectAccountId,
	};
});
```

#### Frontend Components

**New Component: `StripePayments.tsx`**

```typescript
'use client';

import { ConnectPayments } from '@stripe/react-connect-js';
import { Card, H, Text, Button } from '@barely/ui';

interface StripePaymentsProps {
  onPaymentAction?: (action: string, paymentId: string) => void;
  onError?: (error: string) => void;
}

export function StripePayments({ onPaymentAction, onError }: StripePaymentsProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <H size="4" className="mb-2">Payment Management</H>
          <Text variant="sm/normal" >
            View, refund, and manage all your payments
          </Text>
        </div>

        <div className="stripe-payments-container">
          <ConnectPayments
            onPaymentSelect={(payment) => onPaymentAction?.('select', payment.id)}
            onRefund={(refund) => onPaymentAction?.('refund', refund.payment)}
            onLoadError={(error) => onError?.(error.message)}
          />
        </div>
      </Card>

      {/* Additional payment analytics/summary cards */}
      <PaymentSummaryCards />
    </div>
  );
}
```

#### New Pages and Routes

**Main Payments Dashboard:**

```typescript
// apps/app/src/app/[handle]/payments/page.tsx

export default function PaymentsPage() {
  const [paymentsSession, setPaymentsSession] = useState(null);

  return (
    <>
      <DashContentHeader
        title="Payments"
        subtitle="Manage all your payment transactions"
      />
      <DashContent>
        {paymentsSession ? (
          <StripeConnectProvider clientSecret={paymentsSession.client_secret}>
            <StripePayments
              onPaymentAction={handlePaymentAction}
              onError={handleError}
            />
          </StripeConnectProvider>
        ) : (
          <PaymentsLoadingSkeleton />
        )}
      </DashContent>
    </>
  );
}
```

**Individual Payment Details:**

```typescript
// apps/app/src/app/[handle]/payments/[paymentId]/page.tsx

export default function PaymentDetailsPage({
	params,
}: {
	params: { paymentId: string };
}) {
	// Detailed payment view with embedded Stripe components
	// Refund capabilities, dispute management, etc.
}
```

#### Integration with Existing Payments

**Enhanced Invoice Payment Flow:**

```typescript
// Link existing invoice payments to new payments dashboard
// Show payment status and actions within embedded components
// Maintain backward compatibility with existing payment flows
```

---

## Payouts Component

### Technical Specifications

#### Backend Implementation

**New tRPC Route:**

```typescript
// packages/lib/src/trpc/routes/stripe-connect.route.ts

createPayoutsSession: workspaceProcedure.mutation(async ({ ctx }) => {
	const workspace = await getWorkspaceWithStripeAccount(ctx.workspace.id);

	const accountSession = await stripe.accountSessions.create({
		account: stripeConnectAccountId,
		components: {
			payouts: {
				enabled: true,
				features: {
					instant_payouts: true,
					standard_payouts: true,
					edit_payout_schedule: true,
				},
			},
		},
	});

	return {
		client_secret: accountSession.client_secret,
		account_id: stripeConnectAccountId,
	};
});
```

#### Frontend Components

**New Component: `StripePayouts.tsx`**

```typescript
'use client';

import { ConnectPayouts } from '@stripe/react-connect-js';
import { Card, H, Text } from '@barely/ui';

interface StripePayoutsProps {
  onPayoutAction?: (action: string, payoutId: string) => void;
  onBalanceUpdate?: (balance: any) => void;
  onError?: (error: string) => void;
}

export function StripePayouts({
  onPayoutAction,
  onBalanceUpdate,
  onError
}: StripePayoutsProps) {
  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card className="p-6">
        <H size="4" className="mb-4">Account Balance</H>
        <div className="stripe-balance-container">
          {/* Balance component will be embedded here */}
        </div>
      </Card>

      {/* Payouts Management */}
      <Card className="p-6">
        <div className="mb-6">
          <H size="4" className="mb-2">Payouts</H>
          <Text variant="sm/normal">
            Manage your payout schedule and destinations
          </Text>
        </div>

        <div className="stripe-payouts-container">
          <ConnectPayouts
            onPayoutCreate={(payout) => onPayoutAction?.('create', payout.id)}
            onPayoutScheduleChange={() => onPayoutAction?.('schedule_change', '')}
            onLoadError={(error) => onError?.(error.message)}
          />
        </div>
      </Card>
    </div>
  );
}
```

#### Enhanced Settings Integration

**Updated Payouts Settings Page:**

```typescript
// apps/app/src/app/[handle]/settings/payouts/page.tsx

// Add embedded payouts management after successful onboarding
{!needsOnboarding && payoutsSession && (
  <StripeConnectProvider clientSecret={payoutsSession.client_secret}>
    <StripePayouts
      onPayoutAction={handlePayoutAction}
      onBalanceUpdate={handleBalanceUpdate}
      onError={handleError}
    />
  </StripeConnectProvider>
)}
```

---

## Implementation Guidelines

### Code Patterns and Conventions

#### Consistent Component Structure

```typescript
interface EmbeddedStripeComponentProps {
	onSuccess?: (data: any) => void;
	onError?: (error: string) => void;
	onAction?: (action: string, data: any) => void;
}

// Always include loading states
// Always include error boundaries
// Always include fallback mechanisms
```

#### Session Management Pattern

```typescript
// Reusable hook for account session management
export function useAccountSession(
	componentType: 'onboarding' | 'management' | 'payments' | 'payouts',
) {
	const [session, setSession] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	// Session creation logic
	// Automatic refresh handling
	// Error recovery
}
```

#### Error Handling Strategy

```typescript
// Standardized error handling across all components
class StripeEmbeddedError extends Error {
	constructor(
		public component: string,
		public action: string,
		public originalError: any,
	) {
		super(`Stripe ${component} error during ${action}: ${originalError.message}`);
	}
}

// Automatic fallback to Stripe dashboard
// User-friendly error messages
// Error reporting to monitoring systems
```

### Security Considerations

#### Session Validation

```typescript
// Validate account sessions are workspace-specific
export async function validateAccountSession(sessionId: string, workspaceId: string) {
	// Check session belongs to workspace
	// Verify user permissions
	// Log access attempts
}
```

#### Permission Checks

```typescript
// Financial data access controls
export function requireFinancialAccess(user: User, workspace: Workspace) {
	// Check user role in workspace
	// Verify Stripe Connect account ownership
	// Audit financial access
}
```

### Testing Approaches

#### Component Testing

```typescript
// Test each embedded component in isolation
describe('StripeAccountManagement', () => {
	it('should render account management interface');
	it('should handle account updates');
	it('should gracefully handle errors');
	it('should fallback to external dashboard on failure');
});
```

#### Integration Testing

```typescript
// Test complete financial workflows
describe('Financial Management Flow', () => {
	it('should complete onboarding -> management -> payments -> payouts flow');
	it('should handle session expiration and renewal');
	it('should maintain data consistency across components');
});
```

#### End-to-End Testing

```typescript
// Test real Stripe Connect integration
describe('Stripe Connect E2E', () => {
	beforeEach(() => setupStripeTestAccount());

	it('should complete full financial management workflow');
	it('should handle real payment processing');
	it('should manage actual payout operations');
});
```

---

## Migration Strategy

### Phased Rollout Plan

#### Phase 1: Account Management (2-3 weeks)

1. **Week 1**: Backend implementation and testing
2. **Week 2**: Frontend components and integration
3. **Week 3**: User testing and refinement

#### Phase 2: Payments Component (3-4 weeks)

1. **Week 1-2**: Backend implementation and payments integration
2. **Week 3**: Frontend dashboard and payment management
3. **Week 4**: Testing and invoice payment integration

#### Phase 3: Payouts Component (2-3 weeks)

1. **Week 1**: Backend implementation and balance management
2. **Week 2**: Frontend components and settings integration
3. **Week 3**: Testing and user experience polish

#### Phase 4: Integration & Optimization (2-3 weeks)

1. **Week 1**: Unified financial dashboard
2. **Week 2**: Performance optimization and analytics
3. **Week 3**: Documentation and team training

### Backward Compatibility

**Graceful Degradation:**

- All embedded components include fallbacks to external Stripe dashboard
- Existing payment flows continue to work during migration
- Progressive enhancement approach for new features

**Feature Flags:**

```typescript
// Control rollout with feature flags
const useEmbeddedPayments = useFeatureFlag('embedded-stripe-payments');
const useEmbeddedPayouts = useFeatureFlag('embedded-stripe-payouts');
```

### Risk Mitigation

**Technical Risks:**

- Component loading failures → Automatic fallback to Stripe dashboard
- Session expiration → Transparent renewal or graceful degradation
- API changes → Versioned implementations with migration paths

**User Experience Risks:**

- Learning curve → Progressive disclosure and helpful tooltips
- Feature parity → Comprehensive testing against Stripe dashboard
- Performance impact → Lazy loading and optimized session management

**Business Risks:**

- Development timeline → Phased rollout with MVP approach
- User adoption → A/B testing and gradual feature enablement
- Support overhead → Comprehensive documentation and error handling

---

## Success Metrics

### Technical Metrics

- Component load times < 2 seconds
- Session failure rate < 1%
- Fallback usage rate < 5%
- Error recovery rate > 95%

### User Experience Metrics

- Time spent in financial management: +50%
- Context switching to external tools: -80%
- User satisfaction with financial tools: +30%
- Support tickets related to payments: -40%

### Business Metrics

- User engagement with financial features: +60%
- Payment completion rates: +15%
- Payout management adoption: +100%
- Revenue from premium financial features: Baseline establishment

---

## Conclusion

This comprehensive enhancement to Stripe Connect embedded components will position barely.ai as a complete financial management platform for creators. The phased implementation approach minimizes risk while delivering incremental value, and the robust technical architecture ensures scalability and maintainability.

The investment in embedded financial components will pay dividends through increased user engagement, reduced support overhead, and new revenue opportunities through premium financial features.
