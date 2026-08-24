import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { 
    Play, Sparkles, ShieldCheck, Clock, Award, Star, ArrowRight, 
    Share2, Download, Copy, Check, Eye, Video, Zap, CheckCircle2,
    Flame, MessageSquare, Phone
} from 'lucide-react';
import SiteLayout from '@/components/SiteLayout';
import MarketingVideoPlayer from '@/components/MarketingVideoPlayer';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import { BUSINESS, PACKAGES, SERVICES } from '@/data/site';

const MARKETING_BENEFITS = [
    {
        icon: Award,
        title: 'Paint Correction Specialists',
        desc: 'We utilize dual-action Polishers, micro-abrasive compounding, and jewel finishing pads to eliminate 90%+ of wash scratches without thinning the clear coat unnecessarily.',
    },
    {
        icon: ShieldCheck,
        title: 'Certified 5-Year Ceramic',
        desc: 'Our 9H quartz coatings cross-link with paint on a molecular level, offering impenetrable chemical resistance, extreme hydrophobic water contact, and UV defense against Phoenix heat.',
    },
    {
        icon: Sparkles,
        title: 'True Two-Bucket Hand Wash',
        desc: 'Zero automated brushes, zero grit contamination. Every panel receives a dedicated microfiber wash mitt, multi-stage foam bath, and deionized water rinse.',
    },
    {
        icon: Star,
        title: '11 Years of Excellence',
        desc: 'Over 2,400 vehicles detailed, from exotic McLarens and Porsches to daily family haulers. We take on only 2 to 3 vehicles daily to preserve absolute perfection.',
    },
];

const AD_HOOKS = [
    {
        platform: 'Instagram Reel & TikTok',
        hook: 'POV: Your car gets the 2-stage paint correction it deserves in Phoenix.',
        caption: 'Watch swirl marks disappear under high-CRI inspection lighting! 💎 Full decontamination, dual-action Rupes polish & 5-year ceramic coating.',
        tag: 'Viral Reel Hook',
    },
    {
        platform: 'Facebook & YouTube Ad',
        hook: 'Tired of automated car washes scratching your paint?',
        caption: 'Meet Akaal Detailerz Co. — Phoenix’s premier hand detailing shop. No shortcuts, no rushed jobs. Hand-crafted detailing that outlasts the road.',
        tag: 'Conversion Ad',
    },
    {
        platform: 'Google Business / Local Campaign',
        hook: 'Top-Rated Auto Detailing & Ceramic Coatings in Phoenix, AZ',
        caption: '5-star rated, fully licensed & insured. Book online in 60 seconds with instant confirmation.',
        tag: 'Local SEO Spotlight',
    },
];

