import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { CheckCircle2, Loader2 } from 'lucide-react';
import SiteLayout from '../components/SiteLayout.jsx';
import inMemoryDb from '../lib/inMemoryDb';
import { sendBookingSms } from '../lib/sms';
import { BUSINESS, PACKAGES, SERVICES } from '../data/site';

const EMPTY = { name: '', email: '', phone: '', vehicle: '', package: '', preferred_date: '', message: '' };
const OPTIONS = [...PACKAGES.map((p) => `${p.name} package`), ...SERVICES.map((s) => s.name)];

const field = 'mt-2 w-full border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent';

export default function ContactPage() {
    const [form, setForm] = useState(EMPTY);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError('');

        try {
            const createdBooking = inMemoryDb.addBooking({
                ...form,
                amount: 0,
                status: 'Pending',
            });

            await sendBookingSms({
                toPhone: createdBooking.phone,
                customerName: createdBooking.name,
                serviceName: createdBooking.package || 'your requested service',
            });

            setStatus('done');
            setForm(EMPTY);
        } catch (err) {
            setStatus('idle');
            setError(err?.message || 'Something went wrong. Please call us instead.');
        }
    };

    return (
        <SiteLayout>
            <Helmet>
                <title>Book a Detail | Akaal Detailerz Co.</title>
                <meta name="description" content="Request a car wash or detailing appointment in Phoenix. Tell us your vehicle and preferred date and we reply within one business day." />
            </Helmet>

            <section className="bg-primary px-5 py-20 text-primary-foreground md:py-24">
                <div className="mx-auto max-w-[72rem]">
                    <p className="font-display text-sm uppercase tracking-[0.4em] text-accent">Booking</p>
                    <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] sm:text-7xl">Tell us about the car</h1>
                    <p className="mt-5 max-w-xl text-primary-foreground/70">We answer every request within one business day with a firm quote and the next open slots.</p>
                </div>
            </section>

            <section className="mx-auto grid max-w-[72rem] gap-12 px-5 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-24">
                <div>
                    {status === 'done' ? (
                        <div className="flex flex-col items-start gap-3 border border-accent bg-accent/10 p-8">
                            <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
                            <h2 className="font-display text-3xl uppercase">Request received</h2>
                            <p className="text-muted-foreground">Thanks — we have your details and will be in touch within one business day. Need it sooner? Call {BUSINESS.phone}.</p>
                            <button type="button" onClick={() => setStatus('idle')} className="mt-2 min-h-[44px] bg-primary px-6 font-display text-lg uppercase text-primary-foreground">
                                Send another request
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                            <label className="block sm:col-span-1">
                                <span className="font-display text-lg uppercase">Name</span>
                                <input required value={form.name} onChange={set('name')} className={field} placeholder="Your full name" />
                            </label>
                            <label className="block">
                                <span className="font-display text-lg uppercase">Email</span>
                                <input required type="email" value={form.email} onChange={set('email')} className={field} placeholder="you@example.com" />
                            </label>
                            <label className="block">
                                <span className="font-display text-lg uppercase">Phone</span>
                                <input value={form.phone} onChange={set('phone')} className={field} placeholder="(602) 555-0102" />
                            </label>
                            <label className="block">
                                <span className="font-display text-lg uppercase">Vehicle</span>
                                <input value={form.vehicle} onChange={set('vehicle')} className={field} placeholder="2019 Toyota 4Runner, silver" />
                            </label>
                            <label className="block">
                                <span className="font-display text-lg uppercase">Service</span>
                                <select value={form.package} onChange={set('package')} className={field}>
                                    <option value="">Not sure yet</option>
                                    {OPTIONS.map((o) => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="font-display text-lg uppercase">Preferred date</span>
                                <input type="date" value={form.preferred_date} onChange={set('preferred_date')} className={field} />
                            </label>
                            <label className="block sm:col-span-2">
                                <span className="font-display text-lg uppercase">Anything we should know</span>
                                <textarea rows={5} value={form.message} onChange={set('message')} className={field} placeholder="Pet hair, hard water spots, swirl marks under the sun..." />
                            </label>
                            {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="flex min-h-[52px] items-center justify-center gap-2 bg-accent px-8 font-display text-xl uppercase text-accent-foreground transition-transform active:scale-[0.98] disabled:opacity-60 sm:col-span-2 sm:w-fit"
                            >
                                {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                                {status === 'loading' ? 'Sending' : 'Request booking'}
                            </button>
                        </form>
                    )}
                </div>

                <aside className="space-y-6 border-t-2 border-primary pt-6 text-sm md:border-l md:border-t-0 md:border-border md:pl-8 md:pt-0">
                    <div>
                        <p className="font-display text-xl uppercase">Call or text</p>
                        <a className="text-muted-foreground hover:text-foreground" href={`tel:${BUSINESS.phone.replace(/[^0-9]/g, '')}`}>{BUSINESS.phone}</a>
                    </div>
                    <div>
                        <p className="font-display text-xl uppercase">Email</p>
                        <a className="text-muted-foreground hover:text-foreground" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
                    </div>
                    <div>
                        <p className="font-display text-xl uppercase">Shop</p>
                        <p className="text-muted-foreground">{BUSINESS.address}</p>
                    </div>
                    <div>
                        <p className="font-display text-xl uppercase">Hours</p>
                        <p className="text-muted-foreground">{BUSINESS.hours}</p>
                    </div>
                </aside>
            </section>
        </SiteLayout>
    );
}
