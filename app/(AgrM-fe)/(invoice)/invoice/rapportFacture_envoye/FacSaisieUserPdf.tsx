// FacSaisieUserPdf.tsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { FacSaisieUser } from './FacSaisieUser';

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
        width: '11%',
        padding: 5,
        fontWeight: 'bold'
    },
     tableColHeader1: {
        width: '20%',
        padding: 5,
        fontWeight: 'bold'
    },
    tableCol: {
        width: '11%',
        padding: 5
    },
    
    tableCol1: {
        width: '20%',
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

interface FacSaisieUserPdfProps {
    data: FacSaisieUser[];
    globalFilter: string;
}

const FacSaisieUserPdf: React.FC<FacSaisieUserPdfProps> = ({ data, globalFilter }) => {
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
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
    .replace(/\s/g, ' ') // S'assurer que ce sont des espaces normaux
    .replace(/BIF$/, ' '); // Ajouter un espace avant la devise
};

    const totals = {
        montant: data.reduce((sum, item) => sum + (item.montant || 0), 0),
        htva: data.reduce((sum, item) => sum + (item.htva || 0), 0),
        tva: data.reduce((sum, item) => sum + (item.tva || 0), 0)
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Rapport des factures envoyées à l'OBR</Text>
                    <Text style={styles.subtitle}>
                        Filtre appliqué: {globalFilter || 'Aucun filtre'}
                    </Text>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableColHeader}>N° Facture</Text>
                        <Text style={styles.tableColHeader}>Client</Text>
                        <Text style={styles.tableColHeader}>Déclarant</Text>
                        <Text style={styles.tableColHeader1}>Marchandise</Text>
                        <Text style={styles.tableColHeader}>Montant</Text>
                        <Text style={styles.tableColHeader}>HTVA</Text>
                        <Text style={styles.tableColHeader}>TVA</Text>
                       
                        <Text style={styles.tableColHeader1}>Utilisateur</Text>
                    </View>
                    
                    {data.map((item, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.tableCol}>{item.factureId || '-'}</Text>
                            <Text style={styles.tableCol}>{item.client || '-'}</Text>
                            <Text style={styles.tableCol}>{item.declarant || '-'}</Text>
                            <Text style={styles.tableCol1}>{item.marchandise || '-'}</Text>
                            <Text style={styles.tableCol}>{formatCurrency(item.montant || 0)}</Text>
                            <Text style={styles.tableCol}>{formatCurrency(item.htva || 0)}</Text>
                            <Text style={styles.tableCol}>{formatCurrency(item.tva || 0)}</Text>
                            <Text style={styles.tableCol1}>{item.userId || '-'}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.totalRow}>
                    <Text>Total Montant: {formatCurrency(totals.montant)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text>Total HTVA: {formatCurrency(totals.htva)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text>Total TVA: {formatCurrency(totals.tva)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text>Nombre d'éléments: {data.length}</Text>
                </View>

                <View style={styles.signature}>
                    <Text>Signature: _________________________</Text>
                </View>
            </Page>
        </Document>
    );
};

export default FacSaisieUserPdf;