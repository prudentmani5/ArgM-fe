export class LoanRestructuring {
    id?: number;
    loanId: number;

    // Restructuring details
    restructuringDate: string;
    restructuringReason: string;

    // Original terms
    originalPrincipal: number;
    originalInterestRate: number;
    originalTermMonths: number;
    originalMaturityDate: string;

    // New terms
    newPrincipal: number;
    newInterestRate: number;
    newTermMonths: number;
    newMaturityDate: string;

    // Outstanding at restructuring
    principalOutstanding: number;
    interestOutstanding: number;
    penaltiesOutstanding: number;

    // Treatment of arrears
    arrearsCapitalized: number;
    arrearsWaived: number;
    arrearsRescheduled: number;

    // Grace period
    gracePeriodMonths?: number;

    // Fees
    restructuringFee: number;

    // Approval
    requestedById: number;
    approvedById?: number;
    approvalDate?: string;

    // Status
    status: string; // PENDING, APPROVED, REJECTED, IMPLEMENTED

    // Notes
    notes?: string;

    // Audit
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.loanId = 0;
        this.restructuringDate = new Date().toISOString().split('T')[0];
        this.restructuringReason = '';
        this.originalPrincipal = 0;
        this.originalInterestRate = 0;
        this.originalTermMonths = 0;
        this.originalMaturityDate = '';
        this.newPrincipal = 0;
        this.newInterestRate = 0;
        this.newTermMonths = 0;
        this.newMaturityDate = '';
        this.principalOutstanding = 0;
        this.interestOutstanding = 0;
        this.penaltiesOutstanding = 0;
        this.arrearsCapitalized = 0;
        this.arrearsWaived = 0;
        this.arrearsRescheduled = 0;
        this.restructuringFee = 0;
        this.requestedById = 0;
        this.status = 'PENDING';
    }
}
