'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

type Testimonial = {
  id: string;
  client_name: string;
  client_role: string | null;
  content: string;
  rating: number | null;
};

type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon_name: string | null;
};

type SiteConfig = {
  site_name: string;
  mobile_no: string | null;
  whatsapp_no: string | null;
  address: string | null;
  email: string | null;
};

export default function Home() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [faqsRes, testimonialsRes, socialRes, configRes] = await Promise.all([
        insforge.database
          .from('faqs')
          .select('id,question,answer')
          .eq('is_active', true)
          .order('order_index', { ascending: true }),
        insforge.database
          .from('testimonials')
          .select('id,client_name,client_role,content,rating')
          .eq('is_featured', true)
          .order('order_index', { ascending: true })
          .limit(3),
        insforge.database
          .from('social_media_links')
          .select('id,platform,url,icon_name')
          .eq('is_active', true)
          .order('order_index', { ascending: true }),
        insforge.database
          .from('site_config')
          .select('site_name,mobile_no,whatsapp_no,address,email')
          .maybeSingle(),
      ]);

      if (faqsRes.data) setFaqs(faqsRes.data as FAQ[]);
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data as Testimonial[]);
      if (socialRes.data) setSocialLinks(socialRes.data as SocialLink[]);
      if (configRes.data) setSiteConfig(configRes.data as SiteConfig);
    };

    loadData();
  }, []);

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, string> = {
      facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
      twitter: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
      instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
      linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
      youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
      whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
    };
    return icons[platform.toLowerCase()] || '';
  };

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
              Welcome to {siteConfig?.site_name || 'NextStep Guidance'}
            </h1>
            <p className="mb-8 text-xl text-blue-100 md:text-2xl">
              Turn your ambitious goals into actionable, step-by-step plans with expert guidance
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50"
              >
                Start Your Journey
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">About Us</h2>
            <p className="mb-6 text-lg text-slate-600">
              At NextStep Guidance, we believe that every ambitious goal is achievable when broken
              down into clear, manageable steps. Our expert consultants work with you to understand
              your unique situation, challenges, and aspirations.
            </p>
            <p className="text-lg text-slate-600">
              Whether you want to start a business, switch careers, learn new skills, or achieve
              personal milestones, we provide personalized roadmaps and ongoing support to keep you
              on track and motivated.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Our Services</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Goal Planning</h3>
              <p className="text-slate-600">
                Define your objectives with clarity. Our structured approach helps you articulate
                what you want to achieve and by when.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Custom Roadmaps</h3>
              <p className="text-slate-600">
                Get a personalized step-by-step plan tailored to your timeline, resources, and
                constraints. Each milestone is designed to move you closer to your goal.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Progress Tracking</h3>
              <p className="text-slate-600">
                Monitor your advancement with our intuitive dashboard. See what you've accomplished
                and what's next on your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">How We Work</h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: '1',
                title: 'Sign Up & Set Goal',
                description: 'Create your account and tell us what you want to achieve',
              },
              {
                step: '2',
                title: 'Answer Questions',
                description: 'Complete our intake questionnaire so we understand your situation',
              },
              {
                step: '3',
                title: 'Get Your Plan',
                description: 'Our consultants create a personalized roadmap with actionable steps',
              },
              {
                step: '4',
                title: 'Track & Achieve',
                description: 'Follow your plan, check off completed steps, and reach your goal',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Help */}
      <section id="how-we-help" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            How We Can Help You
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: '🚀',
                title: 'Start a Business',
                description:
                  'From idea validation to launch, get a structured 6-12 month plan to build your business.',
              },
              {
                icon: '💼',
                title: 'Career Transition',
                description:
                  'Navigate career changes with confidence. Plan your move, upskill, and land your dream role.',
              },
              {
                icon: '📚',
                title: 'Skill Development',
                description:
                  'Learn new skills systematically. Break down complex topics into manageable learning paths.',
              },
              {
                icon: '🎯',
                title: 'Personal Goals',
                description:
                  'Achieve personal milestones like fitness, travel, financial goals, or creative projects.',
              },
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl bg-white p-6 shadow-md">
                <div className="mb-3 text-4xl">{item.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
              What Our Clients Say
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="rounded-xl bg-slate-50 p-6">
                  <div className="mb-4 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < (testimonial.rating || 5)
                            ? 'text-yellow-400'
                            : 'text-slate-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-4 text-slate-700">&ldquo;{testimonial.content}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.client_name}</p>
                    {testimonial.client_role && (
                      <p className="text-sm text-slate-500">{testimonial.client_role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section id="why-choose-us" className="bg-gradient-to-br from-indigo-50 to-blue-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Why Choose NextStep Guidance
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Expert Consultants',
                description:
                  'Work with experienced professionals who understand your industry and challenges.',
              },
              {
                title: 'Personalized Plans',
                description:
                  'Every roadmap is tailored to your unique situation, timeline, and resources.',
              },
              {
                title: 'Ongoing Support',
                description:
                  'Get regular check-ins, progress reviews, and adjustments to keep you on track.',
              },
              {
                title: 'Clear Milestones',
                description:
                  'Break down big goals into achievable steps with clear deadlines and outcomes.',
              },
              {
                title: 'Flexible Approach',
                description:
                  'Plans adapt as you progress. We adjust based on your feedback and results.',
              },
              {
                title: 'Proven Methodology',
                description:
                  'Our structured approach has helped hundreds achieve their ambitious goals.',
              },
            ].map((item, idx) => (
              <div key={idx} className="rounded-lg bg-white p-5 shadow-sm">
                <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section id="faq" className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group rounded-lg border border-slate-200 bg-slate-50 p-5"
                >
                  <summary className="cursor-pointer font-semibold text-slate-900">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Get In Touch</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {siteConfig?.mobile_no && (
              <div className="text-center">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold">Phone</h3>
                <a
                  href={`tel:${siteConfig.mobile_no}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {siteConfig.mobile_no}
                </a>
              </div>
            )}
            {siteConfig?.whatsapp_no && (
              <div className="text-center">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d={getSocialIcon('whatsapp')} />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold">WhatsApp</h3>
                <a
                  href={`https://wa.me/${siteConfig.whatsapp_no.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  {siteConfig.whatsapp_no}
                </a>
              </div>
            )}
            {siteConfig?.address && (
              <div className="text-center">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-600">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold">Address</h3>
                <p className="text-slate-300">{siteConfig.address}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-900 py-8 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                {siteConfig?.site_name || 'NextStep Guidance'}
              </h3>
              <p className="text-sm text-slate-400">
                Your trusted partner in achieving ambitious goals through structured planning and
                expert guidance.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">Follow Us</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => {
                  const iconPath = getSocialIcon(link.platform);
                  if (!iconPath) return null;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white transition hover:bg-slate-700"
                      aria-label={link.platform}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d={iconPath} />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} {siteConfig?.site_name || 'NextStep Guidance'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
