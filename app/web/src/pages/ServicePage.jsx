import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Armchair, CarFront, CircleGauge, Lightbulb, Paintbrush, PawPrint, Plus, ShieldCheck, SprayCan, Truck, UsersRound, Wind, X } from 'lucide-react';
import AddToBucketButton from '@/components/AddToBucketButton';
import Reveal from '@/components/Reveal';
import SiteLayout from '@/components/SiteLayout';
import { makeBucketItem, useBucket } from '@/contexts/BucketContext';
import { PACKAGES, SERVICES, SERVICE_ADDONS, SERVICE_PACKAGES } from '@/data/site';

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

export default function ServicesPage() {
    const [selectedService, setSelectedService] = useState(null);
    const { count, total } = useBucket();

    const getPackages = (service) => SERVICE_PACKAGES[service.name] || [
        {
            name: 'Essential Handwash',
            price: service.price,
            time: service.time,
            desc: `A focused ${service.name.toLowerCase()} service for regular maintenance.`,
            features: ['Form Wash', 'Micro-Fiber dry', 'Wheel and tire cleaning', 'Tire dressing/shining', 'Bug and Tar removal'],
        },
        {
            name: 'Complete Decontamination wash',
            price: Math.round(service.price * 2),
            time: service.time,
            desc: `Our most comprehensive ${service.name.toLowerCase()} package.`,
            features: ['Everything in Essential Handwash', 'Clay bar treatment', 'Break Rust Removal', 'Final quality inspection'],
        },
    ];

    return (
        <SiteLayout>
            <Helmet>
                <title>Services & Pricing | Akaal Detailerz Co.</title>
                <meta name="description" content="Car wash, interior deep cleaning, paint correction, headlight restoration and ceramic coating packages with clear pricing in Phoenix, AZ." />
            </Helmet>

            <section className="px-5 pb-12 pt-16 text-center md:pb-16 md:pt-20">
                <div className="mx-auto max-w-[72rem]">
                    <h1 className="font-display text-5xl uppercase leading-none sm:text-6xl">Our services</h1>
                    <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">Premium detailing solutions designed to restore, protect, and enhance your vehicle inside and out.</p>
                </div>
            </section>

            <section className="mx-auto max-w-[78rem] px-5 pb-20 md:pb-28">
                <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
                    {SERVICES.map((s, i) => (
                        <Reveal key={s.name} delay={(i % 2) * 0.06}>
                            <button type="button" onClick={() => setSelectedService(s)} className="flex h-full w-full flex-col items-center text-center transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                                {(() => {
                                    const Icon = serviceIcons[s.icon];
                                    return <Icon aria-hidden="true" className="mb-5 h-16 w-16 stroke-[1.5] text-accent-foreground" />;
                                })()}
                                <h2 className="font-display text-2xl leading-tight">{s.name}</h2>
                                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.desc}</p>
                                <span className="mt-5 font-display text-sm uppercase tracking-widest text-accent-foreground underline underline-offset-4">View packages</span>
                            </button>
                        </Reveal>
                    ))}
                </div>
            </section>

            <section className="bg-secondary px-5 py-16 md:py-24">
                <div className="mx-auto max-w-[72rem]">
                    <h2 className="font-display text-4xl uppercase sm:text-5xl">Bundled packages</h2>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {PACKAGES.map((p, i) => (
                            <Reveal key={p.name} delay={i * 0.07}>
                                <div className={`flex h-full flex-col bg-card p-7 ${p.featured ? 'ring-2 ring-accent' : 'border border-border'}`}>
                                    <p className="font-display text-3xl uppercase">{p.name}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                                    <p className="mt-5 font-display text-5xl">
                                        ${p.price}
                                        <span className="ml-2 text-sm uppercase tracking-widest text-muted-foreground">{p.cadence}</span>
                                    </p>
                                    <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                                        {p.features.map((f) => (
                                            <li key={f} className="border-b border-border pb-2">{f}</li>
                                        ))}
                                    </ul>
                                    <AddToBucketButton
                                        item={makeBucketItem({ kind: 'bundle', name: `${p.name} package`, price: p.price, desc: p.blurb })}
                                        className="mt-6 flex min-h-[48px] items-center justify-center bg-primary font-display text-lg uppercase text-primary-foreground transition-transform active:scale-[0.98]"
                                    >
                                        Add to bucket
                                    </AddToBucketButton>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {selectedService && (
                <div role="dialog" aria-modal="true" aria-labelledby="service-dialog-title" className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-primary/80 p-3 sm:p-4 md:items-center" onMouseDown={(event) => event.target === event.currentTarget && setSelectedService(null)}>
                    <div className="my-0 max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto overscroll-contain bg-card p-5 shadow-2xl sm:my-8 sm:max-h-[calc(100dvh-4rem)] sm:p-8">
                        <div className="sticky top-0 z-10 -mx-5 -mt-5 flex items-start justify-between gap-6 bg-card py-5 sm:static sm:mx-0 sm:mt-0 sm:bg-transparent sm:py-0">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-accent">Choose your package</p>
                                <h2 id="service-dialog-title" className="mt-2 font-display text-4xl uppercase">{selectedService.name}</h2>
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

            {count > 0 && (
                <div className="sticky bottom-0 z-40 border-t border-border bg-card/95 px-5 py-4 backdrop-blur">
                    <div className="mx-auto flex max-w-[78rem] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-display text-lg uppercase">
                            Bucket: {count} item{count === 1 ? '' : 's'} · ${total}
                        </p>
                        <Link to="/contact" className="flex min-h-[48px] items-center justify-center bg-accent px-6 font-display text-lg uppercase text-accent-foreground">
                            Checkout
                        </Link>
                    </div>
                </div>
            )}
        </SiteLayout>
    );
}
