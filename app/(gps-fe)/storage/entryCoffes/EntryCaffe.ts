// EntryCaffe.ts
export class EntryCaffe {
    entreeCafeId: number | null;
    numeroOrdre: string;
    dateEntree: Date | null;
    plaqueEntre: string;
    entreposId: number | null;
    noLot: string;
    qualite: string;
    provenanceId: number | null;
    poidsBrut: number | null;
    poidsNet: number | null;
    nbreSac: number | null;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;

    constructor() {
        this.entreeCafeId = null;
        this.numeroOrdre = '';
        this.dateEntree = null;
        this.plaqueEntre = '';
        this.entreposId = null;
        this.noLot = '';
        this.qualite = '';
        this.provenanceId = null;
        this.poidsBrut = null;
        this.poidsNet = null;
        this.nbreSac = null;
        this.userCreation = '';
        this.dateCreation = null;
        this.userUpdate = '';
        this.dateUpdate = null;
    }
}