import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 20,
        fontSize: 12,
        fontFamily: 'Helvetica'
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
    value: {
        width: '40%',
        padding: 5
    },
    espacement: {
        padding: '3px'
    },
    section: {
        marginBottom: 20
    },
    tableContainer: {
        marginTop: 10,
        border: '1px solid #000',
        width: '80%',
        alignSelf: 'center',
        fontSize: 9
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
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #000',
        fontWeight: 'bold'
    },
    
     headerRight: {
        flex: 1,
        alignItems: 'flex-end'
    },
  
    tvaEnLettres: {
        marginTop: 10,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    logo: {
        width: 100,
        height: 50,
        marginBottom: 10,
        justifyContent: 'flex-end'
    }
});



const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'BIF',
        minimumFractionDigits: 0
    }).format(value || 0);
};

const PdfLogo = () => (
    <View style={{ width: 110, height: 100, justifyContent: 'flex-end', backgroundColor: '#f0f0f0' }}>
        <Image
         src="/assets/images/logo.png"
         />     
    </View>
);

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

export const FacServicePrestePdf = ({ service }) => {

       // Conversion du montant TVA en lettres
    const montTVAEnLettres = (service.montant || 0) + 
                                (service.peage || 0) + 
                                (service.pesage || 0) + 
                                (service.montTaxe || 0) + 
                                (service.montRedev || 0)
        ? nombreEnLettres(Math.floor((service.montant || 0) + 
                                (service.peage || 0) + 
                                (service.pesage || 0) + 
                                (service.montTaxe || 0) + 
                                (service.montRedev || 0))) + ' francs burundais'
        : 'zéro franc burundais';
       return (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ marginTop: 10, flexDirection: 'column', fontSize: 9 }}>
                    <Text>A. IDENTIFICATION DU VENDEUR</Text>
                    <Text>RAISON SOCIALE: Global PORT SERVICE BURUNDI</Text>
                    <Text>NIF: 4000155053</Text>
                    <Text>ADRESSE: Avenue de la Tanzanie</Text>
                    <Text>BP: 6440 Bujumbura</Text>
                    <Text>TEL: 22216810</Text>
                    <Text>ASSUJETTI TVA: Oui</Text>
                    <Text>CENTRE FISCALE: DGC</Text>
                    <Text>SECTEUR ACTIVITE: Autres services marchands</Text>
                    <Text>FORME JURIDIQUE: Société mixte</Text>
                </View>
                <View style={styles.headerRight}>
                        <PdfLogo />
                    </View>
            </View>

            <View style={styles.espacement}></View>
            
            <View style={{ marginTop: 10, flexDirection: 'column', fontSize: 9 }}>
                <Text>A. IDENTIFICATION DU CLIENT</Text>
                <Text>RAISON SOCIALE: {service.declarant || 'Non spécifié'}</Text>
                <Text>NIF: Non spécifié</Text>
                <Text>ADRESSE: Non spécifié</Text>
                <Text>Assujetti TVA: Oui</Text>
            </View>

            <View style={styles.section}>
                <View style={{ textAlign: 'center', marginTop: 20,fontSize: 9  }}>
                    <Text>Facture Service No {service.numFacture}, le {new Date().toLocaleDateString('fr-FR')}</Text>
                    <Text>_____________________________________________</Text>
                </View>

                <View style={{ alignItems: 'center', marginTop: 10,fontSize: 9  }}>
                    <Text style={{ fontWeight: 'bold' }}>Lettre de Transport: {service.lettreTransp || 'Non spécifié'}</Text>
                    <Text style={{ fontWeight: 'bold' }}>Type Véhicule: {service.typeVehicule || 'Non spécifié'}</Text>
                </View>

                <View style={styles.tableContainer }>
                    <View style={styles.tableHeader}>
                        <Text style={{ ...styles.headerCell, width: '60%' }}>Désignation</Text>
                        <Text style={{ ...styles.headerCell, width: '40%' }}>Montant</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Numéro Facture</Text>
                        <Text style={styles.value}>{service.numFacture}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Lettre de Transport</Text>
                        <Text style={styles.value}>{service.lettreTransp || '-'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Date</Text>
                        <Text style={styles.value}>
                            {service.date ? new Date(service.date).toLocaleDateString('fr-FR') : '-'}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Montant</Text>
                        <Text style={styles.value}>{formatCurrency(service.montant)}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Péage</Text>
                        <Text style={styles.value}>{formatCurrency(service.peage)}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Pesage</Text>
                        <Text style={styles.value}>{formatCurrency(service.pesage)}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Exonéré de taxe</Text>
                        <Text style={styles.value}>{service.taxe ? 'Oui' : 'Non'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Montant Taxe</Text>
                        <Text style={styles.value}>{formatCurrency(service.montTaxe)}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Montant Redevance</Text>
                        <Text style={styles.value}>{formatCurrency(service.montRedev)}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Taux</Text>
                        <Text style={styles.value}>{service.taux || '-'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Montant Devise</Text>
                        <Text style={styles.value}>{formatCurrency(service.montantDevise)}</Text>
                    </View>

                    <View style={styles.totalRow}>
                        <Text style={{ ...styles.label, fontWeight: 'bold' }}>TOTAL</Text>
                        <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                            {formatCurrency(
                                (service.montant || 0) + 
                                (service.peage || 0) + 
                                (service.pesage || 0) + 
                                (service.montTaxe || 0) + 
                                (service.montRedev || 0)
                            )}
                        </Text>
                    </View>
                </View>
            </View>

      <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start' ,alignContent:'center'}}>
                    <View style={{ textAlign: 'center',fontSize: 9 }}>
                         {/* Texte TVA en lettres */}
                    <View style={styles.tvaEnLettres}>
                        <Text>Nous disons: {montTVAEnLettres}</Text>
                    </View>

                        
                    </View>
                </View>

            

                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <View style={{ textAlign: 'center',fontSize: 9 }}>
                        
                        <Text>_______________________________________________________________________________________</Text>
                        <Text>Cpte BGF no 1502257311BIF, Cpte Bancobu no O2198120102619BIF,cpte Bancobu no 02198120201-68USB,</Text>
                        <Text>Cpte IBB no 701-087330-01-01BIF, Cpte BCB no 20073950009BIF, cpte BCB no 20073950012USD,</Text>
                        <Text>Cpte Finbank no 10031455011BIF, Cpte Finbank no 10031455012USD,</Text>
           
           
                    </View>
                </View>
            </Page>
        </Document>
);
};