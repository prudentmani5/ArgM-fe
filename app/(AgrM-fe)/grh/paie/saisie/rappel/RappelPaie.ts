export class RappelPaie {
    id: number | null;
    matriculeId: string;
    periodeId: string;
    rappPositifImp: number;
    rappPositifNonImp: number;
    rappNegatifImp: number;
    rappNegatifNonImp: number;

    // Employee info (from DTO, not saved to database)
    nom?: string;
    prenom?: string;

    constructor() {
        this.id = null;
        this.matriculeId = '';
        this.periodeId = '';
        this.rappPositifImp = 0;
        this.rappPositifNonImp = 0;
        this.rappNegatifImp = 0;
        this.rappNegatifNonImp = 0;
        this.nom = '';
        this.prenom = '';
    }

    isValid(): boolean {
        return this.matriculeId !== null && this.matriculeId.trim() !== '' &&
               this.periodeId !== null && this.periodeId.trim() !== '';
    }

    getFullName(): string {
        if (this.nom && this.prenom) {
            return `${this.nom} ${this.prenom}`;
        }
        return '';
    }

    getTotalRappelPositif(): number {
        return this.rappPositifImp + this.rappPositifNonImp;
    }

    getTotalRappelNegatif(): number {
        return this.rappNegatifImp + this.rappNegatifNonImp;
    }

    getNetRappel(): number {
        return this.getTotalRappelPositif() - this.getTotalRappelNegatif();
    }
}
