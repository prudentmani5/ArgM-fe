import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 15,
        fontSize: 8,
        fontFamily: 'Helvetica'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
        borderBottom: '2px solid #2c3e50',
        paddingBottom: 4
    },
    headerLeft: {
        flex: 1,
    },
    headerCenter: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end'
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 2
    },
    companyDetails: {
        fontSize: 9,
        marginBottom: 1
    },
    invoiceTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 6,
        color: '#2c3e50',
        textTransform: 'uppercase'
    },
    section: {
        marginBottom: 8,
        padding: 3,
        border: '1px solid #bdc3c7',
        borderRadius: 3
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        backgroundColor: '#34495e',
        color: 'white',
        padding: 2,
        marginBottom: 6,
        borderRadius: 2
    },
    row: {
        flexDirection: 'row',
        marginBottom: 1
    },
    label: {
        width: '40%',
        padding: 1,
        fontWeight: 'bold',
        fontSize: 8
    },
    value: {
        width: '60%',
        padding: 1,
        fontSize: 8
    },
    tableContainer: {
        marginTop: 8,
        border: '1px solid #bdc3c7'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#34495e',
        color: 'white'
    },
    headerCell: {
        padding: 3,
        fontWeight: 'bold',
        fontSize: 8
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #ecf0f1',
        minHeight: 16
    },
    tableCell: {
        padding: 2,
        fontSize: 7,
        flex: 1,
        fontWeight: 'bold',
        fontSize: 8
    },

    calculationCell: {
        padding: 2,
        fontSize: 6,
        flex: 1,
        color: '#7f8c8d',
        fontWeight: 'bold',
        fontSize: 8

    },
    zeroValue: {
        color: '#95a5a6',
        fontStyle: 'italic'
    },
    totalSection: {
        marginTop: 4,
        border: '2px solid #2c3e50',
        backgroundColor: '#ecf0f1',
        padding: 4
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1
    },
    amountInWords: {
        marginTop: 6,
        padding: 4,
        backgroundColor: '#f8f9fa',
        border: '1px solid #bdc3c7',
        fontSize: 7,
        textAlign: 'center',
        fontStyle: 'italic'
    },
    signature: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTop: '1px solid #7f8c8d',
        paddingTop: 4
    },
    bankInfo: {
        marginTop: 6,
        paddingTop: 3,
        borderTop: '1px solid #7f8c8d',
        fontSize: 10,
        textAlign: 'center',
        //color: '#7f8c8d',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    boldText: {
        fontWeight: 'bold'
    },
    highlightText: {
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: 1,
        borderRadius: 1,
        fontSize: 7
    },
    logoContainer: {
        width: 120,
        height: 90,
        backgroundColor: '#f8f9fa',
        padding: 5,
        border: '1px solid #bdc3c7',
        alignItems: 'center',
        justifyContent: 'center'
    },
    twoColumn: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    column: {
        width: '48%'
    },
    parameterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 2
    },
    parameterItem: {
        width: '32%',
        marginBottom: 1
    },
    calculationDetails: {
        fontSize: 5.5,
        color: '#7f8c8d',
        fontStyle: 'italic',
        marginTop: 0.5
    },
    separatorRow: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderTop: '2px solid #bdc3c7',
        borderBottom: '2px solid #bdc3c7',
        padding: 2
    },
    separatorText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        width: '100%'
    }
});
const PdfLogo = () => (
    <View style={styles.logoContainer}>
        <Image
            src="/assets/images/logo.png"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
    </View>
);

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 BIF';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'BIF',
        currencyDisplay: 'code',
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })
        .format(value)
        .replace(/\s/g, ' ')
        .replace(/BIF$/, ' BIF');
};

const formatCurrencyNumber = (value) => {
    if (value === null || value === undefined) return '0 BIF';
    return new Intl.NumberFormat('fr-FR', {
        
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })
        .format(value)
        .replace(/\s/g, ' ')
        .replace(/BIF$/, ' BIF');
};

const formatCurrencyDevise = (value) => {
    if (value === null || value === undefined) return '0 $';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'narrowSymbol',
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })
        .format(value)
        .replace(/\s/g, ' ');
};

const formatNumber = (value) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value)
    .replace(/\s/g, ' ');
    
};

