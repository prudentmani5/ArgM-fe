export interface SavingsAccount {
    id?: number;
    accountNumber: string;
    clientId: number | null;
    branchId: number | null;
    currencyId: number | null;
    statusId: number | null;
    accountType: string;
    currentBalance: number;
    availableBalance: number;
    blockedAmount: number;
    minimumBalance: number;
    interestRate: number;
    accruedInterest: number;
    lastInterestCalculation: string | null;
    openingDate: string | null;
    closedDate: string | null;
    closureReason: string | null;
    isDormant: boolean;
    dormantDate: string | null;
    notes: string | null;
    userAction: string | null;
    client?: any;
    branch?: any;
    currency?: any;
    status?: any;
}

export class SavingsAccountClass implements SavingsAccount {
    id?: number;
    accountNumber: string = '';
    clientId: number | null = null;
    branchId: number | null = null;
    currencyId: number | null = null;
    statusId: number | null = null;
    accountType: string = 'REGULAR';
    currentBalance: number = 0;
    availableBalance: number = 0;
    blockedAmount: number = 0;
    minimumBalance: number = 0;
    interestRate: number = 0;
    accruedInterest: number = 0;
    lastInterestCalculation: string | null = null;
    openingDate: string | null = new Date().toISOString().split('T')[0];
    closedDate: string | null = null;
    closureReason: string | null = null;
    isDormant: boolean = false;
    dormantDate: string | null = null;
    notes: string | null = null;
    userAction: string | null = null;
}
