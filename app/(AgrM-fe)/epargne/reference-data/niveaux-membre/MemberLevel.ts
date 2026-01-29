// Niveau de membre
export interface MemberLevel {
    id?: number;
    code: string;
    name: string;
    description?: string;
    maxSavingsBalance: number;
    maxDailyWithdrawal: number;
    maxSingleTransaction: number;
    interestRateBonus: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class MemberLevelClass implements MemberLevel {
    id?: number;
    code: string = '';
    name: string = '';
    description?: string = '';
    maxSavingsBalance: number = 10000000;
    maxDailyWithdrawal: number = 500000;
    maxSingleTransaction: number = 1000000;
    interestRateBonus: number = 0;
    isActive: boolean = true;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<MemberLevel>) {
        Object.assign(this, init);
    }
}
