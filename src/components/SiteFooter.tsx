import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold">NS</span>
              <span className="text-lg font-bold">NextStep</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Turning ambitious goals into actionable plans. Join thousands of achievers building their future with us.
            </p>
            <div className="flex gap-4 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="hover:text-white transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/#process" className="hover:text-blue-400 transition-colors">How it Works</Link></li>
              <li><Link href="/#pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-blue-400 transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-blue-500 mt-0.5" />
                <span>support@nextstep.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-blue-500 mt-0.5" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 mt-0.5" />
                <span>123 Innovation Dr,<br/>Tech City, TC 90210</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs">
        <p>&copy; {currentYear} NextStep Guidance Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}