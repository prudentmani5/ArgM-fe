export class LoanPaymentAllocation {
    id?: number;
    paymentId: number;
    scheduleId: number;

    // Allocated amounts
    principalAmount: number;
    interestAmount: number;
    penaltyAmount: number;
    totalAmount: number;

    // Audit
    createdAt?: string;

    constructor() {
        this.paymentId = 0;
        this.scheduleId = 0;
        this.principalAmount = 0;
        this.interestAmount = 0;
        this.penaltyAmount = 0;
        this.totalAmount = 0;
    }
}
