export class LoanProductDocument {
    id?: number;
    productId: number;
    documentTypeId: number;
    documentType?: any;
    isRequired: boolean;
    description?: string;
    descriptionFr?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.productId = 0;
        this.documentTypeId = 0;
        this.isRequired = false;
    }
}
