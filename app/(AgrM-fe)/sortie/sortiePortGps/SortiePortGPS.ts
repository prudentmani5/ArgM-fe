import { PontBascule } from "../../storage/pontBascule/PontBascule";

export class SortiePortGPS {
    sortiePortGPSId: number | null;
    gps: string; // LT/PAC/T1 - same as lettreTransp from FacServicePreste - PRIMARY SEARCH KEY
    clientId: number | null; // From FacServicePreste.importateurId
    dateEntree: Date; // From FacServicePreste.dateDebut
    dateSortie: Date; // From FacServicePreste.dateFin
    typeOperation: string; // From FacServicePreste.typeDechargement - read-only
    numQuittance: string; // This IS the numFacture from FacServicePreste
    poids1erePesee: number | null; // From selected PontBascule.poidsVide
    poids2emePesee: number | null; // From selected PontBascule.poidsCharge
    poidsNet: number | null; // From selected PontBascule.poidsNet
    numFiche: string; // From selected PontBascule.numPBId
    dmc: string;
    banqueId: number | null; // From EntryPayment
    numBordereau: string; // From EntryPayment.reference
    montant: number | null; // From EntryPayment.montantPaye
    agenceDouaneId: number | null;
    plaque: string; // From selected PontBascule
    isExited: boolean; // Track if the exit has been registered
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;

    // Additional properties for UI display
    clientName?: string; // Display name for client/importateur
    banqueName?: string; // Display name for banque
    pontBasculeList?: PontBascule[]; // List of PontBascule records (can be multiple) - shown in dialog

    constructor() {
        this.sortiePortGPSId = null;
        this.gps = '';
        this.clientId = null;
        this.dateEntree = new Date();
        this.dateSortie = new Date();
        this.typeOperation = '';
        this.numQuittance = '';
        this.poids1erePesee = null;
        this.poids2emePesee = null;
        this.poidsNet = null;
        this.numFiche = '';
        this.dmc = '';
        this.banqueId = null;
        this.numBordereau = '';
        this.montant = null;
        this.agenceDouaneId = null;
        this.plaque = '';
        this.isExited = false;
        this.userCreation = '';
        this.dateCreation = null;
        this.userUpdate = '';
        this.dateUpdate = null;
        this.clientName = '';
        this.banqueName = '';
        this.pontBasculeList = [];
    }
}
