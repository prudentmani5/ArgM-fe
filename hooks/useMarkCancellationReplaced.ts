import useConsumApi from './fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { extractReplacementRef } from '@/components/CancellationRefBadge';

/**
 * Hook that marks a cancellation as "replaced" after a new transaction
 * is successfully created with a [REMPLACEMENT ANN-XXX] marker in notes.
 *
 * Usage:
 *   const { markIfNeeded } = useMarkCancellationReplaced();
 *   // in the 'create' success handler:
 *   markIfNeeded(notes, newSlipNumber);
 */
export const useMarkCancellationReplaced = () => {
    const api = useConsumApi('');

    const markIfNeeded = (notes: string | undefined | null, replacedByReference: string) => {
        const ref = extractReplacementRef(notes);
        if (!ref) return;
        api.fetchData(
            { replacedByReference },
            'POST',
            `${API_BASE_URL}/api/epargne/cancellation-requests/mark-replaced/${ref}`,
            'markReplaced'
        );
    };

    return { markIfNeeded };
};
