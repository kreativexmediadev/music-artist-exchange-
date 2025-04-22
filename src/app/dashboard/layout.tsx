'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserRole } from '@/types/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent-yellow"></div>
      </div>
    );
  }

  const isArtist = session?.user?.role === UserRole.ARTIST;

  const navigationItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: (isHovered: boolean) => (
        <div className={`transform transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              className={`transform origin-center transition-all duration-500 ${isHovered ? 'rotate-180' : ''}`}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      ),
    },
    {
      name: 'Portfolio',
      href: '/dashboard/portfolio',
      icon: (isHovered: boolean) => (
        <div className={`transform transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              className={`transform origin-center transition-all duration-500 ${isHovered ? 'translate-y-1' : ''}`}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      ),
    },
    {
      name: 'Market',
      href: '/dashboard/market',
      icon: (isHovered: boolean) => (
        <div className={`transform transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              className={`transform origin-center transition-all duration-500 ${isHovered ? 'translate-x-1' : ''}`}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
      ),
    },
    {
      name: 'Artists',
      href: '/dashboard/artist',
      icon: (isHovered: boolean) => (
        <div className={`transform transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              className={`transform origin-center transition-all duration-500 ${isHovered ? 'translate-y-1' : ''}`}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      ),
    },
    {
      name: 'Trade',
      href: '/dashboard/trade',
      icon: (isHovered: boolean) => (
        <div className={`transform transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              className={`transform origin-center transition-all duration-500 ${isHovered ? 'translate-x-1' : ''}`}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
      ),
    },
    ...(isArtist
      ? [
          {
            name: 'Artist Dashboard',
            href: '/dashboard/artist',
            icon: (isHovered: boolean) => (
              <div className={`transform transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    className={`transform origin-center transition-all duration-500 ${isHovered ? 'translate-y-1' : ''}`}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3">
                    <animate
                      attributeName="d"
                      dur="1s"
                      repeatCount="indefinite"
                      values="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3;
                             M9 18V5l12-3v13M9 18c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 9l12-3"
                    />
                  </path>
                </svg>
              </div>
            ),
          },
        ]
      : []),
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: (isHovered: boolean) => (
        <div className={`transform transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              className={`transform origin-center transition-all duration-500 ${isHovered ? 'rotate-90' : ''}`}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              className={`transform origin-center transition-all duration-500 ${isHovered ? 'rotate-180' : ''}`}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-dark">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-dark-card w-64 transform transition-all duration-500 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6">
          <Link 
            href="/dashboard" 
            className="text-2xl font-bold text-white hover:text-accent-yellow transition-all duration-300 transform hover:scale-110 inline-block"
          >
            <span className="relative">
              MAX
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-yellow transition-all duration-300 group-hover:w-full"></span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-accent-yellow text-dark'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                    router.push('/auth/login');
                  }
                }}
              >
                {item.icon(hoveredItem === item.name)}
                <span className="ml-3 relative">
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 ${
                    hoveredItem === item.name ? 'w-full' : 'w-0'
                  }`}></span>
                </span>
                {isActive && (
                  <span className="absolute right-0 w-1 h-full bg-current transform scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Music Visualizer Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center p-4">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-accent-yellow rounded-t"
                style={{
                  height: `${Math.random() * 24 + 4}px`,
                  animation: `visualizer ${Math.random() * 0.8 + 0.5}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-500 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Top Bar */}
        <div className="bg-dark-card h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-300 hover:text-white transform transition-transform duration-300 hover:scale-110"
          >
            <svg className={`w-6 h-6 transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : ''}`} 
                 fill="none" 
                 stroke="currentColor" 
                 viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* User Menu */}
          <div className="flex items-center">
            <span className="text-gray-300 mr-4">
              {session?.user?.firstName} {session?.user?.lastName}
            </span>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="text-gray-300 hover:text-white transform transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>

      <style jsx global>{`
        @keyframes visualizer {
          0% {
            height: 4px;
          }
          100% {
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
} 