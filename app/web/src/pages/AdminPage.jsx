import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, CalendarCheck2, DollarSign, LogOut, Users, Phone, Mail, CarFront, Clock3, TrendingUp, Download, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import inMemoryDb from '@/lib/inMemoryDb';

const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

const EMPTY_EMPLOYEE_OPTION = { id: 'unassigned', name: 'Unassigned' };

const statusColors = {
    Confirmed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    Pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    'In progress': 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    Completed: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
};

export default function AdminPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [records, setRecords] = useState(() => inMemoryDb.getBookings());
    const [employeeOptions, setEmployeeOptions] = useState(() => inMemoryDb.getEmployees());
    const [loading, setLoading] = useState(false);
    const [selectedBookingImages, setSelectedBookingImages] = useState(null);

    useEffect(() => {
        setLoading(true);

        const unsubscribe = inMemoryDb.subscribe((snapshot) => {
            setRecords(snapshot?.bookings || inMemoryDb.getBookings());
            setEmployeeOptions(snapshot?.employees || inMemoryDb.getEmployees());
            setLoading(false);
        });

        setRecords(inMemoryDb.getBookings());
        setEmployeeOptions(inMemoryDb.getEmployees());
        setLoading(false);

        return () => unsubscribe();
    }, []);

    const stats = useMemo(() => inMemoryDb.getStats(), [records]);

    const customers = useMemo(() => inMemoryDb.getCustomers(), [records]);

    const chartSeries = useMemo(() => {
        const monthMap = new Map();

        records.forEach((record) => {
            const month = new Date(record.created).toLocaleString('en-US', { month: 'short' });
            monthMap.set(month, (monthMap.get(month) || 0) + Number(record.amount || 0));
        });

        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => ({
            label: month,
            value: monthMap.get(month) || 0,
        }));
    }, [records]);

    const topCustomers = useMemo(() => {
        const map = new Map();

        records.forEach((record) => {
            const key = record.email || record.name;
            const current = map.get(key) || { name: record.name, email: record.email, total: 0 };
            current.total += Number(record.amount || 0);
            map.set(key, current);
        });

        return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 5);
    }, [records]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleStatusChange = (id, nextStatus) => {
        inMemoryDb.updateBooking(id, { status: nextStatus });
    };

    const handleDelete = (id) => {
        inMemoryDb.deleteBooking(id);
    };

    const handleExport = () => {
        const csv = inMemoryDb.exportCsv();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'detailerz-bookings.csv';
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        inMemoryDb.reset();
    };

    const handleAssignEmployee = (bookingId, employeeId) => {
        const selectedEmployee = employeeOptions.find((option) => option.id === employeeId);
        if (!selectedEmployee || selectedEmployee.id === 'unassigned') {
            inMemoryDb.updateBooking(bookingId, {
                employeeId: null,
                employeeName: '',
            });
            return;
        }

        inMemoryDb.assignBookingToEmployee(bookingId, selectedEmployee);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-primary text-primary-foreground">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5">
                    <div>
                        <p className="font-display text-sm uppercase tracking-[0.35em] text-accent">Detailerz</p>
                        <h1 className="mt-2 font-display text-3xl uppercase">Admin dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/employees')}
                            className="border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase transition hover:bg-white/10"
                        >
                            Employees
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/customers')}
                            className="border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase transition hover:bg-white/10"
                        >
                            Customers
                        </button>
                        <div className="hidden text-right sm:block">
                            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Signed in as</p>
                            <p className="font-display text-lg uppercase">{user?.name || 'Admin'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase transition hover:bg-white/10"
                        >
                            <LogOut className="h-4 w-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1400px] space-y-8 px-5 py-8">
                <section className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 bg-accent px-4 py-2 font-display text-base uppercase text-accent-foreground"
                    >
                        <Download className="h-4 w-4" /> Export CSV
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 font-display text-base uppercase text-foreground"
                    >
                        <RefreshCw className="h-4 w-4" /> Reset demo data
                    </button>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={<DollarSign className="h-5 w-5" />} label="Revenue" value={currency.format(stats.totalRevenue)} tone="accent" />
                    <StatCard icon={<CalendarCheck2 className="h-5 w-5" />} label="Bookings" value={String(stats.bookings)} tone="sky" />
                    <StatCard icon={<Users className="h-5 w-5" />} label="Confirmed" value={String(stats.confirmed)} tone="emerald" />
                    <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Pending" value={String(stats.pending)} tone="amber" />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Revenue trend</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">Monthly revenue</h2>
                            </div>
                            <BarChart3 className="h-6 w-6 text-accent" />
                        </div>

                        <div className="flex h-64 items-end gap-3">
                            {chartSeries.map((item) => (
                                <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                                    <div className="w-full rounded-t bg-gradient-to-t from-amber-500 to-accent/80" style={{ height: `${Math.max((item.value / Math.max(...chartSeries.map((x) => x.value), 1)) * 100, 10)}%` }} />
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Customers</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">Top spenders</h2>
                            </div>
                            <Users className="h-6 w-6 text-accent" />
                        </div>

                        <div className="space-y-4">
                            {topCustomers.map((customer, index) => (
                                <button
                                    key={`${customer.email}-${index}`}
                                    type="button"
                                    onClick={() => navigate(`/admin/customers/${customer.customerId || customer.email}`)}
                                    className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary p-3 text-left transition hover:border-accent/60"
                                >
                                    <div>
                                        <p className="font-display text-lg uppercase">{customer.name}</p>
                                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                                    </div>
                                    <span className="font-display text-xl text-accent">{currency.format(customer.total)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
                    <div className="rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Bookings</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">Latest bookings</h2>
                            </div>
                            <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
                                {loading ? 'Syncing...' : `${records.length} records`}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-secondary text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-3 font-display uppercase tracking-wider">Customer</th>
                                        <th className="px-5 py-3 font-display uppercase tracking-wider">Vehicle</th>
                                        <th className="px-5 py-3 font-display uppercase tracking-wider">Package</th>
                                        <th className="px-5 py-3 font-display uppercase tracking-wider">Date</th>
                                        <th className="px-5 py-3 font-display uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3 font-display uppercase tracking-wider">Amount</th>
                                        <th className="px-5 py-3 font-display uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record) => (
                                        <tr key={record.id} className="border-t border-border align-top">
                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/admin/customers/${record.customerId}`)}
                                                    className="flex min-w-[220px] items-center gap-3 text-left"
                                                >
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                                                        <Users className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-display text-base uppercase">{record.name}</p>
                                                        <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                                            <p className="flex min-w-0 items-center gap-1"><Mail className="h-3 w-3 shrink-0" /> <span className="break-all">{record.email}</span></p>
                                                            <p className="flex min-w-0 items-center gap-1"><Phone className="h-3 w-3 shrink-0" /> <span className="break-all">{record.phone}</span></p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 font-medium text-foreground">
                                                    <CarFront className="h-4 w-4 text-accent" />
                                                    {record.vehicle}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-foreground">{record.package}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock3 className="h-4 w-4 text-accent" />
                                                    {new Date(record.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <select
                                                    value={record.status}
                                                    onChange={(event) => handleStatusChange(record.id, event.target.value)}
                                                    className={`rounded-full border px-2.5 py-1 text-xs uppercase tracking-wider outline-none ${statusColors[record.status] || 'bg-gray-500/10 text-gray-300 border-gray-500/30'}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="In progress">In progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </td>
                                            <td className="px-5 py-4 font-display text-xl text-accent">{currency.format(record.amount)}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedBookingImages(record)}
                                                            disabled={!record.beforeImage && !record.afterImage}
                                                            className="inline-flex items-center gap-2 rounded border border-border bg-secondary px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            View images
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(record.id)}
                                                            className="inline-flex items-center gap-2 rounded border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-red-300"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={record.employeeId || 'unassigned'}
                                                            onChange={(event) => handleAssignEmployee(record.id, event.target.value)}
                                                            className="min-w-[140px] rounded border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider outline-none"
                                                        >
                                                            {[EMPTY_EMPLOYEE_OPTION, ...employeeOptions].map((employee) => (
                                                                <option key={employee.id} value={employee.id}>{employee.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Customers</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">Customer list</h2>
                            </div>
                            <Users className="h-6 w-6 text-accent" />
                        </div>

                        <div className="space-y-4">
                            {customers.map((customer) => (
                                <button
                                    key={customer.customerId || customer.email}
                                    type="button"
                                    onClick={() => navigate(`/admin/customers/${customer.customerId}`)}
                                    className="w-full rounded-lg border border-border bg-secondary p-3 text-left transition hover:border-accent/60"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-display text-lg uppercase">{customer.name}</p>
                                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                                        </div>
                                        <span className="rounded-full border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                                            {customer.bookings} bookings
                                        </span>
                                    </div>

                                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                                        <div className="flex min-w-0 items-start gap-2">
                                            <Phone className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                                            <div className="flex min-w-0 flex-col gap-1">
                                                {(customer.phones && customer.phones.length ? customer.phones : [customer.phone || '(000) 000-0000']).map((phone) => (
                                                    <span key={phone} className="break-all">{phone}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex min-w-0 items-start gap-2">
                                            <Mail className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                                            <div className="flex min-w-0 flex-col gap-1">
                                                {(customer.emails && customer.emails.length ? customer.emails : [customer.email || 'unknown@example.com']).map((email) => (
                                                    <span key={email} className="break-all">{email}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="flex min-w-0 items-center gap-2"><CarFront className="h-3 w-3 shrink-0 text-accent" /> <span className="break-all">{customer.vehicle}</span></p>
                                        <p className="flex min-w-0 items-center gap-2"><DollarSign className="h-3 w-3 shrink-0 text-accent" /> <span>Total: {currency.format(customer.total)}</span></p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {selectedBookingImages && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-3xl rounded-xl border border-border bg-card p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Vehicle photos</p>
                                <h3 className="mt-2 font-display text-2xl uppercase">{selectedBookingImages.name}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedBookingImages(null)}
                                className="border border-border bg-secondary px-3 py-1.5 text-xs uppercase tracking-wider"
                            >
                                Close
                            </button>
                        </div>

                        {selectedBookingImages.beforeImage || selectedBookingImages.afterImage ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="mb-2 font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">Before</p>
                                    {selectedBookingImages.beforeImage ? (
                                        <img src={selectedBookingImages.beforeImage} alt={`${selectedBookingImages.name} before`} className="h-72 w-full rounded-md object-cover" />
                                    ) : (
                                        <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-border bg-secondary text-sm text-muted-foreground">No before image uploaded</div>
                                    )}
                                </div>
                                <div>
                                    <p className="mb-2 font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">After</p>
                                    {selectedBookingImages.afterImage ? (
                                        <img src={selectedBookingImages.afterImage} alt={`${selectedBookingImages.name} after`} className="h-72 w-full rounded-md object-cover" />
                                    ) : (
                                        <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-border bg-secondary text-sm text-muted-foreground">No after image uploaded</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-md border border-dashed border-border bg-secondary p-8 text-center text-muted-foreground">No photos have been added for this booking yet.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, tone }) {
    const toneClass = {
        accent: 'bg-accent/10 text-accent border-accent/30',
        sky: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
        emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    }[tone] || 'bg-secondary text-foreground border-border';

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
                    <p className="mt-3 font-display text-3xl uppercase">{value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${toneClass}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
