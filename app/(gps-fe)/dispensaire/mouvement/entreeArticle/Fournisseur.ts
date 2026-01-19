export interface IFournisseur {
    fournisseurId: string;
    nom: string;
    adresse?: string;
    bp?: string;
    tel?: string;
    email?: string;
    local: boolean;
    compte?: string;
    donateur: boolean;
    magasinId?: string;
}

export class Fournisseur implements IFournisseur {
    constructor(
        public fournisseurId: string = '',
        public nom: string = '',
        public adresse: string = '',
        public bp: string = '',
        public tel: string = '',
        public email: string = '',
        public local: boolean = false,
        public compte: string = '',
        public donateur: boolean = false,
        public magasinId: string = ''
    ) {}
}

export const defaultFournisseur: IFournisseur = {
    fournisseurId: '',
    nom: '',
    local: false,
    donateur: false
};