export class GrhRensIdentification {
    matriculeId: string;
    ancienId: string;
    nouveauId: string;
    nom: string;
    prenom: string;
    sexe: string;
    villeNaissance: string;
    paysId: string;
    collineId: string;
    cin: string;
    passeport: string;
    permis: string;
    situationId: string;
    numINSS: string;
    numMFP: string;
    codeBanque: string;
    compte: string;
    photoId: string;
    photo?: File | null;
    photoUrl?: string;
    pere: string;
    mere: string;
    anneeRetraite: string;
    dateSituation: Date | null;
    causeSituation: string;
    dateNaissance: string; // Year only (e.g., "1990")
    dateNaissanceTemp?: Date | null; // Temporary field for Calendar component
    codeBanque1: string;
    compte1: string;

    constructor() {
        this.matriculeId = "";
        this.ancienId = "";
        this.nouveauId = "";
        this.nom = "";
        this.prenom = "";
        this.sexe = "";
        this.villeNaissance = "";
        this.paysId = "";
        this.collineId = "";
        this.cin = "";
        this.passeport = "";
        this.permis = "";
        this.situationId = "";
        this.numINSS = "";
        this.numMFP = "";
        this.codeBanque = "";
        this.compte = "";
        this.photoId = "";
        this.photo = null;
        this.photoUrl = "";
        this.pere = "";
        this.mere = "";
        this.anneeRetraite = "";
        this.dateSituation = null;
        this.causeSituation = "";
        this.dateNaissance = "";
        this.dateNaissanceTemp = null;
        this.codeBanque1 = "";
        this.compte1 = "";
    }
}