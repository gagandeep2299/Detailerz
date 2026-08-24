import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import SiteLayout from '../components/SiteLayout.jsx';
import { useBucket } from '../contexts/BucketContext';
import inMemoryDb from '../lib/inMemoryDb';
import { sendBookingSms } from '../lib/sms';
import { BUSINESS } from '../data/site';

const EMPTY = { name: '', email: '', phone: '', vehicle: '' };
const field = 'mt-2 w-full border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent';

export default function ContactPage() {
    const { items, total, count, removeItem, updateQty, clearBucket } = useBucket();
    const [form, setForm] = useState(EMPTY);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!items.length) {
            setError('Add at least one service to your bucket before checkout.');
            return;
        }

        setStatus('loading');
        setError('');

        const packageLabel = items
            .map((item) => {
                const qty = Number(item.qty || 1);
                const parent = item.service ? `${item.service} / ` : '';
                return `${parent}${item.name}${qty > 1 ? ` ×${qty}` : ''}`;
            })
            .join(', ');

        try {
            const createdBooking = inMemoryDb.addBooking({
                ...form,
                package: packageLabel,
                amount: total,
                status: 'Pending',
            });

            await sendBookingSms({
                toPhone: createdBooking.phone,
                customerName: createdBooking.name,
                serviceName: packageLabel,
            });

            clearBucket();
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
                <title>Checkout | Akaal Detailerz Co.</title>
                <meta name="description" content="Review your selected detailing services and send a booking request with your name, email, phone, and car name." />
            </Helmet>

            <section className="bg-primary px-5 py-20 text-primary-foreground md:py-24">
                <div className="mx-auto max-w-[72rem]">
                    <p className="font-display text-sm uppercase tracking-[0.4em] text-accent">Checkout</p>
                    <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] sm:text-7xl">Your selected services</h1>
                    <p className="mt-5 max-w-xl text-primary-foreground/70">Everything in your bucket stays for this browser session. Confirm the list, then leave your contact details.</p>
                </div>
            </section>

            <section className="mx-auto grid max-w-[72rem] gap-12 px-5 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-24">
                <div>
                    {status === 'done' ? (
                        <div className="flex flex-col items-start gap-3 border border-accent bg-accent/10 p-8">
                            <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
                            <h2 className="font-display text-3xl uppercase">Request received</h2>
                            <p className="text-muted-foreground">Thanks — we have your details and selected services, and will be in touch within one business day. Need it sooner? Call {BUSINESS.phone}.</p>
                            <Link to="/services" className="mt-2 flex min-h-[44px] items-center bg-primary px-6 font-display text-lg uppercase text-primary-foreground">
                                Add more services
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="border border-border bg-card p-6">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <h2 className="font-display text-3xl uppercase">Bucket</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">{count} selected item{count === 1 ? '' : 's'}</p>
                                    </div>
                                    <p className="font-display text-3xl">${total}</p>
                                </div>

                                {items.length === 0 ? (
                                    <div className="mt-6 border border-dashed border-border p-6 text-sm text-muted-foreground">
                                        Your bucket is empty. <Link to="/services" className="font-display uppercase text-foreground underline underline-offset-4">Browse services</Link> and add packages or addons.
                                    </div>
                                ) : (
                                    <ul className="mt-6 divide-y divide-border">
                                        {items.map((item) => (
                                            <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    {item.service && <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.service}</p>}
                                                    <p className="font-display text-xl uppercase">{item.name}</p>
                                                    {item.time && <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.time}</p>}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                                                        Qty
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.qty || 1}
                                                            onChange={(event) => updateQty(item.id, event.target.value)}
                                                            className="w-16 border border-border bg-background px-2 py-1 text-sm text-foreground"
                                                        />
                                                    </label>
                                                    <p className="w-20 text-right font-display text-xl">${Number(item.price || 0) * Number(item.qty || 1)}</p>
                                                    <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`} className="border border-border p-2 text-muted-foreground hover:text-foreground">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
                                <h2 className="font-display text-3xl uppercase sm:col-span-2">Your details</h2>
                                <label className="block">
                                    <span className="font-display text-lg uppercase">Name</span>
                                    <input required value={form.name} onChange={set('name')} className={field} placeholder="Your full name" />
                                </label>
                                <label className="block">
                                    <span className="font-display text-lg uppercase">Email</span>
                                    <input required type="email" value={form.email} onChange={set('email')} className={field} placeholder="you@example.com" />
                                </label>
                                <label className="block">
                                    <span className="font-display text-lg uppercase">Phone number</span>
                                    <input required value={form.phone} onChange={set('phone')} className={field} placeholder="(602) 555-0102" />
                                </label>
                                <label className="block">
                                    <span className="font-display text-lg uppercase">Car name</span>
                                    <input required value={form.vehicle} onChange={set('vehicle')} className={field} placeholder="2019 Toyota 4Runner" />
                                </label>
                                {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || items.length === 0}
                                    className="flex min-h-[52px] items-center justify-center gap-2 bg-accent px-8 font-display text-xl uppercase text-accent-foreground transition-transform active:scale-[0.98] disabled:opacity-60 sm:col-span-2 sm:w-fit"
                                >
                                    {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                                    {status === 'loading' ? 'Sending' : 'Request booking'}
                                </button>
                            </form>
                        </>
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
