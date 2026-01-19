/**
 * DTO representing a single employee's row in the Listing IRE report.
 *
 * IRE (Impot sur les Revenues d'Emploi) - Employment Income Tax
 * Tax brackets:
 * - Bracket 1: 0 to 150,000 BIF at 0%
 * - Bracket 2: 150,001 to 300,000 BIF at 20%
 * - Bracket 3: Above 300,000 BIF at 30%
 */
export class ListingIreEmployeeDto {
    matriculeId: string = '';
    nom: string = '';
    prenom: string = '';

    // Payroll data
    base: number = 0;           // montantPreste (S.Base)
    logt: number = 0;           // logement
    deplac: number = 0;         // deplacement
    brut: number = 0;           // brut salary
    inss: number = 0;           // inssPensionScPers (INSS pension)

    // Tranche 1: 0 - 150,000 BIF at 0%
    bracket1Imposable: number = 0;  // Amount taxable in bracket 1
    bracket1Tax: number = 0;        // Tax from bracket 1 (always 0)

    // Tranche 2: 150,001 - 300,000 BIF at 20%
    bracket2Imposable: number = 0;  // Amount taxable in bracket 2
    bracket2Tax: number = 0;        // Tax from bracket 2

    // Tranche 3: Above 300,000 BIF at 30%
    bracket3Imposable: number = 0;  // Amount taxable in bracket 3
    bracket3Tax: number = 0;        // Tax from bracket 3

    // Summary
    brutImposable: number = 0;      // baseIpr (taxable gross)
    ire: number = 0;                // Total IRE (ipr field)
    net: number = 0;                // Net salary

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
 * Main response DTO for the Listing IRE report.
 */
export class ListingIreResponseDto {
    periodeId: string = '';
    mois: number = 0;
    annee: number = 0;
    periodeLibelle: string = '';
    employees: ListingIreEmployeeDto[] = [];

    // Grand totals
    grandTotalBase: number = 0;
    grandTotalLogt: number = 0;
    grandTotalDeplac: number = 0;
    grandTotalBrut: number = 0;
    grandTotalInss: number = 0;
    grandTotalBracket1Imposable: number = 0;
    grandTotalBracket1Tax: number = 0;
    grandTotalBracket2Imposable: number = 0;
    grandTotalBracket2Tax: number = 0;
    grandTotalBracket3Imposable: number = 0;
    grandTotalBracket3Tax: number = 0;
    grandTotalBrutImposable: number = 0;
    grandTotalIre: number = 0;
    grandTotalNet: number = 0;

    // Total employee count
    totalEmployeeCount: number = 0;
}
