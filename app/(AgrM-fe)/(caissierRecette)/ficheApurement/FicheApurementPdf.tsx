import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { FicheApurement, FicheApurementDetail } from './FicheApurement';

// Enregistrement des polices
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v15/4iCv6KVjbNBYlgoCxCvTtw.ttf' }, // Regular
    { src: 'https://fonts.gstatic.com/s/helvetica/v15/4iCv6KVjbNBYlgoCxCvTtw.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 20,
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 10
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15
  },
  section: {
    marginBottom: 15
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  label: {
    width: '30%',
    fontWeight: 'bold'
  },
  value: {
    width: '70%'
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
    marginBottom: 5
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 3
  },
  col1: { width: '10%' },
  col2: { width: '20%' },
  col3: { width: '20%' },
  col4: { width: '25%' },
  col5: { width: '25%' },
  totals: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid'
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});

interface FicheApurementPdfProps {
  fiche: FicheApurement;
  details: FicheApurementDetail[];
}

export const FicheApurementPdf = ({ fiche, details }: FicheApurementPdfProps) => {
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('fr-FR');
  };

  const formatNumber = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  // Calcul des totaux
  const totalColis = details.reduce((sum, d) => sum + (d.nbreColisSortis || 0), 0);
  const totalPoids = details.reduce((sum, d) => sum + (d.poidsSortis || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>Global Port Services Burundi</Text>
          <Text>FICHE D'APUREMENT</Text>
          <Text>Date: {formatDate(new Date())}</Text>
        </View>

        <View style={styles.title}>
          <Text>FICHE D'APUREMENT N° {fiche.ficheId || '-'}</Text>
        </View>

        {/* Informations de base */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Numéro LT:</Text>
            <Text style={styles.value}>{fiche.numLT || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Numéro DMC:</Text>
            <Text style={styles.value}>{fiche.numDMC || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{fiche.nomClient || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date création:</Text>
            <Text style={styles.value}>{formatDate(fiche.dateCreation)}</Text>
          </View>
        </View>

        {/* Totaux initiaux */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Total colis:</Text>
            <Text style={styles.value}>{formatNumber(fiche.nbreColisTotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total poids:</Text>
            <Text style={styles.value}>{formatNumber(fiche.poidsTotal)} kg</Text>
          </View>
        </View>

        {/* Détails des sorties */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>DÉTAILS DES SORTIES:</Text>
          
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>Plaque</Text>
            <Text style={styles.col3}>Date</Text>
            <Text style={styles.col4}>Colis sortis</Text>
            <Text style={styles.col5}>Poids sortis (kg)</Text>
          </View>

          {details.map((detail, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{index + 1}</Text>
              <Text style={styles.col2}>{detail.plaque || '-'}</Text>
              <Text style={styles.col3}>{formatDate(detail.dateCaisse)}</Text>
              <Text style={styles.col4}>{formatNumber(detail.nbreColisSortis)}</Text>
              <Text style={styles.col5}>{formatNumber(detail.poidsSortis)}</Text>
            </View>
          ))}

          {/* Totaux */}
          <View style={[styles.tableRow, styles.totals]}>
            <Text style={[styles.col1, { fontWeight: 'bold' }]}>Total</Text>
            <Text style={[styles.col2, { fontWeight: 'bold' }]}>-</Text>
            <Text style={[styles.col3, { fontWeight: 'bold' }]}>-</Text>
            <Text style={[styles.col4, { fontWeight: 'bold' }]}>{formatNumber(totalColis)}</Text>
            <Text style={[styles.col5, { fontWeight: 'bold' }]}>{formatNumber(totalPoids)}</Text>
          </View>

          {/* Restants */}
          <View style={[styles.tableRow, { marginTop: 10 }]}>
            <Text style={[styles.col1, { fontWeight: 'bold' }]}>Restant</Text>
            <Text style={[styles.col2, { fontWeight: 'bold' }]}>-</Text>
            <Text style={[styles.col3, { fontWeight: 'bold' }]}>-</Text>
            <Text style={[styles.col4, { fontWeight: 'bold' }]}>{formatNumber((fiche.nbreColisTotal || 0) - totalColis)}</Text>
            <Text style={[styles.col5, { fontWeight: 'bold' }]}>{formatNumber((fiche.poidsTotal || 0) - totalPoids)}</Text>
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <View style={{ textAlign: 'center' }}>
            <Text>Signature</Text>
            <Text>_________________________</Text>
            <Text>Responsable Apurement</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};