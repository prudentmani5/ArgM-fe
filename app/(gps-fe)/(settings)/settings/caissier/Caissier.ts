export class Caissier {
    caissierId: number | null; // Permettre null pour les nouvelles créations
    nomPrenom: string;
    fonction: string;

    constructor() {
        this.caissierId = null; // ou 0 selon votre préférence
        this.nomPrenom = '';
        this.fonction = '';
    }
}