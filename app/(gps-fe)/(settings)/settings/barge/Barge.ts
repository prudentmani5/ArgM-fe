export class Barge {
    bargeId: number | null;
    armateur: number;
    armateurNom: string;
    nom: string;
    plaque: string;
    longeur: number;
    largeur: number;
    tirant: number;
    transport: string;
    tirantEau: number;
    accostageEnDollars: boolean;

    constructor() {
      this.bargeId = null;
      this.armateur = 0;
      this.armateurNom = "";
      this.nom = "";
      this.plaque = "";
      this.longeur = 0;
      this.largeur = 0;
      this.tirant = 0;
      this.transport = "";
      this.tirantEau = 0;
      this.accostageEnDollars = false;
    }
  }
  