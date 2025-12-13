import type { PlanType, WorkspaceTimezone } from '@barely/const';
import type { BrandKit } from '@barely/db/sql';

/**
 * SessionWorkspace represents a workspace with all the data needed for session context.
 * This type is used throughout the application for workspace data in the user context.
 *
 * Previously this was inferred from the customSession plugin. Now it's explicitly defined
 * to support lazy-loading workspace data.
 */
export interface SessionWorkspace {
	id: string;
	name: string;
	handle: string;
	plan: PlanType;
	type: 'personal' | 'creator' | 'solo_artist' | 'band' | 'product';
	timezone: WorkspaceTimezone;
	spotifyArtistId: string | null;

	// Stripe customer
	stripeCustomerId: string | null;
	stripeCustomerId_devMode: string | null;

	// Stripe Connect
	stripeConnectAccountId: string | null;
	stripeConnectAccountId_devMode: string | null;
	stripeConnectChargesEnabled: boolean;
	stripeConnectChargesEnabled_devMode: boolean;

	// Currency
	currency: 'usd' | 'gbp';

	// Shipping address
	shippingAddressLine1: string | null;
	shippingAddressLine2: string | null;
	shippingAddressCity: string | null;
	shippingAddressState: string | null;
	shippingAddressPostalCode: string | null;
	shippingAddressCountry: string | null;
	shippingAddressPhone: string | null;

	// Related data
	brandKit: BrandKit | null;
	avatarImageS3Key: string | undefined;
	headerImageS3Key: string | undefined;

	// User's role in this workspace
	role: 'owner' | 'admin' | 'member';
}

/**
 * Workspace invite from the database
 */
export interface SessionWorkspaceInvite {
	id: string;
	email: string;
	workspaceId: string;
	role: 'owner' | 'admin' | 'member';
	expiresAt: Date;
	createdAt: Date;
}
