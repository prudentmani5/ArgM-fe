export enum CancellationSourceType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
    VIREMENT = 'VIREMENT'
}

export enum CancellationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface CancellationRequest {
    id?: number;
    requestNumber?: string;
    sourceType: string;
    sourceId?: number;
    sourceReference?: string;
    savingsAccountId?: number;
    accountNumber?: string;
    clientId?: number;
    clientName?: string;
    amount?: number;
    reason: string;
    status?: string;
    branchId?: number;
    caisseId?: number;
    requestedBy?: string;
    requestedAt?: string;
    validatedBy?: string;
    validatedAt?: string;
    validationComment?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    reversalPieceId?: string;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class CancellationRequestClass implements CancellationRequest {
    id?: number;
    requestNumber?: string;
    sourceType: string = CancellationSourceType.DEPOSIT;
    sourceId?: number;
    sourceReference?: string;
    savingsAccountId?: number;
    accountNumber?: string;
    clientId?: number;
    clientName?: string;
    amount?: number;
    reason: string = '';
    status?: string = CancellationStatus.PENDING;
    branchId?: number;
    caisseId?: number;
    requestedBy?: string;
    requestedAt?: string;
    validatedBy?: string;
    validatedAt?: string;
    validationComment?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    reversalPieceId?: string;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}
