import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Image as ImageIcon, CheckCircle2, Clock3, UserCircle2, Camera, Upload, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import inMemoryDb from '@/lib/inMemoryDb';

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

export default function EmployeePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [records, setRecords] = useState(() => inMemoryDb.getBookings());
    const [activeOrderId, setActiveOrderId] = useState(null);
    const [form, setForm] = useState({
        status: 'Pending',
        beforeImage: '',
        afterImage: '',
        feedback: '',
        rating: 5,
    });

    useEffect(() => {
        const unsubscribe = inMemoryDb.subscribe((snapshot) => {
            setRecords(snapshot?.bookings || inMemoryDb.getBookings());
        });
        setRecords(inMemoryDb.getBookings());
        return () => unsubscribe();
    }, []);

    const liveEmployee = useMemo(() => {
        const employees = inMemoryDb.getEmployees();
        return employees.find((employee) => (
            employee.id === user?.employeeId
            || employee.id === user?.id
            || employee.email?.toLowerCase() === String(user?.email || '').toLowerCase()
            || employee.name === user?.name
        )) || employees.find((employee) => employee.name === 'Alex Martinez') || employees[0] || null;
    }, [user?.email, user?.employeeId, user?.id, user?.name]);

    const employeeId = liveEmployee?.id || user?.employeeId || 'emp-101';
    const employeeName = liveEmployee?.name || user?.name || 'Alex Martinez';

    const assignedOrders = useMemo(
        () => inMemoryDb.getBookingsForEmployee(employeeId, employeeName),
        [employeeId, employeeName, records],
    );

    const pendingOrders = assignedOrders.filter((booking) => booking.status !== 'Completed');
    const completedOrders = assignedOrders.filter((booking) => booking.status === 'Completed');

    const currentOrder = useMemo(
        () => assignedOrders.find((booking) => booking.id === activeOrderId) || pendingOrders[0] || completedOrders[0] || null,
        [assignedOrders, activeOrderId, pendingOrders, completedOrders],
    );

    useEffect(() => {
        if (currentOrder && (!activeOrderId || activeOrderId !== currentOrder.id)) {
            setActiveOrderId(currentOrder.id);
        }
    }, [currentOrder, activeOrderId]);

    useEffect(() => {
        if (!currentOrder) return;
        setForm({
            status: currentOrder.status,
            beforeImage: currentOrder.beforeImage || '',
            afterImage: currentOrder.afterImage || '',
            feedback: currentOrder.feedback?.message || '',
            rating: currentOrder.feedback?.rating || 5,
        });
    }, [currentOrder]);

    const handleUpdateStatus = (status) => {
        if (!currentOrder) return;
        inMemoryDb.updateBookingStatus(currentOrder.id, status, {
            employeeId: employeeId,
            employeeName: employeeName,
        });
    };

    const handleSaveImages = () => {
        if (!currentOrder) return;
        inMemoryDb.updateBookingImages(currentOrder.id, form.beforeImage, form.afterImage);
    };

    const handleSendFeedback = () => {
        if (!currentOrder) return;
        inMemoryDb.submitFeedback(currentOrder.id, {
            rating: Number(form.rating),
            message: form.feedback,
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/employee/login');
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-primary text-primary-foreground">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5">
                    <div>
                        <p className="font-display text-sm uppercase tracking-[0.35em] text-accent">Detailerz</p>
                        <h1 className="mt-2 font-display text-3xl uppercase">Employee planner</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden text-right sm:block">
                            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Assigned worker</p>
                            <p className="font-display text-lg uppercase">{employeeName}</p>
                        </div>
                        <button type="button" onClick={handleLogout} className="flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase transition hover:bg-white/10">
                            <LogOut className="h-4 w-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1400px] space-y-8 px-5 py-8">
                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Orders</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">Pending bookings</h2>
                            </div>
                            <Clock3 className="h-6 w-6 text-accent" />
                        </div>

                        <div className="space-y-3 p-4">
                            {pendingOrders.length === 0 ? (
                                <div className="rounded border border-border bg-secondary p-6 text-sm text-muted-foreground">No pending orders assigned.</div>
                            ) : (
                                pendingOrders.map((booking) => (
                                    <button
                                        key={booking.id}
                                        type="button"
                                        onClick={() => setActiveOrderId(booking.id)}
                                        className={`w-full rounded-lg border p-4 text-left transition ${activeOrderId === booking.id ? 'border-accent bg-accent/5' : 'border-border bg-secondary hover:border-accent/60'}`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-display text-xl uppercase">{booking.name}</p>
                                                <p className="text-xs text-muted-foreground">{booking.vehicle}</p>
                                            </div>
                                            <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider ${statusColors[booking.status] || 'bg-secondary text-foreground border-border'}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{booking.package}</span>
                                            <span>{currency.format(booking.amount)}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Completed</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">Finished jobs</h2>
                            </div>
                            <CheckCircle2 className="h-6 w-6 text-accent" />
                        </div>

                        <div className="space-y-3 p-4">
                            {completedOrders.length === 0 ? (
                                <div className="rounded border border-border bg-secondary p-6 text-sm text-muted-foreground">No completed orders yet.</div>
                            ) : (
                                completedOrders.map((booking) => (
                                    <button
                                        key={booking.id}
                                        type="button"
                                        onClick={() => setActiveOrderId(booking.id)}
                                        className={`w-full rounded-lg border p-4 text-left transition ${activeOrderId === booking.id ? 'border-accent bg-accent/5' : 'border-border bg-secondary hover:border-accent/60'}`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-display text-xl uppercase">{booking.name}</p>
                                                <p className="text-xs text-muted-foreground">{booking.vehicle}</p>
                                            </div>
                                            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-violet-300">Completed</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {currentOrder && (
                    <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
                        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Order details</p>
                                    <h2 className="mt-2 font-display text-2xl uppercase">{currentOrder.name}</h2>
                                </div>
                                <UserCircle2 className="h-6 w-6 text-accent" />
                            </div>

                            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                                <div><span className="font-display uppercase tracking-[0.2em] text-foreground">Vehicle</span><p className="mt-1">{currentOrder.vehicle}</p></div>
                                <div><span className="font-display uppercase tracking-[0.2em] text-foreground">Package</span><p className="mt-1">{currentOrder.package}</p></div>
                                <div><span className="font-display uppercase tracking-[0.2em] text-foreground">Phone</span><p className="mt-1">{currentOrder.phone}</p></div>
                                <div><span className="font-display uppercase tracking-[0.2em] text-foreground">Email</span><p className="mt-1 break-all">{currentOrder.email}</p></div>
                                <div><span className="font-display uppercase tracking-[0.2em] text-foreground">Preferred date</span><p className="mt-1">{new Date(currentOrder.preferred_date).toLocaleDateString()}</p></div>
                                <div><span className="font-display uppercase tracking-[0.2em] text-foreground">Amount</span><p className="mt-1 text-accent">{currency.format(currentOrder.amount)}</p></div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <button type="button" onClick={() => handleUpdateStatus('Pending')} className="rounded border border-border bg-secondary px-3 py-2 text-xs uppercase tracking-widest">Pending</button>
                                <button type="button" onClick={() => handleUpdateStatus('Confirmed')} className="rounded border border-border bg-secondary px-3 py-2 text-xs uppercase tracking-widest">Confirmed</button>
                                <button type="button" onClick={() => handleUpdateStatus('In progress')} className="rounded border border-border bg-secondary px-3 py-2 text-xs uppercase tracking-widest">In progress</button>
                                <button type="button" onClick={() => handleUpdateStatus('Completed')} className="rounded border border-accent bg-accent/10 px-3 py-2 text-xs uppercase tracking-widest text-accent">Completed</button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Gallery</p>
                                    <h2 className="mt-2 font-display text-2xl uppercase">Before & after</h2>
                                </div>
                                <Camera className="h-6 w-6 text-accent" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm text-muted-foreground">
                                    <span className="mb-2 block font-display uppercase tracking-[0.2em] text-foreground">Before image</span>
                                    <input value={form.beforeImage} onChange={(event) => setForm((item) => ({ ...item, beforeImage: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" placeholder="https://..." />
                                </label>
                                <label className="block text-sm text-muted-foreground">
                                    <span className="mb-2 block font-display uppercase tracking-[0.2em] text-foreground">After image</span>
                                    <input value={form.afterImage} onChange={(event) => setForm((item) => ({ ...item, afterImage: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" placeholder="https://..." />
                                </label>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {form.beforeImage && (
                                    <img src={form.beforeImage} alt="Before" className="h-40 w-full rounded-md object-cover" />
                                )}
                                {form.afterImage && (
                                    <img src={form.afterImage} alt="After" className="h-40 w-full rounded-md object-cover" />
                                )}
                            </div>

                            <button type="button" onClick={handleSaveImages} className="mt-5 inline-flex items-center gap-2 bg-accent px-4 py-2 font-display text-base uppercase text-accent-foreground">
                                <Upload className="h-4 w-4" /> Save images
                            </button>
                        </div>
                    </section>
                )}

                {currentOrder && currentOrder.status === 'Completed' && (
                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Customer feedback</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">Feedback request</h2>
                            </div>
                            <Send className="h-6 w-6 text-accent" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-[0.3fr_1fr]">
                            <label className="block">
                                <span className="mb-2 block font-display uppercase tracking-[0.2em] text-foreground">Rating</span>
                                <select value={form.rating} onChange={(event) => setForm((item) => ({ ...item, rating: Number(event.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none">
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Good</option>
                                    <option value="3">3 - Average</option>
                                    <option value="2">2 - Poor</option>
                                    <option value="1">1 - Very poor</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block font-display uppercase tracking-[0.2em] text-foreground">Feedback</span>
                                <textarea value={form.feedback} onChange={(event) => setForm((item) => ({ ...item, feedback: event.target.value }))} rows={4} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" placeholder="Share your experience with the finished detail." />
                            </label>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button type="button" onClick={handleSendFeedback} className="inline-flex items-center gap-2 bg-accent px-4 py-2 font-display text-base uppercase text-accent-foreground">
                                <Send className="h-4 w-4" /> Send feedback
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
