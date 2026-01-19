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
    grandTotal: { marginTop: 20, fontSize: 14, fontWeight: 'bold' }
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

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Rapport Global par Banque et Date</Text>
                    <Text style={styles.subtitle}>
                        Période du {format(dateDebut, 'dd/MM/yyyy')} au {format(dateFin, 'dd/MM/yyyy')}
                    </Text>
                </View>

                {data.map((banque, banqueIndex) => (
                    <View key={banqueIndex}>
                        <Text style={styles.banqueHeader}>
                            {banque.nomBanque} - Total: {formatCurrency(banque.total)}
                        </Text>

                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableColHeader}>Date Paiment</Text>
                                <Text style={styles.tableColHeader}>Montant</Text>

                            </View>
                            {banque.datesGroups.map((dateGroup, dateIndex) => (
                                <View key={dateIndex} style={{ marginLeft: 10 }}>


                                    <View style={styles.table}>
                                        <View style={styles.tableHeader}>

                                        </View>

                                        <View style={styles.tableRow}>

                                            <Text style={styles.tableColHeader}>

                                                {format(dateGroup.datePaiement, 'dd/MM/yyyy')}
                                            </Text>
                                            <Text style={styles.tableCol}>
                                                {formatCurrency(dateGroup.total)}

                                            </Text>
                                        </View>


                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={styles.grandTotal}>
                    <Text>Total Général: {formatCurrency(totalGeneral)}</Text>
                </View>
                <View style={styles.signature}>
                    <Text>Signature: _________________________</Text>
                </View>
            </Page>
        </Document>
    );
};

export default RapportTotalBanquePdf;