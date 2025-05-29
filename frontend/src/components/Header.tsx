'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  showNavigation?: boolean;
}

const Header = ({ showNavigation = true }: HeaderProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          {showNavigation && (
            <nav className="hidden md:flex space-x-6">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } ${item.name === 'Test API' ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Mobile menu button and User menu */}
          <div className="flex items-center space-x-2">
            {/* Mobile menu button */}
            {showNavigation && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-2 rounded-md"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {user?.full_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.full_name || user?.username}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">{user?.full_name || user?.username}</p>
                      {user?.twitter_username && (
                        <p className="text-gray-500">@{user.twitter_username}</p>
                      )}
                    </div>
                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showNavigation && isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="px-4 py-4 space-y-2">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    pathname === item.path
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } ${item.name === 'Test API' ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : ''}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">
                      {item.name === 'Dashboard' && '📊'}
                      {item.name === 'Content' && '✍️'}
                      {item.name === 'Analytics' && '📈'}
                      {item.name === 'Settings' && '⚙️'}
                      {item.name === 'Auth' && '🔐'}
                      {item.name === 'Test API' && '🧪'}
                    </span>
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
