export class LoanSchedule {
    id?: number;
    loanId: number;
    installmentNumber: number;

    // Amounts due
    principalDue: number;
    interestDue: number;
    totalDue: number;

    // Amounts paid
    principalPaid: number;
    interestPaid: number;
    penaltiesPaid: number;
    totalPaid: number;

    // Outstanding
    principalOutstanding: number;
    interestOutstanding: number;

    // Dates
    dueDate: string;
    paidDate?: string;

    // Status
    status: string; // PENDING, PARTIALLY_PAID, FULLY_PAID, OVERDUE, WRITTEN_OFF
    daysOverdue?: number;

    // Restructuring
    isRestructured: boolean;
    originalScheduleId?: number;

    // Audit
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.loanId = 0;
        this.installmentNumber = 1;
        this.principalDue = 0;
        this.interestDue = 0;
        this.totalDue = 0;
        this.principalPaid = 0;
        this.interestPaid = 0;
        this.penaltiesPaid = 0;
        this.totalPaid = 0;
        this.principalOutstanding = 0;
        this.interestOutstanding = 0;
        this.dueDate = '';
        this.status = 'PENDING';
        this.isRestructured = false;
    }
}
