import { Page, Text, View, Document, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 20,
        fontSize: 10,
        fontFamily: 'Helvetica'
    },
     headerLeft: {
        flex: 1,
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: '1px solid #000',
        paddingBottom: 10
    },
    row: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        borderLeft: '1px solid #000',
        borderRight: '1px solid #000'
    },
    label: {
        width: '60%',
        padding: 5,
        borderRight: '1px solid #000'
    },
     labelgras: {
        fontWeight: 'bold'
        
    },
    label1: {
        width: '60%',
        padding: 5,
    },
    value: {
        width: '40%',
        padding: 5
    },
    espacement: {
        padding: '3px'
    },
     boldText: {
        fontWeight: 'bold'
    },
    
    tableContainer: {
        marginTop: 10,
        border: '1px solid #000',
        width: '80%',
        alignSelf: 'center'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #000'
    },
    headerCell: {
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    calculationRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        borderLeft: '1px solid #000',
        borderRight: '1px solid #000',
        padding: 5
    },
    calculationCell: {
        width: '25%',
        textAlign: 'center'
    },
    calculationResultCell: {
        width: '25%',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    tvaEnLettres: {
        marginTop: 10,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    magasinDetail: {
        padding: 5,
        borderBottom: '1px solid #000',
        borderLeft: '1px solid #000',
        borderRight: '1px solid #000'
    }
});


const PdfLogo = () => (
    <View style={{ width: 110, height: 100, justifyContent: 'flex-end', backgroundColor: '#f0f0f0' }}>
        <Image
         src="/assets/images/logo.png"
         />
        
        
    </View>
);

const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'BIF',
        currencyDisplay: 'code',
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })
        .format(value || 0)
        .replace(/\s/g, ' ')
        .replace(/BIF$/, ' BIF');
};

const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value || 0);
};

// Fonction pour convertir un nombre en lettres
const nombreEnLettres = (nombre) => {
    if (nombre === 0) return 'zéro';
    
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

// Fonction pour formater une date au format JJ/MM/AAAA
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
};

