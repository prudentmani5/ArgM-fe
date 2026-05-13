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
    retard: number | null;  // Delay in minutes (null = not calculated, 0 = on time, >0 = late beyond tolerance)
    groupeId: string | null;  // The shift group ID used for delay calculation
    groupeNom: string | null;  // The name of the shift group
    groupeHeureDebut: string | null;  // Expected shift start time (e.g., "08:00")
    groupeHeureFin: string | null;  // Expected shift end time (e.g., "17:00")
    hasJustifiedExit: boolean | null;  // True if employee has a justified sortie on this date
    hasALeave: boolean | null;  // True if employee is on approved leave on this date
    hasJustifiedRetard: boolean | null;  // Manual flag for justified tardiness

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
        this.retard = null;
        this.groupeId = null;
        this.groupeNom = null;
        this.groupeHeureDebut = null;
        this.groupeHeureFin = null;
        this.hasJustifiedExit = null;
        this.hasALeave = null;
        this.hasJustifiedRetard = null;
    }
}
