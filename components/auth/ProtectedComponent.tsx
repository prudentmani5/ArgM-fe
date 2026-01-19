import React from 'react';
import { useAuthorities } from '../../hooks/useAuthorities';

interface ProtectedComponentProps {
    /**
     * Single authority required to view this component
     */
    authority?: string;

    /**
     * User must have ANY of these authorities (OR condition)
     */
    anyAuthority?: string[];

    /**
     * User must have ALL of these authorities (AND condition)
     */
    allAuthorities?: string[];

    /**
     * Component to render when user has permission
     */
    children: React.ReactNode;

    /**
     * Component to render when user doesn't have permission (optional)
     * If not provided, nothing will be rendered
     */
    fallback?: React.ReactNode;
}

/**
 * ProtectedComponent
 * ==================
 * Conditionally renders children based on user authorities.
 *
 * Usage Examples:
 *
 * 1. Single authority check:
 * ```tsx
 * <ProtectedComponent authority="INVOICE_CREATE">
 *   <Button label="Create Invoice" />
 * </ProtectedComponent>
 * ```
 *
 * 2. ANY authority check (OR):
 * ```tsx
 * <ProtectedComponent anyAuthority={['INVOICE_CREATE', 'INVOICE_UPDATE']}>
 *   <InvoiceManagementPanel />
 * </ProtectedComponent>
 * ```
 *
 * 3. ALL authorities check (AND):
 * ```tsx
 * <ProtectedComponent allAuthorities={['INVOICE_VIEW', 'INVOICE_VALIDATE']}>
 *   <InvoiceValidationWorkflow />
 * </ProtectedComponent>
 * ```
 *
 * 4. With fallback:
 * ```tsx
 * <ProtectedComponent
 *   authority="INVOICE_CREATE"
 *   fallback={<Message severity="warn" text="Insufficient permissions" />}
 * >
 *   <Button label="Create Invoice" />
 * </ProtectedComponent>
 * ```
 */
export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
    authority,
    anyAuthority,
    allAuthorities,
    children,
    fallback = null
}) => {
    const { hasAuthority, hasAnyAuthority, hasAllAuthorities } = useAuthorities();

    let hasPermission = false;

    if (authority) {
        hasPermission = hasAuthority(authority);
    } else if (anyAuthority && anyAuthority.length > 0) {
        hasPermission = hasAnyAuthority(anyAuthority);
    } else if (allAuthorities && allAuthorities.length > 0) {
        hasPermission = hasAllAuthorities(allAuthorities);
    } else {
        // No authority specified, render by default
        hasPermission = true;
    }

    return <>{hasPermission ? children : fallback}</>;
};
