export class LoanExpenseAnalysis {
    id?: number;
    applicationId: number;
    application?: any;
    expenseTypeId: number;
    expenseType?: any;
    monthlyAmount: number;
    description?: string;
    verifiedById?: number;
    verifiedBy?: any;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.applicationId = 0;
        this.expenseTypeId = 0;
        this.monthlyAmount = 0;
    }
}
