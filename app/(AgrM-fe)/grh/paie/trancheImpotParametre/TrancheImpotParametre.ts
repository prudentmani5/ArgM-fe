import { TrancheImpotParametreDetail } from "./TrancheImpotParametreDetail";

export class TrancheImpotParametre {
    trancheId: number;
    dateEnVigueur: string;
    details: TrancheImpotParametreDetail[];

    constructor() {
        this.trancheId = 0;
        this.dateEnVigueur = '';
        this.details = [];
    }
}