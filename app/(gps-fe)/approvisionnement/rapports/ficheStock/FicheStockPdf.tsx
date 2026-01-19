// FicheStockPdf.tsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { FicheStockData, FicheStockItem, FicheStockParams } from './FicheStock';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '1pt solid #000',
    paddingBottom: 10
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 3
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    padding: 10
  },
  infoItem: {
    width: '25%'
  },
  table: {
    width: '100%',
    marginBottom: 15
  },
  tableHeader: {
    backgroundColor: '#333',
    color: '#fff',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    fontSize: 7
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    fontSize: 6
  },
  tableCol: {
    padding: 3,
    textAlign: 'center'
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 10,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 8
  },
  signature: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  colDate: { width: '6%' },
  colType: { width: '8%' },
  colRef: { width: '10%' },
  colOrigine: { width: '8%' },
  colEntreeQte: { width: '6%' },
  colEntreePU: { width: '7%' },
  colEntreePT: { width: '7%' },
  colSortieQte: { width: '6%' },
  colSortiePU: { width: '7%' },
  colSortieMontant: { width: '7%' },
  colDispoQte: { width: '6%' },
  colDispoPU: { width: '7%' },
  colDispoMontant: { width: '7%' }
});

interface FicheStockPdfProps {
  data: FicheStockData;
  mouvements: FicheStockItem[];
  dateDebut: Date;
  dateFin: Date;
  searchParams: FicheStockParams;
  calculatedStock?: number | null;
  calculationBreakdown?: {
    totQteI: number;
    totQteE: number;
    totQteS: number;
  } | null;
}

