export class LoanApprovalWorkflow {
    id?: number;
    productId: number;
    approvalLevelId: number;
    approvalLevel?: any;
    sequenceNumber: number;
    minAmount?: number;
    maxAmount?: number;
    isRequired: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.productId = 0;
        this.approvalLevelId = 0;
        this.sequenceNumber = 1;
        this.isRequired = true;
    }
}
