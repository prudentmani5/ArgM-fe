import { formatLocalDateTime } from './dateUtils';

/**
 * Interface for period search data transfer.
 * Matches the backend PeriodSearchDTO.
 */
export interface PeriodSearch {
    startDate: string;
    endDate: string;
}

/**
 * Create a PeriodSearch object from Date objects.
 * Start date is set to beginning of day (00:00:00).
 * End date is set to end of day (23:59:59).
 *
 * @param startDate - Start date (can be null)
 * @param endDate - End date (can be null)
 * @returns PeriodSearch object with formatted date strings
 */
export const createPeriodSearch = (
    startDate: Date | null | undefined,
    endDate: Date | null | undefined
): PeriodSearch => {
    let startStr = '';
    let endStr = '';

    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        startStr = formatLocalDateTime(start);
    }

    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        endStr = formatLocalDateTime(end);
    }

    return { startDate: startStr, endDate: endStr };
};
