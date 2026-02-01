export class LoanProductGuarantee {
    id?: number;
    productId: number;
    guaranteeTypeId: number;
    guaranteeType?: any;
    minCoveragePercentage?: number;
    isMandatory: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.productId = 0;
        this.guaranteeTypeId = 0;
        this.isMandatory = false;
        this.isActive = true;
    }
}
