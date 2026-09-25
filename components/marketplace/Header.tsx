'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Sprout, 
  CloudSun, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Menu, 
  X, 
  Layers, 
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRole } from '@/context/RoleContext';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export function Header() {
  const pathname = usePathname();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { role, setRole, setShowRoleModal, currentUser, logoutUser, userLocation, detectLocation } = useRole();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Marketplace', href: '/crops', icon: Layers },
    { name: 'Weather Hub', href: '/weather', icon: CloudSun },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Community', href: '/community', icon: Users },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'h-16 liquid-glass-nav shadow-[0_4px_30px_rgba(0,0,0,0.06)]'
            : 'h-20 liquid-glass-nav'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Location Indicator */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Logo size="md" />
            </Link>

            {/* Live Location Pill */}
            <button
              onClick={() => detectLocation()}
              title="Click to re-detect your location"
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#F3FAF4] hover:bg-[#e8f5eb] border border-[#6FBF78]/30 text-xs font-semibold text-[#2D7A46] transition-all cursor-pointer shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#2D7A46] animate-pulse" />
              <span className="max-w-[130px] truncate">{userLocation?.district || 'Meerut'}, {userLocation?.state === 'Uttar Pradesh' ? 'UP' : userLocation?.state || 'UP'}</span>
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#2D7A46] bg-[#F3FAF4]'
                      : 'text-[#617064] hover:text-[#1E2A22] hover:bg-[#F3FAF4]/60'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User Profile or Register / Sign In Trigger */}
            {currentUser ? (
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-full border border-black/10 shadow-xs text-xs">
                <Link
                  href={currentUser.role === 'farmer' ? '/farmer' : '/account'}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  title="Go to Your Dashboard"
                >
                  <div className="w-6 h-6 rounded-full bg-[#2D7A46] text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.full_name?.charAt(0) || 'K'}
                  </div>
                  <div className="hidden md:block text-left leading-tight pr-1">
                    <span className="font-bold text-[#1E2A22] block max-w-[100px] truncate">
                      {currentUser.full_name}
                    </span>
                    <span className="text-[10px] text-[#2D7A46] font-semibold capitalize block">
                      {currentUser.role}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={logoutUser}
                  title="Switch Account or Sign Out"
                  className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRoleModal(true)}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#2D7A46] text-white hover:bg-[#236338] transition-colors shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Register / Sign In</span>
              </button>
            )}

            {/* Direct Role Switcher Pill (Switch Farmer / Buyer directly without re-login) */}
            <div className="relative group">
              <button
                className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-black/10 bg-white hover:border-[#2D7A46]/40 transition-colors shadow-xs cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#2D7A46]" />
                <span className="text-[#617064]">Role:</span>
                <span className="text-[#1E2A22] capitalize font-bold">{role === 'buyer' ? 'User / Buyer' : 'Farmer'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* Hover / Click Dropdown to switch seamlessly */}
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/10 shadow-xl p-1.5 hidden group-hover:block z-50">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    role === 'farmer' ? 'bg-[#F3FAF4] text-[#2D7A46]' : 'text-[#1E2A22] hover:bg-stone-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#2D7A46]" />
                  <span>Farmer Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    role === 'buyer' ? 'bg-[#F3FAF4] text-[#2D7A46]' : 'text-[#1E2A22] hover:bg-stone-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>User / Buyer Mode</span>
                </button>
              </div>
            </div>

            {/* Portal Link based on Role */}
            {role === 'farmer' && (
              <Link href="/farmer">
                <Button size="sm" variant="secondary" className="hidden lg:inline-flex">
                  Farmer Workspace
                </Button>
              </Link>
            )}
            {role === 'admin' && (
              <Link href="/admin">
                <Button size="sm" variant="secondary" className="hidden lg:inline-flex">
                  Admin Panel
                </Button>
              </Link>
            )}
            {role === 'buyer' && (
              <Link href="/account">
                <Button size="sm" variant="secondary" className="hidden lg:inline-flex">
                  My Orders
                </Button>
              </Link>
            )}

            {/* Cart Button with Spring Bouncing Badge */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2.5 rounded-xl border border-black/10 bg-white hover:bg-stone-50 text-[#1E2A22] shadow-xs flex items-center justify-center transition-colors"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#1E2A22]" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.35, 1] }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -top-1.5 -right-1.5 bg-[#2D7A46] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl border border-black/10 bg-white text-stone-700"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-black/5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2D7A46] text-white flex items-center justify-center">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <span className="font-serif text-xl font-bold text-[#1E2A22]">Kisan Vyapar</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-stone-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-6 space-y-2">
                  {navLinks.map((link, idx) => {
                    const Icon = link.icon;
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-[#1E2A22] hover:bg-[#F3FAF4]"
                        >
                          <Icon className="w-5 h-5 text-[#2D7A46]" />
                          <span>{link.name}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Mobile Role Switcher */}
                <div className="pt-4 border-t border-black/5">
                  <p className="text-xs uppercase font-semibold text-[#617064] tracking-wider mb-2">Current Mode</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['buyer', 'farmer', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setMobileMenuOpen(false);
                        }}
                        className={`py-2 text-xs font-semibold rounded-lg capitalize border ${
                          role === r
                            ? 'bg-[#2D7A46] text-white border-[#2D7A46]'
                            : 'bg-white text-stone-700 border-black/10'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-black/5 space-y-2">
                <Link
                  href={role === 'farmer' ? '/farmer' : role === 'admin' ? '/admin' : '/account'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button className="w-full">
                    {role === 'farmer' ? 'Farmer Workspace' : role === 'admin' ? 'Admin Console' : 'My Account'}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
