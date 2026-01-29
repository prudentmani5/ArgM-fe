export class Magasin {
    id: string;
    libelle: string;
    adresse?: string;
    ville?: string;
    pays?: string;

    constructor() {
        this.id = "";
        this.libelle = "";
        this.adresse = "";
        this.ville = "";
        this.pays = "";
    }
}