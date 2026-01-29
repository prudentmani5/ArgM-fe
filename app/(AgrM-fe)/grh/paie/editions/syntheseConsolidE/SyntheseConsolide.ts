/**
 * Response DTO for the Synthese Consolidé report.
 * This report summarizes payroll data showing:
 * - Employee totals (same as JournalPaie grand totals)
 * - Employeur (employer) totals (FPC patronal and INSS patronal)
 * - Grand total combining both
 */
export class SyntheseConsolideResponseDto {
    periodeId: string = '';
    mois: number = 0;
    annee: number = 0;
    periodeLibelle: string = '';

    // Employee Row 1 totals (same as JournalPaie grand totals)
    employeSBase: number = 0;
    employeLogt: number = 0;
    employeIFam: number = 0;
    employeDeplac: number = 0;
    employeRapPlusImp: number = 0;
    employePrime: number = 0;
    employeBrut: number = 0;
    employeRapMoinsImp: number = 0;
    employeFpc: number = 0;
    employeInss: number = 0;
    employeIpr: number = 0;
    employeSynd: number = 0;
    employeFondsAval: number = 0;
    employeCahier: number = 0;
    employeQuinzaine: number = 0;
    employeTotRetenue: number = 0;
    employeNetAPayer: number = 0;

    // Employee Row 2 totals
    employeICharge: number = 0;
    employeIDiv: number = 0;
    employeRegideso: number = 0;
    employeHs: number = 0;
    employeRapPlusNI: number = 0;
    employeRbtAv: number = 0;
    employeRapMoinsNI: number = 0;
    employeAvSal: number = 0;
    employeAssVie: number = 0;
    employeJubilee: number = 0;
    employeAssSoc: number = 0;
    employeRCred: number = 0;
    employeLoyer: number = 0;
    employeReste: number = 0;
    employeBnde: number = 0;
    employeRSportif: number = 0;

    // Employeur (Employer/Patronal) totals - only FPC and INSS are populated
    employeurFpc: number = 0;       // pensionComplPatr - FPC patronal
    employeurInss: number = 0;      // sum of inssPensionScEmp - INSS patronal

    // Grand Total Row 1 (Employee + Employeur)
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

    // Grand Total Row 2
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

    static formatCurrency(value: number): string {
        if (value === null || value === undefined) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}
