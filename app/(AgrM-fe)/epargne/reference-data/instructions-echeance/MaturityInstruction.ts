// Instructions à l'échéance du DAT
export interface MaturityInstruction {
    id?: number;
    code: string;
    name: string;
    description?: string;
    renewsPrincipal: boolean;
    renewsInterest: boolean;
    transfersToSavings: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class MaturityInstructionClass implements MaturityInstruction {
    id?: number;
    code: string = '';
    name: string = '';
    description?: string = '';
    renewsPrincipal: boolean = false;
    renewsInterest: boolean = false;
    transfersToSavings: boolean = false;
    isActive: boolean = true;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<MaturityInstruction>) {
        Object.assign(this, init);
    }
}
