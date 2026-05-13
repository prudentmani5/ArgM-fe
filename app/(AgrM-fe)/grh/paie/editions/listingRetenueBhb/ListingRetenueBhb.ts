/**
 * DTO representing a single employee in the Listing Retenue BHB report.
 */
export interface ListingRetenueBhbEmployeeDto {
    matriculeId: string;
    compte: string;         // Bank account from SaisieRetenue.compte
    nom: string;
    prenom: string;
    montant: number;
}

/**
 * Main response DTO for the Listing Retenue BHB report.
 */
export interface ListingRetenueBhbResponseDto {
    periodeId: string;
    mois: number;
    annee: number;
    periodeLibelle: string;     // e.g., "Salaire Novembre / 2025"

    // Bank information
    banqueCode: string;
    banqueLibelle: string;
    retenueCode: string;
    retenueLibelle: string;     // e.g., "RETENUE BHB"

    // Employee list
    employees: ListingRetenueBhbEmployeeDto[];

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
export function getFullName(employee: ListingRetenueBhbEmployeeDto): string {
    return `${employee.nom || ''} ${employee.prenom || ''}`.trim();
}
