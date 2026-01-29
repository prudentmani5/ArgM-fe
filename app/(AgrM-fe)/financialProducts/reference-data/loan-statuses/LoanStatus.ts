export class LoanStatus {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    statusGroup: string; // APPLICATION, ACTIVE, CLOSED, PROBLEM
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.statusGroup = 'APPLICATION';
        this.isActive = true;
    }
}
