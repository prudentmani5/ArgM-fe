export class CapitalizationFrequency {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    periodsPerYear: number;
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.periodsPerYear = 12;
        this.isActive = true;
    }
}
