// Statut du dépôt à terme
export interface TermDepositStatus {
    id?: number;
    code: string;
    name: string;
    description?: string;
    allowsWithdrawal: boolean;
    allowsRenewal: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class TermDepositStatusClass implements TermDepositStatus {
    id?: number;
    code: string = '';
    name: string = '';
    description?: string = '';
    allowsWithdrawal: boolean = false;
    allowsRenewal: boolean = false;
    isActive: boolean = true;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<TermDepositStatus>) {
        Object.assign(this, init);
    }
}
