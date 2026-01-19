export class DomaineFormation {
    domaineId: string = '';
    libelle: string = '';

    constructor(init?: Partial<DomaineFormation>) {
        Object.assign(this, init);
    }
}
