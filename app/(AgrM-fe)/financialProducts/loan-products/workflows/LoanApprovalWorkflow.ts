export class LoanApprovalWorkflow {
    id?: number;
    productId: number;
    approvalLevelId: number;
    approvalLevel?: any;
    sequenceOrder: number;
    minLoanAmount?: number;
    maxLoanAmount?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.productId = 0;
        this.approvalLevelId = 0;
        this.sequenceOrder = 1;
        this.isActive = true;
    }
}