export default function MarketingPage() {
    const [activeHookTab, setActiveHookTab] = useState(0);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopyHook = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2500);
    };

    return (
        <SiteLayout>
            <Helmet>
                <title>Marketing Brand Film & Promo Reel | Akaal Detailerz Co.</title>
                <meta name="description" content="Watch our 4K cinematic marketing film showcasing hand wash, multi-stage paint correction, and 5-year ceramic coating services in Phoenix, AZ." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-primary pt-28 pb-20 text-primary-foreground">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
                <div className="relative mx-auto max-w-[90rem] px-5">
                    <div className="flex flex-col items-center text-center">
                        <Reveal>
                            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 font-display text-xs uppercase tracking-[0.35em] text-accent">
                                <Video className="h-3.5 w-3.5" /> 4K Cinematic Brand Film
                            </span>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <h1 className="mt-5 max-w-4xl font-display text-5xl uppercase leading-[0.95] sm:text-6xl md:text-7xl">
                                The Science & Soul of <span className="text-accent">Auto Detailing</span>
                            </h1>
                        </Reveal>

                        <Reveal delay={0.15}>
                            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
                                Take a cinematic look inside our Phoenix studio. From active snow foam decontamination to 2-stage paint jewel correction and 5-year ceramic coatings.
                            </p>
                        </Reveal>
                    </div>

                    {/* Embedded 4K Cinema Player */}
                    <div className="mt-12 mx-auto max-w-5xl">
                        <MarketingVideoPlayer autoPlay={true} />
                    </div>
                </div>
            </section>

            {/* Quick Metrics Strip */}
            <section className="border-y border-border bg-card py-10">
                <div className="mx-auto max-w-[90rem] px-5">
                    <dl className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                        <div>
                            <dt className="font-display text-4xl text-accent sm:text-5xl">
                                <CountUp value={2400} suffix="+" />
                            </dt>
                            <dd className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">Exotics & Daily Drivers</dd>
                        </div>
                        <div>
                            <dt className="font-display text-4xl text-accent sm:text-5xl">
                                <CountUp value={5} suffix=" Yrs" />
                            </dt>
                            <dd className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">Ceramic Warranty</dd>
                        </div>
                        <div>
                            <dt className="font-display text-4xl text-accent sm:text-5xl">
                                <CountUp value={90} suffix="%+" />
                            </dt>
                            <dd className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">Swirl Scratch Removal</dd>
                        </div>
                        <div>
                            <dt className="font-display text-4xl text-accent sm:text-5xl">
                                <CountUp value={100} suffix="%" />
                            </dt>
                            <dd className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">Hand Wash Precision</dd>
                        </div>
                    </dl>
                </div>
            </section>

            {/* Detailing Craft & Methodology */}
            <section className="py-20 md:py-28 bg-background">
                <div className="mx-auto max-w-[90rem] px-5">
                    <Reveal>
                        <div className="max-w-2xl">
                            <p className="font-display text-sm uppercase tracking-[0.4em] text-accent">Process & Standards</p>
                            <h2 className="mt-3 font-display text-4xl uppercase sm:text-5xl">Why Our Work Stands Apart</h2>
                            <p className="mt-4 text-muted-foreground leading-relaxed">
                                True detailing isn't just about making a car clean — it's about surface preservation, optical clarity, and long-term asset value.
                            </p>
                        </div>
                    </Reveal>

                    <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {MARKETING_BENEFITS.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <Reveal key={item.title} delay={idx * 0.08}>
                                    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="mt-5 font-display text-2xl uppercase">{item.title}</h3>
                                        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Social Ad Campaign & Copy Kit */}
            <section className="bg-secondary py-20 md:py-28">
                <div className="mx-auto max-w-[72rem] px-5">
                    <Reveal>
                        <div className="text-center">
                            <p className="font-display text-sm uppercase tracking-[0.4em] text-accent">Marketing Kit</p>
                            <h2 className="mt-3 font-display text-4xl uppercase sm:text-5xl">Social Campaign Assets & Ad Copy</h2>
                            <p className="mt-4 mx-auto max-w-xl text-muted-foreground">
                                High-converting social captions, video hooks, and advertising scripts ready for marketing campaigns.
                            </p>
                        </div>
                    </Reveal>

                    <div className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
                        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
                            {AD_HOOKS.map((hook, idx) => (
                                <button
                                    key={hook.platform}
                                    type="button"
                                    onClick={() => setActiveHookTab(idx)}
                                    className={`rounded-lg px-4 py-2 font-display text-sm uppercase tracking-wider transition ${
                                        activeHookTab === idx 
                                            ? 'bg-primary text-primary-foreground' 
                                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {hook.platform}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="rounded bg-accent/15 px-3 py-1 font-display text-xs uppercase tracking-widest text-accent">
                                    {AD_HOOKS[activeHookTab].tag}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handleCopyHook(`${AD_HOOKS[activeHookTab].hook}\n\n${AD_HOOKS[activeHookTab].caption}\n\n📍 ${BUSINESS.address}\n📞 ${BUSINESS.phone}`, activeHookTab)}
                                    className="flex items-center gap-2 rounded bg-accent px-4 py-2 font-display text-sm uppercase text-accent-foreground transition hover:bg-amber-400"
                                >
                                    {copiedIndex === activeHookTab ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copiedIndex === activeHookTab ? 'Copied' : 'Copy Copy'}
                                </button>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/40 p-5">
                                <p className="font-display text-xl uppercase text-foreground">
                                    "{AD_HOOKS[activeHookTab].hook}"
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                    {AD_HOOKS[activeHookTab].caption}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ready to Book CTA Banner */}
            <section className="bg-primary py-20 text-primary-foreground">
                <div className="mx-auto max-w-[72rem] px-5 text-center">
                    <p className="font-display text-sm uppercase tracking-[0.4em] text-accent">Reserve Your Slot</p>
                    <h2 className="mt-4 font-display text-5xl uppercase leading-[0.95] sm:text-6xl">
                        Give Your Vehicle The Detail It Deserves
                    </h2>
                    <p className="mt-5 mx-auto max-w-xl text-primary-foreground/75">
                        We accept a limited number of vehicles each week to guarantee unwavering quality. Reserve your spot online with instant notification.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                        <Link 
                            to="/contact" 
                            className="flex min-h-[52px] items-center gap-2 bg-accent px-8 font-display text-xl uppercase text-accent-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                            Request A Booking <ArrowRight className="h-5 w-5" />
                        </Link>
                        <a 
                            href={`tel:${BUSINESS.phone.replace(/[^0-9]/g, '')}`} 
                            className="flex min-h-[52px] items-center gap-2 border border-primary-foreground/30 px-8 font-display text-xl uppercase text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                        >
                            <Phone className="h-5 w-5" /> Call {BUSINESS.phone}
                        </a>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
