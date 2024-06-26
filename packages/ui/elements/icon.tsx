import type { LucideIcon } from 'lucide-react';
import type { IconType as ReactIcon } from 'react-icons/lib';
import { cn } from '@barely/lib/utils/cn';
import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	EyeDropperIcon,
	InformationCircleIcon,
	SparklesIcon,
	XCircleIcon,
} from '@heroicons/react/24/solid';
import {
	ArrowFatDown,
	ArrowFatLeft,
	ArrowFatRight,
	ArrowFatUp,
	BracketsAngle,
	CalendarBlank,
	CashRegister,
	CassetteTape,
	Disc,
	Hoodie,
	MetaLogo,
	PlayCircle,
	Plugs,
	ShoppingCart,
	TShirt,
	Video,
	VinylRecord,
} from '@phosphor-icons/react/dist/ssr';
import {
	AlertCircle,
	AlertTriangle,
	AlignCenter,
	AlignCenterHorizontal,
	AlignCenterVertical,
	AlignEndHorizontal,
	AlignEndVertical,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Archive,
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	Atom,
	AtSign,
	Banknote,
	BarChart,
	Bell,
	Binary,
	Blocks,
	Bold,
	Bot,
	Check,
	CheckCircle,
	CheckSquare,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsUpDown,
	ChevronUp,
	CircleUserRound,
	Clipboard,
	ClipboardCheck,
	Code,
	Code2,
	Coins,
	Copy,
	Copyleft,
	Copyright,
	CreditCard,
	Crop,
	Database,
	DollarSign,
	Download,
	Edit,
	ExternalLink,
	File,
	FileAudio,
	FileText,
	FileVideo,
	Filter,
	Flame,
	FlaskConical,
	FlipHorizontal,
	FlipVertical,
	Focus,
	FormInput,
	Gamepad,
	Gauge,
	Ghost,
	Globe,
	GripVertical,
	Hammer,
	Hash,
	Headphones,
	Heart,
	HelpCircle,
	Home,
	ImageIcon,
	Import,
	Infinity as InfinityIcon,
	Italic,
	Joystick,
	KanbanSquare,
	LandPlot,
	Laptop,
	LineChart,
	Linkedin,
	Link as LinkIcon,
	ListMusic,
	Loader2,
	Lock,
	Magnet,
	Megaphone,
	Menu,
	MessageSquare,
	Moon,
	MoreHorizontal,
	MoreVertical,
	Mountain,
	Music,
	Newspaper,
	Palette,
	PartyPopper,
	Pause,
	Phone,
	PieChart,
	PiggyBank,
	Pizza,
	Play,
	Plus,
	PlusCircle,
	QrCode,
	Radio,
	RadioTower,
	RectangleHorizontal,
	RectangleVertical,
	Redo,
	RefreshCcw,
	Rocket,
	Save,
	ScanBarcode,
	Search,
	Settings,
	Share2,
	ShieldCheck,
	// ShoppingCart,
	Shuffle,
	SkipBack,
	SkipForward,
	Sliders,
	Square,
	Star,
	StarHalf,
	StickyNote,
	Sun,
	Tablet,
	Tag,
	Tags,
	Target,
	Terminal,
	ThumbsDown,
	ThumbsUp,
	Trash,
	Triangle,
	Tv,
	UploadCloud,
	User,
	UserCircle2,
	UserPlus,
	Users,
	Verified,
	// Video,
	VolumeX,
	Wand2,
	Watch,
	Wrench,
	X,
	XCircle,
	Zap,
	ZoomIn,
	ZoomOut,
} from 'lucide-react';
import {
	FaFacebook,
	FaGithub,
	FaInstagram,
	FaSpotify,
	FaTiktok,
	FaTwitch,
	FaTwitter,
	FaYoutube,
} from 'react-icons/fa';

import { BlurImage } from './blur-image';
import { Apple, Chrome, Safari } from './icon.devices';
import { Logo } from './logo';

