import React from 'react';
import { useBucket } from '@/contexts/BucketContext';
import { cn } from '@/lib/utils';

export default function AddToBucketButton({ item, className, children = 'Add to bucket' }) {
    const { addItem, hasItem } = useBucket();
    const inBucket = hasItem(item.id);
    const isPackage = item.kind === 'package' || item.kind === 'bundle';

    return (
        <button
            type="button"
            onClick={() => addItem(item)}
            className={cn(className, inBucket && 'bg-accent text-accent-foreground')}
        >
            {inBucket ? 'Selected' : isPackage ? 'Choose package' : children}
        </button>
    );
}
