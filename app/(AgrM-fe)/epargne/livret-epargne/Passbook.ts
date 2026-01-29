// Livret d'épargne
export interface Passbook {
    id?: number;
    passbookNumber: string;
    savingsAccountId: number;
    client?: any;
    clientId?: number;
    issueDate: string;
    expiryDate?: string;
    pagesTotal: number;
    pagesUsed: number;
    lastEntryPage: number;
    lastEntryLine: number;
    status?: any;
    statusId?: number;
    isReplacement: boolean;
    replacedPassbook?: Passbook;
    replacedPassbookId?: number;
    replacementReason?: string;
    replacementFeePaid: number;
    reportedLostDate?: string;
    reportedLostBy?: any;
    reportedLostById?: number;
    policeReportNumber?: string;
    closedDate?: string;
    closedReason?: string;
    closedBy?: any;
    closedById?: number;
    issuedBy?: any;
    issuedById?: number;
    branch?: any;
    branchId?: number;
    entries?: PassbookEntry[];
    createdAt?: string;
    updatedAt?: string;
    userAction?: string;
}

export class PassbookClass implements Passbook {
    id?: number;
    passbookNumber: string = '';
    savingsAccountId: number = 0;
    client?: any;
    clientId?: number;
    issueDate: string = new Date().toISOString().split('T')[0];
    expiryDate?: string;
    pagesTotal: number = 48;
    pagesUsed: number = 0;
    lastEntryPage: number = 1;
    lastEntryLine: number = 0;
    status?: any;
    statusId?: number;
    isReplacement: boolean = false;
    replacedPassbook?: Passbook;
    replacedPassbookId?: number;
    replacementReason?: string;
    replacementFeePaid: number = 0;
    reportedLostDate?: string;
    reportedLostBy?: any;
    reportedLostById?: number;
    policeReportNumber?: string;
    closedDate?: string;
    closedReason?: string;
    closedBy?: any;
    closedById?: number;
    issuedBy?: any;
    issuedById?: number;
    branch?: any;
    branchId?: number;
    entries?: PassbookEntry[];
    createdAt?: string;
    updatedAt?: string;
    userAction?: string;

    constructor(init?: Partial<Passbook>) {
        Object.assign(this, init);
    }
}

// Entrée du livret d'épargne
export interface PassbookEntry {
    id?: number;
    passbook?: Passbook;
    passbookId?: number;
    pageNumber: number;
    lineNumber: number;
    transactionId?: number;
    entryDate: string;
    entryTime: string;
    operationType?: any;
    operationTypeId?: number;
    description?: string;
    debitAmount?: number;
    creditAmount?: number;
    balanceAfter: number;
    recordedBy?: any;
    recordedById?: number;
    recordedAt?: string;
    clientSignature: boolean;
}

export class PassbookEntryClass implements PassbookEntry {
    id?: number;
    passbook?: Passbook;
    passbookId?: number;
    pageNumber: number = 1;
    lineNumber: number = 1;
    transactionId?: number;
    entryDate: string = new Date().toISOString().split('T')[0];
    entryTime: string = new Date().toTimeString().split(' ')[0];
    operationType?: any;
    operationTypeId?: number;
    description?: string = '';
    debitAmount?: number = 0;
    creditAmount?: number = 0;
    balanceAfter: number = 0;
    recordedBy?: any;
    recordedById?: number;
    recordedAt?: string;
    clientSignature: boolean = false;

    constructor(init?: Partial<PassbookEntry>) {
        Object.assign(this, init);
    }
}
