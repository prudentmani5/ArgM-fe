/**
 * DTO representing a single employee in the Listing Jubile (Assurance Jubile) report.
 */
export interface ListingJubileEmployeeDto {
    matriculeId: string;
    nom: string;
    prenom: string;
    base: number;           // BaseJubile from SaisiePaie
    pourcentage: number;    // PourcJubile from SaisiePaie
    montant: number;        // Jubile from SaisiePaie
}

/**
 * Main response DTO for the Listing Jubile (Assurance Jubile) report.
 */
export interface ListingJubileResponseDto {
    periodeId: string;
    mois: number;
    annee: number;
    periodeLibelle: string;     // e.g., "Salaire Novembre / 2025"

    // Bank information for Assurance Jubile
    banqueCode: string;
    banqueLibelle: string;
    compte: string;             // e.g., "327 120 59"

    // Employee list
    employees: ListingJubileEmployeeDto[];

    // Grand totals
    grandTotalMontant: number;
    totalEmployeeCount: number;
}

/**
 * Helper function to format currency
 */
export function formatCurrency(value: number | undefined | null): string {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

/**
 * Helper function to get full name
 */
export function getFullName(employee: ListingJubileEmployeeDto): string {
    return `${employee.nom || ''} ${employee.prenom || ''}`.trim();
}
