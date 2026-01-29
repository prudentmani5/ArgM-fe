import { Page, Text, View, Document, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 20,
        fontSize: 9,
        fontFamily: 'Helvetica'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottom: '1px solid #000',
        paddingBottom: 6
    },
    section: {
        marginBottom: 8
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
        backgroundColor: '#f0f0f0',
        padding: 3
    },
    table: {
        width: '100%',
        border: '1px solid #000'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold'
    },
    tableCell: {
        padding: 3,
        borderRight: '1px solid #000',
        flex: 1
    },
    tableCellLast: {
        padding: 3,
        flex: 1
    },
    tableHeaderCell: {
        padding: 3,
        borderRight: '1px solid #000',
        flex: 1,
        fontWeight: 'bold'
    },
    tableHeaderCellLast: {
        padding: 3,
        flex: 1,
        fontWeight: 'bold'
    },
    companyInfo: {
        marginBottom: 8
    },
    clientInfo: {
        marginBottom: 8
    },
    totalSection: {
        marginTop: 6,
        padding: 6,
        border: '1px solid #000',
        backgroundColor: '#f9f9f9'
    },
    signatureSection: {
        marginTop: 6,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    signatureBox: {
        width: '45%',
        alignItems: 'center'
    },
    divider: {
        borderBottom: '1px solid #000',
        marginVertical: 4
    },
    espacement: {
        marginTop: 6
    },
    headerRight: {
        alignItems: 'flex-end'
    },
    // Nouveau style pour le titre centré
    centeredTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 10
    }

    ,

    centeredTitleBas: {
        textAlign: 'center',
        //fontWeight: 'bold',
        //marginBottom: 15,
        fontSize: 11
    },
    bankInfo: {
        marginTop: 6,
        paddingTop: 3,
        borderTop: '1px solid #7f8c8d',
        fontSize: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#2c3e50',
    }
});

const PdfLogo = () => (
    <View style={{ width: 110, height: 100, justifyContent: 'flex-end', backgroundColor: '#f0f0f0' }}>
        <Image
            src="/assets/images/logo.png"
        />
    </View>
);

