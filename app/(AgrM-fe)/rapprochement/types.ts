// ============================================================================
// Types pour le module Rapprochement Bancaire
// ============================================================================

export class ReleveBancaire {
    id: number | null;
    nomBanque: string;
    numeroCompte: string;
    moisReleve: number;
    anneeReleve: number;
    dateImport: string;
    soldeDebut: number;
    soldeFin: number;
    notes: string;
    userAction: string;
    createdAt: string;
    updatedAt: string;
    lignes: LigneReleve[];

    constructor() {
        this.id = null;
        this.nomBanque = '';
        this.numeroCompte = '';
        this.moisReleve = new Date().getMonth() + 1;
        this.anneeReleve = new Date().getFullYear();
        this.dateImport = '';
        this.soldeDebut = 0;
        this.soldeFin = 0;
        this.notes = '';
        this.userAction = '';
        this.createdAt = '';
        this.updatedAt = '';
        this.lignes = [];
    }
}

export class LigneReleve {
    id: number | null;
    releveBancaireId: number | null;
    dateOperation: string;
    reference: string;
    description: string;
    montantDebit: number;
    montantCredit: number;
    solde: number;
    rapprochee: boolean;
    userAction: string;
    createdAt: string;

    constructor() {
        this.id = null;
        this.releveBancaireId = null;
        this.dateOperation = '';
        this.reference = '';
        this.description = '';
        this.montantDebit = 0;
        this.montantCredit = 0;
        this.solde = 0;
        this.rapprochee = false;
        this.userAction = '';
        this.createdAt = '';
    }
}

export class RapprochementBancaire {
    id: number | null;
    reference: string;
    releveBancaire: ReleveBancaire | null;
    releveBancaireId: number | null;
    compteComptableId: number | null;
    codeCompte: string;
    mois: number;
    annee: number;
    dateRapprochement: string;
    statut: string;
    soldeBanque: number;
    soldeComptable: number;
    ecart: number;
    comptableSignature: string;
    comptableSignatureDate: string;
    directeurSignature: string;
    directeurSignatureDate: string;
    notes: string;
    userAction: string;
    createdAt: string;
    updatedAt: string;

    constructor() {
        this.id = null;
        this.reference = '';
        this.releveBancaire = null;
        this.releveBancaireId = null;
        this.compteComptableId = null;
        this.codeCompte = '';
        this.mois = new Date().getMonth() + 1;
        this.annee = new Date().getFullYear();
        this.dateRapprochement = '';
        this.statut = 'BROUILLON';
        this.soldeBanque = 0;
        this.soldeComptable = 0;
        this.ecart = 0;
        this.comptableSignature = '';
        this.comptableSignatureDate = '';
        this.directeurSignature = '';
        this.directeurSignatureDate = '';
        this.notes = '';
        this.userAction = '';
        this.createdAt = '';
        this.updatedAt = '';
    }
}

export class LigneRapprochement {
    id: number | null;
    rapprochementId: number | null;
    ligneReleveId: number | null;
    ecritureId: number | null;
    typeMatch: string;
    confiance: number;
    notes: string;
    userAction: string;
    createdAt: string;

    constructor() {
        this.id = null;
        this.rapprochementId = null;
        this.ligneReleveId = null;
        this.ecritureId = null;
        this.typeMatch = 'AUTO';
        this.confiance = 0;
        this.notes = '';
        this.userAction = '';
        this.createdAt = '';
    }
}

export class EcartRapprochement {
    id: number | null;
    rapprochementId: number | null;
    typeEcart: string;
    description: string;
    montant: number;
    ligneReleveId: number | null;
    ecritureId: number | null;
    justification: string;
    ecritureCorrectiveId: number | null;
    resolu: boolean;
    userAction: string;
    createdAt: string;
    updatedAt: string;

    constructor() {
        this.id = null;
        this.rapprochementId = null;
        this.typeEcart = '';
        this.description = '';
        this.montant = 0;
        this.ligneReleveId = null;
        this.ecritureId = null;
        this.justification = '';
        this.ecritureCorrectiveId = null;
        this.resolu = false;
        this.userAction = '';
        this.createdAt = '';
        this.updatedAt = '';
    }
}

// Constants
export const STATUTS_RAPPROCHEMENT = [
    { label: 'Brouillon', value: 'BROUILLON' },
    { label: 'En cours', value: 'EN_COURS' },
    { label: 'Terminé', value: 'TERMINE' },
    { label: 'Validé', value: 'VALIDE' }
];

export const TYPES_ECART = [
    { label: 'Chèque non débité', value: 'CHEQUE_NON_DEBITE' },
    { label: 'Virement en cours', value: 'VIREMENT_EN_COURS' },
    { label: 'Frais bancaires', value: 'FRAIS_BANCAIRES' },
    { label: 'Erreur de saisie', value: 'ERREUR_SAISIE' },
    { label: 'Autre', value: 'AUTRE' }
];

export const MOIS_OPTIONS = [
    { label: 'Janvier', value: 1 },
    { label: 'Février', value: 2 },
    { label: 'Mars', value: 3 },
    { label: 'Avril', value: 4 },
    { label: 'Mai', value: 5 },
    { label: 'Juin', value: 6 },
    { label: 'Juillet', value: 7 },
    { label: 'Août', value: 8 },
    { label: 'Septembre', value: 9 },
    { label: 'Octobre', value: 10 },
    { label: 'Novembre', value: 11 },
    { label: 'Décembre', value: 12 }
];
