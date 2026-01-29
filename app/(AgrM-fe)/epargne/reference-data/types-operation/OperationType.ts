// Type d'opération d'épargne
export interface OperationType {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    description?: string;
    operationClass: OperationClass;
    requiresPassbookUpdate: boolean;
    requiresReceipt: boolean;
    requiresAuthorization: boolean;
    isSystemGenerated: boolean;
    glDebitAccount?: string;
    glCreditAccount?: string;
    isActive: boolean;
    sortOrder: number;
    createdAt?: string;
}

export enum OperationClass {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT'
}

export class OperationTypeClass implements OperationType {
    id?: number;
    code: string = '';
    name: string = '';
    nameFr: string = '';
    description?: string = '';
    operationClass: OperationClass = OperationClass.CREDIT;
    requiresPassbookUpdate: boolean = true;
    requiresReceipt: boolean = true;
    requiresAuthorization: boolean = false;
    isSystemGenerated: boolean = false;
    glDebitAccount?: string = '';
    glCreditAccount?: string = '';
    isActive: boolean = true;
    sortOrder: number = 0;
    createdAt?: string;

    constructor(init?: Partial<OperationType>) {
        Object.assign(this, init);
    }
}
