import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { RapportBanqueGroup } from './RapportTotalBanque';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 10 },
    header: { marginBottom: 20, textAlign: 'center' },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 12, marginBottom: 5 },
    banqueHeader: {
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
        fontSize: 14
    },
    dateHeader: {
        fontWeight: 'bold',
        marginLeft: 10,
        marginBottom: 3,
        fontSize: 12
    },
    modePayementHeader: {
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 2,
        fontSize: 11,
        backgroundColor: '#e8e8e8',
        padding: 5
    },
    signature: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    table: { width: '100%', marginBottom: 10 },
    tableHeader: {
        backgroundColor: '#f2f2f2',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    tableColHeader: { width: '25%', padding: 5, fontWeight: 'bold' },
    tableCol: { width: '25%', padding: 5 },
    totalRow: { marginTop: 5, fontWeight: 'bold' },
    grandTotal: {
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#000',
        backgroundColor: '#e3f2fd'
    },
    grandTotalHeader: {
        backgroundColor: '#1976d2',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    grandTotalTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center'
    },
    grandTotalContent: {
        flexDirection: 'row',
        padding: 10
    },
    grandTotalItem: {
        width: '33.33%',
        alignItems: 'center'
    },
    grandTotalLabel: {
        fontSize: 10,
        marginBottom: 5,
        color: '#555',
        fontWeight: 'bold'
    },
    grandTotalValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000'
    }
});

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
        .replace(/\s/g, ' ') // S'assurer que ce sont des espaces normaux
        .replace(/BIF$/, ' BIF'); // Ajouter un espace avant la devise
};

const RapportTotalBanquePdf = ({ data, dateDebut, dateFin }: {
    data: RapportBanqueGroup[];
    dateDebut: Date;
    dateFin: Date;
}) => {
    const totalGeneral = data.reduce((sum, group) => sum + group.total, 0);
    const totalFactureGeneral = data.reduce((sum, group) => sum + group.totalFacture, 0);
    const totalExcedentGeneral = data.reduce((sum, group) => sum + group.totalExcedent, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>RAPPORT GLOBAL DES ENCAISSEMENTS</Text>
                    <Text style={styles.subtitle}>
                        Période du {format(dateDebut, 'dd/MM/yyyy')} au {format(dateFin, 'dd/MM/yyyy')}
                    </Text>
                </View>

                {data.map((banque, banqueIndex) => (
                    <View key={banqueIndex} style={{ marginBottom: 15 }}>
                        <Text style={styles.banqueHeader}>
                            {banque.nomBanque}
                        </Text>

                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableColHeader}>Mode Paiement</Text>
                                <Text style={styles.tableColHeader}>Montant Facture</Text>
                                <Text style={styles.tableColHeader}>Montant Payé</Text>
                                <Text style={styles.tableColHeader}>Excédent</Text>
                                
                            </View>
                            {banque.modePayementGroups.map((modeGroup, modeIndex) => (
                                <View key={modeIndex} style={styles.tableRow}>
                                    <Text style={styles.tableCol}>{modeGroup.modePayement}</Text>
                                     <Text style={styles.tableCol}>{formatCurrency(modeGroup.totalFacture)}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(modeGroup.total)}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(modeGroup.totalExcedent)}</Text>
                                </View>
                            ))}
                            <View style={[styles.tableRow, { backgroundColor: '#f0f0f0', fontWeight: 'bold' }]}>
                                <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>Total </Text>
                                <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>{formatCurrency(banque.totalFacture)}</Text>
                                <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>{formatCurrency(banque.total)}</Text>
                                <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>{formatCurrency(banque.totalExcedent)}</Text>
                            </View>
                        </View>
                    </View>
                ))}

                <View style={styles.grandTotal}>
                    <View style={styles.grandTotalHeader}>
                        <Text style={styles.grandTotalTitle}>TOTAL GÉNÉRAL</Text>
                    </View>
                    <View style={styles.grandTotalContent}>
                        <View style={styles.grandTotalItem}>
                            <Text style={styles.grandTotalLabel}>Montant Facture</Text>
                            <Text style={styles.grandTotalValue}>{formatCurrency(totalFactureGeneral)}</Text>
                        </View>
                        <View style={styles.grandTotalItem}>
                            <Text style={styles.grandTotalLabel}>Montant Payé</Text>
                            <Text style={styles.grandTotalValue}>{formatCurrency(totalGeneral)}</Text>
                        </View>
                        <View style={styles.grandTotalItem}>
                            <Text style={styles.grandTotalLabel}>Montant Excédent</Text>
                            <Text style={styles.grandTotalValue}>{formatCurrency(totalExcedentGeneral)}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.signature}>
                    <Text>Signature: _________________________</Text>
                </View>
            </Page>
        </Document>
    );
};

export default RapportTotalBanquePdf;