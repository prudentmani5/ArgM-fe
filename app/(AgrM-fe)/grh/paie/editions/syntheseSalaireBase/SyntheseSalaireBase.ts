export class SyntheseSalaireBaseEmployeeDto {
    matriculeId: string = '';
    nom: string = '';
    prenom: string = '';
    base: number = 0;

    getFullName(): string {
        return `${this.nom || ''} ${this.prenom || ''}`.trim();
    }
}

export class SyntheseSalaireBaseResponseDto {
    periodeId: string = '';
    mois: number = 0;
    annee: number = 0;
    periodeLibelle: string = '';
    employees: SyntheseSalaireBaseEmployeeDto[] = [];
    grandTotalBase: number = 0;
    totalEmployeeCount: number = 0;
}
