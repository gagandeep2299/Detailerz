import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import inMemoryDb from '@/lib/inMemoryDb';

export default function AdminGalleryPage() {
    const [bookings, setBookings] = useState(() => inMemoryDb.getBookings());

    useEffect(() => {
        const unsubscribe = inMemoryDb.subscribe((snapshot) => {
            setBookings(snapshot?.bookings || inMemoryDb.getBookings());
        });
        setBookings(inMemoryDb.getBookings());
        return () => unsubscribe();
    }, []);

    const galleryItems = useMemo(
        () =>
            bookings
                .filter((booking) => booking.beforeImage || booking.afterImage)
                .map((booking) => ({
                    ...booking,
                    beforeImage: booking.beforeImage || '',
                    afterImage: booking.afterImage || '',
                })),
        [bookings],
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-primary text-primary-foreground">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5">
                    <div>
                        <p className="font-display text-sm uppercase tracking-[0.35em] text-accent">Detailerz</p>
                        <h1 className="mt-2 font-display text-3xl uppercase">Admin gallery</h1>
                    </div>
                    <Link to="/admin" className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase transition hover:bg-white/10">
                        <ArrowLeft className="h-4 w-4" /> Back to admin
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-[1400px] px-5 py-8">
                <div className="mb-6 flex items-center gap-3">
                    <ImageIcon className="h-6 w-6 text-accent" />
                    <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Before & after results</p>
                </div>

                {galleryItems.length === 0 ? (
                    <div className="rounded border border-border bg-card p-8 text-center text-muted-foreground">No vehicle images have been uploaded yet.</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {galleryItems.map((booking) => (
                            <article key={booking.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                                <div className="grid grid-cols-2">
                                    {booking.beforeImage && (
                                        <img src={booking.beforeImage} alt={`${booking.name} before`} className="h-56 w-full object-cover" />
                                    )}
                                    {booking.afterImage && (
                                        <img src={booking.afterImage} alt={`${booking.name} after`} className="h-56 w-full object-cover" />
                                    )}
                                </div>
                                <div className="space-y-2 p-4">
                                    <p className="font-display text-xl uppercase">{booking.name}</p>
                                    <p className="text-sm text-muted-foreground">{booking.vehicle} • {booking.package}</p>
                                    <p className="text-xs uppercase tracking-[0.22em] text-accent">{booking.status}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
