// Durée du dépôt à terme
export interface TermDuration {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    months: number;
    interestRate: number;
    isActive: boolean;
    sortOrder: number;
    createdAt?: string;
}

export class TermDurationClass implements TermDuration {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    months: number = 3;
    interestRate: number = 5.0;
    isActive: boolean = true;
    sortOrder: number = 0;
    createdAt?: string;

    constructor(init?: Partial<TermDuration>) {
        Object.assign(this, init);
    }
}
