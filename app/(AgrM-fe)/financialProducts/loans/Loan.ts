export class Loan {
    id?: number;
    loanNumber: string; // Auto-generated
    applicationId: number; // FK to LoanApplication
    clientId?: number;
    solidarityGroupId?: number;
    productId: number;

    // Amounts
    approvedAmount: number;
    disbursedAmount: number;
    outstandingPrincipal: number;
    outstandingInterest: number;
    outstandingPenalties: number;
    totalOutstanding: number;

    // Terms
    termMonths: number;
    paymentFrequencyId: number;
    numberOfPayments: number;

    // Interest
    interestRate: number;
    interestCalculationMethodId: number;

    // Dates
    approvalDate: string;
    disbursementDate?: string;
    firstPaymentDate?: string;
    maturityDate?: string;

    // Status
    status: string; // APPROVED, DISBURSED, ACTIVE, OVERDUE, RESTRUCTURED, CLOSED, WRITTEN_OFF

    // Additional
    currencyId: number;
    branchId: number;
    loanOfficerId: number;

    // Audit
    createdById?: number;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.loanNumber = '';
        this.applicationId = 0;
        this.productId = 0;
        this.approvedAmount = 0;
        this.disbursedAmount = 0;
        this.outstandingPrincipal = 0;
        this.outstandingInterest = 0;
        this.outstandingPenalties = 0;
        this.totalOutstanding = 0;
        this.termMonths = 12;
        this.paymentFrequencyId = 0;
        this.numberOfPayments = 0;
        this.interestRate = 0;
        this.interestCalculationMethodId = 0;
        this.approvalDate = '';
        this.status = 'APPROVED';
        this.currencyId = 0;
        this.branchId = 0;
        this.loanOfficerId = 0;
    }
}
