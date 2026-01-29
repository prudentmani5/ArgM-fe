export class LoanCapacitySummary {
    id?: number;
    applicationId: number;
    application?: any;
    totalMonthlyIncome: number;
    totalMonthlyExpenses: number;
    netMonthlyIncome: number;
    monthlyObligations: number;
    availableMonthlyCapacity: number;
    proposedMonthlyPayment: number;
    debtToIncomeRatio: number;
    capacityAssessment: string; // EXCELLENT, GOOD, MODERATE, WEAK, INSUFFICIENT
    analysisNotes?: string;
    analyzedById?: number;
    analyzedBy?: any;
    analyzedAt?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.applicationId = 0;
        this.totalMonthlyIncome = 0;
        this.totalMonthlyExpenses = 0;
        this.netMonthlyIncome = 0;
        this.monthlyObligations = 0;
        this.availableMonthlyCapacity = 0;
        this.proposedMonthlyPayment = 0;
        this.debtToIncomeRatio = 0;
        this.capacityAssessment = 'MODERATE';
    }
}
