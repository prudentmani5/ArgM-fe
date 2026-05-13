/**
 * ComptabilisationService - Payroll to Accounting Transfer Service
 *
 * This service generates accounting entries (PaieCptEcriture) from payroll data
 * according to the mapping rules defined in COMPTABILISATION_PAIE.md
 *
 * Location: app/(gps-fe)/grh/paie/comptabilisation/ComptabilisationService.ts
 */

import { PaieCptEcriture } from './PaieCptEcriture';
import { SaisiePaie } from '../editions/SaisiePaie';
import { SaisieRetenue } from '../saisie/retenue/SaisieRetenue';
import { SaisieIndemnite } from '../saisie/indemnite/SaisieIndemnite';
import { SaisiePrime } from '../saisie/prime/SaisiePrime';
import { RetenueParametre } from '../retenueParametre/RetenueParametre';
import { IndemniteParametre } from '../indemniteParametre/IndemniteParametre';
import { PrimeParametre } from '../primeParametre/PrimeParametre';

/**
 * Account aggregation object to sum amounts by account code
 */
interface AccountAggregation {
    [accountKey: string]: number;
}

/**
 * Account labels object to store dynamic labels from parameter tables
 */
interface AccountLabels {
    [accountKey: string]: string;
}

/**
 * Comptabilisation parameters
 */
export interface ComptabilisationParams {
    month: number;
    year: number;
    journalId: string; // e.g., "ODGPS"
    numeroPiece: string; // e.g., "1"
    exerciceId: string;
    dateEcriture: string; // Format: yyyy-MM-dd
    userCreation: string;
}

/**
 * Comptabilisation result
 */
export interface ComptabilisationResult {
    ecritures: PaieCptEcriture[];
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
    pieceId: string;
    brouillardId: string;
}

export class ComptabilisationService {
    /**
     * Generate accounting entries (PaieCptEcriture) from payroll data
     *
     * @param payrollRecords - List of SaisiePaie records for the period
     * @param retenueRecords - List of SaisieRetenue records for the period
     * @param indemniteRecords - List of SaisieIndemnite records for the period
     * @param primeRecords - List of SaisiePrime records for the period
     * @param retenueParametres - List of RetenueParametre configurations
     * @param indemniteParametres - List of IndemniteParametre configurations
     * @param primeParametres - List of PrimeParametre configurations
     * @param params - Comptabilisation parameters
     * @returns ComptabilisationResult
     */
    static generateComptabilisation(
        payrollRecords: SaisiePaie[],
        retenueRecords: SaisieRetenue[],
        indemniteRecords: SaisieIndemnite[],
        primeRecords: SaisiePrime[],
        retenueParametres: RetenueParametre[],
        indemniteParametres: IndemniteParametre[],
        primeParametres: PrimeParametre[],
        params: ComptabilisationParams
    ): ComptabilisationResult {
        // Initialize aggregation objects
        const accountAggregation: AccountAggregation = {};
        const accountLabels: AccountLabels = {};

        // Generate BrouillardId and PieceId
        const brouillardId = PaieCptEcriture.generateBrouillardId(params.month, params.year);
        const pieceId = PaieCptEcriture.generatePieceId(params.numeroPiece, params.journalId, brouillardId);

        // 1. Process SaisiePaie records (direct mappings)
        this.processSaisiePaie(payrollRecords, accountAggregation, accountLabels);

        // 2. Process dynamic deductions (SaisieRetenue)
        this.processSaisieRetenue(retenueRecords, retenueParametres, accountAggregation, accountLabels);

        // 3. Process dynamic indemnities (SaisieIndemnite)
        this.processSaisieIndemnite(indemniteRecords, indemniteParametres, accountAggregation, accountLabels);

        // 4. Process dynamic primes (SaisiePrime)
        this.processSaisiePrime(primeRecords, primeParametres, accountAggregation, accountLabels);

        // 5. Create PaieCptEcriture records from aggregated amounts
        const ecritures = this.createEcritureRecords(
            accountAggregation,
            accountLabels,
            params,
            pieceId,
            brouillardId
        );

        // 6. Calculate totals and validate balance
        const totalDebit = ecritures.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = ecritures.reduce((sum, e) => sum + e.credit, 0);
        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01; // Allow for floating point errors

        return {
            ecritures,
            totalDebit,
            totalCredit,
            isBalanced,
            pieceId,
            brouillardId
        };
    }

