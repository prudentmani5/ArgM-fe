export class SaisiePaie {
    id: number | null;
    matriculeId: string;
    periodeId: string;
    base: number;
    preste: number;
    montantPreste: number;
    rappPositifImp: number;
    rappPositifNonImp: number;
    rappNegatifImp: number;
    rappNegatifNonImp: number;
    hs135: number;
    hs160: number;
    hs200: number;
    pourcJubile: number;
    logement: number;
    nbrEnfant: number;
    allocEnfant: number;
    allocConjoint: number;
    allocFam: number;
    indImp: number;
    indNonImp: number;
    primeImp: number;
    primeNonImp: number;
    deplacement: number;
    montant135: number;
    montant160: number;
    montant200: number;
    brut: number;
    baseMfp: number;
    mfpEmp: number;
    mfpPers: number;
    baseInssPension: number;
    inssPensionScEmp: number;
    inssPensionScPers: number;
    inssPensionSsEmp: number;
    inssPensionSsPers: number;
    baseInssRisque: number;
    inssPensionRisqueScEmp: number;
    inssPensionRisqueSsEmp: number;
    baseIpr: number;
    ipr: number;
    baseJubile: number;
    jubile: number;
    retImp: number;
    retNonImp: number;
    totalRetenue: number;
    net: number;
    indRisque: number;
    indRegideso: number | null;
    payeINSS: boolean;
    imposable: boolean;
    pensionComplPers: number;
    pensionComplPatr: number;
    totalCredit: number;
    soinsPers: number;
    iprPatr: number;
    saisirJrsPreste: boolean;
    logementFixe: boolean;
    periodCloture: boolean;

    // Employee info (from DTO, not saved to database)
    nom?: string;
    prenom?: string;
    employeeFirstName?: string;
    employeeLastName?: string;

    // Employee career info for display
    fonctionLibelle?: string;

    constructor() {
        this.id = null;
        this.matriculeId = '';
        this.periodeId = '';
        this.base = 0;
        this.preste = 0;
        this.montantPreste = 0;
        this.rappPositifImp = 0;
        this.rappPositifNonImp = 0;
        this.rappNegatifImp = 0;
        this.rappNegatifNonImp = 0;
        this.hs135 = 0;
        this.hs160 = 0;
        this.hs200 = 0;
        this.pourcJubile = 0;
        this.logement = 0;
        this.nbrEnfant = 0;
        this.allocEnfant = 0;
        this.allocConjoint = 0;
        this.allocFam = 0;
        this.indImp = 0;
        this.indNonImp = 0;
        this.primeImp = 0;
        this.primeNonImp = 0;
        this.deplacement = 0;
        this.montant135 = 0;
        this.montant160 = 0;
        this.montant200 = 0;
        this.brut = 0;
        this.baseMfp = 0;
        this.mfpEmp = 0;
        this.mfpPers = 0;
        this.baseInssPension = 0;
        this.inssPensionScEmp = 0;
        this.inssPensionScPers = 0;
        this.inssPensionSsEmp = 0;
        this.inssPensionSsPers = 0;
        this.baseInssRisque = 0;
        this.inssPensionRisqueScEmp = 0;
        this.inssPensionRisqueSsEmp = 0;
        this.baseIpr = 0;
        this.ipr = 0;
        this.baseJubile = 0;
        this.jubile = 0;
        this.retImp = 0;
        this.retNonImp = 0;
        this.totalRetenue = 0;
        this.net = 0;
        this.indRisque = 0;
        this.indRegideso = null;
        this.payeINSS = false;
        this.imposable = false;
        this.pensionComplPers = 0;
        this.pensionComplPatr = 0;
        this.totalCredit = 0;
        this.soinsPers = 0;
        this.iprPatr = 0;
        this.saisirJrsPreste = false;
        this.logementFixe = false;
        this.periodCloture = false;
        this.nom = '';
        this.prenom = '';
        this.employeeFirstName = '';
        this.employeeLastName = '';
        this.fonctionLibelle = '';
    }

    // Validate if the payroll has required fields
    isValid(): boolean {
        return this.matriculeId !== null && this.matriculeId.trim() !== '';
    }

    // Get full employee name
    getFullName(): string {
        if (this.nom && this.prenom) {
            return `${this.nom} ${this.prenom}`;
        }
        return '';
    }

    // Get period string (periodeId format: YYYY-MM or similar)
    getPeriod(): string {
        return this.periodeId || '';
    }

    // Calculate total rappel positif
    getTotalRappelPositif(): number {
        return this.rappPositifImp + this.rappPositifNonImp;
    }

    // Calculate total rappel negatif
    getTotalRappelNegatif(): number {
        return this.rappNegatifImp + this.rappNegatifNonImp;
    }

    // Calculate total heures supplementaires
    getTotalHS(): number {
        return this.montant135 + this.montant160 + this.montant200;
    }

    // Calculate total indemnites
    getTotalIndemnites(): number {
        return this.indImp + this.indNonImp + this.indRisque + (this.indRegideso || 0);
    }

    // Calculate total primes
    getTotalPrimes(): number {
        return this.primeImp + this.primeNonImp;
    }

    // Calculate total INSS personnel (personal contribution)
    getTotalInssPers(): number {
        return this.inssPensionScPers + this.inssPensionSsPers;
    }

    // Calculate total INSS employeur (employer contribution)
    getTotalInssEmp(): number {
        return this.inssPensionScEmp + this.inssPensionSsEmp + this.inssPensionRisqueScEmp + this.inssPensionRisqueSsEmp;
    }

    // Calculate total retenues (deductions)
    getTotalRetenuesCalculated(): number {
        return this.getTotalInssPers() + this.ipr + this.jubile + this.pensionComplPers + this.retImp + this.retNonImp + this.soinsPers;
    }

    // Format currency in BIF
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}
