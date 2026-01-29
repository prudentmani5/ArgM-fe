// Enum des statuts de dépôt à terme
export enum TermDepositStatusEnum {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    MATURED = 'MATURED',
    RENEWED = 'RENEWED',
    EARLY_WITHDRAWN = 'EARLY_WITHDRAWN',
    CLOSED = 'CLOSED'
}

// Dépôt à terme (DAT)
export interface TermDeposit {
    id?: number;
    depositNumber: string;
    certificateNumber?: string;
    client?: any;
    clientId?: number;
    savingsAccountId?: number;
    termDuration?: any;
    termDurationId?: number;
    principalAmount: number;
    currency?: any;
    currencyId?: number;
    startDate: string;
    maturityDate: string;
    interestRate: number;
    expectedInterest: number;
    accruedInterest: number;
    paidInterest: number;
    lastInterestCalculationDate?: string;
    // Fiscalité
    taxRate: number;
    totalTaxDeducted: number;
    // Instruction à échéance
    maturityInstruction?: any;
    maturityInstructionId?: number;
    maturityTransferAccountId?: number;
    // Statut
    status?: any;
    statusId?: number;
    // Renouvellement
    autoRenewal: boolean;
    isRenewal: boolean;
    originalDeposit?: TermDeposit;
    originalDepositId?: number;
    renewalCount: number;
    // Certificat
    certificateIssued: boolean;
    certificateIssuedDate?: string;
    certificateCollected: boolean;
    certificateCollectedDate?: string;
    certificateCollectedBy?: string;
    // Retrait anticipé
    earlyWithdrawalAllowed: boolean;
    earlyWithdrawalDate?: string;
    earlyWithdrawalPenalty?: number;
    interestForfeited?: number;
    earlyWithdrawalNoticeDate?: string;
    // Échéance
    maturityProcessed: boolean;
    maturityProcessedDate?: string;
    maturityAmount?: number;
    maturityTransactionId?: number;
    // Calculs (champs calculés côté frontend)
    totalInterestEarned?: number;
    totalAmountAtMaturity?: number;
    // Source du financement
    fundedFrom?: string; // CASH, TRANSFER, SAVINGS_ACCOUNT
    sourceAccountId?: number;
    sourceTransactionId?: number;
    // Personnel
    openedBy?: any;
    openedById?: number;
    branch?: any;
    branchId?: number;
    // Clôture
    closedDate?: string;
    closedBy?: any;
    closedById?: number;
    closureReason?: string;
    notes?: string;
    // Relations
    interestAccruals?: TermDepositInterestAccrual[];
    createdAt?: string;
    updatedAt?: string;
}

export class TermDepositClass implements TermDeposit {
    id?: number;
    depositNumber: string = '';
    certificateNumber?: string;
    client?: any;
    clientId?: number;
    savingsAccountId?: number;
    termDuration?: any;
    termDurationId?: number;
    principalAmount: number = 50000;
    currency?: any;
    currencyId?: number;
    startDate: string = new Date().toISOString().split('T')[0];
    maturityDate: string = '';
    interestRate: number = 5.0;
    expectedInterest: number = 0;
    accruedInterest: number = 0;
    paidInterest: number = 0;
    lastInterestCalculationDate?: string;
    taxRate: number = 0;
    totalTaxDeducted: number = 0;
    maturityInstruction?: any;
    maturityInstructionId?: number;
    maturityTransferAccountId?: number;
    status?: any;
    statusId?: number;
    autoRenewal: boolean = false;
    isRenewal: boolean = false;
    originalDeposit?: TermDeposit;
    originalDepositId?: number;
    renewalCount: number = 0;
    certificateIssued: boolean = false;
    certificateIssuedDate?: string;
    certificateCollected: boolean = false;
    certificateCollectedDate?: string;
    certificateCollectedBy?: string;
    earlyWithdrawalAllowed: boolean = true;
    earlyWithdrawalDate?: string;
    earlyWithdrawalPenalty?: number;
    interestForfeited?: number;
    earlyWithdrawalNoticeDate?: string;
    maturityProcessed: boolean = false;
    maturityProcessedDate?: string;
    maturityAmount?: number;
    maturityTransactionId?: number;
    totalInterestEarned?: number = 0;
    totalAmountAtMaturity?: number = 0;
    fundedFrom?: string;
    sourceAccountId?: number;
    sourceTransactionId?: number;
    openedBy?: any;
    openedById?: number;
    branch?: any;
    branchId?: number;
    closedDate?: string;
    closedBy?: any;
    closedById?: number;
    closureReason?: string;
    notes?: string = '';
    interestAccruals?: TermDepositInterestAccrual[] = [];
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<TermDeposit>) {
        Object.assign(this, init);
    }
}

// Accumulation des intérêts
export interface TermDepositInterestAccrual {
    id?: number;
    termDeposit?: any;
    termDepositId?: number;
    accrualDate: string;
    daysInPeriod: number;
    principalBalance: number;
    interestRate: number;
    accruedAmount: number;
    cumulativeAccrued: number;
    isCapitalized: boolean;
    capitalizedAt?: string;
    createdAt?: string;
}

export class TermDepositInterestAccrualClass implements TermDepositInterestAccrual {
    id?: number;
    termDeposit?: any;
    termDepositId?: number;
    accrualDate: string = new Date().toISOString().split('T')[0];
    daysInPeriod: number = 0;
    principalBalance: number = 0;
    interestRate: number = 0;
    accruedAmount: number = 0;
    cumulativeAccrued: number = 0;
    isCapitalized: boolean = false;
    capitalizedAt?: string;
    createdAt?: string;

    constructor(init?: Partial<TermDepositInterestAccrual>) {
        Object.assign(this, init);
    }
}
