export class Banque {
    codeBanque: string = '';
    sigle: string = '';
    libelleBanque: string = '';
    compte: string = '';

    constructor(init?: Partial<Banque>) {
        Object.assign(this, init);
    }
}
