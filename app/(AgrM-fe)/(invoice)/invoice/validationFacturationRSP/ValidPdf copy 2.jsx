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
        marginTop: 2,
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
    },
    centeredHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #000',
        borderLeft: '1px solid #000',
        borderRight: '1px solid #000',
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    centeredHeaderText: {
        fontWeight: 'bold',
        fontSize: 11,
        textAlign: 'center',
        color: '#1e293b'
    },
    centeredMagasinDetail: {
        padding: 12,
        borderBottom: '1px solid #000',
        borderLeft: '1px solid #000',
        borderRight: '1px solid #000',
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        textAlign: 'center'
    },
    periodeText: {
        marginBottom: 2,
        fontWeight: 'bold',
        fontSize: 10,
        color: '#374151',
        textAlign: 'center'
    },
    calculLine: {
        marginBottom: 6,
        fontSize: 9,
        color: '#4b5563',
        textAlign: 'center',
        lineHeight: 1.4
    },
    calculResult: {
        fontWeight: 'bold',
        color: '#dc2626'
    },
    formuleContainer: {
        marginVertical: 6,
        padding: 4,
        backgroundColor: '#fef3c7',
        border: '0.5px solid #d97706',
        borderRadius: 2,
        width: '90%'
    },
    formuleTitle: {
        fontWeight: 'bold',
        fontSize: 8,
        color: '#92400e',
        marginBottom: 2,
        textAlign: 'center'
    },
    formuleText: {
        fontSize: 8,
        color: '#78350f',
        fontStyle: 'italic',
        textAlign: 'center'
    },
    separateur: {
        borderTop: '1px dashed #cbd5e1',
        marginVertical: 8,
        width: '80%'
    },
    noteMetier: {
        fontSize: 7,
        color: '#6b7280',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 4
    },
    // Nouveaux styles pour la section des calculs
    calculsSection: {
        marginTop: 10,
        border: '1px solid #000',
        width: '80%',
        alignSelf: 'center',
        backgroundColor: '#f8fafc'
    },
    calculsHeader: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderBottom: '1px solid #000',
        padding: 8
    },
    calculsHeaderText: {
        fontWeight: 'bold',
        fontSize: 11,
        textAlign: 'center',
        color: '#1e293b',
        width: '100%'
    },
    calculDetail: {
        flexDirection: 'row',
        borderBottom: '1px solid #e2e8f0',
        padding: 6
    },
    calculLabel: {
        width: '70%',
        padding: 4,
        fontSize: 9
    },
    calculValue: {
        width: '30%',
        padding: 4,
        fontSize: 9,
        textAlign: 'right',
        fontWeight: 'bold'
    },
    calculFormule: {
        width: '70%',
        padding: 4,
        fontSize: 8,
        color: '#64748b',
        fontStyle: 'italic'
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
        .replace(/BIF$/, ' ');
};

const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value || 0);
};

const formatNumberTonnage = (value) => {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,  // Changé de 0 à 2 pour afficher 2 décimales
        maximumFractionDigits: 0   // Changé de 0 à 2 pour afficher 2 décimales
    }).format(value || 0);
};

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

    if (reste >= 1000000000) {
        const milliards = Math.floor(reste / 1000000000);
        resultat += nombreEnLettres(milliards) + ' milliard' + (milliards > 1 ? 's' : '') + ' ';
        reste %= 1000000000;
    }

    if (reste >= 1000000) {
        const millions = Math.floor(reste / 1000000);
        resultat += nombreEnLettres(millions) + ' million' + (millions > 1 ? 's' : '') + ' ';
        reste %= 1000000;
    }

    if (reste >= 1000) {
        const milliers = Math.floor(reste / 1000);
        if (milliers === 1) {
            resultat += 'mille ';
        } else {
            resultat += nombreEnLettres(milliers) + ' mille ';
        }
        reste %= 1000;
    }

    if (reste >= 100) {
        const centaines = Math.floor(reste / 100);
        if (centaines === 1) {
            resultat += 'cent ';
        } else {
            resultat += unite[centaines] + ' cent ';
        }
        reste %= 100;
    }

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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
};

