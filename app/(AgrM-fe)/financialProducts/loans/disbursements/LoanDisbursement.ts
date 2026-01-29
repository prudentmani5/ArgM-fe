export class LoanDisbursement {
    id?: number;
    loanId: number;
    disbursementNumber: string;

    // Amounts
    disbursedAmount: number;
    currencyId: number;
    exchangeRate?: number;

    // Method
    disbursementMethod: string; // CASH, BANK_TRANSFER, CHECK, MOBILE_MONEY, DIRECT_DEPOSIT

    // Banking details
    bankAccountNumber?: string;
    checkNumber?: string;
    mobileMoneyOperatorId?: number;
    mobileMoneyNumber?: string;

    // Dates & people
    disbursementDate: string;
    disbursedById: number;
    receivedBy?: string; // Client signature/name

    // Status
    status: string; // PENDING, APPROVED, DISBURSED, CANCELLED

    // Notes
    notes?: string;

    // Audit
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.loanId = 0;
        this.disbursementNumber = '';
        this.disbursedAmount = 0;
        this.currencyId = 0;
        this.disbursementMethod = 'CASH';
        this.disbursementDate = new Date().toISOString().split('T')[0];
        this.disbursedById = 0;
        this.status = 'PENDING';
    }
}
