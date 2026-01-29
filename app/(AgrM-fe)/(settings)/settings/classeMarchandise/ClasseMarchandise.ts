// ClasseMarchandise.ts
export class ClasseMarchandise {
    classeMarchandiseId: number | null;
    libelle: string;
    compteImp: string;
    compteExp: string;

    constructor() {
        this.classeMarchandiseId = null;
        this.libelle = '';
        this.compteImp = '';
        this.compteExp = '';
    }
}