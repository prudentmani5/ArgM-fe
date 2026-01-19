/**
 * DTO representing a single employee in the Listing Retenue report.
 */
export interface ListingRetenueEmployeeDto {
    matriculeId: string;
    nom: string;
    prenom: string;
    compte: string;         // Bank account from SaisieRetenue.compte
    codeBanque: string;     // Bank code from SaisieRetenue.codeBanque
    taux: number;           // Taux from SaisieRetenue
    montant: number;        // Montant from SaisieRetenue
}

/**
 * Main response DTO for the Listing Retenue report.
 */
export interface ListingRetenueResponseDto {
    periodeId: string;
    mois: number;
    annee: number;
    periodeLibelle: string;     // e.g., "Salaire Novembre / 2025"

    // Retenue information
    retenueCode: string;        // e.g., "BHB", "CRE"
    retenueLibelle: string;     // e.g., "RETENUE BHB", "CREDIT PERSONNEL"

    // Bank information (from first employee with codeBanque)
    banque: string;             // codeBanque from first employee
    banqueLibelle: string;      // libelleBanque from RHBanque lookup
    compte: string;             // compte from first employee with codeBanque

    // Employee list
    employees: ListingRetenueEmployeeDto[];

    // Grand totals
    grandTotalMontant: number;
    totalEmployeeCount: number;
}

/**
 * Retenue Parametre type for dropdown selection
 */
export interface RetenueParametre {
    codeRet: string;
    libelleRet: string;
    imposable: boolean;
    estCredit: boolean;
    compteCompta: string;
    actif: boolean;
    displayInPaymentToDO: boolean;
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
export function getFullName(employee: ListingRetenueEmployeeDto): string {
    return `${employee.nom || ''} ${employee.prenom || ''}`.trim();
}
