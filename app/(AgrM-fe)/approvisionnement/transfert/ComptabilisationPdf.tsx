import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

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
    flex: 1
  },
  tableCol: {
    padding: 5,
    flex: 1
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 10,
    fontWeight: 'bold',
    justifyContent: 'space-between'
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});

interface ComptabilisationPdfProps {
  data: any[];
  dateDebut: Date;
  dateFin: Date;
  totalDebit: number;
  totalCredit: number;
}

const ComptabilisationPdf: React.FC<ComptabilisationPdfProps> = ({ 
  data = [], 
  dateDebut, 
  dateFin,
  totalDebit = 0,
  totalCredit = 0
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
    .replace(/BIF$/, ' FBu');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Brouillard Comptable - Comptabilisation Transfert</Text>
          <Text style={styles.subtitle}>
            Période: {formatDate(dateDebut)} au {formatDate(dateFin)}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColHeader, { flex: 0.8 }]}>N° Pièce</Text>
            <Text style={[styles.tableColHeader, { flex: 1 }]}>Compte</Text>
            <Text style={[styles.tableColHeader, { flex: 1.5 }]}>Libellé</Text>
            <Text style={[styles.tableColHeader, { flex: 1 }]}>Date</Text>
            <Text style={[styles.tableColHeader, { flex: 1 }]}>Débit</Text>
            <Text style={[styles.tableColHeader, { flex: 1 }]}>Crédit</Text>
          </View>
          
          {data.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 0.8 }]}>{item.numeroPiece}</Text>
              <Text style={[styles.tableCol, { flex: 1 }]}>{item.compteCategorie}</Text>
              <Text style={[styles.tableCol, { flex: 1.5 }]}>{item.libelleCategorie}</Text>
              <Text style={[styles.tableCol, { flex: 1 }]}>{formatDate(new Date(item.dateEcriture))}</Text>
              <Text style={[styles.tableCol, { flex: 1 }]}>{formatCurrency(item.debit || 0)}</Text>
              <Text style={[styles.tableCol, { flex: 1 }]}>{formatCurrency(item.credit || 0)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text>Total Débit: {formatCurrency(totalDebit)}</Text>
          <Text>Total Crédit: {formatCurrency(totalCredit)}</Text>
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