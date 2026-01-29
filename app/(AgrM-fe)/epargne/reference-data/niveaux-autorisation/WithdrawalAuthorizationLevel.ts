// Niveau d'autorisation de retrait
export interface WithdrawalAuthorizationLevel {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    minAmount: number;
    maxAmount?: number;
    requiresIdVerification: boolean;
    requiresDualVerification: boolean;
    requiresManagerApproval: boolean;
    requiresNoticeHours: number;
    requiresJustification: boolean;
    isActive: boolean;
    sortOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

export class WithdrawalAuthorizationLevelClass implements WithdrawalAuthorizationLevel {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    minAmount: number = 0;
    maxAmount?: number;
    requiresIdVerification: boolean = true;
    requiresDualVerification: boolean = false;
    requiresManagerApproval: boolean = false;
    requiresNoticeHours: number = 0;
    requiresJustification: boolean = false;
    isActive: boolean = true;
    sortOrder: number = 0;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<WithdrawalAuthorizationLevel>) {
        Object.assign(this, init);
    }
}
