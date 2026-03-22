// Statuts du virement
export enum VirementStatus {
    PENDING = 'PENDING',
    VALIDATED = 'VALIDATED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

// Types de virement
export enum TransferType {
    CLIENT_TO_CLIENT = 'CLIENT_TO_CLIENT',
    CLIENT_TO_ACCOUNT = 'CLIENT_TO_ACCOUNT',
    ACCOUNT_TO_CLIENT = 'ACCOUNT_TO_CLIENT'
}

export const TRANSFER_TYPE_OPTIONS = [
    { label: 'Client → Client', value: 'CLIENT_TO_CLIENT' },
    { label: 'Client → Compte Interne', value: 'CLIENT_TO_ACCOUNT' },
    { label: 'Compte Interne → Client', value: 'ACCOUNT_TO_CLIENT' }
];

export const DEFAULT_COMMISSION_RATE = 1.0; // 1%

// Interface matching VirementInterne entity field names
export interface Virement {
    virementId?: number;
    reference: string;
    transferType: string;
    // Caisse-to-caisse fields (not used by epargne, but present in entity)
    caisseSourceId?: number;
    caisseDestId?: number;
    // Source
    sourceSavingsAccount?: any;
    sourceSavingsAccountId?: number; // form helper (sent in DTO, derived from sourceSavingsAccount.id on load)
    sourceAccountCode?: string;
    sourceClient?: any;
    sourceClientId?: number;
    // Destination
    destinationSavingsAccount?: any;
    destinationSavingsAccountId?: number; // form helper
    destinationAccountCode?: string;
    destinationClient?: any;
    destinationClientId?: number;
    // Amounts
    montant: number;
    commissionRate: number;
    commissionAmount: number;
    totalDebitAmount: number;
    // Operation
    libelle?: string;
    motif: string;
    dateVirement: string;
    virementTime: string;
    status: string;
    // Execution
    executedBy?: string;
    executedAt?: string;
    // Validation
    validatedBy?: string;
    validatedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    // Balances
    sourceBalanceBefore?: number;
    sourceBalanceAfter?: number;
    destinationBalanceBefore?: number;
    destinationBalanceAfter?: number;
    // Accounting
    pieceId?: string;
    exerciceId?: number;
    // Infrastructure
    caisseId?: number;
    branch?: any;
    branchId?: number; // form helper
    notes?: string;
    userAction?: string;
    closingVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class VirementClass implements Virement {
    virementId?: number;
    reference: string = '';
    transferType: string = 'CLIENT_TO_CLIENT';
    sourceSavingsAccount?: any;
    sourceAccountCode?: string = '';
    sourceClient?: any;
    destinationSavingsAccount?: any;
    destinationAccountCode?: string = '';
    destinationClient?: any;
    montant: number = 0;
    commissionRate: number = DEFAULT_COMMISSION_RATE;
    commissionAmount: number = 0;
    totalDebitAmount: number = 0;
    libelle?: string = '';
    motif: string = '';
    dateVirement: string = new Date().toISOString().split('T')[0];
    virementTime: string = new Date().toTimeString().split(' ')[0].substring(0, 5);
    status: string = 'PENDING';
    executedBy?: string;
    executedAt?: string;
    validatedBy?: string;
    validatedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    sourceBalanceBefore?: number;
    sourceBalanceAfter?: number;
    destinationBalanceBefore?: number;
    destinationBalanceAfter?: number;
    pieceId?: string;
    exerciceId?: number;
    caisseId?: number;
    branch?: any;
    notes?: string = '';
    userAction?: string;
    closingVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<Virement>) {
        Object.assign(this, init);
    }
}

// ==================== Virement Multiple (Batch) ====================

export interface VirementBatchDetail {
    id?: number;
    sequenceNumber: number;
    destinationSavingsAccount?: any;
    destinationSavingsAccountId?: number;
    destinationClient?: any;
    destinationAccountNumber?: string;
    destinationClientName?: string;
    amount: number;
    destinationBalanceBefore?: number;
    destinationBalanceAfter?: number;
    status?: string;
    failureReason?: string;
    pieceId?: string;
    createdAt?: string;
}

export type BatchSourceType = 'SAVINGS' | 'INTERNAL';

export const BATCH_SOURCE_TYPE_OPTIONS = [
    { label: 'Compte Client (Épargne)', value: 'SAVINGS' },
    { label: 'Compte Interne', value: 'INTERNAL' }
];

export interface VirementBatch {
    id?: number;
    batchNumber?: string;
    sourceType?: BatchSourceType;
    sourceSavingsAccount?: any;
    sourceSavingsAccountId?: number;
    sourceInternalAccount?: any;
    sourceInternalAccountId?: number;
    sourceClient?: any;
    totalAmount: number;
    commissionRate: number;
    commissionAmount: number;
    totalDebitAmount: number;
    numberOfTransfers: number;
    numberOfSuccessful?: number;
    numberOfFailed?: number;
    status: string;
    motif: string;
    notes?: string;
    dateVirement: string;
    virementTime?: string;
    branch?: any;
    branchId?: number;
    pieceId?: string;
    sourceBalanceBefore?: number;
    sourceBalanceAfter?: number;
    validatedBy?: string;
    validatedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    userAction?: string;
    closingVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
    details: VirementBatchDetail[];
}

export class VirementBatchClass implements VirementBatch {
    sourceType?: BatchSourceType = 'SAVINGS';
    sourceSavingsAccountId?: number;
    sourceInternalAccountId?: number;
    totalAmount: number = 0;
    commissionRate: number = DEFAULT_COMMISSION_RATE;
    commissionAmount: number = 0;
    totalDebitAmount: number = 0;
    numberOfTransfers: number = 0;
    status: string = 'PENDING';
    motif: string = '';
    notes?: string = '';
    dateVirement: string = new Date().toISOString().split('T')[0];
    branchId?: number;
    details: VirementBatchDetail[] = [];

    constructor(init?: Partial<VirementBatch>) {
        Object.assign(this, init);
    }
}
