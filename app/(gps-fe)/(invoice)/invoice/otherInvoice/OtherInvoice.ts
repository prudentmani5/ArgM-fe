export class OtherInvoice {
    constructor(
        public autreFactureId: string = '',
        public clientId: number  = 0,
        public libelle: string | null = null,
        public nomBateau: string | null = null,
        public dateFacture: Date | null = null,
        public montantManut: number = 0,
        public montantMag: number = 0,
        public tva: number = 0,
        public lot: string | null = null,
        public poidsPaye: number = 0,
        public poidsPese: number = 0,
        public poidsRoute: number = 0,
        public soldePositif: number = 0,
        public soldeNegatif: number = 0,
        public poidsNetAPayer: number = 0,
        public qteBateau: number = 0,
        public puBateau: number = 44138,
        public qteSurtaxe: number = 0,
        public puSurtaxe: number = 542,
        public qteSalissage: number = 0,
        public puSalissage: number = 434,
        public redevance: number = 23395,
        public qtePeage: number = 0,
        public puPeage: number = 104036,
        public redevPeage: number = 23395,
        public abonnementTour: number  = 0,
        public qteAbonnementTour: number = 0,
        public gardiennageVehicule: number = 0,
        public qteGardiennageVehicule: number = 0,
        public redevGardiennage: number = 0,
        public nbreNuite: number = 0,
        public plaque: string | null = null,
        public dossierId: string | null = null,
        public modePayement: string | null = null,
        public isValid: boolean | null = null,
        public dateValidation: Date | null = null,
        public refAnnule: string | null = null,
        public numeroOrdre: number | null = null,
        public factureSignature: string | null = null,
        public motifAnnulation: string | null = null,
        public rsp: string | null = null,
        public lt: string | null = null,
        public userCreation: string  = '',
        public dateCreation: Date | null = null,
        public dateAnnulation: Date | null = null,
        public userAnnulation: string  = '',
        public dateEnvoiOBR: Date | null = null,
        public statusEnvoiOBR: number | null = null,
        public statusEnvoiCancelOBR: number | null = null,
        public annuleFacture: number | boolean = 0
    ) {}

}
 export class OtherInvoiceValidationRequest {
    autreFactureId: string;
    isValid: boolean;
    

    constructor(autreFactureId: string, isValid: boolean) {
        this.autreFactureId = autreFactureId;
        this.isValid = isValid;
    }
}