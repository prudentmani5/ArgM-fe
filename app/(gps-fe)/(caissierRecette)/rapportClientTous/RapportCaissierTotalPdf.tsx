import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { RapportCaissierGrouped } from './RapportCaissierTotal';

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
        width: '25%',
        padding: 5,
        fontWeight: 'bold'
    },
    tableCol: {
        width: '25%',
        padding: 5
    },
    totalRow: {
        flexDirection: 'row',
        marginTop: 10,
        fontWeight: 'bold'
    }
});

interface RapportCaissierTotalPdfProps {
    data: RapportCaissierGrouped[];
    dateDebut: Date;
    dateFin: Date;
}

const RapportCaissierTotalPdf: React.FC<RapportCaissierTotalPdfProps> = ({ data, dateDebut, dateFin }) => {
    const formatDate = (date: Date) => date.toLocaleDateString('fr-FR');
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
    const totalGeneral = data.reduce((sum, group) => sum + group.total, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Rapport Global des clients</Text>
                    <Text style={styles.subtitle}>
                        Période: {formatDate(dateDebut)} au {formatDate(dateFin)}
                    </Text>
                </View>

                {data.map((group, index) => (
                    <View key={index} style={{ marginBottom: 15 }}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                           Client: {group.nomClient} - Total: {formatCurrency(group.total)}
                        </Text>
                        
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableColHeader}>Date</Text>
                                 <Text style={styles.tableColHeader}>Facture</Text>
                                <Text style={styles.tableColHeader}>Client</Text>
                                <Text style={styles.tableColHeader}>Montant</Text>
                            </View>
                            
                            {group.items.map((item, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={styles.tableCol}>{formatDate(new Date(item.datePaiement))}</Text>
                                    <Text style={styles.tableCol}>{item.factureId}</Text>
                                    <Text style={styles.tableCol}>{item.nomClient}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(item.montantPaye)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={styles.totalRow}>
                    <Text>Total Général: {formatCurrency(totalGeneral)}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default RapportCaissierTotalPdf;