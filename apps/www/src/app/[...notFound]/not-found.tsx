// import { default as BarelyLogo } from "public/logos/barely-io-logo.svg";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-purple-900 pb-12 pt-16 align-middle">
      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-4 sm:px-2 lg:px-8">
        <div className="flex flex-shrink-0 justify-center">
          <Link href="/" className="mb-3 inline-flex">
            <span className="sr-only">barely.io</span>
            {/* <img
              src="/logos/barely-io-logo.svg"
              className="w-20 h-20"
              alt="barely.io logo"
            /> */}
          </Link>
          <div className="w-"></div>
        </div>
        <div className="pb-16 pt-8">
          <div className="text-center">
            <p className="text-base font-semibold text-purple-200">404</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-50 sm:text-7xl md:text-5xl lg:text-4xl">
              link not found
            </h1>
            <p className="mt-2 text-base text-gray-200 sm:text-2xl md:text-base">
              {`sorry, we can't find that link.`}
            </p>
            <div className="mt-6">
              <a
                href="https://barely.io/link"
                className="text-base font-medium text-purple-400 hover:text-purple-500 sm:text-2xl md:text-lg"
              >
                go home
                <span aria-hidden="true"> &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      {/* <footer className='flex-shrink-0 w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
				<nav className='flex justify-center space-x-4'>
					<a href='#' className='text-sm font-medium text-gray-500 hover:text-gray-600'>
						Contact Support
					</a>
					<span className='inline-block border-l border-gray-300' aria-hidden='true' />
					<a href='#' className='text-sm font-medium text-gray-500 hover:text-gray-600'>
						Status
					</a>
					<span className='inline-block border-l border-gray-300' aria-hidden='true' />
					<a href='#' className='text-sm font-medium text-gray-500 hover:text-gray-600'>
						Twitter
					</a>
				</nav>
			</footer> */}
    </div>
  );
}
