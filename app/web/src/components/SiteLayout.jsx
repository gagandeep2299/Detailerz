import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { BUSINESS } from '@/data/site';
import CinematicBackgroundVideo from '@/components/CinematicBackgroundVideo';
const NAV = [{
    to: '/',
    label: 'Home'
}, {
    to: '/services',
    label: 'Services'
}, {
    to: '/gallery',
    label: 'Gallery'
}, {
    to: '/about',
    label: 'About'
}, {
    to: '/contact',
    label: 'Book'
}];
const linkClass = ({
    isActive
}) => `font-display text-lg uppercase tracking-wide transition-colors ${isActive ? 'text-accent' : 'text-primary-foreground/75 hover:text-primary-foreground'}`;
export function SiteLayout({
    children
}) {
    const [open, setOpen] = useState(false);
    return <div className="min-h-screen bg-background">
    <CinematicBackgroundVideo />
        <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur border-b border-white/10">
            <div className="mx-auto flex max-w-[90rem] items-center justify-between px-5 py-4">
                <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}><span className="h-8 w-1.5 bg-accent" aria-hidden="true"></span><span className="font-display text-2xl uppercase leading-none text-primary-foreground">Akaal<span className="text-accent">.</span><span className="block text-[0.6rem] tracking-[0.35em] text-primary-foreground/60">DetailERZ Co.</span></span></Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {NAV.map(n => <NavLink key={n.to} to={n.to} className={linkClass}>
                        {n.label}
                    </NavLink>)}
                    <a href={`tel:${BUSINESS.phone.replace(/[^0-9]/g, '')}`} className="flex min-h-[44px] items-center gap-2 bg-accent px-5 font-display text-lg uppercase text-accent-foreground transition-transform active:scale-[0.98]">
                        <Phone className="h-4 w-4" strokeWidth={2.2} />
                        {BUSINESS.phone}
                    </a>
                </nav>

                <button type="button" aria-label="Toggle menu" onClick={() => setOpen(v => !v)} className="flex h-11 w-11 items-center justify-center text-primary-foreground md:hidden">
                    {open ? <X /> : <Menu />}
                </button>
            </div>

            {open && <nav className="flex flex-col gap-1 border-t border-white/10 bg-primary px-5 pb-5 md:hidden">
                {NAV.map(n => <NavLink key={n.to} to={n.to} className={linkClass} onClick={() => setOpen(false)}>
                    <span className="block py-3">{n.label}</span>
                </NavLink>)}
                <a href={`tel:${BUSINESS.phone.replace(/[^0-9]/g, '')}`} className="mt-2 flex min-h-[44px] items-center justify-center gap-2 bg-accent font-display text-lg uppercase text-accent-foreground">
                    <Phone className="h-4 w-4" /> {BUSINESS.phone}
                </a>
            </nav>}
        </header>

        <main>{children}</main>

        <footer className="border-t border-white/10 bg-primary text-primary-foreground/70">
            <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                    <p className="font-display text-3xl uppercase text-primary-foreground">{BUSINESS.name}</p>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed">{BUSINESS.tagline}</p>
                </div>
                <div className="text-sm leading-relaxed">
                    <p className="font-display text-lg uppercase tracking-wide text-accent">Visit</p>
                    <p className="mt-3">{BUSINESS.address}</p>
                    <p className="mt-2">{BUSINESS.hours}</p>
                </div>
                <div className="text-sm leading-relaxed">
                    <p className="font-display text-lg uppercase tracking-wide text-accent">Contact</p>
                    <a className="mt-3 block hover:text-primary-foreground" href={`tel:${BUSINESS.phone.replace(/[^0-9]/g, '')}`}>
                        {BUSINESS.phone}
                    </a>
                    <a className="mt-2 block hover:text-primary-foreground" href={`mailto:${BUSINESS.email}`}>
                        {BUSINESS.email}
                    </a>
                    <Link className="mt-4 inline-block font-display text-lg uppercase text-primary-foreground" to="/contact">
                        Book a detail
                    </Link>
                </div>
            </div>
            <div className="border-t border-white/10 px-5 py-5 text-center text-xs">
                © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
            </div>
        </footer>
    </div>
}
export default SiteLayout;