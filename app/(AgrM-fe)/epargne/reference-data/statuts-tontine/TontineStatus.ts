// Statut du groupe de tontine
export interface TontineStatus {
    id?: number;
    code: string;
    name: string;
    description?: string;
    allowsNewMembers: boolean;
    allowsContributions: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class TontineStatusClass implements TontineStatus {
    id?: number;
    code: string = '';
    name: string = '';
    description?: string = '';
    allowsNewMembers: boolean = true;
    allowsContributions: boolean = true;
    isActive: boolean = true;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<TontineStatus>) {
        Object.assign(this, init);
    }
}
