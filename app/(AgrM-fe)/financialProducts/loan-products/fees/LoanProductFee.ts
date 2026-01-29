export class LoanProductFee {
    id?: number;
    productId: number;
    feeTypeId: number;
    feeType?: any;
    calculationMethodId: number;
    calculationMethod?: any;
    fixedAmount?: number;
    percentageRate?: number;
    minAmount?: number;
    maxAmount?: number;
    collectionTime: string; // APPLICATION, APPROVAL, DISBURSEMENT, MONTHLY, CLOSURE, ANNUALLY
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.productId = 0;
        this.feeTypeId = 0;
        this.calculationMethodId = 0;
        this.collectionTime = 'APPLICATION';
        this.isActive = true;
    }
}
