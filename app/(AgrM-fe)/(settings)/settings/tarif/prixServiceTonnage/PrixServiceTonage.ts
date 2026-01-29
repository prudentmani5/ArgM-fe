import { FacService } from "./FacService";

export class PrixServiceTonage {
    paramServiceId: number | null;
    serviceId: number;
    poids1: number;
    poids2: number;
    montantBarge: number;
    service?: FacService;

    constructor() {
        this.paramServiceId = null;
        this.serviceId = 0;
        this.poids1 = 0;
        this.poids2 = 0;
        this.montantBarge = 0;
    }
}