import React from 'react';
import { Helmet } from 'react-helmet';
import Reveal from '../components/Reveal';
import SiteLayout from '../components/SiteLayout';
import { GALLERY, TESTIMONIALS } from '../data/site';

export default function GalleryPage() {
    return (
        <SiteLayout>
            <Helmet>
                <title>Gallery & Reviews | Akaal Detailerz Co.</title>
                <meta name="description" content="Before and after photos of car detailing, paint correction and ceramic coating work, plus reviews from Phoenix clients." />
            </Helmet>

            <section className="bg-primary px-5 py-20 text-primary-foreground md:py-24">
                <div className="mx-auto max-w-[90rem]">
                    <p className="font-display text-sm uppercase tracking-[0.4em] text-accent">Our work</p>
                    <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] sm:text-7xl">Before, after, and everything between</h1>
                </div>
            </section>

            <section className="mx-auto max-w-[90rem] columns-1 gap-6 px-5 py-16 sm:columns-2 lg:columns-3 md:py-20">
                {GALLERY.map((g, i) => (
                    <Reveal key={g.label} delay={(i % 3) * 0.06}>
                        <figure className="mb-6 break-inside-avoid">
                            <div className="relative overflow-hidden">
                                <img src={g.src} alt={g.label} className="w-full object-cover transition-transform duration-500 hover:scale-[1.04]" loading="lazy" />
                                <span className="absolute left-0 top-0 bg-accent px-3 py-1 font-display text-sm uppercase tracking-widest text-accent-foreground">{g.tag}</span>
                            </div>
                            <figcaption className="mt-2 text-sm text-muted-foreground">{g.label}</figcaption>
                        </figure>
                    </Reveal>
                ))}
            </section>

            <section className="bg-secondary px-5 py-16 md:py-24">
                <div className="mx-auto max-w-[72rem]">
                    <h2 className="font-display text-4xl uppercase sm:text-5xl">Reviews</h2>
                    <div className="mt-10 space-y-8">
                        {TESTIMONIALS.map((t, i) => (
                            <Reveal key={t.name} delay={i * 0.06}>
                                <blockquote className="border-l-4 border-accent bg-card p-6 md:p-8">
                                    <p className="text-lg leading-relaxed">“{t.quote}”</p>
                                    <footer className="mt-4 font-display text-xl uppercase">
                                        {t.name} <span className="text-sm tracking-widest text-muted-foreground">— {t.detail}</span>
                                    </footer>
                                </blockquote>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
