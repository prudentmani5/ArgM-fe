export class CategoryArticle {
    id: string;
    libelle: string;
    compte: string;
    type: string;
    magasinId: string;

    constructor(
        id: string = "",
        libelle: string = "",
        compte: string = "",
        type: string = "",
        magasinId: string = ""
    ) {
        this.id = id;
        this.libelle = libelle;
        this.compte = compte;
        this.type = type;
        this.magasinId = magasinId;
    }

    // Méthode de validation (optionnelle - déplacée dans le composant)
    isValid(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (!this.id.trim()) {
            errors.push("Le code catégorie est obligatoire");
        }
        
        if (!this.libelle.trim()) {
            errors.push("Le libellé est obligatoire");
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Méthode pour créer une copie de l'objet
    clone(): CategoryArticle {
        return new CategoryArticle(
            this.id,
            this.libelle,
            this.compte,
            this.type,
            this.magasinId
        );
    }
}