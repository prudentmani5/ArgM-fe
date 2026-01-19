import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface ModePaiementGroup {
  modePaiement: string;
  total: number;
  totalFacture: number;
  totalExcedent: number;
  items: any[];
}

interface RapportCaissierSummary {
  nomBanque: string;
  total: number;
  totalFacture: number;
  totalExcedent: number;
  modePaiementGroups: ModePaiementGroup[];
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  header: { marginBottom: 20, textAlign: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 12, marginBottom: 5 },
  banqueHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    fontSize: 14,
    backgroundColor: '#e3f2fd',
    padding: 5,
    borderRadius: 3
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  table: { 
    width: '100%', 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4
  },
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
  tableColHeader: { 
    padding: 5, 
    fontWeight: 'bold',
    fontSize: 9
  },
  tableCol: { 
    padding: 5,
    fontSize: 9 
  },
  totalRow: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: 2,
    borderTopColor: '#1976d2',
    borderBottomWidth: 2,
    borderBottomColor: '#1976d2'
  },
  totalCell: {
    padding: 6,
    fontWeight: 'bold',
    fontSize: 10
  },
  grandTotal: {
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#e3f2fd',
    borderRadius: 5
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
    padding: 12
  },
  grandTotalItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 5
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
  },
  modePaiementRow: {
    backgroundColor: '#fafafa'
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
    .replace(/\s/g, ' ')
    .replace(/BIF$/, ' BIF');
};

interface RapportCaissierPdfProps {
  data: RapportCaissierSummary[];
  dateDebut: Date;
  dateFin: Date;
  userCreation: string;
}

const RapportCaissierPdf: React.FC<RapportCaissierPdfProps> = ({ 
  data, 
  dateDebut, 
  dateFin, 
  userCreation 
}) => {
  const totalGeneral = data.reduce((sum, group) => sum + group.total, 0);
  const totalFactureGeneral = data.reduce((sum, group) => sum + group.totalFacture, 0);
  const totalExcedentGeneral = data.reduce((sum, group) => sum + group.totalExcedent, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>RAPPORT CAISSIER</Text>
          <Text style={styles.subtitle}>Caissier: {userCreation}</Text>
          <Text style={styles.subtitle}>
            Période du {format(dateDebut, 'dd/MM/yyyy')} au {format(dateFin, 'dd/MM/yyyy')}
          </Text>
        </View>

        {data.map((banque, banqueIndex) => (
          <View key={banqueIndex} style={{ marginBottom: 20 }}>
            <Text style={styles.banqueHeader}>
              {banque.nomBanque}
            </Text>

            {/* Mode de paiement summary table */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableColHeader, { width: '25%' }]}>Mode Paiement</Text>
                <Text style={[styles.tableColHeader, { width: '25%' }]}>Montant Facture</Text>
                <Text style={[styles.tableColHeader, { width: '25%' }]}>Montant Payé</Text>
                <Text style={[styles.tableColHeader, { width: '25%' }]}>Excédent</Text>
              </View>
              
              {banque.modePaiementGroups.map((modeGroup, modeIndex) => (
                <View 
                  key={modeIndex} 
                  style={[
                    styles.tableRow,
                    modeIndex % 2 === 0 ? styles.modePaiementRow : {}
                  ]}
                >
                  <Text style={[styles.tableCol, { width: '25%' }]}>{modeGroup.modePaiement}</Text>
                  <Text style={[styles.tableCol, { width: '25%' }]}>{formatCurrency(modeGroup.totalFacture)}</Text>
                  <Text style={[styles.tableCol, { width: '25%' }]}>{formatCurrency(modeGroup.total)}</Text>
                  <Text style={[styles.tableCol, { width: '25%' }]}>{formatCurrency(modeGroup.totalExcedent)}</Text>
                </View>
              ))}
              
              {/* Banque total - Improved design */}
              <View style={styles.totalRow}>
                <View style={{ 
                  flexDirection: 'row', 
                  width: '100%',
                  borderTopWidth: 1,
                  borderTopColor: '#ccc',
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc'
                }}>
                  <View style={{ 
                    width: '25%', 
                    backgroundColor: '#e8f5e8',
                    padding: 6,
                    borderRightWidth: 1,
                    borderRightColor: '#ccc'
                  }}>
                    <Text style={[styles.totalCell, { color: '#2e7d32' }]}>
                      Total 
                    </Text>
                  </View>
                  <View style={{ 
                    width: '25%', 
                    backgroundColor: '#e8f5e8',
                    padding: 6,
                    borderRightWidth: 1,
                    borderRightColor: '#ccc'
                  }}>
                    <Text style={[styles.totalCell, { color: '#2e7d32' }]}>
                      {formatCurrency(banque.totalFacture)}
                    </Text>
                  </View>
                  <View style={{ 
                    width: '25%', 
                    backgroundColor: '#e8f5e8',
                    padding: 6,
                    borderRightWidth: 1,
                    borderRightColor: '#ccc'
                  }}>
                    <Text style={[styles.totalCell, { color: '#2e7d32' }]}>
                      {formatCurrency(banque.total)}
                    </Text>
                  </View>
                  <View style={{ 
                    width: '25%', 
                    backgroundColor: '#e8f5e8',
                    padding: 6
                  }}>
                    <Text style={[styles.totalCell, { color: '#2e7d32' }]}>
                      {formatCurrency(banque.totalExcedent)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Grand Total Section */}
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

export default RapportCaissierPdf;