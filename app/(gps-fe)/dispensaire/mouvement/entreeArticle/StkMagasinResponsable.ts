export interface IStkMagasinResponsable {
    magRespId: string;
    magasinId: string;
    responsableId: string;
    actif: boolean;
}

export class StkMagasinResponsable implements IStkMagasinResponsable {
    constructor(
        public magRespId: string = '',
        public magasinId: string = '',
        public responsableId: string = '',
        public actif: boolean = false
    ) {}
}

export const defaultStkMagasinResponsable: IStkMagasinResponsable = {
    magRespId: '',
    magasinId: '',
    responsableId: '',
    actif: false
};