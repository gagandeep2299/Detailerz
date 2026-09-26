import React from 'react';
import { useBucket } from '@/contexts/BucketContext';
import { cn } from '@/lib/utils';

export default function AddToBucketButton({ item, className, children = 'Add to bucket' }) {
    const { addItem, hasItem } = useBucket();
    const inBucket = hasItem(item.id);
    const isPackage = item.kind === 'package' || item.kind === 'bundle';
    const isSelectedAddon = item.kind === 'addon' && inBucket;

    return (
        <button
            type="button"
            onClick={() => addItem(item)}
            disabled={isSelectedAddon}
            className={cn(className, inBucket && 'bg-accent text-accent-foreground')}
        >
            {inBucket ? 'Selected' : isPackage ? 'Choose package' : children}
        </button>
    );
}
