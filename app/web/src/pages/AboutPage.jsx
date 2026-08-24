import React from 'react';
import { Helmet } from 'react-helmet';
import Reveal from '../components/Reveal.jsx';
import SiteLayout from '../components/SiteLayout';
import { BUSINESS, IMAGES } from '../data/site';

const VALUES = [
    { t: 'Hand wash only', d: 'No brushes, no tunnels. Two buckets, grit guards, and a fresh microfiber for every panel.' },
    { t: 'Honest scope', d: 'If your paint does not need correction, we will tell you and sell you the wash instead.' },
    { t: 'Products that last', d: 'Professional coatings and sealants, applied in a controlled bay, cured overnight.' },
];

export default function AboutPage() {
    return (
        <SiteLayout>
            <Helmet>
                <title>About Us | Akaal Detailerz Co. Phoenix</title>
                <meta name="description" content="Meet the two-person Phoenix detailing shop behind Akaal Detailerz Co. — eleven years of hand washing, paint correction and ceramic coating." />
            </Helmet>

            <section className="mx-auto grid max-w-[90rem] gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24">
                <Reveal>
                    <div>
                        <p className="font-display text-sm uppercase tracking-[0.4em] text-muted-foreground">Since 2014</p>
                        <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] sm:text-6xl">A two-person shop that never learned to rush</h1>
                        <p className="mt-6 leading-relaxed text-muted-foreground">
                            Akaal Detailerz Co. started detailing out of a single-car garage on the west side with a shop vac and
                            a rotary buffer bought secondhand. Eleven years later the bay is bigger, the lighting is better,
                            and the rule is the same: one car at a time, finished properly, handed back cleaner than promised.
                        </p>
                        <p className="mt-4 leading-relaxed text-muted-foreground">
                            We work on daily drivers, work trucks, weekend cars and the occasional show build. Most of our
                            calendar comes from people who came in once for a wash and stayed for the coating.
                        </p>
                        <dl className="mt-8 space-y-5 border-t border-border pt-6">
                            <div><dt className="font-display text-xl uppercase">Where</dt><dd className="text-muted-foreground">{BUSINESS.address}</dd></div>
                            <div><dt className="font-display text-xl uppercase">Hours</dt><dd className="text-muted-foreground">{BUSINESS.hours}</dd></div>
                            <div><dt className="font-display text-xl uppercase">Contact</dt><dd className="text-muted-foreground">{BUSINESS.phone} · {BUSINESS.email}</dd></div>
                        </dl>
                    </div>
                </Reveal>
                <Reveal delay={0.1}>
                    <img src={IMAGES.owner} alt="Akaal Detailerz master craftsman in front of his detailing bay" className="w-full object-cover" />
                </Reveal>
            </section>

            <section className="bg-primary px-5 py-16 text-primary-foreground md:py-24">
                <div className="mx-auto grid max-w-[72rem] gap-8 md:grid-cols-3">
                    {VALUES.map((v, i) => (
                        <Reveal key={v.t} delay={i * 0.07}>
                            <div className="border-t-2 border-accent pt-5">
                                <h2 className="font-display text-2xl uppercase">{v.t}</h2>
                                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">{v.d}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>
        </SiteLayout>
    );
}
