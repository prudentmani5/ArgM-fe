export class CptCompte {
  compteId: string;
  codeCompte: string;
  dossierId: number;
  libelle: string;
  typeCompte: number;
  activite: boolean;
  financement: boolean;
  geographique: boolean;
  collectif: boolean;
  actif: boolean;
  codeBudget: string;
  compteBanque: string;
  sens: string;
  adresse: string;
  bp: string;
  tel: string;
  email: string;
  codeLibelle:string;

  constructor() {
    this.compteId = '';
    this.codeCompte = '';
    this.dossierId = 0;
    this.libelle = '';
    this.typeCompte = 0;
    this.activite = false;
    this.financement = false;
    this.geographique = false;
    this.collectif = false;
    this.actif = true;
    this.codeBudget = '';
    this.compteBanque = '';
    this.sens = '';
    this.adresse = '';
    this.bp = '';
    this.tel = '';
    this.email = '';
    this.codeLibelle='';
  }
}
