export class TauxChange {
  tauxChangeId: number | null;
  taux: number;
  userId: number | null;
  userName: string;
  dateCreation: string;
  actif: boolean;

  constructor() {
    this.tauxChangeId = null;
    this.taux = 0;
    this.userId = null;
    this.userName = '';
    this.dateCreation = '';
    this.actif = true;
  }
}

export interface TauxChangeRequestDTO {
  taux: number;
  userId: number;
}
