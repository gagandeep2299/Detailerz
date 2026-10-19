import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Plus, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EXTERIOR_VEHICLE_TYPES } from '@/data/site';
import { INITIAL_CATALOG } from '@/lib/serviceCatalog';

const fieldClass = 'mt-1 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent';
const labelClass = 'block text-xs uppercase tracking-wider text-muted-foreground';
const blankPackage = { name: '', price: '', time: '', desc: '', features: [] };
const blankAddon = { name: '', price: '', icon: 'pet', desc: '' };

const cloneInitialCatalog = () => JSON.parse(JSON.stringify(INITIAL_CATALOG));

export default function AdminServicesPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [catalog, setCatalog] = useState(cloneInitialCatalog);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let active = true;
        fetch('/api/admin/services', { cache: 'no-store' })
            .then(async (response) => {
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Unable to load services.');
                if (active && result.catalog) setCatalog({ ...cloneInitialCatalog(), ...result.catalog });
            })
            .catch((loadError) => { if (active) setError(loadError.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!saved) return undefined;
        const timeout = window.setTimeout(() => setSaved(false), 3000);
        return () => window.clearTimeout(timeout);
    }, [saved]);

    const updateService = (index, field, value) => {
        setCatalog((current) => {
            const services = current.services.map((service, serviceIndex) => serviceIndex === index
                ? { ...service, [field]: value }
                : service);
            if (field !== 'name') return { ...current, services };
            const previousName = current.services[index].name;
            const moveKey = (source) => {
                if (!Object.hasOwn(source, previousName)) return source;
                const next = { ...source, [value]: source[previousName] };
                delete next[previousName];
                return next;
            };
            return { ...current, services, servicePackages: moveKey(current.servicePackages), serviceAddons: moveKey(current.serviceAddons) };
        });
        setSaved(false);
    };

    const addService = () => {
        const existingNames = new Set(catalog.services.map((service) => service.name));
        let name = 'New Service';
        let suffix = 2;
        while (existingNames.has(name)) name = `New Service ${suffix++}`;
        setCatalog((current) => ({
            ...current,
            services: [...current.services, { name, price: 0, time: '', icon: 'exterior', desc: '', visible: true }],
        }));
        setSaved(false);
    };

    const removeService = (service) => {
        if (!window.confirm(`Remove ${service.name} and its packages and add-ons?`)) return;
        setCatalog((current) => {
            const servicePackages = { ...current.servicePackages };
            const serviceAddons = { ...current.serviceAddons };
            delete servicePackages[service.name];
            delete serviceAddons[service.name];
            return {
                ...current,
                services: current.services.filter((item) => item !== service),
                servicePackages,
                serviceAddons,
            };
        });
        setSaved(false);
    };

    const updatePackage = (serviceName, packageIndex, field, value) => {
        setCatalog((current) => ({
            ...current,
            servicePackages: {
                ...current.servicePackages,
                [serviceName]: (current.servicePackages[serviceName] || []).map((item, index) => index === packageIndex
                    ? { ...item, [field]: value }
                    : item),
            },
        }));
        setSaved(false);
    };

    const addPackage = (serviceName) => {
        setCatalog((current) => ({
            ...current,
            servicePackages: {
                ...current.servicePackages,
                [serviceName]: [...(current.servicePackages[serviceName] || []), { ...blankPackage }],
            },
        }));
        setSaved(false);
    };

    const removePackage = (serviceName, packageIndex) => {
        setCatalog((current) => ({
            ...current,
            servicePackages: {
                ...current.servicePackages,
                [serviceName]: current.servicePackages[serviceName].filter((_, index) => index !== packageIndex),
            },
        }));
        setSaved(false);
    };

    const updateAddon = (serviceName, addonIndex, field, value) => {
        setCatalog((current) => ({
            ...current,
            serviceAddons: {
                ...current.serviceAddons,
                [serviceName]: (current.serviceAddons[serviceName] || []).map((item, index) => index === addonIndex
                    ? { ...item, [field]: value }
                    : item),
            },
        }));
        setSaved(false);
    };

    const addAddon = (serviceName) => {
        setCatalog((current) => ({
            ...current,
            serviceAddons: {
                ...current.serviceAddons,
                [serviceName]: [...(current.serviceAddons[serviceName] || []), { ...blankAddon }],
            },
        }));
        setSaved(false);
    };

    const removeAddon = (serviceName, addonIndex) => {
        setCatalog((current) => ({
            ...current,
            serviceAddons: {
                ...current.serviceAddons,
                [serviceName]: current.serviceAddons[serviceName].filter((_, index) => index !== addonIndex),
            },
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        const invalidService = catalog.services.some((service) => !service.name.trim()
            || String(service.price).trim() === '' || !Number.isFinite(Number(service.price)) || Number(service.price) < 0);
        const invalidPackage = Object.values(catalog.servicePackages).flat().some((item) => !item.name.trim()
            || String(item.price).trim() === '' || !Number.isFinite(Number(item.price)) || Number(item.price) < 0
            || Object.values(item.vehiclePrices || {}).some((price) => String(price).trim() === '' || !Number.isFinite(Number(price)) || Number(price) < 0));
        const invalidAddon = Object.values(catalog.serviceAddons).flat().some((item) => !item.name.trim()
            || String(item.price).trim() === '' || !Number.isFinite(Number(item.price)) || Number(item.price) < 0);
        if (invalidService || invalidPackage || invalidAddon) {
            setError('Names and prices are required. Prices must be zero or greater.');
            return;
        }
        if (new Set(catalog.services.map((service) => service.name.trim().toLowerCase())).size !== catalog.services.length) {
            setError('Service names must be unique.');
            return;
        }

        setSaving(true);
        setError('');
        setSaved(false);
        try {
            const response = await fetch('/api/admin/services', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(catalog),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Unable to save the service catalog.');
            setCatalog(result.catalog);
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
                <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 py-5">
                    <div>
                        <p className="font-display text-sm uppercase tracking-[0.35em] text-accent">Detailerz</p>
                        <h1 className="mt-2 font-display text-3xl uppercase">Services & pricing</h1>
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

            <main className="mx-auto max-w-[1400px] px-5 py-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
                    <p className="text-sm text-muted-foreground">Manage the services and all customer-facing prices.</p>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={addService} className="inline-flex items-center gap-2 border border-border px-4 py-2 font-display text-sm uppercase">
                            <Plus className="h-4 w-4" /> Add service
                        </button>
                        <button type="button" onClick={handleSave} disabled={saving || loading} className="inline-flex items-center gap-2 bg-accent px-4 py-2 font-display text-sm uppercase text-accent-foreground disabled:opacity-60">
                            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </div>

                {loading && <p className="py-8 text-sm text-muted-foreground">Loading services...</p>}
                {!loading && catalog.services.length === 0 && <p className="border-y border-border py-10 text-sm text-muted-foreground">No services yet. Add a service to get started.</p>}

                <div className="divide-y divide-border">
                    {catalog.services.map((service, serviceIndex) => {
                        const packages = catalog.servicePackages[service.name] || [];
                        const addons = catalog.serviceAddons[service.name] || [];
                        return <section key={`${service.name}-${serviceIndex}`} className="py-7">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <label className={labelClass}>Service name
                                        <input value={service.name} onChange={(event) => updateService(serviceIndex, 'name', event.target.value)} className={fieldClass} />
                                    </label>
                                    <label className={labelClass}>Starting price ($)
                                        <input type="number" min="0" step="0.01" value={service.price} onChange={(event) => updateService(serviceIndex, 'price', event.target.value)} className={fieldClass} />
                                    </label>
                                    <label className={labelClass}>Time
                                        <input value={service.time} onChange={(event) => updateService(serviceIndex, 'time', event.target.value)} className={fieldClass} placeholder="2 hours" />
                                    </label>
                                    <label className={labelClass}>Icon
                                        <select value={service.icon} onChange={(event) => updateService(serviceIndex, 'icon', event.target.value)} className={fieldClass}>
                                            {['cabin', 'exterior', 'paint', 'ceramic', 'headlights', 'wheels', 'upholstery', 'truck'].map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                                        </select>
                                    </label>
                                    <label className={`${labelClass} sm:col-span-2 lg:col-span-3`}>Description
                                        <textarea rows="2" value={service.desc} onChange={(event) => updateService(serviceIndex, 'desc', event.target.value)} className={fieldClass} />
                                    </label>
                                    <label className="flex items-center gap-2 self-end pb-2 text-sm">
                                        <input type="checkbox" checked={service.visible !== false} onChange={(event) => updateService(serviceIndex, 'visible', event.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
                                        Show on website
                                    </label>
                                </div>
                                <button type="button" onClick={() => removeService(service)} aria-label={`Remove ${service.name}`} title="Remove service" className="border border-red-500/30 p-2 text-red-600 transition hover:bg-red-500/10">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-7 border-t border-border pt-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="font-display text-xl uppercase">Packages</h2>
                                    <button type="button" onClick={() => addPackage(service.name)} className="inline-flex items-center gap-1 border border-border px-3 py-1.5 text-xs uppercase"><Plus className="h-3.5 w-3.5" /> Add package</button>
                                </div>
                                <div className="mt-4 space-y-5">
                                    {packages.map((item, packageIndex) => <div key={`${service.name}-package-${packageIndex}`} className="border-l-2 border-accent pl-4">
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.55fr_0.7fr_2fr_auto]">
                                            <label className={labelClass}>Package name<input value={item.name} onChange={(event) => updatePackage(service.name, packageIndex, 'name', event.target.value)} className={fieldClass} /></label>
                                            <label className={labelClass}>Price ($)<input type="number" min="0" step="0.01" value={item.price} onChange={(event) => updatePackage(service.name, packageIndex, 'price', event.target.value)} className={fieldClass} /></label>
                                            <label className={labelClass}>Time<input value={item.time} onChange={(event) => updatePackage(service.name, packageIndex, 'time', event.target.value)} className={fieldClass} /></label>
                                            <label className={labelClass}>Description<input value={item.desc} onChange={(event) => updatePackage(service.name, packageIndex, 'desc', event.target.value)} className={fieldClass} /></label>
                                            <button type="button" onClick={() => removePackage(service.name, packageIndex)} aria-label={`Remove ${item.name || 'package'}`} title="Remove package" className="self-end border border-border p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                        {item.vehiclePrices && <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                            {EXTERIOR_VEHICLE_TYPES.map((vehicle) => <label key={vehicle.value} className={labelClass}>{vehicle.label} ($)
                                                <input type="number" min="0" step="0.01" value={item.vehiclePrices[vehicle.value] ?? ''} onChange={(event) => updatePackage(service.name, packageIndex, 'vehiclePrices', { ...item.vehiclePrices, [vehicle.value]: event.target.value })} className={fieldClass} />
                                            </label>)}
                                        </div>}
                                        <label className={`${labelClass} mt-3`}>Features, one per line
                                            <textarea rows="3" value={(item.features || []).join('\n')} onChange={(event) => updatePackage(service.name, packageIndex, 'features', event.target.value.split('\n').map((feature) => feature.trim()).filter(Boolean))} className={fieldClass} />
                                        </label>
                                    </div>)}
                                    {packages.length === 0 && <p className="text-xs text-muted-foreground">No packages for this service.</p>}
                                </div>
                            </div>

                            <div className="mt-7 border-t border-border pt-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="font-display text-xl uppercase">Add-ons</h2>
                                    <button type="button" onClick={() => addAddon(service.name)} className="inline-flex items-center gap-1 border border-border px-3 py-1.5 text-xs uppercase"><Plus className="h-3.5 w-3.5" /> Add add-on</button>
                                </div>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    {addons.map((item, addonIndex) => <div key={`${service.name}-addon-${addonIndex}`} className="grid items-end gap-3 border-b border-border pb-4 sm:grid-cols-[1fr_0.5fr_0.8fr_1.6fr_auto]">
                                        <label className={labelClass}>Add-on name<input value={item.name} onChange={(event) => updateAddon(service.name, addonIndex, 'name', event.target.value)} className={fieldClass} /></label>
                                        <label className={labelClass}>Price ($)<input type="number" min="0" step="0.01" value={item.price} onChange={(event) => updateAddon(service.name, addonIndex, 'price', event.target.value)} className={fieldClass} /></label>
                                        <label className={labelClass}>Icon
                                            <select value={item.icon || 'pet'} onChange={(event) => updateAddon(service.name, addonIndex, 'icon', event.target.value)} className={fieldClass}>
                                                {['pet', 'odor', 'vehicle-size', 'caliper', 'headlights'].map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                                            </select>
                                        </label>
                                        <label className={labelClass}>Description<input value={item.desc} onChange={(event) => updateAddon(service.name, addonIndex, 'desc', event.target.value)} className={fieldClass} /></label>
                                        <button type="button" onClick={() => removeAddon(service.name, addonIndex)} aria-label={`Remove ${item.name || 'add-on'}`} title="Remove add-on" className="border border-border p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                                    </div>)}
                                    {addons.length === 0 && <p className="text-xs text-muted-foreground">No add-ons for this service.</p>}
                                </div>
                            </div>
                        </section>;
                    })}
                </div>

                <div className="sticky bottom-0 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background py-4">
                    <div>
                        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                    </div>
                    <button type="button" onClick={handleSave} disabled={saving || loading} className="inline-flex items-center gap-2 bg-primary px-5 py-3 font-display text-sm uppercase text-primary-foreground disabled:opacity-60">
                        <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </main>
            {saved && <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-50 border border-emerald-700/20 bg-emerald-700 px-5 py-3 text-sm font-medium text-white shadow-lg">
                Service changes saved.
            </div>}
        </div>
    );
}