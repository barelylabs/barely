'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@barely/lib/utils/cn';
import { Icon } from '@barely/ui/elements/icon';

import { ContactModal } from './ContactModal';
import { MarketingButton } from './Button';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/blog', label: 'Blog' },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/_static/barely_sparrow_logo_2-tone.svg"
                alt="Barely Sparrow"
                className="h-8 w-8"
              />
              <span className="text-lg font-heading font-semibold text-white">Barely Sparrow</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    pathname === item.href
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              
              <a 
                href="https://app.usemotion.com/meet/barely/discovery" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MarketingButton
                  marketingLook="glass"
                  size="sm"
                  className="ml-2 group"
                >
                  <span className="flex items-center gap-1.5">
                    Book Call
                    <Icon.externalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </span>
                </MarketingButton>
              </a>
              
              <MarketingButton
                marketingLook="hero-secondary"
                size="sm"
                className="ml-2"
                onClick={() => setShowContactModal(true)}
              >
                Get Started
              </MarketingButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white/70 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon.menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/95 backdrop-blur-xl transition-opacity duration-300 md:hidden',
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex h-full flex-col px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/_static/barely_sparrow_logo_2-tone.svg"
                alt="Barely Sparrow"
                className="h-8 w-8"
              />
              <span className="text-lg font-heading font-semibold text-white">Barely Sparrow</span>
            </Link>
            
            <button
              className="text-white/70 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon.x className="h-6 w-6" />
            </button>
          </div>

          <nav className="mt-12 flex flex-col space-y-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-2xl font-medium transition-colors duration-200',
                  pathname === item.href
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <a 
              href="https://app.usemotion.com/meet/barely/discovery" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <MarketingButton
                marketingLook="glass"
                size="lg"
                fullWidth
                className="group"
              >
                <span className="flex items-center justify-center gap-2">
                  Book Call
                  <Icon.externalLink className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </span>
              </MarketingButton>
            </a>
            
            <MarketingButton
              marketingLook="hero-primary"
              size="lg"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                setShowContactModal(true);
              }}
            >
              Get Started
            </MarketingButton>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal showModal={showContactModal} setShowModal={setShowContactModal} />
    </>
  );
}