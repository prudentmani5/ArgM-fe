import { TrancheImpotAnnuelParametreDetail } from "./TrancheImpotAnnuelParametreDetail";

export class TrancheImpotAnnuelParametre {
    trancheId: number;
    dateEnVigueur: string;
    details: TrancheImpotAnnuelParametreDetail[];

    constructor() {
        this.trancheId = 0;
        this.dateEnVigueur = '';
        this.details = [];
    }
}