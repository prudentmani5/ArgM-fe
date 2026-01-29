export class LoanClosure {
    id?: number;
    loanId: number;

    // Closure details
    closureType: string; // MATURED, EARLY_REPAYMENT, WRITTEN_OFF, RESTRUCTURED, TRANSFERRED
    closureDate: string;

    // Final amounts
    finalPrincipalPaid: number;
    finalInterestPaid: number;
    finalPenaltiesPaid: number;
    totalAmountPaid: number;

    // Outstanding at closure
    principalOutstanding: number;
    interestOutstanding: number;
    penaltiesOutstanding: number;
    totalOutstanding: number;

    // Waivers
    principalWaived: number;
    interestWaived: number;
    penaltiesWaived: number;
    waiverReason?: string;

    // Early repayment
    earlyRepaymentPenalty?: number;

    // Write-off
    writeOffAmount?: number;
    writeOffReason?: string;

    // Closure by
    closedById: number;
    approvedById?: number;

    // Notes
    closureNotes?: string;

    // Audit
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.loanId = 0;
        this.closureType = 'MATURED';
        this.closureDate = new Date().toISOString().split('T')[0];
        this.finalPrincipalPaid = 0;
        this.finalInterestPaid = 0;
        this.finalPenaltiesPaid = 0;
        this.totalAmountPaid = 0;
        this.principalOutstanding = 0;
        this.interestOutstanding = 0;
        this.penaltiesOutstanding = 0;
        this.totalOutstanding = 0;
        this.principalWaived = 0;
        this.interestWaived = 0;
        this.penaltiesWaived = 0;
        this.closedById = 0;
    }
}
