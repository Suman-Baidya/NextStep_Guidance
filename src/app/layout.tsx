import type { Metadata } from 'next';
import './globals.css';
import { InsforgeProvider } from './providers';
import Chatbot from '../components/Chatbot';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export const metadata: Metadata = {
  title: 'NextStep Guidance - Achieve Your Goals with Expert Guidance',
  description: 'Turn your ambitious goals into actionable, step-by-step plans with expert guidance',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-slate-50 text-slate-900 flex flex-col min-h-screen">
        <InsforgeProvider>
          {/* Header Component */}
          <SiteHeader />
          
          {/* Main Content */}
          <main className="flex-grow pt-[80px]">
            {children}
          </main>
          
          {/* Footer Component */}
          <SiteFooter />
          
          {/* Global Chatbot */}
          <Chatbot />
        </InsforgeProvider>
      </body>
    </html>
  );
}