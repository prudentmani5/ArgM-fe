'use client';
/**
 * Parses a date string into a Date object
 * Supports multiple date formats including ISO strings and "dd/MM/yyyy HH:mm:ss"
 * 
 * @param dateString The date string to parse
 * @returns Date object or null if parsing fails
 */
export const parseDateString = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    
    // Try parsing as ISO string first
    if (dateString.includes('T')) {
        const isoDate = new Date(dateString);
        if (!isNaN(isoDate.getTime())) return isoDate;
    }
    
    // Try parsing as "dd/MM/yyyy HH:mm:ss" format
    const parts = dateString.split(' ');
    console.log("preparing to enter in if");
    if (parts.length === 2) {

        const dateParts = parts[0].split('/');
        const timeParts = parts[1].split(':');
        console.log("dateParts " + dateParts);
        console.log("timeParts " + timeParts);
        if (dateParts.length === 3 && timeParts.length === 3) {
            // Note: Month is 0-based in JavaScript Date
            const parsedDate = new Date(
                parseInt(dateParts[2]),  // year
                parseInt(dateParts[1]) - 1,  // month
                parseInt(dateParts[0]),  // day
                parseInt(timeParts[0]),  // hours
                parseInt(timeParts[1]),  // minutes
                parseInt(timeParts[2])   // seconds
            );
            console.log("parsedDate " + JSON.stringify(parsedDate));
            if (!isNaN(parsedDate.getTime())) return parsedDate;
        }
    }
    
    // Try parsing as just date "dd/MM/yyyy"
    const dateOnlyParts = dateString.split('/');
    if (dateOnlyParts.length === 3) {
        const parsedDate = new Date(
            parseInt(dateOnlyParts[2]),  // year
            parseInt(dateOnlyParts[1]) - 1,  // month
            parseInt(dateOnlyParts[0])   // day
        );
        
        if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
    
    // Fallback to current date if parsing fails
    console.warn(`Failed to parse date string: ${dateString}. Using current date as fallback.`);
    return new Date();
};

/**
 * Formats a Date object to "dd/MM/yyyy HH:mm:ss" string
 * 
 * @param date The Date object to format
 * @returns Formatted date string or empty string if date is null/undefined
 */
export const formatDateToString = (date: Date | null | undefined): string => {
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};