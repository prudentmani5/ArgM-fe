export interface BranchReceiptSeries {
    id?: number;
    branchId: number | null;
    branch?: { id: number; name: string; code: string };
    seriesLabel: string;
    beginSerial: string;
    endSerial: string;
    active: boolean;
    userAction?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class BranchReceiptSeriesClass implements BranchReceiptSeries {
    id?: number;
    branchId: number | null = null;
    branch?: { id: number; name: string; code: string };
    seriesLabel: string = '';
    beginSerial: string = '';
    endSerial: string = '';
    active: boolean = true;
    userAction?: string;

    constructor(init?: Partial<BranchReceiptSeries>) {
        Object.assign(this, init);
    }
}
