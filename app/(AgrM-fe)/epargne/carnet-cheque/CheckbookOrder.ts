export enum CheckbookOrderStatus {
    PENDING = 'PENDING',
    VALIDATED = 'VALIDATED',
    RECEIVED = 'RECEIVED',
    DELIVERED = 'DELIVERED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export interface CheckbookOrder {
    id?: number;
    orderNumber?: string;
    orderDate?: string;
    savingsAccountId?: number;
    client?: any;
    clientId?: number;
    branch?: any;
    branchId?: number;
    accountingAccountId?: number;
    feeAccountId?: number;
    numberOfLeaves: number;
    unitPrice: number;
    feeAmount: number;
    totalAmount: number;
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
    receivedDate?: string;
    receivedBy?: string;
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

export class CheckbookOrderClass implements CheckbookOrder {
    id?: number;
    orderNumber?: string;
    orderDate?: string;
    savingsAccountId?: number;
    client?: any;
    clientId?: number;
    branch?: any;
    branchId?: number;
    accountingAccountId?: number;
    feeAccountId?: number;
    numberOfLeaves: number = 50;
    unitPrice: number = 5000;
    feeAmount: number = 0;
    totalAmount: number = 5000;
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
    receivedDate?: string;
    receivedBy?: string;
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
