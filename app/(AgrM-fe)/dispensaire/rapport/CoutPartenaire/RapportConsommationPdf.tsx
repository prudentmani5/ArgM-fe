import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { RapportConsommationGrouped, RapportConsommationParams } from './RapportConsommation';

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
    width: '12%',
    padding: 5,
    fontWeight: 'bold'
  },
  tableCol: {
    width: '12%',
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

interface RapportConsommationPdfProps {
  data: RapportConsommationGrouped[];
  dateDebut: Date;
  dateFin: Date;
  searchParams: RapportConsommationParams;
}

const RapportConsommationPdf: React.FC<RapportConsommationPdfProps> = ({ 
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
    .replace(/\s/g, ' ') // S'assurer que ce sont des espaces normaux
    .replace(/BIF$/, ' BIF'); // Ajouter un espace avant la devise
};


  const totalGeneralConsommations = data.reduce((sum, group) => sum + group.totalConsommations, 0);
  const totalGeneralMontant = data.reduce((sum, group) => sum + group.totalMontant, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.header}>
          <Text style={styles.title}>Rapport des Consommations par Partenaire</Text>
          <Text style={styles.subtitle}>
            Période: {formatDate(dateDebut)} au {formatDate(dateFin)}
          </Text>
          {searchParams.matricule && (
            <Text style={styles.subtitle}>
              Employé: {searchParams.matricule}
            </Text>
          )}
          {searchParams.partenaireId && (
            <Text style={styles.subtitle}>
              Partenaire: {searchParams.partenaireId}
            </Text>
          )}
        </View>

       // Dans RapportConsommationPdf.tsx
{data.map((group, index) => (
    <View key={index} style={{ marginBottom: 15 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
            Partenaire: {group.partenaireId} - {group.libellePartenaire} | 
            Consommations: {group.totalConsommations} | 
            Total: {formatCurrency(group.totalMontant)}
        </Text>
        
        <View style={styles.table}>
            <View style={styles.tableHeader}>
                <Text style={styles.tableColHeader}>Matricule</Text>
                <Text style={styles.tableColHeader}>Nom</Text>
                <Text style={styles.tableColHeader}>Prénom</Text>
                <Text style={styles.tableColHeader}>Date</Text>
                <Text style={styles.tableColHeader}>Type</Text>
                <Text style={styles.tableColHeader}>Prestation</Text>
                <Text style={styles.tableColHeader}>Article</Text>
                <Text style={styles.tableColHeader}>Qté</Text>
                <Text style={styles.tableColHeader}>P.U</Text>
                <Text style={styles.tableColHeader}>Total</Text>
                <Text style={styles.tableColHeader}>Ayant Droit</Text>
            </View>
            
            {group.items.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                    <Text style={styles.tableCol}>{item.matricule}</Text>
                    <Text style={styles.tableCol}>{item.nom}</Text>
                    <Text style={styles.tableCol}>{item.prenom}</Text>
                    <Text style={styles.tableCol}>{formatDate(new Date(item.dateConsommation))}</Text>
                    <Text style={styles.tableCol}>{item.typeConsommation}</Text>
                    <Text style={styles.tableCol}>{item.libellePrestation}</Text>
                    <Text style={styles.tableCol}>{item.libelleArticle}</Text>
                    <Text style={styles.tableCol}>{item.qte}</Text>
                    <Text style={styles.tableCol}>{formatCurrency(item.pu)}</Text>
                    <Text style={styles.tableCol}>{formatCurrency(item.prixTotal)}</Text>
                    <Text style={styles.tableCol}>{item.nomAyantDroit}</Text>
                </View>
            ))}
        </View>
    </View>
))}

        <View style={styles.totalRow}>
          <Text>Total Consommations: {totalGeneralConsommations}</Text>
          <Text style={{ marginLeft: 'auto' }}>Total Général: {formatCurrency(totalGeneralMontant)}</Text>
        </View>

        <View style={styles.signature}>
          <Text>Signature: _________________________</Text>
        </View>
      </Page>
    </Document>
  );
};

export default RapportConsommationPdf;