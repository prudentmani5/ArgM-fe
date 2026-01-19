export class GrhPointage {
    pointageId: number | null;
    matriculeId: string;
    nomEmploye: string;
    datePointage: Date | null;
    heureEntree: Date | null;
    heureSortie: Date | null;
    heureEntree2: Date | null;
    heureSortie2: Date | null;
    typePointage: string;
    statutPointage: string;
    exception: string;
    heuresTravaillees: number;
    heuresSupplementaires: number;
    heuresNormales: number;
    valide: boolean;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;
    remarque: string;
    heureSupp: boolean;
    heureSuppReason: string;
    heureSupp135: number;
    heureSupp160: number;
    heureSupp200: number;

    constructor() {
        this.pointageId = null;
        this.matriculeId = "";
        this.nomEmploye = "";
        this.datePointage = null;
        this.heureEntree = null;
        this.heureSortie = null;
        this.heureEntree2 = null;
        this.heureSortie2 = null;
        this.typePointage = "";
        this.statutPointage = "";
        this.exception = "";
        this.heuresTravaillees = 0;
        this.heuresSupplementaires = 0;
        this.heuresNormales = 0;
        this.valide = false;
        this.userCreation = "";
        this.dateCreation = null;
        this.userUpdate = "";
        this.dateUpdate = null;
        this.remarque = "";
        this.heureSupp = false;
        this.heureSuppReason = "";
        this.heureSupp135 = 0;
        this.heureSupp160 = 0;
        this.heureSupp200 = 0;
    }
}
