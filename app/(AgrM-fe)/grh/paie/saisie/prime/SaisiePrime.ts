export class SaisiePrime {
    id?: number;
    matriculeId: string;
    codePrime: string;
    taux: number;
    montant: number;
    dateCreation?: Date;
    dateFin?: Date;
    periodeId: string;

    // Employee info (for display purposes, not saved to database)
    employeeFirstName?: string;
    employeeLastName?: string;

    constructor() {
        this.id = undefined;
        this.matriculeId = '';
        this.codePrime = '';
        this.taux = 0;
        this.montant = 0;
        this.employeeFirstName = '';
        this.employeeLastName = '';
        this.dateCreation = undefined;
        this.dateFin = undefined;
        this.periodeId = '';
    }

    // Helper method to generate primeId
    generateId(): string {
        return this.matriculeId + this.codePrime;
    }

    // Helper method to validate required fields
    isValid(): boolean {
        return this.matriculeId.length > 0 && 
               this.codePrime.length > 0 && 
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

    // Helper method to check if prime is active (not closed)
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