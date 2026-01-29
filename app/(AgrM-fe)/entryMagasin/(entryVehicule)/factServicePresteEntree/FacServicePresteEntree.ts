export class FacServicePresteEntree {
    servicePresteId: number | null;
    numFacture: string;
    serviceId: number | null;
    importateurId: number | null;
    date: Date;
    lettreTransp: string;
    montant: number | null;
    peage: number | null;
    pesage: number | null;
    taxe: boolean;
    montTaxe: number | null;
    montRedev: number | null;
    montRedevTaxe: number | null;
    taux: number | null;
    montantDevise: number | null;
    tauxChange: number | null;
    pac: string;
    typeVehicule: string;
    plaque: string;
    pesageVide: number | null;
    redPalette: number | null;
    noCont: string;
    nbreCont: number | null;
    poids: number | null;
    dateDebut: Date;
    dateFin: Date;
    supplement: boolean;
    dateSupplement: Date | null;
    declarant: string;
    valide1: boolean;
    valide2: boolean;
    userValide1: string;
    userValide2: string;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;
    facture: boolean;
    dossierId: string;
    modePayement: string;
    isValid: boolean;
    dateValidation: Date | null;
    refAnnule: string;
    numeroOrdre: number | null;
    factureSignature: string;
    motifAnnulation: string;
    // Additional properties for grouped data
    serviceNames?: string; // For displaying concatenated service names
    telephoneNumber: string;

    constructor() {
        this.servicePresteId = null;
        this.numFacture = '';
        this.serviceId = null;
        this.importateurId = null;
        this.date = new Date();
        this.lettreTransp = '';
        this.montant = 0;
        this.peage = 0;
        this.pesage = 0;
        this.taxe = true;
        this.montTaxe = 0;
        this.montRedev = 0;
        this.montRedevTaxe = 0;
        this.taux = 18; // Default tax rate 18%
        this.montantDevise = 0;
        this.tauxChange = 0;
        this.pac = '';
        this.typeVehicule = '';
        this.plaque = '';
        this.pesageVide = null;
        this.redPalette = null;
        this.noCont = '';
        this.nbreCont = 1;
        this.poids = null;
        this.dateDebut = new Date();
        this.dateFin = new Date();
        this.supplement = false;
        this.dateSupplement = null;
        this.declarant = '';
        this.valide1 = false;
        this.valide2 = false;
        this.userValide1 = '';
        this.userValide2 = '';
        this.userCreation = '';
        this.dateCreation = null;
        this.userUpdate = '';
        this.dateUpdate = null;
        this.facture = false;
        this.dossierId = '';
        this.modePayement = '';
        this.isValid = false;
        this.dateValidation = null;
        this.refAnnule = '';
        this.numeroOrdre = null;
        this.factureSignature = '';
        this.motifAnnulation = '';
        this.serviceNames = '';
        this.telephoneNumber = '';
    }

    // Method to calculate tax automatically
    calculateTax(): void {
        if (this.taxe && this.montant) {
            this.montTaxe = this.montant * 0.18;
        } else {
            this.montTaxe = 0;
        }
    }

    // Method to get total amount including tax
    getTotalAmount(): number {
        return (this.montant || 0) + (this.montTaxe || 0);
    }
}