// models/PieceRechange.ts
export class PieceRechange {
    pieceRechangeId: string;
    designationPieceRechange: string;
    numeroCatalogue: string;
    uniteId: string;
    prixUnitaire: number;

    constructor() {
        this.pieceRechangeId = '';
        this.designationPieceRechange = '';
        this.numeroCatalogue = '';
        this.uniteId = '';
        this.prixUnitaire = 0;
    }
}