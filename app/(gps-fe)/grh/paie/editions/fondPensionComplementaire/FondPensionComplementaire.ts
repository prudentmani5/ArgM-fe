/**
 * Fond de Pension Complementaire (Complementary Pension Fund) TypeScript interfaces
 */

export interface FondPensionComplementaireEmployeeDto {
    matriculeId: string;
    nom: string;
    prenom: string;
    compte: string;
    fpcPers: number;
    fpcPatr: number;
    total: number;
    fullName?: string;
}

export interface FondPensionComplementaireBanqueGroupDto {
    codeBanque: string;
    sigleBanque: string;
    libelleBanque: string;
    employees: FondPensionComplementaireEmployeeDto[];
    employeeCount: number;
    totalFpcPers: number;
    totalFpcPatr: number;
    totalAmount: number;
}

export interface FondPensionComplementaireResponseDto {
    periodeId: string;
    mois: number;
    annee: number;
    periodeLibelle: string;
    banqueGroups: FondPensionComplementaireBanqueGroupDto[];
    grandTotalEmployeeCount: number;
    grandTotalFpcPers: number;
    grandTotalFpcPatr: number;
    grandTotalAmount: number;
}

/**
 * Format currency with space as thousands separator
 */
export const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).replace(/,/g, ' ');
};

/**
 * Get full name from employee DTO
 */
export const getFullName = (employee: FondPensionComplementaireEmployeeDto): string => {
    if (employee.fullName) return employee.fullName;
    let fullName = '';
    if (employee.nom) fullName = employee.nom;
    if (employee.prenom) fullName += (fullName ? ' ' : '') + employee.prenom;
    return fullName;
};
