export class SaisieIndemnite {
    indemniteId: string;
    matriculeId: string;
    codeInd: string;
    taux: number;
    montant: number;
    
    // Employee info (for display purposes, not saved to database)
    employeeFirstName?: string;
    employeeLastName?: string;
    periodeId: string;

    constructor() {
        this.indemniteId = '';
        this.matriculeId = '';
        this.codeInd = '';
        this.taux = 0;
        this.montant = 0;
        this.employeeFirstName = '';
        this.employeeLastName = '';
        this.periodeId = '';
    }

    // Helper method to generate indemniteId
    generateId(): string {
        return this.matriculeId + this.codeInd;
    }

    // Helper method to validate required fields
    isValid(): boolean {
        return this.matriculeId.length > 0 && 
               this.codeInd.length > 0 && 
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

    // Helper method to check if indemnite is active (not closed)
    isActive(): boolean {
        return !this.dateFin;
    }

    // Helper method to get status label
    getStatusLabel(): string {
        return this.isActive() ? 'Actif' : 'Clôturé';
    }

    // Helper method to get status badge class
    getStatusBadgeClass(): string {
        return this.isActive() ? 'p-badge-success' : 'p-badge-secondary';
    }
}