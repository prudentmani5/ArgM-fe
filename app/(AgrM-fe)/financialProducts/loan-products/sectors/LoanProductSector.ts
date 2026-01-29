export class LoanProductSector {
    id?: number;
    productId: number;
    sectorId: number;
    sector?: any;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.productId = 0;
        this.sectorId = 0;
    }
}
