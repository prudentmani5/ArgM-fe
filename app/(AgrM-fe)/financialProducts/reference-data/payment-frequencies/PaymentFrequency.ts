export class PaymentFrequency {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    paymentsPerYear: number;
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.paymentsPerYear = 12;
        this.isActive = true;
    }
}
