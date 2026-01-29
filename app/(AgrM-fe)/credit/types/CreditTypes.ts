// ==================== STATUTS DE DEMANDE ====================
export interface StatutDemande {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    color?: string;
    sequenceOrder?: number;
    allowsEdit: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class StatutDemandeClass implements StatutDemande {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    color?: string = '#000000';
    sequenceOrder?: number = 0;
    allowsEdit: boolean = true;
    isActive: boolean = true;

    constructor(init?: Partial<StatutDemande>) {
        Object.assign(this, init);
    }
}

// ==================== OBJET DU CRÉDIT ====================
export interface ObjetCredit {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    requiresBusinessPlan: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class ObjetCreditClass implements ObjetCredit {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    requiresBusinessPlan: boolean = false;
    isActive: boolean = true;

    constructor(init?: Partial<ObjetCredit>) {
        Object.assign(this, init);
    }
}

// ==================== TYPE DE DOCUMENT ====================
export interface TypeDocument {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    isRequired: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class TypeDocumentClass implements TypeDocument {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    isRequired: boolean = false;
    isActive: boolean = true;

    constructor(init?: Partial<TypeDocument>) {
        Object.assign(this, init);
    }
}

// ==================== TYPE DE REVENU ====================
export interface TypeRevenu {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    categoryName?: string;
    verificationMethod?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class TypeRevenuClass implements TypeRevenu {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    categoryName?: string = '';
    verificationMethod?: string = '';
    isActive: boolean = true;

    constructor(init?: Partial<TypeRevenu>) {
        Object.assign(this, init);
    }
}

// ==================== TYPE DE DÉPENSE ====================
export interface TypeDepense {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    categoryName?: string;
    isFixed: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class TypeDepenseClass implements TypeDepense {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    categoryName?: string = '';
    isFixed: boolean = true;
    isActive: boolean = true;

    constructor(init?: Partial<TypeDepense>) {
        Object.assign(this, init);
    }
}

// ==================== TYPE D'EMPLOI ====================
export interface TypeEmploi {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    stabilityScore?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class TypeEmploiClass implements TypeEmploi {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    stabilityScore?: number = 0;
    isActive: boolean = true;

    constructor(init?: Partial<TypeEmploi>) {
        Object.assign(this, init);
    }
}

// ==================== TYPE DE GARANTIE ====================
export interface TypeGarantie {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    coveragePercent?: number;
    requiresValuation: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class TypeGarantieClass implements TypeGarantie {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    coveragePercent?: number = 100;
    requiresValuation: boolean = false;
    isActive: boolean = true;

    constructor(init?: Partial<TypeGarantie>) {
        Object.assign(this, init);
    }
}

// ==================== LIEU DE VISITE ====================
export interface LieuVisite {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class LieuVisiteClass implements LieuVisite {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    isActive: boolean = true;

    constructor(init?: Partial<LieuVisite>) {
        Object.assign(this, init);
    }
}

// ==================== STATUT DE LOGEMENT ====================
export interface StatutLogement {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    stabilityScore?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class StatutLogementClass implements StatutLogement {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    stabilityScore?: number = 0;
    isActive: boolean = true;

    constructor(init?: Partial<StatutLogement>) {
        Object.assign(this, init);
    }
}

// ==================== RECOMMANDATION DE VISITE ====================
export interface RecommandationVisite {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    isPositive: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class RecommandationVisiteClass implements RecommandationVisite {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    isPositive: boolean = true;
    isActive: boolean = true;

    constructor(init?: Partial<RecommandationVisite>) {
        Object.assign(this, init);
    }
}

// ==================== DÉCISION DE COMITÉ ====================
export interface DecisionComite {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    isApproval: boolean;
    requiresReason: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class DecisionComiteClass implements DecisionComite {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    isApproval: boolean = false;
    requiresReason: boolean = false;
    isActive: boolean = true;

    constructor(init?: Partial<DecisionComite>) {
        Object.assign(this, init);
    }
}

// ==================== MODE DE DÉCAISSEMENT ====================
export interface ModeDecaissement {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    requiresBankAccount: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class ModeDecaissementClass implements ModeDecaissement {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    requiresBankAccount: boolean = false;
    isActive: boolean = true;

    constructor(init?: Partial<ModeDecaissement>) {
        Object.assign(this, init);
    }
}

// ==================== RÈGLE D'ALLOCATION DES PAIEMENTS ====================
export interface RegleAllocation {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    priorityOrder?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class RegleAllocationClass implements RegleAllocation {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    priorityOrder?: number = 0;
    isActive: boolean = true;

    constructor(init?: Partial<RegleAllocation>) {
        Object.assign(this, init);
    }
}

// ==================== ÉTAPE DE RECOUVREMENT ====================
export interface EtapeRecouvrement {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    sequenceOrder?: number;
    minDaysOverdue?: number;
    maxDaysOverdue?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class EtapeRecouvrementClass implements EtapeRecouvrement {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    sequenceOrder?: number = 0;
    minDaysOverdue?: number = 0;
    maxDaysOverdue?: number = 0;
    isActive: boolean = true;

    constructor(init?: Partial<EtapeRecouvrement>) {
        Object.assign(this, init);
    }
}

// ==================== ACTION DE RECOUVREMENT ====================
export interface ActionRecouvrement {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    stageId?: number;
    stage?: EtapeRecouvrement;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class ActionRecouvrementClass implements ActionRecouvrement {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    stageId?: number;
    isActive: boolean = true;

    constructor(init?: Partial<ActionRecouvrement>) {
        Object.assign(this, init);
    }
}

// ==================== CLASSIFICATION DE PRÊT ====================
export interface ClassificationPret {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    minDaysOverdue?: number;
    maxDaysOverdue?: number;
    provisionRate?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class ClassificationPretClass implements ClassificationPret {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    minDaysOverdue?: number = 0;
    maxDaysOverdue?: number = 0;
    provisionRate?: number = 0;
    isActive: boolean = true;

    constructor(init?: Partial<ClassificationPret>) {
        Object.assign(this, init);
    }
}

// ==================== NIVEAU DE RISQUE ====================
export interface NiveauRisque {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    minScore?: number;
    maxScore?: number;
    color?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class NiveauRisqueClass implements NiveauRisque {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    minScore?: number = 0;
    maxScore?: number = 100;
    color?: string = '#000000';
    isActive: boolean = true;

    constructor(init?: Partial<NiveauRisque>) {
        Object.assign(this, init);
    }
}

// ==================== CATÉGORIE DE SCORING ====================
export interface CategorieScoring {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    weight?: number;
    maxScore?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class CategorieScoringClass implements CategorieScoring {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    weight?: number = 0;
    maxScore?: number = 100;
    isActive: boolean = true;

    constructor(init?: Partial<CategorieScoring>) {
        Object.assign(this, init);
    }
}

// ==================== RÈGLE DE SCORING ====================
export interface RegleScoring {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    categoryId?: number;
    category?: CategorieScoring;
    minValue?: number;
    maxValue?: number;
    score?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class RegleScoringClass implements RegleScoring {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    categoryId?: number;
    minValue?: number = 0;
    maxValue?: number = 0;
    score?: number = 0;
    isActive: boolean = true;

    constructor(init?: Partial<RegleScoring>) {
        Object.assign(this, init);
    }
}
