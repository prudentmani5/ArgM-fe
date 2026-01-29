import { TypeRevenu, TypeDepense } from './CreditTypes';

// ==================== ANALYSE DES REVENUS ====================
export interface AnalyseRevenu {
    id?: number;
    applicationId?: number;
    application?: any;
    incomeTypeId?: number;
    incomeType?: TypeRevenu;

    // Montants
    declaredAmount?: number;
    verifiedAmount?: number;

    // Vérification
    isVerified: boolean;
    verificationNotes?: string;
    verificationDate?: string;
    verifiedById?: number;
    verifiedBy?: any;

    // Source (pour salariés)
    employerName?: string;
    employerSector?: string;
    employmentDuration?: number;
    contractType?: string;

    // Source (pour commerçants)
    businessName?: string;
    businessDuration?: number;
    stockValue?: number;
    monthlyTurnover?: number;
    profitMargin?: number;

    createdAt?: string;
    updatedAt?: string;
}

export class AnalyseRevenuClass implements AnalyseRevenu {
    id?: number;
    applicationId?: number;
    incomeTypeId?: number;
    declaredAmount?: number = 0;
    verifiedAmount?: number = 0;
    isVerified: boolean = false;
    verificationNotes?: string = '';
    verificationDate?: string;
    verifiedById?: number;
    employerName?: string = '';
    employerSector?: string = '';
    employmentDuration?: number = 0;
    contractType?: string = '';
    businessName?: string = '';
    businessDuration?: number = 0;
    stockValue?: number = 0;
    monthlyTurnover?: number = 0;
    profitMargin?: number = 0;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<AnalyseRevenu>) {
        Object.assign(this, init);
    }
}

// Types de contrat
export const TypesContrat = [
    { code: 'CDI', label: 'CDI (Contrat à Durée Indéterminée)' },
    { code: 'CDD', label: 'CDD (Contrat à Durée Déterminée)' },
    { code: 'INTERIM', label: 'Intérim' },
    { code: 'STAGE', label: 'Stage' },
    { code: 'APPRENTISSAGE', label: 'Apprentissage' },
    { code: 'INDEPENDANT', label: 'Indépendant' }
];

// ==================== ANALYSE DES DÉPENSES ====================
export interface AnalyseDepense {
    id?: number;
    applicationId?: number;
    application?: any;
    expenseTypeId?: number;
    expenseType?: TypeDepense;

    // Montants
    monthlyAmount?: number;

    // Détails
    description?: string;
    isEssential: boolean;

    createdAt?: string;
    updatedAt?: string;
}

export class AnalyseDepenseClass implements AnalyseDepense {
    id?: number;
    applicationId?: number;
    expenseTypeId?: number;
    monthlyAmount?: number = 0;
    description?: string = '';
    isEssential: boolean = true;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<AnalyseDepense>) {
        Object.assign(this, init);
    }
}

// ==================== ANALYSE DE CAPACITÉ ====================
export interface AnalyseCapacite {
    id?: number;
    applicationId?: number;
    application?: any;

    // Revenus
    totalMonthlyIncome?: number;
    verifiedMonthlyIncome?: number;

    // Dépenses
    totalMonthlyExpenses?: number;
    existingDebtPayments?: number;

    // Calculs
    netDisposableIncome?: number;
    maxRepaymentCapacity?: number;
    debtToIncomeRatio?: number;
    proposedInstallment?: number;

    // Score et risque
    capacityScore?: number;
    riskAssessment?: string;

    // Recommandation
    recommendedAmount?: number;
    recommendedDuration?: number;
    analysisNotes?: string;

    // Validation
    analysisDate?: string;
    analyzedById?: number;
    analyzedBy?: any;
    isApproved: boolean;
    approvalNotes?: string;

    createdAt?: string;
    updatedAt?: string;
}

export class AnalyseCapaciteClass implements AnalyseCapacite {
    id?: number;
    applicationId?: number;
    totalMonthlyIncome?: number = 0;
    verifiedMonthlyIncome?: number = 0;
    totalMonthlyExpenses?: number = 0;
    existingDebtPayments?: number = 0;
    netDisposableIncome?: number = 0;
    maxRepaymentCapacity?: number = 0;
    debtToIncomeRatio?: number = 0;
    proposedInstallment?: number = 0;
    capacityScore?: number = 0;
    riskAssessment?: string = '';
    recommendedAmount?: number = 0;
    recommendedDuration?: number = 0;
    analysisNotes?: string = '';
    analysisDate?: string;
    analyzedById?: number;
    isApproved: boolean = false;
    approvalNotes?: string = '';
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<AnalyseCapacite>) {
        Object.assign(this, init);
    }
}

// Évaluations de risque
export const EvaluationsRisque = [
    { code: 'LOW', label: 'Risque Faible', color: 'success' },
    { code: 'MEDIUM', label: 'Risque Moyen', color: 'warning' },
    { code: 'HIGH', label: 'Risque Élevé', color: 'danger' },
    { code: 'VERY_HIGH', label: 'Risque Très Élevé', color: 'danger' }
];
