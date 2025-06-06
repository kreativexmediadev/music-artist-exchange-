'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { UserMenu } from './UserMenu';
import {
  HomeIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  dropdown?: {
    name: string;
    href: string;
    description: string;
  }[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Discover',
    href: '/discover',
    icon: MagnifyingGlassIcon,
    dropdown: [
      {
        name: 'Top Artists',
        href: '/discover?filter=top',
        description: 'View the most popular artists',
      },
      {
        name: 'Trending',
        href: '/discover?filter=trending',
        description: 'See what\'s trending now',
      },
      {
        name: 'New Listings',
        href: '/discover?filter=new',
        description: 'Recently added artists',
      },
    ],
  },
  {
    name: 'Market',
    href: '/market',
    icon: ChartBarIcon,
    dropdown: [
      {
        name: 'Market Overview',
        href: '/market',
        description: 'View overall market performance',
      },
      {
        name: 'Top Gainers',
        href: '/market?filter=gainers',
        description: 'Best performing artists',
      },
      {
        name: 'Top Losers',
        href: '/market?filter=losers',
        description: 'Worst performing artists',
      },
    ],
  },
  {
    name: 'Trade',
    href: '/trade',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const name = path.charAt(0).toUpperCase() + path.slice(1);
      return { name, href };
    });
  };

  return (
    <nav className="bg-gradient-to-br from-gray-800 to-gray-900 border-b border-teal-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
              <ArrowPathIcon className="h-6 w-6 text-teal-400" />
              Artist Exchange
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  <div className="flex items-center gap-2">
                    <Link
                      href={item.href}
                      className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive(item.href)
                          ? 'text-teal-400'
                          : 'text-gray-300 hover:text-white'
                      }`}
                      onMouseEnter={() => item.dropdown && setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                      {item.dropdown && (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </Link>
                  </div>
                  {item.dropdown && openDropdown === item.name && (
                    <div
                      className="absolute left-0 mt-2 w-56 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <div className="py-1">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <div className="font-medium">{dropdownItem.name}</div>
                            <div className="text-xs text-gray-400">
                              {dropdownItem.description}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* User Menu */}
          <UserMenu />
        </div>

        {/* Breadcrumbs */}
        <div className="hidden md:block py-2">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white">
              Home
            </Link>
            {getBreadcrumbs().map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                <span className="text-gray-500 mx-2">/</span>
                <Link
                  href={crumb.href}
                  className={`${
                    index === getBreadcrumbs().length - 1
                      ? 'text-teal-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {crumb.name}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.href)
                        ? 'bg-gray-700 text-teal-400'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <div className="pl-8 space-y-1">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 