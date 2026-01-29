export class Magasin {
    magasinId: string;  // Changé de "id" à "magasinId"
    nom: string;        // Changé de "libelle" à "nom"
    adresse?: string;
    pointVente?: boolean; // Ajouté
    type?: number;       // Ajouté

    constructor(
        magasinId: string = "",
        nom: string = "",
        adresse: string = "",
        pointVente: boolean = false,
        type: number = 0
    ) {
        this.magasinId = magasinId;
        this.nom = nom;
        this.adresse = adresse;
        this.pointVente = pointVente;
        this.type = type;
    }
}

// Alternative si vous préférez garder l'ancienne structure
export class MagasinCompat {
    id: string;
    libelle: string;
    adresse?: string;
    pointVente?: boolean;
    type?: number;

    constructor() {
        this.id = "";
        this.libelle = "";
        this.adresse = "";
        this.pointVente = false;
        this.type = 0;
    }
}