const FicheStockPdf: React.FC<FicheStockPdfProps> = ({
  data, mouvements, dateDebut, dateFin, searchParams, calculatedStock, calculationBreakdown
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  const formatCurrency = (value: number | null) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'BIF',
        currencyDisplay: 'code',
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })
    .format(value)
    .replace(/\s/g, ' ')
    .replace(/BIF$/, ' BIF');
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'ENTREE': 'Entrée',
      'SORTIE': 'Sortie',
      'SOLDE_INITIAL': 'Solde Init.'
    };
    return labels[type as keyof typeof labels];
  };

  // Calculer le stock initial à afficher
  const getStockInitialToDisplay = () => {
    // Si le calcul est disponible, utiliser la valeur calculée
    if (calculationBreakdown !== null && calculationBreakdown !== undefined) {
      return calculationBreakdown.totQteI;
    }
    // Sinon utiliser la valeur de data
    return data.qteStockInitial;
  };

  // Fonction pour recalculer les quantités disponibles cumulatives pour le PDF
  const recalculateDisponibleQteForPDF = (mouvements: FicheStockItem[], initialStock: number): FicheStockItem[] => {
    let stockDisponible = initialStock;
    const recalculatedMouvements: FicheStockItem[] = [];
    
    // Trier par date
    const sortedMouvements = [...mouvements].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Traiter chaque mouvement
    sortedMouvements.forEach((mvt, index) => {
      if (mvt.type === 'SOLDE_INITIAL') {
        stockDisponible = initialStock;
        recalculatedMouvements.push({
          ...mvt,
          disponibleQte: stockDisponible
        });
      } else if (mvt.type === 'ENTREE') {
        const qteEntree = mvt.entreesQte || 0;
        stockDisponible = stockDisponible + qteEntree;
        recalculatedMouvements.push({
          ...mvt,
          disponibleQte: stockDisponible
        });
      } else if (mvt.type === 'SORTIE') {
        const qteSortie = mvt.sortiesQte || 0;
        stockDisponible = stockDisponible - qteSortie;
        recalculatedMouvements.push({
          ...mvt,
          disponibleQte: stockDisponible
        });
      } else {
        recalculatedMouvements.push({
          ...mvt,
          disponibleQte: stockDisponible
        });
      }
    });
    
    return recalculatedMouvements;
  };

  // CORRECTION: Recalculer les quantités disponibles pour le PDF
  const recalculatedMouvements = recalculateDisponibleQteForPDF(mouvements, getStockInitialToDisplay());

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.header}>
          <Text style={styles.title}>FICHE DE STOCK</Text>
          <Text style={styles.subtitle}>
            Période: {formatDate(dateDebut)} au {formatDate(dateFin)}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text>Article: {data.articleLibelle} {data.uniteLibelle} - {data.catalogue}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text>Catégorie: {data.uniteLibelle}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text>Stock Initial (Inventaire): {getStockInitialToDisplay()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text>Année: {new Date().getFullYear()}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol, styles.colDate]}>Date</Text>
            <Text style={[styles.tableCol, styles.colType]}>Type</Text>
            <Text style={[styles.tableCol, styles.colRef]}>Réf. Pièce</Text>
            <Text style={[styles.tableCol, styles.colOrigine]}>Origine</Text>
            <Text style={[styles.tableCol, styles.colEntreeQte]}>Entrées Qté</Text>
            <Text style={[styles.tableCol, styles.colEntreePU]}>Entrées PU</Text>
            <Text style={[styles.tableCol, styles.colEntreePT]}>Entrées P.T</Text>
            <Text style={[styles.tableCol, styles.colSortieQte]}>Sorties Qté</Text>
            <Text style={[styles.tableCol, styles.colSortiePU]}>Sorties P.U</Text>
            <Text style={[styles.tableCol, styles.colSortieMontant]}>Sorties Montant</Text>
            <Text style={[styles.tableCol, styles.colDispoQte]}>Disponible Qté</Text>
            <Text style={[styles.tableCol, styles.colDispoPU]}>Disponible P.U</Text>
            <Text style={[styles.tableCol, styles.colDispoMontant]}>Disponible Montant</Text>
          </View>
          
          {recalculatedMouvements.map((mouvement, index) => {
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCol, styles.colDate]}>{formatDate(new Date(mouvement.date))}</Text>
                <Text style={[styles.tableCol, styles.colType]}>{getTypeLabel(mouvement.type)}</Text>
                <Text style={[styles.tableCol, styles.colRef]}>{mouvement.referencePiece}</Text>
                <Text style={[styles.tableCol, styles.colOrigine]}>{mouvement.origine}</Text>
                <Text style={[styles.tableCol, styles.colEntreeQte]}>
                  {mouvement.type === 'ENTREE' ? mouvement.entreesQte || '-' : '-'}
                </Text>
                <Text style={[styles.tableCol, styles.colEntreePU]}>
                  {mouvement.type === 'ENTREE' && mouvement.entreesPU ? formatCurrency(mouvement.entreesPU) : '-'}
                </Text>
                <Text style={[styles.tableCol, styles.colEntreePT]}>
                  {mouvement.type === 'ENTREE' && mouvement.entreesPT ? formatCurrency(mouvement.entreesPT) : '-'}
                </Text>
                <Text style={[styles.tableCol, styles.colSortieQte]}>
                  {mouvement.type === 'SORTIE' ? mouvement.sortiesQte || '-' : '-'}
                </Text>
                <Text style={[styles.tableCol, styles.colSortiePU]}>
                  {mouvement.type === 'SORTIE' && mouvement.sortiesPU ? formatCurrency(mouvement.sortiesPU) : '-'}
                </Text>
                <Text style={[styles.tableCol, styles.colSortieMontant]}>
                  {mouvement.type === 'SORTIE' && mouvement.sortiesMontant ? formatCurrency(mouvement.sortiesMontant) : '-'}
                </Text>
                <Text style={[styles.tableCol, styles.colDispoQte]}>
                  {mouvement.disponibleQte}
                </Text>
                <Text style={[styles.tableCol, styles.colDispoPU]}>
                  {mouvement.disponiblePU ? formatCurrency(mouvement.disponiblePU) : '-'}
                </Text>
                <Text style={[styles.tableCol, styles.colDispoMontant]}>
                  {mouvement.disponibleMontant ? formatCurrency(mouvement.disponibleMontant) : '-'}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalRow}>
          <Text>Stock Final: {calculatedStock !== null && calculatedStock !== undefined ? calculatedStock : data.soldeFinal.qte}</Text>
          <Text>PUMP Final: {formatCurrency(data.soldeFinal.pump)}</Text>
          <Text>Valeur Stock Final: {formatCurrency(data.soldeFinal.montant)}</Text>
        </View>

        <View style={styles.signature}>
          <Text>Signature: _________________________</Text>
        </View>
      </Page>
    </Document>
  );
};

export default FicheStockPdf;