export const ManutentionPDF = ({ invoice }) => {
    // Calcul du tonnage arrondi comme dans votre code Java
     const tonnage = invoice.tonnage || 0;
    const tonnageArrondi = Math.round(tonnage * 10 / 100) * 10;
    const dernierChiffre = tonnage * 10 % 10;
    
    // Ajustement du tonnage arrondi si nécessaire
    let finalTonnageArrondi = tonnageArrondi;
    if (dernierChiffre === 5) {
        const lastTwoDigits = (tonnage * 100) % 100;
        if (![45, 25, 5, 35, 15].includes(lastTwoDigits)) {
            finalTonnageArrondi = Math.floor(tonnage * 10);
        }
   }

    // Si c'est un véhicule, on utilise le nombre de colis
    if (invoice.typeConditionId === 'VE') {
        finalTonnageArrondi = invoice.nbreColis || 0;
   }

    // Conversion du montant TVA en lettres
    const montTVAEnLettres = invoice.montantPaye 
        ? nombreEnLettres(Math.floor(invoice.montantPaye)) + ' francs burundais'
        : 'zéro franc burundais';

    // Calcul des montants pour le détail du magasinage
    const montantMagasin = finalTonnageArrondi * (invoice.montMagasin || 0) * (invoice.duree || 0);
    const montantMagasin37 = finalTonnageArrondi * (invoice.montMagasin37 || 0) * (invoice.duree37 || 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start', fontSize: 10 }}>
                    <View style={{ textAlign: 'left' }}>
                        <Text style={styles.boldText}>A. IDENTIFICATION DU VENDEUR:</Text>
                        <Text>RAISON SOCIALE:Global PORT SERVICE BURUNDI</Text>
                        <Text>NIF:4000155053</Text>
                        <Text>ADRESSE:Avenue de la Tanzanie</Text>
                        <Text>BP:6440 Bujumbura</Text>
                        <Text>TEL:22216810</Text>
                        <Text>ASSUJETTI TVA:Oui</Text>
                        <Text>CENTRE FISCALE: DGC</Text>
                        <Text>SECTEUR ACTIVITE:Autres services marchands</Text>
                        <Text>FORME JURIDIQUE:Societe mixte</Text>
                        <View style={styles.espacement}>  </View>
                        <Text style={styles.boldText}>A. IDENTIFICATION DU CLIENT:</Text>
                        <Text>RAISON SOCIALE:{invoice.nomClient}</Text>
                        <Text>NIF:{invoice.nif}</Text>
                        <Text>ADRESSE:Avenue de la Tanzanie</Text>
                        <Text>Assujetti TVA:Oui</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <PdfLogo />
                    </View>
                </View>
                <View style={styles.espacement}>  </View>
                <View style={styles.espacement}>  </View>
                <View style={styles.espacement}>  </View>
               
                <View style={styles.section}>
                    <View style={{ textAlign: 'center' }}>
                        <Text>Facture Proforma No {invoice.sortieId} , le {new Date().toLocaleDateString('fr-FR')}</Text>
                        <Text>_____________________________________________</Text>
                    </View>
                    <View style={styles.espacement}>  </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.label1}>Marchandise:{invoice.nomMarchandise}</Text>
                        <Text style={styles.label1}>RSP:{invoice.rsp}  LT:{invoice.rsp}</Text>
                    </View>

                    <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.headerCell, width: '100%' }}>Menutention</Text>
                        </View>

                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.headerCell, width: '60%' }}>Désignation</Text>
                            <Text style={{ ...styles.headerCell, width: '40%' }}>Montant</Text>
                        </View>

                        <View style={styles.row}>
                        <Text style={styles.label}>Manutention S/bateau</Text>
                        <Text style={styles.value}>
                            {formatCurrency(invoice.manutBateau)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Manutention S/Camion</Text>
                        <Text style={styles.value}>
                            {formatCurrency(invoice.manutCamion)}    </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Surtaxe Colis Lourd</Text>
                        <Text style={styles.value}>
                            {formatCurrency(invoice.surtaxeColisLourd)} </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Arrimage</Text>
                        <Text style={styles.value}>
                            {formatCurrency(invoice.montArrimage)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Salissage</Text>
                        <Text style={styles.value}>
                            {formatCurrency(invoice.montSalissage)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Pesage</Text>
                        <Text style={styles.value}>
                            {formatCurrency(invoice.montPesMag)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Peage</Text>
                        <Text style={styles.value}>

                            {formatCurrency(invoice.peage)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Montant Redevance</Text>
                        <Text style={styles.value}>
                            {formatCurrency(invoice.montRedev)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Palette</Text>
                        <Text style={styles.value}>
                            {invoice.montPalette?.toLocaleString('fr-FR', { style: 'currency', currency: 'BIF' })}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Laissez-suivre</Text>
                        <Text style={styles.value}>
                            {formatCurrency(invoice.montLais)}
                        </Text>

                    </View>

                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.headerCell, width: '100%' }}>Total Manutention</Text>
                            <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                                {formatCurrency(invoice.montTotalManut)}
                            </Text>
                        </View>

                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.headerCell, width: '100%' }}>Montant Reduction</Text>
                            <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                                {formatCurrency(invoice.montantReduction)}
                            </Text>
                        </View>

                        {/* Détails du calcul du magasinage 
                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.headerCell, width: '100%' }}>Détails Calcul Magasinage</Text>
                        </View>

                        <View style={styles.magasinDetail}>
                            <Text>Du {formatDate(invoice.dateCreation)} au {formatDate(invoice.dateValidation)}</Text>
                            <Text>Magasin: Tonnage({formatNumber(finalTonnageArrondi)}) * Prix unitaire({formatNumber(invoice.montMagasin)}) * Jours({invoice.duree || 0}) = {formatCurrency(montantMagasin)}</Text>
                             <Text>Magasin37: Tonnage({formatNumber(finalTonnageArrondi)}) * Prix unitaire({formatNumber(invoice.montMagasin37)}) * Jours({invoice.duree37 || 0}) = {formatCurrency(montantMagasin37)}</Text>
                        
                        </View>
                              */}
                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.headerCell, width: '100%' }}>Magasinage</Text>
                            <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                                {formatCurrency(invoice.montMagasinage)}
                            </Text>
                        </View>

                      <View style={styles.tableHeader}>
                        <Text style={{ ...styles.headerCell, width: '100%' }}>Gardienage</Text>
                        <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                            {formatCurrency(invoice.montGardienage)}
                        </Text>
                    </View>

                    <View style={styles.tableHeader}>
                        <Text style={{ ...styles.headerCell, width: '100%' }}>TVA</Text>
                        <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                            {formatCurrency(invoice.montTVA)}
                        </Text>
                    </View>

                  
                    <View style={styles.tableHeader}>
                        <Text style={{ ...styles.headerCell, width: '100%' }}>Montant total à Payer</Text>
                        <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                            {formatCurrency(invoice.montantPaye)}
                        </Text>
                    </View>

                </View>
                    
                </View>

                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <View style={{ textAlign: 'center' }}>
                         {/* Texte TVA en lettres */}
                    <View style={styles.tvaEnLettres}>
                        <Text>Nous disons: {montTVAEnLettres}</Text>
                    </View>

                        
                    </View>
                </View>

            <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <View style={{ textAlign: 'center' }}>
                        <Text>Facturé: {invoice.userCreation}</Text>
                        
                    </View>
                </View>

                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <View style={{ textAlign: 'center' }}>
                        
                        <Text>_____________________________________________________________________________________________</Text>
                        <Text>Cpte BGF no 1502257311BIF, Cpte Bancobu no O2198120102619BIF,cpte Bancobu no 02198120201-68USB,</Text>
                        <Text>Cpte IBB no 701-087330-01-01BIF, Cpte BCB no 20073950009BIF, cpte BCB no 20073950012USD,</Text>
                        <Text>Cpte Finbank no 10031455011BIF, Cpte Finbank no 10031455012USD,</Text>
           
           
                    </View>
                </View>
            </Page>
        </Document>
    );
};