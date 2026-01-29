export class GrhRensCarriere {
    matriculeId: string;
    fonctionId: string;
    gradeId: string;
    departmentId: string;
    serviceId: string;
    collineId: string;
    indiceId: string;
    anneeEmbauche: number | null;
    statut: string;
    reference: string;
    echelon: number;
    dateObtentionGrade: string;
    dateObtentionEchelon: string;
    specialite: string;
    niveauFormation: string;
    nbrJoursConge: number;
    base: number;
    categorieId: string;
    tauxPensionComplPers: number;
    tauxPensionComplPatr: number;
    codeBanque: string;
    compte: string;
    soinsDeSante: number;
    payeONPR: boolean;
    tauxIprVacatairePers: number;
    tauxIprVacatairePatr: number;
    pourcJubile: number;
    calculerDeplacement: boolean;

    // Employee information for display (not part of the entity)
    nom?: string;
    prenom?: string;

    // Display labels for dropdowns
    fonctionLibelle?: string;
    gradeLibelle?: string;
    departmentLibelle?: string;
    serviceLibelle?: string;
    categorieLibelle?: string;
    collineLibelle?: string;

    constructor() {
        this.matriculeId = '';
        this.fonctionId = '';
        this.gradeId = '';
        this.departmentId = '';
        this.serviceId = '';
        this.collineId = '';
        this.indiceId = '';
        this.anneeEmbauche = null;
        this.statut = '';
        this.reference = '';
        this.echelon = 0;
        this.dateObtentionGrade = '';
        this.dateObtentionEchelon = '';
        this.specialite = '';
        this.niveauFormation = '';
        this.nbrJoursConge = 0;
        this.base = 0;
        this.categorieId = '';
        this.tauxPensionComplPers = 0;
        this.tauxPensionComplPatr = 15;
        this.codeBanque = '';
        this.compte = '';
        this.soinsDeSante = 0;
        this.payeONPR = false;
        this.tauxIprVacatairePers = 0;
        this.tauxIprVacatairePatr = 0;
        this.pourcJubile = 0;
        this.calculerDeplacement = true;
    }
}