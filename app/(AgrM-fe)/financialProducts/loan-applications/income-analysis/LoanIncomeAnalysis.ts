export class LoanIncomeAnalysis {
    id?: number;
    applicationId: number;
    application?: any;
    incomeTypeId: number;
    incomeType?: any;
    monthlyAmount: number;
    sourceDescription?: string;
    documentId?: number;
    document?: any;
    isVerified: boolean;
    verifiedById?: number;
    verifiedBy?: any;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.applicationId = 0;
        this.incomeTypeId = 0;
        this.monthlyAmount = 0;
        this.isVerified = false;
    }
}
