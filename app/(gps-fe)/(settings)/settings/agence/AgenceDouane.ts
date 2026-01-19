export class AgenceDouane {
    agenceDouaneId: number | undefined;
    libelle: string;
    adresse: string;
    tel: string;
    responsable: string;

    constructor() {
        this.libelle = '';
        this.adresse = '';
        this.tel = '';
        this.responsable = '';
    }
}