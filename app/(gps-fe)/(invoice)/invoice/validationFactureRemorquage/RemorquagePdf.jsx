import { Page, Text, View, Document, StyleSheet,Image, PDFViewer } from '@react-pdf/renderer';
import React from 'react';
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
        borderBottom: '1px solid #eee',
        padding: 5,
        marginLeft: 50
    },
    label: {
        width: '40%',
        fontWeight: 'bold'
    },
    totalRow: {
    flexDirection: 'row',
    borderTop: '1px solid #000',
    padding: 5,
    marginLeft: 50,
    fontWeight: 'bold'
  },
  
    tvaEnLettres: {
        marginTop: 10,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    value: {
        width: '60%'
    },
     headerRight: {
        flex: 1,
        alignItems: 'flex-end'
    },
    
     boldText: {
        fontWeight: 'bold'
    },
    espacement: {
        padding: '3px'
    },
    section: {
        marginBottom: 10
    }
});

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
        .replace(/\s/g, ' ') // S'assurer que ce sont des espaces normaux
        .replace(/BIF$/, ' BIF'); // Ajouter un espace avant la devise
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR');
    } catch {
        return '-';
    }
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

export const RemorquagePdf = ({ remorquage, isProforma = false }) => {
        // Conversion du montant total en lettres
    const montTotalEnLettres = remorquage.montant + remorquage.montantRedev + remorquage.montRedevTaxe + remorquage.montTVA
        ? nombreEnLettres(Math.floor(remorquage.montant + remorquage.montantRedev + remorquage.montRedevTaxe + remorquage.montTVA)) + ' francs burundais'
        : 'zéro franc burundais';
       return (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start', fontSize: 9 }}>
                <View style={{ textAlign: 'left' }}>
                    <Text style={styles.boldText}>A. IDENTIFICATION DU VENDEUR</Text>
                    <Text>RAISON SOCIALE: Global PORT SERVICE BURUNDI</Text>
                    <Text>NIF: 4000155053</Text>
                    <Text>ADRESSE: Avenue de la Tanzanie</Text>
                    <Text>BP: 6440 Bujumbura</Text>
                    <Text>TEL: 22216810</Text>
                    <Text>ASSUJETTI TVA: Oui</Text>
                    <Text>CENTRE FISCALE: DGC</Text>
                    <Text>SECTEUR ACTIVITE: Autres services marchands</Text>
                    <Text>FORME JURIDIQUE: Société mixte</Text>
                    <View style={styles.espacement}></View>
                    <Text style={styles.boldText}>B. IDENTIFICATION DU CLIENT:</Text>
                    <Text>RAISON SOCIALE: {remorquage.nomImportateur}</Text>
                    <Text>NIF: </Text>
                    <Text>ADRESSE:</Text>
                    <Text>Assujetti TVA: Oui</Text>
                </View>

                <View style={styles.headerRight}>
                        <PdfLogo />
                    </View>
            </View>
            
            <View style={styles.espacement}></View>
            <View style={styles.espacement}></View>
            <View style={styles.espacement}></View>
            <View style={styles.espacement}></View>
            
            <View style={styles.section}>
                <View style={{ textAlign: 'center' , fontSize: 9 }}>
                    <Text>{isProforma ? 'Facture Proforma Remorquage' : 'Facture Remorquage'} No {remorquage.noRemorque}, le {new Date().toLocaleDateString('fr-FR')}</Text>
                    <Text>_____________________________________________</Text>
                </View>
                
                <View style={styles.espacement}></View>
                <View style={{ alignItems: 'center' , fontSize: 9 }}>
                    <Text style={styles.label}>Importateur: {remorquage.nomImportateur}</Text>
                    <Text style={styles.label}>Lettre de Transport: {remorquage.lettreTransp}</Text>
                    <Text style={styles.label}>Barge: {remorquage.nomBarge}</Text>
                </View>
                
                <View style={styles.espacement}></View>
                <View style={styles.espacement}></View>
                <View style={styles.espacement}></View>
                
                <View style={{ alignItems: 'center', fontSize: 9 }}>      
                    <View style={styles.row}>
                        <Text style={styles.label}>Numéro Remorquage:</Text>
                        <Text style={styles.value}>{remorquage.noRemorque}</Text>
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.label}>Date Début:</Text>
                        <Text style={styles.value}>{formatDate(remorquage.dateDebut) || '-'}</Text>
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.label}>Date Fin:</Text>
                        <Text style={styles.value}>{formatDate(remorquage.dateFin) || '-'}</Text>
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.label}>Montant:</Text>
                        <Text style={styles.value}>
                            {formatCurrency(remorquage.montant)}
                        </Text>
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.label}>Redevance:</Text>
                        <Text style={styles.value}>
                            {formatCurrency(remorquage.montantRedev)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>TVA Redev:</Text>
                        <Text style={styles.value}>
                            {formatCurrency(remorquage.montRedevTaxe)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>TVA:</Text>
                        <Text style={styles.value}>
                            {formatCurrency(remorquage.montTVA)}
                        </Text>
                    </View>
                               {/* Ligne du total */}
          <View style={styles.totalRow}>
            <Text style={styles.label}>TOTAL:</Text>
            <Text style={styles.value}>{formatCurrency(remorquage.montant + remorquage.montantRedev + remorquage.montRedevTaxe + remorquage.montTVA)}</Text>
          </View>
                </View>
            </View>
            
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start' ,alignContent:'center'}}>
                    <View style={{ textAlign: 'center',fontSize: 9 }}>
                         {/* Texte total en lettres */}
                    <View style={styles.tvaEnLettres}>
                        <Text>Nous disons: {montTotalEnLettres}</Text>
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

                {/* Signature électronique OBR */}
                {remorquage.factureSignature && (
                    <View style={{ marginTop: 20, textAlign: 'center', fontSize: 8 }}>
                        <Text style={{ fontWeight: 'bold' }}>Signature Électronique OBR:</Text>
                        <Text style={{ marginTop: 5 }}>{remorquage.factureSignature}</Text>
                    </View>
                )}
            </Page>
        </Document>
);
};