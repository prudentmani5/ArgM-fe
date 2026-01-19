export class PrixConteneur {
    paramConteneurId: number | null;
    nbreJr1: number;
    nbreJr2: number;
    prix20Pieds: number;
    prix40Pieds: number;

    constructor() {
        this.paramConteneurId = null;
        this.nbreJr1 = 0;
        this.nbreJr2 = 0;
        this.prix20Pieds = 0;
        this.prix40Pieds = 0;
    }
}