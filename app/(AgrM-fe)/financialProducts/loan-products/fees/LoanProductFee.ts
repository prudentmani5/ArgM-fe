export interface FeeType {
    id: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    isActive?: boolean;
}

export interface FeeCalculationMethod {
    id: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    isActive?: boolean;
}

export class LoanProductFee {
    id?: number;
    productId: number;
    feeTypeId: number;
    feeType?: FeeType;
    calculationMethodId: number;
    calculationMethod?: FeeCalculationMethod;
    fixedAmount?: number;
    percentageRate?: number;
    minAmount?: number;
    maxAmount?: number;
    collectionTime: string; // APPLICATION, APPROVAL, DISBURSEMENT, MONTHLY, CLOSURE, ANNUALLY
    isActive: boolean;
    isMandatory?: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.productId = 0;
        this.feeTypeId = 0;
        this.calculationMethodId = 0;
        this.collectionTime = 'APPLICATION';
        this.isActive = true;
        this.isMandatory = false;
    }
}
