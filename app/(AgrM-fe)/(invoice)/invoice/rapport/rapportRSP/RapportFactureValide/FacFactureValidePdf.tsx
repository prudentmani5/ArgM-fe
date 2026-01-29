// FacFactureValidePdf.tsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { FacFactureValide } from './FacFactureValide';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 9,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff'
    },
    header: {
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#3498db',
        borderBottomStyle: 'solid'
    },
    companyInfo: {
        marginBottom: 15
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 5
    },
    companyDetails: {
        fontSize: 9,
        color: '#7f8c8d',
        marginBottom: 2
    },
    reportTitleContainer: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 4,
        marginTop: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#3498db',
        borderLeftStyle: 'solid'
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center'
    },
    reportSubtitle: {
        fontSize: 11,
        color: '#7f8c8d',
        textAlign: 'center',
        marginTop: 5
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderStyle: 'solid'
    },
    infoBox: {
        flex: 1
    },
    infoLabel: {
        fontSize: 9,
        color: '#6c757d',
        marginBottom: 3,
        fontWeight: 'bold'
    },
    infoValue: {
        fontSize: 10,
        color: '#2c3e50',
        fontWeight: 'normal'
    },
    tableContainer: {
        width: '100%',
        marginBottom: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderStyle: 'solid',
        borderRadius: 5,
        overflow: 'hidden'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    tableHeader: {
        backgroundColor: '#2c3e50',
        flexDirection: 'row',
        paddingVertical: 8
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        borderTopStyle: 'solid',
        paddingVertical: 6
    },
    tableRowAlternate: {
        backgroundColor: '#f8f9fa'
    },
    tableColHeader: {
        width: '14%',
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontWeight: 'bold',
        color: '#ffffff',
        fontSize: 8,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#4a6572',
        borderRightStyle: 'solid'
    },
    tableColHeaderLarge: {
        width: '18%',
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontWeight: 'bold',
        color: '#ffffff',
        fontSize: 8,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#4a6572',
        borderRightStyle: 'solid'
    },
    tableColHeaderNoBorder: {
        width: '14%',
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontWeight: 'bold',
        color: '#ffffff',
        fontSize: 8,
        textAlign: 'center'
    },
    tableCol: {
        width: '14%',
        paddingHorizontal: 8,
        paddingVertical: 5,
        fontSize: 8,
        textAlign: 'center',
        color: '#495057',
        borderRightWidth: 1,
        borderRightColor: '#e9ecef',
        borderRightStyle: 'solid'
    },
    tableColLarge: {
        width: '18%',
        paddingHorizontal: 8,
        paddingVertical: 5,
        fontSize: 8,
        textAlign: 'center',
        color: '#495057',
        borderRightWidth: 1,
        borderRightColor: '#e9ecef',
        borderRightStyle: 'solid'
    },
    tableColNoBorder: {
        width: '14%',
        paddingHorizontal: 8,
        paddingVertical: 5,
        fontSize: 8,
        textAlign: 'center',
        color: '#495057'
    },
    totalsSection: {
        marginTop: 25,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderStyle: 'solid'
    },
    totalsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#3498db',
        borderBottomStyle: 'solid'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingVertical: 4
    },
    totalLabel: {
        fontSize: 10,
        color: '#495057',
        fontWeight: 'bold'
    },
    totalValue: {
        fontSize: 10,
        color: '#2c3e50',
        fontWeight: 'bold'
    },
    totalAmount: {
        fontSize: 11,
        color: '#27ae60',
        fontWeight: 'bold'
    },
    summaryBox: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#e8f4fc',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d1ecf1',
        borderStyle: 'solid'
    },
    summaryText: {
        fontSize: 9,
        color: '#0c5460',
        textAlign: 'center'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#6c757d',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        borderTopStyle: 'solid',
        paddingTop: 10
    },
    signatureSection: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
        borderTopStyle: 'dashed'
    },
    signatureBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    signatureLine: {
        width: '45%'
    },
    signatureText: {
        fontSize: 9,
        color: '#6c757d',
        marginBottom: 5
    },
    signatureArea: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ced4da',
        borderTopStyle: 'solid'
    },
    pageNumber: {
        position: 'absolute',
        bottom: 15,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#adb5bd'
    }
});

interface FacFactureValidePdfProps {
    data: FacFactureValide[];
    globalFilter: string;
}

