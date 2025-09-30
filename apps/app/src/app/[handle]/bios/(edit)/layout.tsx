import { AppBioRender } from '~/app/[handle]/bios/_components/app-bio-render';
import { BioKeySwitcher } from '~/app/[handle]/bios/_components/bio-key-switcher';
import { getAllFontClassNames } from '~/lib/fonts';

export default function BioEditLayout({ children }: { children: React.ReactElement }) {
	// Load all fonts for bio editing pages where users can preview different fonts
	const allFontClasses = getAllFontClassNames();

	return (
		<div className={`flex h-full ${allFontClasses}`}>
			{/* Left side: Edit interface */}
			<div className='max-w-[1100px] flex-1 overflow-y-auto'>{children}</div>

			{/* Right side: Preview */}
			<div className='hidden min-w-[420px] flex-1 border-l border-gray-200 bg-gray-50 lg:block'>
				<div className='sticky top-0 flex h-full flex-col p-8'>
					{/* Bio key switcher */}
					<div className='mx-auto mb-4'>
						<BioKeySwitcher />
					</div>

					{/* Preview - AppBioRender will now read bioKey from query state internally */}
					<div className='flex flex-1 items-center justify-center'>
						<AppBioRender />
					</div>
				</div>
			</div>
		</div>
	);
}
