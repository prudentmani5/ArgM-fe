export class LoanPayment {
    id?: number;
    loanId: number;
    paymentNumber: string;

    // Amounts
    paymentAmount: number;
    currencyId: number;
    exchangeRate?: number;

    // Allocation
    principalPaid: number;
    interestPaid: number;
    penaltiesPaid: number;

    // Method
    paymentMethod: string; // CASH, BANK_TRANSFER, CHECK, MOBILE_MONEY, CARD
    transactionChannelId?: number;
    mobileMoneyOperatorId?: number;

    // Transaction details
    transactionReference?: string;
    receiptNumber?: string;

    // Dates & people
    paymentDate: string;
    receivedById: number;
    branchId: number;

    // Status
    status: string; // COMPLETED, PENDING, REVERSED, FAILED

    // Notes
    notes?: string;

    // Reversal
    reversedDate?: string;
    reversedById?: number;
    reversalReason?: string;

    // Audit
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.loanId = 0;
        this.paymentNumber = '';
        this.paymentAmount = 0;
        this.currencyId = 0;
        this.principalPaid = 0;
        this.interestPaid = 0;
        this.penaltiesPaid = 0;
        this.paymentMethod = 'CASH';
        this.paymentDate = new Date().toISOString().split('T')[0];
        this.receivedById = 0;
        this.branchId = 0;
        this.status = 'COMPLETED';
    }
}
