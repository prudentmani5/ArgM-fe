export class FacService {
  id: number | undefined;
  libelleService: string;
  compte: string;
  montant: number;
  type: string;
  tonnage: boolean;
  actif: boolean;
  prixUnitaireParJour: boolean;
  tarif1: boolean;
  tarif2: boolean;
  tarif3: boolean;
  enDollars: boolean;
  passPontBascule: boolean;

  constructor() {
    this.libelleService = '';
    this.compte = '';
    this.montant = 0;
    this.type = '';
    this.tonnage = false;
    this.actif = false;
    this.prixUnitaireParJour = false;
    this.tarif1=false;
    this.tarif2=false;
    this.tarif3=false;
    this.enDollars=false;
    this.passPontBascule=false;

  }
}