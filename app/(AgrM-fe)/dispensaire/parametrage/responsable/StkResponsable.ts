// StkResponsable.ts
export class StkResponsable {
    responsableId: string;
    nom: string;
    adresse: string | null;
    email: string | null;
    tel: string | null;

    constructor() {
        this.responsableId = '';
        this.nom = '';
        this.adresse = null;
        this.email = null;
        this.tel = null;
    }
}