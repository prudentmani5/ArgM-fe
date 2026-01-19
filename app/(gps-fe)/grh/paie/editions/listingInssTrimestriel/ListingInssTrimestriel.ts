/**
 * DTO representing a single employee's row in the Listing INSS Trimestriel report.
 *
 * This report shows the quarterly breakdown of INSS contributions (pension and risk)
 * combining data from 3 pay periods (months) for each trimester.
 */
export class ListingInssTrimestrielEmployeeDto {
    matriculeInss: string = '';      // numINSS from GrhRensIdentification
    matriculeId: string = '';
    nom: string = '';
    prenom: string = '';

    // Combined INSS data from 3 SaisiePaie records
    nbreJours: number = 0;           // Sum of preste for 3 months
    remunPension: number = 0;        // Sum of baseInssPension (capped at 450,000/month)
    remunRisque: number = 0;         // Sum of baseInssRisque (capped at 80,000/month)

    observations: string = '';

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

    static formatDecimal(value: number): string {
        if (value === null || value === undefined) return '0';
        // Format with comma as decimal separator (French format)
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    }
}

/**
 * Main response DTO for the Listing INSS Trimestriel report.
 */
export class ListingInssTrimestrielResponseDto {
    annee: number = 0;
    trimestre: number = 0;           // 1, 2, 3, or 4
    trimestreLibelle: string = '';   // e.g., "PREMIER TRIMESTRE", "DEUXIEME TRIMESTRE"
    employees: ListingInssTrimestrielEmployeeDto[] = [];

    // Grand totals
    grandTotalNbreJours: number = 0;
    grandTotalRemunPension: number = 0;
    grandTotalRemunRisque: number = 0;

    // Total employee count
    totalEmployeeCount: number = 0;

    // Periods included
    periodsIncluded: number = 0;     // Number of periods found (should be 3)
    isComplete: boolean = false;     // true if 3 periods found
    errorMessage: string = '';       // Error message from backend
}

/**
 * Helper to get the trimester label in French
 */
export function getTrimestreLibelle(trimestre: number): string {
    const labels: { [key: number]: string } = {
        1: 'PREMIER TRIMESTRE',
        2: 'DEUXIEME TRIMESTRE',
        3: 'TROISIEME TRIMESTRE',
        4: 'QUATRIEME TRIMESTRE'
    };
    return labels[trimestre] || '';
}

/**
 * Helper to get the months for a trimester
 */
export function getMonthsForTrimestre(trimestre: number): number[] {
    const monthsMap: { [key: number]: number[] } = {
        1: [1, 2, 3],    // Janvier, Fevrier, Mars
        2: [4, 5, 6],    // Avril, Mai, Juin
        3: [7, 8, 9],    // Juillet, Aout, Septembre
        4: [10, 11, 12]  // Octobre, Novembre, Decembre
    };
    return monthsMap[trimestre] || [];
}
