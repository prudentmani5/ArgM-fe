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
        padding: 5,
        fontWeight: 'bold',
        fontSize: 8
    },
    tableCol: {
        padding: 5,
        fontSize: 8
    },
    colDate: {
        width: '12%'
    },
    colRef: {
        width: '14%'
    },
    colClient: {
        width: '18%'
    },
    colMode: {
        width: '12%'
    },
    colMontant: {
        width: '15%'
    },
    colExcedent: {
        width: '14%'
    },
    colDiff: {
        width: '15%'
    },
    textGreen: {
        color: '#16a34a'
    },
    textRed: {
        color: '#dc2626'
    },
    textGray: {
        color: '#4b5563'
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
    userCreation: string;
}

const RapportCaissierPdf: React.FC<RapportCaissierPdfProps> = ({ data, dateDebut, dateFin, userCreation }) => {
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
                    <Text style={styles.subtitle}>Caissier: {userCreation}</Text>
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
                                <Text style={[styles.tableColHeader, styles.colDate]}>Date</Text>
                                <Text style={[styles.tableColHeader, styles.colRef]}>No Fature</Text>
                                <Text style={[styles.tableColHeader, styles.colRef]}>Référence</Text>
                                <Text style={[styles.tableColHeader, styles.colClient]}>Client</Text>
                                <Text style={[styles.tableColHeader, styles.colMode]}>Mode</Text>
                                <Text style={[styles.tableColHeader, styles.colDiff]}>Montant Facture</Text>
                                <Text style={[styles.tableColHeader, styles.colExcedent]}>Excédent</Text>
                                <Text style={[styles.tableColHeader, styles.colMontant]}>Montant Payé</Text>
                                
                                
                            </View>

                            {group.items.map((item, idx) => {
                                const difference = (item.montantPaye || 0) - (item.montantExcedent || 0);
                                const diffStyle = difference > 0 ? styles.textGreen : difference < 0 ? styles.textRed : styles.textGray;

                                return (
                                    <View key={idx} style={styles.tableRow}>
                                        <Text style={[styles.tableCol, styles.colDate]}>{formatDate(new Date(item.datePaiement))}</Text>
                                        <Text style={[styles.tableCol, styles.colRef]}>{item.factureId || '-'}</Text>
                                        <Text style={[styles.tableCol, styles.colRef]}>{item.reference || '-'}</Text>
                                        <Text style={[styles.tableCol, styles.colClient]}>{item.nomClient}</Text>
                                        <Text style={[styles.tableCol, styles.colMode]}>{item.modePaiement}</Text>
                                        <Text style={[styles.tableCol, styles.colDiff, diffStyle]}>{formatCurrency(difference)}</Text>
                                        <Text style={[styles.tableCol, styles.colExcedent]}>{formatCurrency(item.montantExcedent)}</Text>
                                        <Text style={[styles.tableCol, styles.colMontant]}>{formatCurrency(item.montantPaye)}</Text>
                                    
                                    </View>
                                );
                            })}
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