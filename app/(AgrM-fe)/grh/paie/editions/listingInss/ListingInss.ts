/**
 * DTO representing a single employee's row in the Listing INSS report.
 *
 * INSS (Institut National de Securite Sociale) - National Social Security Institute
 * This report shows the breakdown of INSS contributions (pension and risk) for each employee.
 */
export class ListingInssEmployeeDto {
    matriculeInss: string = '';    // numINSS from GrhRensIdentification
    matriculeId: string = '';
    nom: string = '';
    prenom: string = '';

    // INSS data from SaisiePaie
    baseInssPension: number = 0;   // Base for pension calculation
    baseInssRisque: number = 0;    // Base for risk calculation
    inssPers: number = 0;          // inssPensionScPers - Personal INSS contribution
    inssPatr: number = 0;          // inssPensionScEmp - Employer INSS contribution (pension)
    inssPatrRisque: number = 0;    // inssPensionRisqueScEmp - Employer INSS contribution (risk)

    // Calculated total
    totalInss: number = 0;         // Sum of inssPers + inssPatr + inssPatrRisque

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
 * Main response DTO for the Listing INSS report.
 */
export class ListingInssResponseDto {
    periodeId: string = '';
    mois: number = 0;
    annee: number = 0;
    periodeLibelle: string = '';
    employees: ListingInssEmployeeDto[] = [];

    // Grand totals
    grandTotalBaseInssPension: number = 0;
    grandTotalBaseInssRisque: number = 0;
    grandTotalInssPers: number = 0;
    grandTotalInssPatr: number = 0;
    grandTotalInssPatrRisque: number = 0;
    grandTotalInss: number = 0;

    // Total employee count
    totalEmployeeCount: number = 0;
}
