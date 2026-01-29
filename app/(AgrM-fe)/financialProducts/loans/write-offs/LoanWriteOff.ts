export class LoanWriteOff {
    id?: number;
    loanId: number;

    // Write-off details
    writeOffDate: string;
    writeOffReason: string;

    // Amounts written off
    principalWrittenOff: number;
    interestWrittenOff: number;
    penaltiesWrittenOff: number;
    totalWrittenOff: number;

    // Recovery potential
    estimatedRecoveryAmount: number;
    collateralValue: number;

    // Classification
    writeOffCategory: string; // TOTAL_LOSS, PARTIAL_RECOVERY, LEGAL_ACTION

    // Approval
    requestedById: number;
    approvedById?: number;
    approvalDate?: string;

    // Legal action
    legalActionTaken: boolean;
    legalActionDate?: string;
    legalCaseNumber?: string;

    // Recovery tracking
    amountRecovered: number;
    recoveryDate?: string;

    // Status
    status: string; // PENDING, APPROVED, REJECTED, COMPLETED, RECOVERED

    // Notes
    notes?: string;

    // Audit
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.loanId = 0;
        this.writeOffDate = new Date().toISOString().split('T')[0];
        this.writeOffReason = '';
        this.principalWrittenOff = 0;
        this.interestWrittenOff = 0;
        this.penaltiesWrittenOff = 0;
        this.totalWrittenOff = 0;
        this.estimatedRecoveryAmount = 0;
        this.collateralValue = 0;
        this.writeOffCategory = 'TOTAL_LOSS';
        this.requestedById = 0;
        this.legalActionTaken = false;
        this.amountRecovered = 0;
        this.status = 'PENDING';
    }
}
