import type { ColumnType } from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;
export type UserType =
	| 'label'
	| 'artist'
	| 'manager'
	| 'creator'
	| 'influencer'
	| 'marketer';
export type TeamType = 'artist' | 'creator' | 'influencer' | 'product';
export type TeamRoleOption = 'owner' | 'admin' | 'member';
export type OrganizationType = 'label' | 'agency';
export type OrganizationRoleOption = 'admin' | 'member';
export type AccountPlatform =
	| 'discord'
	| 'facebook'
	| 'facebookPage'
	| 'github'
	| 'google'
	| 'metaAd'
	| 'metaBusiness'
	| 'spotify'
	| 'tiktok'
	| 'twitch'
	| 'twitter'
	| 'whatsapp';
export type OAuthProvider = 'discord' | 'facebook' | 'google' | 'spotify' | 'tiktok';
export type AppType =
	| 'appleMusic'
	| 'email'
	| 'facebook'
	| 'instagram'
	| 'patreon'
	| 'snapchat'
	| 'spotify'
	| 'tiktok'
	| 'twitch'
	| 'twitter'
	| 'web'
	| 'whatsapp'
	| 'youtube';
export type LinkDomain = 'barely' | 'brl';
export type AnalyticsPlatform = 'meta' | 'google' | 'tiktok' | 'snapchat';
export type BioTheme = 'light' | 'dark' | 'app';
export type BioImgShape = 'square' | 'circle' | 'rounded';
export type FormPlatform = 'bio' | 'meta';
export type CampaignType =
	| 'playlistPitch'
	| 'fbSpark'
	| 'igSpark'
	| 'tiktokSpark'
	| 'playlistSpark'
	| 'gigSpark'
	| 'fbCharge'
	| 'igCharge'
	| 'spotifyCharge';
export type CampaignStage =
	| 'screening'
	| 'rejected'
	| 'approved'
	| 'queuedForTesting'
	| 'errorInTestingQueue'
	| 'testing'
	| 'testingComplete'
	| 'running'
	| 'paused'
	| 'complete';
export type CampaignRejectReason =
	| 'spam'
	| 'genreFit'
	| 'energyFit'
	| 'writingFit'
	| 'qualityFit';
export type PitchReviewStage = 'reviewing' | 'placed' | 'rejected' | 'expired';
export type AdStatus = 'ACTIVE' | 'PAUSED' | 'ERROR';
export type Gender = 'male' | 'female' | 'all';
export type CountryColorCode = 'red' | 'orange' | 'yellow' | 'green';
export type VidViewsMetric = 'view_1s' | 'view_15s' | 'view_60s';
export type EngagementRetention = 'day_1' | 'day_3' | 'day_7' | 'day_30' | 'day_365';
export type EventType =
	| 'pageView'
	| 'linkClick'
	| 'formOpen'
	| 'formSubmit'
	| 'presaveSpotifyOpen'
	| 'presaveSpotifyComplete';
