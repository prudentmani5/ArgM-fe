/**
 * DTO representing a single employee's row in the Listing IRE Recapitulatif report.
 *
 * IRE (Impot sur les Revenues d'Emploi) - Employment Income Tax
 * This is a detailed recapitulation report showing all payroll components
 * used for tax declaration purposes.
 *
 * Columns:
 * - N: Row number
 * - Matr: Employee ID (matriculeId)
 * - NomPrenom: Full name
 * - Base: Base salary
 * - Logement: Housing allowance
 * - AllocFam: Family allowance
 * - Deplacement: Transportation allowance
 * - Autres ind+Prime: Other allowances + bonuses
 * - Rappel: Back pay adjustments
 * - Brut: Gross salary
 * - INSS: Social security contribution (personal)
 * - Tot Pension: Total pension contribution
 * - Base Imposable: Taxable base
 * - IRE: Income tax
 * - Autres Ret: Other deductions
 * - Net: Net salary
 */
export class ListingIreRecapitulatifEmployeeDto {
    matriculeId: string = '';
    nom: string = '';
    prenom: string = '';

    // Payroll components
    base: number = 0;              // Base salary (montantPreste)
    logement: number = 0;          // Housing allowance
    allocFam: number = 0;          // Family allowance (allocFam)
    deplacement: number = 0;       // Transportation allowance
    autresIndPrime: number = 0;    // Other allowances + bonuses (indImp + indNonImp + primeImp + primeNonImp)
    rappel: number = 0;            // Back pay (rappPositifImp + rappPositifNonImp - rappNegatifImp - rappNegatifNonImp)

    // Gross
    brut: number = 0;              // Gross salary

    // Deductions
    inss: number = 0;              // INSS personal contribution (inssPensionScPers)
    totPension: number = 0;        // Total pension (pensionComplPers + mfpPers)
    baseImposable: number = 0;     // Taxable base (baseIpr)
    ire: number = 0;               // Income tax (ipr)
    autresRet: number = 0;         // Other deductions (jubile + retImp + retNonImp + soinsPers)

    // Net
    net: number = 0;               // Net salary

    getFullName(): string {
        return `${this.nom || ''} ${this.prenom || ''}`.trim();
    }

    static formatCurrency(value: number): string {
        if (value === null || value === undefined) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}

/**
 * Main response DTO for the Listing IRE Recapitulatif report.
 */
export class ListingIreRecapitulatifResponseDto {
    periodeId: string = '';
    mois: number = 0;
    annee: number = 0;
    periodeLibelle: string = '';
    employees: ListingIreRecapitulatifEmployeeDto[] = [];

    // Grand totals
    grandTotalBase: number = 0;
    grandTotalLogement: number = 0;
    grandTotalAllocFam: number = 0;
    grandTotalDeplacement: number = 0;
    grandTotalAutresIndPrime: number = 0;
    grandTotalRappel: number = 0;
    grandTotalBrut: number = 0;
    grandTotalInss: number = 0;
    grandTotalTotPension: number = 0;
    grandTotalBaseImposable: number = 0;
    grandTotalIre: number = 0;
    grandTotalAutresRet: number = 0;
    grandTotalNet: number = 0;

    // Total employee count
    totalEmployeeCount: number = 0;
}

/**
 * Helper function to format currency values
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
export function getFullName(employee: ListingIreRecapitulatifEmployeeDto): string {
    return `${employee.nom || ''} ${employee.prenom || ''}`.trim();
}
