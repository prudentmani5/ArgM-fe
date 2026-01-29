import { Invoice, ManutentionResult } from './Invoice';
import { buildApiUrl } from '../../../../../utils/apiConfig';

const API_BASE_URL = buildApiUrl('/api/facture-sortie');

export class InvoiceService {
    
    // CRUD Operations
    static async createInvoice(invoice: Invoice): Promise<Invoice> {
        const invoiceData = this.convertToBackendFormat(invoice);
        
        // Validation des données avant envoi
        this.validateInvoiceData(invoiceData);
        
        const response = await fetch(`${API_BASE_URL}/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors de la création de la facture');
        }
        
        return response.json();
    }

    static async updateInvoice(id: number, invoice: Invoice): Promise<Invoice> {
        const invoiceData = this.convertToBackendFormat(invoice);
        this.validateInvoiceData(invoiceData);
        
        const response = await fetch(`${API_BASE_URL}/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors de la modification de la facture');
        }
        
        return response.json();
    }

    static async getInvoiceById(id: number): Promise<Invoice> {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors de la récupération de la facture');
        }
        
        const data = await response.json();
        return this.convertFromBackendFormat(data);
    }

    static async getAllInvoices(): Promise<Invoice[]> {
        const response = await fetch(`${API_BASE_URL}/liste`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors du chargement des factures');
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data.map(item => this.convertFromBackendFormat(item)) : [];
    }

    // Calculation Operations
    static async calculateManutention(rsp: string): Promise<ManutentionResult> {
        const response = await fetch(`${API_BASE_URL}/calcul-manutention?rsp=${encodeURIComponent(rsp)}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors du calcul de manutention');
        }
        
        const data = await response.json();
        return this.convertToManutentionResult(data);
    }

    static async calculateSupplement(rsp: string): Promise<ManutentionResult> {
        const response = await fetch(`${API_BASE_URL}/calcul-supplement?rsp=${encodeURIComponent(rsp)}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors du calcul du supplément');
        }
        
        const data = await response.json();
        return this.convertToManutentionResult(data);
    }

    static async calculateSolde(rsp: string): Promise<ManutentionResult> {
        const response = await fetch(`${API_BASE_URL}/calcul-solde?rsp=${encodeURIComponent(rsp)}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors du calcul du solde');
        }
        
        const data = await response.json();
        return this.convertToManutentionResult(data);
    }


   
  ///For Validation

  // Calculation Operations
    static async calculateManutentionValidation(rsp: string, sortieId: string): Promise<ManutentionResult> {
       const response = await fetch(
    `${API_BASE_URL}/calcul-manutentionValidation?rsp=${encodeURIComponent(rsp)}&sortieId=${encodeURIComponent(sortieId)}`
);
    if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors du calcul de manutention');
        }
        
        const data = await response.json();
        return this.convertToManutentionResult(data);
    }

    static async calculateSupplementValidation(rsp: string,sortieId: string): Promise<ManutentionResult> {
        const response = await fetch(`${API_BASE_URL}/calcul-supplementValidation?rsp=${encodeURIComponent(rsp)}&sortieId=${encodeURIComponent(sortieId)}`)
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors du calcul du supplément');
        }
        
        const data = await response.json();
        return this.convertToManutentionResult(data);
    }

    static async calculateSoldeValidation(rsp: string,sortieId: string): Promise<ManutentionResult> {
        const response = await fetch(`${API_BASE_URL}/calcul-soldeValidation?rsp=${encodeURIComponent(rsp)}&sortieId=${encodeURIComponent(sortieId)}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors du calcul du solde');
        }
        
        const data = await response.json();
        return this.convertToManutentionResult(data);
    }


    // CORRIGÉ - Vérification de validation de facture
    static async checkInvoiceValidation(rsp: string, sortieId: string): Promise<{ isValid: boolean; message: string }> {    
        const response = await fetch(
            `${API_BASE_URL}/factureValid?rsp=${encodeURIComponent(rsp)}&sortieId=${encodeURIComponent(sortieId)}`
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors de la vérification de la facture');
        }
        
        const factureData = await response.json();
        
        console.log('Données reçues du backend:', factureData);
        
        // Vérifier si la facture existe et est validée
        // Si la facture existe (non null), elle est considérée comme validée
        const isValid = factureData !== null;
        
        return {
            isValid: isValid,
            message: factureData !== null ? 'Facture validée' : 'Facture non trouvée'
        };
    }

    // Méthodes de conversion
    private static convertToBackendFormat(invoice: Invoice): any {
        return {
            factureSortieId: invoice.factureSortieId || null,
            sortieId: invoice.sortieId || '',
            rsp: invoice.rsp || '',
            lt: invoice.lt || '',
            manutBateau: invoice.manutBateau || 0,
            manutCamion: invoice.manutCamion || 0,
            surtaxeColisLourd: invoice.surtaxeColisLourd || 0,
            montSalissage: invoice.montSalissage || 0,
            montArrimage: invoice.montArrimage || 0,
            montRedev: invoice.montRedev || 0,
            montPalette: invoice.montPalette || 0,
            montPesMag: invoice.montPesMag || 0,
            montLais: invoice.montLais || 0,
            peage: invoice.peage || 0,
            montEtiquette: invoice.montEtiquette || 0,
            montFixationPlaque: invoice.montFixationPlaque || 0,
            montTotalManut: invoice.montTotalManut || 0,
            montMagasinage: invoice.montMagasinage || 0,
            montGardienage: invoice.montGardienage || 0,
            montTVA: invoice.montTVA || 0,
            montantPaye: invoice.montantPaye || 0,
            clientId: invoice.clientId || 0,
            marchandiseId: invoice.marchandiseId || 0,
            dateSortie: invoice.dateSortie,
            dossierId: invoice.dossierId || '',
            nomMarchandise: invoice.nomMarchandise || '',
            nomImportateur: invoice.nomImportateur || '',
            dateEntree: invoice.dateEntree,
            //dateSortie: invoice.dateSortie,
            montantReduction: invoice.montantReduction || 0,
            tauxReduction: invoice.tauxReduction || 0,
            exonere: invoice.exonere || false,
            declarant: invoice.declarant || '',
            modePayement: invoice.modePayement || '',
            isValid: invoice.isValid || false,
            fixationPlaque: invoice.fixationPlaque || false,
            nomClient: invoice.nomClient || '',
            duree: invoice.duree || 0,
            duree37: invoice.duree37 || 0,
            tonnageArrondi: invoice.tonnageArrondi || 0,
            tonnage: invoice.tonnage || 0,
            nbreColis: invoice.nbreColis || 0,
            etiquete: invoice.etiquete || false,
            typeFacture: invoice.typeFacture || '',
            typeConditionId: invoice.typeConditionId || '',
            userValidation: invoice.userValidation || '',
            dateValidation: invoice.dateValidation,
            refAnnule: invoice.refAnnule || '',
            numeroOrdre: invoice.numeroOrdre || 0,
            annule: invoice.annule || false,
            factureSignature: invoice.factureSignature || '',
            motifAnnulation: invoice.motifAnnulation || '',
            // Set dateSupplement and dateDerniereSortie based on typeFacture
            dateSupplement: invoice.typeFacture === 'Supplement' ? invoice.dateSortie : invoice.dateSupplement,
            dateDerniereSortie: invoice.typeFacture === 'Solde' ? invoice.dateSortie : invoice.dateDerniereSortie,
            transit:invoice.transit || false,
            montantDevise : invoice.montantDevise || 0,
            tonnageSolde: invoice.tonnageSolde || 0,
            userCreation: invoice.userCreation || '',

            // Unit rates
            tarifBarge: invoice.tarifBarge || 0,
            tarifCamion: invoice.tarifCamion || 0,
            surtaxeClt: invoice.surtaxeClt || 0,
            fraisSrsp: invoice.fraisSrsp || 0,
            fraisArrimage: invoice.fraisArrimage || 0,

            // Quantities
            nbrePalette: invoice.nbrePalette || 0,
            nbreEtiquette: invoice.nbreEtiquette || 0,

            // Storage prices
            montMag: invoice.montMag || 0,
            montMag37: invoice.montMag37 || 0,

            // Weight
            poids: invoice.poids || invoice.tonnage || 0,
            poidsKg: invoice.poidsKg || 0,
            tonnageSoldeArrondi: invoice.tonnageSoldeArrondi || 0,

            // Client info
            nif: invoice.nif || '',
            adresse: invoice.adresse || '',

            // Extended period amounts
            montMagasinage37: invoice.montMagasinage37 || 0,
            montGardienage37: invoice.montGardienage37 || 0,

        };
    }

    private static convertFromBackendFormat(data: any): Invoice {
        const invoice = new Invoice();
        
        // Mapper tous les champs avec des valeurs par défaut
        invoice.factureSortieId = data.factureSortieId || null;
        invoice.sortieId = data.sortieId || '';
        invoice.rsp = data.rsp || '';
        invoice.lt = data.lt || '';
        invoice.manutBateau = data.manutBateau || 0;
        invoice.manutCamion = data.manutCamion || 0;
        invoice.surtaxeColisLourd = data.surtaxeColisLourd || 0;
        invoice.montSalissage = data.montSalissage || 0;
        invoice.montArrimage = data.montArrimage || 0;
        invoice.montRedev = data.montRedev || 0;
        invoice.montPalette = data.montPalette || 0;
        invoice.montPesMag = data.montPesMag || 0;
        invoice.montLais = data.montLais || 0;
        invoice.peage = data.peage || 0;
        invoice.montEtiquette = data.montEtiquette || 0;
        invoice.montFixationPlaque = data.montFixationPlaque || 0;
        invoice.montTotalManut = data.montTotalManut || 0;
        invoice.montMagasinage = data.montMagasinage || 0;
        invoice.montGardienage = data.montGardienage || 0;
        invoice.montTVA = data.montTVA || 0;
        invoice.montantPaye = data.montantPaye || 0;
        invoice.clientId = data.clientId || 0;
        invoice.marchandiseId = data.marchandiseId || 0;
        invoice.dateSortie = data.dateSortie;
        invoice.dossierId = data.dossierId || '';
        invoice.nomMarchandise = data.nomMarchandise || '';
        invoice.nomClient = data.nomImportateur || data.nomClient || '';
        invoice.dateEntree = data.dateEntree;
        invoice.dateSortie = data.dateSortie;
        invoice.montantReduction = data.montantReduction || 0;
        invoice.tauxReduction = data.tauxReduction || 0;
        invoice.exonere = data.exonere || false;
        invoice.declarant = data.declarant || '';
        invoice.modePayement = data.modePayement || '';
        invoice.isValid = data.isValid || false;
        invoice.fixationPlaque = data.fixationPlaque || false;
        invoice.duree = data.duree || 0;
        invoice.duree37 = data.duree37 || 0;
        invoice.tonnageArrondi = data.tonnageArrondi || 0;
        invoice.tonnage = data.tonnage || 0;
        invoice.nbreColis = data.nbreColis || 0;
        invoice.etiquete = data.etiquete || false;
        invoice.nomImportateur = data.nomImportateur || '';
        invoice.typeFacture = data.typeFacture || '';
        invoice.typeConditionId = data.typeConditionId || '';
        invoice.montArrimage =  data.montArrimage || 0;
        invoice.montFixationPlaque  = data.montFixationPlaque || 0;
        invoice.peage = data.peage || 0;
        invoice.transit=data.transit || false,
        invoice.montantDevise = data.montantDevise || 0;
        invoice.tonnageSolde = data.tonnageSolde || 0;
        invoice.userCreation = data.userCreation || '';
        invoice.userValidation = data.userValidation || '';

        // Unit rates
        invoice.tarifBarge = data.tarifBarge || 0;
        invoice.tarifCamion = data.tarifCamion || 0;
        invoice.surtaxeClt = data.surtaxeClt || 0;
        invoice.fraisSrsp = data.fraisSrsp || 0;
        invoice.fraisArrimage = data.fraisArrimage || 0;

        // Quantities
        invoice.nbrePalette = data.nbrePalette || 0;
        invoice.nbreEtiquette = data.nbreEtiquette || 0;

        // Storage prices
        invoice.montMag = data.montMag || 0;
        invoice.montMag37 = data.montMag37 || 0;

        // Weight
        invoice.poids = data.poids || data.tonnage || 0;
        invoice.poidsKg = data.poidsKg || 0;
        invoice.tonnageSoldeArrondi = data.tonnageSoldeArrondi || 0;

        // Client info
        invoice.nif = data.nif || '';
        invoice.adresse = data.adresse || '';

        // Extended period amounts
        invoice.montMagasinage37 = data.montMagasinage37 || 0;
        invoice.montGardienage37 = data.montGardienage37 || 0;

        return invoice;
    }

    private static convertToManutentionResult(data: any): ManutentionResult {
        const result = new ManutentionResult();
        
        // Mapper tous les champs avec des valeurs par défaut
        result.montantTotalManutention = data.montTotalManut || 0;
        result.montantTVA = data.montTVA || 0;
        result.montantGardiennage = data.montGardienage || 0;
        result.montantGardiennage37 = data.montGardienage37 || 0;
        result.montantMagasinage = data.montMagasinage || 0;
        result.montantMagasinage37 = data.montMagasinage37 || 0;
        result.montantPaye = data.montantPaye || 0;
        result.montEtiquette = data.montEtiquette || 0;
        result.manutBateau = data.manutBateau || 0;
        result.manutCamion = data.manutCamion || 0;
        result.montSalissage = data.montSalissage || 0;
        result.montPalette = data.montPalette || 0;
        result.montPesMag = data.montPesMag || 0;
        result.montFaireSuivre = data.montLais || 0;
        result.montantReduction = data.montantReduction || 0;
        result.facture = data.sortieId || '';
        result.lt = data.lt || '';
        result.redv = data.montRedev || 0;
        result.tauxReduction = data.tauxReduction || 0;
        result.declarant = data.declarant || '';
        result.nomClient = data.nomImportateur || data.nomClient || '';
        result.nomMarchandise = data.nomMarchandise || '';
        result.clientId = data.clientId || 0;
        result.marchandiseId = data.marchandiseId || 0;
        result.dossierId = data.dossierId || '';
        result.montantFixationPlaque = data.montFixationPlaque || 0;
        result.duree = data.duree || 0;
        result.duree37 = data.duree37 || 0;
        result.tonnageArrondi = data.tonnageArrondi || 0;
        result.tonnage = data.tonnage || 0;
        result.nomMarchandise = data.nomMarchandise || '';
        result.nomClient = data.nomImportateur || '';
        result.dateEntree = data.dateEntree;
        result.dateSortie = data.dateSortie;
        result.poids = data.poids || (data.tonnage || 0) * 1000;
        result.poidsKg = data.poidsKg || (data.tonnage || 0) * 1000;
        result.tarifBarge = data.tarifBarge || 0;
        result.tarifCamion = data.tarifCamion || 0;
        result.surtaxeClt = data.surtaxeClt || 0;
        result.fraisSrsp = data.fraisSrsp || 0;
        result.fraisArrimage = data.fraisArrimage || 0;
        result.nbrePalette = data.nbrePalette || 0;
        result.nbreEtiquette = data.nbreEtiquette || 0;
        result.montMag = data.montMag || 0;
        result.montMag37 = data.montMag37 || 0;
        result.typeFacture = data.typeFacture || '';
        result.typeConditionId = data.typeConditionId || '';
        result.surtaxeColisLourd = data.surtaxeColisLourd || 0;
        result.montArrimage =  data.montArrimage || 0;
        result.montFixationPlaque  = data.montFixationPlaque || 0;
        result.peage = data.peage || 0;
         result.transit=data.transit || false,
         result.montantDevise = data.montantDevise || 0
        result.tonnageSolde = data.tonnageSolde || 0
        result.userCreation = data.userCreation || ''
        result.userValidation = data.userValidation || ''

        //result.montRedev = data.montRedev || 0;

        return result;
    }

    // Validation des données
    private static validateInvoiceData(invoiceData: any): void {
        const requiredFields = [
            'montantReduction', 'tauxReduction', 'manutBateau', 'manutCamion',
            'surtaxeColisLourd', 'montSalissage', 'montArrimage', 'montRedev',
            'montPalette', 'montPesMag', 'montLais', 'peage', 'montEtiquette',
            'montFixationPlaque', 'montTotalManut', 'montMagasinage', 'montGardienage',
            'montTVA', 'montantPaye', 'clientId', 'marchandiseId'
        ];

        requiredFields.forEach(field => {
            if (invoiceData[field] === null || invoiceData[field] === undefined) {
                invoiceData[field] = 0;
            }
        });

        // Valider les champs string
        const stringFields = ['rsp', 'lt', 'dossierId', 'declarant', 'modePayement'];
        stringFields.forEach(field => {
            if (!invoiceData[field]) {
                invoiceData[field] = '';
            }
        });
    }

    // Utility methods
    static formatCurrency(value: number | null): string {
        if (value === null || isNaN(value)) return '0 BIF';
        return value.toLocaleString('fr-MG', {
            style: 'currency',
            currency: 'BIF'
        });
    }

    static formatDate(dateString: string | Date | null): string {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
        } catch {
            return '';
        }
    }
}