    /**
     * Process SaisiePaie records and aggregate amounts by account
     */
    private static processSaisiePaie(
        payrollRecords: SaisiePaie[],
        accountAggregation: AccountAggregation,
        accountLabels: AccountLabels
    ): void {
        payrollRecords.forEach(paie => {
            // DEBIT - Salary components
            this.addToAccount('65111000', paie.montantPreste, accountAggregation);
            accountLabels['65111000'] = 'Salaire de Base';

            this.addToAccount('65210000', paie.logement, accountAggregation);
            accountLabels['65210000'] = 'Logement';

            this.addToAccount('65310000', paie.allocEnfant + paie.allocConjoint, accountAggregation);
            accountLabels['65310000'] = 'Indemnité familiale';

            this.addToAccount('65611000', paie.deplacement, accountAggregation);
            accountLabels['65611000'] = 'Indemnité de déplacement';

            this.addToAccount('65121000', paie.montant135 + paie.montant160 + paie.montant200, accountAggregation);
            accountLabels['65121000'] = 'Heure supplementaire';

            this.addToAccount('65116000_Debit', paie.rappPositifImp + paie.rappPositifNonImp, accountAggregation);
            accountLabels['65116000_Debit'] = 'Rappel salaire';

            // DEBIT - Employer social charges
            this.addToAccount(
                '65411000',
                paie.inssPensionScEmp + paie.inssPensionSsEmp +
                paie.inssPensionRisqueScEmp + paie.inssPensionRisqueSsEmp,
                accountAggregation
            );
            accountLabels['65411000'] = 'Charges Sociale Inss Patronal';

            this.addToAccount('65412000', paie.pensionComplPatr, accountAggregation);
            accountLabels['65412000'] = 'Charge sociale FPC Patr';

            this.addToAccount('43250000_Debit', paie.iprPatr, accountAggregation);
            accountLabels['43250000_Debit'] = 'IPR Patronal';

            // CREDIT - Net to pay
            this.addToAccount('42130000', paie.net, accountAggregation);
            accountLabels['42130000'] = 'Net à payer';

            // CREDIT - Employee deductions
            this.addToAccount(
                '45100000',
                paie.inssPensionScEmp + paie.inssPensionScPers +
                paie.inssPensionSsEmp + paie.inssPensionSsPers +
                paie.inssPensionRisqueScEmp + paie.inssPensionRisqueSsEmp,
                accountAggregation
            );
            accountLabels['45100000'] = 'Inss à payer';

            this.addToAccount('65116000_Credit', paie.rappNegatifImp + paie.rappNegatifNonImp, accountAggregation);
            accountLabels['65116000_Credit'] = 'Rappel négatif';

            this.addToAccount('42233000', paie.pensionComplPers + paie.pensionComplPatr, accountAggregation);
            accountLabels['42233000'] = 'Pension compl/FPHU';

            this.addToAccount('43250000_Credit', paie.ipr, accountAggregation);
            accountLabels['43250000_Credit'] = 'IPR';

            this.addToAccount('42232000', paie.jubile, accountAggregation);
            accountLabels['42232000'] = 'Assurance Jubile';
        });
    }

    /**
     * Process SaisieRetenue records (dynamic deductions - CREDIT)
     */
    private static processSaisieRetenue(
        retenueRecords: SaisieRetenue[],
        retenueParametres: RetenueParametre[],
        accountAggregation: AccountAggregation,
        accountLabels: AccountLabels
    ): void {
        // Group by codeRet and sum amounts
        const retenueByCode: { [key: string]: number } = {};
        retenueRecords.forEach(retenue => {
            if (!retenueByCode[retenue.codeRet]) {
                retenueByCode[retenue.codeRet] = 0;
            }
            retenueByCode[retenue.codeRet] += retenue.montant;
        });

        // Create CREDIT entries for each deduction type
        Object.keys(retenueByCode).forEach(codeRet => {
            const retenueParam = retenueParametres.find(r => r.codeRet === codeRet);
            if (retenueParam && retenueParam.compteCompta) {
                this.addToAccount(retenueParam.compteCompta, retenueByCode[codeRet], accountAggregation);
                accountLabels[retenueParam.compteCompta] = retenueParam.libelleRet;
            }
        });
    }

    /**
     * Process SaisieIndemnite records (dynamic indemnities - DEBIT)
     */
    private static processSaisieIndemnite(
        indemniteRecords: SaisieIndemnite[],
        indemniteParametres: IndemniteParametre[],
        accountAggregation: AccountAggregation,
        accountLabels: AccountLabels
    ): void {
        // Group by codeInd and sum amounts
        const indemniteByCode: { [key: string]: number } = {};
        indemniteRecords.forEach(indemnite => {
            if (!indemniteByCode[indemnite.codeInd]) {
                indemniteByCode[indemnite.codeInd] = 0;
            }
            indemniteByCode[indemnite.codeInd] += indemnite.montant;
        });

        // Create DEBIT entries for each indemnity type
        Object.keys(indemniteByCode).forEach(codeInd => {
            const indemniteParam = indemniteParametres.find(i => i.codeInd === codeInd);
            if (indemniteParam && indemniteParam.compteCompta) {
                const accountKey = indemniteParam.compteCompta + '_Debit';
                this.addToAccount(accountKey, indemniteByCode[codeInd], accountAggregation);
                accountLabels[accountKey] = indemniteParam.libelleInd;
            }
        });
    }

