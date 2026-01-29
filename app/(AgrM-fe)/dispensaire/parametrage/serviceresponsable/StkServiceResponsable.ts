// StkServiceResponsable.ts
export class StkServiceResponsable {
    servRespId: string;
    serviceId: string;
    responsableId: string;
    actif: boolean;

    constructor() {
        this.servRespId = '';
        this.serviceId = '';
        this.responsableId = '';
        this.actif = false;
    }
}