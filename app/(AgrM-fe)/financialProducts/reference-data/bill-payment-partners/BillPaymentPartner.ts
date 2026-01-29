export class BillPaymentPartner {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    billPaymentTypeId?: number;
    billPaymentType?: any;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.isActive = true;
    }
}