const FacFactureValidePdf: React.FC<FacFactureValidePdfProps> = ({ data, globalFilter }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatCurrency = (value: number | null) => {
        if (value === null || value === undefined || isNaN(value)) return '- BIF';

        const formatted = new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);

        return `${formatted} BIF`;
    };

    const totals = {
        montantTotal: data.reduce((sum, item) => sum + (item.montantTotal || 0), 0),
        montantHorsTVA: data.reduce((sum, item) => sum + (item.montantHorsTVA || 0), 0),
        tva: data.reduce((sum, item) => sum + (item.tva || 0), 0)
    };

    const currentDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const reportDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* En-tête avec informations de l'entreprise */}
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>GLOBAL PORT SERVICES</Text>
                        <Text style={styles.companyDetails}>Port de </Text>
                        <Text style={styles.companyDetails}>Bujumbura, Burundi</Text>
                        <Text style={styles.companyDetails}>Tél: +257 22 00 00 00 | Email: contact@gps.bi</Text>
                    </View>

                    <View style={styles.reportTitleContainer}>
                        <Text style={styles.reportTitle}>RAPPORT DES FACTURES VALIDÉES</Text>
                        <Text style={styles.reportSubtitle}>Détail des factures validées par période</Text>
                    </View>
                </View>

                {/* Section d'informations du rapport */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Date du rapport:</Text>
                        <Text style={styles.infoValue}>{reportDate}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Filtre appliqué:</Text>
                        <Text style={styles.infoValue}>{globalFilter || 'Aucun filtre'}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Nombre de factures:</Text>
                        <Text style={styles.infoValue}>{data.length}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Référence:</Text>
                        <Text style={styles.infoValue}>RPTVAL-{Date.now().toString().slice(-6)}</Text>
                    </View>
                </View>

                {/* Tableau des données avec bordures complètes */}
                <View style={styles.tableContainer}>
                    <View style={styles.table}>
                        {/* En-têtes du tableau */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableColHeader}>N° FACTURE</Text>
                            <Text style={styles.tableColHeaderLarge}>CLIENT</Text>
                            <Text style={styles.tableColHeaderLarge}>MARCHANDISE</Text>
                            <Text style={styles.tableColHeader}>HTVA</Text>
                            <Text style={styles.tableColHeader}>TVA</Text>
                            <Text style={styles.tableColHeader}>TOTAL</Text>
                            <Text style={styles.tableColHeaderNoBorder}>VALIDÉ PAR</Text>
                        </View>

                        {/* Données du tableau */}
                        {data.map((item, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.tableRow,
                                    idx % 2 === 0 ? styles.tableRowAlternate : {}
                                ]}
                            >
                                <Text style={styles.tableCol}>{item.numFacture || '-'}</Text>
                                <Text style={styles.tableColLarge}>{item.nomClient || '-'}</Text>
                                <Text style={styles.tableColLarge}>{item.nomMarchandise || '-'}</Text>
                                <Text style={styles.tableCol}>{formatCurrency(item.montantHorsTVA)}</Text>
                                <Text style={styles.tableCol}>{formatCurrency(item.tva)}</Text>
                                <Text style={styles.tableCol}>{formatCurrency(item.montantTotal)}</Text>
                                <Text style={styles.tableColNoBorder}>{item.userValidation || '-'}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Section des totaux */}
                <View style={styles.totalsSection}>
                    <Text style={styles.totalsTitle}>RÉCAPITULATIF DES MONTANTS</Text>

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Montant TTC:</Text>
                        <Text style={[styles.totalValue, styles.totalAmount]}>
                            {formatCurrency(totals.montantTotal)}
                        </Text>
                    </View>

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total HTVA:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totals.montantHorsTVA)}</Text>
                    </View>

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total TVA:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totals.tva)}</Text>
                    </View>

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Nombre total de factures validées:</Text>
                        <Text style={styles.totalValue}>{data.length}</Text>
                    </View>
                </View>

                {/* Boîte de résumé */}
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>
                        Rapport généré le {currentDate} | Montant total des factures validées: {formatCurrency(totals.montantTotal)}
                    </Text>
                </View>

                {/* Section de signature */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine}>
                            <Text style={styles.signatureText}>Responsable Financier</Text>
                            <View style={styles.signatureArea}>
                                <Text style={styles.signatureText}>Signature et cachet</Text>
                            </View>
                        </View>

                        <View style={styles.signatureLine}>
                            <Text style={styles.signatureText}>Directeur Général</Text>
                            <View style={styles.signatureArea}>
                                <Text style={styles.signatureText}>Signature et cachet</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Pied de page */}
                <View style={styles.footer}>
                    <Text>Document généré automatiquement par le système de gestion GPS - Confidentialité: Interne</Text>
                </View>

                {/* Numéro de page */}
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `Page ${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};

export default FacFactureValidePdf;
