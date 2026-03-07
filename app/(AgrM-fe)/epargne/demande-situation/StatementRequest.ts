export enum StatementRequestType {
    SITUATION = 'SITUATION',
    HISTORIQUE = 'HISTORIQUE'
}

export enum StatementRequestStatus {
    PENDING = 'PENDING',
    VALIDATED = 'VALIDATED',
    DELIVERED = 'DELIVERED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export interface StatementRequest {
    id?: number;
    requestNumber?: string;
    requestDate?: string;
    requestType: string;
    periodStart?: string;
    periodEnd?: string;
    savingsAccountId?: number;
    client?: any;
    clientId?: number;
    branch?: any;
    branchId?: number;
    feeAccountId?: number;
    feeAmount: number;
    balanceBefore?: number;
    balanceAfter?: number;
    status: string;
    motif?: string;
    notes?: string;
    validatedBy?: string;
    validatedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    deliveredDate?: string;
    deliveredBy?: string;
    deliveredToName?: string;
    pieceId?: string;
    closingVerified?: boolean;
    caisseId?: number;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class StatementRequestClass implements StatementRequest {
    id?: number;
    requestNumber?: string;
    requestDate?: string;
    requestType: string = 'SITUATION';
    periodStart?: string;
    periodEnd?: string;
    savingsAccountId?: number;
    client?: any;
    clientId?: number;
    branch?: any;
    branchId?: number;
    feeAccountId?: number;
    feeAmount: number = 1000;
    balanceBefore?: number;
    balanceAfter?: number;
    status: string = 'PENDING';
    motif?: string = '';
    notes?: string = '';
    validatedBy?: string;
    validatedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    deliveredDate?: string;
    deliveredBy?: string;
    deliveredToName?: string;
    pieceId?: string;
    closingVerified?: boolean;
    caisseId?: number;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}