export type StreamingPlatform = 'appleMusic' | 'spotify' | 'youtube';
export type FileType = 'audio' | 'video' | 'image';
export type FileExtension = 'mp3' | 'wav' | 'jpg' | 'png' | 'mp4' | 'mov';
export type RenderStatus = 'queued' | 'rendering' | 'failed' | 'complete';
export type SubscriptionType = 'campaignMaintenance' | 'links';
export type PaymentType = 'oneTime' | 'subscription';
export type TransactionStatus = 'created' | 'pending' | 'succeeded' | 'failed';
export type Account = {
	id: string;
	userId: string;
	type: string;
	platform: AccountPlatform | null;
	provider: OAuthProvider | null;
	providerAccountId: string | null;
	refresh_token: string | null;
	access_token: string | null;
	expires_at: number | null;
	token_type: string | null;
	scope: string | null;
	id_token: string | null;
	session_state: string | null;
	username: string | null;
	email: string | null;
	image: string | null;
	parentAccountId: string | null;
	teamId: string | null;
	defaultForTeamId: string | null;
};
export type Ad = {
	id: string;
	createdAt: Generated<Timestamp>;
	adSetId: string;
	metaId: string | null;
	tiktokId: string | null;
	creativeId: string;
	status: AdStatus;
	passedTest: boolean | null;
};
export type AdCampaign = {
	id: string;
	name: string;
	createdAt: Generated<Timestamp>;
	campaignId: string;
	startDate: Timestamp;
	endDate: Timestamp | null;
	metaAdAccountId: string;
	tiktokAdAccountId: string;
	metaId: string | null;
	tiktokId: string | null;
	metaDailyBudget: number | null;
	tiktokDailyBudget: number | null;
	totalLifetimeBudget: number | null;
	metaLifetimeBudget: number | null;
	tiktokLifetimeBudget: number | null;
	metaTriggerFraction: number | null;
	tiktokTriggerFraction: number | null;
	splitTestDemos: Generated<boolean>;
	splitTestGeoGroups: Generated<boolean>;
	splitTestInterestGroups: Generated<boolean>;
	status: AdStatus;
};
export type AdCreative = {
	id: string;
	name: string;
	createdAt: Generated<Timestamp>;
	teamId: string;
	metaAccountId: string;
	tiktokAccountId: string | null;
	metaId: string | null;
	metaPostId: string | null;
	tiktokId: string | null;
	headlineId: string | null;
	callToActionType: string | null;
	linkId: string;
	linkCaption: string | null;
	urlTags: string | null;
};
export type AdSet = {
	id: string;
	createdAt: Generated<Timestamp>;
	adCampaignId: string;
	audienceId: string;
	metaId: string | null;
	tiktokId: string | null;
	fbFeed: boolean;
	fbVideoFeeds: boolean;
	fbMarketplace: boolean;
	fbStories: boolean;
	igFeed: boolean;
	igStories: boolean;
	igReels: boolean;
	tiktokFeed: boolean;
	metaStatus: AdStatus;
	tiktokStatus: AdStatus;
};
export type AdSetCloneRecord = {
	id: string;
	createdAt: Generated<Timestamp>;
	parentAdSetId: string;
	meta: boolean;
	metaComplete: boolean;
	tiktok: boolean;
	tiktokComplete: boolean;
	status: AdStatus;
	dailyBudget: number | null;
	audienceId: string | null;
	childAdSetId: string | null;
};
export type AdSetUpdateRecord = {
	id: string;
	createdAt: Generated<Timestamp>;
	adSetId: string;
	metaComplete: boolean | null;
	tiktokComplete: boolean | null;
	status: AdStatus;
	dailyBudget: number | null;
	audienceId: string | null;
};
export type AnalyticsEndpoint = {
	id: string;
	teamId: string;
	platform: AnalyticsPlatform;
	accessToken: string | null;
};
export type Audience = {
	id: string;
	createdAt: Generated<Timestamp>;
	name: string | null;
	teamId: string;
	demoId: string;
	metaId: string | null;
	metaAudienceLowerBound: number | null;
	metaAudienceUpperBound: number | null;
	tiktokId: string | null;
};
export type Bio = {
	id: string;
	createdAt: Generated<Timestamp>;
	teamId: string;
	rootForTeamId: string | null;
	handle: string;
	route: string | null;
	slug: string | null;
	img: string | null;
	imgShape: BioImgShape | null;
	title: string | null;
	subtitle: string | null;
	titleColor: string | null;
	buttonColor: string | null;
	iconColor: string | null;
	textColor: string | null;
	socialDisplay: boolean;
	socialButtonColor: string | null;
	socialIconColor: string | null;
	theme: BioTheme;
	barelyBranding: Generated<boolean>;
};
export type BioButton = {
	bioId: string;
	buttonId: string;
	lexoRank: string;
	buttonLexoRank: string;
};
export type Button = {
	id: string;
	teamId: string;
	text: string | null;
	buttonColor: string | null;
	textColor: string | null;
	linkId: string | null;
	formId: string | null;
	email: string | null;
	phone: string | null;
};
export type Campaign = {
	id: string;
	createdAt: Generated<Timestamp>;
	type: CampaignType;
	stage: CampaignStage;
	endDate: Timestamp | null;
	createdById: string | null;
	trackId: string | null;
	playlistId: string | null;
	screeningMessage: string | null;
	curatorReach: number | null;
};
export type CampaignUpdateRecord = {
	id: string;
	createdAt: Generated<Timestamp>;
	createdById: string | null;
	campaignId: string;
	stage: CampaignStage | null;
	screeningMessage: string | null;
	curatorReach: number | null;
};
export type Country = {
	id: string;
	name: string;
	code: string;
	color: CountryColorCode;
	trigger: boolean;
	metaAudienceLowerBound: number | null;
	metaAudienceUpperBound: number | null;
};
export type Demo = {
	id: string;
	name: string;
	ageMin: Generated<number>;
	ageMax: number;
	gender: Gender;
	onlyEnglish: boolean;
	teamId: string | null;
	public: Generated<boolean>;
};
export type Epic = {
	id: string;
	createdAt: Generated<Timestamp>;
	name: string;
	description: string | null;
	targetStartDate: Timestamp | null;
	targetCompleteDate: Timestamp | null;
	startDate: Timestamp | null;
	color: string | null;
	complete: Generated<boolean | null>;
	lexoRank: string;
	createdById: string | null;
	assignedToId: string | null;
	teamId: string;
};
export type Event = {
	id: Generated<number>;
	type: EventType;
	createdAt: Generated<Timestamp>;
	linkId: string | null;
	bioId: string | null;
	buttonId: string | null;
	formId: string | null;
	sessionId: string;
};
export type EventReport = {
	createdAt: Generated<Timestamp>;
	eventId: number;
	analyticsPlatform: AnalyticsPlatform;
	analyticsId: string;
	error: string | null;
};
export type ExternalWebsite = {
	id: string;
	createdAt: Generated<Timestamp>;
	name: string;
	teamId: string | null;
};
export type File = {
	id: string;
	teamId: string;
	createdAt: Generated<Timestamp>;
	creatorId: string | null;
	type: FileType;
	name: string;
	extension: FileExtension;
	description: string | null;
	url: string;
	size: number;
	width: number | null;
	height: number | null;
	fps: number | null;
	duration: number | null;
	internal: boolean;
	metaId: string | null;
	vidForTrackId: string | null;
	thumbnailForId: string | null;
};
export type Form = {
	id: string;
	platform: FormPlatform;
	title: string | null;
	subtitle: string | null;
	messagePrompt: string | null;
	forwardingEmail: string;
	forwardingCc: string;
	inputName: boolean;
	inputEmail: boolean;
	inputPhone: boolean;
	inputMessage: boolean;
	teamId: string;
};
export type FormResponse = {
	id: string;
	createdAt: Generated<Timestamp>;
	formId: string;
	name: string | null;
	email: string | null;
	phone: string | null;
	message: string | null;
};
export type Genre = {
	name: string;
};
export type GeoGroup = {
	id: string;
	name: string;
	teamId: string | null;
	public: Generated<boolean>;
};
export type Headline = {
	id: string;
	createdAt: Generated<Timestamp>;
	headline: string;
};
export type Interest = {
	id: string;
	name: string;
	metaId: string;
	metaTopic: string;
	metaAudienceLowerBound: number;
	metaAudienceUpperBound: number;
};
export type InterestGroup = {
	id: string;
	name: string;
	teamId: string | null;
	public: Generated<boolean>;
};
export type LineItem = {
	id: string;
	name: string;
	description: string;
	campaignId: string | null;
	subscriptionId: string | null;
	paymentType: PaymentType;
	setupPrice: number | null;
	subscriptionPrice: number | null;
	subscriptionPriceDescription: string | null;
	maintenancePrice: string | null;
	maintenancePriceDescription: string | null;
	totalDue: number | null;
	transactionId: string | null;
};
export type Link = {
	id: string;
	createdAt: Generated<Timestamp>;
	teamId: Generated<string>;
	socialForTeamId: string | null;
	showSocialForTeam: Generated<boolean | null>;
	handle: string;
	domain: Generated<LinkDomain>;
	slug: string | null;
	app: AppType | null;
	appRoute: string | null;
	appId: string | null;
	url: string;
	appleScheme: string | null;
	androidScheme: string | null;
	ogTitle: string | null;
	ogDescription: string | null;
	ogImage: string | null;
	favicon: string | null;
	qrLight: Generated<string | null>;
	qrDark: Generated<string | null>;
	qrText: Generated<string | null>;
	qrLogo: string | null;
	playlistId: string | null;
	bioId: string | null;
	appLinkId: string | null;
	delete: Generated<boolean | null>;
};
export type Organization = {
	id: string;
	name: string;
	createdAt: Generated<Timestamp>;
};
export type OrganizationMember = {
	userId: string;
	orgId: string;
	role: Generated<OrganizationRoleOption>;
};
export type Playlist = {
	id: string;
	teamId: string | null;
	appleMusicId: string | null;
	appleMusicAccountId: string | null;
	deezerId: string | null;
	deezerAccountId: string | null;
	soundCloudId: string | null;
	soundCloudAccountId: string | null;
	spotifyId: string | null;
	spotifyAccountId: string | null;
	tidalId: string | null;
	tidalAccountId: string | null;
	youtubeId: string | null;
	youtubeAccountId: string | null;
	name: string;
	description: string | null;
	public: boolean;
	userOwned: boolean;
	totalTracks: number | null;
	tracklist: unknown | null;
	forTesting: boolean;
	coverId: string | null;
	imageUrl: string | null;
	linkId: string | null;
	cloneParentId: string | null;
};
export type PlaylistCoverRender = {
	id: string;
	name: string | null;
	createdById: string | null;
	teamId: string;
	img: boolean;
	imgSrc: string;
	imgShift: boolean;
	imgShiftX: number;
	imgShiftY: number;
	imgScale: number;
	text: boolean;
	textColor: Generated<string>;
	textScale: Generated<number>;
	textAlign: Generated<string>;
	textShiftX: Generated<number>;
	textShiftY: Generated<number>;
	logo: boolean;
	logoColor: Generated<string>;
	renderedCoverId: string | null;
	playlistId: string;
	renderedPlaylistCoverId: string | null;
	userId: string | null;
};
export type PlaylistGenre = {
	playlistId: string;
	genreName: string;
};
export type PlaylistPitchReview = {
	id: string;
	createdAt: Generated<Timestamp>;
	campaignId: string | null;
	reviewerId: string | null;
	stage: PitchReviewStage;
	expiresAt: Timestamp;
	review: string;
	rating: number;
	rejectReason: string | null;
};
export type PlaylistPlacement = {
	id: string;
	trackId: string;
	pitchReviewId: string | null;
	playlistId: string;
	playlistPosition: number | null;
	addDate: Generated<Timestamp | null>;
	daysInPlaylist: number | null;
	removeDate: Timestamp | null;
	addedToPlaylist: Generated<boolean>;
	removedFromPlaylist: Generated<boolean>;
};
export type Stat = {
	id: string;
	date: Timestamp;
	listeners: number | null;
	streams: number | null;
	likes: number | null;
	saves: number | null;
	followers: number | null;
	newFollowers: number | null;
	spend: number | null;
	clicks: number | null;
	impressions: number | null;
	views: number | null;
	watch25: number | null;
	watch50: number | null;
	watch75: number | null;
	watch95: number | null;
	watch100: number | null;
	watch60s: number | null;
	adId: string | null;
	accountId: string | null;
	playlistId: string | null;
	trackId: string | null;
	streamingPlatform: StreamingPlatform | null;
};
export type Story = {
	id: string;
	createdAt: Generated<Timestamp>;
	name: string | null;
	description: string | null;
	dueDate: Timestamp | null;
	lexoRank: string;
	priority: string | null;
	createdById: string | null;
	assignedToId: string | null;
	epicId: string | null;
	columnId: string;
};
export type StoryBoard = {
	id: string;
	name: string;
	createdAt: Generated<Timestamp>;
	createdById: string | null;
	color: string | null;
	teamId: string;
};
export type StoryColumn = {
	id: string;
	name: string;
	boardId: string;
	lexoRank: string;
};
export type StoryUpdateRecord = {
	id: string;
	createdAt: Generated<Timestamp>;
	storyId: string;
	prevColumnId: string | null;
	newColumnId: string | null;
};
export type Subscription = {
	id: string;
	type: SubscriptionType;
};
export type Task = {
	id: string;
	createdAt: Generated<Timestamp>;
	name: string;
	description: string | null;
	dueDate: Timestamp | null;
	lexoRank: string;
	priority: string | null;
	today: boolean;
	complete: boolean;
	teamId: string | null;
	createdById: string | null;
	assignedToId: string | null;
	storyId: string | null;
	delete: boolean;
	deleteDate: Timestamp | null;
};
export type Team = {
	id: string;
	name: string;
	handle: string;
	createdAt: Generated<Timestamp>;
	spotifyArtistId: string | null;
};
export type TeamMember = {
	userId: string;
	teamId: string;
	role: Generated<TeamRoleOption>;
};
export type Track = {
	id: string;
	name: string;
	teamId: string;
	isrc: string | null;
	appleMusicId: string | null;
	deezerId: string | null;
	soundcloudId: string | null;
	spotifyId: string | null;
	tidalId: string | null;
	youtubeId: string | null;
	imageUrl: string | null;
	released: boolean;
	releaseDate: Timestamp | null;
	masterMp3Id: string | null;
	masterWavId: string | null;
	appleMusicLinkId: string | null;
	deezerLinkId: string | null;
	soundcloudLinkId: string | null;
	spotifyLinkId: string | null;
	tidalLinkId: string | null;
	youtubeLinkId: string | null;
};
export type TrackGenre = {
	trackId: string;
	genreName: string;
};
export type TrackRender = {
	id: string;
	createdById: string | null;
	teamId: string;
	trackId: string;
	trackTrimIn: number;
};
export type Transaction = {
	id: string;
	createdAt: Generated<Timestamp>;
	completedAt: Timestamp | null;
	type: string | null;
	amount: number;
	description: string | null;
	status: TransactionStatus;
	stripeId: string | null;
	stripeClientSecret: string | null;
	stripeMetadata: unknown | null;
	stripeLiveMode: Generated<boolean>;
	checkoutLink: string | null;
	userId: string | null;
};
export type User = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	fullName: string | null;
	username: string | null;
	email: string;
	emailVerified: Timestamp | null;
	phone: string | null;
	phoneVerified: Timestamp | null;
	image: string | null;
	type: UserType;
	marketing: Generated<boolean>;
	stripeId: string | null;
	pitchScreening: Generated<boolean | null>;
	pitchReviewing: Generated<boolean | null>;
};
export type VerificationToken = {
	identifier: string;
	token: string;
	expires: Timestamp;
};
export type VidRender = {
	id: string;
	createdById: string | null;
	teamId: string;
	renderStatus: RenderStatus;
	renderFailedError: string | null;
	renderedVidId: string;
	parentVidId: string;
	compName: string;
	compWidth: number;
	compHeight: number;
	compDuration: number;
	trim: boolean;
	trimIn: number;
	trimOut: number;
	shift: boolean;
	shiftX: number;
	shiftY: number;
	playbackSpeed: number;
	addTrack: boolean;
	trackRenderId: string;
	addPlaylistTitle: boolean;
	playlistTitle: string | null;
	lambdaRenderId: string;
	lambdaBucket: string;
	lambdaFunction: string;
	lambdaRegion: string;
	adCampaignId: string | null;
};
export type VidViewsGroup = {
	id: string;
	name: string;
	metric: VidViewsMetric;
	retention: EngagementRetention;
	metaId: string;
	metaName: string;
	metaAudienceLowerBound: number;
	metaAudienceUpperBound: number;
	tiktokId: string;
	tiktokName: string;
	teamId: string | null;
};
export type VisitorSession = {
	id: string;
	createdAt: Generated<Timestamp>;
	externalWebsiteId: string | null;
	browserName: string | null;
	browserVersion: string | null;
	cpu: string | null;
	deviceModel: string | null;
	deviceType: string | null;
	deviceVendor: string | null;
	ip: string | null;
	isBot: boolean | null;
	osName: string | null;
	osVersion: string | null;
	referrer: string | null;
	ua: string | null;
	city: string | null;
	country: string | null;
	latitude: string | null;
	longitude: string | null;
	region: string | null;
};
export type DB = {
	Account: Account;
	Ad: Ad;
	AdCampaign: AdCampaign;
	AdCreative: AdCreative;
	AdSet: AdSet;
	AdSetCloneRecord: AdSetCloneRecord;
	AdSetUpdateRecord: AdSetUpdateRecord;
	AnalyticsEndpoint: AnalyticsEndpoint;
	Audience: Audience;
	Bio: Bio;
	BioButton: BioButton;
	Button: Button;
	Campaign: Campaign;
	CampaignUpdateRecord: CampaignUpdateRecord;
	Country: Country;
	Demo: Demo;
	Epic: Epic;
	Event: Event;
	EventReport: EventReport;
	ExternalWebsite: ExternalWebsite;
	File: File;
	Form: Form;
	FormResponse: FormResponse;
	Genre: Genre;
	GeoGroup: GeoGroup;
	Headline: Headline;
	Interest: Interest;
	InterestGroup: InterestGroup;
	LineItem: LineItem;
	Link: Link;
	Organization: Organization;
	OrganizationMember: OrganizationMember;
	Playlist: Playlist;
	PlaylistCoverRender: PlaylistCoverRender;
	PlaylistGenre: PlaylistGenre;
	PlaylistPitchReview: PlaylistPitchReview;
	PlaylistPlacement: PlaylistPlacement;
	Stat: Stat;
	Story: Story;
	StoryBoard: StoryBoard;
	StoryColumn: StoryColumn;
	StoryUpdateRecord: StoryUpdateRecord;
	Subscription: Subscription;
	Task: Task;
	Team: Team;
	TeamMember: TeamMember;
	Track: Track;
	TrackGenre: TrackGenre;
	TrackRender: TrackRender;
	Transaction: Transaction;
	User: User;
	VerificationToken: VerificationToken;
	VidRender: VidRender;
	VidViewsGroup: VidViewsGroup;
	VisitorSession: VisitorSession;
};
