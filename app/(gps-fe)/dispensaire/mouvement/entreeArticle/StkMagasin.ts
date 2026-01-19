export interface IStkMagasin {
    magasinId: string;
    nom: string;
    adresse: string;
    pointVente: boolean;
    type: number;
}

export class StkMagasin implements IStkMagasin {
    constructor(
        public magasinId: string = '',
        public nom: string = '',
        public adresse: string = '',
        public pointVente: boolean = false,
        public type: number = 0
    ) {}
}

export const defaultStkMagasin: IStkMagasin = {
    magasinId: '',
    nom: '',
    adresse: '',
    pointVente: false,
    type: 0
};