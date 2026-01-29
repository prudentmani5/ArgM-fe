// MagSortieMagasinAutre.ts
export class MagSortieMagasinAutre {
    sortieMagasinId: number | null;
    sortieId: string | null;
    lettreTransport: string;
    gps: string | null;
    noEntree: number;
    dateEntree: Date;
    entreposId: number;
    marchandiseId: number;
    importateurId: number;
    agenceDouaneId: number | null;
    declarant: string | null;
    dmc: string | null;
    noConteneur: string | null;
    nbreColis: number;
    dateSortie: Date;
    montant: number;
    sortie: boolean;
    bargeIdEntree: number;
    typeTransportEntre: string | null;
    typeTransportSortie: string | null;
    poidsSortie: number;
    poidsEntre: number;
    noFacture: string;
    plaqueSortie: string | null;
    plaqueEntree: string | null;
    solde: number;
    userCreation: string;
    dateCreation: Date;
    userUpdate: string | null;
    dateUpdate: Date | null;

    constructor() {
        this.sortieMagasinId = null;
        this.sortieId = null;
        this.lettreTransport = '';
        this.gps = 'GPS';
        this.noEntree = 0;
        this.dateEntree = new Date();
        this.entreposId = 0;
        this.marchandiseId = 0;
        this.importateurId = 0;
        this.agenceDouaneId = null;
        this.declarant = null;
        this.dmc = null;
        this.noConteneur = null;
        this.nbreColis = 0;
        this.dateSortie = new Date();
        this.montant = 0;
        this.sortie = true;
        this.bargeIdEntree = 0;
        this.typeTransportEntre = null;
        this.typeTransportSortie = null;
        this.poidsSortie = 0;
        this.poidsEntre = 0;
        this.noFacture = '';
        this.plaqueSortie = null;
        this.plaqueEntree = null;
        this.solde = 0;
        this.userCreation = '';
        this.dateCreation = new Date();
        this.userUpdate = null;
        this.dateUpdate = null;
    }
}
