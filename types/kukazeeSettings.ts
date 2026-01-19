export class AppSettings {
    id?: number; // Optional to handle cases where the ID might not yet be assigned
    companyName: string;
    companyLogo: string;
    companyCountry: string;
    companyProvince: string;
    companyTown: string;
    companyStreet: string;
    companyAddressNumber: string;

    constructor() {
        this.id = 0,
            this.companyName = '',
            this.companyLogo = '',
            this.companyCountry = '',
            this.companyProvince = '',
            this.companyTown = '',
            this.companyStreet = '';
            this.companyAddressNumber = '';
    }
}

export class BillingSettings {
    id?: number;
    appSettings: AppSettings;
    defaultCustomerName: string;
    constructor() {
        this.id = 0,
            this.appSettings = new AppSettings();
            this.defaultCustomerName = '';
    }
}

