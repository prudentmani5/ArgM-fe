export class LoanApplication {
    id?: number;
    applicationNumber: string;
    clientId?: number;
    client?: any;
    solidarityGroupId?: number;
    solidarityGroup?: any;
    productId: number;
    product?: any;
    requestedAmount: number;
    approvedAmount?: number;
    termMonths: number;
    interestRate: number;
    currencyId: number;
    currency?: any;
    loanPurposeId?: number;
    loanPurpose?: any;
    purposeDescription?: string;
    applicationDate: string;
    status: string; // PENDING, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN, DISBURSED
    currentStageId?: number;
    currentStage?: any;
    branchId: number;
    branch?: any;
    submittedById?: number;
    submittedBy?: any;
    submittedAt?: string;
    reviewedById?: number;
    reviewedBy?: any;
    reviewedAt?: string;
    approvedById?: number;
    approvedBy?: any;
    approvedAt?: string;
    rejectedById?: number;
    rejectedBy?: any;
    rejectedAt?: string;
    rejectionReason?: string;
    decisionTypeId?: number;
    decisionType?: any;
    decisionDate?: string;
    decisionNotes?: string;
    riskLevelId?: number;
    riskLevel?: any;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.applicationNumber = '';
        this.productId = 0;
        this.requestedAmount = 0;
        this.termMonths = 12;
        this.interestRate = 0;
        this.currencyId = 0;
        this.applicationDate = new Date().toISOString().split('T')[0];
        this.status = 'PENDING';
        this.branchId = 0;
    }
}
