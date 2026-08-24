import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Armchair, ArrowRight, CarFront, CircleGauge, Clock, Lightbulb, Paintbrush, PawPrint, Play, Plus, ShieldCheck, SprayCan, Sparkles, Truck, UsersRound, Video, Wind, X } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import CountUp from '../components/CountUp';
import SiteLayout from '../components/SiteLayout';
import MarketingVideoPlayer from '../components/MarketingVideoPlayer';
import AddToBucketButton from '../components/AddToBucketButton';
import { makeBucketItem } from '../contexts/BucketContext';
import { BUSINESS, IMAGES, PACKAGES, SERVICES, SERVICE_ADDONS, SERVICE_PACKAGES, TESTIMONIALS } from '../data/site';
const serviceIcons = {
    cabin: Armchair,
    exterior: CarFront,
    paint: SprayCan,
    ceramic: ShieldCheck,
    headlights: Lightbulb,
    wheels: CircleGauge,
    upholstery: Paintbrush,
    truck: Truck,
};
const addonIcons = {
    pet: PawPrint,
    odor: Wind,
    'vehicle-size': UsersRound,
    caliper: CircleGauge,
};
const TICKER = ['Paint correction', 'Ceramic coating', 'Interior extraction', 'Headlight restoration', 'Wheel decontamination', 'Mobile detailing'];
function Ticker() {
  return <div className="overflow-hidden border-y border-primary/10 bg-accent py-3">
            <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
                {[0, 1].map(dup => <div key={dup} className="flex gap-10">
                        {TICKER.map(t => <span key={t} className="font-display text-xl uppercase tracking-[0.2em] text-accent-foreground">
                                {t} <span className="px-4 opacity-40">/</span>
                            </span>)}
                    </div>)}
            </div>
        </div>;
}
export default function HomePage() {
    const [selectedService, setSelectedService] = useState(null);
    const getPackages = (service) => SERVICE_PACKAGES[service.name] || [
        {
            name: 'Essential',
            price: service.price,
            time: service.time,
            desc: `A focused ${service.name.toLowerCase()} service for regular maintenance.`,
            features: [service.desc, 'Professional-grade products', 'Final quality inspection'],
        },
        {
            name: 'Premium',
            price: Math.round(service.price * 1.5),
            time: service.time,
            desc: `A more thorough ${service.name.toLowerCase()} service for a higher level of finish.`,
            features: [service.desc, 'Enhanced preparation and finishing', 'Professional-grade protection', 'Final quality inspection'],
            featured: true,
        },
        {
            name: 'Complete',
            price: Math.round(service.price * 2),
            time: service.time,
            desc: `Our most comprehensive ${service.name.toLowerCase()} package.`,
            features: [service.desc, 'Full preparation and finishing', 'Extended protection treatment', 'Final quality inspection'],
        },
    ];

  return <SiteLayout>
            <Helmet>
                <title>Akaal Detailerz Co. | Car Wash & Auto Detailing in Phoenix</title>
                <meta name="description" content="Hand car washing, paint correction, interior deep cleaning and 5-year ceramic coatings in Phoenix, Arizona. Book your detail online." />
            </Helmet>

            {/* Hero */}
            <section className="relative flex min-h-[100dvh] items-end bg-primary">
                <img src={IMAGES.hero} alt="Black sedan covered in foam inside a detailing bay" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/20" />
                <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-16 pt-32">
                    <Reveal>
                        <p className="font-display text-sm uppercase tracking-[0.45em] text-accent">Phoenix, Arizona</p>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <h1 className="mt-4 max-w-4xl font-display text-6xl uppercase leading-[0.92] text-primary-foreground sm:text-7xl lg:text-8xl">
                            Your car has not
                            <span className="relative mx-3 inline-block">
                                <span className="relative z-10">looked</span>
                                <span className="absolute -bottom-1 left-0 z-0 h-3 w-full -rotate-1 bg-accent/80" aria-hidden="true" />
                            </span>
                            this good since the lot
                        </h1>
                    </Reveal>
                    <Reveal delay={0.16}>
                        <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/75">Hand washing, Interior cleaning and ceramic coating done by two people who have been doing it for three years. No conveyor, no spinning brushes, no rushed jobs.</p>
                    </Reveal>
                    <Reveal delay={0.24}>
                        <div className="mt-9 flex flex-wrap items-center gap-4">
                            <Link to="/contact" className="flex min-h-[52px] items-center gap-2 bg-accent px-8 font-display text-xl uppercase text-accent-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]">
                                Book a detail <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link to="/video" className="flex min-h-[52px] items-center gap-2 border border-accent bg-accent/15 px-7 font-display text-xl uppercase text-accent transition-colors hover:bg-accent hover:text-accent-foreground">
                                <Play className="h-4 w-4 fill-current" /> Watch Brand Film
                            </Link>
                            <Link to="/services" className="flex min-h-[52px] items-center border border-primary-foreground/30 px-7 font-display text-xl uppercase text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                                See pricing
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            <Ticker />

            {/* Stats + intro split */}
            <section className="mx-auto max-w-[72rem] px-5 py-20 md:py-28">
                <div className="grid gap-14 md:grid-cols-[1fr_1fr] md:items-center">
                    <Reveal>
                        <div className="relative">
                            <img src={IMAGES.polish} alt="Detailer polishing blue paint" className="w-full object-cover" />
                            <div className="absolute -bottom-6 -right-4 hidden bg-primary px-6 py-5 text-primary-foreground sm:block">
                                <p className="font-display text-4xl leading-none text-accent">
                                    <CountUp value={11} suffix=" yrs" />
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-primary-foreground/60">Behind the polisher</p>
                            </div>
                        </div>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <div>
                            <p className="font-display text-sm uppercase tracking-[0.35em] text-muted-foreground">The Standard</p>
                            <h2 className="mt-4 font-display text-4xl uppercase leading-tight sm:text-5xl">Obsessive care for every finish</h2>
                            <p className="mt-5 text-muted-foreground leading-relaxed">We treat every vehicle as a long-term investment. From precision hand washes to multi-stage paint correction and ceramic coatings, our meticulous process delivers unmatched depth, clarity, and protection.</p>
                            <dl className="mt-8 grid grid-cols-3 divide-x divide-border border-y border-border">
                                {[{
                v: 2400,
                s: '+',
                l: 'Cars detailed'
              }, {
                v: 5,
                s: ' yr',
                l: 'Coating warranty'
              }, {
                v: 98,
                s: '%',
                l: 'Repeat clients'
              }].map(x => <div key={x.l} className="px-3 py-5 first:pl-0">
                                        <dt className="font-display text-3xl">
                                            <CountUp value={x.v} suffix={x.s} />
                                        </dt>
                                        <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{x.l}</dd>
                                    </div>)}
                            </dl>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Services list */}
            <section className="bg-secondary py-20 md:py-28">
                <div className="mx-auto max-w-[72rem] px-5">
                    <Reveal>
                        <h2 className="font-display text-4xl uppercase sm:text-5xl">Services & pricing</h2>
                    </Reveal>
                    <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                        {SERVICES.map((s, i) => <Reveal key={s.name} delay={i * 0.05}>
                                <button type="button" onClick={() => setSelectedService(s)} className="flex h-full w-full flex-col items-center text-center transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                                    {(() => {
                                      const Icon = serviceIcons[s.icon];
                                      return <Icon aria-hidden="true" className="mb-4 h-14 w-14 stroke-[1.5] text-accent-foreground" />;
                                    })()}
                                    <p className="font-display text-2xl uppercase leading-tight">{s.name}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                                    <span className="mt-4 font-display text-xs uppercase tracking-widest text-accent-foreground underline underline-offset-4">View packages</span>
                                </button>
                            </Reveal>)}
                    </div>
                    <Link to="/services" className="mt-8 inline-flex items-center gap-2 font-display text-xl uppercase text-accent-foreground underline decoration-accent decoration-4 underline-offset-8">
                        Full service menu <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>

                        {selectedService && (
                            <div role="dialog" aria-modal="true" aria-labelledby="home-service-dialog-title" className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-primary/80 p-3 sm:p-4 md:items-center" onMouseDown={(event) => event.target === event.currentTarget && setSelectedService(null)}>
                                <div className="my-0 max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto overscroll-contain bg-card p-5 shadow-2xl sm:my-8 sm:max-h-[calc(100dvh-4rem)] sm:p-8">
                                    <div className="sticky top-0 z-10 -mx-5 -mt-5 flex items-start justify-between gap-6 bg-card py-5 sm:static sm:mx-0 sm:mt-0 sm:bg-transparent sm:py-0">
                                        <div>
                                            <p className="font-display text-sm uppercase tracking-[0.28em] text-accent">Choose your package</p>
                                            <h2 id="home-service-dialog-title" className="mt-2 font-display text-4xl uppercase">{selectedService.name}</h2>
                                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{selectedService.desc}</p>
                                        </div>
                                        <button type="button" onClick={() => setSelectedService(null)} aria-label="Close package options" className="shrink-0 border border-border p-2 text-muted-foreground transition hover:text-foreground">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="mt-8 grid gap-5 md:grid-cols-3">
                                        {getPackages(selectedService).map((servicePackage) => (
                                            <div key={servicePackage.name} className={`flex flex-col border border-border p-5 ${servicePackage.featured ? 'ring-2 ring-accent' : ''}`}>
                                                <h3 className="font-display text-2xl uppercase">{servicePackage.name}</h3>
                                                <p className="mt-2 text-sm text-muted-foreground">{servicePackage.desc}</p>
                                                <p className="mt-5 font-display text-4xl text-accent-foreground">${servicePackage.price}</p>
                                                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{servicePackage.time}</p>
                                                <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                                                    {servicePackage.features.map((feature) => <li key={feature} className="border-b border-border pb-2">{feature}</li>)}
                                                </ul>
                                                <AddToBucketButton
                                                    item={makeBucketItem({
                                                        kind: 'package',
                                                        name: servicePackage.name,
                                                        price: servicePackage.price,
                                                        service: selectedService.name,
                                                        time: servicePackage.time,
                                                        desc: servicePackage.desc,
                                                    })}
                                                    className="mt-6 flex min-h-[46px] items-center justify-center bg-primary font-display text-base uppercase text-primary-foreground"
                                                >
                                                    Add to bucket
                                                </AddToBucketButton>
                                            </div>
                                        ))}
                                    </div>
                                                                        {SERVICE_ADDONS[selectedService.name] && (
                                                                            <div className="mt-8 border-t border-border pt-6">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Plus className="h-4 w-4 text-accent" />
                                                                                    <h3 className="font-display text-2xl uppercase">Addon services</h3>
                                                                                </div>
                                                                                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                                                    {SERVICE_ADDONS[selectedService.name].map((addon) => {
                                                                                        const Icon = addonIcons[addon.icon];
                                                                                        return <div key={addon.name} className="flex flex-col gap-3 border border-border p-4">
                                                                                            <div className="flex items-start gap-3">
                                                                                                <Icon aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-accent-foreground" />
                                                                                                <div className="min-w-0 flex-1">
                                                                                                    <div className="flex items-start justify-between gap-3">
                                                                                                        <h4 className="font-display text-lg uppercase leading-tight">{addon.name}</h4>
                                                                                                        <span className="shrink-0 font-display text-lg text-accent-foreground">+${addon.price}</span>
                                                                                                    </div>
                                                                                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{addon.desc}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                            <AddToBucketButton
                                                                                                item={makeBucketItem({
                                                                                                    kind: 'addon',
                                                                                                    name: addon.name,
                                                                                                    price: addon.price,
                                                                                                    service: selectedService.name,
                                                                                                    desc: addon.desc,
                                                                                                })}
                                                                                                className="flex min-h-[40px] items-center justify-center border border-primary bg-transparent font-display text-sm uppercase text-primary"
                                                                                            >
                                                                                                Add addon
                                                                                            </AddToBucketButton>
                                                                                        </div>;
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                </div>
                            </div>
                        )}

            {/* Before / after */}
            <section className="mx-auto max-w-[90rem] px-5 py-20 md:py-28">
                <Reveal>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h2 className="font-display text-4xl uppercase sm:text-5xl">The difference, side by side</h2>
                        <Link to="/gallery" className="font-display text-lg uppercase text-muted-foreground hover:text-foreground">
                            Full gallery
                        </Link>
                    </div>
                </Reveal>
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    {[{
          src: IMAGES.before,
          tag: 'Before',
          note: 'Silver sedan, water-spotted and oxidised'
        }, {
          src: IMAGES.after,
          tag: 'After',
          note: 'Corrected, sealed and mirror-flat'
        }].map((x, i) => <Reveal key={x.tag} delay={i * 0.08}>
                            <figure className="group relative overflow-hidden">
                                <img src={x.src} alt={x.note} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-primary/85 px-5 py-4 text-primary-foreground">
                                    <span className="font-display text-2xl uppercase text-accent">{x.tag}</span>
                                    <span className="text-xs text-primary-foreground/70">{x.note}</span>
                                </figcaption>
                            </figure>
                        </Reveal>)}
                </div>
            </section>

            {/* Packages */}
            <section className="bg-primary py-20 text-primary-foreground md:py-28">
                <div className="mx-auto max-w-[72rem] px-5">
                    <Reveal>
                        <h2 className="font-display text-4xl uppercase sm:text-5xl">Packages</h2>
                        <p className="mt-3 max-w-lg text-primary-foreground/70">Three ways in. Every package is quoted after we see the vehicle — the price below is where it starts.</p>
                    </Reveal>
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {PACKAGES.map((p, i) => <Reveal key={p.name} delay={i * 0.08}>
                                <div className={`flex h-full flex-col border p-7 ${p.featured ? 'border-accent bg-accent/10' : 'border-white/15'}`}>
                                    {p.featured && <span className="mb-3 w-fit bg-accent px-3 py-1 font-display text-xs uppercase tracking-widest text-accent-foreground">Most booked</span>}
                                    <p className="font-display text-3xl uppercase">{p.name}</p>
                                    <p className="mt-2 text-sm text-primary-foreground/70">{p.blurb}</p>
                                    <p className="mt-6 font-display text-5xl text-accent">
                                        ${p.price}
                                        <span className="ml-2 text-base uppercase tracking-widest text-primary-foreground/50">{p.cadence}</span>
                                    </p>
                                    <ul className="mt-6 flex-1 space-y-2 text-sm text-primary-foreground/80">
                                        {p.features.map(f => <li key={f} className="flex gap-2">
                                                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                                                {f}
                                            </li>)}
                                    </ul>
                                    <AddToBucketButton
                                        item={makeBucketItem({ kind: 'bundle', name: `${p.name} package`, price: p.price, desc: p.blurb })}
                                        className={`mt-7 flex min-h-[48px] items-center justify-center font-display text-lg uppercase transition-transform active:scale-[0.98] ${p.featured ? 'bg-accent text-accent-foreground' : 'border border-primary-foreground/30 hover:bg-primary-foreground/10'}`}
                                    >
                                        Add {p.name}
                                    </AddToBucketButton>
                                </div>
                            </Reveal>)}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="mx-auto max-w-[72rem] px-5 py-20 md:py-28">
                <Reveal>
                    <h2 className="font-display text-4xl uppercase sm:text-5xl">What clients say</h2>
                </Reveal>
                <div className="mt-10 grid gap-8 md:grid-cols-3">
                    {TESTIMONIALS.map((t, i) => <Reveal key={t.name} delay={i * 0.08}>
                            <blockquote className="flex h-full flex-col border-t-4 border-accent bg-card p-6 shadow-[0_18px_40px_-30px_rgba(20,30,45,0.9)]">
                                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">“{t.quote}”</p>
                                <footer className="mt-6">
                                    <p className="font-display text-xl uppercase">{t.name}</p>
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{t.detail}</p>
                                </footer>
                            </blockquote>
                        </Reveal>)}
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-border bg-secondary py-16">
                <div className="mx-auto flex max-w-[72rem] flex-col items-start gap-6 px-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-display text-4xl uppercase">Ready when you are</h2>
                        <p className="mt-2 text-muted-foreground">{BUSINESS.hours} · {BUSINESS.address}</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent" /> Insured & licensed</span>
                        <span className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4 text-accent" /> Same-week slots</span>
                        <Link to="/contact" className="flex min-h-[48px] items-center bg-primary px-8 font-display text-xl uppercase text-primary-foreground transition-transform active:scale-[0.98]">
                            Request a booking
                        </Link>
                    </div>
                </div>
            </section>
        </SiteLayout>;
}