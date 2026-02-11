// Types pour le module de remboursement

// Mode de remboursement
export interface ModeRemboursement {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    requiresReceipt?: boolean;
    requiresReference?: boolean;
    requiresJustification?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class ModeRemboursementClass implements ModeRemboursement {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    requiresReceipt?: boolean = false;
    requiresReference?: boolean = false;
    requiresJustification?: boolean = false;
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<ModeRemboursement>) {
        Object.assign(this, init);
    }
}

// Étape de recouvrement
export interface EtapeRecouvrement {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    minDaysOverdue?: number;
    maxDaysOverdue?: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class EtapeRecouvrementClass implements EtapeRecouvrement {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    minDaysOverdue?: number = 0;
    maxDaysOverdue?: number = 30;
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<EtapeRecouvrement>) {
        Object.assign(this, init);
    }
}

// Classification de retard
export interface ClassificationRetard {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    minDaysOverdue?: number;
    maxDaysOverdue?: number;
    provisionRate?: number;
    riskLevel?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class ClassificationRetardClass implements ClassificationRetard {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    minDaysOverdue?: number = 0;
    maxDaysOverdue?: number = 7;
    provisionRate?: number = 0;
    riskLevel?: string = 'FAIBLE';
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<ClassificationRetard>) {
        Object.assign(this, init);
    }
}

// Configuration des pénalités
export interface ConfigurationPenalite {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    minDaysOverdue?: number;
    maxDaysOverdue?: number;
    dailyPenaltyRate?: number;
    maxPenaltyPercentage?: number;
    gracePeriodDays?: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class ConfigurationPenaliteClass implements ConfigurationPenalite {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    minDaysOverdue?: number = 1;
    maxDaysOverdue?: number = 30;
    dailyPenaltyRate?: number = 0.5;
    maxPenaltyPercentage?: number = 10;
    gracePeriodDays?: number = 0;
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<ConfigurationPenalite>) {
        Object.assign(this, init);
    }
}

// Règle de rappel automatique
export interface RegleRappel {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    triggerType?: string;
    daysOffset?: number;
    notificationType?: string;
    messageTemplate?: string;
    messageTemplateFr?: string;
    sendSms?: boolean;
    sendEmail?: boolean;
    sendPush?: boolean;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class RegleRappelClass implements RegleRappel {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    triggerType?: string = 'BEFORE_DUE';
    daysOffset?: number = -7;
    notificationType?: string = 'REMINDER';
    messageTemplate?: string = '';
    messageTemplateFr?: string = '';
    sendSms?: boolean = true;
    sendEmail?: boolean = false;
    sendPush?: boolean = false;
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<RegleRappel>) {
        Object.assign(this, init);
    }
}

// Configuration de restructuration
export interface ConfigurationRestructuration {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    minDaysOverdue?: number;
    maxDaysOverdue?: number;
    maxRestructuringsAllowed?: number;
    minRestructuringFeePercent?: number;
    maxRestructuringFeePercent?: number;
    maxTermExtensionPercent?: number;
    requiresApproval?: boolean;
    approvalLevelRequired?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class ConfigurationRestructurationClass implements ConfigurationRestructuration {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    minDaysOverdue?: number = 30;
    maxDaysOverdue?: number = 90;
    maxRestructuringsAllowed?: number = 1;
    minRestructuringFeePercent?: number = 2;
    maxRestructuringFeePercent?: number = 5;
    maxTermExtensionPercent?: number = 50;
    requiresApproval?: boolean = true;
    approvalLevelRequired?: string = 'CHEF_CREDIT';
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<ConfigurationRestructuration>) {
        Object.assign(this, init);
    }
}

// Seuil de contentieux
export interface SeuilContentieux {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    minOverdueAmount?: number;
    minDaysOverdue?: number;
    requiresDgApproval?: boolean;
    dgApprovalMinAmount?: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class SeuilContentieuxClass implements SeuilContentieux {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    minOverdueAmount?: number = 500000;
    minDaysOverdue?: number = 120;
    requiresDgApproval?: boolean = true;
    dgApprovalMinAmount?: number = 1000000;
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<SeuilContentieux>) {
        Object.assign(this, init);
    }
}

