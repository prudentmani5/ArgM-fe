// Statuts de l'épargne obligatoire
export enum CompulsorySavingsStatus {
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED',
    RELEASED = 'RELEASED',
    CLOSED = 'CLOSED'
}

// Épargne obligatoire liée au crédit
export interface CompulsorySavings {
    id?: number;
    savingsAccountId: number;
    loanId: number;
    loanNumber: string;
    client?: any;
    clientId?: number;
    // Montants
    loanAmount: number;
    requiredPercentage: number;
    requiredAmount: number;
    currentBalance: number;
    // Exigence satisfaite
    isRequirementMet: boolean;
    requirementMetDate?: string;
    // Blocage
    isBlocked: boolean;
    blockedAmount: number;
    blockReference?: string;
    // Intérêts
    interestRate: number;
    accruedInterest: number;
    // Statut
    status: string; // PENDING, ACTIVE, RELEASED, DEFAULTED
    // Déblocage
    releaseDate?: string;
    releaseAmount?: number;
    releasedBy?: any;
    releasedById?: number;
    releaseReason?: string;
    releaseTransactionId?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class CompulsorySavingsClass implements CompulsorySavings {
    id?: number;
    savingsAccountId: number = 0;
    loanId: number = 0;
    loanNumber: string = '';
    client?: any;
    clientId?: number;
    loanAmount: number = 0;
    requiredPercentage: number = 10;
    requiredAmount: number = 0;
    currentBalance: number = 0;
    isRequirementMet: boolean = false;
    requirementMetDate?: string;
    isBlocked: boolean = true;
    blockedAmount: number = 0;
    blockReference?: string;
    interestRate: number = 3.0;
    accruedInterest: number = 0;
    status: string = 'ACTIVE';
    releaseDate?: string;
    releaseAmount?: number;
    releasedBy?: any;
    releasedById?: number;
    releaseReason?: string;
    releaseTransactionId?: number;
    notes?: string = '';
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<CompulsorySavings>) {
        Object.assign(this, init);
    }
}
