// EntreeVehPort.ts
import { formatLocalDateTime } from '@/utils/dateUtils';

export class EntreeVehPort {

    entreeVehPortId: number | undefined;
    categorieVehId: string;
    categorieVehLibelle: string;
    dateEntree: string;
    clientId: number;
    plaque: string;
    factureId: number;
    marque: string;
    lt: string;
    marchandiseId: number;
    poids: number;
    etat: string;
    couleur: string;
    observation: string;
    dateCreation: string;
    userCreation: string;
    dateUpdate: string;
    userUpdate: string;

    constructor() {
        this.categorieVehId = '';
        this.categorieVehLibelle = '';
        this.dateEntree = formatLocalDateTime(new Date());
        this.clientId = 0;
        this.plaque = '';
        this.factureId = 0;
        this.marque = '';
        this.lt = '';
        this.marchandiseId = 0;
        this.poids = 0;
        this.etat = '';
        this.couleur = '';
        this.observation = '';
        this.dateCreation = formatLocalDateTime(new Date());
        this.userCreation = '';
        this.dateUpdate = formatLocalDateTime(new Date());
        this.userUpdate = '';
    }
}