// Fonction pour convertir un nombre en lettres
const nombreEnLettres = (nombre) => {
    if (nombre === 0 || nombre === null || nombre === undefined) return 'zéro';

    const unite = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const dizaine = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    const specials = {
        11: 'onze', 12: 'douze', 13: 'treize', 14: 'quatorze', 15: 'quinze',
        16: 'seize', 17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf'
    };

    let resultat = '';
    let reste = Math.floor(nombre);

    // Milliards
    if (reste >= 1000000000) {
        const milliards = Math.floor(reste / 1000000000);
        resultat += nombreEnLettres(milliards) + ' milliard' + (milliards > 1 ? 's' : '') + ' ';
        reste %= 1000000000;
    }

    // Millions
    if (reste >= 1000000) {
        const millions = Math.floor(reste / 1000000);
        resultat += nombreEnLettres(millions) + ' million' + (millions > 1 ? 's' : '') + ' ';
        reste %= 1000000;
    }

    // Milliers
    if (reste >= 1000) {
        const milliers = Math.floor(reste / 1000);
        if (milliers === 1) {
            resultat += 'mille ';
        } else {
            resultat += nombreEnLettres(milliers) + ' mille ';
        }
        reste %= 1000;
    }

    // Centaines
    if (reste >= 100) {
        const centaines = Math.floor(reste / 100);
        if (centaines === 1) {
            resultat += 'cent ';
        } else {
            resultat += unite[centaines] + ' cent ';
        }
        reste %= 100;
    }

    // Dizaines et unités
    if (reste > 0) {
        if (specials[reste]) {
            resultat += specials[reste];
        } else {
            const d = Math.floor(reste / 10);
            const u = reste % 10;

            if (d > 0) {
                resultat += dizaine[d];
                if (u > 0) {
                    resultat += (d === 7 || d === 9) ? '-' + unite[u + 10] : '-' + unite[u];
                }
            } else {
                resultat += unite[u];
            }
        }
    }

    return resultat.trim();
};

const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Date invalide' : date.toLocaleDateString('fr-FR');
    } catch {
        return 'Date invalide';
    }
};

