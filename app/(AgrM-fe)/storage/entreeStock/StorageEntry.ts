// StorageEntry.ts
import { formatLocalDateTime } from '@/utils/dateUtils';

export class StorageEntry {
    lt: string;
    dateEntree: string;
    entreposId: number | null;
    marchandiseId: number | null;
    importateurId: number | null;
    provenanceId: number | null;
    noConteneur: string;
    capita: string | null;
    plaque: string;
    poidsEntre: number | null;
    solde: number | null;
    destinataire: number | null;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;
    typeTransport: string;
    exportation: boolean;
    bargeId: number | null;

    constructor() {
        this.lt = '';
        this.dateEntree = formatLocalDateTime(new Date());
        this.entreposId = null;
        this.marchandiseId = null;
        this.importateurId = null;
        this.provenanceId = null;
        this.noConteneur = '';
        this.plaque = '';
        this.poidsEntre = null;
        this.solde = 0;
        this.capita = null;
        this.destinataire = null;
        this.userCreation = '';
        this.dateCreation = new Date();
        this.userUpdate = '';
        this.dateUpdate = null;
        this.typeTransport = '';
        this.exportation = false;
        this.bargeId = null;
    }
}