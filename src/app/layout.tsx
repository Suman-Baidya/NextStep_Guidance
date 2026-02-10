import type { Metadata } from 'next';
import './globals.css';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@insforge/nextjs';
import Link from 'next/link';
import { InsforgeProvider } from './providers';
import Chatbot from '@/components/Chatbot';

export const metadata: Metadata = {
  title: 'NextStep Guidance - Achieve Your Goals with Expert Guidance',
  description: 'Turn your ambitious goals into actionable, step-by-step plans with expert guidance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        <InsforgeProvider>
          <header className="border-b bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
                  NS
                </span>
                <div className="flex flex-col">
                  <Link href="/" className="font-semibold tracking-tight">
                    NextStep Guidance
                  </Link>
                  <span className="text-xs text-slate-500">
                    Plan, track and achieve big goals
                  </span>
                </div>
              </div>
              <nav className="flex items-center gap-4 text-sm">
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="rounded-md px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    href="/admin"
                    className="rounded-md px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Admin
                  </Link>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton>
                    <button className="rounded-md px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800">
                      Get started
                    </button>
                  </SignUpButton>
                </SignedOut>
              </nav>
            </div>
          </header>
          <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-6xl px-4 py-8">
            {children}
          </main>
          <Chatbot />
        </InsforgeProvider>
      </body>
    </html>
  );
}