export const ValidPdf = ({ invoice }) => {
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

    // Si c'est un véhicule, on utilise le nombre de colis (comme dans le code Java)
    if (invoice.typeConditionId === 'VE') {
        finalTonnageArrondi = invoice.nbreColis || 0;
    }

    // LOGIQUE SPÉCIFIQUE PLEINEMENT ALIGNÉE AVEC LE CODE JAVA
    const isVehicule = invoice.typeConditionId === 'VE';
    // CALCUL DES MONTANTS SELON LA FORMULE : tonnage × (montPrixMagasin/duree) × duree
    const prixUnitaireMagasin = invoice.duree > 0 ? (invoice.montPrixMagasin || 0) / invoice.duree : 0;
    const prixUnitaireMagasin37 = invoice.duree37 > 0 ? (invoice.montPrixMagasin37 || 0) / invoice.duree37 : 0;

    // Calcul des montants totaux
    const montantMagasin = finalTonnageArrondi * prixUnitaireMagasin * (invoice.duree || 0);
    const montantMagasin37 = finalTonnageArrondi * prixUnitaireMagasin37 * (invoice.duree37 || 0);

    // Total selon la logique Java : pour les véhicules → gardiennage, sinon → magasinage
    const totalMagasinageGardiennage = montantMagasin + montantMagasin37;

    // Conversion du montant TVA en lettres
    const montTVAEnLettres = invoice.montantPaye
        ? nombreEnLettres(Math.floor(invoice.montantPaye)) + ' francs burundais'
        : 'zéro franc burundais';


    // CORRECTION : Récupération correcte des dates
    const dateDebut = invoice.dateEntree || invoice.dateEntreeMagasin;
    const dateSortie = invoice.dateSortie || invoice.dateValidation;
    const dateSupplement = invoice.dateSupplement;
    const dateDerniere = invoice.dateDerniereSortie || invoice.dateDerniere;

    //const dateDebut = invoice.dateEntree;
    //const dateSupplement = invoice.dateSupplement;
    //const dateDerniere = invoice.dateDerniere;

    console.log('Dates reçues:', {
        dateEntree: invoice.dateEntree,
        dateEntreeMagasin: invoice.dateEntreeMagasin,
        dateSortie: invoice.dateSortie,
        dateValidation: invoice.dateValidation,
        dateSupplement: invoice.dateSupplement,
        dateDerniereSortie: invoice.dateDerniereSortie,
        dateDerniere: invoice.dateDerniere
    });


    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start', fontSize: 10 }}>
                    <View style={{ textAlign: 'left' }}>
                        <Text style={styles.boldText}>A. IDENTIFICATION DU VENDEUR:</Text>
                        <Text>GLOBAL PORT SERVICE BURUNDI</Text>
                        <Text>NIF:4000155053</Text>
                        <Text>ADRESSE:Avenue de la Tanzanie</Text>
                        <Text>BP:6440 Bujumbura</Text>
                        <Text>TEL:22216810</Text>
                        <Text>ASSUJETTI TVA:Oui</Text>
                        <Text>CENTRE FISCALE: DGC</Text>
                        <Text>SECTEUR ACTIVITE:Autres services marchands</Text>
                        <Text>FORME JURIDIQUE:Societe mixte</Text>


                    </View>


                    <View>
                        <Text style={styles.boldText}>B. IDENTIFICATION DU CLIENT:</Text>
                        <Text>RAISON SOCIALE:{invoice.nomClient}</Text>
                        <Text>NIF:4000155053</Text>
                        <Text>ADRESSE:Avenue de la Tanzanie</Text>
                        <Text>Assujetti TVA:Oui</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <PdfLogo />
                    </View>
                </View>


                <View style={styles.espacement}>  </View>


                <View style={styles.section}>
                    <View style={{ textAlign: 'center' }}>
                        <Text style={styles.boldText}>Facture {invoice.typeFacture} No {invoice.sortieId} , le {new Date().toLocaleDateString('fr-FR')}</Text>
                        <Text>_____________________________________________</Text>
                    </View>

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
                                {formatCurrency(invoice.manutBateau / invoice.tarifBarge)}  × {formatCurrency(invoice.manutBateau / (invoice.manutBateau / invoice.tarifBarge))} = {formatCurrency(invoice.manutBateau)}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Manutention S/Camion</Text>
                            <Text style={styles.value}>
                                { /*formatNumberTonnage(finalTonnageArrondi)} × {formatCurrency(invoice.tarifCamion)} = {formatCurrency(invoice.manutCamion)*/}
                                {formatCurrency(invoice.manutCamion / invoice.tarifCamion)}  × {formatCurrency(invoice.manutCamion / (invoice.manutCamion / invoice.tarifCamion))} = {formatCurrency(invoice.manutCamion)}

                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Surtaxe Colis Lourd</Text>
                            <Text style={styles.value}>
                                {formatCurrency(invoice.surtaxeColisLourd / invoice.SurtaxeClt)}  × {formatCurrency(invoice.surtaxeColisLourd / (invoice.surtaxeColisLourd / invoice.SurtaxeClt))} = {formatCurrency(invoice.surtaxeColisLourd)}

                                {/*formatNumberTonnage(finalTonnageArrondi)} × {formatCurrency(invoice.SurtaxeClt)} = {formatCurrency(invoice.surtaxeColisLourd)*/}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Arrimage</Text>
                            <Text style={styles.value}>
                                {/*formatNumberTonnage(finalTonnageArrondi)} × {formatCurrency(invoice.fraisArrimage)} = {formatCurrency(invoice.montArrimage)*/}

                                {formatCurrency(invoice.montArrimage / invoice.fraisArrimage)}  × {formatCurrency(invoice.montArrimage / (invoice.montArrimage / invoice.fraisArrimage))} = {formatCurrency(invoice.montArrimage)}

                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Salissage</Text>
                            <Text style={styles.value}>
                                {/* {formatNumberTonnage(finalTonnageArrondi)} × {formatCurrency(invoice.fraisSrsp)} = {formatCurrency(invoice.montSalissage)}*/}

                                {formatCurrency(invoice.montSalissage / invoice.fraisSrsp)}  × {formatCurrency(invoice.montSalissage / (invoice.montSalissage / invoice.fraisSrsp))} = {formatCurrency(invoice.montSalissage)}


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

                                {formatCurrency(invoice.montPalette)}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Etiquete</Text>
                            <Text style={styles.value}>

                                {formatCurrency(invoice.montEtiquette)}
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

                        {/* SECTION MAGASINAGE 
                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.headerCell, width: '100%' }}> {isVehicule ? 'GARDINNAGE' : 'MAGASINAGE'}: {formatCurrency(totalMagasinageGardiennage)}</Text>
                        </View> */}
<View style={styles.centeredMagasinDetail}>
    <Text style={styles.periodeText}>
        {/* Condition basée sur la présence de dateSortie */}
        {invoice.dateSortie ? (
            <Text style={styles.periodeText}>
                Du {formatDate(invoice.dateEntree)} au {formatDate(invoice.dateSortie)}
            </Text>
        ) : invoice.dateSupplement ? (
            <Text style={styles.periodeText}>
                Du {formatDate(invoice.dateValidation)} au {formatDate(invoice.dateSupplement)}
            </Text>
        ) : invoice.dateDerniereSortie ? (
            <Text style={styles.periodeText}>
                Du {formatDate(invoice.dateValidation)} au {formatDate(invoice.dateDerniereSortie)}
            </Text>
        ) : (
            <Text style={styles.periodeText}>
                Du {formatDate(invoice.dateEntree)} au {formatDate(invoice.dateValidation)}
            </Text>
        )}
    </Text>

    {/* AFFICHAGE CORRIGÉ AVEC PRIX DYNAMIQUES */}
    {invoice.typeConditionId === 'VE' ? (
        // VÉHICULE - GARDIENAGE
        <>
            <Text style={styles.calculLine}>
                {formatNumber(finalTonnageArrondi)} véhicule(s) × {formatCurrency(invoice.montPrixMagasin || 0)} = {formatCurrency(invoice.montGardienage || 0)}
            </Text>
        </>
    ) : (
        // MARCHANDISE - MAGASINAGE
        <>
            {/* Vérification que les données détaillées existent */}
            {(invoice.montMagasin > 0 || invoice.montMagasin37 > 0) ? (
                <>
                    {/* Période normale - PRIX DYNAMIQUE */}
                    {invoice.montMagasin > 0 && invoice.duree > 0 && (
                        <Text style={styles.calculLine}>
                            Période normale: {formatNumber(finalTonnageArrondi)} T × {formatCurrency(invoice.montPrixMagasin || 0)} × {invoice.duree} Jours = {formatCurrency(invoice.montMagasin)}
                        </Text>
                    )}
                    
                    {/* Période étendue - PRIX DYNAMIQUE */}
                    {invoice.montMagasin37 > 0 && invoice.duree37 > 0 && (
                        <Text style={styles.calculLine}>
                            Période étendue: {formatNumber(finalTonnageArrondi)} T × {formatCurrency(invoice.montPrixMagasin37 || 0)} × {invoice.duree37} Jours = {formatCurrency(invoice.montMagasin37)}
                        </Text>
                    )}
                </>
            ) : (
                /* Fallback si les données détaillées ne sont pas disponibles */
                <Text style={styles.calculLine}>
                    Magasinage: {formatNumber(finalTonnageArrondi)} T × {invoice.duree + (invoice.duree37 || 0)} Jours = {formatCurrency(invoice.montMagasinage || 0)}
                </Text>
            )}
        </>
    )}

    <Text style={[styles.calculLine, styles.calculResult]}>
        TOTAL {invoice.typeConditionId === 'VE' ? 'GARDIENAGE' : 'MAGASINAGE'} = {formatCurrency(
            invoice.typeConditionId === 'VE' ? 
                (invoice.montGardienage || 0) : 
                (invoice.montMagasinage || 0)
        )}
    </Text>
</View>

                        { /*     
                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.headerCell, width: '100%' }}>Gardienage</Text>
                            <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                                {formatCurrency(invoice.montGardienage)}
                            </Text>
                        </View> */}

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

                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.headerCell, width: '100%' }}>Montant Devise</Text>
                            <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                                {/*formatCurrency(invoice.montantPaye1)*/}0.00 Dollars
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 2, flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <View style={{ textAlign: 'center' }}>
                        <View style={styles.tvaEnLettres}>
                            <Text>Nous disons: {montTVAEnLettres}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 2, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <View style={{ textAlign: 'center' }}>
                        <Text>Facturé par {invoice.UserValidation}</Text>
                    </View>
                </View>



                <View style={{ marginTop: 2, flexDirection: 'row', justifyContent: 'flex-start' }}>
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