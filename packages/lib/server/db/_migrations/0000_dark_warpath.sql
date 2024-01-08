DO $$ BEGIN
 CREATE TYPE "id" AS ENUM('Blues---Boogie Woogie', 'Blues---Chicago Blues', 'Blues---Country Blues', 'Blues---Delta Blues', 'Blues---Electric Blues', 'Blues---Harmonica Blues', 'Blues---Jump Blues', 'Blues---Louisiana Blues', 'Blues---Modern Electric Blues', 'Blues---Piano Blues', 'Blues---Rhythm & Blues', 'Blues---Texas Blues', 'Children's---Educational', 'Children's---Nursery Rhymes', 'Children's---Story', 'Classical---Baroque', 'Classical---Choral', 'Classical---Classical', 'Classical---Contemporary', 'Classical---Impressionist', 'Classical---Medieval', 'Classical---Modern', 'Classical---Neo-Classical', 'Classical---Neo-Romantic', 'Classical---Opera', 'Classical---Post-Modern', 'Classical---Renaissance', 'Classical---Romantic', 'Electronic---Abstract', 'Electronic---Acid', 'Electronic---Acid House', 'Electronic---Acid Jazz', 'Electronic---Ambient', 'Electronic---Bassline', 'Electronic---Beatdown', 'Electronic---Berlin-School', 'Electronic---Big Beat', 'Electronic---Bleep', 'Electronic---Breakbeat', 'Electronic---Breakcore', 'Electronic---Breaks', 'Electronic---Broken Beat', 'Electronic---Chillwave', 'Electronic---Chiptune', 'Electronic---Dance-pop', 'Electronic---Dark Ambient', 'Electronic---Darkwave', 'Electronic---Deep House', 'Electronic---Deep Techno', 'Electronic---Disco', 'Electronic---Disco Polo', 'Electronic---Donk', 'Electronic---Downtempo', 'Electronic---Drone', 'Electronic---Drum n Bass', 'Electronic---Dub', 'Electronic---Dub Techno', 'Electronic---Dubstep', 'Electronic---Dungeon Synth', 'Electronic---EBM', 'Electronic---Electro', 'Electronic---Electro House', 'Electronic---Electroclash', 'Electronic---Euro House', 'Electronic---Euro-Disco', 'Electronic---Eurobeat', 'Electronic---Eurodance', 'Electronic---Experimental', 'Electronic---Freestyle', 'Electronic---Future Jazz', 'Electronic---Gabber', 'Electronic---Garage House', 'Electronic---Ghetto', 'Electronic---Ghetto House', 'Electronic---Glitch', 'Electronic---Goa Trance', 'Electronic---Grime', 'Electronic---Halftime', 'Electronic---Hands Up', 'Electronic---Happy Hardcore', 'Electronic---Hard House', 'Electronic---Hard Techno', 'Electronic---Hard Trance', 'Electronic---Hardcore', 'Electronic---Hardstyle', 'Electronic---Hi NRG', 'Electronic---Hip Hop', 'Electronic---Hip-House', 'Electronic---House', 'Electronic---IDM', 'Electronic---Illbient', 'Electronic---Industrial', 'Electronic---Italo House', 'Electronic---Italo-Disco', 'Electronic---Italodance', 'Electronic---Jazzdance', 'Electronic---Juke', 'Electronic---Jumpstyle', 'Electronic---Jungle', 'Electronic---Latin', 'Electronic---Leftfield', 'Electronic---Makina', 'Electronic---Minimal', 'Electronic---Minimal Techno', 'Electronic---Modern Classical', 'Electronic---Musique Concrète', 'Electronic---Neofolk', 'Electronic---New Age', 'Electronic---New Beat', 'Electronic---New Wave', 'Electronic---Noise', 'Electronic---Nu-Disco', 'Electronic---Power Electronics', 'Electronic---Progressive Breaks', 'Electronic---Progressive House', 'Electronic---Progressive Trance', 'Electronic---Psy-Trance', 'Electronic---Rhythmic Noise', 'Electronic---Schranz', 'Electronic---Sound Collage', 'Electronic---Speed Garage', 'Electronic---Speedcore', 'Electronic---Synth-pop', 'Electronic---Synthwave', 'Electronic---Tech House', 'Electronic---Tech Trance', 'Electronic---Techno', 'Electronic---Trance', 'Electronic---Tribal', 'Electronic---Tribal House', 'Electronic---Trip Hop', 'Electronic---Tropical House', 'Electronic---UK Garage', 'Electronic---Vaporwave', 'Folk, World, & Country---African', 'Folk, World, & Country---Bluegrass', 'Folk, World, & Country---Cajun', 'Folk, World, & Country---Canzone Napoletana', 'Folk, World, & Country---Catalan Music', 'Folk, World, & Country---Celtic', 'Folk, World, & Country---Country', 'Folk, World, & Country---Fado', 'Folk, World, & Country---Flamenco', 'Folk, World, & Country---Folk', 'Folk, World, & Country---Gospel', 'Folk, World, & Country---Highlife', 'Folk, World, & Country---Hillbilly', 'Folk, World, & Country---Hindustani', 'Folk, World, & Country---Honky Tonk', 'Folk, World, & Country---Indian Classical', 'Folk, World, & Country---Laïkó', 'Folk, World, & Country---Nordic', 'Folk, World, & Country---Pacific', 'Folk, World, & Country---Polka', 'Folk, World, & Country---Raï', 'Folk, World, & Country---Romani', 'Folk, World, & Country---Soukous', 'Folk, World, & Country---Séga', 'Folk, World, & Country---Volksmusik', 'Folk, World, & Country---Zouk', 'Folk, World, & Country---Éntekhno', 'Funk / Soul---Afrobeat', 'Funk / Soul---Boogie', 'Funk / Soul---Contemporary R&B', 'Funk / Soul---Disco', 'Funk / Soul---Free Funk', 'Funk / Soul---Funk', 'Funk / Soul---Gospel', 'Funk / Soul---Neo Soul', 'Funk / Soul---New Jack Swing', 'Funk / Soul---P.Funk', 'Funk / Soul---Psychedelic', 'Funk / Soul---Rhythm & Blues', 'Funk / Soul---Soul', 'Funk / Soul---Swingbeat', 'Funk / Soul---UK Street Soul', 'Hip Hop---Bass Music', 'Hip Hop---Boom Bap', 'Hip Hop---Bounce', 'Hip Hop---Britcore', 'Hip Hop---Cloud Rap', 'Hip Hop---Conscious', 'Hip Hop---Crunk', 'Hip Hop---Cut-up/DJ', 'Hip Hop---DJ Battle Tool', 'Hip Hop---Electro', 'Hip Hop---G-Funk', 'Hip Hop---Gangsta', 'Hip Hop---Grime', 'Hip Hop---Hardcore Hip-Hop', 'Hip Hop---Horrorcore', 'Hip Hop---Instrumental', 'Hip Hop---Jazzy Hip-Hop', 'Hip Hop---Miami Bass', 'Hip Hop---Pop Rap', 'Hip Hop---Ragga HipHop', 'Hip Hop---RnB/Swing', 'Hip Hop---Screw', 'Hip Hop---Thug Rap', 'Hip Hop---Trap', 'Hip Hop---Trip Hop', 'Hip Hop---Turntablism', 'Jazz---Afro-Cuban Jazz', 'Jazz---Afrobeat', 'Jazz---Avant-garde Jazz', 'Jazz---Big Band', 'Jazz---Bop', 'Jazz---Bossa Nova', 'Jazz---Contemporary Jazz', 'Jazz---Cool Jazz', 'Jazz---Dixieland', 'Jazz---Easy Listening', 'Jazz---Free Improvisation', 'Jazz---Free Jazz', 'Jazz---Fusion', 'Jazz---Gypsy Jazz', 'Jazz---Hard Bop', 'Jazz---Jazz-Funk', 'Jazz---Jazz-Rock', 'Jazz---Latin Jazz', 'Jazz---Modal', 'Jazz---Post Bop', 'Jazz---Ragtime', 'Jazz---Smooth Jazz', 'Jazz---Soul-Jazz', 'Jazz---Space-Age', 'Jazz---Swing', 'Latin---Afro-Cuban', 'Latin---Baião', 'Latin---Batucada', 'Latin---Beguine', 'Latin---Bolero', 'Latin---Boogaloo', 'Latin---Bossanova', 'Latin---Cha-Cha', 'Latin---Charanga', 'Latin---Compas', 'Latin---Cubano', 'Latin---Cumbia', 'Latin---Descarga', 'Latin---Forró', 'Latin---Guaguancó', 'Latin---Guajira', 'Latin---Guaracha', 'Latin---MPB', 'Latin---Mambo', 'Latin---Mariachi', 'Latin---Merengue', 'Latin---Norteño', 'Latin---Nueva Cancion', 'Latin---Pachanga', 'Latin---Porro', 'Latin---Ranchera', 'Latin---Reggaeton', 'Latin---Rumba', 'Latin---Salsa', 'Latin---Samba', 'Latin---Son', 'Latin---Son Montuno', 'Latin---Tango', 'Latin---Tejano', 'Latin---Vallenato', 'Pop---Ballad', 'Pop---Bollywood', 'Pop---Bubblegum', 'Pop---Chanson', 'Pop---City Pop', 'Pop---Europop', 'Pop---Indie Pop', 'Pop---J-pop', 'Pop---K-pop', 'Pop---Kayōkyoku', 'Pop---Light Music', 'Pop---Music Hall', 'Pop---Novelty', 'Pop---Parody', 'Pop---Schlager', 'Pop---Vocal', 'Reggae---Calypso', 'Reggae---Dancehall', 'Reggae---Dub', 'Reggae---Lovers Rock', 'Reggae---Ragga', 'Reggae---Reggae', 'Reggae---Reggae-Pop', 'Reggae---Rocksteady', 'Reggae---Roots Reggae', 'Reggae---Ska', 'Reggae---Soca', 'Rock---AOR', 'Rock---Acid Rock', 'Rock---Acoustic', 'Rock---Alternative Rock', 'Rock---Arena Rock', 'Rock---Art Rock', 'Rock---Atmospheric Black Metal', 'Rock---Avantgarde', 'Rock---Beat', 'Rock---Black Metal', 'Rock---Blues Rock', 'Rock---Brit Pop', 'Rock---Classic Rock', 'Rock---Coldwave', 'Rock---Country Rock', 'Rock---Crust', 'Rock---Death Metal', 'Rock---Deathcore', 'Rock---Deathrock', 'Rock---Depressive Black Metal', 'Rock---Doo Wop', 'Rock---Doom Metal', 'Rock---Dream Pop', 'Rock---Emo', 'Rock---Ethereal', 'Rock---Experimental', 'Rock---Folk Metal', 'Rock---Folk Rock', 'Rock---Funeral Doom Metal', 'Rock---Funk Metal', 'Rock---Garage Rock', 'Rock---Glam', 'Rock---Goregrind', 'Rock---Goth Rock', 'Rock---Gothic Metal', 'Rock---Grindcore', 'Rock---Grunge', 'Rock---Hard Rock', 'Rock---Hardcore', 'Rock---Heavy Metal', 'Rock---Indie Rock', 'Rock---Industrial', 'Rock---Krautrock', 'Rock---Lo-Fi', 'Rock---Lounge', 'Rock---Math Rock', 'Rock---Melodic Death Metal', 'Rock---Melodic Hardcore', 'Rock---Metalcore', 'Rock---Mod', 'Rock---Neofolk', 'Rock---New Wave', 'Rock---No Wave', 'Rock---Noise', 'Rock---Noisecore', 'Rock---Nu Metal', 'Rock---Oi', 'Rock---Parody', 'Rock---Pop Punk', 'Rock---Pop Rock', 'Rock---Pornogrind', 'Rock---Post Rock', 'Rock---Post-Hardcore', 'Rock---Post-Metal', 'Rock---Post-Punk', 'Rock---Power Metal', 'Rock---Power Pop', 'Rock---Power Violence', 'Rock---Prog Rock', 'Rock---Progressive Metal', 'Rock---Psychedelic Rock', 'Rock---Psychobilly', 'Rock---Pub Rock', 'Rock---Punk', 'Rock---Rock & Roll', 'Rock---Rockabilly', 'Rock---Shoegaze', 'Rock---Ska', 'Rock---Sludge Metal', 'Rock---Soft Rock', 'Rock---Southern Rock', 'Rock---Space Rock', 'Rock---Speed Metal', 'Rock---Stoner Rock', 'Rock---Surf', 'Rock---Symphonic Rock', 'Rock---Technical Death Metal', 'Rock---Thrash', 'Rock---Twist', 'Rock---Viking Metal', 'Rock---Yé-Yé');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AdCampaigns" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"splitTestDemos" boolean DEFAULT false NOT NULL,
	"splitTestGeoGroups" boolean DEFAULT false NOT NULL,
	"splitTestInterestGroups" boolean DEFAULT false NOT NULL,
	"metaId" varchar(255),
	"metaDailyBudget" integer,
	"metaLifetimeBudget" integer,
	"metaTriggerPercentage" integer,
	"status" varchar(255) NOT NULL,
	"campaignId" char(24) NOT NULL,
	"metaAdAccountId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AdCreatives" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"metaId" varchar(255),
	"metaPostId" varchar(255),
	"callToActionType" varchar(255),
	"linkCaption" varchar(255),
	"urlTags" varchar(255),
	"tiktokId" varchar(255),
	"metaAccountId" char(24) NOT NULL,
	"tiktokAccountId" char(24),
	"headlineId" char(24),
	"linkId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AdHeadlines" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"headline" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AdSetCloneRecords" (
	"id" char(24) NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"meta" boolean NOT NULL,
	"metaStatus" varchar(255) NOT NULL,
	"metaComplete" boolean NOT NULL,
	"tiktok" boolean NOT NULL,
	"tiktokComplete" boolean NOT NULL,
	"dailyBudget" integer,
	"audienceId" char(24),
	"adSetParentId" char(24) NOT NULL,
	"adSetChildId" char(24),
	CONSTRAINT AdSetCloneRecords_workspaceId_adSetParentId_id PRIMARY KEY("workspaceId","adSetParentId","id"),
	CONSTRAINT "AdSetCloneRecords_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AdSetUpdateRecords" (
	"id" char(24) NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metaComplete" boolean,
	"metaStatus" varchar(255),
	"tiktokComplete" boolean,
	"dailyBudget" integer,
	"adSetId" char(24) NOT NULL,
	"audienceId" char(24),
	CONSTRAINT AdSetUpdateRecords_workspaceId_adSetId_id PRIMARY KEY("workspaceId","adSetId","id"),
	CONSTRAINT "AdSetUpdateRecords_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AdSets" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"metaId" varchar(255),
	"fbFeed" boolean NOT NULL,
	"fbVideoFeeds" boolean NOT NULL,
	"fbMarketplace" boolean NOT NULL,
	"fbStories" boolean NOT NULL,
	"igFeed" boolean NOT NULL,
	"igStories" boolean NOT NULL,
	"igReels" boolean NOT NULL,
	"tiktokFeed" boolean NOT NULL,
	"metaStatus" varchar(255) NOT NULL,
	"tiktokId" varchar(255),
	"tiktokStatus" varchar(255) NOT NULL,
	"adCampaignId" char(24) NOT NULL,
	"audienceId" char(24) NOT NULL,
	"adSetParentId" char(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Ads" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"metaId" varchar(255),
	"tiktokId" varchar(255),
	"status" varchar(255) NOT NULL,
	"passedTest" boolean,
	"adSetId" char(24) NOT NULL,
	"adCreativeId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AnalyticsEndpoints" (
	"id" varchar(255) NOT NULL,
	"platform" varchar(255) NOT NULL,
	"accessToken" varchar(255),
	"workspaceId" char(24) NOT NULL,
	CONSTRAINT AnalyticsEndpoints_platform_id PRIMARY KEY("platform","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AudienceDemos" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"name" varchar(255) NOT NULL,
	"ageMin" integer DEFAULT 18 NOT NULL,
	"ageMax" integer NOT NULL,
	"gender" varchar(255) NOT NULL,
	"onlyEnglish" boolean NOT NULL,
	"public" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AudienceCountries" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(255) NOT NULL,
	"color" varchar(255) NOT NULL,
	"trigger" boolean NOT NULL,
	"metaAudienceLowerBound" integer,
	"metaAudienceUpperBound" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AudienceGeoGroups" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"public" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_AudienceCountries_To_AudienceGeoGroups" (
	"audienceCountryId" char(24) NOT NULL,
	"audienceGeoGroupId" char(24) NOT NULL,
	CONSTRAINT _AudienceCountries_To_AudienceGeoGroups_audienceCountryId_audienceGeoGroupId PRIMARY KEY("audienceCountryId","audienceGeoGroupId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_AudienceCountries_To_Audiences" (
	"audienceCountryId" char(24) NOT NULL,
	"audienceId" char(24) NOT NULL,
	CONSTRAINT _AudienceCountries_To_Audiences_audienceCountryId_audienceId PRIMARY KEY("audienceCountryId","audienceId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_AudienceGeoGroups_To_Audiences" (
	"audienceGeoGroupId" char(24) NOT NULL,
	"audienceId" char(24) NOT NULL,
	CONSTRAINT _AudienceGeoGroups_To_Audiences_audienceGeoGroupId_audienceId PRIMARY KEY("audienceGeoGroupId","audienceId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AudienceInterestGroups" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"public" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AudienceInterests" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"metaId" varchar(255) NOT NULL,
	"metaTopic" varchar(255) NOT NULL,
	"metaAudienceLowerBound" integer NOT NULL,
	"metaAudienceUpperBound" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_AudienceInterestGroup_To_Audience" (
	"audienceInterestGroupId" char(24) NOT NULL,
	"audienceId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_AudienceInterest_To_AudienceInterestGroup" (
	"audienceInterestId" char(24) NOT NULL,
	"audienceInterestGroupId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_AudienceInterest_To_Audience" (
	"audienceInterestId" char(24) NOT NULL,
	"audienceId" char(24) NOT NULL,
	"type" char(7) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AudienceVidViewsGroups" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"metric" varchar(255) NOT NULL,
	"retention" varchar(255) NOT NULL,
	"metaId" varchar(255) NOT NULL,
	"metaName" varchar(255) NOT NULL,
	"metaAudienceLowerBound" integer NOT NULL,
	"metaAudienceUpperBound" integer NOT NULL,
	"tiktokId" varchar(255) NOT NULL,
	"tiktokName" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_AudienceVidViewsGroups_To_Audiences" (
	"vidViewsGroupId" char(24) NOT NULL,
	"audienceId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Audiences" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255),
	"metaId" varchar(255),
	"metaAudienceLowerBound" integer,
	"metaAudienceUpperBound" integer,
	"tiktokId" varchar(255),
	"demoId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BioButtons" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"linkId" char(24),
	"formId" char(24),
	"text" varchar(255) NOT NULL,
	"buttonColor" varchar(255),
	"textColor" varchar(255),
	"email" varchar(255),
	"phone" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Bios" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"handle" varchar(255) NOT NULL,
	"route" varchar(255),
	"slug" varchar(255),
	"img" varchar(255),
	"imgShape" varchar(255),
	"title" varchar(255),
	"subtitle" varchar(255),
	"titleColor" varchar(255),
	"buttonColor" varchar(255),
	"iconColor" varchar(255),
	"textColor" varchar(255),
	"socialDisplay" boolean NOT NULL,
	"socialButtonColor" varchar(255),
	"socialIconColor" varchar(255),
	"theme" varchar(255) DEFAULT 'light' NOT NULL,
	"barelyBranding" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_BioButtons_To_Bios" (
	"bioId" char(24) NOT NULL,
	"bioButtonId" char(24) NOT NULL,
	"lexoRank" varchar(255) NOT NULL,
	CONSTRAINT _BioButtons_To_Bios_bioId_bioButtonId PRIMARY KEY("bioId","bioButtonId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CampaignUpdateRecords" (
	"id" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"stage" text NOT NULL,
	"campaignId" char(24) NOT NULL,
	"creatorId" char(24) NOT NULL,
	CONSTRAINT CampaignUpdateRecords_campaignId_id PRIMARY KEY("campaignId","id"),
	CONSTRAINT "CampaignUpdateRecords_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Campaigns" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"type" text NOT NULL,
	"stage" text NOT NULL,
	"endDate" timestamp,
	"screeningMessage" varchar(1000),
	"curatorReach" integer,
	"createdById" char(24) NOT NULL,
	"trackId" char(24) NOT NULL,
	"playlistId" char(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "EventReports" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"error" varchar(1000),
	"eventId" char(24) NOT NULL,
	"analyticsPlatform" varchar(100) NOT NULL,
	"analyticsId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Events" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"type" text NOT NULL,
	"linkId" char(24),
	"bioId" char(24),
	"bioButtonId" char(24),
	"formId" char(24),
	"visitorSessionId" char(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ExternalWebsite" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Files" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"type" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"extension" varchar(255) NOT NULL,
	"description" varchar(255),
	"url" varchar(255) NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"fps" integer,
	"duration" integer,
	"internal" boolean NOT NULL,
	"metaId" varchar(255),
	"createdById" char(24) NOT NULL,
	"uploadedById" char(24) NOT NULL,
	"trackId" char(24),
	"thumbnailForId" char(24),
	"vidRenderId" char(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FormResponses" (
	"id" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" text,
	"email" text,
	"phone" text,
	"message" varchar(1000),
	"formId" char(24) NOT NULL,
	CONSTRAINT FormResponses_formId_id PRIMARY KEY("formId","id"),
	CONSTRAINT "FormResponses_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Forms" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"platform" varchar(255) NOT NULL,
	"title" varchar(255),
	"subtitle" varchar(255),
	"messagePrompt" varchar(255),
	"forwardingEmail" varchar(255) NOT NULL,
	"forwardingCc" varchar(255) NOT NULL,
	"inputName" boolean NOT NULL,
	"inputEmail" boolean NOT NULL,
	"inputPhone" boolean NOT NULL,
	"inputMessage" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Genres" (
	"id" "id" NOT NULL,
	"parent" varchar(255) NOT NULL,
	"subgenre" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "Genres_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Playlists_To_Genres" (
	"playlistId" char(24) NOT NULL,
	"genreName" varchar(255) NOT NULL,
	CONSTRAINT _Playlists_To_Genres_playlistId_genreName PRIMARY KEY("playlistId","genreName")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Tracks_To_Genres" (
	"trackId" char(24) NOT NULL,
	"genreId" varchar(255) NOT NULL,
	CONSTRAINT _Tracks_To_Genres_trackId_genreId PRIMARY KEY("trackId","genreId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Links" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"handle" varchar(25) NOT NULL,
	"domain" varchar(25) DEFAULT 'barely' NOT NULL,
	"appId" varchar(25),
	"appRoute" varchar(100),
	"appRouteId" varchar(100),
	"slug" varchar(50),
	"url" varchar(1000) NOT NULL,
	"appleScheme" varchar(1000),
	"androidScheme" varchar(1000),
	"ogTitle" varchar(255),
	"ogDescription" varchar(255),
	"ogImage" varchar(255),
	"favicon" varchar(255),
	"qrLight" varchar(255) DEFAULT 'white',
	"qrDark" varchar(255) DEFAULT 'black',
	"qrText" varchar(255) DEFAULT 'black',
	"qrLogo" varchar(255),
	"showSocialForTeam" boolean DEFAULT false,
	"delete" boolean DEFAULT false,
	"appLinkId" char(24),
	"bioId" char(24),
	"socialForTeamId" char(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PlaylistCoverRenders" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255),
	"img" boolean NOT NULL,
	"imgSrc" varchar(255) NOT NULL,
	"imgShift" boolean NOT NULL,
	"imgShiftX" integer NOT NULL,
	"imgShiftY" integer NOT NULL,
	"imgScale" integer NOT NULL,
	"text" boolean NOT NULL,
	"textColor" varchar(255) DEFAULT 'white' NOT NULL,
	"textScale" integer DEFAULT 100 NOT NULL,
	"textAlign" varchar(255) DEFAULT 'center' NOT NULL,
	"textShiftX" integer DEFAULT 0 NOT NULL,
	"textShiftY" integer DEFAULT 0 NOT NULL,
	"logo" boolean NOT NULL,
	"logoColor" varchar(255) DEFAULT 'white' NOT NULL,
	"createdById" char(24),
	"renderedCoverId" char(24),
	"playlistId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PlaylistPitchReviews" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"stage" varchar(255) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"review" text NOT NULL,
	"rating" integer NOT NULL,
	"rejectReason" varchar(255),
	"campaignId" char(24) NOT NULL,
	"reviewerId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PlaylistPlacements" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"addedToPlaylist" boolean DEFAULT false NOT NULL,
	"playlistPosition" integer NOT NULL,
	"addDate" timestamp DEFAULT CURRENT_TIMESTAMP,
	"daysInPlaylist" integer,
	"removeDate" timestamp,
	"removedFromPlaylist" boolean DEFAULT false NOT NULL,
	"trackId" char(24) NOT NULL,
	"playlistId" char(24) NOT NULL,
	"pitchReviewId" char(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Playlists" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"appleMusicId" varchar(255),
	"deezerId" varchar(255),
	"soundCloudId" varchar(255),
	"spotifyId" varchar(255),
	"tidalId" varchar(255),
	"youtubeId" varchar(255),
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"public" boolean NOT NULL,
	"userOwned" boolean NOT NULL,
	"totalTracks" integer,
	"forTesting" boolean NOT NULL,
	"imageUrl" varchar(255),
	"tracklist" jsonb,
	"curatorId" char(24),
	"coverId" char(24),
	"spotifyLinkId" char(24),
	"appleMusicLinkId" char(24),
	"deezerLinkId" char(24),
	"soundCloudLinkId" char(24),
	"tidalLinkId" char(24),
	"youtubeLinkId" char(24),
	"cloneParentId" char(24),
	CONSTRAINT "Playlists_spotifyId_unique" UNIQUE("spotifyId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Playlists_To_ProviderAccounts" (
	"playlistId" char(24) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	CONSTRAINT _Playlists_To_ProviderAccounts_playlistId_providerAccountId PRIMARY KEY("playlistId","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProviderAccounts" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"userId" char(24) NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" varchar(2000),
	"access_token" varchar(2000),
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(2000),
	"id_token" varchar(255),
	"session_state" varchar(255),
	"username" varchar(255),
	"email" varchar(255),
	"image" varchar(255),
	"externalLink" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProviderSubAccounts" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"type" varchar(255) NOT NULL,
	"providerId" varchar(255) NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"userId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Stats" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"date" timestamp NOT NULL,
	"listeners" integer,
	"streams" integer,
	"likes" integer,
	"saves" integer,
	"followers" integer,
	"newFollowers" integer,
	"spend" integer,
	"clicks" integer,
	"impressions" integer,
	"views" integer,
	"watch25" integer,
	"watch50" integer,
	"watch75" integer,
	"watch95" integer,
	"watch100" integer,
	"watch60s" integer,
	"platform" varchar(255),
	"adId" char(24),
	"providerAccountPlatform" varchar(255),
	"providerAccountId" varchar(255),
	"playlistId" char(24),
	"trackId" char(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TrackRenders" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"trackTrimIn" integer NOT NULL,
	"createdById" char(24),
	"trackId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Tracks" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"isrc" varchar(255),
	"appleMusicId" varchar(255),
	"deezerId" varchar(255),
	"soundcloudId" varchar(255),
	"spotifyId" varchar(255),
	"tidalId" varchar(255),
	"youtubeId" varchar(255),
	"released" boolean NOT NULL,
	"releaseDate" date,
	"imageUrl" varchar(255),
	"masterMp3Id" varchar(255),
	"masterWavId" varchar(255),
	"appleMusicLinkId" varchar(255),
	"deezerLinkId" varchar(255),
	"soundcloudLinkId" varchar(255),
	"spotifyLinkId" varchar(255),
	"tidalLinkId" varchar(255),
	"youtubeLinkId" varchar(255),
	CONSTRAINT "Tracks_isrc_unique" UNIQUE("isrc"),
	CONSTRAINT "Tracks_appleMusicId_unique" UNIQUE("appleMusicId"),
	CONSTRAINT "Tracks_deezerId_unique" UNIQUE("deezerId"),
	CONSTRAINT "Tracks_soundcloudId_unique" UNIQUE("soundcloudId"),
	CONSTRAINT "Tracks_spotifyId_unique" UNIQUE("spotifyId"),
	CONSTRAINT "Tracks_tidalId_unique" UNIQUE("tidalId"),
	CONSTRAINT "Tracks_youtubeId_unique" UNIQUE("youtubeId"),
	CONSTRAINT "Tracks_masterMp3Id_unique" UNIQUE("masterMp3Id"),
	CONSTRAINT "Tracks_masterWavId_unique" UNIQUE("masterWavId"),
	CONSTRAINT "Tracks_appleMusicLinkId_unique" UNIQUE("appleMusicLinkId"),
	CONSTRAINT "Tracks_deezerLinkId_unique" UNIQUE("deezerLinkId"),
	CONSTRAINT "Tracks_soundcloudLinkId_unique" UNIQUE("soundcloudLinkId"),
	CONSTRAINT "Tracks_spotifyLinkId_unique" UNIQUE("spotifyLinkId"),
	CONSTRAINT "Tracks_tidalLinkId_unique" UNIQUE("tidalLinkId"),
	CONSTRAINT "Tracks_youtubeLinkId_unique" UNIQUE("youtubeLinkId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TransactionLineItems" (
	"id" char(24) NOT NULL,
	"name" varchar(255) NOT NULL,
	"paymentType" varchar(255) NOT NULL,
	"setupPrice" integer,
	"subscriptionId" varchar(255),
	"subscriptionPrice" integer,
	"subscriptionPriceDescription" varchar(255),
	"adSpend" integer,
	"maintenancePrice" integer,
	"maintenancePriceDescription" varchar(255),
	"totalDue" integer,
	"description" varchar(255) NOT NULL,
	"transactionId" char(24) NOT NULL,
	"campaignId" char(24),
	CONSTRAINT TransactionLineItems_transactionId_id PRIMARY KEY("transactionId","id"),
	CONSTRAINT "TransactionLineItems_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Transactions" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"completedAt" timestamp,
	"type" varchar(255),
	"amount" integer NOT NULL,
	"description" varchar(255),
	"status" varchar(255) NOT NULL,
	"stripeId" varchar(255),
	"stripeClientSecret" varchar(255),
	"stripeMetadata" json,
	"stripeLiveMode" boolean DEFAULT false NOT NULL,
	"checkoutLink" varchar(255),
	"createdById" char(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserSessions" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"expires" timestamp NOT NULL,
	"userId" char(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Users" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"firstName" varchar(255),
	"lastName" varchar(255),
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp,
	"phone" varchar(255),
	"phoneVerified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"stripeId" varchar(255),
	"marketing" boolean DEFAULT false,
	"pitchScreening" boolean DEFAULT false,
	"pitchReviewing" boolean DEFAULT false,
	"personalWorkspaceId" char(24) NOT NULL,
	"handle" varchar(255),
	"image" varchar(1000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_Users_To_Workspaces" (
	"workspaceId" char(24) NOT NULL,
	"userId" char(24) NOT NULL,
	"role" varchar(255) DEFAULT 'creator' NOT NULL,
	CONSTRAINT _Users_To_Workspaces_workspaceId_userId PRIMARY KEY("workspaceId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VerificationTokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT VerificationTokens_identifier_token PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VidRenders" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"workspaceId" char(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"renderStatus" varchar(255) NOT NULL,
	"renderFailedError" varchar(1000),
	"compName" varchar(255) NOT NULL,
	"compWidth" integer NOT NULL,
	"compHeight" integer NOT NULL,
	"compDuration" integer NOT NULL,
	"trim" boolean NOT NULL,
	"trimIn" integer NOT NULL,
	"trimOut" integer NOT NULL,
	"shift" boolean NOT NULL,
	"shiftX" integer NOT NULL,
	"shiftY" integer NOT NULL,
	"playbackSpeed" integer NOT NULL,
	"addTrack" boolean NOT NULL,
	"addPlaylistTitle" boolean NOT NULL,
	"playlistTitle" varchar(255),
	"lambdaRenderId" varchar(255) NOT NULL,
	"lambdaBucket" varchar(255) NOT NULL,
	"lambdaFunction" varchar(255) NOT NULL,
	"lambdaRegion" varchar(255) NOT NULL,
	"createdById" char(24) NOT NULL,
	"adCampaignId" char(24),
	"trackRenderId" char(24),
	"parentVidId" char(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VisitorSessions" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"browserName" varchar(255),
	"browserVersion" varchar(255),
	"cpu" varchar(255),
	"deviceModel" varchar(255),
	"deviceType" varchar(255),
	"deviceVendor" varchar(255),
	"ip" varchar(255),
	"isBot" boolean,
	"osName" varchar(255),
	"osVersion" varchar(255),
	"referrer" varchar(255),
	"ua" varchar(255),
	"city" varchar(255),
	"country" varchar(255),
	"latitude" varchar(255),
	"longitude" varchar(255),
	"region" varchar(255),
	"externalWebsiteId" char(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Workspaces" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"handle" varchar(255) NOT NULL,
	"imageUrl" varchar(1000),
	"type" varchar(255) DEFAULT 'creator' NOT NULL,
	"spotifyArtistId" varchar(255),
	"bioRootId" char(24),
	"defaultMetaAdAccountId" varchar(255),
	"defaultSpotifyAccountId" varchar(255),
	CONSTRAINT "Workspaces_imageUrl_unique" UNIQUE("imageUrl")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdCampaigns_workspace_idx" ON "AdCampaigns" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdCampaigns_campaign_idx" ON "AdCampaigns" ("campaignId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdCampaigns_metaAdAccount_idx" ON "AdCampaigns" ("metaAdAccountId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdCreatives_workspace_idx" ON "AdCreatives" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdCreatives_metaAccount_idx" ON "AdCreatives" ("metaAccountId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdCreatives_headline_idx" ON "AdCreatives" ("headlineId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdCreatives_link_idx" ON "AdCreatives" ("linkId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdCreatives_tiktokAccount_idx" ON "AdCreatives" ("tiktokAccountId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdSetCloneRecords_audience_idx" ON "AdSetCloneRecords" ("audienceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdSetCloneRecord_adSetParent_idx" ON "AdSetCloneRecords" ("adSetParentId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdSetCloneRecord_adSetChild_idx" ON "AdSetCloneRecords" ("adSetChildId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdSetUpdateRecords_adSet_idx" ON "AdSetUpdateRecords" ("adSetId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdSetUpdateRecord_audience_idx" ON "AdSetUpdateRecords" ("audienceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdSets_workspace_idx" ON "AdSets" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdSets_adCampaign_idx" ON "AdSets" ("adCampaignId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AdSets_audience_idx" ON "AdSets" ("audienceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Ads_workspace_idx" ON "Ads" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Ads_adSet_idx" ON "Ads" ("adSetId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Ads_creative_idx" ON "Ads" ("adCreativeId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "AnalyticsEndpoints_platform_id_idx" ON "AnalyticsEndpoints" ("platform","id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AudienceDemos_workspace_idx" ON "AudienceDemos" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AudienceGeoGroups_workspace_idx" ON "AudienceGeoGroups" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AudienceInterestGroups_workspace_idx" ON "AudienceInterestGroups" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AudienceVidViewsGroups_workspace_idx" ON "AudienceVidViewsGroups" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Audiences_workspace_idx" ON "Audiences" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BioButtons_workspace_idx" ON "BioButtons" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Bios_workspace_idx" ON "Bios" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Bios_handle_idx" ON "Bios" ("handle");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Campaigns_workspace_idx" ON "Campaigns" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Campaigns_track_idx" ON "Campaigns" ("trackId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Campaigns_playlist_idx" ON "Campaigns" ("playlistId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EventReports_event_idx" ON "EventReports" ("eventId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Events_bio_idx" ON "Events" ("bioId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Events_bio_bioButton_idx" ON "Events" ("bioId","bioButtonId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Events_form_idx" ON "Events" ("formId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Events_link_idx" ON "Events" ("linkId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Events_visitorSession_idx" ON "Events" ("visitorSessionId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ExternalWebsite_workspace_idx" ON "ExternalWebsite" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Files_workspace_idx" ON "Files" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Forms_workspace_idx" ON "Forms" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_PlaylistsToGenres_genre_idx" ON "_Playlists_To_Genres" ("genreName");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_TracksToGenres_genre_idx" ON "_Tracks_To_Genres" ("genreId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Link_workspace_idx" ON "Links" ("workspaceId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Link_bioId_key" ON "Links" ("bioId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Link_appLinkId_key" ON "Links" ("appLinkId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Link_id_app_key" ON "Links" ("id","appId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Link_handle_domain_app_slug_key" ON "Links" ("handle","domain","appId","slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Link_socialForTeamId_appId_key" ON "Links" ("socialForTeamId","appId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PlaylistCoverRenders_workspace_idx" ON "PlaylistCoverRenders" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PlaylistCoverRenders_playlist_idx" ON "PlaylistCoverRenders" ("playlistId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PlaylistPitchReviews_campaign_idx" ON "PlaylistPitchReviews" ("campaignId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PlaylistPitchReviews_reviewer_idx" ON "PlaylistPitchReviews" ("reviewerId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PlaylistPlacements_pitchReview_idx" ON "PlaylistPlacements" ("pitchReviewId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Playlists_workspace_idx" ON "Playlists" ("workspaceId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ProviderAccounts_provider_providerAccountId_idx" ON "ProviderAccounts" ("provider","providerAccountId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ProviderAccounts_workspace_idx" ON "ProviderAccounts" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ProviderSubAccounts_parentAccount_idx" ON "ProviderSubAccounts" ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ProviderSubAccounts_type_accountId_idx" ON "ProviderSubAccounts" ("type","providerId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ProviderSubAccounts_workspace_idx" ON "ProviderSubAccounts" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Stat_adId_idx" ON "Stats" ("adId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Stat_accountId_idx" ON "Stats" ("providerAccountId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Stat_playlistId_idx" ON "Stats" ("playlistId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Stat_trackId_idx" ON "Stats" ("trackId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "TrackRenders_workspace_idx" ON "TrackRenders" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "TrackRenders_track_idx" ON "TrackRenders" ("trackId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Tracks_workspaceId_key" ON "Tracks" ("workspaceId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Tracks_workspace_trackName_key" ON "Tracks" ("workspaceId","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "LineItems_campaign_idx" ON "TransactionLineItems" ("campaignId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Transactions_workspace_idx" ON "Transactions" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Transactions_createdBy_idx" ON "Transactions" ("createdById");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Users_email_key" ON "Users" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Users_phone_key" ON "Users" ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Users_personalWorkspaceId_key" ON "Users" ("personalWorkspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "VidRenders_workspace_idx" ON "VidRenders" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "VidRenders_createdBy_idx" ON "VidRenders" ("createdById");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "VidRenders_trackRender_idx" ON "VidRenders" ("trackRenderId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "VidRenders_parentVid_idx" ON "VidRenders" ("parentVidId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "VidRenders_adCampaign_idx" ON "VidRenders" ("adCampaignId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "VisitorSessions_externalWebsite_idx" ON "VisitorSessions" ("externalWebsiteId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Workspaces_handle_key" ON "Workspaces" ("handle");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Workspaces_spotifyArtistId_key" ON "Workspaces" ("spotifyArtistId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AdCampaigns" ADD CONSTRAINT "AdCampaigns_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AdCreatives" ADD CONSTRAINT "AdCreatives_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AdSetCloneRecords" ADD CONSTRAINT "AdSetCloneRecords_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AdSetUpdateRecords" ADD CONSTRAINT "AdSetUpdateRecords_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AdSets" ADD CONSTRAINT "AdSets_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Ads" ADD CONSTRAINT "Ads_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Ads" ADD CONSTRAINT "Ads_adSetId_AdSets_id_fk" FOREIGN KEY ("adSetId") REFERENCES "AdSets"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Ads" ADD CONSTRAINT "Ads_adCreativeId_AdCreatives_id_fk" FOREIGN KEY ("adCreativeId") REFERENCES "AdCreatives"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AnalyticsEndpoints" ADD CONSTRAINT "AnalyticsEndpoints_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AudienceDemos" ADD CONSTRAINT "AudienceDemos_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AudienceGeoGroups" ADD CONSTRAINT "AudienceGeoGroups_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AudienceInterestGroups" ADD CONSTRAINT "AudienceInterestGroups_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AudienceVidViewsGroups" ADD CONSTRAINT "AudienceVidViewsGroups_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Audiences" ADD CONSTRAINT "Audiences_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BioButtons" ADD CONSTRAINT "BioButtons_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BioButtons" ADD CONSTRAINT "BioButtons_linkId_Links_id_fk" FOREIGN KEY ("linkId") REFERENCES "Links"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BioButtons" ADD CONSTRAINT "BioButtons_formId_Forms_id_fk" FOREIGN KEY ("formId") REFERENCES "Forms"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Bios" ADD CONSTRAINT "Bios_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Bios" ADD CONSTRAINT "Bios_handle_Workspaces_handle_fk" FOREIGN KEY ("handle") REFERENCES "Workspaces"("handle") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CampaignUpdateRecords" ADD CONSTRAINT "CampaignUpdateRecords_campaignId_Campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "Campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CampaignUpdateRecords" ADD CONSTRAINT "CampaignUpdateRecords_creatorId_Users_id_fk" FOREIGN KEY ("creatorId") REFERENCES "Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Campaigns" ADD CONSTRAINT "Campaigns_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ExternalWebsite" ADD CONSTRAINT "ExternalWebsite_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Files" ADD CONSTRAINT "Files_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormResponses" ADD CONSTRAINT "FormResponses_formId_Forms_id_fk" FOREIGN KEY ("formId") REFERENCES "Forms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Forms" ADD CONSTRAINT "Forms_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Playlists_To_Genres" ADD CONSTRAINT "_Playlists_To_Genres_playlistId_Playlists_id_fk" FOREIGN KEY ("playlistId") REFERENCES "Playlists"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Playlists_To_Genres" ADD CONSTRAINT "_Playlists_To_Genres_genreName_Genres_id_fk" FOREIGN KEY ("genreName") REFERENCES "Genres"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Tracks_To_Genres" ADD CONSTRAINT "_Tracks_To_Genres_trackId_Tracks_id_fk" FOREIGN KEY ("trackId") REFERENCES "Tracks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Tracks_To_Genres" ADD CONSTRAINT "_Tracks_To_Genres_genreId_Genres_id_fk" FOREIGN KEY ("genreId") REFERENCES "Genres"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Links" ADD CONSTRAINT "Links_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PlaylistCoverRenders" ADD CONSTRAINT "PlaylistCoverRenders_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PlaylistPlacements" ADD CONSTRAINT "PlaylistPlacements_trackId_Tracks_id_fk" FOREIGN KEY ("trackId") REFERENCES "Tracks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PlaylistPlacements" ADD CONSTRAINT "PlaylistPlacements_playlistId_Playlists_id_fk" FOREIGN KEY ("playlistId") REFERENCES "Playlists"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_curatorId_Users_id_fk" FOREIGN KEY ("curatorId") REFERENCES "Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_coverId_Files_id_fk" FOREIGN KEY ("coverId") REFERENCES "Files"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_spotifyLinkId_Links_id_fk" FOREIGN KEY ("spotifyLinkId") REFERENCES "Links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_appleMusicLinkId_Links_id_fk" FOREIGN KEY ("appleMusicLinkId") REFERENCES "Links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_deezerLinkId_Links_id_fk" FOREIGN KEY ("deezerLinkId") REFERENCES "Links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_soundCloudLinkId_Links_id_fk" FOREIGN KEY ("soundCloudLinkId") REFERENCES "Links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_tidalLinkId_Links_id_fk" FOREIGN KEY ("tidalLinkId") REFERENCES "Links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_youtubeLinkId_Links_id_fk" FOREIGN KEY ("youtubeLinkId") REFERENCES "Links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProviderAccounts" ADD CONSTRAINT "ProviderAccounts_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProviderAccounts" ADD CONSTRAINT "ProviderAccounts_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProviderSubAccounts" ADD CONSTRAINT "ProviderSubAccounts_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProviderSubAccounts" ADD CONSTRAINT "ProviderSubAccounts_userId_Workspaces_id_fk" FOREIGN KEY ("userId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Stats" ADD CONSTRAINT "Stats_playlistId_Playlists_id_fk" FOREIGN KEY ("playlistId") REFERENCES "Playlists"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Stats" ADD CONSTRAINT "Stats_trackId_Tracks_id_fk" FOREIGN KEY ("trackId") REFERENCES "Tracks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TrackRenders" ADD CONSTRAINT "TrackRenders_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Tracks" ADD CONSTRAINT "Tracks_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TransactionLineItems" ADD CONSTRAINT "TransactionLineItems_transactionId_Transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "Transactions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSessions" ADD CONSTRAINT "UserSessions_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Users" ADD CONSTRAINT "Users_personalWorkspaceId_Workspaces_id_fk" FOREIGN KEY ("personalWorkspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Users" ADD CONSTRAINT "Users_handle_Workspaces_handle_fk" FOREIGN KEY ("handle") REFERENCES "Workspaces"("handle") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Users" ADD CONSTRAINT "Users_image_Workspaces_imageUrl_fk" FOREIGN KEY ("image") REFERENCES "Workspaces"("imageUrl") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Users_To_Workspaces" ADD CONSTRAINT "_Users_To_Workspaces_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_Users_To_Workspaces" ADD CONSTRAINT "_Users_To_Workspaces_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "VidRenders" ADD CONSTRAINT "VidRenders_workspaceId_Workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
