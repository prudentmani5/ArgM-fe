export class LoanProductGuarantee {
    id?: number;
    productId: number;
    guaranteeTypeId: number;
    guaranteeType?: any;
    minValue?: number;
    maxValue?: number;
    isRequired: boolean;
    description?: string;
    descriptionFr?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.productId = 0;
        this.guaranteeTypeId = 0;
        this.isRequired = false;
    }
}