export const Icon = {
	add: Plus,
	alert: AlertCircle,
	alertFilled: ExclamationCircleIcon,
	alignCenterHorizontal: AlignCenterHorizontal,
	alignCenterVertical: AlignCenterVertical,
	alignCenter: AlignCenter,
	alignEndHorizontal: AlignEndHorizontal,
	alignEndVertical: AlignEndVertical,
	alignJustify: AlignJustify,
	alignLeft: AlignLeft,
	alignRight: AlignRight,
	apple: Apple,
	apps: Blocks,
	archive: Archive,
	arrowLeft: ArrowLeft,
	arrowRight: ArrowRight,
	arrowDown: ArrowDown,
	arrowUp: ArrowUp,
	arrowBigLeft: ArrowFatLeft,
	arrowBigRight: ArrowFatRight,
	arrowBigUp: ArrowFatUp,
	arrowBigDown: ArrowFatDown,
	at: AtSign,
	atom: Atom,

	bell: Bell,
	billing: CreditCard,
	binary: Binary,
	bio: UserCircle2,
	bold: Bold,
	bot: Bot,
	broadcast: Radio,

	calendar: CalendarBlank,
	cart: ShoppingCart,
	cartFunnel: ShoppingCart,
	cashRegister: CashRegister,
	cassette: CassetteTape,
	cd: Disc,
	chart: LineChart,
	check: Check,
	checkCircle: CheckCircle,
	checkCircleFilled: CheckCircleIcon,
	checked: CheckSquare,
	chevronUp: ChevronUp,
	chevronDown: ChevronDown,
	chevronLeft: ChevronLeft,
	chevronRight: ChevronRight,
	chevronsUpDown: ChevronsUpDown,
	chrome: Chrome,
	connect: Plugs,
	copy: Copy,
	clipboard: Clipboard,
	clipboardCopied: ClipboardCheck,
	close: X,
	code: Code,
	codeClosed: Code2,
	coins: Coins,
	copyleft: Copyleft,
	copyright: Copyright,
	creditCard: CreditCard,
	crop: Crop,

	database: Database,
	delete: Trash,
	dollar: DollarSign,
	domain: Globe,
	dots: MoreHorizontal,
	dotsVertical: MoreVertical,
	download: Download,

	edit: Edit,
	ellipsis: MoreVertical,
	externalLink: ExternalLink,
	eyeDropper: EyeDropperIcon,

	file: File,
	fileAudio: FileAudio,
	fileVideo: FileVideo,
	filter: Filter,
	fingerprint: Verified,
	flame: Flame,
	flipHorizontal: FlipHorizontal,
	flipVertical: FlipVertical,
	fm: RadioTower,
	fmPage: RadioTower,
	focus: Focus,
	formInput: FormInput,
	funnel: Filter,

	gamepad: Gamepad,
	gauge: Gauge,
	ghost: Ghost,
	globe: Globe,
	grip: GripVertical,

	hammer: Hammer,
	hash: Hash,
	headphones: Headphones,
	heart: Heart,
	help: HelpCircle,
	home: Home,
	hoodie: Hoodie,

	image: ImageIcon,
	import: Import,
	info: InformationCircleIcon,
	infinity: InfinityIcon,
	integrations: Blocks,
	italic: Italic,

	joystick: Joystick,

	kanban: KanbanSquare,

	landingPage: LandPlot,
	laptop: Laptop,
	link: LinkIcon,
	linkedin: Linkedin,
	lineChart: LineChart,
	loader: Loader2,
	lock: Lock,
	logo: Logo,

	magic: SparklesIcon,
	magnet: Magnet,
	media: FileVideo,
	megaphone: Megaphone,
	meta: MetaLogo,
	menu: Menu,
	message: MessageSquare,
	mixtape: CassetteTape,
	money: Banknote,
	moon: Moon,
	more: MoreHorizontal,
	moreVertical: MoreVertical,
	mountain: Mountain,
	music: Music,
	mute: VolumeX,

	newspaper: Newspaper,

	orders: CashRegister,

	page: File,
	palette: Palette,
	party: PartyPopper,
	pause: Pause,
	payouts: PiggyBank,
	phone: Phone,
	photo: ImageIcon,
	pieChart: PieChart,
	play: Play,
	playCircle: PlayCircle,
	pizza: Pizza,
	playlist: ListMusic,
	plus: Plus,
	plusCircle: PlusCircle,
	post: FileText,
	press: Newspaper,
	pressKit: Newspaper,
	profile: CircleUserRound,
	product: ScanBarcode,

	qr: QrCode,

	radio: Radio,
	rectangleHorizontal: RectangleHorizontal,
	rectangleVertical: RectangleVertical,
	redo: Redo,
	remarketing: BracketsAngle,
	refresh: RefreshCcw,
	rocket: Rocket,

	safari: Safari,
	save: Save,
	search: Search,
	settings: Settings,
	share: Share2,
	shield: ShieldCheck,
	shuffle: Shuffle,
	// slash:
	skipBackward: SkipBack,
	skipForward: SkipForward,
	sliders: Sliders,
	social: Share2,
	socials: ExternalLink,
	spark: Zap,
	spinner: Loader2,
	square: Square,
	star: Star,
	starHalf: StarHalf,
	stat: BarChart,
	stickyNote: StickyNote,
	sun: Sun,
	sweatshirt: Hoodie,

	tablet: Tablet,
	tag: Tag,
	tags: Tags,
	target: Target,
	terminal: Terminal,
	test: FlaskConical,
	thumbsUp: ThumbsUp,
	thumbsDown: ThumbsDown,
	track: Music,
	trash: Trash,
	triangle: Triangle,
	tshirt: TShirt,
	tv: Tv,

	upload: UploadCloud,
	user: User,
	userPlus: UserPlus,
	users: Users,

	verified: Verified,

	video: Video,
	vinyl: VinylRecord,

	wand: Wand2,
	warning: AlertTriangle,
	watch: Watch,
	workflow: Zap,
	wrench: Wrench,

	x: X,
	xCircle: XCircle,
	xCircleFilled: XCircleIcon,

	zap: Zap,
	zoomIn: ZoomIn,
	zoomOut: ZoomOut,

	facebook: FaFacebook,
	gitHub: FaGithub,
	instagram: FaInstagram,
	spotify: FaSpotify,
	tiktok: FaTiktok,
	twitter: FaTwitter,
	twitch: FaTwitch,
	youtube: FaYoutube,
};

