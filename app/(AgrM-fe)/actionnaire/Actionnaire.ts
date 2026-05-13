export type TypeActionnaire = 'FONDATEUR' | 'ORDINAIRE' | 'INSTITUTIONNEL' | 'EMPLOYE' | 'ETAT';
export type StatutActionnaire = 'ACTIF' | 'SUSPENDU' | 'RETIRE';
export type StatutKYC = 'VALIDE' | 'EN_ATTENTE' | 'EXPIRE';
export type ModeLiberation = 'IMMEDIATE' | 'ECHELONNEE';
export type ModePaiement = 'CAISSE' | 'BANQUE' | 'EPARGNE';
export type StatutSouscription = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';
export type StatutTransfert = 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'EXECUTEE';
export type StatutDividende = 'EN_ATTENTE' | 'APPROUVE' | 'PAYE' | 'REINVESTI';
export type StatutPaiementDividende = 'EN_ATTENTE' | 'PAYE' | 'REINVESTI';
export type TypeAG = 'AGO' | 'AGE' | 'AGM';
export type StatutAG = 'PLANIFIEE' | 'EN_COURS' | 'CLOTUREE' | 'ANNULEE';

export interface Actionnaire {
    id?: number;
    numeroActionnaire?: string;
    nom?: string;
    nif?: string;
    typeActionnaire?: TypeActionnaire;
    nombreParts?: number;
    pourcentageCapital?: number;
    valeurTotale?: number;
    dateEntreeCapital?: string;
    statut?: StatutActionnaire;
    statutKYC?: StatutKYC;
    dateNaissance?: string;
    nationalite?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    profession?: string;
    agenceRattachement?: string;
    compteEpargneLie?: string;
    creditActif?: boolean;
    userAction?: string;
}

export class ActionnaireClass implements Actionnaire {
    id = undefined;
    numeroActionnaire = '';
    nom = '';
    nif = '';
    typeActionnaire: TypeActionnaire = 'ORDINAIRE';
    nombreParts = 0;
    pourcentageCapital = 0;
    valeurTotale = 0;
    dateEntreeCapital = '';
    statut: StatutActionnaire = 'ACTIF';
    statutKYC: StatutKYC = 'EN_ATTENTE';
    dateNaissance = '';
    nationalite = '';
    adresse = '';
    telephone = '';
    email = '';
    profession = '';
    agenceRattachement = '';
    compteEpargneLie = '';
    creditActif = false;
    userAction = '';
}

export interface Souscription {
    id?: number;
    actionnaireId?: number;
    actionnaireNom?: string;
    typeActionnaire?: TypeActionnaire;
    nombreParts?: number;
    prixParPart?: number;
    montantTotal?: number;
    modeLiberation?: ModeLiberation;
    modePaiement?: ModePaiement;
    dateSouscription?: string;
    referenceJustificatif?: string;
    statut?: StatutSouscription;
    userAction?: string;
}

export class SouscriptionClass implements Souscription {
    id = undefined;
    actionnaireId = undefined;
    actionnaireNom = '';
    typeActionnaire: TypeActionnaire = 'ORDINAIRE';
    nombreParts = 0;
    prixParPart = 0;
    montantTotal = 0;
    modeLiberation: ModeLiberation = 'IMMEDIATE';
    modePaiement: ModePaiement = 'CAISSE';
    dateSouscription = '';
    referenceJustificatif = '';
    statut: StatutSouscription = 'EN_ATTENTE';
    userAction = '';
}

export interface Transfert {
    id?: number;
    cedantId?: number;
    cedantNom?: string;
    cessionnairId?: number;
    cessionnaireNom?: string;
    nombreParts?: number;
    prixParPart?: number;
    montantTotal?: number;
    dateCession?: string;
    referencePVCA?: string;
    statut?: StatutTransfert;
    typeOperation?: 'TRANSFERT' | 'RACHAT';
    referenceDecision?: string;
    userAction?: string;
}

export class TransfertClass implements Transfert {
    id = undefined;
    cedantId = undefined;
    cedantNom = '';
    cessionnairId = undefined;
    cessionnaireNom = '';
    nombreParts = 0;
    prixParPart = 0;
    montantTotal = 0;
    dateCession = '';
    referencePVCA = '';
    statut: StatutTransfert = 'EN_ATTENTE';
    typeOperation: 'TRANSFERT' | 'RACHAT' = 'TRANSFERT';
    referenceDecision = '';
    userAction = '';
}

export interface DeclarationDividende {
    id?: number;
    exercice?: number;
    beneficeNet?: number;
    tauxDistribution?: number;
    totalDividendes?: number;
    reserveLegale?: number;
    reportANouveau?: number;
    dividendeParPart?: number;
    tauxIRCM?: number;
    dateMiseEnPaiement?: string;
    statut?: StatutDividende;
    referenceResolutionAGO?: string;
    userAction?: string;
}

export class DeclarationDividendeClass implements DeclarationDividende {
    id = undefined;
    exercice = new Date().getFullYear() - 1;
    beneficeNet = 0;
    tauxDistribution = 0;
    totalDividendes = 0;
    reserveLegale = 0;
    reportANouveau = 0;
    dividendeParPart = 0;
    tauxIRCM = 15;
    dateMiseEnPaiement = '';
    statut: StatutDividende = 'EN_ATTENTE';
    referenceResolutionAGO = '';
    userAction = '';
}

export interface AssembleeGenerale {
    id?: number;
    typeAG?: TypeAG;
    dateAG?: string;
    lieu?: string;
    heureDebut?: string;
    heureFin?: string;
    quorumRequis?: number;
    quorumAtteint?: number;
    statut?: StatutAG;
    ordreduJour?: string;
    referencePV?: string;
    userAction?: string;
}

export class AssembleeGeneraleClass implements AssembleeGenerale {
    id = undefined;
    typeAG: TypeAG = 'AGO';
    dateAG = '';
    lieu = '';
    heureDebut = '';
    heureFin = '';
    quorumRequis = 0;
    quorumAtteint = 0;
    statut: StatutAG = 'PLANIFIEE';
    ordreduJour = '';
    referencePV = '';
    userAction = '';
}

export interface ParametresCapital {
    id?: number;
    valeurNominaleParPart?: number;
    capitalSocialAutorise?: number;
    delaiPreavisRachat?: number;
    tauxIRCMDefaut?: number;
    modeCalculVote?: 'PROPORTIONNEL' | 'PLAFONNE' | 'EGALITAIRE';
    seuilNotificationBRB?: number;
    delaiLegalConvocationAG?: number;
    userAction?: string;
}
