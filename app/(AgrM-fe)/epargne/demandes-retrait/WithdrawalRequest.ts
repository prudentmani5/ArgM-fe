// Statuts de la demande de retrait
export enum WithdrawalStatus {
    PENDING = 'PENDING',
    ID_VERIFIED = 'ID_VERIFIED',
    FIRST_VERIFIED = 'FIRST_VERIFIED',
    SECOND_VERIFIED = 'SECOND_VERIFIED',
    MANAGER_APPROVED = 'MANAGER_APPROVED',
    APPROVED = 'APPROVED',
    DISBURSED = 'DISBURSED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

// Demande de retrait
export interface WithdrawalRequest {
    id?: number;
    requestNumber: string;
    savingsAccountId: number;
    client?: any;
    clientId?: number;
    requestDate: string;
    requestTime: string;
    requestedAmount: number;
    currency?: any;
    currencyId?: number;
    authorizationLevel?: any;
    authorizationLevelId?: number;
    // Document d'identité
    idDocumentType?: any;
    idDocumentTypeId?: number;
    idDocumentNumber?: string;
    idVerified: boolean;
    idVerifiedBy?: any;
    idVerifiedById?: number;
    // Livret
    passbookPresented: boolean;
    passbook?: any;
    passbookId?: number;
    pinVerified: boolean;
    // Motif
    withdrawalPurpose?: string;
    supportingDocumentPath?: string;
    // Préavis
    noticeRequired: boolean;
    noticeGivenDate?: string;
    earliestWithdrawalDate?: string;
    // Soldes
    balanceAtRequest?: number;
    balanceAfterWithdrawal?: number;
    respectsMinimumBalance: boolean;
    // Statut
    status: string; // PENDING, VERIFIED, APPROVED, REJECTED, DISBURSED, CANCELLED, EXPIRED
    // Double vérification
    dualVerificationRequired: boolean;
    firstVerifier?: string;
    firstVerifiedAt?: string;
    secondVerifier?: string;
    secondVerifiedAt?: string;
    // Approbation manager
    requiresManagerApproval: boolean;
    managerApproved?: boolean;
    manager?: string;
    managerApprovedAt?: string;
    managerComments?: string;
    // Montants approuvés/décaissés
    approvedAmount?: number;
    disbursedAmount?: number;
    disbursementDate?: string;
    disbursementTime?: string;
    transactionId?: number;
    receiptNumber?: string;
    // Mise à jour livret
    passbookUpdated: boolean;
    passbookEntry?: any;
    passbookEntryId?: number;
    // Signature client
    clientSigned: boolean;
    clientSignedAt?: string;
    signatureImagePath?: string;
    // Personnel
    requestedByStaff?: any;
    requestedByStaffId?: number;
    processedBy?: any;
    processedById?: number;
    branch?: any;
    branchId?: number;
    // Rejet
    rejectedAt?: string;
    rejectedBy?: any;
    rejectedById?: number;
    rejectionReason?: string;
    notes?: string;
    userAction?: string;
    // Informations du Bénéficiaire du Retrait (personne qui retire)
    depositorName?: string;
    depositorRelationship?: string;
    depositorPhone?: string;
    depositorIdNumber?: string;
    // Relations
    authorizationHistory?: WithdrawalAuthorizationHistory[];
    createdAt?: string;
    updatedAt?: string;
}

export class WithdrawalRequestClass implements WithdrawalRequest {
    id?: number;
    requestNumber: string = '';
    savingsAccountId: number = 0;
    client?: any;
    clientId?: number;
    requestDate: string = new Date().toISOString().split('T')[0];
    requestTime: string = new Date().toTimeString().split(' ')[0].substring(0, 5);
    requestedAmount: number = 0;
    currency?: any;
    currencyId?: number;
    authorizationLevel?: any;
    authorizationLevelId?: number;
    idDocumentType?: any;
    idDocumentTypeId?: number;
    idDocumentNumber?: string = '';
    idVerified: boolean = false;
    idVerifiedBy?: any;
    idVerifiedById?: number;
    passbookPresented: boolean = false;
    passbook?: any;
    passbookId?: number;
    pinVerified: boolean = false;
    withdrawalPurpose?: string = '';
    supportingDocumentPath?: string;
    noticeRequired: boolean = false;
    noticeGivenDate?: string;
    earliestWithdrawalDate?: string;
    balanceAtRequest?: number;
    balanceAfterWithdrawal?: number;
    respectsMinimumBalance: boolean = true;
    status: string = 'PENDING';
    dualVerificationRequired: boolean = false;
    firstVerifier?: string;
    firstVerifiedAt?: string;
    secondVerifier?: string;
    secondVerifiedAt?: string;
    requiresManagerApproval: boolean = false;
    managerApproved?: boolean;
    manager?: string;
    managerApprovedAt?: string;
    managerComments?: string;
    approvedAmount?: number;
    disbursedAmount?: number;
    disbursementDate?: string;
    disbursementTime?: string;
    transactionId?: number;
    receiptNumber?: string;
    passbookUpdated: boolean = false;
    passbookEntry?: any;
    passbookEntryId?: number;
    clientSigned: boolean = false;
    clientSignedAt?: string;
    signatureImagePath?: string;
    requestedByStaff?: any;
    requestedByStaffId?: number;
    processedBy?: any;
    processedById?: number;
    branch?: any;
    branchId?: number;
    rejectedAt?: string;
    rejectedBy?: any;
    rejectedById?: number;
    rejectionReason?: string;
    notes?: string = '';
    userAction?: string = '';
    depositorName?: string = '';
    depositorRelationship?: string = '';
    depositorPhone?: string = '';
    depositorIdNumber?: string = '';
    authorizationHistory?: WithdrawalAuthorizationHistory[] = [];
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<WithdrawalRequest>) {
        Object.assign(this, init);
    }
}

// Historique d'autorisation
export interface WithdrawalAuthorizationHistory {
    id?: number;
    withdrawalRequest?: any;
    withdrawalRequestId?: number;
    action: string;
    actionBy?: any;
    actionAt?: string;
    performedBy?: any;
    performedById?: number;
    performedAt?: string;
    userAction?: string;
    comments?: string;
    previousStatus?: string;
    newStatus?: string;
    createdAt?: string;
}

export class WithdrawalAuthorizationHistoryClass implements WithdrawalAuthorizationHistory {
    id?: number;
    withdrawalRequest?: any;
    withdrawalRequestId?: number;
    action: string = '';
    actionBy?: any;
    actionAt?: string;
    performedBy?: any;
    performedById?: number;
    performedAt?: string;
    userAction?: string = '';
    comments?: string;
    previousStatus?: string;
    newStatus?: string;
    createdAt?: string;

    constructor(init?: Partial<WithdrawalAuthorizationHistory>) {
        Object.assign(this, init);
    }
}
