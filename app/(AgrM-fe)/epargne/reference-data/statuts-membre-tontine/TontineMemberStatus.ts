// Statut du membre de tontine
export interface TontineMemberStatus {
    id?: number;
    code: string;
    name: string;
    description?: string;
    canContribute: boolean;
    canReceivePayout: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class TontineMemberStatusClass implements TontineMemberStatus {
    id?: number;
    code: string = '';
    name: string = '';
    description?: string = '';
    canContribute: boolean = true;
    canReceivePayout: boolean = true;
    isActive: boolean = true;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<TontineMemberStatus>) {
        Object.assign(this, init);
    }
}
