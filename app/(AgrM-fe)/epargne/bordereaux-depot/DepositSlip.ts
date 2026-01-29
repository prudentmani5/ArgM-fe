// Statuts du bordereau de dépôt
export enum DepositSlipStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED'
}

// Dénominations FBU standard
export const FBU_DENOMINATIONS = [10000, 5000, 2000, 1000, 500, 100, 50, 20, 10];

// Dénomination de billets
export interface CashDenomination {
    id?: number;
    depositSlipId?: number;
    withdrawalRequestId?: number;
    denomination: number;
    quantity: number;
    totalAmount: number;
    createdAt?: string;
}

export class CashDenominationClass implements CashDenomination {
    id?: number;
    depositSlipId?: number;
    withdrawalRequestId?: number;
    denomination: number = 0;
    quantity: number = 0;
    totalAmount: number = 0;
    createdAt?: string;

    constructor(init?: Partial<CashDenomination>) {
        Object.assign(this, init);
        this.totalAmount = this.denomination * this.quantity;
    }
}

// Bordereau de dépôt
export interface DepositSlip {
    id?: number;
    slipNumber: string;
    savingsAccountId: number;
    client?: any;
    clientId?: number;
    depositDate: string;
    depositTime: string;
    amount: number;
    totalAmount: number;
    cashDenominations?: CashDenomination[];
    currency?: any;
    currencyId?: number;
    // Dépôt par tiers
    isThirdPartyDeposit: boolean;
    depositorName?: string;
    depositorIdType?: any;
    depositorIdTypeId?: number;
    depositorIdNumber?: string;
    depositorPhone?: string;
    depositorRelationship?: string;
    // Vérification
    cashCounted: boolean;
    cashCountedBy?: any;
    cashCountedById?: number;
    billsAuthentic: boolean;
    // Statut
    status: string; // PENDING, COMPLETED, CANCELLED, REJECTED
    transactionId?: number;
    receiptNumber?: string;
    receiptPrinted: boolean;
    receiptPrintedAt?: string;
    // Livret
    passbookUpdated: boolean;
    passbookEntry?: any;
    passbookEntryId?: number;
    // Soldes
    balanceBefore?: number;
    balanceAfter?: number;
    // Traitement
    processedBy?: any;
    processedById?: number;
    branch?: any;
    branchId?: number;
    // Annulation
    cancelledAt?: string;
    cancelledBy?: any;
    cancelledById?: number;
    cancellationReason?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    userAction?: string;
}

export class DepositSlipClass implements DepositSlip {
    id?: number;
    slipNumber: string = '';
    savingsAccountId: number = 0;
    client?: any;
    clientId?: number;
    depositDate: string = new Date().toISOString().split('T')[0];
    depositTime: string = new Date().toTimeString().split(' ')[0].substring(0, 5);
    amount: number = 0;
    totalAmount: number = 0;
    cashDenominations?: CashDenomination[] = [];
    currency?: any;
    currencyId?: number;
    isThirdPartyDeposit: boolean = false;
    depositorName?: string = '';
    depositorIdType?: any;
    depositorIdTypeId?: number;
    depositorIdNumber?: string = '';
    depositorPhone?: string = '';
    depositorRelationship?: string = '';
    cashCounted: boolean = false;
    cashCountedBy?: any;
    cashCountedById?: number;
    billsAuthentic: boolean = true;
    status: string = 'PENDING';
    transactionId?: number;
    receiptNumber?: string;
    receiptPrinted: boolean = false;
    receiptPrintedAt?: string;
    passbookUpdated: boolean = false;
    passbookEntry?: any;
    passbookEntryId?: number;
    balanceBefore?: number;
    balanceAfter?: number;
    processedBy?: any;
    processedById?: number;
    branch?: any;
    branchId?: number;
    cancelledAt?: string;
    cancelledBy?: any;
    cancelledById?: number;
    cancellationReason?: string;
    notes?: string = '';
    createdAt?: string;
    updatedAt?: string;
    userAction?: string;

    constructor(init?: Partial<DepositSlip>) {
        Object.assign(this, init);
    }
}
