import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';

const EMPTY_FORM = { phone: '', message: '' };

export default function EnquiryDialog({ service, onClose }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

    const submit = async (event) => {
        event.preventDefault();
        setStatus('loading');
        setError('');

        try {
            const response = await fetch('/api/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service, phone: form.phone, message: form.message }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Unable to send enquiry.');
            setStatus('done');
        } catch (submissionError) {
            setStatus('idle');
            setError(submissionError.message || 'Unable to send enquiry. Please call us instead.');
        }
    };

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="enquiry-dialog-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/80 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <div className="w-full max-w-xl bg-card p-6 shadow-2xl sm:p-8">
                <div className="flex items-start justify-between gap-5">
                    <div>
                        <p className="font-display text-sm uppercase tracking-[0.28em] text-accent">Service enquiry</p>
                        <h2 id="enquiry-dialog-title" className="mt-2 font-display text-3xl uppercase">{service}</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close enquiry" className="border border-border p-2 text-muted-foreground transition hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {status === 'done' ? (
                    <div className="mt-8 border border-accent bg-accent/10 p-5">
                        <h3 className="font-display text-2xl uppercase">Enquiry sent</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Thanks. Akaal Detailerz will contact you at the phone number provided.</p>
                        <button type="button" onClick={onClose} className="mt-5 min-h-10 bg-primary px-5 font-display text-sm uppercase text-primary-foreground">Close</button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="mt-7 space-y-5">
                        <label className="block">
                            <span className="font-display text-lg uppercase">Phone number</span>
                            <input required type="tel" value={form.phone} onChange={set('phone')} className="mt-2 w-full border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent" placeholder="(705) 790-1054" />
                        </label>
                        <label className="block">
                            <span className="font-display text-lg uppercase">Your question or enquiry</span>
                            <textarea required value={form.message} onChange={set('message')} className="mt-2 min-h-48 w-full resize-y border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent" placeholder="Tell us what you would like to know about this service" />
                        </label>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <button type="submit" disabled={status === 'loading'} className="flex min-h-12 w-full items-center justify-center gap-2 bg-accent px-6 font-display text-lg uppercase text-accent-foreground disabled:opacity-60">
                            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                            {status === 'loading' ? 'Sending' : 'Send enquiry'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
