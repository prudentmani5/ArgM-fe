// Types pour le module de gestion des dépenses (MOD9)

// Catégorie de dépense
export interface CategorieDepense {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    compteComptable?: string;
    internalAccountId?: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class CategorieDepenseClass implements CategorieDepense {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    compteComptable?: string = '';
    internalAccountId?: number;
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<CategorieDepense>) {
        Object.assign(this, init);
    }
}

// Niveau de priorité
export interface NiveauPriorite {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    delaiTraitement?: string;
    approbationRequise?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class NiveauPrioriteClass implements NiveauPriorite {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    delaiTraitement?: string = '5 jours ouvrables';
    approbationRequise?: string = 'Chef de département';
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<NiveauPriorite>) {
        Object.assign(this, init);
    }
}

// Fournisseur
export interface Fournisseur {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    contact?: string;
    telephone?: string;
    email?: string;
    adresse?: string;
    nif?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class FournisseurClass implements Fournisseur {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    contact?: string = '';
    telephone?: string = '';
    email?: string = '';
    adresse?: string = '';
    nif?: string = '';
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<Fournisseur>) {
        Object.assign(this, init);
    }
}

// Mode de paiement des dépenses
export interface ModePaiementDepense {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    requiresReceipt?: boolean;
    requiresReference?: boolean;
    requiresDoubleSignature?: boolean;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class ModePaiementDepenseClass implements ModePaiementDepense {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    requiresReceipt?: boolean = true;
    requiresReference?: boolean = false;
    requiresDoubleSignature?: boolean = false;
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<ModePaiementDepense>) {
        Object.assign(this, init);
    }
}