export const FacturePDF = ({ invoice = {} }) => {
    if (!invoice || typeof invoice !== 'object') {
        invoice = {};
    }
    const montantTotalEnLettres = invoice.montantPaye
        ? nombreEnLettres(Math.floor(invoice.montantPaye)) + ' francs burundais'
        : 'zéro franc burundais';

    // Calcul de TOUS les paramètres (même ceux à zéro)
    //const poidsT = invoice.poids || invoice.tonnage || 0;
    // const poidsKg = invoice.poidsKg || (invoice.tonnage * 1000) || 0;
    //const tonageArrondi = Math.round(sortie.getTonage() * 1000.0) / 100.0;
    //const tonnageArrondi = invoice.tonnageArrondi || Math.round(poidsT * 10.0);
    //const tonnageArrondi = invoice.tonnageArrondi || Math.round(poidsT * 10.0 + 0.5);
    //const tonnageArrondi = invoice.tonnageArrondi || (poidsT % 1 === 0 ? poidsT : Math.ceil(poidsT));
    //const poidsAffichageKg = invoice.poidsKg || (invoice.tonnage * 1000)/100 || 0;

    //const tonnageArrondi = invoice.tonnageArrondi || (poidsAffichageKg % 2 === 0 ? poidsAffichageKg: Math.ceil(poidsAffichageKg));


    // Calcul de TOUS les paramètres (même ceux à zéro)
    let poidsT = 0;
    //const SoldepoidsT = invoice.poids || invoice.tonnageSolde || 0;
    let poidsKg = 0;
    let poidsAffichageKg = 0;

    if (invoice.typeFacture == 'Solde') {
        poidsT = invoice.tonnageSolde || 0;
        poidsKg = (invoice.tonnageSolde * 1000) || 0;
        poidsAffichageKg = (invoice.tonnageSolde * 1000) / 100 || 0;
    }
    else {
        poidsAffichageKg = invoice.poidsKg || (invoice.tonnage * 1000) / 100 || 0;
        poidsT = invoice.poids || invoice.tonnage || 0;
        poidsKg = invoice.poidsKg || (invoice.tonnage * 1000) || 0;
    }

    const tonnageArrondi = (invoice.typeFacture == 'Solde' && invoice.tonnageSoldeArrondi)
        ? invoice.tonnageSoldeArrondi
        : (invoice.tonnageArrondi || (poidsAffichageKg % 2 === 0 ? poidsAffichageKg : Math.ceil(poidsAffichageKg)));


    // Calcul de TOUS les tarifs unitaires
    //const tonageArrondi = Math.round(sortie.getTonage() * 1000.0) / 100.0;
    const tarifBarge = invoice.tarifBarge || (invoice.manutBateau / (poidsT || 1)) || 0;
    const tarifCamion = invoice.tarifCamion || (invoice.manutCamion / (poidsT || 1)) || 0;
    const surtaxeClt = invoice.surtaxeClt || (invoice.surtaxeColisLourd / (poidsKg || 1)) || 0;
    const fraisSrsp = invoice.fraisSrsp || (invoice.montSalissage / (poidsT || 1)) || 0;
    const fraisArrimage = invoice.fraisArrimage || (invoice.montArrimage / (poidsT || 1)) || 0;
    const nbrePalette = invoice.nbrePalette || (invoice.montPalette / 3627) || 0;
    const nbreEtiquette = invoice.nbreEtiquette || (invoice.montEtiquette / 3510) || 0;
    invoice.nbreColis = 1;

    // Déterminer si c'est du Gardiennage ou Magasinage
    const isGardiennage = invoice.typeConditionId === 'VE' || invoice.montGardienage > 0;

    // Fonction pour afficher TOUS les détails de calcul
    const renderCalculationDetails = (item) => {
        switch (item) {
            case 'manutBateau':
                return `${formatNumber(poidsT)} T × ${formatCurrency(invoice.tarifBarge)}`;
            case 'manutCamion':
                return `${formatNumber(poidsT)} T × ${formatCurrency(invoice.tarifCamion)}`;
            case 'surtaxeColisLourd':
                return `${formatNumber(poidsKg)} kg × ${formatCurrency(invoice.surtaxeClt)}`;
            case 'montSalissage':
                return `${formatNumber(poidsT)} T × ${formatCurrency(invoice.fraisSrsp)}`;
            case 'montArrimage':
                return `${formatNumber(poidsT)} T × ${formatCurrency(invoice.fraisArrimage)}`;
            case 'peage':
                return `Forfait`;
            case 'montRedev':
                return `Forfait`;
            case 'montPalette':
                return `${formatNumber(nbrePalette)} × 3 627`;
            case 'montPesMag':
                return `Forfait`;
            case 'montLais':
                return `Forfait`;
            case 'montEtiquette':
                return `${formatNumber(nbreEtiquette)} × 3 510`;
            case 'montMagasinage':
                const prixUnitaire = invoice.montMag37 || invoice.montMag || 0;

                if (isGardiennage) {
                    // GARDIENNAGE (Véhicules)
                    let details = '';
                    if ((invoice.montGardienage > 0 || invoice.montGardienage === 0) && invoice.duree > 0) {
                        details += `${formatNumber(invoice.nbreColis || 0)} × ${formatCurrency(invoice.montMag)} × ${invoice.duree || 0}j`;
                    }
                    if ((invoice.montGardienage37 > 0 || invoice.montGardienage37 === 0) && invoice.duree37 > 0) {
                        if (details) details += ' + ';
                        details += `${formatNumber(invoice.nbreColis || 0)} × ${formatCurrency(invoice.montGardienage37 / (invoice.nbreColis * invoice.duree37))} × ${invoice.duree37 || 0}j`;
                    }
                    return details || 'Gardiennage - Calcul basé sur nombre de colis';
                } else {
                    // MAGASINAGE (Autres marchandises) - Only base period
                    let details = '';
                    if ((invoice.montMagasinage > 0 || invoice.montMagasinage === 0) && invoice.duree > 0) {
                        details += `${formatCurrencyNumber(tonnageArrondi)} × ${formatCurrency(invoice.montMag)} × ${invoice.duree || 0}j`;
                    }
                    return details || 'Magasinage - Calcul basé sur tonnage';
                }
            case 'montTVA':
                const baseTVA = (invoice.montTotalManut || 0) - (invoice.montantReduction || 0) +
                    (isGardiennage ? (invoice.montGardienage || 0) : (invoice.montMagasinage || 0));
                return `(Total Manutention - Réduction + ${isGardiennage ? 'Gardiennage' : 'Magasinage'}) × 18%`;
            default:
                return 'Non applicable';
        }
    };

    // Fonction pour formater les valeurs (affiche même les zéros)
    const formatValue = (value, isCurrency = false) => {
        if (isCurrency) {
            return formatCurrency(value || 0);
        }
        return formatNumber(value || 0);
    };

    const formatValueDevise = (value, isCurrency = false) => {
        if (isCurrency) {
            return formatCurrencyDevise(value || 0);
        }
        return formatNumber(value || 0);
    };

    // Calcul du total manutention (sans gardiennage/magasinage et sans réduction)
    const calculateTotalManutention = () => {
        const manutentions = [
            invoice.manutBateau || 0,
            invoice.manutCamion || 0,
            invoice.surtaxeColisLourd || 0,
            invoice.montSalissage || 0,
            invoice.montArrimage || 0,
            invoice.peage || 0,
            invoice.montRedev || 0,
            invoice.montPalette || 0,
            invoice.montPesMag || 0,
            invoice.montLais || 0,
            invoice.montEtiquette || 0,
            invoice.montFixationPlaque || 0
        ];
        return manutentions.reduce((total, montant) => total + montant, 0);
    };

    const totalManutention = calculateTotalManutention();

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* En-tête */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>GLOBAL PORT SERVICE BURUNDI</Text>
                        <Text style={styles.companyDetails}>Avenue de la Tanzanie, BP: 6440 Bujumbura</Text>
                        <Text style={styles.companyDetails}>Tél: 22216810 </Text>
                        <Text style={styles.companyDetails}>NIF: 4000155053</Text>
                        <Text style={styles.companyDetails}>Centre Fiscal: DGC </Text>
                        <Text style={styles.companyDetails}>Assujetti TVA: Oui</Text>
                        <Text style={styles.companyDetails}>Secteur: Autres services marchands </Text>
                        <Text style={styles.companyDetails}>Forme: Société mixte</Text>

                    </View>

                    <View style={styles.headerCenter}>
                        <PdfLogo />
                    </View>

                    <View style={styles.headerRight}>
                        <Text style={{ fontSize: 7 }}>Date: {new Date().toLocaleDateString('fr-FR')}</Text>
                    </View>
                </View>

                {/* Titre - MODIFIÉ : FACTURE au lieu de FACTURE PROFORMA */}
                <Text style={styles.invoiceTitle}>
                    FACTURE {invoice.typeFacture || ''} N° {invoice.sortieId || invoice.numFacture || 'N/A'}
                </Text>

                {/* Informations Client et Vendeur */}
                <View style={styles.twoColumn}>
                    <View style={[styles.section, styles.column]}>
                        <Text style={styles.sectionTitle}>INFORMATIONS CLIENT</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Raison Sociale:</Text>
                            <Text style={styles.value}>{invoice.nomClient || invoice.nomImportateur || 'Non spécifié'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>NIF:</Text>
                            <Text style={styles.value}>{invoice.nif || 'Non spécifié'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Adresse:</Text>
                            <Text style={styles.value}>{invoice.adresse || 'Non spécifié'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Assujetti TVA:</Text>
                            <Text style={styles.value}>{invoice.exonere ? 'Non' : 'Oui'}</Text>
                        </View>
                    </View>

                    <View style={[styles.section, styles.column]}>
                        <Text style={styles.sectionTitle}>DÉTAILS MARCHANDISE</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Marchandise:</Text>
                            <Text style={styles.value}>{invoice.nomMarchandise || 'Non spécifié'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Type:</Text>
                            <Text style={[styles.value, styles.boldText]}>
                                {isGardiennage ? 'GARDIENNAGE (Véhicule)' : 'MAGASINAGE'}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>RSP / LT:</Text>
                            <Text style={styles.value}>{invoice.rsp || 'N/A'} / {invoice.lt || 'N/A'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Période:</Text>
                            <Text style={styles.value}>
                                {formatDate(invoice.dateEntree)} - {formatDate(invoice.dateSortie)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tableau des Prestations AVEC SÉPARATION */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={{ ...styles.headerCell, width: '40%' }}>PRESTATIONS</Text>
                        <Text style={{ ...styles.headerCell, width: '30%' }}>DÉTAILS DE CALCUL</Text>
                        <Text style={{ ...styles.headerCell, width: '30%' }}>MONTANT</Text>
                    </View>

                    {/* SECTION 1: MANUTENTIONS */}

                    {/* Manutention Bateau - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Manutention S/bateau</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('manutBateau')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.manutBateau === 0 || !invoice.manutBateau) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.manutBateau, true)}
                        </Text>
                    </View>

                    {/* Manutention Camion - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Manutention S/Camion</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('manutCamion')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.manutCamion === 0 || !invoice.manutCamion) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.manutCamion, true)}
                        </Text>
                    </View>

                    {/* Surtaxe Colis Lourd - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Surtaxe Colis Lourd</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('surtaxeColisLourd')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.surtaxeColisLourd === 0 || !invoice.surtaxeColisLourd) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.surtaxeColisLourd, true)}
                        </Text>
                    </View>

                    {/* Salissage - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Salissage</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('montSalissage')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.montSalissage === 0 || !invoice.montSalissage) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.montSalissage, true)}
                        </Text>
                    </View>

                    {/* Arrimage - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Arrimage</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('montArrimage')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.montArrimage === 0 || !invoice.montArrimage) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.montArrimage, true)}
                        </Text>
                    </View>

                    {/* Péage - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Péage</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('peage')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.peage === 0 || !invoice.peage) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.peage, true)}
                        </Text>
                    </View>

                    {/* Redevance Informatique - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Redevance Informatique</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('montRedev')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            ((invoice.montRedev === 0 || !invoice.montRedev) && invoice.montRedev !== 23395) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.montRedev || 23395, true)}
                        </Text>
                    </View>

                    {/* Palette - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Palette</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('montPalette')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.montPalette === 0 || !invoice.montPalette) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.montPalette, true)}
                        </Text>
                    </View>

                    {/* Pesée Magasin - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Pesée Magasin</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('montPesMag')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.montPesMag === 0 || !invoice.montPesMag) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.montPesMag, true)}
                        </Text>
                    </View>

                    {/* Laissez-suivre - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Laissez-suivre</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('montLais')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.montLais === 0 || !invoice.montLais) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.montLais, true)}
                        </Text>
                    </View>

                    {/* Etiquette - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Etiquette</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('montEtiquette')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.montEtiquette === 0 || !invoice.montEtiquette) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.montEtiquette, true)}
                        </Text>
                    </View>

                    {/* Fixation Plaque - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Fixation Plaque</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>Forfait</Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            (invoice.montFixationPlaque === 0 || !invoice.montFixationPlaque) && styles.zeroValue
                        ]}>
                            {formatValue(invoice.montFixationPlaque, true)}
                        </Text>
                    </View>

                    {/* SÉPARATEUR - TOTAL MANUTENTION */}
                    <View style={styles.separatorRow}>
                        <Text style={styles.separatorText}>TOTAL MANUTENTION</Text>
                    </View>

                    {/* Ligne Total Manutention */}
                    <View style={[styles.tableRow, { backgroundColor: '#ecf0f1' }]}>
                        <Text style={[styles.tableCell, { width: '40%' }, styles.boldText]}>Total Manutention</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }, styles.boldText]}>
                            Somme de toutes les manutentions ci-dessus
                        </Text>
                        <Text style={[styles.tableCell, { width: '30%' }, styles.boldText]}>
                            {formatValue(totalManutention, true)}
                        </Text>
                    </View>



                    {/* SÉPARATEUR - GARDIENNAGE/MAGASINAGE */}
                    <View style={styles.separatorRow}>
                        <Text style={styles.separatorText}>
                            {isGardiennage ? 'GARDIENNAGE' : 'MAGASINAGE'}
                        </Text>
                    </View>

                    {/* Gardiennage ou Magasinage - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>
                            {isGardiennage ? 'Gardiennage' : 'Magasinage'}
                        </Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>
                            {renderCalculationDetails('montMagasinage')}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            ((invoice.montMagasinage === 0 || !invoice.montMagasinage) &&
                                (invoice.montGardienage === 0 || !invoice.montGardienage)) && styles.zeroValue
                        ]}>
                            {formatValue(
                                isGardiennage ? invoice.montGardienage : invoice.montMagasinage,
                                true
                            )}
                        </Text>
                    </View>

                    {/* Gardiennage 37 ou Magasinage 37 - TOUJOURS AFFICHÉ */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>
                            {isGardiennage ? 'Gardiennage 37' : 'Magasinage 37'}
                        </Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>Période étendue</Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%' },
                            ((invoice.montMagasinage37 === 0 || !invoice.montMagasinage37) &&
                                (invoice.montGardienage37 === 0 || !invoice.montGardienage37)) && styles.zeroValue
                        ]}>
                            {formatValue(
                                isGardiennage ? invoice.montGardienage37 : invoice.montMagasinage37,
                                true
                            )}
                        </Text>
                    </View>



                    {/* SÉPARATEUR - RÉDUCTION */}
                    <View style={styles.separatorRow}>
                        <Text style={styles.separatorText}>RÉDUCTION</Text>
                    </View>

                    {/* Réduction - TOUJOURS AFFICHÉ */}
                    <View style={[styles.tableRow, { backgroundColor: '#f8f9fa' }]}>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Réduction</Text>
                        <Text style={[styles.calculationCell, { width: '30%' }]}>Remise appliquée</Text>
                        <Text style={[
                            styles.tableCell,
                            { width: '30%', color: '#e74c3c' },
                            (invoice.montantReduction === 0 || !invoice.montantReduction) && styles.zeroValue
                        ]}>
                            - {formatValue(invoice.montantReduction, true)}
                        </Text>
                    </View>
                </View>

                {/* Section Totaux COMPLÈTE */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.boldText}>Sous-total:</Text>
                        <Text>
                            {formatValue(
                                totalManutention +
                                (isGardiennage ? (invoice.montGardienage || 0) : (invoice.montMagasinage || 0)) +
                                (isGardiennage ? (invoice.montGardienage37 || 0) : (invoice.montMagasinage37 || 0)) -
                                (invoice.montantReduction || 0),
                                true
                            )}
                        </Text>
                    </View>

                    {/* TVA - TOUJOURS AFFICHÉ */}
                    <View style={styles.totalRow}>
                        <Text style={styles.boldText}>TVA (18%):</Text>
                        <Text style={(!invoice.montTVA || invoice.montTVA === 0) ? styles.zeroValue : {}}>
                            {formatValue(invoice.montTVA, true)}
                        </Text>
                    </View>

                    <View style={[styles.totalRow, { borderTop: '1px solid #2c3e50', paddingTop: 3 }]}>
                        <Text style={[styles.boldText, { fontSize: 9 }]}>MONTANT TOTAL À PAYER:</Text>
                        <Text style={[styles.boldText, { fontSize: 9, color: '#2c3e50' }]}>
                            {formatValue(invoice.montantPaye, true)}
                        </Text>
                    </View>

                    <View style={[styles.totalRow, { borderTop: '1px solid #2c3e50', paddingTop: 3 }]}>
                        <Text style={[styles.boldText, { fontSize: 9 }]}>MONTANT EN DOLLARS:</Text>
                        <Text style={[styles.boldText, { fontSize: 9, color: '#2c3e50' }]}>
                            {invoice.transit
                                ? formatValueDevise(invoice.montantPaye / invoice.montantDevise, true)
                                : formatValueDevise(0, true)
                            }
                        </Text>
                    </View>
                </View>

                {/* Montant en lettres */}
                <View style={styles.amountInWords}>
                      <Text>{invoice.FactureSignature}</Text>

                    <Text>Arrêtée la présente facture à la somme de: {montantTotalEnLettres}</Text>
                </View>

                {/* Signature et informations */}
                <View style={styles.signature}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 7 }}>Facturé par: {invoice.userValidation || 'Système'}</Text>
                        <Text style={{ fontSize: 7 }}>Le: {new Date().toLocaleDateString('fr-FR')}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 7, marginBottom: 10 }}>Pour GLOBAL PORT SERVICE BURUNDI</Text>

                    </View>
                </View>

                {/* Informations bancaires */}
                <View style={styles.bankInfo}>
                    <Text>BGF: 1502257311BIF | BANCOBU: 02198120102619BIF, 02198120201-68USB | </Text>
                    <Text>IBB: 701-087330-01-01BIF | BCB: 20073950009BIF, 20073950012USD | </Text>
                    <Text>FINBANK: 10031455011BIF, 10031455012USD</Text>
                </View>
            </Page>
        </Document>
    );
};