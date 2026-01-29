export class LoanPenalty {
    id?: number;
    loanId: number;
    scheduleId?: number;

    // Penalty details
    penaltyType: string; // LATE_PAYMENT, MISSED_PAYMENT, EARLY_REPAYMENT
    penaltyAmount: number;
    amountPaid: number;
    amountOutstanding: number;

    // Calculation
    calculationMethod: string; // FIXED, PERCENTAGE_OF_INSTALLMENT, DAILY_RATE
    rate?: number;
    daysOverdue?: number;

    // Dates
    penaltyDate: string;
    dueDate?: string;

    // Status
    status: string; // PENDING, PARTIALLY_PAID, PAID, WAIVED

    // Waiver
    waivedDate?: string;
    waivedById?: number;
    waiverReason?: string;

    // Created by
    createdById: number;

    // Audit
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.loanId = 0;
        this.penaltyType = 'LATE_PAYMENT';
        this.penaltyAmount = 0;
        this.amountPaid = 0;
        this.amountOutstanding = 0;
        this.calculationMethod = 'FIXED';
        this.penaltyDate = new Date().toISOString().split('T')[0];
        this.status = 'PENDING';
        this.createdById = 0;
    }
}