// Échéancier de remboursement
export interface EcheancierRemboursement {
    id?: number;
    loanId?: number;
    applicationNumber?: string;
    disbursementNumber?: string;
    clientName?: string;
    installmentNumber?: number;
    dueDate?: string;
    principalDue?: number;
    interestDue?: number;
    insuranceDue?: number;
    feesDue?: number;
    totalDue?: number;
    principalPaid?: number;
    interestPaid?: number;
    insurancePaid?: number;
    feesPaid?: number;
    totalPaid?: number;
    penaltyAccrued?: number;
    penaltyPaid?: number;
    daysOverdue?: number;
    status?: string;
    lastPaymentDate?: string;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class EcheancierRemboursementClass implements EcheancierRemboursement {
    id?: number;
    loanId?: number;
    applicationNumber?: string = '';
    disbursementNumber?: string = '';
    clientName?: string = '';
    installmentNumber?: number = 1;
    dueDate?: string = '';
    principalDue?: number = 0;
    interestDue?: number = 0;
    insuranceDue?: number = 0;
    feesDue?: number = 0;
    totalDue?: number = 0;
    principalPaid?: number = 0;
    interestPaid?: number = 0;
    insurancePaid?: number = 0;
    feesPaid?: number = 0;
    totalPaid?: number = 0;
    penaltyAccrued?: number = 0;
    penaltyPaid?: number = 0;
    daysOverdue?: number = 0;
    status?: string = 'PENDING';
    lastPaymentDate?: string = '';
    userAction?: string = '';

    constructor(init?: Partial<EcheancierRemboursement>) {
        Object.assign(this, init);
    }
}

// Paiement de crédit
export interface PaiementCredit {
    id?: number;
    loanId?: number;
    applicationNumber?: string;
    disbursementNumber?: string;
    clientName?: string;
    paymentNumber?: string;
    paymentDate?: string;
    valueDate?: string;
    amountReceived?: number;
    repaymentModeId?: number;
    repaymentMode?: ModeRemboursement;
    receiptNumber?: string;
    receivedBy?: number;
    isAutoDebit?: boolean;
    sourceSavingsAccountId?: number;
    isHomeCollection?: boolean;
    collectionAgentId?: number;
    collectionLocation?: string;
    isMobileMoney?: boolean;
    mobileNumber?: string;
    mobileReference?: string;
    isBankTransfer?: boolean;
    transferReference?: string;
    allocatedToPrincipal?: number;
    allocatedToInterest?: number;
    allocatedToInsurance?: number;
    allocatedToFees?: number;
    allocatedToPenalty?: number;
    notes?: string;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PaiementCreditClass implements PaiementCredit {
    id?: number;
    loanId?: number;
    applicationNumber?: string = '';
    disbursementNumber?: string = '';
    clientName?: string = '';
    paymentNumber?: string = '';
    paymentDate?: string = new Date().toISOString().split('T')[0];
    valueDate?: string = new Date().toISOString().split('T')[0];
    amountReceived?: number = 0;
    repaymentModeId?: number;
    receiptNumber?: string = '';
    receivedBy?: number;
    isAutoDebit?: boolean = false;
    sourceSavingsAccountId?: number;
    isHomeCollection?: boolean = false;
    collectionAgentId?: number;
    collectionLocation?: string = '';
    isMobileMoney?: boolean = false;
    mobileNumber?: string = '';
    mobileReference?: string = '';
    isBankTransfer?: boolean = false;
    transferReference?: string = '';
    allocatedToPrincipal?: number = 0;
    allocatedToInterest?: number = 0;
    allocatedToInsurance?: number = 0;
    allocatedToFees?: number = 0;
    allocatedToPenalty?: number = 0;
    notes?: string = '';
    userAction?: string = '';

    constructor(init?: Partial<PaiementCredit>) {
        Object.assign(this, init);
    }
}

// Calcul de pénalité
export interface CalculPenalite {
    id?: number;
    scheduleId?: number;
    loanId?: number;
    calculationDate?: string;
    daysOverdue?: number;
    overdueAmount?: number;
    dailyPenaltyRate?: number;
    calculatedPenalty?: number;
    penaltyCap?: number;
    finalPenalty?: number;
    isCapped?: boolean;
    penaltyPaid?: number;
    penaltyWaived?: number;
    waivedBy?: number;
    waiverReason?: string;
    waiverDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class CalculPenaliteClass implements CalculPenalite {
    id?: number;
    scheduleId?: number;
    loanId?: number;
    calculationDate?: string = new Date().toISOString().split('T')[0];
    daysOverdue?: number = 0;
    overdueAmount?: number = 0;
    dailyPenaltyRate?: number = 0.5;
    calculatedPenalty?: number = 0;
    penaltyCap?: number = 0;
    finalPenalty?: number = 0;
    isCapped?: boolean = false;
    penaltyPaid?: number = 0;
    penaltyWaived?: number = 0;
    waivedBy?: number;
    waiverReason?: string = '';
    waiverDate?: string = '';

    constructor(init?: Partial<CalculPenalite>) {
        Object.assign(this, init);
    }
}

// Restructuration de crédit
export interface RestructurationCredit {
    id?: number;
    loanId?: number;
    requestNumber?: string;
    requestDate?: string;
    requestedBy?: number;
    status?: string;
    restructuringType?: string;
    originalTermMonths?: number;
    newTermMonths?: number;
    originalInterestRate?: number;
    newInterestRate?: number;
    originalMonthlyPayment?: number;
    newMonthlyPayment?: number;
    restructuringFee?: number;
    restructuringFeePercent?: number;
    isFeeCapitalized?: boolean;
    gracePeriodMonths?: number;
    effectiveDate?: string;
    reason?: string;
    clientJustification?: string;
    approvedBy?: number;
    approvalDate?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class RestructurationCreditClass implements RestructurationCredit {
    id?: number;
    loanId?: number;
    requestNumber?: string = '';
    requestDate?: string = new Date().toISOString().split('T')[0];
    requestedBy?: number;
    status?: string = 'PENDING';
    restructuringType?: string = 'TERM_EXTENSION';
    originalTermMonths?: number = 0;
    newTermMonths?: number = 0;
    originalInterestRate?: number = 0;
    newInterestRate?: number = 0;
    originalMonthlyPayment?: number = 0;
    newMonthlyPayment?: number = 0;
    restructuringFee?: number = 0;
    restructuringFeePercent?: number = 2;
    isFeeCapitalized?: boolean = false;
    gracePeriodMonths?: number = 0;
    effectiveDate?: string = '';
    reason?: string = '';
    clientJustification?: string = '';
    approvedBy?: number;
    approvalDate?: string = '';
    notes?: string = '';

    constructor(init?: Partial<RestructurationCredit>) {
        Object.assign(this, init);
    }
}

// Remboursement anticipé
export interface RemboursementAnticipe {
    id?: number;
    loanId?: number;
    requestNumber?: string;
    requestDate?: string;
    requestedBy?: number;
    accountNumber?: string; // Client's account number for this request
    status?: string;
    repaymentType?: string;
    requestedAmount?: number;
    remainingPrincipal?: number;
    accruedInterest?: number;
    accruedPenalties?: number;
    earlyRepaymentPenaltyRate?: number; // Taux de pénalité en pourcentage (ex: 2 pour 2%)
    penaltyForEarlyRepayment?: number;
    totalSettlementAmount?: number;
    proposedSettlementDate?: string;
    actualSettlementDate?: string;
    reason?: string;
    approvedBy?: number;
    approvalDate?: string;
    paymentId?: number; // Linked payment ID after processing
    paymentNumber?: string; // Payment number from the created payment
    processedDate?: string; // Date when the payment was processed
    notes?: string;
    userAction?: string; // Track user who created/modified the record
    createdAt?: string;
    updatedAt?: string;
}

export class RemboursementAnticipeClass implements RemboursementAnticipe {
    id?: number;
    loanId?: number;
    requestNumber?: string = '';
    requestDate?: string = new Date().toISOString().split('T')[0];
    requestedBy?: number;
    accountNumber?: string = '';
    status?: string = 'PENDING';
    repaymentType?: string = 'TOTAL';
    requestedAmount?: number = 0;
    remainingPrincipal?: number = 0;
    accruedInterest?: number = 0;
    accruedPenalties?: number = 0;
    earlyRepaymentPenaltyRate?: number = 0;
    penaltyForEarlyRepayment?: number = 0;
    totalSettlementAmount?: number = 0;
    proposedSettlementDate?: string = '';
    actualSettlementDate?: string = '';
    reason?: string = '';
    approvedBy?: number;
    approvalDate?: string = '';
    paymentId?: number;
    paymentNumber?: string = '';
    processedDate?: string = '';
    notes?: string = '';
    userAction?: string = '';

