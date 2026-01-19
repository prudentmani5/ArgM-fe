export class AyantDroit {
    rensAyantDroitId?: number;
    matriculeId: string;
    categorie: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    dateMariage?: string;
    dateDivorce?: string;
    dateDeces?: string;
    priseEnCharge: boolean;
    refExtraitActeNaissance?: string;
    refExtraitActeMariage?: string;
    refCertificatDeces?: string;
    userCreation?: string;
    dateCreation?: string;
    userUpdate?: string;
    dateUpdate?: string;

    constructor() {
        this.rensAyantDroitId = undefined;
        this.matriculeId = '';
        this.categorie = '';
        this.nom = '';
        this.prenom = '';
        this.dateNaissance = '';
        this.dateMariage = undefined;
        this.dateDivorce = undefined;
        this.dateDeces = undefined;
        this.priseEnCharge = false;
        this.refExtraitActeNaissance = undefined;
        this.refExtraitActeMariage = undefined;
        this.refCertificatDeces = undefined;
        this.userCreation = undefined;
        this.dateCreation = undefined;
        this.userUpdate = undefined;
        this.dateUpdate = undefined;
    }
}
