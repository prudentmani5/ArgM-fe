export class FamilleArticleDto {
    id: number;
    codeFm: string;
    libelle: string;
    compteVente: string;
    compteStock: string;
    compteSortie: string;
    libelleCodeFm: string;

    constructor() {
        this.id = 0,
            this.codeFm = '',
            this.libelle = '',
            this.compteVente = '',
            this.compteStock = '',
            this.compteSortie = '',
            this.libelleCodeFm = '';
    }
};

export class SousFamilleArticleDto {
    id:number;
    codeSFm: string;
    libelle: string;
    familleArticleDto: FamilleArticleDto;
    compteVente: string;
    compteStock: string;
    compteSortie: string;
    constructor() {
        this.id = 0,
        this.codeSFm='';
        this.libelle='';
        this.familleArticleDto=new FamilleArticleDto();
        this.compteVente='';
        this.compteStock='';
        this.compteSortie='';
    }

}

export class ArticleDto{
    id: number | null = null;
    codePrd: string = '';
    libelle: string = '' ;
    codeBar: string = '';
    unite: string = '';
    nombreUnite: number = 0;
    gererStock: boolean = false;
    prixUnitaire: number | null = 0;
    marge: number | null = null;
    tauxMarge: number | null = null;
    pvHt: number | null = null;
    pvTTC: number | null = null;
    tauxTaxe: number | null = null;
    compteVente: string = '';
    compteStock: string = '';
    compteSortie: string = '';
    sfamilleDto: SousFamilleArticleDto | null = null;
    pvHtva: number | null = null;
    pvTvac: number | null = null;

    constructor() {
        // Default constructor
    }
}

export class InvoiceItem{
    article: ArticleDto | undefined;
    itemQuantity: number = 0;
    itemPrice: number = 0;
    itemPriceExUsine?: number;
    itemCt: number = 0;
    itemTl: number  = 0;
    itemImeiTax: number = 0;
    itemTsceTax: number = 0;
    itemOttTax: number = 0;
    itemPriceNvat: number = 0;
    vat: number = 0;
    itemPriceWvat: number = 0;
    itemTotalAmount: number = 0;

}

export class Invoice {
    invoiceNumber: string | undefined;
    invoiceDate: string | undefined;
    customer: CompanyPartner | undefined;
    tpType: number | undefined;
    tpName: string | undefined;
    tpTIN: string | undefined;
    tpTradeNumber: string | undefined;
    tpPostalNumber?: string;
    tpPhoneNumber: string | undefined;
    tpAddressProvince?: string;
    tpAddressCommune: string | undefined;
    tpAddressQuartier: string | undefined;
    tpAddressAvenue?: string;
    tpAddressRue?: string;
    tpAddressNumber?: string;
    vatTaxpayer: string | undefined;
    ctTaxpayer: string | undefined;
    tlTaxpayer: string | undefined;
    tpFiscalCenter: string | undefined;
    tpActivitySector: string | undefined;
    tpLegalForm: string | undefined;
    paymentType: string | undefined;
    customerBank?: string;
    customerType?: string;
    customerName?: string;
    customerTIN?: string;
    customerAddress?: string;
    vatCustomerPayer?: string;
    invoiceType: string | undefined;
    invoiceTotalAmount?: number;
    cancelledInvoiceRef?: string;
    cancelledInvoice?: string;
    invoiceRef?: string;
    cnMotif?: string;
    invoiceSavedDate?: string;
    invoiceIdentifier: string | undefined;
    invoiceCurrency?: string;
    invoiceItems: InvoiceItem[] | undefined;
}

export class CompanyPartner{

      id?: number;
      reference?:string;
      name?:string;
      email?:string;
      phone?:string;
      street?:string;
      city?:string;
      country?:string;
      tva?: string;
      partnerType?: string; // Use String for flexibility
      webSite?: string;
      label?: string;
      compteComptable?: string;
}