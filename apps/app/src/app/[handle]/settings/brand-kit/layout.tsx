import { getAllFontClassNames } from '~/lib/fonts';

export default function BrandKitLayout({ children }: { children: React.ReactNode }) {
	// Load all fonts for brand kit page where users can choose from all options
	const allFontClasses = getAllFontClassNames();

	return <div className={allFontClasses}>{children}</div>;
}
