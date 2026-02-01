import { StatutDemande, ObjetCredit } from './CreditTypes';

// ==================== DEMANDE DE CRÉDIT ====================
export interface DemandeCredit {
    id?: number;
    applicationNumber: string;
    clientId?: number;
    client?: any; // Client entity
    savingsAccountId?: number;
    savingsAccount?: any; // Savings account entity
    branchId?: number;
    branch?: any;
    creditOfficerId?: number;
    creditOfficer?: any;
    loanProductId?: number;
    loanProduct?: any;
    statusId?: number;
    status?: StatutDemande;
    creditPurposeId?: number;
    creditPurpose?: ObjetCredit;

    // Informations de la demande
    applicationDate?: string;
    amountRequested?: number;
    durationMonths?: number;
    repaymentFrequency?: string;
    purposeDescription?: string;
    repaymentPlanClient?: string;

    // Statut et suivi
    statusDate?: string;
    statusChangedById?: number;
    statusChangedBy?: any;

    // User Action (connected user who performed the action)
    userAction?: string;

    // Timestamps
    createdAt?: string;
    updatedAt?: string;
}

export class DemandeCreditClass implements DemandeCredit {
    id?: number;
    applicationNumber: string = '';
    clientId?: number;
    savingsAccountId?: number;
    branchId?: number;
    creditOfficerId?: number;
    loanProductId?: number;
    statusId?: number;
    creditPurposeId?: number;
    applicationDate?: string;
    amountRequested?: number = 0;
    durationMonths?: number = 12;
    repaymentFrequency?: string = 'MONTHLY';
    purposeDescription?: string = '';
    repaymentPlanClient?: string = '';
    statusDate?: string;
    statusChangedById?: number;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<DemandeCredit>) {
        Object.assign(this, init);
    }
}

// Fréquences de remboursement
export const FrequencesRemboursement = [
    { code: 'DAILY', label: 'Quotidien' },
    { code: 'WEEKLY', label: 'Hebdomadaire' },
    { code: 'BIWEEKLY', label: 'Bi-hebdomadaire' },
    { code: 'MONTHLY', label: 'Mensuel' },
    { code: 'QUARTERLY', label: 'Trimestriel' },
    { code: 'SEMIANNUAL', label: 'Semestriel' },
    { code: 'ANNUAL', label: 'Annuel' }
];

// ==================== DOCUMENT DE DEMANDE ====================
export interface DocumentDemande {
    id?: number;
    applicationId?: number;
    application?: DemandeCredit;
    documentTypeId?: number;
    documentType?: any;
    documentNumber?: string;
    documentPath?: string;
    notes?: string;

    // Réception
    isReceived: boolean;
    receivedDate?: string;
    receivedById?: number;
    receivedBy?: any;

    // Validation
    isValidated: boolean;
    validatedById?: number;
    validatedBy?: any;
    validationDate?: string;
    validationNotes?: string;

    createdAt?: string;
    updatedAt?: string;
}

export class DocumentDemandeClass implements DocumentDemande {
    id?: number;
    applicationId?: number;
    documentTypeId?: number;
    documentNumber?: string = '';
    documentPath?: string = '';
    notes?: string = '';
    isReceived: boolean = false;
    receivedDate?: string;
    receivedById?: number;
    isValidated: boolean = false;
    validatedById?: number;
    validationDate?: string;
    validationNotes?: string = '';
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<DocumentDemande>) {
        Object.assign(this, init);
    }
}

// ==================== HISTORIQUE STATUT DEMANDE ====================
export interface HistoriqueStatut {
    id?: number;
    applicationId?: number;
    application?: DemandeCredit;
    previousStatusId?: number;
    previousStatus?: StatutDemande;
    newStatusId?: number;
    newStatus?: StatutDemande;
    changedById?: number;
    changedBy?: any;
    changeReason?: string;
    changedAt?: string;
}

export class HistoriqueStatutClass implements HistoriqueStatut {
    id?: number;
    applicationId?: number;
    previousStatusId?: number;
    newStatusId?: number;
    changedById?: number;
    changeReason?: string = '';
    changedAt?: string;

    constructor(init?: Partial<HistoriqueStatut>) {
        Object.assign(this, init);
    }
}
