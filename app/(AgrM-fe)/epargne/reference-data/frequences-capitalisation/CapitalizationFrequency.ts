// Fréquence de capitalisation des intérêts
export interface CapitalizationFrequency {
    id?: number;
    code: string;
    name: string;
    periodsPerYear: number;
    description?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class CapitalizationFrequencyClass implements CapitalizationFrequency {
    id?: number;
    code: string = '';
    name: string = '';
    periodsPerYear: number = 12;
    description?: string = '';
    isActive: boolean = true;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<CapitalizationFrequency>) {
        Object.assign(this, init);
    }
}
