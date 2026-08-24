import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const { user, login, isAuthed } = useAuth();
    const [form, setForm] = useState({ email: 'admin@akaaldetailerz.com', password: 'admin123' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (isAuthed && user && user.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(form.email, form.password);
            navigate('/admin');
        } catch (err) {
            setError(err?.message || 'Unable to sign in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-12 text-primary-foreground">
            <div className="w-full max-w-md rounded-lg border border-white/10 bg-card p-8 shadow-2xl text-card-foreground">
                <div className="mb-6">
                    <p className="font-display text-sm uppercase tracking-[0.35em] text-accent">Akaal Detailerz Admin</p>
                    <h1 className="mt-3 font-display text-4xl uppercase">Sign in</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="block">
                        <span className="mb-2 block font-display text-lg uppercase">Email</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                            className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                            placeholder="admin@akaaldetailerz.com"
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block font-display text-lg uppercase">Password</span>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                            className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                            placeholder="••••••••"
                            required
                        />
                    </label>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex min-h-[48px] w-full items-center justify-center bg-accent font-display text-lg uppercase text-accent-foreground disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 rounded border border-border bg-secondary p-3 text-xs text-muted-foreground">
                    Demo credentials: admin@akaaldetailerz.com / admin123
                </div>
            </div>
        </div>
    );
}
