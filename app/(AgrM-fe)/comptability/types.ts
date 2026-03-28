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

export class CptTypeJournal {
  typeJournalId: string;
  code: string;
  libelle: string;
  actif: boolean;
  userAction: string;

  constructor() {
    this.typeJournalId = '';
    this.code = '';
    this.libelle = '';
    this.actif = true;
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
  statementRequestsCount: number;
  checkbookOrdersCount: number;
  fraisCompteCount: number;
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
  fraisEpargneEntries: PreviewEntry[];
  depositsCount: number;
  withdrawalsCount: number;
  disbursementsCount: number;
  repaymentsCount: number;
  earlyRepaymentsCount: number;
  virementsCount: number;
  dotationsCount: number;
  statementRequestsCount: number;
  checkbookOrdersCount: number;
  fraisCompteCount: number;
}

// ============================================================================
// Types pour les Périodes Comptables (Accounting Periods)
// ============================================================================

export class CptAccountingPeriod {
  periodId: string;
  exerciceId: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  status: string;
  closedBy: string;
  closedAt: string;
  userAction: string;

  constructor() {
    this.periodId = '';
    this.exerciceId = '';
    this.month = 1;
    this.year = new Date().getFullYear();
    this.startDate = '';
    this.endDate = '';
    this.status = 'OPEN';
    this.closedBy = '';
    this.closedAt = '';
    this.userAction = '';
  }
}

// ============================================================================
// Types pour la Clôture Mensuelle (Monthly Closing)
// ============================================================================

export interface ChecklistItem {
  step: string;
  description: string;
  status: string;
  details: string;
}

export interface MonthlyClosing {
  closingId: number;
  exerciceId: number;
  month: number;
  year: number;
  status: string;
  checklistJson: string;
  totalDebit: number;
  totalCredit: number;
  executedBy: string;
  executedAt: string;
  approvedBy: string;
  approvedAt: string;
  notes: string;
  userAction: string;
}

export interface MonthlyClosingPreview {
  month: number;
  year: number;
  exerciceId: number;
  allDailyClosingsDone: boolean;
  periodExists: boolean;
  periodOpen: boolean;
  dailyClosingsCount: number;
  dailyClosingsExpected: number;
  canClose: boolean;
  checklist: ChecklistItem[];
}

// ============================================================================
// Types pour la Clôture Annuelle (Annual Closing)
// ============================================================================

export interface AnnualClosing {
  closingId: number;
  exerciceId: number;
  status: string;
  resultNet: number;
  resultCompte: string;
  anouveauGenerated: boolean;
  newExerciceId: number;
  executedBy: string;
  executedAt: string;
  approvedBy: string;
  approvedAt: string;
  notes: string;
  userAction: string;
}

export interface AnnualClosingPreview {
  exerciceId: number;
  allMonthsClosed: boolean;
  monthlyClosingsCount: number;
  resultNet: number;
  canClose: boolean;
  checklist: ChecklistItem[];
}

// ============================================================================
// Types pour la Gestion de Caisse (Cash Management)
// ============================================================================

export class CptCaisse {
  caisseId: string;
  codeCaisse: string;
  libelle: string;
  branchId: string;
  agentId: string;
  agentName: string;
  plafond: number;
  soldeActuel: number;
  status: string;
  compteComptable: string;
  parentCaisseId: string;
  typeCaisse: string;
  journalId: string;
  actif: boolean;
  closingStatus: string;
  userAction: string;

  constructor() {
    this.caisseId = '';
    this.codeCaisse = '';
    this.libelle = '';
    this.branchId = '';
    this.agentId = '';
    this.agentName = '';
    this.plafond = 0;
    this.soldeActuel = 0;
    this.status = 'CLOSED';
    this.compteComptable = '571';
    this.parentCaisseId = '';
    this.typeCaisse = 'GUICHET';
    this.journalId = '';
    this.actif = true;
    this.closingStatus = '';
    this.userAction = '';
  }
}

export class CptCashCount {
  cashCountId: string;
  caisseId: string;
  countDate: string;
  countType: string;
  bill10000: number;
  bill5000: number;
  bill2000: number;
  bill1000: number;
  bill500: number;
  coin100: number;
  coin50: number;
  coin10: number;
  coin5: number;
  coin1: number;
  totalPhysique: number;
  totalTheorique: number;
  ecart: number;
  countedBy: string;
  validatedBy: string;
  validatedAt: string;
  validationStatus: string;
  notes: string;
  userAction: string;

