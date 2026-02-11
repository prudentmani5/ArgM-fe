// ============================================================================
// Types pour le module Comptabilité SYSCOHADA Microfinance
// ============================================================================

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
  codeLibelle: string;
  userAction: string;

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
    this.codeLibelle = '';
    this.userAction = '';
  }
}

export class CptJournal {
  journalId: string;
  codeJournal: string;
  dossierId: string;
  typeJournal: string;
  nomJournal: string;
  compteId: string;
  enDevise: boolean;
  codeLibelle: string;
  userAction: string;

  constructor() {
    this.journalId = '';
    this.codeJournal = '';
    this.dossierId = '';
    this.typeJournal = '';
    this.nomJournal = '';
    this.compteId = '';
    this.enDevise = false;
    this.codeLibelle = '';
    this.userAction = '';
  }
}

export class CptExercice {
  exerciceId: string;
  codeExercice: string;
  dossierId: number;
  description: string;
  dateDebut: string;
  dateFin: string;
  dateCloture: string;
  cloture: boolean;
  userAction: string;

  constructor() {
    this.exerciceId = '';
    this.codeExercice = '';
    this.dossierId = 0;
    this.description = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.dateCloture = '';
    this.cloture = false;
    this.userAction = '';
  }
}

export class CptBrouillard {
  brouillardId: string;
  codeBrouillard: string;
  dossierId: number;
  journalId: string;
  codeJournal: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  valide: boolean;
  exerciceId: string;
  userAction: string;

  constructor() {
    this.brouillardId = '';
    this.codeBrouillard = '';
    this.dossierId = 0;
    this.journalId = '';
    this.codeJournal = '';
    this.description = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.valide = false;
    this.exerciceId = '';
    this.userAction = '';
  }
}

export class CptEcriture {
  ecritureId: string;
  pieceId: string;
  compteId: string;
  numeroPiece: string;
  journalId: string;
  brouillardId: string;
  reference: string;
  dateEcriture: string;
  debit: number;
  credit: number;
  activiteId: string;
  financementId: string;
  regionId: string;
  facture: string;
  deviseId: string;
  taux: number;
  debitDevise: number;
  creditDevise: number;
  ecritureIdTVA: string;
  valide: boolean;
  rapproche: boolean;
  userCreation: string;
  dateCreation: string;
  dateUpdate: string;
  userUpdate: string;
  exerciceId: string;
  soldeJournal: number;
  soldeCompte: number;
  codeJournal: string;
  codeCompte: string;
  printDate?: string;
  libelle: string;
  userAction: string;

  constructor() {
    this.ecritureId = '';
    this.pieceId = '';
    this.compteId = '';
    this.numeroPiece = '';
    this.journalId = '';
    this.brouillardId = '';
    this.reference = '';
    this.dateEcriture = '';
    this.debit = 0;
    this.credit = 0;
    this.activiteId = '';
    this.financementId = '';
    this.regionId = '';
    this.facture = '';
    this.deviseId = '';
    this.taux = 0;
    this.debitDevise = 0;
    this.creditDevise = 0;
    this.ecritureIdTVA = '';
    this.valide = false;
    this.rapproche = false;
    this.userCreation = '';
    this.dateCreation = '';
    this.dateUpdate = '';
    this.userUpdate = '';
    this.exerciceId = '';
    this.soldeJournal = 0;
    this.soldeCompte = 0;
    this.codeJournal = '';
    this.codeCompte = '';
    this.libelle = '';
    this.userAction = '';
  }
}

export class TauxChange {
  tauxChangeId: string;
  taux: number;
  dateCreation: string;
  userName: string;
  actif: boolean;
  userAction: string;

  constructor() {
    this.tauxChangeId = '';
    this.taux = 0;
    this.dateCreation = '';
    this.userName = '';
    this.actif = false;
    this.userAction = '';
  }
}

export interface TauxChangeRequestDTO {
  taux: number;
  userId: number;
  userAction: string;
}

// ============================================================================
// Types pour la Clôture Journalière (Daily Closing)
// ============================================================================

export interface DailyClosing {
  closingId: number;
  closingDate: string;
  startTime: string;
  endTime: string;
  exerciceId: number;
  status: string;
  depositsCount: number;
  withdrawalsCount: number;
  disbursementsCount: number;
  repaymentsCount: number;
  penaltiesCount: number;
  earlyRepaymentsCount: number;
  treasuryCount: number;
  totalEntriesGenerated: number;
  totalDebit: number;
  totalCredit: number;
  executedBy: string;
  executedAt: string;
  reversedBy: string;
  reversedAt: string;
  notes: string;
  errorMessage: string;
  userAction: string;
}

export interface DailyClosingDetail {
  detailId: number;
  closingId: number;
  sourceModule: string;
  sourceType: string;
  sourceId: number;
  sourceReference: string;
  journalCode: string;
  pieceId: string;
  numeroPiece: string;
  amount: number;
}

export interface PreviewEntry {
  sourceModule: string;
  sourceType: string;
  sourceReference: string;
  sourceId: number;
  journalCode: string;
  numeroPiece: string;
  codeCompte: string;
  libelleCompte: string;
  debit: number;
  credit: number;
  libelle: string;
}

export interface DailyClosingPreview {
  date: string;
  alreadyClosed: boolean;
  entries: PreviewEntry[];
  totalEntries: number;
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
  epargneEntries: PreviewEntry[];
  creditEntries: PreviewEntry[];
  remboursementEntries: PreviewEntry[];
  tresorerieEntries: PreviewEntry[];
  depositsCount: number;
  withdrawalsCount: number;
  disbursementsCount: number;
  repaymentsCount: number;
  earlyRepaymentsCount: number;
}
