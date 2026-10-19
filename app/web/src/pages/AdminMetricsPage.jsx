import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Eye, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminMetricsPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [metrics, setMetrics] = useState({ totalVisits: 0, pages: [] });
    const [updatedAt, setUpdatedAt] = useState(null);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        let active = true;
        const refreshMetrics = () => {
            fetch('/api/admin/metrics', { cache: 'no-store' })
                .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load metrics.')))
                .then((result) => {
                    if (!active) return;
                    setMetrics(result);
                    setUpdatedAt(new Date());
                    setLoadFailed(false);
                })
                .catch(() => {
                    if (active) setLoadFailed(true);
                });
        };

        refreshMetrics();
        const refreshInterval = window.setInterval(refreshMetrics, 10000);
        window.addEventListener('focus', refreshMetrics);

        return () => {
            active = false;
            window.clearInterval(refreshInterval);
            window.removeEventListener('focus', refreshMetrics);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-primary text-primary-foreground">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 py-4 sm:px-5 sm:py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-display text-sm uppercase tracking-[0.35em] text-accent">Detailerz</p>
                        <h1 className="mt-2 font-display text-3xl uppercase">Page visits</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 font-display text-xs uppercase transition hover:bg-white/10 sm:px-4 sm:text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" /> Dashboard
                        </button>
                        <div className="hidden text-right sm:block">
                            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Signed in as</p>
                            <p className="font-display text-lg uppercase">{user?.name || 'Admin'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 font-display text-xs uppercase transition hover:bg-white/10 sm:px-4 sm:text-sm"
                        >
                            <LogOut className="h-4 w-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-5 sm:py-8">
                <section className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_2fr]">
                    <div className="flex items-center justify-between gap-4 border border-border bg-card p-5">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total page visits</p>
                            <p className="mt-3 font-display text-4xl">{metrics.totalVisits.toLocaleString()}</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
                            <Eye className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 border border-border bg-card p-5">
                        <div>
                            <p className="font-display text-sm uppercase tracking-[0.25em] text-muted-foreground">Customer traffic</p>
                            <h2 className="mt-2 font-display text-2xl uppercase">Visits by page</h2>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {loadFailed ? 'Unable to refresh metrics.' : updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : 'Loading metrics...'}
                                {!loadFailed && ' · Auto-refreshes every 10 seconds'}
                            </p>
                        </div>
                        <BarChart3 className="h-6 w-6 shrink-0 text-accent" />
                    </div>
                </section>

                <section className="border border-border bg-card">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border bg-secondary px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
                        <span>Page</span>
                        <span className="text-right">Visits</span>
                    </div>
                    <div className="divide-y divide-border">
                        {metrics.pages.map((page) => (
                            <div key={page.path} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6">
                                <span className="break-all font-medium">{page.path === '/' ? 'Home' : page.path.replace(/^\//, '').replaceAll('/', ' / ')}</span>
                                <span className="min-w-16 text-right font-display text-xl">{page.visits.toLocaleString()}</span>
                            </div>
                        ))}
                        {metrics.pages.length === 0 && !loadFailed && (
                            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No page visits recorded yet.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}