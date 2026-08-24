import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import inMemoryDb from '@/lib/inMemoryDb';

const normalizeEmail = (value = '') => String(value || '').trim().toLowerCase();

const DEMO_ADMIN = {
    id: 'demo-admin',
    email: 'admin@akaaldetailerz.com',
    name: 'Akaal Detailerz Admin',
    role: 'admin',
};

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
        return JSON.parse(window.localStorage.getItem('detailerz-demo-user') || 'null');
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
        return demoUser || pb?.authStore?.record || null;
    });

    useEffect(() => {
        if (!pb?.authStore?.onChange) return undefined;

        const handleChange = (_token, record) => setUser(record || getStoredDemoUser());
        pb.authStore.onChange(handleChange);

        return () => {
            if (pb?.authStore?.onChange) {
                pb.authStore.onChange(() => {});
            }
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
        login: async (email, password) => {
            const normalizedEmail = String(email || '').trim().toLowerCase();
            const demoUser = getStoredDemoUser();

            if (
                normalizedEmail === DEMO_ADMIN.email && String(password || '') === 'admin123'
            ) {
                const nextUser = { ...DEMO_ADMIN, email: normalizedEmail };

                writeDemoUser(nextUser);
                setUser(nextUser);
                return nextUser;
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
                    setUser(authData?.record || pb.authStore.record || null);
                    return authData?.record || pb.authStore.record || null;
                } catch (error) {
                    if (error?.status === 400 || error?.status === 403 || error?.status === 404) {
                        throw new Error('Invalid email or password.');
                    }
                    throw error;
                }
            }

            if (demoUser) {
                setUser(demoUser);
                return demoUser;
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

            const nextUser = {
                ...DEMO_ADMIN,
                email: String(email || '').trim().toLowerCase(),
                name: extraFields.name || 'Demo Admin',
            };

            writeDemoUser(nextUser);
            setUser(nextUser);
            return nextUser;
        },
        logout: () => {
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
