export class LoanProductType {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.isActive = true;
    }
}
