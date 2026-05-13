/**
 * PaieCptEcriture - Payroll Accounting Entry
 *
 * This model represents a payroll-generated accounting entry that will be transferred
 * to the accounting module (CptEcriture). It mirrors the backend CptEcriture entity
 * but is specifically used for payroll comptabilisation.
 *
 * Location: app/(gps-fe)/grh/paie/comptabilisation/PaieCptEcriture.ts
 */
export class PaieCptEcriture {
    ecritureId: number | null;
    pieceId: string;
    exerciceId: string;
    compteId: string;
    numeroPiece: string;
    journalId: string;
    brouillardId: string;
    reference: string;
    dateEcriture: string; // Format: yyyy-MM-dd
    debit: number;
    credit: number;
    activiteId: string;
    financementId: string;
    regionId: string;
    facture: string;
    libelle: string;
    deviseId: string;
    taux: number;
    debitDevise: number;
    creditDevise: number;
    ecritureIdTVA: number | null;
    valide: boolean;
    rapproche: boolean;
    userCreation: string;
    dateCreation: string;
    dateUpdate: string;
    userUpdate: string;

    // Transient fields (for display purposes, not saved to database)
    printDate?: string;
    soldeJournal?: number;
    soldeCompte?: number;
    codeJournal?: string;
    codeCompte?: string;

    constructor() {
        this.ecritureId = null;
        this.pieceId = '';
        this.exerciceId = '';
        this.compteId = '';
        this.numeroPiece = '';
        this.journalId = '';
        this.brouillardId = '';
        this.reference = '';
        this.dateEcriture = '';
        this.debit = 0;
        this.credit = 0;
        this.activiteId = '';
        this.financementId = '';
        this.regionId = '';
        this.facture = '';
        this.libelle = '';
        this.deviseId = '';
        this.taux = 0;
        this.debitDevise = 0;
        this.creditDevise = 0;
        this.ecritureIdTVA = null;
        this.valide = false;
        this.rapproche = false;
        this.userCreation = '';
        this.dateCreation = '';
        this.dateUpdate = '';
        this.userUpdate = '';
        this.printDate = '';
        this.soldeJournal = 0;
        this.soldeCompte = 0;
        this.codeJournal = '';
        this.codeCompte = '';
    }

    /**
     * Generate PieceId in the format: {numeroPiece}{journalId}{brouillardId}
     * Example: "1ODGPSsal92025GPS"
     * - numeroPiece: "1" (first piece)
     * - journalId: "ODGPS"
     * - brouillardId: "sal92025GPS"
     */
    static generatePieceId(numeroPiece: string, journalId: string, brouillardId: string): string {
        return `${numeroPiece}${journalId}${brouillardId}`;
    }

    /**
     * Generate BrouillardId for payroll in the format: sal{month}{year}GPS
     * Example: "sal92025GPS" for September 2025
     */
    static generateBrouillardId(month: number, year: number): string {
        return `sal${month}${year}GPS`;
    }

    /**
     * Get the code compte without GPS suffix
     */
    getCodeCompte(): string {
        return this.compteId.replace('GPS', '');
    }

    /**
     * Get the code journal without GPS suffix
     */
    getCodeJournal(): string {
        return this.journalId.replace('GPS', '');
    }

    /**
     * Format date for display (dd/MM/yyyy)
     */
    getPrintDate(): string {
        if (!this.dateEcriture) return '';
        const date = new Date(this.dateEcriture);
        return date.toLocaleDateString('fr-FR');
    }

    /**
     * Check if this is a debit entry
     */
    isDebit(): boolean {
        return this.debit > 0 && this.credit === 0;
    }

    /**
     * Check if this is a credit entry
     */
    isCredit(): boolean {
        return this.credit > 0 && this.debit === 0;
    }

    /**
     * Get the amount (either debit or credit)
     */
    getAmount(): number {
        return this.isDebit() ? this.debit : this.credit;
    }

    /**
     * Get the type of entry (DEBIT or CREDIT)
     */
    getEntryType(): 'DEBIT' | 'CREDIT' {
        return this.isDebit() ? 'DEBIT' : 'CREDIT';
    }

    /**
     * Format amount in BIF currency
     */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Validate that this entry is balanced (has either debit or credit, not both)
     */
    isValid(): boolean {
        // Must have either debit or credit (not both, not neither)
        const hasDebit = this.debit > 0;
        const hasCredit = this.credit > 0;

        if (hasDebit && hasCredit) return false; // Cannot have both
        if (!hasDebit && !hasCredit) return false; // Must have one

        // Must have required fields
        if (!this.compteId || !this.reference || !this.dateEcriture) return false;

        return true;
    }

    /**
     * Convert to CptEcriture format for backend submission
     */
    toCptEcriture(): any {
        return {
            ecritureId: this.ecritureId,
            pieceId: this.pieceId,
            exerciceId: this.exerciceId,
            compteId: this.compteId,
            numeroPiece: this.numeroPiece,
            journalId: this.journalId,
            brouillardId: this.brouillardId,
            reference: this.reference,
            dateEcriture: this.dateEcriture,
            debit: this.debit,
            credit: this.credit,
            activiteId: this.activiteId,
            financementId: this.financementId,
            regionId: this.regionId,
            facture: this.facture,
            libelle: this.libelle,
            deviseId: this.deviseId,
            taux: this.taux,
            debitDevise: this.debitDevise,
            creditDevise: this.creditDevise,
            ecritureIdTVA: this.ecritureIdTVA,
            valide: this.valide,
            rapproche: this.rapproche,
            userCreation: this.userCreation,
            dateCreation: this.dateCreation,
            dateUpdate: this.dateUpdate,
            userUpdate: this.userUpdate
        };
    }
}