// Seuil d'approbation
export interface SeuilApprobation {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    niveau?: number;
    responsable?: string;
    montantMin?: number;
    montantMax?: number;
    delaiMaxHeures?: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class SeuilApprobationClass implements SeuilApprobation {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    niveau?: number = 1;
    responsable?: string = '';
    montantMin?: number = 0;
    montantMax?: number = 500000;
    delaiMaxHeures?: number = 48;
    description?: string = '';
    isActive?: boolean = true;
    sortOrder?: number = 0;

    constructor(init?: Partial<SeuilApprobation>) {
        Object.assign(this, init);
    }
}

// Budget de dépenses
export interface BudgetDepense {
    id?: number;
    code?: string;
    libelle?: string;
    exercice?: string;
    niveauBudget?: string;
    departementId?: number;
    departementName?: string;
    agenceId?: number;
    agenceName?: string;
    categorieDepenseId?: number;
    categorieDepenseName?: string;
    montantAlloue?: number;
    montantDepense?: number;
    montantEngage?: number;
    montantDisponible?: number;
    tauxConsommation?: number;
    status?: string;
    dateDebut?: string;
    dateFin?: string;
    notes?: string;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class BudgetDepenseClass implements BudgetDepense {
    id?: number;
    code?: string = '';
    libelle?: string = '';
    exercice?: string = new Date().getFullYear().toString();
    niveauBudget?: string = 'DEPARTEMENT';
    departementId?: number;
    departementName?: string = '';
    agenceId?: number;
    agenceName?: string = '';
    categorieDepenseId?: number;
    categorieDepenseName?: string = '';
    montantAlloue?: number = 0;
    montantDepense?: number = 0;
    montantEngage?: number = 0;
    montantDisponible?: number = 0;
    tauxConsommation?: number = 0;
    status?: string = 'ACTIVE';
    dateDebut?: string = '';
    dateFin?: string = '';
    notes?: string = '';
    userAction?: string = '';

    constructor(init?: Partial<BudgetDepense>) {
        Object.assign(this, init);
    }
}

// Demande de dépense
export interface DemandeDepense {
    id?: number;
    numeroDemande?: string;
    dateDemande?: string;
    agentDemandeurId?: number;
    agentDemandeurName?: string;
    departementId?: number;
    departementName?: string;
    agenceId?: number;
    agenceName?: string;
    categorieDepenseId?: number;
    categorieDepenseCode?: string;
    categorieDepenseName?: string;
    natureLibelle?: string;
    montantEstimeFBU?: number;
    montantEstimeUSD?: number;
    beneficiaireFournisseur?: string;
    niveauPrioriteId?: number;
    niveauPrioriteName?: string;
    justification?: string;
    pieceJointeUrl?: string;
    status?: string;
    budgetId?: number;
    budgetLibelle?: string;
    budgetDisponible?: number;
    budgetAlerte?: string;
    // Approbation
    approbateurN1Id?: number;
    approbateurN1Name?: string;
    dateApprobationN1?: string;
    commentaireN1?: string;
    approbateurN2Id?: number;
    approbateurN2Name?: string;
    dateApprobationN2?: string;
    commentaireN2?: string;
    approbateurN3Id?: number;
    approbateurN3Name?: string;
    dateApprobationN3?: string;
    commentaireN3?: string;
    // Paiement
    modePaiementId?: number;
    modePaiementName?: string;
    montantPaye?: number;
    datePaiement?: string;
    numeroBonCaisse?: string;
    referenceVirement?: string;
    typeSource?: string;
    compteSourceId?: number;
    compteDestinationId?: number;
    typeCompteDestination?: string;
    // Justificatif
    justificatifFourni?: boolean;
    dateJustificatif?: string;
    referenceJustificatif?: string;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class DemandeDepenseClass implements DemandeDepense {
    id?: number;
    numeroDemande?: string = '';
    dateDemande?: string = new Date().toISOString().split('T')[0];
    agentDemandeurId?: number;
    agentDemandeurName?: string = '';
    departementId?: number;
    departementName?: string = '';
    agenceId?: number;
    agenceName?: string = '';
    categorieDepenseId?: number;
    categorieDepenseCode?: string = '';
    categorieDepenseName?: string = '';
    natureLibelle?: string = '';
    montantEstimeFBU?: number = 0;
    montantEstimeUSD?: number;
    beneficiaireFournisseur?: string = '';
    niveauPrioriteId?: number;
    niveauPrioriteName?: string = '';
    justification?: string = '';
    pieceJointeUrl?: string = '';
    status?: string = 'BROUILLON';
    budgetDisponible?: number = 0;
    budgetAlerte?: string = '';
    approbateurN1Id?: number;
    approbateurN1Name?: string = '';
    dateApprobationN1?: string = '';
    commentaireN1?: string = '';
    approbateurN2Id?: number;
    approbateurN2Name?: string = '';
    dateApprobationN2?: string = '';
    commentaireN2?: string = '';
    approbateurN3Id?: number;
    approbateurN3Name?: string = '';
    dateApprobationN3?: string = '';
    commentaireN3?: string = '';
    modePaiementId?: number;
    modePaiementName?: string = '';
    montantPaye?: number = 0;
    datePaiement?: string = '';
    numeroBonCaisse?: string = '';
    referenceVirement?: string = '';
    compteDestinationId?: number;
    typeCompteDestination?: string = '';
    justificatifFourni?: boolean = false;
    dateJustificatif?: string = '';
    referenceJustificatif?: string = '';
    userAction?: string = '';

    constructor(init?: Partial<DemandeDepense>) {
        Object.assign(this, init);
    }
}

// Petite caisse
export interface PetiteCaisse {
    id?: number;
    code?: string;
    agenceId?: number;
    agenceName?: string;
    responsableId?: number;
    responsableName?: string;
    plafond?: number;
    soldeActuel?: number;
    seuilReapprovisionnement?: number;
    montantMaxParSortie?: number;
    internalAccountId?: number;
    status?: string;
    dernierArrete?: string;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PetiteCaisseClass implements PetiteCaisse {
    id?: number;
    code?: string = '';
    agenceId?: number;
    agenceName?: string = '';
    responsableId?: number;
    responsableName?: string = '';
    plafond?: number = 200000;
    soldeActuel?: number = 0;
    seuilReapprovisionnement?: number = 40000;
    montantMaxParSortie?: number = 50000;
    internalAccountId?: number;
    status?: string = 'ACTIVE';
    dernierArrete?: string = '';
    userAction?: string = '';

    constructor(init?: Partial<PetiteCaisse>) {
        Object.assign(this, init);
    }
}

// Mouvement de petite caisse
export interface MouvementPetiteCaisse {
    id?: number;
    petiteCaisseId?: number;
    type?: string;
    montant?: number;
    motif?: string;
    beneficiaire?: string;
    referenceJustificatif?: string;
    justificatifFourni?: boolean;
    dateOperation?: string;
    operateurId?: number;
    operateurName?: string;
    validePar?: number;
    valideParName?: string;
    status?: string;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class MouvementPetiteCaisseClass implements MouvementPetiteCaisse {
    id?: number;
    petiteCaisseId?: number;
    type?: string = 'SORTIE';
    montant?: number = 0;
    motif?: string = '';
    beneficiaire?: string = '';
    referenceJustificatif?: string = '';
    justificatifFourni?: boolean = false;
    dateOperation?: string = new Date().toISOString().split('T')[0];
    operateurId?: number;
    operateurName?: string = '';
    validePar?: number;
    valideParName?: string = '';
    status?: string = 'EN_ATTENTE';
    userAction?: string = '';

    constructor(init?: Partial<MouvementPetiteCaisse>) {
        Object.assign(this, init);
    }
}

// Options pour les dropdowns
export const CATEGORIES_DEPENSE = [
    { label: 'Dépenses Opérationnelles', value: 'DEP-OP' },
    { label: 'Ressources Humaines', value: 'DEP-RH' },
    { label: 'Logistique & Transport', value: 'DEP-LOG' },
    { label: 'Informatique & Tech', value: 'DEP-INFO' },
    { label: 'Marketing & Communication', value: 'DEP-MKT' },
    { label: 'Charges Financières', value: 'DEP-FIN' },
    { label: 'Investissements / Immo.', value: 'DEP-IMMO' },
    { label: 'Fournitures de Bureau', value: 'DEP-FOUR' },
    { label: 'Charges Fiscales', value: 'DEP-FISC' },
    { label: 'Dépenses Diverses', value: 'DEP-DIV' }
];

export const NIVEAUX_PRIORITE_OPTIONS = [
    { label: 'P1 - Normal', value: 'P1' },
    { label: 'P2 - Urgent', value: 'P2' },
    { label: 'P3 - Très Urgent', value: 'P3' },
    { label: 'P4 - Immédiat (Petite Caisse)', value: 'P4' }
];

export const STATUTS_DEMANDE_DEPENSE = [
    { label: 'Brouillon', value: 'BROUILLON' },
    { label: 'Soumise', value: 'SOUMISE' },
    { label: 'Engagée', value: 'ENGAGEE' },
    { label: 'Validée N1', value: 'VALIDEE_N1' },
    { label: 'Validée N2', value: 'VALIDEE_N2' },
    { label: 'Approuvée', value: 'APPROUVEE' },
    { label: 'En Paiement', value: 'EN_PAIEMENT' },
    { label: 'Payée', value: 'PAYEE' },
    { label: 'Justifiée', value: 'JUSTIFIEE' },
    { label: 'Clôturée', value: 'CLOTUREE' },
    { label: 'Rejetée', value: 'REJETEE' },
    { label: 'Retournée', value: 'RETOURNEE' },
    { label: 'Annulée', value: 'ANNULEE' }
];

export const MODES_PAIEMENT_DEPENSE = [
    { label: 'Espèces (Caisse)', value: 'ESPECES' },
    { label: 'Virement Bancaire', value: 'VIREMENT_BANCAIRE' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Virement Interne', value: 'VIREMENT_INTERNE' }
];

export const NIVEAUX_BUDGET = [
    { label: 'Institutionnel', value: 'INSTITUTIONNEL' },
    { label: 'Par Département', value: 'DEPARTEMENT' },
    { label: 'Par Agence', value: 'AGENCE' },
    { label: 'Par Catégorie', value: 'CATEGORIE' },
    { label: 'Par Projet', value: 'PROJET' }
];

export const STATUTS_BUDGET = [
    { label: 'Actif', value: 'ACTIVE' },
    { label: 'Suspendu', value: 'SUSPENDU' },
    { label: 'Clôturé', value: 'CLOTURE' },
    { label: 'Révisé', value: 'REVISE' }
];

export const TYPES_MOUVEMENT_PC = [
    { label: 'Sortie', value: 'SORTIE' },
    { label: 'Réapprovisionnement', value: 'REAPPROVISIONNEMENT' },
    { label: 'Régularisation', value: 'REGULARISATION' }
];

export const STATUTS_MOUVEMENT_PC = [
    { label: 'En attente', value: 'EN_ATTENTE' },
    { label: 'Validé', value: 'VALIDE' },
    { label: 'Rejeté', value: 'REJETE' }
];

export const STATUTS_PETITE_CAISSE = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Suspendue', value: 'SUSPENDUE' },
    { label: 'Fermée', value: 'FERMEE' }
];

export const ACTIONS_APPROBATION = [
    { label: 'Approuver', value: 'APPROUVER' },
    { label: 'Rejeter', value: 'REJETER' },
    { label: 'Retourner en Correction', value: 'RETOURNER' },
    { label: 'Déléguer', value: 'DELEGUER' },
    { label: 'Escalader', value: 'ESCALADER' }
];
