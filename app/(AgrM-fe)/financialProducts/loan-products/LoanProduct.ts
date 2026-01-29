export class LoanProduct {
    id?: number;
    productCode: string;
    productName: string;
    productNameFr?: string;
    productTypeId: number;
    productType?: any;
    currencyId: number;
    currency?: any;
    targetClientele: string; // INDIVIDUAL, GROUP, MIXED
    minAmount: number;
    maxAmount: number;
    defaultAmount?: number;
    minTermMonths: number;
    maxTermMonths: number;
    defaultTermMonths?: number;
    interestCalculationMethodId: number;
    interestCalculationMethod?: any;
    minInterestRate: number;
    maxInterestRate: number;
    defaultInterestRate: number;
    paymentFrequencyId: number;
    paymentFrequency?: any;
    gracePeriodType?: string;
    maxGracePeriodDays?: number;
    allowsEarlyRepayment: boolean;
    earlyRepaymentPenaltyRate?: number;
    requiresGuarantors: boolean;
    minGuarantors?: number;
    requiresCollateral: boolean;
    description?: string;
    descriptionFr?: string;
    status: string; // DRAFT, ACTIVE, SUSPENDED, DISCONTINUED
    createdById?: number;
    approvedById?: number;
    approvedAt?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.productCode = '';
        this.productName = '';
        this.productTypeId = 0;
        this.currencyId = 0;
        this.targetClientele = 'INDIVIDUAL';
        this.minAmount = 0;
        this.maxAmount = 0;
        this.minTermMonths = 1;
        this.maxTermMonths = 12;
        this.interestCalculationMethodId = 0;
        this.minInterestRate = 0;
        this.maxInterestRate = 0;
        this.defaultInterestRate = 0;
        this.paymentFrequencyId = 0;
        this.allowsEarlyRepayment = false;
        this.requiresGuarantors = false;
        this.requiresCollateral = false;
        this.status = 'DRAFT';
    }
}
