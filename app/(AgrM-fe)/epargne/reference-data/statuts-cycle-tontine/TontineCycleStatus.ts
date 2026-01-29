// Statut du cycle de tontine
export interface TontineCycleStatus {
    id?: number;
    code: string;
    name: string;
    description?: string;
    allowsContributions: boolean;
    allowsPayout: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class TontineCycleStatusClass implements TontineCycleStatus {
    id?: number;
    code: string = '';
    name: string = '';
    description?: string = '';
    allowsContributions: boolean = true;
    allowsPayout: boolean = false;
    isActive: boolean = true;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<TontineCycleStatus>) {
        Object.assign(this, init);
    }
}
