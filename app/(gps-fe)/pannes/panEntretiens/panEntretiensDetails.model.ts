export class PanEntretiensDetails {
    entretienDetailsId?: number;
    entretiensId: string;
    produitPieceId: string;
    quantite: number;
    prixUnitaire: number;
    total: number;

    constructor() {
        this.entretiensId = '';
        this.produitPieceId = '';
        this.quantite = 0;
        this.prixUnitaire = 0;
        this.total = 0;
    }
}