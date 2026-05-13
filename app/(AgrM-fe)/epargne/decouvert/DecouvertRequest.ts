export type DecouvertStatus =
    | 'PENDING'
    | 'VERIFIED'
    | 'APPROVED'
    | 'DISBURSED'
    | 'REJECTED'
    | 'CANCELLED';

export interface DecouvertRequest {
    id?: number;
    requestNumber?: string;
    savingsAccountId?: number;
    client?: any;
    solidarityGroup?: any;

    requestedAmount?: number;
    interestRate?: number;
    interestAmount?: number;
    totalAmount?: number;

    requestDate?: string;
    requestTime?: string;

    balanceAtRequest?: number;
    balanceAfterDisbursement?: number;

    portefeuilleDecouvertAccountCode?: string;
    interetAccountCode?: string;
    penaliteAccountCode?: string;

    status?: DecouvertStatus;
    motif?: string;
    notes?: string;

    verifiedBy?: string;
    verifiedAt?: string;
    verificationComments?: string;

    approvedBy?: string;
    approvedAt?: string;
    approvalComments?: string;

    disbursedBy?: string;
    disbursedAt?: string;

    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;

    pieceId?: string;
    branch?: any;
    closingVerified?: boolean;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class DecouvertRequestClass implements DecouvertRequest {
    savingsAccountId?: number;
    requestedAmount?  = undefined;
    interestRate?     = 5.0;
    interestAmount?   = 0;
    totalAmount?      = 0;
    motif?            = '';
    notes?            = '';
    status?           = 'PENDING' as DecouvertStatus;
}

export const STATUS_LABELS: Record<DecouvertStatus, string> = {
    PENDING:   'En attente',
    VERIFIED:  'Vérifié',
    APPROVED:  'Approuvé',
    DISBURSED: 'Décaissé',
    REJECTED:  'Rejeté',
    CANCELLED: 'Annulé',
};

export const STATUS_SEVERITY: Record<DecouvertStatus, 'warning' | 'info' | 'success' | 'danger'> = {
    PENDING:   'warning',
    VERIFIED:  'info',
    APPROVED:  'info',
    DISBURSED: 'success',
    REJECTED:  'danger',
    CANCELLED: 'warning',
};
