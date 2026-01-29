/**
 * TypeScript models for Paiements à effectuer report
 */

/**
 * Bank payment item - represents total net salary to send to a specific bank
 */
export class PaiementsAEffectuerBanqueDto {
    codeBanque: string = '';
    libelleBanque: string = '';
    montant: number = 0;

    static formatCurrency(value: number | undefined | null): string {
        if (value === null || value === undefined) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}

/**
 * Retenue payment item - represents retenue to be paid (where displayInPaymentToDO is true)
 */
export class PaiementsAEffectuerRetenueDto {
    codeRet: string = '';
    libelleRet: string = '';
    montant: number = 0;

    static formatCurrency(value: number | undefined | null): string {
        if (value === null || value === undefined) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}

/**
 * Main response DTO for Paiements à effectuer report
 */
export class PaiementsAEffectuerResponseDto {
    periodeId: string = '';
    mois: number = 0;
    annee: number = 0;
    periodeLibelle: string = '';

    banquePayments: PaiementsAEffectuerBanqueDto[] = [];
    retenuePayments: PaiementsAEffectuerRetenueDto[] = [];

    totalBanque: number = 0;
    totalRetenue: number = 0;
    totalGeneral: number = 0;

    static formatCurrency(value: number | undefined | null): string {
        if (value === null || value === undefined) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}
