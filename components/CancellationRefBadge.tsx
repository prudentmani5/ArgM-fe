'use client';
import React from 'react';
import { Tag } from 'primereact/tag';

/**
 * Extracts the cancellation request number from a text field containing
 * the marker "[ANNULATION ANN-YYYYMMDD-NNNNN] ...".
 * Returns null if no marker is present.
 */
export const extractCancellationRef = (text?: string | null): string | null => {
    if (!text) return null;
    const match = text.match(/\[ANNULATION\s+(ANN-\d{8}-\d+)]/i);
    return match ? match[1] : null;
};

/**
 * Extracts the replacement reference from a text field containing
 * the marker "[REMPLACEMENT ANN-YYYYMMDD-NNNNN] ...".
 * Returns null if no marker is present.
 */
export const extractReplacementRef = (text?: string | null): string | null => {
    if (!text) return null;
    const match = text.match(/\[REMPLACEMENT\s+(ANN-\d{8}-\d+)]/i);
    return match ? match[1] : null;
};

interface CancellationRefBadgeProps {
    /** Text field that may contain the "[ANNULATION ANN-XXX] ..." marker. */
    text?: string | null;
    /** Optional prefix label shown before the reference. */
    label?: string;
    className?: string;
}

/**
 * Small read-only tag showing the cancellation reference extracted from a
 * source transaction's cancellationReason / rejectionReason / notes field.
 * Renders nothing when no reference is found.
 */
const CancellationRefBadge: React.FC<CancellationRefBadgeProps> = ({
    text,
    label = 'Annulé par',
    className = ''
}) => {
    const cancelRef = extractCancellationRef(text);
    const replaceRef = extractReplacementRef(text);
    if (!cancelRef && !replaceRef) return null;
    return (
        <>
            {cancelRef && (
                <Tag
                    value={`${label} ${cancelRef}`}
                    severity="warning"
                    icon="pi pi-ban"
                    className={className}
                    style={{ fontSize: '0.70rem', marginLeft: '0.25rem' }}
                />
            )}
            {replaceRef && (
                <Tag
                    value={`Remplace ${replaceRef}`}
                    severity="info"
                    icon="pi pi-replay"
                    className={className}
                    style={{ fontSize: '0.70rem', marginLeft: '0.25rem' }}
                />
            )}
        </>
    );
};

export default CancellationRefBadge;
