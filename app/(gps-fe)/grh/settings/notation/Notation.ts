export enum NotationEnum {
    ELITE = 'ELITE',
    TB = 'TB',
    B = 'B',
    AB = 'AB',
    INS = 'INS',
    MED = 'MED'
}

export enum StatutEnum {
    SC = 'SC',
    SS = 'SS'
}

export class Notation {
    notationId: string;
    statut: StatutEnum | '';
    notations: NotationEnum | '';
    nbreEchelonGagne: number;
    anale: number;
    limite1: number;
    limite2: number;

    constructor() {
        this.notationId = '';
        this.statut = '';
        this.notations = '';
        this.nbreEchelonGagne = 0;
        this.anale = 0;
        this.limite1 = 0;
        this.limite2 = 0;
    }
}