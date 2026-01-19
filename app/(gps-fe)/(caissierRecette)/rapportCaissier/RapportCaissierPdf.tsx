import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { RapportCaissierGrouped } from './RapportCaissier';

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
    },
    signature: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }
});

interface RapportCaissierPdfProps {
    data: RapportCaissierGrouped[];
    dateDebut: Date;
    dateFin: Date;
    caissierNom: string;
}

const RapportCaissierPdf: React.FC<RapportCaissierPdfProps> = ({ data, dateDebut, dateFin, caissierNom }) => {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR');
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
    .replace(/\s/g, ' ') // S'assurer que ce sont des espaces normaux
    .replace(/BIF$/, ' BIF'); // Ajouter un espace avant la devise
};

    const totalGeneral = data.reduce((sum, group) => sum + group.total, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Rapport Caissier</Text>
                    <Text style={styles.subtitle}>Caissier: {caissierNom}</Text>
                    <Text style={styles.subtitle}>
                        Période: {formatDate(dateDebut)} au {formatDate(dateFin)}
                    </Text>
                </View>

                {data.map((group, index) => (
                    <View key={index} style={{ marginBottom: 15 }}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                            Banque: {group.nomBanque} - Total: {formatCurrency(group.total)}
                        </Text>
                        
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableColHeader}>Date</Text>
                                <Text style={styles.tableColHeader}>Client</Text>
                                <Text style={styles.tableColHeader}>Mode Paiement</Text>
                                <Text style={styles.tableColHeader}>Montant</Text>
                            </View>
                            
                            {group.items.map((item, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={styles.tableCol}>{formatDate(new Date(item.datePaiement))}</Text>
                                    <Text style={styles.tableCol}>{item.nomClient}</Text>
                                    <Text style={styles.tableCol}>{item.modePaiement}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(item.montantPaye)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={styles.totalRow}>
                    <Text>Total Général: {formatCurrency(totalGeneral)}</Text>
                </View>

                <View style={styles.signature}>
                    <Text>Signature: _________________________</Text>
                </View>
            </Page>
        </Document>
    );
};

export default RapportCaissierPdf;