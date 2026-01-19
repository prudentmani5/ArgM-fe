// MagSortiePort.ts
export class MagSortiePort {
    sortiePortId: number | null;
    lettreTransport: string;
    rsp: string | null;
    noEntree: number;
    dateEntree: Date;
    entreposId: number;
    marchandiseId: number;
    importateurId: number;
    categorieVehiculeId: string;
    nbreColis: number;
    dateSortie: Date;
    montant: number;
    poidsEntre: number;
    poidsSortie: number;
    tare: number;
    noFacture: string | null;
    plaqueEntree: string | null;
    plaqueSortie: string | null;
    agenceDouaneId: number | null;
    dmc: string | null;
    quittance: string | null;
    noBordereau: string | null;
    banqueId: number | null;
    dateSaisieEntree: Date | null;
    numPBId: number;
    userCreation: string;
    dateCreation: Date;
    userUpdate: string | null;
    dateUpdate: Date | null;

    constructor() {
        this.sortiePortId = null;
        this.lettreTransport = '';
        this.rsp = null;
        this.noEntree = 0;
        this.dateEntree = new Date();
        this.entreposId = 0;
        this.marchandiseId = 0;
        this.importateurId = 0;
        this.categorieVehiculeId = '';
        this.nbreColis = 0;
        this.dateSortie = new Date();
        this.montant = 0;
        this.poidsEntre = 0;
        this.poidsSortie = 0;
        this.tare = 0;
        this.noFacture = null;
        this.plaqueEntree = null;
        this.plaqueSortie = null;
        this.agenceDouaneId = null;
        this.dmc = null;
        this.quittance = null;
        this.noBordereau = null;
        this.banqueId = null;
        this.dateSaisieEntree = null;
        this.numPBId = 0;
        this.userCreation = '';
        this.dateCreation = new Date();
        this.userUpdate = null;
        this.dateUpdate = null;
    }
}