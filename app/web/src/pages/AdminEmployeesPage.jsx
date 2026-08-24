import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2, UserCog, PencilLine, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import inMemoryDb from '@/lib/inMemoryDb';

const emptyEmployee = {
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    password: 'employee123',
};

export default function AdminEmployeesPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [employees, setEmployees] = useState(() => inMemoryDb.getEmployees());
    const [form, setForm] = useState(emptyEmployee);

    useEffect(() => {
        const unsubscribe = inMemoryDb.subscribe((snapshot) => {
            setEmployees(snapshot?.employees || inMemoryDb.getEmployees());
        });

        setEmployees(inMemoryDb.getEmployees());
        return () => unsubscribe();
    }, []);

    const employeeCount = useMemo(() => employees.length, [employees]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const resetForm = () => setForm(emptyEmployee);

    const handleSave = () => {
        const trimmedName = String(form.name || '').trim();
        const trimmedEmail = String(form.email || '').trim();

        if (!trimmedName || !trimmedEmail) return;

        if (form.id) {
            inMemoryDb.updateEmployee(form.id, {
                name: trimmedName,
                email: trimmedEmail,
                phone: form.phone,
                role: form.role,
                password: form.password || 'employee123',
            });
        } else {
            inMemoryDb.addEmployee({
                name: trimmedName,
                email: trimmedEmail,
                phone: form.phone,
                role: form.role,
                password: form.password || 'employee123',
            });
        }

        resetForm();
    };

    const handleEdit = (employee) => {
        setForm({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            phone: employee.phone || '',
            role: employee.role || 'employee',
            password: employee.password || 'employee123',
        });
    };

    const handleDelete = (employeeId) => {
        inMemoryDb.deleteEmployee(employeeId);
        if (form.id === employeeId) resetForm();
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-primary text-primary-foreground">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5">
                    <div>
                        <p className="font-display text-sm uppercase tracking-[0.35em] text-accent">Detailerz</p>
                        <h1 className="mt-2 font-display text-3xl uppercase">Employee management</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => navigate('/admin')} className="border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase transition hover:bg-white/10">Dashboard</button>
                        <div className="hidden text-right sm:block">
                            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Signed in as</p>
                            <p className="font-display text-lg uppercase">{user?.name || 'Admin'}</p>
                        </div>
                        <button type="button" onClick={handleLogout} className="flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2 font-display text-sm uppercase transition hover:bg-white/10">
                            <LogOut className="h-4 w-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1400px] space-y-8 px-5 py-8">
                <section className="grid gap-6 xl:grid-cols-[0.9fr_1.2fr]">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Staff</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">{form.id ? 'Edit employee' : 'Add employee'}</h2>
                            </div>
                            <UserCog className="h-6 w-6 text-accent" />
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Name</span>
                                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" placeholder="Employee name" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Email</span>
                                <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" placeholder="employee@company.com" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Phone</span>
                                <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" placeholder="(602) 555-0101" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Role</span>
                                <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none">
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Password</span>
                                <input type="text" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm outline-none" placeholder="employee123" />
                            </label>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 bg-accent px-4 py-2 font-display text-base uppercase text-accent-foreground">
                                    <Save className="h-4 w-4" /> {form.id ? 'Update employee' : 'Create employee'}
                                </button>
                                <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 border border-border bg-secondary px-4 py-2 font-display text-base uppercase text-foreground">
                                    <Plus className="h-4 w-4" /> New employee
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <p className="font-display text-sm uppercase tracking-[0.28em] text-muted-foreground">Employees</p>
                                <h2 className="mt-2 font-display text-2xl uppercase">Current team</h2>
                            </div>
                            <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">{employeeCount} active</span>
                        </div>

                        <div className="space-y-3 p-4">
                            {employees.map((employee) => (
                                <div key={employee.id} className="flex flex-col gap-3 rounded-lg border border-border bg-secondary p-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="font-display text-xl uppercase">{employee.name}</p>
                                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{employee.phone || 'No phone on file'} · {employee.role}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => handleEdit(employee)} className="inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-[10px] uppercase tracking-wider">
                                            <PencilLine className="h-3.5 w-3.5" /> Edit
                                        </button>
                                        <button type="button" onClick={() => handleDelete(employee.id)} className="inline-flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] uppercase tracking-wider text-red-300">
                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
