export interface IStkArticle {
    articleId: string;
    codeArticle: string;
    magasinId: string;
    libelle: string;
    sousCategorieId: string;
    conditionnement?: string;
    uniteId?: string;
    catalogue?: string;
    qteStock: number;
    description?: string;
    peremption: boolean;
    lot: boolean;
}

export class StkArticle implements IStkArticle {
    constructor(
        public articleId: string = '',
        public codeArticle: string = '',
        public magasinId: string = '',
        public libelle: string = '',
        public sousCategorieId: string = '',
        public conditionnement: string = '',
        public uniteId: string = '',
        public catalogue: string = '',
        public qteStock: number = 0,
        public description: string = '',
        public peremption: boolean = false,
        public lot: boolean = false
    ) {}
}

export const defaultStkArticle: IStkArticle = {
    articleId: '',
    codeArticle: '',
    magasinId: '',
    libelle: '',
    sousCategorieId: '',
    qteStock: 0,
    peremption: false,
    lot: false
};