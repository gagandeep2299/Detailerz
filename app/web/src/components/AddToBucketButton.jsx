import React from 'react';
import { useBucket } from '@/contexts/BucketContext';

export default function AddToBucketButton({ item, className, children = 'Add to bucket' }) {
    const { addItem, hasItem } = useBucket();
    const inBucket = hasItem(item.id);

    return (
        <button
            type="button"
            onClick={() => addItem(item)}
            className={className}
        >
            {inBucket ? 'Add another' : children}
        </button>
    );
}