export const OtherInvoicePdf = ({ otherInvoice, importers = [] }) => {
    const paymentModes = [
        { label: 'Espèces', value: '1' },
        { label: 'Chèque', value: '2' },
        { label: 'Virement', value: '3' },
        { label: 'Carte Bancaire', value: '4' }
    ];

    // Nouvelle fonction basée sur le préfixe du numéro de facture
    const getImporterNameFromInvoiceId = () => {
        if (!otherInvoice.autreFactureId) return 'Non spécifié';
        
        const invoiceId = otherInvoice.autreFactureId.toString().toUpperCase();
        
        if (invoiceId.startsWith('B')) {
            return 'BUCECO';
        } else if (invoiceId.startsWith('G')) {
            return 'GREAT LAKES CEMENT';
        } else {
            return 'Non spécifié';
        }
    };

    // Ancienne fonction (gardée pour compatibilité)
    const getImporterName = (importerId) => {
        if (!importerId || !importers || importers.length === 0) return getImporterNameFromInvoiceId();
        const importer = importers.find(i => i.importateurId === importerId);
        return importer ? importer.nom : getImporterNameFromInvoiceId();
    };

    // Calculs des totaux selon le format de facture
    const totalManutention = (otherInvoice.qteBateau * otherInvoice.puBateau || 0) +
        (otherInvoice.qteSurtaxe * otherInvoice.puSurtaxe || 0) +
        (otherInvoice.qteSalissage * otherInvoice.puSalissage || 0);

    const totalPeagePesage = (otherInvoice.qtePeage * otherInvoice.puPeage || 0) +
        (otherInvoice.qtePeage * otherInvoice.redevPeage || 0);

    const totalGeneral = totalManutention + totalPeagePesage +
        (otherInvoice.redevance || 0);

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

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* En-tête de la facture */}
                <View style={styles.header}>
                    <View>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>GLOBAL PORT SERVICE BURUNDI</Text>
                        <Text>Avenue de la Tanzanie, Bujumbura</Text>
                        <Text>BP: 6440 Bujumbura</Text>
                        <Text>Tél: 22216810</Text>
                        <Text>NIF: 4000155053</Text>
                        <Text>ASSUJETTI TVA:Oui</Text>
                        <Text>CENTRE FISCALE: DGC</Text>
                        <Text>SECTEUR ACTIVITE:Autres services marchands</Text>
                        <Text>FORME JURIDIQUE:Societe mixte</Text>
                    </View>

                    <View>
                        <View style={styles.headerRight}>
                            <PdfLogo />
                        </View>
                    </View>

                    <View>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>FACTURE</Text>
                        <Text>N°: {otherInvoice.autreFactureId}</Text>
                        <Text>Date: {formatDate(otherInvoice.dateFacture)}</Text>
                        <Text>Réf: {otherInvoice.libelle || 'N/A'}</Text>
                    </View>
                </View>

                {/* Titre centré */}
                <View style={styles.centeredTitle}>
                    <Text>SERVICES PORTUAIRES POUR {otherInvoice.poidsPaye || 0} TONNES: CHARGEMENT DIRECT/{otherInvoice.nomBateau || 'N/A'}</Text>
                </View>

                {/* Informations client */}
                <View style={styles.clientInfo}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>CLIENT:</Text>
                    <Text>Nom: {getImporterNameFromInvoiceId()}</Text>
                    <Text>Bateau: {otherInvoice.nomBateau || 'N/A'}</Text>
                    <Text style={{ maxWidth: '100%' }}>Plaque: {otherInvoice.plaque ? otherInvoice.plaque.split('*').join(', ') : 'N/A'}</Text>
                </View>

                {/* Section 1: DETERMINATION DE POIDS A FACTURER */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. DETERMINATION DE POIDS A FACTURER</Text>
                    <View style={styles.table}>
                        {/* En-tête du tableau */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={styles.tableHeaderCell}>LOT</Text>
                            <Text style={styles.tableHeaderCell}>Poids payé</Text>
                            <Text style={styles.tableHeaderCell}>Poids pesé</Text>
                            <Text style={styles.tableHeaderCell}>Solde à remettre</Text>
                            <Text style={styles.tableHeaderCell}>Poids en cours de route</Text>
                            <Text style={styles.tableHeaderCellLast}>Solde à payer</Text>
                        </View>

                        {/* Ligne de données */}
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>{otherInvoice.lot}</Text>
                            <Text style={styles.tableCell}>{otherInvoice.poidsPaye || 0}</Text>
                            <Text style={styles.tableCell}>{otherInvoice.poidsPese || 0}</Text>
                            <Text style={styles.tableCell}>
                                {Math.max(0, (otherInvoice.poidsPese || 0) - (otherInvoice.poidsPaye || 0))}
                            </Text>
                            <Text style={styles.tableCell}>{otherInvoice.poidsRoute || 0}</Text>
                            <Text style={styles.tableCellLast}>{0}</Text>
                        </View>
                    </View>
                </View>

                {/* Section 2: MANUTENTION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. MANUTENTION</Text>
                    <View style={styles.table}>
                        {/* En-tête du tableau */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={styles.tableHeaderCell}>Libellé</Text>
                            <Text style={styles.tableHeaderCell}>Quantité</Text>
                            <Text style={styles.tableHeaderCell}>Prix unitaire</Text>
                            <Text style={styles.tableHeaderCellLast}>Prix total</Text>
                        </View>

                        {/* Ligne Bateau */}
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Bateau</Text>
                            <Text style={styles.tableCell}>{otherInvoice.qteBateau || 0}</Text>
                            <Text style={styles.tableCell}>{formatCurrency(otherInvoice.puBateau)}</Text>
                            <Text style={styles.tableCellLast}>
                                {formatCurrency((otherInvoice.qteBateau || 0) * (otherInvoice.puBateau || 0))}
                            </Text>
                        </View>

                        {/* Ligne Surtaxe Colis lourds/100kgs */}
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Surtaxe Colis lourds/100kgs</Text>
                            <Text style={styles.tableCell}>{otherInvoice.qteSurtaxe || 0}</Text>
                            <Text style={styles.tableCell}>{formatCurrency(otherInvoice.puSurtaxe)}</Text>
                            <Text style={styles.tableCellLast}>
                                {formatCurrency((otherInvoice.qteSurtaxe || 0) * (otherInvoice.puSurtaxe || 0))}
                            </Text>
                        </View>

                        {/* Ligne Salissage */}
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Salissage</Text>
                            <Text style={styles.tableCell}>{otherInvoice.qteSalissage || 0}</Text>
                            <Text style={styles.tableCell}>{formatCurrency(otherInvoice.puSalissage)}</Text>
                            <Text style={styles.tableCellLast}>
                                {formatCurrency((otherInvoice.qteSalissage || 0) * (otherInvoice.puSalissage || 0))}
                            </Text>
                        </View>

                        {/* Ligne Redevance Informatique */}
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Redevance Informatique</Text>
                            <Text style={styles.tableCell}>-</Text>
                            <Text style={styles.tableCell}>-</Text>
                            <Text style={styles.tableCellLast}>
                                {formatCurrency(otherInvoice.redevance)}
                            </Text>
                        </View>

                        {/* Total Manutention */}
                        <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
                            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>TOTAL 1</Text>
                            <Text style={styles.tableCell}>-</Text>
                            <Text style={styles.tableCell}>-</Text>
                            <Text style={[styles.tableCellLast, { fontWeight: 'bold' }]}>
                                {formatCurrency(totalManutention + (otherInvoice.redevance || 0))}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section 3: PEAGE & PESAGE */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. PEAGE & PESAGE</Text>
                    <View style={styles.table}>
                        {/* En-tête du tableau */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={styles.tableHeaderCell}>Libellé</Text>
                            <Text style={styles.tableHeaderCell}>Quantité</Text>
                            <Text style={styles.tableHeaderCell}>Prix unitaire</Text>
                            <Text style={styles.tableHeaderCellLast}>Prix total</Text>
                        </View>

                        {/* Ligne Peage & Pesage */}
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Peage & Pesage</Text>
                            <Text style={styles.tableCell}>{otherInvoice.qtePeage || 0}</Text>
                            <Text style={styles.tableCell}>{formatCurrency(otherInvoice.puPeage)}</Text>
                            <Text style={styles.tableCellLast}>
                                {formatCurrency((otherInvoice.qtePeage || 0) * (otherInvoice.puPeage || 0))}
                            </Text>
                        </View>

                        {/* Ligne Redevance Informatique */}
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Redevance Informatique</Text>
                            <Text style={styles.tableCell}>{otherInvoice.qtePeage || 0}</Text>
                            <Text style={styles.tableCell}>{formatCurrency(otherInvoice.redevPeage)}</Text>
                            <Text style={styles.tableCellLast}>
                                {formatCurrency((otherInvoice.qtePeage || 0) * (otherInvoice.redevPeage || 0))}
                            </Text>
                        </View>

                        {/* Total Peage & Pesage */}
                        <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
                            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>TOTAL 2</Text>
                            <Text style={styles.tableCell}>-</Text>
                            <Text style={styles.tableCell}>-</Text>
                            <Text style={[styles.tableCellLast, { fontWeight: 'bold' }]}>
                                {formatCurrency(totalPeagePesage)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Total Général */}
                <View style={styles.totalSection}>
                    <View style={[styles.tableRow, { justifyContent: 'space-between' }]}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>TOTAL GÉNÉRAL HTVA:</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{formatCurrency(totalGeneral)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <Text>Mode de paiement: {paymentModes.find(m => m.value === otherInvoice.modePayement)?.label || 'Non spécifié'}</Text>
                </View>

                <View style={styles.espacement}>
                   
                    <Text>Vous etes prié de presenter la lettre de transport au service facturation avant les procedures de chargement</Text>
                </View>


                    <View style={styles.centeredTitleBas}>
                       <Text> </Text>

                        <Text>Imprimé par:  </Text>
                    </View>

                {/* Signature de facture OBR */}
                {otherInvoice.factureSignature && (
                    <View style={{ marginTop: 10, marginBottom: 10, paddingTop: 5, borderTop: '1px solid #000' }}>
                        <Text style={{ fontSize: 8, textAlign: 'center', color: '#2c3e50' }}>
                            Signature de facture: {otherInvoice.factureSignature}
                        </Text>
                    </View>
                )}

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