CREATE TABLE IF NOT EXISTS "Domains" (
	"domain" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"verified" boolean DEFAULT false NOT NULL,
	"target" varchar(255),
	"description" varchar(255),
	"type" varchar(10) NOT NULL,
	"isPrimaryLinkDomain" boolean DEFAULT false NOT NULL,
	"isPrimaryBioDomain" boolean DEFAULT false NOT NULL,
	"isPrimaryPressDomain" boolean DEFAULT false NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"lastClickedAt" timestamp,
	"lastCheckedAt" timestamp DEFAULT now(),
	"workspaceId" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "_Playlists_To_Genres" RENAME COLUMN "genreName" TO "genreId";--> statement-breakpoint
ALTER TABLE "Links" RENAME COLUMN "ogTitle" TO "title";--> statement-breakpoint
ALTER TABLE "Links" RENAME COLUMN "ogDescription" TO "description";--> statement-breakpoint
ALTER TABLE "Links" RENAME COLUMN "ogImage" TO "image";--> statement-breakpoint
ALTER TABLE "_Playlists_To_Genres" DROP CONSTRAINT "_Playlists_To_Genres_playlistId_genreName";--> statement-breakpoint
ALTER TABLE "_Playlists_To_Genres" DROP CONSTRAINT "_Playlists_To_Genres_genreName_Genres_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "AnalyticsEndpoints_platform_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "_PlaylistsToGenres_genre_idx";--> statement-breakpoint
ALTER TABLE "AdCampaigns" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdCampaigns" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdCampaigns" ALTER COLUMN "campaignId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdCampaigns" ALTER COLUMN "metaAdAccountId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdCreatives" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdCreatives" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdCreatives" ALTER COLUMN "metaAccountId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdCreatives" ALTER COLUMN "tiktokAccountId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdCreatives" ALTER COLUMN "headlineId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdCreatives" ALTER COLUMN "linkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdHeadlines" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSetCloneRecords" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSetCloneRecords" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSetCloneRecords" ALTER COLUMN "audienceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSetCloneRecords" ALTER COLUMN "adSetParentId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSetCloneRecords" ALTER COLUMN "adSetChildId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSetUpdateRecords" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSetUpdateRecords" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSetUpdateRecords" ALTER COLUMN "adSetId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSetUpdateRecords" ALTER COLUMN "audienceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSets" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSets" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSets" ALTER COLUMN "adCampaignId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSets" ALTER COLUMN "audienceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AdSets" ALTER COLUMN "adSetParentId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Ads" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Ads" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Ads" ALTER COLUMN "adSetId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Ads" ALTER COLUMN "adCreativeId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AnalyticsEndpoints" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AudienceDemos" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AudienceDemos" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AudienceGeoGroups" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AudienceGeoGroups" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceCountries_To_AudienceGeoGroups" ALTER COLUMN "audienceCountryId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceCountries_To_AudienceGeoGroups" ALTER COLUMN "audienceGeoGroupId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceCountries_To_Audiences" ALTER COLUMN "audienceCountryId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceCountries_To_Audiences" ALTER COLUMN "audienceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceGeoGroups_To_Audiences" ALTER COLUMN "audienceGeoGroupId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceGeoGroups_To_Audiences" ALTER COLUMN "audienceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AudienceInterestGroups" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AudienceInterestGroups" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AudienceInterests" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceInterestGroup_To_Audience" ALTER COLUMN "audienceInterestGroupId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceInterestGroup_To_Audience" ALTER COLUMN "audienceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceInterest_To_AudienceInterestGroup" ALTER COLUMN "audienceInterestId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceInterest_To_AudienceInterestGroup" ALTER COLUMN "audienceInterestGroupId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceInterest_To_Audience" ALTER COLUMN "audienceInterestId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceInterest_To_Audience" ALTER COLUMN "audienceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AudienceVidViewsGroups" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "AudienceVidViewsGroups" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceVidViewsGroups_To_Audiences" ALTER COLUMN "vidViewsGroupId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_AudienceVidViewsGroups_To_Audiences" ALTER COLUMN "audienceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Audiences" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Audiences" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Audiences" ALTER COLUMN "demoId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "BioButtons" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "BioButtons" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "BioButtons" ALTER COLUMN "linkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "BioButtons" ALTER COLUMN "formId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Bios" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Bios" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_BioButtons_To_Bios" ALTER COLUMN "bioId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_BioButtons_To_Bios" ALTER COLUMN "bioButtonId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "CampaignUpdateRecords" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "CampaignUpdateRecords" ALTER COLUMN "campaignId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "CampaignUpdateRecords" ALTER COLUMN "creatorId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Campaigns" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Campaigns" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Campaigns" ALTER COLUMN "createdById" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Campaigns" ALTER COLUMN "trackId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Campaigns" ALTER COLUMN "playlistId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "EventReports" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "EventReports" ALTER COLUMN "eventId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "EventReports" ALTER COLUMN "analyticsId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Events" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Events" ALTER COLUMN "linkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Events" ALTER COLUMN "bioId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Events" ALTER COLUMN "bioButtonId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Events" ALTER COLUMN "formId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Events" ALTER COLUMN "visitorSessionId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ExternalWebsite" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ExternalWebsite" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Files" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Files" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Files" ALTER COLUMN "createdById" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Files" ALTER COLUMN "uploadedById" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Files" ALTER COLUMN "trackId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Files" ALTER COLUMN "thumbnailForId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Files" ALTER COLUMN "vidRenderId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "FormResponses" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "FormResponses" ALTER COLUMN "formId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Forms" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Forms" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Genres" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "Genres" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_Playlists_To_Genres" ALTER COLUMN "playlistId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_Tracks_To_Genres" ALTER COLUMN "trackId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Links" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Links" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Links" ALTER COLUMN "domain" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Links" ALTER COLUMN "domain" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Links" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Links" ALTER COLUMN "appLinkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Links" ALTER COLUMN "bioId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Links" ALTER COLUMN "socialForTeamId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Links" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "PlaylistCoverRenders" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistCoverRenders" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistCoverRenders" ALTER COLUMN "createdById" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistCoverRenders" ALTER COLUMN "renderedCoverId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistCoverRenders" ALTER COLUMN "playlistId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistPitchReviews" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistPitchReviews" ALTER COLUMN "campaignId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistPitchReviews" ALTER COLUMN "reviewerId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistPlacements" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistPlacements" ALTER COLUMN "trackId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistPlacements" ALTER COLUMN "playlistId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "PlaylistPlacements" ALTER COLUMN "pitchReviewId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "curatorId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "coverId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "spotifyLinkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "appleMusicLinkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "deezerLinkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "soundCloudLinkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "tidalLinkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "youtubeLinkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Playlists" ALTER COLUMN "cloneParentId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_Playlists_To_ProviderAccounts" ALTER COLUMN "playlistId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ProviderAccounts" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ProviderAccounts" ALTER COLUMN "userId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ProviderAccounts" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ProviderSubAccounts" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ProviderSubAccounts" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ProviderSubAccounts" ALTER COLUMN "userId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Stats" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Stats" ALTER COLUMN "adId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Stats" ALTER COLUMN "playlistId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Stats" ALTER COLUMN "trackId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "TrackRenders" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "TrackRenders" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "TrackRenders" ALTER COLUMN "createdById" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "TrackRenders" ALTER COLUMN "trackId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Tracks" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Tracks" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "TransactionLineItems" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "TransactionLineItems" ALTER COLUMN "transactionId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "TransactionLineItems" ALTER COLUMN "campaignId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Transactions" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Transactions" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Transactions" ALTER COLUMN "createdById" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "UserSessions" ALTER COLUMN "userId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Users" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Users" ALTER COLUMN "personalWorkspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_Users_To_Workspaces" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_Users_To_Workspaces" ALTER COLUMN "userId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "_Users_To_Workspaces" ALTER COLUMN "role" SET DEFAULT 'member';--> statement-breakpoint
ALTER TABLE "VidRenders" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "VidRenders" ALTER COLUMN "workspaceId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "VidRenders" ALTER COLUMN "createdById" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "VidRenders" ALTER COLUMN "adCampaignId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "VidRenders" ALTER COLUMN "trackRenderId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "VidRenders" ALTER COLUMN "parentVidId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "VisitorSessions" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "VisitorSessions" ALTER COLUMN "externalWebsiteId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ALTER COLUMN "bioRootId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Links" ADD COLUMN "customMetaTags" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Links" ADD COLUMN "remarketing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Links" ADD COLUMN "comments" text;--> statement-breakpoint
ALTER TABLE "Links" ADD COLUMN "archived" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Links" ADD COLUMN "clicks" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "Links" ADD COLUMN "publicStats" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Links" ADD COLUMN "userId" varchar(255);--> statement-breakpoint
ALTER TABLE "TransactionLineItems" ADD COLUMN "subscriptionInterval" varchar(255);--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "plan" varchar(10) DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "linkUsage" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "linkUsageLimit" integer DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspaces" ADD COLUMN "billingCycleStart" integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Domains_workspace_idx" ON "Domains" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Domains_clicked_idx" ON "Domains" ("clicks");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Domains_lastClickedAt_idx" ON "Domains" ("lastClickedAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Domains_lastCheckedAt_idx" ON "Domains" ("lastCheckedAt");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_platform_idx" ON "AnalyticsEndpoints" ("workspaceId","platform");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_PlaylistsToGenres_genre_idx" ON "_Playlists_To_Genres" ("genreId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Playlists_To_Genres" ADD CONSTRAINT "_Playlists_To_Genres_genreId_Genres_id_fk" FOREIGN KEY ("genreId") REFERENCES "Genres"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Links" ADD CONSTRAINT "Links_handle_Workspaces_handle_fk" FOREIGN KEY ("handle") REFERENCES "Workspaces"("handle") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Links" ADD CONSTRAINT "Links_domain_Domains_domain_fk" FOREIGN KEY ("domain") REFERENCES "Domains"("domain") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Links" ADD CONSTRAINT "Links_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Links" DROP COLUMN IF EXISTS "appRouteId";--> statement-breakpoint
ALTER TABLE "Links" DROP COLUMN IF EXISTS "delete";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Domains" ADD CONSTRAINT "Domains_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "_Playlists_To_Genres" ADD CONSTRAINT "_Playlists_To_Genres_playlistId_genreId" PRIMARY KEY("playlistId","genreId");