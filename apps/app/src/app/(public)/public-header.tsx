import Image from "next/image";
import { Text } from "@barely/ui/elements/typography";
import logo from "@static/logo.png";

const PublicHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full items-center border-b border-b-slate-200 bg-white py-1 dark:border-b-slate-700 dark:bg-slate-900">
      <div className="container flex h-10 max-w-5xl items-center">
        <PublicMainNav />
        {/* <MobileNav /> */}
        <div className="flex flex-1 items-center justify-between space-x-2 sm:space-x-4 md:justify-end">
          <nav className="flex items-center space-x-1"></nav>
        </div>
      </div>
    </header>
  );
};

const PublicMainNav = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="relative mx-auto h-[22px] w-[22px] items-center">
        <Image src={logo} alt="barely.io logo" fill />
      </div>
      <Text variant="xl/medium" className="hidden font-heading md:block">
        barely
        <span className="font-sans text-2xs">.io</span>
      </Text>
      {/* <span className='hidden font-bold sm:inline-block'>{siteConfig.name}</span> */}
    </div>
  );
};

export { PublicHeader };