  constructor() {
    this.cashCountId = '';
    this.caisseId = '';
    this.countDate = '';
    this.countType = 'OPENING';
    this.bill10000 = 0;
    this.bill5000 = 0;
    this.bill2000 = 0;
    this.bill1000 = 0;
    this.bill500 = 0;
    this.coin100 = 0;
    this.coin50 = 0;
    this.coin10 = 0;
    this.coin5 = 0;
    this.coin1 = 0;
    this.totalPhysique = 0;
    this.totalTheorique = 0;
    this.ecart = 0;
    this.countedBy = '';
    this.validatedBy = '';
    this.validatedAt = '';
    this.validationStatus = 'PENDING';
    this.notes = '';
    this.userAction = '';
  }
}

// ============================================================================
// Types pour les Virements Internes (Internal Transfers)
// ============================================================================

export class VirementInterne {
  virementId: string;
  reference: string;
  caisseSourceId: string;
  caisseDestId: string;
  montant: number;
  libelle: string;
  dateVirement: string;
  status: string;
  pieceId: string;
  exerciceId: string;
  executedBy: string;
  executedAt: string;
  userAction: string;
  codeCaisseSource: string;
  codeCaisseDest: string;
  libelleCaisseSource: string;
  libelleCaisseDest: string;
  validatedBy: string;
  validatedAt: string;
  // Transfer billetage (denomination breakdown sent by source)
  transferBill10000: number;
  transferBill5000: number;
  transferBill2000: number;
  transferBill1000: number;
  transferBill500: number;
  transferCoin100: number;
  transferCoin50: number;
  transferCoin10: number;
  transferCoin5: number;
  transferCoin1: number;

  constructor() {
    this.virementId = '';
    this.reference = '';
    this.caisseSourceId = '';
    this.caisseDestId = '';
    this.montant = 0;
    this.libelle = '';
    this.dateVirement = '';
    this.status = 'COMPLETED';
    this.pieceId = '';
    this.exerciceId = '';
    this.executedBy = '';
    this.executedAt = '';
    this.userAction = '';
    this.codeCaisseSource = '';
    this.codeCaisseDest = '';
    this.libelleCaisseSource = '';
    this.libelleCaisseDest = '';
    this.validatedBy = '';
    this.validatedAt = '';
    this.transferBill10000 = 0;
    this.transferBill5000 = 0;
    this.transferBill2000 = 0;
    this.transferBill1000 = 0;
    this.transferBill500 = 0;
    this.transferCoin100 = 0;
    this.transferCoin50 = 0;
    this.transferCoin10 = 0;
    this.transferCoin5 = 0;
    this.transferCoin1 = 0;
  }
}

// ============================================================================
// Types pour la Validation de Fermeture (Daily Closing Validation Workflow)
// ============================================================================

export interface ClosingComparison {
  caisseId: number;
  codeCaisse: string;
  libelle: string;
  date: string;
  openingCount: CptCashCount | null;
  closingCount: CptCashCount | null;
  soldeOuverture: number;
  soldeFermetureTheorique: number;
  soldeFermeturePhysique: number;
  ecart: number;
  closingStatus: string;
  validationStatus: string;
}

export interface GuichetClosingStatus {
  caisseId: number;
  codeCaisse: string;
  libelle: string;
  agentName: string;
  status: string;
  closingStatus: string;
  soldeActuel: number;
  soldeOuverture: number;
  soldeFermeture: number;
  ecart: number;
  validationStatus: string;
}

export interface BranchClosingStatus {
  parentCaisseId: number;
  date: string;
  guichets: GuichetClosingStatus[];
  totalGuichets: number;
  guichetsFermes: number;
  guichetsValides: number;
  allClosed: boolean;
  allValidated: boolean;
  readyForAccounting: boolean;
}

// ============================================================================
// Types pour les Comptes Internes (Internal Accounts)
// ============================================================================

export interface InternalAccount {
  accountId?: number;
  codeCompte: string;
  accountNumber?: string;
  libelle: string;
  compteComptableId: number | null;
  journalId: number | null;
  soldeActuel: number;
  actif: boolean;
  depotEnabled: boolean;
  retraitEnabled: boolean;
  notes: string | null;
  userAction: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export class InternalAccountClass implements InternalAccount {
  accountId?: number;
  codeCompte: string = '';
  accountNumber?: string;
  libelle: string = '';
  compteComptableId: number | null = null;
  journalId: number | null = null;
  soldeActuel: number = 0;
  actif: boolean = true;
  depotEnabled: boolean = false;
  retraitEnabled: boolean = false;
  notes: string | null = null;
  userAction: string | null = null;
}

export interface InternalAccountOperation {
  operationId?: number;
  operationType: string;
  sourceAccountId: number;
  destAccountId: number | null;
  montant: number;
  libelle: string;
  status: string;
  createdBy: string;
  validatedBy: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  userAction: string;
  createdAt?: string;
  validatedAt?: string;
  rejectedAt?: string;
}

export interface InternalAccountMovement {
  mouvementId?: number;
  accountId: number;
  branchId: number | null;
  dateOperation: string;
  heureOperation: string;
  operationType: string;
  sens: string;
  montant: number;
  reference: string;
  libelle: string;
  soldeAvant: number;
  soldeApres: number;
  compteContrepartieId: number | null;
  libelleContrepartie?: string;
  userAction: string | null;
  createdAt?: string;
}
