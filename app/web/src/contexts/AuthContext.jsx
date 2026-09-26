import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import inMemoryDb from '@/lib/inMemoryDb';

const normalizeEmail = (value = '') => String(value || '').trim().toLowerCase();

const DEMO_EMPLOYEE = {
    id: 'demo-employee',
    employeeId: 'emp-101',
    email: 'employee@akaaldetailerz.com',
    name: 'Alex Martinez',
    role: 'employee',
};

const getStoredDemoUser = () => {
    if (typeof window === 'undefined') return null;

    try {
        const storedUser = JSON.parse(window.localStorage.getItem('detailerz-demo-user') || 'null');
        return storedUser?.role === 'employee' ? storedUser : null;
    } catch {
        return null;
    }
};

const writeDemoUser = (nextUser) => {
    if (typeof window === 'undefined') return;

    if (!nextUser) {
        window.localStorage.removeItem('detailerz-demo-user');
        window.dispatchEvent(new CustomEvent('detailerz-auth-sync', { detail: null }));
        return;
    }

    window.localStorage.setItem('detailerz-demo-user', JSON.stringify(nextUser));
    window.dispatchEvent(new CustomEvent('detailerz-auth-sync', { detail: nextUser }));
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const demoUser = getStoredDemoUser();
        const pocketBaseUser = pb?.authStore?.record;
        return demoUser || (pocketBaseUser?.role === 'admin' ? null : pocketBaseUser) || null;
    });

    useEffect(() => {
        if (!pb?.authStore?.onChange) return undefined;

        const handleChange = (_token, record) => setUser(record?.role === 'admin' ? getStoredDemoUser() : record || getStoredDemoUser());
        pb.authStore.onChange(handleChange);

        return () => {
            if (pb?.authStore?.onChange) {
                pb.authStore.onChange(() => {});
            }
        };
    }, []);

    useEffect(() => {
        let active = true;
        fetch('/api/admin/session', { cache: 'no-store' })
            .then((response) => response.ok ? response.json() : null)
            .then((session) => {
                if (active && session?.user) setUser(session.user);
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const handleStorage = (event) => {
            if (event.key === 'detailerz-demo-user') {
                setUser(getStoredDemoUser());
            }
        };

        const handleAuthSync = (event) => {
            setUser(event?.detail || getStoredDemoUser());
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('detailerz-auth-sync', handleAuthSync);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('detailerz-auth-sync', handleAuthSync);
        };
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'employee') return undefined;

        const syncEmployeeUser = () => {
            const employee = inMemoryDb.getEmployees().find((entry) => entry.id === user.employeeId || normalizeEmail(entry.email) === normalizeEmail(user.email));
            if (!employee) return;

            const nextUser = {
                id: employee.id,
                employeeId: employee.id,
                email: employee.email,
                name: employee.name,
                role: 'employee',
            };

            writeDemoUser(nextUser);

            setUser((current) => {
                if (!current) return nextUser;
                return current.id === nextUser.id && current.email === nextUser.email && current.name === nextUser.name
                    ? current
                    : nextUser;
            });
        };

        const unsubscribe = inMemoryDb.subscribe(() => syncEmployeeUser());
        syncEmployeeUser();

        return () => unsubscribe();
    }, [user?.id, user?.employeeId, user?.email, user?.name, user?.role]);

    const value = useMemo(() => ({
        user,
        isAuthed: !!user || !!pb?.authStore?.isValid,
        login: async (email, password, requestedRole) => {
            const normalizedEmail = String(email || '').trim().toLowerCase();

            if (requestedRole === 'admin') {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: normalizedEmail, password }),
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
                setUser(result.user);
                return result.user;
            }

            const employeeMatch = inMemoryDb.getEmployees().find((employee) => normalizeEmail(employee.email) === normalizedEmail);
            if (employeeMatch && String(password || '') === String(employeeMatch.password || 'employee123')) {
                const nextUser = {
                    id: employeeMatch.id,
                    employeeId: employeeMatch.id,
                    email: employeeMatch.email,
                    name: employeeMatch.name,
                    role: 'employee',
                };

                writeDemoUser(nextUser);
                setUser(nextUser);
                return nextUser;
            }

            if (
                normalizedEmail === DEMO_EMPLOYEE.email && String(password || '') === 'employee123'
            ) {
                const nextUser = { ...DEMO_EMPLOYEE, email: normalizedEmail };

                writeDemoUser(nextUser);
                setUser(nextUser);
                return nextUser;
            }

            writeDemoUser(null);

            if (pb?.collection) {
                try {
                    const authData = await pb.collection('users').authWithPassword(email, password);
                    const authenticatedUser = authData?.record || pb.authStore.record || null;
                    if (authenticatedUser?.role === 'admin') {
                        pb.authStore.clear();
                        throw new Error('Use the admin sign-in page.');
                    }
                    setUser(authenticatedUser);
                    return authenticatedUser;
                } catch (error) {
                    if (error?.status === 400 || error?.status === 403 || error?.status === 404) {
                        throw new Error('Invalid email or password.');
                    }
                    throw error;
                }
            }

            throw new Error('Invalid email or password.');
        },
        signup: async (email, password, extraFields = {}) => {
            if (pb?.collection) {
                await pb.collection('users').create({
                    email,
                    password,
                    passwordConfirm: password,
                    ...extraFields,
                });

                const authData = await pb.collection('users').authWithPassword(email, password);
                setUser(authData?.record || pb.authStore.record || null);
                return authData?.record || pb.authStore.record || null;
            }

            throw new Error('Account registration is unavailable.');
        },
        logout: () => {
            if (user?.role === 'admin') {
                fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
            }
            writeDemoUser(null);

            if (pb?.authStore?.clear) {
                pb.authStore.clear();
            }

            setUser(null);
        },
    }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
