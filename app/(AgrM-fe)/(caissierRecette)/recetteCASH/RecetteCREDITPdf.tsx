import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { RecetteCREDIT, RecetteCREDITGrouped } from './RecetteCREDIT';

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
        fontWeight: 'bold',
        justifyContent: 'flex-end'
    },
    signature: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }
});

interface RecetteCREDITPdfProps {
    data: RecetteCREDIT[] | RecetteCREDITGrouped[];
    dateDebut?: Date;
    dateFin?: Date;
    totalTT: number;
    totalExo: number;
    isGrouped?: boolean;
    totalHTVA_TT: number;
    totalTVA_TT: number;
}

const RecetteCREDITPdf: React.FC<RecetteCREDITPdfProps> = ({ 
    data = [], 
    dateDebut = new Date(), 
    dateFin = new Date(),
    totalTT = 0,
    totalExo = 0,
    isGrouped = false,
    totalHTVA_TT = 0,
    totalTVA_TT = 0
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
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Rapport des recettes CASH</Text>
                    <Text style={styles.subtitle}>
                        Période: {formatDate(dateDebut)} au {formatDate(dateFin)}
                    </Text>
                </View>

                <View style={styles.table}>
                    {isGrouped ? (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableColHeader}>Libellé</Text>
                                <Text style={styles.tableColHeader}>Total TT</Text>
                                <Text style={styles.tableColHeader}>Total Exo</Text>
                            </View>
                            
                            {(data as RecetteCREDITGrouped[]).map((group, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={styles.tableCol}>{group.libelle}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(group.totalTT)}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(group.totalExo)}</Text>
                                </View>
                            ))}
                        </>
                    ) : (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableColHeader}>Num Compte</Text>
                                <Text style={styles.tableColHeader}>Libellé</Text>
                                <Text style={styles.tableColHeader}>Montant TT</Text>
                                <Text style={styles.tableColHeader}>Montant Exo</Text>
                            </View>
                            
                            {(data as RecetteCREDIT[]).map((item, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={styles.tableCol}>{item.numCompte}</Text>
                                    <Text style={styles.tableCol}>{item.libelle}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(item.montantTT)}</Text>
                                    <Text style={styles.tableCol}>{formatCurrency(item.montantExo || 0)}</Text>
                                </View>
                            ))}
                        </>
                    )}
                </View>

                <View style={styles.totalRow}>
                    <Text>Total Général TT + TVA: {formatCurrency(totalTT)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text>Total Général Exo: {formatCurrency(totalExo)}</Text>
                </View>

                <View style={styles.totalRow}>
                    <Text>Total HTVA: {formatCurrency(totalHTVA_TT)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text>Total TVA: {formatCurrency(totalTVA_TT)}</Text>
                </View>
                          
                <View style={styles.signature}>
                    <Text>Signature: _________________________</Text>
                </View>
            </Page>
        </Document>
    );
};

export default RecetteCREDITPdf;