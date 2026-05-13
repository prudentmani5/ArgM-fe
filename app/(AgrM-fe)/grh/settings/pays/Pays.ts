export class Pays {
    paysId: string = '';
    nomPays: string = '';
    principal: boolean = false;

    constructor(init?: Partial<Pays>) {
        Object.assign(this, init);
    }
}
