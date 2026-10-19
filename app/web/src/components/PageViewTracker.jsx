import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PageViewTracker = () => {
    const { pathname } = useLocation();
    const lastTrackedPath = useRef(null);

    useEffect(() => {
        if (lastTrackedPath.current === pathname || pathname.startsWith('/admin') || pathname.startsWith('/employee')) return;
        lastTrackedPath.current = pathname;
        fetch('/api/metrics/page-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: pathname }),
            keepalive: true,
        }).catch(() => {});
    }, [pathname]);

    return null;
};

export default PageViewTracker;