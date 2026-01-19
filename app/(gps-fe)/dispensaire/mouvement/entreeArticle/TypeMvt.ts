export interface ITypeMvt {
    typeMvtId: string;
    libelle: string;
    sens: string;
}

export class TypeMvt implements ITypeMvt {
    constructor(
        public typeMvtId: string = '',
        public libelle: string = '',
        public sens: string = ''
    ) {}
}

export const defaultTypeMvt: ITypeMvt = {
    typeMvtId: '',
    libelle: '',
    sens: ''
};