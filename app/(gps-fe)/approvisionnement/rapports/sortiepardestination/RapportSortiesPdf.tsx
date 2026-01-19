import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { RapportSortieGrouped, RapportSortieParams } from './RapportSorties';

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
    width: '10%',
    padding: 5,
    fontWeight: 'bold'
  },
  tableCol: {
    width: '10%',
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
  },
  groupContainer: {
    marginBottom: 15
  },
  groupHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
    backgroundColor: '#e6e6e6',
    padding: 5,
    borderRadius: 3
  }
});

interface RapportSortiesPdfProps {
  data: RapportSortieGrouped[];
  dateDebut: Date;
  dateFin: Date;
  searchParams: RapportSortieParams;
}

const RapportSortiesPdf: React.FC<RapportSortiesPdfProps> = ({ 
  data, dateDebut, dateFin, searchParams 
}) => {
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
    .replace(/\s/g, ' ')
    .replace(/BIF$/, ' BIF');
  };

  const totalGeneralSorties = data.reduce((sum, group) => sum + group.totalSorties, 0);
  const totalGeneralMontant = data.reduce((sum, group) => sum + group.totalMontant, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.header}>
          <Text style={styles.title}>Rapport des Sorties de Stock par destination</Text>
          <Text style={styles.subtitle}>
            Période: {formatDate(dateDebut)} au {formatDate(dateFin)}
          </Text>
          {searchParams.numeroPiece && (
            <Text style={styles.subtitle}>
              Numéro de Pièce: {searchParams.numeroPiece}
            </Text>
          )}
          {searchParams.magasinId && (
            <Text style={styles.subtitle}>
              Magasin: {searchParams.magasinId}
            </Text>
          )}
          {searchParams.serviceId && (
            <Text style={styles.subtitle}>
              Service: {searchParams.serviceId}
            </Text>
          )}
          {searchParams.destinationId && (
            <Text style={styles.subtitle}>
              Destinateur: {searchParams.destinationId}
            </Text>
          )}
        </View>

        {data.map((group, index) => (
          <View key={index} style={styles.groupContainer}>
            <View style={styles.groupHeader}>
              <Text>
                Destinateur: {group.destinationLibelle} | 
                Sorties: {group.totalSorties} | 
                Total: {formatCurrency(group.totalMontant)}
              </Text>
            </View>
            
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableColHeader}>N° Pièce</Text>
                <Text style={styles.tableColHeader}>Date</Text>
                <Text style={styles.tableColHeader}>Article</Text>
                <Text style={styles.tableColHeader}>Unité</Text>
                <Text style={styles.tableColHeader}>Qté</Text>
                <Text style={styles.tableColHeader}>P.U</Text>
                <Text style={styles.tableColHeader}>Total</Text>
                <Text style={styles.tableColHeader}>Service</Text>
              </View>
              
              {group.items.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableCol}>{item.numeroPiece || 'N/A'}</Text>
                  <Text style={styles.tableCol}>{formatDate(new Date(item.dateSortie))}</Text>
                  <Text style={styles.tableCol}>{item.articleLibelle || 'N/A'}</Text>
                  <Text style={styles.tableCol}>{item.uniteLibelle || 'N/A'}</Text>
                  <Text style={styles.tableCol}>{item.qteS || 'N/A'}</Text>
                  <Text style={styles.tableCol}>{item.prixS ? formatCurrency(item.prixS) : 'N/A'}</Text>
                  <Text style={styles.tableCol}>{item.prixTotal ? formatCurrency(item.prixTotal) : 'N/A'}</Text>
                  <Text style={styles.tableCol}>{item.serviceLibelle || 'N/A'}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text>Total Sorties: {totalGeneralSorties}</Text>
          <Text style={{ marginLeft: 'auto' }}>Total Général: {formatCurrency(totalGeneralMontant)}</Text>
        </View>

        <View style={styles.signature}>
          <Text>Signature: _________________________</Text>
        </View>
      </Page>
    </Document>
  );
};

export default RapportSortiesPdf;