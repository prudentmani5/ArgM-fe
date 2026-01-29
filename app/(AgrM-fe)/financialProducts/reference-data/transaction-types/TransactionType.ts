export class TransactionType {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    transactionClass: string; // DEBIT, CREDIT
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.transactionClass = 'DEBIT';
        this.isActive = true;
    }
}
