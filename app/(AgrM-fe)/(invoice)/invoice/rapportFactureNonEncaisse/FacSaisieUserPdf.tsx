// FacSaisieUserPdf.tsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { FacSaisieUser } from './FacSaisieUser';

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
        marginBottom: 5,
        textAlign: "center"
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
    reportPeriod: {
        fontSize: 12,
        color: '#3498db',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: 'bold'
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
        paddingVertical: 6,
        minHeight: 40
    },
    tableRowAlternate: {
        backgroundColor: '#f8f9fa'
    },
    tableColHeaderBase: {
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
        borderRightWidth: 0
    },
    tableColBase: {
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
        borderRightWidth: 0
    },
    tableColWrap: {
        textAlign: 'left',
        flexWrap: 'wrap',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 40
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

interface FacSaisieUserPdfProps {
    data: FacSaisieUser[];
    globalFilter: string;
    startDate?: string;
    endDate?: string;
}

type ColumnType = 'small' | 'large' | 'wrap' | 'date';

interface ColumnConfig {
    key: keyof FacSaisieUser | 'factureId' | 'client' | 'declarant' | 'marchandise' | 'userId' | 'dateSaisie';
    label: string;
    width: string;
    type: ColumnType;
}

const FacSaisieUserPdf: React.FC<FacSaisieUserPdfProps> = ({
    data,
    globalFilter,
    startDate,
    endDate
}) => {
    const safeData = Array.isArray(data) ? data : [];

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

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatCurrency = (value: number | null) => {
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

    // Fonction simplifiee pour obtenir la periode
    const getPeriodText = () => {
        if (startDate && endDate) {
            return `Periode : Du ${formatDate(startDate)} au ${formatDate(endDate)}`;
        } else if (safeData.length > 0) {
            // Si pas de dates fournies, utiliser les dates des donnees
            const dates = safeData
                .map(item => (item as any).dateSaisie)
                .filter(dateSaisie => dateSaisie && !isNaN(new Date(dateSaisie).getTime()))
                .map(date => new Date(date));

            if (dates.length > 0) {
                const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
                const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
                return `Periode : Du ${formatDate(minDate.toISOString())} au ${formatDate(maxDate.toISOString())}`;
            }
        }
        return "Periode : Non specifiee";
    };

    const periodText = getPeriodText();

    const totals = {
        montant: safeData.reduce((sum, item) => sum + (item.montant || 0), 0),
        htva: safeData.reduce((sum, item) => sum + (item.htva || 0), 0),
        tva: safeData.reduce((sum, item) => sum + (item.tva || 0), 0)
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

    const columns: ColumnConfig[] = [
        { key: 'factureId', label: 'N¶ø FACTURE', width: '10%', type: 'small' },
        { key: 'client', label: 'CLIENT', width: '15%', type: 'wrap' },

        { key: 'montant', label: 'MONTANT', width: '10%', type: 'small' },
        { key: 'htva', label: 'HTVA', width: '10%', type: 'small' },
        { key: 'tva', label: 'TVA', width: '10%', type: 'small' },
        { key: 'dateSaisie', label: 'DATE SAISIE', width: '12%', type: 'date' },
        { key: 'userId', label: 'UTILISATEUR', width: '15%', type: 'wrap' },
        { key: 'marchandise', label: 'MARCHANDISE', width: '18%', type: 'wrap' }
    ];

    const rowsPerPage = 20;
    const dataChunks: FacSaisieUser[][] = safeData.length
        ? Array.from({ length: Math.ceil(safeData.length / rowsPerPage) }, (_, index) =>
            safeData.slice(index * rowsPerPage, index * rowsPerPage + rowsPerPage)
        )
        : [[]];

    const getHeaderStyle = (col: ColumnConfig, isLast: boolean) => {
        return [
            styles.tableColHeaderBase,
            isLast ? styles.tableColHeaderNoBorder : null,
            { width: col.width }
        ];
    };

    const getCellStyle = (col: ColumnConfig, isLast: boolean) => {
        return [
            styles.tableColBase,
            col.type === 'wrap' ? styles.tableColWrap : null,
            isLast ? styles.tableColNoBorder : null,
            { width: col.width }
        ];
    };

    return (
        <Document>
            {dataChunks.map((chunk, pageIndex) => {
                const isLastPage = pageIndex === dataChunks.length - 1;
                return (
                    <Page key={pageIndex} size="A4" style={styles.page}>
                        <View style={styles.header}>
                            {pageIndex === 0 && (
                                <>
                                    <View style={styles.companyInfo}>
                                        <Text style={styles.companyName}>GLOBAL PORT SERVICE BURUNDI</Text>
                                    </View>

                                    <View style={styles.reportTitleContainer}>
                                        <Text style={styles.reportTitle}>RAPPORT DES FACTURES NON ENCAISSES</Text>
                                        <Text style={styles.reportPeriod}>{periodText}</Text>
                                        <Text style={styles.reportSubtitle}>Detail des transactions enregistrees</Text>
                                    </View>
                                </>
                            )}
                        </View>

                        {pageIndex === 0 && (
                            <View style={styles.infoSection}>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>Date du rapport:</Text>
                                    <Text style={styles.infoValue}>{reportDate}</Text>
                                </View>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>Filtre applique:</Text>
                                    <Text style={styles.infoValue}>{globalFilter || 'Aucun filtre'}</Text>
                                </View>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>Nombre de factures:</Text>
                                    <Text style={styles.infoValue}>{safeData.length}</Text>
                                </View>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>Periode couverte:</Text>
                                    <Text style={styles.infoValue}>
                                        {periodText.replace('Periode : ', '')}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.tableContainer}>
                            <View style={styles.table}>
                                <View style={styles.tableHeader}>
                                    {columns.map((col, index) => {
                                        const isLast = index === columns.length - 1;
                                        return (
                                            <Text key={col.key} style={getHeaderStyle(col, isLast)}>
                                                {col.label}
                                            </Text>
                                        );
                                    })}
                                </View>

                                {chunk.map((item, idx) => (
                                    <View
                                        key={`${pageIndex}-${idx}`}
                                        style={[
                                            styles.tableRow,
                                            idx % 2 === 0 ? styles.tableRowAlternate : {}
                                        ]}
                                    >
                                        {columns.map((col, colIndex) => {
                                            let value;
                                            const itemValue = item[col.key as keyof FacSaisieUser];

                                            switch (col.key) {
                                                case 'montant':
                                                case 'htva':
                                                case 'tva':
                                                    value = formatCurrency(itemValue as number);
                                                    break;
                                                case 'dateSaisie':
                                                    value = formatDateTime(itemValue as string);
                                                    break;
                                                case 'marchandise':
                                                case 'client':
                                                case 'userId':
                                                    value = itemValue?.toString() || '-';
                                                    break;
                                                default:
                                                    value = itemValue?.toString() || '-';
                                            }

                                            const isLast = colIndex === columns.length - 1;

                                            return (
                                                <Text key={col.key} style={getCellStyle(col, isLast)}>
                                                    {value}
                                                </Text>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {isLastPage && (
                            <>
                                <View style={styles.totalsSection}>
                                    <Text style={styles.totalsTitle}>RECAPITULATIF DES MONTANTS</Text>

                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Total Montant TTC:</Text>
                                        <Text style={[styles.totalValue, styles.totalAmount]}>
                                            {formatCurrency(totals.montant)}
                                        </Text>
                                    </View>

                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Total HTVA:</Text>
                                        <Text style={styles.totalValue}>{formatCurrency(totals.htva)}</Text>
                                    </View>

                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Total TVA:</Text>
                                        <Text style={styles.totalValue}>{formatCurrency(totals.tva)}</Text>
                                    </View>

                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Nombre total de factures:</Text>
                                        <Text style={styles.totalValue}>{safeData.length}</Text>
                                    </View>

                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Periode analysee:</Text>
                                        <Text style={styles.totalValue}>
                                            {periodText.replace('Periode : ', '')}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.summaryBox}>
                                    <Text style={styles.summaryText}>
                                        Rapport genere le {currentDate} | Montant total des transactions: {formatCurrency(totals.montant)}
                                    </Text>
                                    <Text style={[styles.summaryText, { marginTop: 5 }]}> {periodText} </Text>
                                </View>

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
                            </>
                        )}

                        <View style={styles.footer}>
                            <Text>Document genere automatiquement par le systeme de gestion - Confidentialite: Interne</Text>
                        </View>

                        <Text
                            style={styles.pageNumber}
                            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
                            fixed
                        />
                    </Page>
                );
            })}
        </Document>
    );
};

export default FacSaisieUserPdf;
