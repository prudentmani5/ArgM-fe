export class Situation {
    situationId: string = '';
    libelle: string = '';
    recuperable: boolean = false;

    constructor(init?: Partial<Situation>) {
        Object.assign(this, init);
    }
}
