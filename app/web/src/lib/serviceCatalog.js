import { useEffect, useState } from 'react';
import { SERVICES, SERVICE_ADDONS, SERVICE_PACKAGES } from '@/data/site';

const HIDDEN_SERVICE_NAMES = new Set(['Paint Correction', 'Ceramic Shield Coating']);

export const INITIAL_CATALOG = {
    services: SERVICES.map((service) => ({
        ...service,
        visible: !HIDDEN_SERVICE_NAMES.has(service.name),
    })),
    servicePackages: SERVICE_PACKAGES,
    serviceAddons: SERVICE_ADDONS,
};

export function useServiceCatalog() {
    const [catalog, setCatalog] = useState(INITIAL_CATALOG);

    useEffect(() => {
        let active = true;
        fetch('/api/services', { cache: 'no-store' })
            .then(async (response) => {
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Unable to load services.');
                if (active && result.catalog?.services) {
                    setCatalog({
                        ...INITIAL_CATALOG,
                        ...result.catalog,
                        servicePackages: result.catalog.servicePackages || {},
                        serviceAddons: result.catalog.serviceAddons || {},
                    });
                }
            })
            .catch(() => {});
        return () => { active = false; };
    }, []);

    return {
        ...catalog,
        services: catalog.services.filter((service) => service.visible !== false),
    };
}