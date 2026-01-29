export class Currency {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    symbol?: string;
    decimalPlaces: number;
    isDefault: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.decimalPlaces = 2;
        this.isDefault = false;
        this.isActive = true;
    }
}
