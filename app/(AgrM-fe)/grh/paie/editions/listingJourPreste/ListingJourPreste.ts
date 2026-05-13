/**
 * DTO representing a single employee's row in the Synthese des Jours Preste report.
 *
 * This report shows the days worked (preste) for each employee in a pay period.
 */
export class ListingJourPresteEmployeeDto {
    matriculeId: string = '';
    nom: string = '';
    prenom: string = '';
    fonction: string = '';      // Job function from RHFonction
    preste: number = 0;         // Days worked

    getFullName(): string {
        return `${this.nom || ''} ${this.prenom || ''}`.trim();
    }

    static formatDays(value: number): string {
        if (value === null || value === undefined) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
}

/**
 * Main response DTO for the Synthese des Jours Preste report.
 */
export class ListingJourPresteResponseDto {
    periodeId: string = '';
    mois: number = 0;
    annee: number = 0;
    periodeLibelle: string = '';
    employees: ListingJourPresteEmployeeDto[] = [];

    // Grand total
    grandTotalPreste: number = 0;

    // Total employee count
    totalEmployeeCount: number = 0;
}
