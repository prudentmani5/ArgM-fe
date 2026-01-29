// components/ComptabilisationPdf.tsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { Comptabilisation, ComptabilisationGrouped } from './Comptabilisation';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10
    },
    header: {
        marginBottom: 20,
        textAlign: 'center'
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 5
    },
    table: {
        width: '100%',
        marginBottom: 15
    },
    tableHeader: {
        backgroundColor: '#f2f2f2',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderBottomStyle: 'solid'
    },
    tableColHeader: {
        width: '16%',
        padding: 5,
        fontWeight: 'bold'
    },
    tableCol: {
        width: '16%',
        padding: 5
    },
    totalRow: {
        flexDirection: 'row',
        marginTop: 10,
        fontWeight: 'bold',
        justifyContent: 'flex-end'
    },
    signature: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }
});

interface ComptabilisationPdfProps {
    data: Comptabilisation[] | ComptabilisationGrouped[];
    dateDebut?: Date;
    dateFin?: Date;
    totalDebit: number;
    totalCredit: number;
    isGrouped?: boolean;
}

const ComptabilisationPdf: React.FC<ComptabilisationPdfProps> = ({ 
    data = [], 
    dateDebut = new Date(), 
    dateFin = new Date(),
    totalDebit = 0,
    totalCredit = 0,
    isGrouped = false
}) => {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'BIF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
        .format(value || 0)
        .replace(/\s/g, ' ')
        .replace(/BIF$/, ' ');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page} orientation="landscape">
                <View style={styles.header}>
                    <Text style={styles.title}>Brouillard Comptable - Dispensaire</Text>
                    <Text style={styles.subtitle}>
                        Période: {formatDate(dateDebut)} au {formatDate(dateFin)}
                    </Text>
                </View>

                <View style={styles.table}>
                    {isGrouped ? (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableColHeader}>Libellé</Text>
                                <Text style={styles.tableColHeader}>Total Débit</Text>
                                <Text style={styles.tableColHeader}>Total Crédit</Text>
                            </View>
                            
                            {(data as ComptabilisationGrouped[]).map((group, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={styles.tableCol}>{group.libelle}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(group.totalDebit)}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(group.totalCredit)}</Text>
                                </View>
                            ))}
                        </>
                    ) : (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableColHeader}>N° Pièce</Text>
                                <Text style={styles.tableColHeader}>Compte</Text>
                                <Text style={styles.tableColHeader}>Libellé</Text>
                                <Text style={styles.tableColHeader}>Référence</Text>
                                <Text style={styles.tableColHeader}>Date</Text>
                                <Text style={styles.tableColHeader}>Débit</Text>
                                <Text style={styles.tableColHeader}>Crédit</Text>
                            </View>
                            
                            {(data as Comptabilisation[]).map((item, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={styles.tableCol}>{item.numeroPiece}</Text>
                                    <Text style={styles.tableCol}>{item.compte}</Text>
                                    <Text style={styles.tableCol}>{item.libelle}</Text>
                                    <Text style={styles.tableCol}>{item.reference}</Text>
                                    <Text style={styles.tableCol}>{formatDate(new Date(item.dateEcriture))}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(item.debit)}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(item.credit)}</Text>
                                </View>
                            ))}
                        </>
                    )}
                </View>

                <View style={styles.totalRow}>
                    <Text>Total Débit: {formatCurrency(totalDebit)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text>Total Crédit: {formatCurrency(totalCredit)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text>Solde: {formatCurrency(totalDebit - totalCredit)}</Text>
                </View>

                <View style={styles.signature}>
                    <Text>Signature: _________________________</Text>
                </View>
            </Page>
        </Document>
    );
};

export default ComptabilisationPdf;