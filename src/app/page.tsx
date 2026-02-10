'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { insforge } from '@/lib/insforge';
import { motion, AnimatePresence, useInView, useSpring, useMotionValue, type Variants } from 'framer-motion';
import { 
  CheckCircle2, ArrowRight, Star, ChevronDown, 
  Instagram, Facebook, Linkedin, Youtube, 
  Phone, Mail, MapPin, MessageCircle,
  TrendingUp, Users
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility: Class Merger ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Component: Animated Counter ---
function Counter({ value, label, suffix = "" }: { value: number, label: string, suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
        {displayValue}{suffix}
      </div>
      <div className="text-slate-600 font-medium">{label}</div>
    </div>
  );
}

// --- Types ---
type FAQ = { id: string; question: string; answer: string };
type Testimonial = { id: string; client_name: string; client_role: string | null; content: string; rating: number | null };
type SocialLink = { id: string; platform: string; url: string; icon_name: string | null };
type SiteConfig = { site_name: string; mobile_no: string | null; whatsapp_no: string | null; address: string | null; email: string | null };

// --- Animations ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [faqsRes, testimonialsRes, socialRes, configRes] = await Promise.all([
          insforge.database.from('faqs').select('id,question,answer').eq('is_active', true).order('order_index', { ascending: true }),
          insforge.database.from('testimonials').select('id,client_name,client_role,content,rating').eq('is_featured', true).order('order_index', { ascending: true }).limit(3),
          insforge.database.from('social_media_links').select('id,platform,url,icon_name').eq('is_active', true).order('order_index', { ascending: true }),
          insforge.database.from('site_config').select('site_name,mobile_no,whatsapp_no,address,email').maybeSingle(),
        ]);

        if (faqsRes.data) setFaqs(faqsRes.data as FAQ[]);
        if (testimonialsRes.data) setTestimonials(testimonialsRes.data as Testimonial[]);
        if (socialRes.data) setSocialLinks(socialRes.data as SocialLink[]);
        if (configRes.data) setSiteConfig(configRes.data as SiteConfig);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getSocialIconComponent = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook className="w-5 h-5" />;
    if (p.includes('instagram')) return <Instagram className="w-5 h-5" />;
    if (p.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
    if (p.includes('youtube')) return <Youtube className="w-5 h-5" />;
    if (p.includes('whatsapp')) return <MessageCircle className="w-5 h-5" />;
    return <Link href="#" className="w-5 h-5" />;
  };

  // --- Avatars for Testimonials (Mocking random diverse avatars) ---
  const avatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-900 bg-white selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm text-blue-700 text-sm font-semibold mb-8 hover:scale-105 transition-transform cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Now Accepting New Clients for 2024
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                Your Goals, <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  Finally Achieved.
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                We don't just give advice; we build the system you need to succeed. Get a personalized roadmap, expert accountability, and the tools to turn ambition into reality.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="#contact" className="group relative inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-bold overflow-hidden shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all hover:-translate-y-1">
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                  <span className="relative flex items-center">Start Your Journey <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                </Link>
                <Link href="#process" className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all hover:border-slate-300">
                  See How It Works
                </Link>
              </motion.div>

              {/* Trust Badge */}
              <motion.div variants={fadeInUp} className="mt-10 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-4">
                  {[1,2,3].map((_, i) => (
                    <img 
                      key={i}
                      src={avatars[i]} 
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    +500
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex text-yellow-400 mb-0.5">
                    {[...Array(5)].map((_,i) => <Star key={i} fill="currentColor" size={14} />)}
                  </div>
                  <p className="font-medium text-slate-600">Rated 4.9/5 by achievers</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
              >
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" 
                  alt="Team Planning Strategy" 
                  className="w-full h-auto object-cover"
                />
                
                {/* Floating Card Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-4">
                   <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                     <TrendingUp size={24} />
                   </div>
                   <div>
                     <p className="text-sm text-slate-500 font-medium">Monthly Growth</p>
                     <p className="text-xl font-bold text-slate-900">+127% Achieved</p>
                   </div>
                </div>
              </motion.div>

              {/* Decorative elements behind image */}
              <div className="absolute -top-10 -right-10 w-full h-full border-2 border-slate-200 rounded-3xl -z-10"></div>
              <div className="absolute bottom-10 -left-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20 -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Logo Strip (Trust) */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-slate-500 mb-6 uppercase tracking-widest">Methods used by leaders at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Stripe', 'Spotify', 'Slack', 'Notion', 'Intercom'].map((brand) => (
              <span key={brand} className="text-xl md:text-2xl font-bold text-slate-900">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Statistics Section (Animated) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <Counter value={94} label="Success Rate" suffix="%" />
            <Counter value={1200} label="Goals Completed" suffix="+" />
            <Counter value={15} label="Years Experience" suffix="+" />
          </div>
        </div>
      </section>

      {/* 4. Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Win</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Comprehensive support designed to handle the complexities of personal and professional growth.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Strategic Planning',
                desc: 'We map out the next 12 months of your life with military precision.',
                icon: <MapPin className="w-6 h-6" />,
                color: 'text-blue-600 bg-blue-50'
              },
              {
                title: 'Execution Systems',
                desc: 'Custom workflows and habits designed to make progress automatic.',
                icon: <TrendingUp className="w-6 h-6" />,
                color: 'text-indigo-600 bg-indigo-50'
              },
              {
                title: 'Private Mentorship',
                desc: 'Weekly 1-on-1 calls to troubleshoot obstacles and keep you moving.',
                icon: <Users className="w-6 h-6" />,
                color: 'text-purple-600 bg-purple-50'
              }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all border border-slate-100"
              >
                <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                   {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonials with Avatars */}
      {testimonials.length > 0 && (
        <section id="reviews" className="py-24 bg-slate-900 relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-20 -top-20 -left-20"></div>
             <div className="absolute w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-20 bottom-0 right-0"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <h2 className="text-center text-3xl font-bold mb-16">Real Stories, Real Results</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex gap-1 mb-6 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} fill={i < (t.rating || 5) ? "currentColor" : "none"} className="w-4 h-4" />
                    ))}
                  </div>
                  <p className="text-slate-300 italic mb-8 leading-relaxed">"{t.content}"</p>
                  
                  <div className="flex items-center gap-4 border-t border-slate-700 pt-6">
                    <img 
                      src={avatars[idx % avatars.length]} 
                      alt={t.client_name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                    />
                    <div>
                      <p className="font-bold text-white">{t.client_name}</p>
                      {t.client_role && <p className="text-xs text-slate-400 uppercase tracking-wide">{t.client_role}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. FAQ */}
      {faqs.length > 0 && (
        <section id="faq" className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4">Common Questions</h2>
            <p className="text-center text-slate-600 mb-12">Everything you need to know about getting started.</p>
            
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                  <button 
                    onClick={() => setActiveAccordion(activeAccordion === faq.id ? null : faq.id)}
                    className="w-full flex justify-between items-center p-6 text-left bg-white"
                  >
                    <span className="font-semibold text-slate-900 text-lg">{faq.question}</span>
                    <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-300", activeAccordion === faq.id && "rotate-180 text-blue-600")} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === faq.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/50"
                      >
                        <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 mt-2 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Contact Section (Enhanced) */}
      <section id="contact" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row">
            
            {/* Contact Info (Dark Side) */}
            <div className="bg-slate-900 text-white p-12 lg:w-2/5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Get In Touch</h3>
                <p className="text-slate-400 mb-8">Ready to start? Contact us for a free 15-minute discovery call.</p>
                
                <div className="space-y-6">
                  {siteConfig?.mobile_no && (
                    <a href={`tel:${siteConfig.mobile_no}`} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Phone size={18} />
                      </div>
                      <span className="font-medium">{siteConfig.mobile_no}</span>
                    </a>
                  )}
                  {siteConfig?.email && (
                    <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Mail size={18} />
                      </div>
                      <span className="font-medium">{siteConfig.email}</span>
                    </a>
                  )}
                  {siteConfig?.address && (
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <MapPin size={18} />
                      </div>
                      <span className="font-medium">{siteConfig.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 mt-12">
                <div className="flex gap-4">
                  {socialLinks.map((link) => (
                    <a 
                      key={link.id} 
                      href={link.url} 
                      className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all"
                    >
                      {getSocialIconComponent(link.platform)}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="p-12 lg:w-3/5">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Primary Goal</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white">
                    <option>Launch a Business</option>
                    <option>Career Transition</option>
                    <option>Personal Development</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" placeholder="Tell us about your ambition..."></textarea>
                </div>
                <button type="button" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}