    /**
     * Process SaisiePrime records (dynamic primes - DEBIT)
     */
    private static processSaisiePrime(
        primeRecords: SaisiePrime[],
        primeParametres: PrimeParametre[],
        accountAggregation: AccountAggregation,
        accountLabels: AccountLabels
    ): void {
        // Group by codePrime and sum amounts
        const primeByCode: { [key: string]: number } = {};
        primeRecords.forEach(prime => {
            if (!primeByCode[prime.codePrime]) {
                primeByCode[prime.codePrime] = 0;
            }
            primeByCode[prime.codePrime] += prime.montant;
        });

        // Create DEBIT entries for each prime type
        Object.keys(primeByCode).forEach(codePrime => {
            const primeParam = primeParametres.find(p => p.codePrime === codePrime);
            if (primeParam && primeParam.compteCompta) {
                const accountKey = primeParam.compteCompta + '_Debit';
                this.addToAccount(accountKey, primeByCode[codePrime], accountAggregation);
                accountLabels[accountKey] = primeParam.libellePrime;
            }
        });
    }

    /**
     * Add amount to account aggregation (helper method)
     */
    private static addToAccount(accountKey: string, amount: number, accountAggregation: AccountAggregation): void {
        if (!accountAggregation[accountKey]) {
            accountAggregation[accountKey] = 0;
        }
        accountAggregation[accountKey] += amount;
    }

    /**
     * Create PaieCptEcriture records from aggregated amounts
     */
    private static createEcritureRecords(
        accountAggregation: AccountAggregation,
        accountLabels: AccountLabels,
        params: ComptabilisationParams,
        pieceId: string,
        brouillardId: string
    ): PaieCptEcriture[] {
        const ecritures: PaieCptEcriture[] = [];

        Object.keys(accountAggregation).forEach(accountKey => {
            const amount = accountAggregation[accountKey];
            if (amount !== 0) {
                const ecriture = new PaieCptEcriture();

                // Remove _Debit or _Credit suffix to get the actual account code
                const actualAccountCode = accountKey.replace('_Debit', '').replace('_Credit', '');

                ecriture.pieceId = pieceId;
                ecriture.exerciceId = params.exerciceId;
                ecriture.compteId = actualAccountCode + 'GPS'; // Add GPS suffix for backend
                ecriture.numeroPiece = params.numeroPiece;
                ecriture.journalId = params.journalId;
                ecriture.brouillardId = brouillardId;
                ecriture.reference = accountLabels[accountKey] || actualAccountCode;
                ecriture.dateEcriture = params.dateEcriture;
                ecriture.userCreation = params.userCreation;
                ecriture.valide = false;
                ecriture.rapproche = false;

                // Determine if debit or credit based on account key suffix
                if (accountKey.endsWith('_Credit')) {
                    ecriture.credit = amount;
                    ecriture.debit = 0;
                } else if (accountKey.endsWith('_Debit')) {
                    ecriture.debit = amount;
                    ecriture.credit = 0;
                } else {
                    // For accounts without suffix, determine by account code
                    // Typically, liability accounts (42xxx, 43xxx, 45xxx) are credits
                    // Expense accounts (65xxx) are debits
                    const isLiabilityAccount = actualAccountCode.startsWith('42') ||
                                               actualAccountCode.startsWith('43') ||
                                               actualAccountCode.startsWith('45');

                    if (isLiabilityAccount) {
                        ecriture.credit = amount;
                        ecriture.debit = 0;
                    } else {
                        ecriture.debit = amount;
                        ecriture.credit = 0;
                    }
                }

                ecritures.push(ecriture);
            }
        });

        return ecritures;
    }

    /**
     * Validate that the generated entries are balanced
     */
    static validateBalance(ecritures: PaieCptEcriture[]): { isValid: boolean; message: string } {
        const totalDebit = ecritures.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = ecritures.reduce((sum, e) => sum + e.credit, 0);
        const difference = Math.abs(totalDebit - totalCredit);

        if (difference < 0.01) {
            return {
                isValid: true,
                message: `Balanced: Debit = ${PaieCptEcriture.formatCurrency(totalDebit)}, Credit = ${PaieCptEcriture.formatCurrency(totalCredit)}`
            };
        } else {
            return {
                isValid: false,
                message: `Unbalanced: Debit = ${PaieCptEcriture.formatCurrency(totalDebit)}, Credit = ${PaieCptEcriture.formatCurrency(totalCredit)}, Difference = ${PaieCptEcriture.formatCurrency(difference)}`
            };
        }
    }

    /**
     * Format the comptabilisation for display
     */
    static formatComptabilisationSummary(result: ComptabilisationResult): string {
        const lines: string[] = [];
        lines.push(`Piece ID: ${result.pieceId}`);
        lines.push(`Brouillard ID: ${result.brouillardId}`);
        lines.push(`Total Entries: ${result.ecritures.length}`);
        lines.push(`Total Debit: ${PaieCptEcriture.formatCurrency(result.totalDebit)}`);
        lines.push(`Total Credit: ${PaieCptEcriture.formatCurrency(result.totalCredit)}`);
        lines.push(`Balanced: ${result.isBalanced ? 'Yes' : 'No'}`);
        return lines.join('\n');
    }
}
