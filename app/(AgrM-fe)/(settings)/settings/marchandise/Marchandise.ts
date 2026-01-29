export class Marchandise {
    marchandiseId?: number;
    nom: string;
    prixCamion: number | null;
    prixBarge: number | null;
    typeConditionId: string;
    categorie: string;
    classeMarchandiseId: number;
    sallissage: boolean;
    compte: string;
    genre: string;
    classeId: number;
    surtaxe: number;
    actif: boolean;
  
    constructor() {
      this.nom = "";
      this.prixCamion = 0;
      this.prixBarge = 0;
      this.typeConditionId = "";
      this.categorie = "";
      this.classeMarchandiseId = 0;
      this.sallissage = false;
      this.compte = "";
      this.genre = "";
      this.classeId = 0;
      this.surtaxe = 0;
      this.actif = true;
    }
  }
  