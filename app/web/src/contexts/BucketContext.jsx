import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'detailerz-service-bucket';

const BucketContext = createContext(null);

const readSessionItems = () => {
    if (typeof window === 'undefined') return [];

    try {
        const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(parsed)) return [];

        const migrated = parsed.map((item) => {
            if (item.category || (item.kind !== 'package' && item.kind !== 'bundle')) return item;
            return {
                ...item,
                category: item.kind === 'bundle'
                    ? 'bundle'
                    : item.service === 'Interior Cleaning' ? 'interior' : 'exterior',
            };
        });

        return migrated.reduce((items, item) => {
            if (item.kind === 'package' || item.kind === 'bundle') {
                return [...items.filter((entry) => !(entry.kind === item.kind && entry.category === item.category)), { ...item, qty: 1 }];
            }
            return [...items, item];
        }, []);
    } catch {
        return [];
    }
};

const writeSessionItems = (items) => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const makeBucketItem = ({ kind, name, price, service = '', time = '', desc = '', category = '' }) => ({
    id: [kind, service, name].filter(Boolean).join('|').toLowerCase(),
    kind,
    name,
    service,
    category,
    time,
    desc,
    price: Number(price || 0),
});

export const BucketProvider = ({ children }) => {
    const [items, setItems] = useState(() => readSessionItems());

    const commit = useCallback((updater) => {
        setItems((current) => {
            const next = typeof updater === 'function' ? updater(current) : updater;
            writeSessionItems(next);
            return next;
        });
    }, []);

    const addItem = useCallback((item) => {
        if (!item?.id) return;

        commit((current) => {
            if (item.kind === 'package' || item.kind === 'bundle') {
                const sameCategory = current.find((entry) => entry.kind === item.kind && entry.category === item.category);
                if (sameCategory) {
                    return current.map((entry) => entry.id === sameCategory.id ? { ...item, qty: 1 } : entry);
                }
            }

            const existing = current.find((entry) => entry.id === item.id);
            if (existing) {
                return current.map((entry) => (
                    entry.id === item.id
                        ? { ...entry, qty: Number(entry.qty || 1) + 1 }
                        : entry
                ));
            }
            return [...current, { ...item, qty: 1 }];
        });
    }, [commit]);

    const removeItem = useCallback((id) => {
        commit((current) => current.filter((item) => item.id !== id));
    }, [commit]);

    const updateQty = useCallback((id, qty) => {
        const nextQty = Math.max(0, Number(qty || 0));
        commit((current) => current
            .map((item) => (item.id === id
                ? { ...item, qty: item.kind === 'package' || item.kind === 'bundle' ? 1 : nextQty }
                : item))
            .filter((item) => item.qty > 0));
    }, [commit]);

    const clearBucket = useCallback(() => commit([]), [commit]);

    const count = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.qty || 1), 0),
        [items],
    );

    const total = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0),
        [items],
    );

    const hasItem = useCallback(
        (id) => items.some((item) => item.id === id),
        [items],
    );

    const value = useMemo(
        () => ({ items, addItem, removeItem, updateQty, clearBucket, count, total, hasItem }),
        [items, addItem, removeItem, updateQty, clearBucket, count, total, hasItem],
    );

    return <BucketContext.Provider value={value}>{children}</BucketContext.Provider>;
};

export const useBucket = () => {
    const context = useContext(BucketContext);
    if (!context) {
        throw new Error('useBucket must be used within BucketProvider');
    }
    return context;
};
