/**
 * Date utility functions for consistent date handling across the app.
 * These functions avoid UTC conversion issues when working with local dates.
 */

/**
 * Format a Date object to yyyy-MM-dd string without UTC conversion.
 * Use this instead of toISOString().split('T')[0] to avoid timezone issues.
 * @param date - The Date object to format
 * @returns Formatted date string in yyyy-MM-dd format
 */
export const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Format a Date object to dd/MM/yyyy string (French format) without UTC conversion.
 * @param date - The Date object to format
 * @returns Formatted date string in dd/MM/yyyy format
 */
export const formatLocalDateFR = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
};

/**
 * Format a Date object to yyyy-MM-dd HH:mm:ss string without UTC conversion.
 * @param date - The Date object to format
 * @returns Formatted datetime string in yyyy-MM-dd HH:mm:ss format
 */
export const formatLocalDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Parse a yyyy-MM-dd string to a Date object at midnight local time.
 * @param dateStr - The date string in yyyy-MM-dd format
 * @returns Date object set to midnight local time
 */
export const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Parse a yyyy-MM-dd HH:mm:ss string to a Date object in local time.
 * @param dateTimeStr - The datetime string in yyyy-MM-dd HH:mm:ss format
 * @returns Date object set to the specified local time
 */
export const parseLocalDateTime = (dateTimeStr: string): Date => {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    if (timePart) {
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }
    return new Date(year, month - 1, day);
};

/**
 * Convert a Date object from Calendar component to string for API.
 * @param date - The Date object from Calendar
 * @returns Formatted datetime string in yyyy-MM-dd HH:mm:ss format, or empty string if null
 */
export const dateToString = (date: Date | null | undefined): string => {
    if (!date) return '';
    return formatLocalDateTime(date);
};

/**
 * Convert a string date from API to Date object for Calendar component.
 * @param dateStr - The datetime string in yyyy-MM-dd HH:mm:ss format
 * @returns Date object or null if string is empty
 */
export const stringToDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    return parseLocalDateTime(dateStr);
};
