import { useCurrentUser } from './fetchData/useCurrentUser';

/**
 * useAuthorities Hook
 * ===================
 * Provides authority checking functionality for components.
 *
 * Usage:
 * ```tsx
 * const { hasAuthority, hasAnyAuthority, hasAllAuthorities, authorities } = useAuthorities();
 *
 * // Check single authority
 * if (hasAuthority('INVOICE_CREATE')) {
 *   // Show create invoice button
 * }
 *
 * // Check if user has ANY of the authorities
 * if (hasAnyAuthority(['INVOICE_CREATE', 'INVOICE_UPDATE'])) {
 *   // Show invoice management section
 * }
 *
 * // Check if user has ALL authorities
 * if (hasAllAuthorities(['INVOICE_VIEW', 'INVOICE_VALIDATE'])) {
 *   // Show validation workflow
 * }
 * ```
 */
export const useAuthorities = () => {
    const { user } = useCurrentUser();

    // Get all authorities for current user and filter out role names
    // Role names typically start with "ROLE_" and contain spaces (e.g., "ROLE_Responsable principal des magasins")
    // Actual authorities use underscore-separated uppercase format (e.g., "GPS_SORTIE_VALIDATE_1")
    const allAuthorities: string[] = user?.authorities || [];
    const authorities: string[] = allAuthorities.filter(auth => {
        // Filter out items that look like role names (contain spaces or are descriptive role labels)
        // Keep only authority codes (all uppercase with underscores, no spaces)
        return !auth.includes(' ') && auth === auth.toUpperCase();
    });

    /**
     * Check if user has a specific authority
     */
    const hasAuthority = (authority: string): boolean => {
        if (!user) return false;

        // SUPER_ADMIN has all authorities
        if (authorities.includes('SUPER_ADMIN')) return true;

        return authorities.includes(authority);
    };

    /**
     * Check if user has ANY of the specified authorities
     */
    const hasAnyAuthority = (requiredAuthorities: string[]): boolean => {
        if (!user) return false;

        // SUPER_ADMIN has all authorities
        if (authorities.includes('SUPER_ADMIN')) return true;

        return requiredAuthorities.some(auth => authorities.includes(auth));
    };

    /**
     * Check if user has ALL of the specified authorities
     */
    const hasAllAuthorities = (requiredAuthorities: string[]): boolean => {
        if (!user) return false;

        // SUPER_ADMIN has all authorities
        if (authorities.includes('SUPER_ADMIN')) return true;

        return requiredAuthorities.every(auth => authorities.includes(auth));
    };

    /**
     * Check if user is super admin
     */
    const isSuperAdmin = (): boolean => {
        return authorities.includes('SUPER_ADMIN');
    };

    /**
     * Get authorities by category
     * @param category Category name (e.g., 'INVOICE', 'STOCK', 'USER_MANAGEMENT')
     */
    const getAuthoritiesByCategory = (category: string): string[] => {
        // This is a simple implementation
        // For more accurate categorization, you'd need the full authority objects from backend
        return authorities.filter(auth => auth.startsWith(category));
    };

    return {
        authorities,
        hasAuthority,
        hasAnyAuthority,
        hasAllAuthorities,
        isSuperAdmin,
        getAuthoritiesByCategory
    };
};