    constructor(init?: Partial<RemboursementAnticipe>) {
        Object.assign(this, init);
    }
}

// Dossier de recouvrement
export interface DossierRecouvrement {
    id?: number;
    loanId?: number;
    applicationNumber?: string; // N° Dossier Crédit
    caseNumber?: string;
    openedDate?: string;
    openedBy?: number;
    status?: string;
    currentStage?: any; // Can be string or RecoveryStage object
    stageStartDate?: string;
    priority?: string;
    assignedAgentId?: number;
    currentTotalOverdue?: number;
    totalOverdue?: number;
    principalOverdue?: number;
    interestOverdue?: number;
    penaltiesOverdue?: number;
    currentDaysOverdue?: number;
    daysOverdueAtOpening?: number;
    lastContactDate?: string;
    nextActionDate?: string;
    nextActionType?: string;
    promiseToPayDate?: string;
    promiseToPayAmount?: number;
    isEscalated?: boolean;
    escalatedTo?: number;
    escalationDate?: string;
    escalationReason?: string;
    closedDate?: string;
    closedReason?: string;
    amountRecovered?: number;
    accountNumber?: string;
    notes?: string;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class DossierRecouvrementClass implements DossierRecouvrement {
    id?: number;
    loanId?: number;
    applicationNumber?: string = '';
    caseNumber?: string = '';
    openedDate?: string = new Date().toISOString().split('T')[0];
    openedBy?: number;
    status?: string = 'OPEN';
    currentStage?: any;
    stageStartDate?: string = '';
    priority?: string = 'NORMAL';
    assignedAgentId?: number;
    currentTotalOverdue?: number = 0;
    totalOverdue?: number = 0;
    principalOverdue?: number = 0;
    interestOverdue?: number = 0;
    penaltiesOverdue?: number = 0;
    currentDaysOverdue?: number = 0;
    daysOverdueAtOpening?: number = 0;
    lastContactDate?: string = '';
    nextActionDate?: string = '';
    nextActionType?: string = '';
    promiseToPayDate?: string = '';
    promiseToPayAmount?: number = 0;
    isEscalated?: boolean = false;
    escalatedTo?: number;
    escalationDate?: string = '';
    escalationReason?: string = '';
    closedDate?: string = '';
    closedReason?: string = '';
    amountRecovered?: number = 0;
    accountNumber?: string = '';
    notes?: string = '';
    userAction?: string = '';

    constructor(init?: Partial<DossierRecouvrement>) {
        Object.assign(this, init);
    }
}

// Journal d'action de recouvrement
export interface ActionRecouvrement {
    id?: number;
    caseId?: number;
    loanId?: number;
    actionType?: string;
    actionDescription?: string;
    description?: string; // backend field name
    actionDate?: string;
    performedBy?: number;
    outcome?: string;
    result?: string; // backend field name
    nextActionDate?: string;
    nextActionType?: string;
    contactPerson?: string;
    contactPhone?: string;
    promiseToPayDate?: string;
    promiseToPayAmount?: number;
    documentReference?: string;
    notes?: string;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ActionRecouvrementClass implements ActionRecouvrement {
    id?: number;
    caseId?: number;
    loanId?: number;
    actionType?: string = 'PHONE_CALL';
    actionDescription?: string = '';
    actionDate?: string = new Date().toISOString();
    performedBy?: number;
    outcome?: string = '';
    nextActionDate?: string = '';
    nextActionType?: string = '';
    contactPerson?: string = '';
    contactPhone?: string = '';
    promiseToPayDate?: string = '';
    promiseToPayAmount?: number = 0;
    documentReference?: string = '';
    notes?: string = '';

    constructor(init?: Partial<ActionRecouvrement>) {
        Object.assign(this, init);
    }
}

// Rappel de paiement
export interface RappelPaiement {
    id?: number;
    loanId?: number;
    scheduleId?: number;
    reminderRuleId?: number;
    reminderType?: string;
    scheduledDate?: string;
    messageContent?: string;
    deliveryMethod?: string;
    recipientPhone?: string;
    recipientEmail?: string;
    isSent?: boolean;
    sentAt?: string;
    deliveryStatus?: string;
    errorMessage?: string;
    retryCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class RappelPaiementClass implements RappelPaiement {
    id?: number;
    loanId?: number;
    scheduleId?: number;
    reminderRuleId?: number;
    reminderType?: string = '';
    scheduledDate?: string = new Date().toISOString().split('T')[0];
    messageContent?: string = '';
    deliveryMethod?: string = 'SMS';
    recipientPhone?: string = '';
    recipientEmail?: string = '';
    isSent?: boolean = false;
    sentAt?: string = '';
    deliveryStatus?: string = '';
    errorMessage?: string = '';
    retryCount?: number = 0;

    constructor(init?: Partial<RappelPaiement>) {
        Object.assign(this, init);
    }
}

// Dossier contentieux
export interface DossierContentieux {
    id?: number;
    loanId?: number;
    recoveryCaseId?: number;
    caseNumber?: string;
    filingDate?: string;
    status?: string;
    courtName?: string;
    courtLocation?: string;
    courtCaseNumber?: string;
    lawyerId?: number;
    lawyerName?: string;
    lawyerContact?: string;
    disputedAmount?: number;
    legalFees?: number;
    bailiffFees?: number;
    otherCosts?: number;
    totalCosts?: number;
    hearingDate?: string;
    judgmentDate?: string;
    judgmentOutcome?: string;
    awardedAmount?: number;
    recoveredAmount?: number;
    isDgApprovalRequired?: boolean;
    dgApprovalStatus?: string;
    dgApprovedBy?: number;
    dgApprovalDate?: string;
    closedDate?: string;
    closureReason?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class DossierContentieuxClass implements DossierContentieux {
    id?: number;
    loanId?: number;
    recoveryCaseId?: number;
    caseNumber?: string = '';
    filingDate?: string = new Date().toISOString().split('T')[0];
    status?: string = 'PENDING_DG_APPROVAL';
    courtName?: string = '';
    courtLocation?: string = '';
    courtCaseNumber?: string = '';
    lawyerId?: number;
    lawyerName?: string = '';
    lawyerContact?: string = '';
    disputedAmount?: number = 0;
    legalFees?: number = 0;
    bailiffFees?: number = 0;
    otherCosts?: number = 0;
    totalCosts?: number = 0;
    hearingDate?: string = '';
    judgmentDate?: string = '';
    judgmentOutcome?: string = '';
    awardedAmount?: number = 0;
    recoveredAmount?: number = 0;
    isDgApprovalRequired?: boolean = true;
    dgApprovalStatus?: string = 'PENDING';
    dgApprovedBy?: number;
    dgApprovalDate?: string = '';
    closedDate?: string = '';
    closureReason?: string = '';
    notes?: string = '';

    constructor(init?: Partial<DossierContentieux>) {
        Object.assign(this, init);
    }
}

// Options pour les dropdowns
export const STATUTS_ECHEANCE = [
    { label: 'En attente', value: 'PENDING' },
    { label: 'Payé', value: 'PAID' },
    { label: 'Partiel', value: 'PARTIAL' },
    { label: 'En retard', value: 'OVERDUE' }
];

export const MODES_REMBOURSEMENT = [
    { label: 'Paiement en agence', value: 'AGENCY' },
    { label: 'Prélèvement automatique', value: 'AUTO_DEBIT' },
    { label: 'Collecte à domicile', value: 'HOME_COLLECTION' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' },
    { label: 'Virement bancaire', value: 'BANK_TRANSFER' }
];

export const TYPES_RESTRUCTURATION = [
    { label: 'Extension de durée', value: 'TERM_EXTENSION' },
    { label: 'Réduction mensualité', value: 'PAYMENT_REDUCTION' },
    { label: 'Modification taux', value: 'RATE_MODIFICATION' },
    { label: 'Combinée', value: 'COMBINED' }
];

export const STATUTS_DEMANDE = [
    { label: 'En attente', value: 'PENDING' },
    { label: 'Approuvée', value: 'APPROVED' },
    { label: 'Rejetée', value: 'REJECTED' },
    { label: 'Annulée', value: 'CANCELLED' },
    { label: 'Complétée', value: 'COMPLETED' }
];

export const STATUTS_DOSSIER_RECOUVREMENT = [
    { label: 'Ouvert', value: 'OPEN' },
    { label: 'En cours', value: 'IN_PROGRESS' },
    { label: 'Escaladé', value: 'ESCALATED' },
    { label: 'Résolu', value: 'RESOLVED' },
    { label: 'Fermé', value: 'CLOSED' },
    { label: 'En contentieux', value: 'LITIGATION' }
];

export const ETAPES_RECOUVREMENT = [
    { label: 'Négociation', value: 'NEGOTIATION' },
    { label: 'Médiation', value: 'MEDIATION' },
    { label: 'Mise en demeure', value: 'FINAL_NOTICE' },
    { label: 'Contentieux', value: 'LITIGATION' }
];

export const PRIORITES = [
    { label: 'Faible', value: 'LOW' },
    { label: 'Normale', value: 'NORMAL' },
    { label: 'Haute', value: 'HIGH' },
    { label: 'Critique', value: 'CRITICAL' }
];

export const TYPES_ACTION_RECOUVREMENT = [
    { label: 'Appel téléphonique', value: 'PHONE_CALL' },
    { label: 'SMS envoyé', value: 'SMS_SENT' },
    { label: 'Visite à domicile', value: 'HOME_VISIT' },
    { label: 'Lettre de rappel', value: 'REMINDER_LETTER' },
    { label: 'Mise en demeure', value: 'FORMAL_NOTICE' },
    { label: 'Médiation', value: 'MEDIATION' },
    { label: 'Réunion en agence', value: 'AGENCY_MEETING' },
    { label: 'Contact caution', value: 'GUARANTOR_CONTACT' },
    { label: 'Autre', value: 'OTHER' }
];

export const NIVEAUX_RISQUE = [
    { label: 'Très faible', value: 'VERY_LOW' },
    { label: 'Faible', value: 'LOW' },
    { label: 'Moyen', value: 'MEDIUM' },
    { label: 'Élevé', value: 'HIGH' },
    { label: 'Très élevé', value: 'VERY_HIGH' }
];

export const TYPES_TRIGGER_RAPPEL = [
    { label: 'Avant échéance', value: 'BEFORE_DUE' },
    { label: 'Après échéance', value: 'AFTER_DUE' }
];

export const METHODES_LIVRAISON = [
    { label: 'SMS', value: 'SMS' },
    { label: 'Email', value: 'EMAIL' },
    { label: 'Notification push', value: 'PUSH' }
];

export const STATUTS_CONTENTIEUX = [
    { label: 'En attente approbation DG', value: 'PENDING_DG_APPROVAL' },
    { label: 'Approuvé par DG', value: 'DG_APPROVED' },
    { label: 'Rejeté par DG', value: 'DG_REJECTED' },
    { label: 'Déposé au tribunal', value: 'FILED' },
    { label: 'Audience programmée', value: 'HEARING_SCHEDULED' },
    { label: 'En attente jugement', value: 'AWAITING_JUDGMENT' },
    { label: 'Jugement rendu', value: 'JUDGMENT_RENDERED' },
    { label: 'En exécution', value: 'EXECUTION' },
    { label: 'Clôturé', value: 'CLOSED' }
];

export const ISSUES_JUGEMENT = [
    { label: 'Favorable', value: 'FAVORABLE' },
    { label: 'Partiellement favorable', value: 'PARTIALLY_FAVORABLE' },
    { label: 'Défavorable', value: 'UNFAVORABLE' },
    { label: 'Arrangement', value: 'SETTLEMENT' }
];

// Configuration du planificateur de pénalités
export interface PenaltySchedulerConfig {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    dailyRate?: number; // Taux journalier en pourcentage (0.5% à 2%)
    maxCapPercentage?: number; // Maximum en % du capital restant dû (ex: 10%)
    appliesToPrincipal?: boolean;
    appliesToInterest?: boolean;
    calculationBase?: string; // OVERDUE_AMOUNT ou REMAINING_BALANCE
    description?: string;
    isActive?: boolean;
    schedulerEnabled?: boolean;
    executionHour?: number; // Heure d'exécution (0-23)
    executionMinute?: number; // Minute d'exécution (0-59)
    lastExecutionDate?: string;
    nextExecutionDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PenaltySchedulerConfigClass implements PenaltySchedulerConfig {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    dailyRate?: number = 0.5;
    maxCapPercentage?: number = 10;
    appliesToPrincipal?: boolean = true;
    appliesToInterest?: boolean = true;
    calculationBase?: string = 'OVERDUE_AMOUNT';
    description?: string = '';
    isActive?: boolean = true;
    schedulerEnabled?: boolean = false;
    executionHour?: number = 6;
    executionMinute?: number = 0;
    lastExecutionDate?: string = '';
    nextExecutionDate?: string = '';

    constructor(init?: Partial<PenaltySchedulerConfig>) {
        Object.assign(this, init);
    }
}

// Historique d'exécution des pénalités
export interface PenaltyExecutionHistory {
    id?: number;
    penaltyConfigId?: number;
    executionDate?: string;
    status?: string; // PENDING, RUNNING, COMPLETED, FAILED
    totalOverdueFound?: number;
    totalLoansProcessed?: number;
    processedApplicationNumbers?: string;
    totalSchedulesProcessed?: number;
    totalPenaltyCalculated?: number;
    totalDaysPenaltyAdded?: number;
    penaltyRateUsed?: number;
    startTime?: string;
    endTime?: string;
    durationMs?: number;
    errorMessage?: string;
    executionLog?: string;
    triggeredBy?: string; // SCHEDULER ou MANUAL
    userAction?: string;
    createdAt?: string;
}

export class PenaltyExecutionHistoryClass implements PenaltyExecutionHistory {
    id?: number;
    penaltyConfigId?: number;
    executionDate?: string = '';
    status?: string = 'PENDING';
    totalOverdueFound?: number = 0;
    totalLoansProcessed?: number = 0;
    processedApplicationNumbers?: string = '';
    totalSchedulesProcessed?: number = 0;
    totalPenaltyCalculated?: number = 0;
    totalDaysPenaltyAdded?: number = 0;
    penaltyRateUsed?: number = 0;
    startTime?: string = '';
    endTime?: string = '';
    durationMs?: number = 0;
    errorMessage?: string = '';
    executionLog?: string = '';
    triggeredBy?: string = 'SCHEDULER';
    userAction?: string = '';

    constructor(init?: Partial<PenaltyExecutionHistory>) {
        Object.assign(this, init);
    }
}

// Statut du planificateur
export interface PenaltySchedulerStatus {
    configId?: number;
    configCode?: string;
    dailyRate?: number;
    schedulerEnabled?: boolean;
    executionTime?: string;
    lastExecutionDate?: string;
    nextExecutionDate?: string;
    lastExecutionStatus?: string;
    lastExecutionId?: number;
    lastTotalPenalty?: number;
    lastSchedulesProcessed?: number;
    error?: string;
}

export const STATUTS_EXECUTION = [
    { label: 'En attente', value: 'PENDING' },
    { label: 'En cours', value: 'RUNNING' },
    { label: 'Terminé', value: 'COMPLETED' },
    { label: 'Échoué', value: 'FAILED' }
];

export const BASES_CALCUL_PENALITE = [
    { label: 'Montant impayé', value: 'OVERDUE_AMOUNT' },
    { label: 'Solde restant dû', value: 'REMAINING_BALANCE' }
];

export const DECLENCHEURS_PENALITE = [
    { label: 'Planificateur automatique', value: 'SCHEDULER' },
    { label: 'Déclenchement manuel', value: 'MANUAL' }
];
