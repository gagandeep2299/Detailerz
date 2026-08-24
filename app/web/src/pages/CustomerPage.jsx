import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CarFront, Mail, Phone, User, CalendarRange, DollarSign, WalletCards, CircleDashed, Pencil } from 'lucide-react';
import inMemoryDb from '@/lib/inMemoryDb';
import { useAuth } from '@/contexts/AuthContext';

const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

const statusColors = {
    Confirmed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    Pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    'In progress': 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    Completed: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
};

export default function CustomerPage() {
    const navigate = useNavigate();
    const { customerId } = useParams();
    const { user, logout } = useAuth();
    const [records, setRecords] = useState(() => inMemoryDb.getBookings());
    const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || inMemoryDb.getCustomers()[0]?.customerId || null);
    const [bookingDraft, setBookingDraft] = useState({});

    useEffect(() => {
        const unsubscribe = inMemoryDb.subscribe((snapshot) => {
            setRecords(snapshot?.bookings || inMemoryDb.getBookings());
        });
        setRecords(inMemoryDb.getBookings());
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (customerId) {
            setSelectedCustomerId(customerId);
        }
    }, [customerId]);

    const customers = useMemo(() => inMemoryDb.getCustomers(), [records]);

    const currentCustomer = useMemo(
        () => customers.find((customer) => customer.customerId === selectedCustomerId) || customers[0] || null,
        [customers, selectedCustomerId],
    );

    const customerBookings = useMemo(
        () => (currentCustomer ? inMemoryDb.getBookingsByCustomerId(currentCustomer.customerId) : []),
        [currentCustomer, records],
    );

    const bookingTotals = useMemo(
        () => customerBookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0),
        [customerBookings],
    );

    useEffect(() => {
        if (currentCustomer && !bookingDraft.id) {
            setBookingDraft({
                id: currentCustomer.bookingIds?.[0] || currentCustomer.customerId,
                status: customerBookings[0]?.status || 'Pending',
                amount: customerBookings[0]?.amount || 0,
            });
        }
    }, [currentCustomer, customerBookings, bookingDraft.id]);

    const openBookingEdit = (booking) => {
        setBookingDraft({
            id: booking.id,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            vehicle: booking.vehicle,
            package: booking.package,
            preferred_date: booking.preferred_date,
            status: booking.status,
            amount: booking.amount,
            customerId: booking.customerId,
        });
    };

    const handleSaveBooking = () => {
        if (!bookingDraft.id) return;

        const sourceBooking = records.find((booking) => booking.id === bookingDraft.id) || null;

        inMemoryDb.updateBooking(bookingDraft.id, {
            name: bookingDraft.name,
            email: bookingDraft.email,
            phone: bookingDraft.phone,
            vehicle: bookingDraft.vehicle,
            package: bookingDraft.package,
            preferred_date: bookingDraft.preferred_date,
            status: bookingDraft.status,
            amount: Number(bookingDraft.amount || 0),
            customerId: bookingDraft.customerId,
            employeeId: sourceBooking?.employeeId ?? bookingDraft.employeeId ?? null,
            employeeName: sourceBooking?.employeeName ?? bookingDraft.employeeName ?? '',
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    if (!currentCustomer) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="font-display text-2xl uppercase">No customer data</p>
                    <Link to="/admin" className="mt-4 inline-block bg-accent px-4 py-2 font-display uppercase text-accent-foreground">Back to dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-primary text-primary-foreground">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5">
                    <div>
                        <p className="font-display text-sm uppercase tracking-[0.35em] text-accent">Detailerz</p>
                        <h1 className="mt-2 font-display text-3xl uppercase">Customer records</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => navigate('/admin')} className="border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase">Dashboard</button>
                        <button type="button" onClick={handleLogout} className="border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase">Logout</button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1400px] space-y-8 px-5 py-8">
                <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Customer ID</p>
                                <p className="mt-1 font-display text-2xl uppercase">{currentCustomer.customerId}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-sm text-muted-foreground">
                                <span className="mr-2 font-display uppercase tracking-widest">Customer</span>
                                <select
                                    value={selectedCustomerId || ''}
                                    onChange={(event) => {
                                        setSelectedCustomerId(event.target.value);
                                        navigate(`/admin/customers/${event.target.value}`);
                                    }}
                                    className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                >
                                    {customers.map((customer) => (
                                        <option key={customer.customerId} value={customer.customerId}>{customer.name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[0.9fr_1.2fr]">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Profile</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">{currentCustomer.name}</h2>
                            </div>
                            <User className="h-6 w-6 text-accent" />
                        </div>

                        <div className="space-y-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-3">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                <div className="flex flex-col gap-1">
                                    {(currentCustomer.emails && currentCustomer.emails.length ? currentCustomer.emails : [currentCustomer.email || 'unknown@example.com']).map((email) => (
                                        <span key={email} className="break-all">{email}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                <div className="flex flex-col gap-1">
                                    {(currentCustomer.phones && currentCustomer.phones.length ? currentCustomer.phones : [currentCustomer.phone || '(000) 000-0000']).map((phone) => (
                                        <span key={phone} className="break-all">{phone}</span>
                                    ))}
                                </div>
                            </div>
                            <p className="flex items-center gap-3"><CarFront className="h-4 w-4 text-accent" /> {currentCustomer.vehicle}</p>
                            <p className="flex items-center gap-3"><CalendarRange className="h-4 w-4 text-accent" /> {customerBookings.length} booking(s)</p>
                            <p className="flex items-center gap-3"><DollarSign className="h-4 w-4 text-accent" /> {currency.format(bookingTotals)}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Edit</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">Booking details</h2>
                            </div>
                            <Pencil className="h-6 w-6 text-accent" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Name</span>
                                <input value={bookingDraft.name || ''} onChange={(event) => setBookingDraft((current) => ({ ...current, name: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Email</span>
                                <input value={bookingDraft.email || ''} onChange={(event) => setBookingDraft((current) => ({ ...current, email: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Phone</span>
                                <input value={bookingDraft.phone || ''} onChange={(event) => setBookingDraft((current) => ({ ...current, phone: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Vehicle</span>
                                <input value={bookingDraft.vehicle || ''} onChange={(event) => setBookingDraft((current) => ({ ...current, vehicle: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Service</span>
                                <input value={bookingDraft.package || ''} onChange={(event) => setBookingDraft((current) => ({ ...current, package: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Date</span>
                                <input type="date" value={bookingDraft.preferred_date || ''} onChange={(event) => setBookingDraft((current) => ({ ...current, preferred_date: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Status</span>
                                <select value={bookingDraft.status || 'Pending'} onChange={(event) => setBookingDraft((current) => ({ ...current, status: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none">
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="In progress">In progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Amount</span>
                                <input type="number" value={bookingDraft.amount || 0} onChange={(event) => setBookingDraft((current) => ({ ...current, amount: Number(event.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" />
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button type="button" onClick={handleSaveBooking} className="bg-accent px-5 py-2 font-display text-lg uppercase text-accent-foreground">Save booking</button>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Bookings</p>
                            <h2 className="mt-2 font-display text-2xl uppercase">Customer bookings</h2>
                        </div>
                        <WalletCards className="h-6 w-6 text-accent" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-secondary text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3 font-display uppercase tracking-wider">ID</th>
                                    <th className="px-5 py-3 font-display uppercase tracking-wider">Service</th>
                                    <th className="px-5 py-3 font-display uppercase tracking-wider">Vehicle</th>
                                    <th className="px-5 py-3 font-display uppercase tracking-wider">Date</th>
                                    <th className="px-5 py-3 font-display uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 font-display uppercase tracking-wider">Amount</th>
                                    <th className="px-5 py-3 font-display uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerBookings.map((booking) => (
                                    <tr key={booking.id} className="border-t border-border align-top">
                                        <td className="px-5 py-4 font-mono text-xs">{booking.id}</td>
                                        <td className="px-5 py-4">{booking.package}</td>
                                        <td className="px-5 py-4">{booking.vehicle}</td>
                                        <td className="px-5 py-4">{new Date(booking.preferred_date).toLocaleDateString()}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs uppercase tracking-wider ${statusColors[booking.status] || 'bg-gray-500/10 text-gray-300 border-gray-500/30'}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-display text-lg text-accent">{currency.format(booking.amount)}</td>
                                        <td className="px-5 py-4">
                                            <button type="button" onClick={() => openBookingEdit(booking)} className="inline-flex items-center gap-2 border border-border bg-background px-2.5 py-1.5 text-xs uppercase tracking-wider">
                                                <CircleDashed className="h-3.5 w-3.5" /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="pb-4">
                    <Link to="/admin" className="inline-flex items-center gap-2 font-display text-lg uppercase text-accent"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
                </div>
            </main>
        </div>
    );
}
