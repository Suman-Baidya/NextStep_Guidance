'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@insforge/nextjs';
import { Menu, X, LayoutDashboard, Shield, LogIn, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard', requiredAuth: true },
    { name: 'Admin', href: '/admin', requiredAuth: true },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          isScrolled 
            ? "bg-white/80 backdrop-blur-md border-slate-200 py-3 shadow-sm" 
            : "bg-white border-transparent py-5"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
              NS
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 tracking-tight text-lg leading-tight group-hover:text-blue-600 transition-colors">
                NextStep
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                Guidance
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <SignedIn>
              {navLinks.filter(l => l.requiredAuth).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-600",
                    pathname === link.href ? "text-blue-600" : "text-slate-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </SignedIn>
          </nav>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
              />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-2">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
                  Get Started <ChevronRight size={14} />
                </button>
              </SignUpButton>
            </SignedOut>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-[70px] z-40 bg-white border-t border-slate-100 p-6 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col space-y-6">
              <SignedIn>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <UserButton />
                  <span className="text-sm font-medium text-slate-600">Manage Account</span>
                </div>
                <nav className="flex flex-col space-y-2">
                  <Link href="/dashboard" className="flex items-center gap-3 p-3 text-slate-700 hover:bg-slate-50 rounded-lg font-medium">
                    <LayoutDashboard size={20} className="text-blue-600" /> Dashboard
                  </Link>
                  <Link href="/admin" className="flex items-center gap-3 p-3 text-slate-700 hover:bg-slate-50 rounded-lg font-medium">
                    <Shield size={20} className="text-indigo-600" /> Admin
                  </Link>
                </nav>
              </SignedIn>

              <SignedOut>
                <div className="flex flex-col gap-4 pt-4">
                  <SignInButton>
                    <button className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50">
                      <LogIn size={18} /> Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">
                      Create Free Account
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}