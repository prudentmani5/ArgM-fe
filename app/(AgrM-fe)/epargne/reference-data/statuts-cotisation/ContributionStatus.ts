// Statut de la cotisation
export interface ContributionStatus {
    id?: number;
    code: string;
    name: string;
    description?: string;
    isPaid: boolean;
    isLate: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class ContributionStatusClass implements ContributionStatus {
    id?: number;
    code: string = '';
    name: string = '';
    description?: string = '';
    isPaid: boolean = false;
    isLate: boolean = false;
    isActive: boolean = true;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<ContributionStatus>) {
        Object.assign(this, init);
    }
}
