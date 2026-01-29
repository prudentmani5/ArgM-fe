// Méthode de calcul des intérêts
export interface InterestCalculationMethod {
    id?: number;
    code: string;
    name: string;
    description?: string;
    formula?: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class InterestCalculationMethodClass implements InterestCalculationMethod {
    id?: number;
    code: string = '';
    name: string = '';
    description?: string = '';
    formula?: string = '';
    isDefault: boolean = false;
    isActive: boolean = true;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<InterestCalculationMethod>) {
        Object.assign(this, init);
    }
}
