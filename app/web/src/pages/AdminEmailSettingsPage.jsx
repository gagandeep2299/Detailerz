import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, LockKeyhole, LogOut, Mail, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const EMPTY_SETTINGS = {
    host: '',
    port: 587,
    secure: false,
    user: '',
    from: '',
    to: '',
    passwordConfigured: false,
    environmentOverrides: {},
};

const SMTP_FIELDS = [
    { key: 'host', label: 'SMTP host', type: 'text', env: 'SMTP_HOST', placeholder: 'smtp.example.com' },
    { key: 'port', label: 'SMTP port', type: 'number', env: 'SMTP_PORT', placeholder: '587' },
    { key: 'user', label: 'Username', type: 'text', env: 'SMTP_USER', placeholder: 'mailer@example.com' },
    { key: 'from', label: 'Sender address', type: 'text', env: 'SMTP_FROM', placeholder: 'Bookings <mailer@example.com>' },
    { key: 'to', label: 'Admin recipient', type: 'email', env: 'SMTP_TO', placeholder: 'admin@example.com' },
];

const inputClass = 'mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-60';

export default function AdminEmailSettingsPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [settings, setSettings] = useState(EMPTY_SETTINGS);
    const [password, setPassword] = useState('');
    const [clearPassword, setClearPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let active = true;
        fetch('/api/admin/email-settings', { cache: 'no-store' })
            .then(async (response) => {
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Unable to load SMTP settings.');
                if (active) setSettings({ ...EMPTY_SETTINGS, ...result });
            })
            .catch((loadError) => {
                if (active) setError(loadError.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const updateField = (key, value) => {
        setSettings((current) => ({ ...current, [key]: value }));
        setSaved(false);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSaved(false);
        try {
            const fields = ['host', 'port', 'secure', 'user', 'from', 'to'];
            const overrides = settings.environmentOverrides || {};
            const editableSettings = Object.fromEntries(fields
                .filter((field) => !overrides[field])
                .map((field) => [field, field === 'port' ? Number(settings[field]) : field === 'secure' ? settings[field] : settings[field].trim()]));
            const response = await fetch('/api/admin/email-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editableSettings,
                    ...(password && !overrides.pass ? { pass: password } : {}),
                    clearPassword,
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Unable to save SMTP settings.');
            setSettings({ ...EMPTY_SETTINGS, ...result });
            setPassword('');
            setClearPassword(false);
            setSaved(true);
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-primary text-primary-foreground">
                <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-5 py-5">
                    <div>
                        <p className="font-display text-sm uppercase tracking-[0.35em] text-accent">Detailerz</p>
                        <h1 className="mt-2 font-display text-3xl uppercase">Email settings</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => navigate('/admin')} className="flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase transition hover:bg-white/10">
                            <ArrowLeft className="h-4 w-4" /> Dashboard
                        </button>
                        <span className="hidden text-sm text-primary-foreground/70 sm:inline">{user?.name || 'Admin'}</span>
                        <button type="button" onClick={handleLogout} className="flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase transition hover:bg-white/10">
                            <LogOut className="h-4 w-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1100px] px-5 py-8">
                <form onSubmit={handleSave} className="max-w-3xl">
                    <div className="flex items-center gap-3 border-b border-border pb-5">
                        <Mail className="h-6 w-6 text-accent" />
                        <div>
                            <h2 className="font-display text-2xl uppercase">Booking notifications</h2>
                            <p className="mt-1 text-sm text-muted-foreground">New booking requests are emailed to the admin recipient.</p>
                        </div>
                    </div>

                    {loading ? <p className="py-8 text-sm text-muted-foreground">Loading settings...</p> : (
                        <>
                            <div className="grid gap-x-6 gap-y-5 py-6 sm:grid-cols-2">
                                {SMTP_FIELDS.map((field) => {
                                    const overridden = Boolean(settings.environmentOverrides?.[field.key]);
                                    return (
                                        <label key={field.key} className="block text-sm font-medium">
                                            <span className="flex items-center justify-between gap-2">
                                                <span>{field.label}</span>
                                                <span className="flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
                                                    {overridden && <LockKeyhole className="h-3 w-3" />}
                                                    {overridden ? `Environment: ${field.env}` : field.env}
                                                </span>
                                            </span>
                                            <input
                                                type={field.type}
                                                min={field.key === 'port' ? 1 : undefined}
                                                max={field.key === 'port' ? 65535 : undefined}
                                                required={field.key === 'host' || field.key === 'port' || field.key === 'user' || field.key === 'to'}
                                                value={settings[field.key]}
                                                onChange={(event) => updateField(field.key, event.target.value)}
                                                className={inputClass}
                                                placeholder={field.placeholder}
                                                disabled={loading || overridden}
                                            />
                                        </label>
                                    );
                                })}

                                <label className="block text-sm font-medium">
                                    <span className="flex items-center justify-between gap-2">
                                        <span>SMTP password</span>
                                        <span className="text-[11px] font-normal text-muted-foreground">SMTP_PASS</span>
                                    </span>
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(event) => { setPassword(event.target.value); setClearPassword(false); setSaved(false); }}
                                        className={inputClass}
                                        placeholder={settings.passwordConfigured ? 'Saved; enter a new value to replace' : 'Enter SMTP password'}
                                        disabled={Boolean(settings.environmentOverrides?.pass)}
                                    />
                                </label>

                                <label className="flex min-h-[72px] items-center gap-3 border border-border px-3 py-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(settings.secure)}
                                        disabled={Boolean(settings.environmentOverrides?.secure)}
                                        onChange={(event) => updateField('secure', event.target.checked)}
                                        className="h-4 w-4 accent-[var(--accent)]"
                                    />
                                    <span>
                                        <span className="block font-medium">Use secure TLS</span>
                                        <span className="text-xs text-muted-foreground">Environment: SMTP_SECURE</span>
                                    </span>
                                </label>
                            </div>

                            {settings.passwordConfigured && !settings.environmentOverrides?.pass && (
                                <label className="flex items-center gap-2 pb-5 text-sm text-muted-foreground">
                                    <input type="checkbox" checked={clearPassword} onChange={(event) => { setClearPassword(event.target.checked); setPassword(''); }} />
                                    Remove saved SMTP password
                                </label>
                            )}

                            <div className="border-t border-border pt-5">
                                <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
                                    Environment values take precedence over saved values. Recipient can also be set with SMTP_ADMIN_EMAIL; sender defaults to SMTP_USER when SMTP_FROM is not set.
                                </p>
                                {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
                                {saved && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> Settings saved.</p>}
                                <button type="submit" disabled={saving || loading} className="mt-5 flex items-center gap-2 bg-primary px-5 py-3 font-display text-sm uppercase text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
                                    <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save settings'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </main>
        </div>
    );
}