export type IconType = LucideIcon | ReactIcon;

export type IconSelection = keyof typeof Icon;

export function DeviceIcon({
	display,
	className,
}: {
	display: string;
	className: string;
}) {
	return (
		<BlurImage
			src={
				display === 'Desktop' ?
					`https://faisalman.github.io/ua-parser-js/images/types/default.png`
				:	`https://faisalman.github.io/ua-parser-js/images/types/${display.toLowerCase()}.png`
			}
			alt={display}
			width={20}
			height={20}
			sizes='10vw'
			className={className}
		/>
	);
}

export function BrowserIcon({
	display,
	className,
}: {
	display: string;
	className: string;
}) {
	if (display === 'Chrome') {
		return <Icon.chrome className={className} />;
	} else if (display === 'Safari' || display === 'Mobile Safari') {
		return <Icon.safari className={className} />;
	} else {
		return (
			<BlurImage
				src={`https://faisalman.github.io/ua-parser-js/images/browsers/${display.toLowerCase()}.png`}
				alt={display}
				width={20}
				height={20}
				className={className}
			/>
		);
	}
}

export function OSIcon({ display, className }: { display: string; className: string }) {
	if (display === 'Mac OS') {
		return (
			<BlurImage
				src='/_static/icons/macos.png'
				alt={display}
				width={20}
				height={20}
				className={cn('h-4 w-4', className)}
			/>
		);
	} else if (display === 'iOS') {
		return <Icon.apple className={cn('-ml-1 h-5 w-5', className)} />;
	} else {
		return (
			<BlurImage
				src={`https://faisalman.github.io/ua-parser-js/images/os/${display.toLowerCase()}.png`}
				alt={display}
				width={30}
				height={30}
				className={className}
			/>
		);
	}
}

export function ChevronRightToArrow({ className }: { className?: string }) {
	return (
		<div className='group relative flex items-center'>
			<svg
				className={cn(
					'absolute h-5 w-5 transition-all group-hover:translate-x-1 group-hover:opacity-0',
					className,
				)}
				xmlns='http://www.w3.org/2000/svg'
				fill='currentColor'
				viewBox='0 0 16 16'
				width='16'
				height='16'
			>
				<path
					fillRule='evenodd'
					d='M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z'
				></path>
			</svg>
			<svg
				className={cn(
					'absolute h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100',
					className,
				)}
				xmlns='http://www.w3.org/2000/svg'
				fill='currentColor'
				viewBox='0 0 16 16'
				width='16'
				height='16'
			>
				<path
					fillRule='evenodd'
					d='M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z'
				></path>
			</svg>
		</div>
	);
}
