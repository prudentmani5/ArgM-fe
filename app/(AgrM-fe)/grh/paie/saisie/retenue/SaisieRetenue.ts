export class SaisieRetenue {
    id: string;
    matriculeId: string;
    codeRet: string;
    taux: number;
    montant: number;
    codeBanque?: string;
    compte?: string;
    reference?: string;
    actif: boolean;
    cloture: boolean;
    periodeId: string; 

    // Employee info (for display purposes, not saved to database)
    employeeFirstName?: string;
    employeeLastName?: string;

    constructor() {
        this.id = '';
        this.matriculeId = '';
        this.codeRet = '';
        this.taux = 0;
        this.montant = 0;
        this.codeBanque = '';
        this.compte = '';
        this.reference = '';
        this.actif = true;  // Default to active
        this.cloture = false; // Default to not closed
        this.employeeFirstName = '';
        this.employeeLastName = '';
        this.periodeId = '';
    }

    // Helper method to generate retenueId
    generateId(): string {
        return this.matriculeId + this.codeRet;
    }

    // Helper method to validate required fields
    isValid(): boolean {
        return this.matriculeId.length > 0 && 
               this.codeRet.length > 0 && 
               this.montant > 0;
    }

    // Helper method to get full employee name
    getEmployeeFullName(): string {
        if (this.employeeFirstName && this.employeeLastName) {
            return `${this.employeeFirstName} ${this.employeeLastName}`;
        }
        return '';
    }

    // Helper method to format amount
    getFormattedAmount(): string {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF'
        }).format(this.montant);
    }

    // Helper method to format percentage
    getFormattedTaux(): string {
        return `${this.taux}%`;
    }

    // Helper method to check if retenue is active
    isActive(): boolean {
        return this.actif && !this.cloture;
    }

    // Helper method to check if retenue is closed
    isClosed(): boolean {
        return this.cloture;
    }

    // Helper method to get status label
    getStatusLabel(): string {
        if (this.cloture) return 'Clôturé';
        if (this.actif) return 'Actif';
        return 'Inactif';
    }

    // Helper method to get status badge class
    getStatusBadgeClass(): string {
        if (this.cloture) return 'p-badge-secondary';
        if (this.actif) return 'p-badge-success';
        return 'p-badge-warning';
    }

    // Enforce business rule: actif and cloture cannot both be true
    setActif(value: boolean): void {
        this.actif = value;
        if (value && this.cloture) {
            this.cloture = false;
        }
    }

    setCloture(value: boolean): void {
        this.cloture = value;
        if (value && this.actif) {
            this.actif = false;
        }
    }

    // Helper method to check if retenue can be modified
    canBeModified(): boolean {
        return !this.cloture;
    }
}