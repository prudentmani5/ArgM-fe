/**
 * DTO representing a single employee's payroll row in the Journal de Paie report.
 */
export class JournalPaieEmployeeDto {
    matriculeId: string = '';
    nom: string = '';
    prenom: string = '';

    // Row 1 columns
    sBase: number = 0;
    logt: number = 0;
    iFam: number = 0;
    deplac: number = 0;
    rapPlusImp: number = 0;
    prime: number = 0;
    brut: number = 0;
    rapMoinsImp: number = 0;
    fpc: number = 0;
    inss: number = 0;
    ipr: number = 0;
    synd: number = 0;
    fondsAval: number = 0;
    cahier: number = 0;
    quinzaine: number = 0;
    totRetenue: number = 0;
    netAPayer: number = 0;

    // Row 2 columns
    iCharge: number = 0;
    iDiv: number = 0;
    regideso: number = 0;
    hs: number = 0;
    rapPlusNI: number = 0;
    rbtAv: number = 0;
    rapMoinsNI: number = 0;
    avSal: number = 0;
    assVie: number = 0;
    jubilee: number = 0;
    assSoc: number = 0;
    rCred: number = 0;
    loyer: number = 0;
    reste: number = 0;
    bnde: number = 0;
    rSportif: number = 0;

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
 * DTO representing a service group in the Journal de Paie report.
 */
export class JournalPaieServiceGroupDto {
    serviceId: string = '';
    serviceLibelle: string = '';
    employees: JournalPaieEmployeeDto[] = [];
    employeeCount: number = 0;

    // Totals for Row 1
    totalSBase: number = 0;
    totalLogt: number = 0;
    totalIFam: number = 0;
    totalDeplac: number = 0;
    totalRapPlusImp: number = 0;
    totalPrime: number = 0;
    totalBrut: number = 0;
    totalRapMoinsImp: number = 0;
    totalFpc: number = 0;
    totalInss: number = 0;
    totalIpr: number = 0;
    totalSynd: number = 0;
    totalFondsAval: number = 0;
    totalCahier: number = 0;
    totalQuinzaine: number = 0;
    totalTotRetenue: number = 0;
    totalNetAPayer: number = 0;

    // Totals for Row 2
    totalICharge: number = 0;
    totalIDiv: number = 0;
    totalRegideso: number = 0;
    totalHs: number = 0;
    totalRapPlusNI: number = 0;
    totalRbtAv: number = 0;
    totalRapMoinsNI: number = 0;
    totalAvSal: number = 0;
    totalAssVie: number = 0;
    totalJubilee: number = 0;
    totalAssSoc: number = 0;
    totalRCred: number = 0;
    totalLoyer: number = 0;
    totalReste: number = 0;
    totalBnde: number = 0;
    totalRSportif: number = 0;
}

/**
 * Main response DTO for the Journal de Paie report.
 */
export class JournalPaieResponseDto {
    periodeId: string = '';
    mois: number = 0;
    annee: number = 0;
    periodeLibelle: string = '';
    serviceGroups: JournalPaieServiceGroupDto[] = [];

    // Grand totals
    grandTotalSBase: number = 0;
    grandTotalLogt: number = 0;
    grandTotalIFam: number = 0;
    grandTotalDeplac: number = 0;
    grandTotalRapPlusImp: number = 0;
    grandTotalPrime: number = 0;
    grandTotalBrut: number = 0;
    grandTotalRapMoinsImp: number = 0;
    grandTotalFpc: number = 0;
    grandTotalInss: number = 0;
    grandTotalIpr: number = 0;
    grandTotalSynd: number = 0;
    grandTotalFondsAval: number = 0;
    grandTotalCahier: number = 0;
    grandTotalQuinzaine: number = 0;
    grandTotalTotRetenue: number = 0;
    grandTotalNetAPayer: number = 0;

    grandTotalICharge: number = 0;
    grandTotalIDiv: number = 0;
    grandTotalRegideso: number = 0;
    grandTotalHs: number = 0;
    grandTotalRapPlusNI: number = 0;
    grandTotalRbtAv: number = 0;
    grandTotalRapMoinsNI: number = 0;
    grandTotalAvSal: number = 0;
    grandTotalAssVie: number = 0;
    grandTotalJubilee: number = 0;
    grandTotalAssSoc: number = 0;
    grandTotalRCred: number = 0;
    grandTotalLoyer: number = 0;
    grandTotalReste: number = 0;
    grandTotalBnde: number = 0;
    grandTotalRSportif: number = 0;

    // Total employee count
    totalEmployeeCount: number = 0;
}
