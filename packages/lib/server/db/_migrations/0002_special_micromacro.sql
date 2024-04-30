CREATE TABLE IF NOT EXISTS "CartFunnels" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"workspaceId" varchar(255) NOT NULL,
	"handle" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"key" varchar(255) NOT NULL,
	"archived" boolean DEFAULT false,
	"mainProductId" varchar(255) NOT NULL,
	"mainProductPayWhatYouWant" boolean DEFAULT false,
	"mainProductPayWhatYouWantMin" integer DEFAULT 0,
	"mainProductDiscount" integer DEFAULT 0,
	"mainProductHandling" integer DEFAULT 0,
	"bumpProductId" varchar(255),
	"bumpProductHeadline" varchar(255),
	"bumpProductDiscount" integer DEFAULT 0,
	"bumpProductDescription" varchar(255),
	"upsellProductId" varchar(255),
	"upsellProductDiscount" integer DEFAULT 0,
	"upsellProductHeadline" varchar(255),
	"upsellProductAboveTheFold" text,
	"upsellProductBelowTheFold" text,
	"successPageHeadline" varchar(255),
	"successPageDescription" text,
	"successPageCTA" varchar(255),
	"successPageCTALink" varchar(255),
	"count_viewLandingPage" integer DEFAULT 0,
	"count_initiateCheckout" integer DEFAULT 0,
	"count_addPaymentInfo" integer DEFAULT 0,
	"count_addBump" integer DEFAULT 0,
	"count_removeBump" integer DEFAULT 0,
	"count_purchaseMainWithoutBump" integer DEFAULT 0,
	"count_purchaseMainWithBump" integer DEFAULT 0,
	"count_viewUpsell" integer DEFAULT 0,
	"count_declineUpsell" integer DEFAULT 0,
	"count_purchaseUpsell" integer DEFAULT 0,
	"count_viewOrderConfirmation" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Carts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"workspaceId" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"funnelId" varchar(255),
	"stage" varchar(255),
	"landingPageId" varchar(255),
	"checkoutStripePaymentIntentId" varchar(255) NOT NULL,
	"checkoutStripeClientSecret" varchar(255) NOT NULL,
	"mainProductId" varchar(255) NOT NULL,
	"mainProductPrice" integer NOT NULL,
	"mainProductPayWhatYouWant" boolean DEFAULT false,
	"mainProductPayWhatYouWantPrice" integer,
	"mainProductApparelSize" varchar(25),
	"mainProductQuantity" integer NOT NULL,
	"mainProductAmount" integer NOT NULL,
	"mainShippingAmount" integer,
	"mainHandlingAmount" integer,
	"mainShippingAndHandlingAmount" integer,
	"bumpProductId" varchar(255),
	"bumpProductPrice" integer,
	"bumpShippingPrice" integer,
	"bumpHandlingPrice" integer,
	"addedBumpProduct" boolean DEFAULT false,
	"bumpProductApparelSize" varchar(25),
	"bumpProductQuantity" integer,
	"bumpProductAmount" integer,
	"bumpShippingAmount" integer,
	"bumpHandlingAmount" integer,
	"bumpShippingAndHandlingAmount" integer,
	"checkoutProductAmount" integer,
	"checkoutShippingAmount" integer,
	"checkoutHandlingAmount" integer,
	"checkoutShippingAndHandlingAmount" integer,
	"checkoutAmount" integer NOT NULL,
	"email" varchar(255),
	"fullName" varchar(255),
	"firstName" varchar(255),
	"lastName" varchar(255),
	"phone" varchar(255),
	"shippingAddressLine1" varchar(255),
	"shippingAddressLine2" varchar(255),
	"shippingAddressCity" varchar(255),
	"shippingAddressState" varchar(255),
	"shippingAddressPostalCode" varchar(255),
	"shippingAddressCountry" varchar(255),
	"marketingOptIn" boolean DEFAULT false,
	"orderId" integer,
	"fanId" varchar(255),
	"checkoutStripeChargeId" varchar(255),
	"checkoutStripePaymentMethodId" varchar(255),
	"checkoutConvertedAt" timestamp,
	"upsellProductId" varchar(255),
	"upsellProductPrice" integer,
	"upsellProductApparelSize" varchar(25),
	"upsellShippingPrice" integer,
	"upsellHandlingPrice" integer,
	"upsellProductQuantity" integer,
	"upsellProductAmount" integer,
	"upsellShippingAmount" integer,
	"upsellHandlingAmount" integer,
	"upsellShippingAndHandlingAmount" integer,
	"upsellAmount" integer,
	"upsellConvertedAt" timestamp,
	"upsellStripePaymentIntentId" varchar(255),
	"upsellStripeChargeId" varchar(255),
	"orderProductAmount" integer,
	"orderShippingAmount" integer,
	"orderHandlingAmount" integer,
	"orderShippingAndHandlingAmount" integer,
	"orderAmount" integer NOT NULL,
	"orderReceiptSent" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Fans" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"workspaceId" varchar(255) NOT NULL,
	"emailMarketingOptIn" boolean DEFAULT false NOT NULL,
	"smsMarketingOptIn" boolean DEFAULT false NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phoneNumber" varchar(255),
	"shippingAddressLine1" varchar(255),
	"shippingAddressLine2" varchar(255),
	"shippingAddressCity" varchar(255),
	"shippingAddressState" varchar(255),
	"shippingAddressCountry" varchar(255),
	"shippingAddressPostalCode" varchar(255),
	"billingAddressPostalCode" varchar(255),
	"billingAddressCountry" varchar(255),
	"stripeCustomerId" varchar(255),
	"stripePaymentMethodId" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Fans_To_PaymentMethods" (
	"fanId" varchar(255),
	"stripePaymentMethodId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FileFolders" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"workspaceId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"parentId" varchar(255),
	CONSTRAINT "FileFolders_unique_name" UNIQUE("workspaceId","parentId","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Files_To_PressKits__PressPhotos" (
	"fileId" varchar(255) NOT NULL,
	"pressKitId" varchar(255) NOT NULL,
	"lexorank" varchar(255) NOT NULL,
	CONSTRAINT "_Files_To_PressKits__PressPhotos_fileId_pressKitId_pk" PRIMARY KEY("fileId","pressKitId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Files_To_Products__Images" (
	"fileId" varchar(255) NOT NULL,
	"productId" varchar(255) NOT NULL,
	"lexorank" varchar(255) NOT NULL,
	CONSTRAINT "_Files_To_Products__Images_fileId_productId_pk" PRIMARY KEY("fileId","productId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Files_To_Tracks__Artwork" (
	"fileId" varchar(255) NOT NULL,
	"trackId" varchar(255) NOT NULL,
	"current" boolean,
	CONSTRAINT "_Files_To_Tracks__Artwork_fileId_trackId_pk" PRIMARY KEY("fileId","trackId"),
	CONSTRAINT "uniqueCurrent" UNIQUE("trackId","current")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Files_To_Tracks__Audio" (
	"fileId" varchar(255) NOT NULL,
	"trackId" varchar(255) NOT NULL,
	"masterCompressed" boolean,
	"masterWav" boolean,
	"instrumentalCompressed" boolean,
	"instrumentalWav" boolean,
	"stem" boolean,
	CONSTRAINT "_Files_To_Tracks__Audio_fileId_trackId_pk" PRIMARY KEY("fileId","trackId"),
	CONSTRAINT "uniqueMasterCompressed" UNIQUE("trackId","masterCompressed"),
	CONSTRAINT "uniqueMasterWav" UNIQUE("trackId","masterWav"),
	CONSTRAINT "uniqueInstrumentalCompressed" UNIQUE("trackId","instrumentalCompressed"),
	CONSTRAINT "uniqueInstrumentalWav" UNIQUE("trackId","instrumentalWav")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Files_To_Workspaces__Avatar" (
	"workspaceId" varchar(255) NOT NULL,
	"fileId" varchar(255) NOT NULL,
	"current" boolean NOT NULL,
	CONSTRAINT "_Files_To_Workspaces__Avatar_workspaceId_fileId_pk" PRIMARY KEY("workspaceId","fileId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Files_To_Workspaces__Header" (
	"workspaceId" varchar(255) NOT NULL,
	"fileId" varchar(255) NOT NULL,
	"current" boolean NOT NULL,
	CONSTRAINT "_Files_To_Workspaces__Header_workspaceId_fileId_pk" PRIMARY KEY("workspaceId","fileId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Mixtapes" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"workspaceId" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"archived" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Mixtapes_To_Tracks" (
	"mixtapeId" varchar(255) NOT NULL,
	"trackId" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"lexorank" varchar(255) NOT NULL,
	CONSTRAINT "_Mixtapes_To_Tracks_mixtapeId_trackId_pk" PRIMARY KEY("mixtapeId","trackId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Playlists_To_Tracks" (
	"playlistId" varchar(255) NOT NULL,
	"trackId" varchar(255) NOT NULL,
	"index" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PressKits" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"workspaceId" varchar(255) NOT NULL,
	"handle" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"showBio" boolean DEFAULT false NOT NULL,
	"overrideWorkspaceBio" boolean DEFAULT false NOT NULL,
	"bio" text,
	"showMixtape" boolean DEFAULT false NOT NULL,
	"mixtapeId" varchar(255),
	"showVideos" boolean DEFAULT false NOT NULL,
	"videos" jsonb,
	"showPressPhotos" boolean DEFAULT false NOT NULL,
	"showBooking" boolean DEFAULT false NOT NULL,
	"showPressQuotes" boolean DEFAULT false NOT NULL,
	"pressQuotes" jsonb,
	"showSocialLinks" boolean DEFAULT false NOT NULL,
	"showFacebookLink" boolean DEFAULT false NOT NULL,
	"showInstagramLink" boolean DEFAULT false NOT NULL,
	"showSpotifyLink" boolean DEFAULT false NOT NULL,
	"showTiktokLink" boolean DEFAULT false NOT NULL,
	"showXLink" boolean DEFAULT false NOT NULL,
	"showYoutubeLink" boolean DEFAULT false NOT NULL,
	"showSocialStats" boolean DEFAULT false NOT NULL,
	"showSpotifyFollowers" boolean DEFAULT false NOT NULL,
	"showSpotifyMonthlyListeners" boolean DEFAULT false NOT NULL,
	"showYoutubeSubscribers" boolean DEFAULT false NOT NULL,
	"showTiktokFollowers" boolean DEFAULT false NOT NULL,
	"showInstagramFollowers" boolean DEFAULT false NOT NULL,
	"showXFollowers" boolean DEFAULT false NOT NULL,
	"showFacebookFollowers" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ApparelSizes" (
	"productId" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"size" varchar(25) NOT NULL,
	"stock" integer,
	CONSTRAINT "ApparelSizes_productId_size_pk" PRIMARY KEY("productId","size")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Products" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"workspaceId" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"archived" boolean DEFAULT false,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"preorder" boolean DEFAULT false,
	"preorderDeliveryEstimate" date,
	"merchType" varchar(255) DEFAULT 'cd' NOT NULL,
	"stock" integer,
	"weight" integer DEFAULT 0,
	"width" integer DEFAULT 0,
	"length" integer DEFAULT 0,
	"height" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "WorkspaceInvites" (
	"email" varchar(255) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"workspaceId" varchar(255) NOT NULL,
	"role" varchar(255) DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "WorkspaceInvites_email_workspaceId_pk" PRIMARY KEY("email","workspaceId")
);
--> statement-breakpoint
ALTER TABLE "AdSetCloneRecords" DROP CONSTRAINT "AdSetCloneRecords_id_unique";--> statement-breakpoint
ALTER TABLE "AdSetUpdateRecords" DROP CONSTRAINT "AdSetUpdateRecords_id_unique";--> statement-breakpoint
ALTER TABLE "CampaignUpdateRecords" DROP CONSTRAINT "CampaignUpdateRecords_id_unique";--> statement-breakpoint
ALTER TABLE "FormResponses" DROP CONSTRAINT "FormResponses_id_unique";--> statement-breakpoint
ALTER TABLE "TransactionLineItems" DROP CONSTRAINT "TransactionLineItems_id_unique";--> statement-breakpoint
ALTER TABLE "AdSetCloneRecords" DROP CONSTRAINT "AdSetCloneRecords_workspaceId_adSetParentId_id";--> statement-breakpoint
ALTER TABLE "AdSetUpdateRecords" DROP CONSTRAINT "AdSetUpdateRecords_workspaceId_adSetId_id";--> statement-breakpoint
ALTER TABLE "AnalyticsEndpoints" DROP CONSTRAINT "AnalyticsEndpoints_platform_id";--> statement-breakpoint
ALTER TABLE "_AudienceCountries_To_AudienceGeoGroups" DROP CONSTRAINT "_AudienceCountries_To_AudienceGeoGroups_audienceCountryId_audienceGeoGroupId";--> statement-breakpoint
ALTER TABLE "_AudienceCountries_To_Audiences" DROP CONSTRAINT "_AudienceCountries_To_Audiences_audienceCountryId_audienceId";--> statement-breakpoint
ALTER TABLE "_AudienceGeoGroups_To_Audiences" DROP CONSTRAINT "_AudienceGeoGroups_To_Audiences_audienceGeoGroupId_audienceId";--> statement-breakpoint
ALTER TABLE "_BioButtons_To_Bios" DROP CONSTRAINT "_BioButtons_To_Bios_bioId_bioButtonId";--> statement-breakpoint
ALTER TABLE "CampaignUpdateRecords" DROP CONSTRAINT "CampaignUpdateRecords_campaignId_id";--> statement-breakpoint
ALTER TABLE "FormResponses" DROP CONSTRAINT "FormResponses_formId_id";--> statement-breakpoint
ALTER TABLE "_Playlists_To_Genres" DROP CONSTRAINT "_Playlists_To_Genres_playlistId_genreId";--> statement-breakpoint
ALTER TABLE "_Tracks_To_Genres" DROP CONSTRAINT "_Tracks_To_Genres_trackId_genreId";--> statement-breakpoint
ALTER TABLE "_Playlists_To_ProviderAccounts" DROP CONSTRAINT "_Playlists_To_ProviderAccounts_playlistId_providerAccountId";--> statement-breakpoint
ALTER TABLE "TransactionLineItems" DROP CONSTRAINT "TransactionLineItems_transactionId_id";--> statement-breakpoint
ALTER TABLE "_Users_To_Workspaces" DROP CONSTRAINT "_Users_To_Workspaces_workspaceId_userId";--> statement-breakpoint
ALTER TABLE "VerificationTokens" DROP CONSTRAINT "VerificationTokens_identifier_token";--> statement-breakpoint
ALTER TABLE "AdSetCloneRecords" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "AdSetUpdateRecords" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "CampaignUpdateRecords" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "Files" ALTER COLUMN "extension" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Files" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "FormResponses" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "TransactionLineItems" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "AnalyticsEndpoints" ADD CONSTRAINT "analyticsendpoints_platform_id_pk" PRIMARY KEY("platform","id");--> statement-breakpoint
ALTER TABLE "_AudienceCountries_To_AudienceGeoGroups" ADD CONSTRAINT "_AudienceCountries_To_AudienceGeoGroups_audienceCountryId_audienceGeoGroupId_pk" PRIMARY KEY("audienceCountryId","audienceGeoGroupId");--> statement-breakpoint
ALTER TABLE "_AudienceCountries_To_Audiences" ADD CONSTRAINT "_AudienceCountries_To_Audiences_audienceCountryId_audienceId_pk" PRIMARY KEY("audienceCountryId","audienceId");--> statement-breakpoint
ALTER TABLE "_AudienceGeoGroups_To_Audiences" ADD CONSTRAINT "_AudienceGeoGroups_To_Audiences_audienceGeoGroupId_audienceId_pk" PRIMARY KEY("audienceGeoGroupId","audienceId");--> statement-breakpoint
ALTER TABLE "_BioButtons_To_Bios" ADD CONSTRAINT "_BioButtons_To_Bios_bioId_bioButtonId_pk" PRIMARY KEY("bioId","bioButtonId");--> statement-breakpoint
ALTER TABLE "_Playlists_To_Genres" ADD CONSTRAINT "_Playlists_To_Genres_playlistId_genreId_pk" PRIMARY KEY("playlistId","genreId");--> statement-breakpoint
ALTER TABLE "_Tracks_To_Genres" ADD CONSTRAINT "_Tracks_To_Genres_trackId_genreId_pk" PRIMARY KEY("trackId","genreId");--> statement-breakpoint
ALTER TABLE "_Playlists_To_ProviderAccounts" ADD CONSTRAINT "_Playlists_To_ProviderAccounts_playlistId_providerAccountId_pk" PRIMARY KEY("playlistId","providerAccountId");--> statement-breakpoint
ALTER TABLE "_Users_To_Workspaces" ADD CONSTRAINT "_Users_To_Workspaces_workspaceId_userId_pk" PRIMARY KEY("workspaceId","userId");--> statement-breakpoint
ALTER TABLE "VerificationTokens" ADD CONSTRAINT "VerificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token");--> statement-breakpoint
ALTER TABLE "Files" ADD COLUMN "bucket" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "Files" ADD COLUMN "key" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "Files" ADD COLUMN "folder" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "Files" ADD COLUMN "uploadStatus" varchar(255);--> statement-breakpoint
ALTER TABLE "Files" ADD COLUMN "src" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "Files" ADD COLUMN "folderId" varchar(255);--> statement-breakpoint
ALTER TABLE "Links" ADD COLUMN "transparent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Tracks" ADD COLUMN "archived" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Tracks" ADD COLUMN "artworkId" varchar(255);--> statement-breakpoint
ALTER TABLE "Users" ADD COLUMN "stripeId_devMode" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "bookingTitle" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "bookingName" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "bookingEmail" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "feature__tracks" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "feature__mixtapes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "feature__pressKits" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "youtubeChannelId" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "tiktokUsername" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "instagramUsername" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "spotifyFollowers" integer;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "spotifyMonthlyListeners" integer;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "youtubeSubscribers" integer;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "tiktokFollowers" integer;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "instagramFollowers" integer;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "twitterFollowers" integer;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "facebookFollowers" integer;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "stripeCustomerId" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "stripeCustomerId_devMode" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "stripeConnectAccountId" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "stripeConnectAccountId_devMode" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "stripeConnectChargesEnabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "stripeConnectChargesEnabled_devMode" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "fileUsage_total" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "fileUsage_billingCycle" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "fileUsageLimit_total" integer DEFAULT 200000000 NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "fileUsageLimit_billingCycle" integer DEFAULT 200000000 NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "cartSupportEmail" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "shippingAddressLine1" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "shippingAddressLine2" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "shippingAddressCity" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "shippingAddressState" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "shippingAddressPostalCode" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "shippingAddressCountry" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "orders" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Funnels_workspaceId_idx" ON "CartFunnels" ("workspaceId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Funnels_handle_key" ON "CartFunnels" ("handle","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "FileFolders_workspace_idx" ON "FileFolders" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currentWorkspaceAvatar" ON "_Files_To_Workspaces__Avatar" ("workspaceId","current");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currentWorkspaceHeader" ON "_Files_To_Workspaces__Header" ("workspaceId","current");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "WorkspaceInvites_workspaceId_index" ON "WorkspaceInvites" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "CampaignUpdateRecords_campaign_idx" ON "CampaignUpdateRecords" ("campaignId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "FormResponses_form_idx" ON "FormResponses" ("formId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Link_handle_app_appRoute_key" ON "Links" ("handle","appId","appRoute");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "LineItems_transaction_idx" ON "TransactionLineItems" ("transactionId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Files" ADD CONSTRAINT "Files_folderId_FileFolders_id_fk" FOREIGN KEY ("folderId") REFERENCES "FileFolders"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CartFunnels" ADD CONSTRAINT "CartFunnels_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CartFunnels" ADD CONSTRAINT "CartFunnels_handle_Workspaces_handle_fk" FOREIGN KEY ("handle") REFERENCES "Workspaces"("handle") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CartFunnels" ADD CONSTRAINT "CartFunnels_mainProductId_Products_id_fk" FOREIGN KEY ("mainProductId") REFERENCES "Products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CartFunnels" ADD CONSTRAINT "CartFunnels_bumpProductId_Products_id_fk" FOREIGN KEY ("bumpProductId") REFERENCES "Products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CartFunnels" ADD CONSTRAINT "CartFunnels_upsellProductId_Products_id_fk" FOREIGN KEY ("upsellProductId") REFERENCES "Products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Carts" ADD CONSTRAINT "Carts_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Carts" ADD CONSTRAINT "Carts_funnelId_CartFunnels_id_fk" FOREIGN KEY ("funnelId") REFERENCES "CartFunnels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Carts" ADD CONSTRAINT "Carts_mainProductId_Products_id_fk" FOREIGN KEY ("mainProductId") REFERENCES "Products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Carts" ADD CONSTRAINT "Carts_bumpProductId_Products_id_fk" FOREIGN KEY ("bumpProductId") REFERENCES "Products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Carts" ADD CONSTRAINT "Carts_fanId_Fans_id_fk" FOREIGN KEY ("fanId") REFERENCES "Fans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Carts" ADD CONSTRAINT "Carts_upsellProductId_Products_id_fk" FOREIGN KEY ("upsellProductId") REFERENCES "Products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Fans" ADD CONSTRAINT "Fans_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Fans_To_PaymentMethods" ADD CONSTRAINT "_Fans_To_PaymentMethods_fanId_Fans_id_fk" FOREIGN KEY ("fanId") REFERENCES "Fans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FileFolders" ADD CONSTRAINT "FileFolders_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FileFolders" ADD CONSTRAINT "FileFolders_parentId_FileFolders_id_fk" FOREIGN KEY ("parentId") REFERENCES "FileFolders"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_PressKits__PressPhotos" ADD CONSTRAINT "_Files_To_PressKits__PressPhotos_fileId_Files_id_fk" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_PressKits__PressPhotos" ADD CONSTRAINT "_Files_To_PressKits__PressPhotos_pressKitId_PressKits_id_fk" FOREIGN KEY ("pressKitId") REFERENCES "PressKits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_Products__Images" ADD CONSTRAINT "_Files_To_Products__Images_fileId_Files_id_fk" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_Products__Images" ADD CONSTRAINT "_Files_To_Products__Images_productId_Products_id_fk" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_Tracks__Artwork" ADD CONSTRAINT "_Files_To_Tracks__Artwork_fileId_Files_id_fk" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_Tracks__Artwork" ADD CONSTRAINT "_Files_To_Tracks__Artwork_trackId_Tracks_id_fk" FOREIGN KEY ("trackId") REFERENCES "Tracks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_Tracks__Audio" ADD CONSTRAINT "_Files_To_Tracks__Audio_fileId_Files_id_fk" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_Tracks__Audio" ADD CONSTRAINT "_Files_To_Tracks__Audio_trackId_Tracks_id_fk" FOREIGN KEY ("trackId") REFERENCES "Tracks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_Workspaces__Avatar" ADD CONSTRAINT "_Files_To_Workspaces__Avatar_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_Workspaces__Avatar" ADD CONSTRAINT "_Files_To_Workspaces__Avatar_fileId_Files_id_fk" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_Workspaces__Header" ADD CONSTRAINT "_Files_To_Workspaces__Header_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Files_To_Workspaces__Header" ADD CONSTRAINT "_Files_To_Workspaces__Header_fileId_Files_id_fk" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Mixtapes" ADD CONSTRAINT "Mixtapes_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Mixtapes_To_Tracks" ADD CONSTRAINT "_Mixtapes_To_Tracks_mixtapeId_Mixtapes_id_fk" FOREIGN KEY ("mixtapeId") REFERENCES "Mixtapes"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Mixtapes_To_Tracks" ADD CONSTRAINT "_Mixtapes_To_Tracks_trackId_Tracks_id_fk" FOREIGN KEY ("trackId") REFERENCES "Tracks"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PressKits" ADD CONSTRAINT "PressKits_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PressKits" ADD CONSTRAINT "PressKits_handle_Workspaces_handle_fk" FOREIGN KEY ("handle") REFERENCES "Workspaces"("handle") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PressKits" ADD CONSTRAINT "PressKits_mixtapeId_Mixtapes_id_fk" FOREIGN KEY ("mixtapeId") REFERENCES "Mixtapes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ApparelSizes" ADD CONSTRAINT "ApparelSizes_productId_Products_id_fk" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Products" ADD CONSTRAINT "Products_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WorkspaceInvites" ADD CONSTRAINT "WorkspaceInvites_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Files" ADD CONSTRAINT "Files_key_unique" UNIQUE("workspaceId","key");