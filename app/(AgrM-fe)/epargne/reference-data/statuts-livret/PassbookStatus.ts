// Statut du livret d'épargne
export interface PassbookStatus {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    allowsTransactions: boolean;
    colorCode?: string;
    isActive: boolean;
    createdAt?: string;
}

export class PassbookStatusClass implements PassbookStatus {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    allowsTransactions: boolean = true;
    colorCode?: string = '#28a745';
    isActive: boolean = true;
    createdAt?: string;

    constructor(init?: Partial<PassbookStatus>) {
        Object.assign(this, init);
    }
}
