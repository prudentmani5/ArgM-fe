export interface MouvementComptable {
    compte: string;
    reference: string;
    debit: number;
    credit: number;
}

export interface ComptabilisationData {
    mouvements: MouvementComptable[];
    totalDebit: number;
    totalCredit: number;
    periodLabel: string;
}
