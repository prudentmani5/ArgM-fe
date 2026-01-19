/**
 * DTO representing a single employee in a bank transfer list.
 */
export interface VirementBancaireEmployeeDto {
    matriculeId: string;
    nom: string;
    prenom: string;
    compte: string;     // Employee's bank account number
    net: number;        // Net salary to transfer
}

/**
 * DTO representing a group of employees from the same bank.
 */
export interface VirementBancaireBanqueGroupDto {
    codeBanque: string;
    sigleBanque: string;        // Bank abbreviation (e.g., "BANCOBU BUJA")
    libelleBanque: string;      // Full bank name
    employees: VirementBancaireEmployeeDto[];
    employeeCount: number;
    totalNet: number;
}

/**
 * Main response DTO for the Virement Bancaire report.
 */
export interface VirementBancaireResponseDto {
    periodeId: string;
    mois: number;
    annee: number;
    periodeLibelle: string;     // e.g., "Salaire Novembre / 2025"

    // Company bank information
    companyBankCode: string;
    companyBankLibelle: string; // e.g., "BANCOBU BUJUMBURA"
    companyBankCompte: string;  // Company's account number

    // Employee groups by bank
    banqueGroups: VirementBancaireBanqueGroupDto[];

    // Grand totals
    grandTotalEmployeeCount: number;
    grandTotalNet: number;
}

/**
 * RHBanque entity for bank selection dropdown.
 */
export interface RHBanque {
    codeBanque: string;
    sigle: string;
    libelleBanque: string;
    compte: string;
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
export function getFullName(employee: VirementBancaireEmployeeDto): string {
    return `${employee.nom || ''} ${employee.prenom || ''}`.trim();
}
