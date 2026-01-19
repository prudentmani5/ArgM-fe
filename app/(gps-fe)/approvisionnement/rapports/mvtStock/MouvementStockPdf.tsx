// MouvementStockPdf.tsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { MouvementStockData, MouvementStockGrouped } from './MouvementStock';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 6,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 15,
    textAlign: 'center',
    borderBottom: '1pt solid #000',
    paddingBottom: 8
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 9,
    marginBottom: 3
  },
  groupContainer: {
    marginBottom: 10
  },
  groupHeader: {
    backgroundColor: '#f2f2f2',
    padding: 5,
    marginBottom: 6,
    border: '1pt solid #ddd',
    fontWeight: 'bold',
    fontSize: 8
  },
  table: {
    width: '100%',
    marginBottom: 8
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    fontWeight: 'bold',
    fontSize: 6
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    fontSize: 5.5,
    minHeight: 18
  },
  tableColHeader: {
    padding: 2,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tableCol: {
    padding: 2,
    textAlign: 'center',
    borderRightWidth: 0.3,
    borderRightColor: '#e0e0e0',
    borderRightStyle: 'solid'
  },
  categorySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e8f4fd',
    padding: 4,
    marginTop: 4,
    border: '0.5pt solid #b3d9ff',
    fontSize: 6.5,
    fontWeight: 'bold'
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 12,
    fontWeight: 'bold',
    backgroundColor: '#2c5aa0',
    color: 'white',
    padding: 5,
    fontSize: 7
  },
  signature: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    fontSize: 6
  },
  colCatalogue: { width: '10%' },
  colNomArticle: { width: '16%' },
  colSituation: { width: '12%' },
  colEntrees: { width: '12%' },
  colSorties: { width: '12%' },
  colStock: { width: '18%' },
  subCol: { width: '50%' }
});

interface MouvementStockPdfProps {
  data: MouvementStockData;
  dateDebut: Date;
  dateFin: Date;
  groupedData: MouvementStockGrouped[];
  calculatedStocks?: Map<string, { qte: number; situationInitiale: number; entrees: number; sorties: number }>;
}

const MouvementStockPdf: React.FC<MouvementStockPdfProps> = ({
  data, dateDebut, dateFin, groupedData, calculatedStocks
}) => {
  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Date invalide';
    }
    return date.toLocaleDateString('fr-FR');
  };

  const formatCurrency = (value: number | null) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'BIF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatNumber = (value: number | undefined | null) => {
    const numValue = value || 0;
    return new Intl.NumberFormat('fr-FR').format(numValue);
  };

  const safeData = {
    periode: data?.periode || 'Période non définie',
    mouvements: Array.isArray(data?.mouvements) ? data.mouvements : []
  };

  // CALCUL DES SOMMATIONS COMPLÈTES
  const totalGeneralArticles = groupedData.reduce((sum, group) => sum + group.totalArticles, 0);
  
  const totalGeneralSituationQte = groupedData.reduce((sum, group) => sum + group.totalSituationInitiale.qte, 0);
  const totalGeneralSituationMontant = groupedData.reduce((sum, group) => sum + group.totalSituationInitiale.montant, 0);
  const totalGeneralEntreesQte = groupedData.reduce((sum, group) => sum + group.totalEntrees.qte, 0);
  const totalGeneralEntreesMontant = groupedData.reduce((sum, group) => sum + group.totalEntrees.montant, 0);
  const totalGeneralSortiesQte = groupedData.reduce((sum, group) => sum + group.totalSorties.qte, 0);
  const totalGeneralSortiesMontant = groupedData.reduce((sum, group) => sum + group.totalSorties.montant, 0);
  const totalGeneralStockQte = groupedData.reduce((sum, group) => sum + group.totalStock.qte, 0);
  const totalGeneralStockMontant = groupedData.reduce((sum, group) => sum + group.totalStock.montant, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.header}>
          <Text style={styles.title}>Rapport de Mouvement de Stock</Text>
          <Text style={styles.subtitle}>
            Période: {formatDate(dateDebut)} au {formatDate(dateFin)}
          </Text>
          <Text style={styles.subtitle}>
            {safeData.periode}
          </Text>
          <Text style={styles.subtitle}>
            Total articles: {totalGeneralArticles} | Groupes: {groupedData.length}
          </Text>
        </View>

        {groupedData.length > 0 ? (
          <>
            {groupedData.map((group: MouvementStockGrouped, index: number) => (
              <View key={index} style={styles.groupContainer} wrap={false}>
                {/* En-tête de catégorie */}
                <View style={styles.groupHeader}>
                  <Text>
                    Categorie: {group.categorie} - Magasin: {group.magasin} - Articles: {group.totalArticles}
                  </Text>
                </View>
                
                {/* Tableau des articles */}
                <View style={styles.table}>
                  {/* En-tête du tableau */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableColHeader, styles.colNomArticle]}>Nom article</Text>
                    <Text style={[styles.tableColHeader, styles.colCatalogue]}>Catalogue</Text>
                    <View style={[styles.tableColHeader, styles.colSituation]}>
                      <Text>Situation</Text>
                      <View style={{ flexDirection: 'row', marginTop: 1 }}>
                        <Text style={[styles.subCol, { fontSize: 5 }]}>Qté</Text>
                        <Text style={[styles.subCol, { fontSize: 5 }]}>Montant</Text>
                      </View>
                    </View>
                    <View style={[styles.tableColHeader, styles.colEntrees]}>
                      <Text>Entrées</Text>
                      <View style={{ flexDirection: 'row', marginTop: 1 }}>
                        <Text style={[styles.subCol, { fontSize: 5 }]}>Qté</Text>
                        <Text style={[styles.subCol, { fontSize: 5 }]}>Montant</Text>
                      </View>
                    </View>
                    <View style={[styles.tableColHeader, styles.colSorties]}>
                      <Text>Sorties</Text>
                      <View style={{ flexDirection: 'row', marginTop: 1 }}>
                        <Text style={[styles.subCol, { fontSize: 5 }]}>Qté</Text>
                        <Text style={[styles.subCol, { fontSize: 5 }]}>Montant</Text>
                      </View>
                    </View>
                    <View style={[styles.tableColHeader, styles.colStock]}>
                      <Text>Stock</Text>
                      <View style={{ flexDirection: 'row', marginTop: 1 }}>
                        <Text style={{ width: '40%', fontSize: 5 }}>Qté</Text>
                        <Text style={{ width: '30%', fontSize: 5 }}>P.U</Text>
                        <Text style={{ width: '30%', fontSize: 5 }}>Montant</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Lignes de données */}
                  {group.items.map((item: any, itemIndex: number) => (
                    <View key={itemIndex} style={styles.tableRow}>
                      <Text style={[styles.tableCol, styles.colNomArticle]}>{item.nomArticle || '-'}</Text>
                      <Text style={[styles.tableCol, styles.colCatalogue]}>{item.catalogue || '-'}</Text>
                      
                      <View style={[styles.tableCol, styles.colSituation]}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={[styles.subCol]}>{formatNumber(item.situationInitiale?.qte)}</Text>
                          <Text style={[styles.subCol]}>{formatCurrency(item.situationInitiale?.montant)}</Text>
                        </View>
                      </View>
                      
                      <View style={[styles.tableCol, styles.colEntrees]}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={[styles.subCol, { color: '#27ae60' }]}>{formatNumber(item.entrees?.qte)}</Text>
                          <Text style={[styles.subCol, { color: '#27ae60' }]}>{formatCurrency(item.entrees?.montant)}</Text>
                        </View>
                      </View>
                      
                      <View style={[styles.tableCol, styles.colSorties]}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={[styles.subCol, { color: '#e74c3c' }]}>{formatNumber(item.sorties?.qte)}</Text>
                          <Text style={[styles.subCol, { color: '#e74c3c' }]}>{formatCurrency(item.sorties?.montant)}</Text>
                        </View>
                      </View>
                      
                      <View style={[styles.tableCol, styles.colStock]}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ width: '40%' }}>
                            {formatNumber(
                              calculatedStocks && calculatedStocks.get(item.numeroPiece) !== undefined
                                ? calculatedStocks.get(item.numeroPiece)!.qte
                                : item.stock?.qte
                            )}
                          </Text>
                          <Text style={{ width: '30%' }}>{formatCurrency(item.stock?.puStock)}</Text>
                          <Text style={{ width: '30%', color: '#2980b9' }}>{formatCurrency(item.stock?.montant)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* SOMMATION POUR LA CATÉGORIE */}
                <View style={styles.categorySummary}>
                  <Text style={{ width: '25%' }}>{group.categorie.toUpperCase()} - {group.magasin}:</Text>
                  <Text style={{ width: '12%' }}>
                    Sit: {formatNumber(group.totalSituationInitiale.qte)}
                  </Text>
                  <Text style={{ width: '12%' }}>
                    {formatCurrency(group.totalSituationInitiale.montant)}
                  </Text>
                  <Text style={{ width: '12%', color: '#27ae60' }}>
                    Ent: {formatNumber(group.totalEntrees.qte)}
                  </Text>
                  <Text style={{ width: '12%', color: '#27ae60' }}>
                    {formatCurrency(group.totalEntrees.montant)}
                  </Text>
                  <Text style={{ width: '12%', color: '#e74c3c' }}>
                    Sort: {formatNumber(group.totalSorties.qte)}
                  </Text>
                  <Text style={{ width: '12%', color: '#e74c3c' }}>
                    {formatCurrency(group.totalSorties.montant)}
                  </Text>
                  <Text style={{ width: '12%' }}>
                    Stock: {formatNumber(group.totalStock.qte)}
                  </Text>
                  <Text style={{ width: '12%' }}>
                    {formatCurrency(group.totalStock.montant)}
                  </Text>
                </View>
              </View>
            ))}

            {/* TOTAUX GÉNÉRAUX COMPLETS */}
            <View style={styles.totalRow}>
              <Text style={{ width: '25%' }}>TOTAUX GÉNÉRAUX:</Text>
              <Text style={{ width: '12%' }}>
                Qté: {formatNumber(totalGeneralSituationQte)}
              </Text>
              <Text style={{ width: '12%' }}>
                {formatCurrency(totalGeneralSituationMontant)}
              </Text>
              <Text style={{ width: '12%' }}>
                Qté: {formatNumber(totalGeneralEntreesQte)}
              </Text>
              <Text style={{ width: '12%' }}>
                {formatCurrency(totalGeneralEntreesMontant)}
              </Text>
              <Text style={{ width: '12%' }}>
                Qté: {formatNumber(totalGeneralSortiesQte)}
              </Text>
              <Text style={{ width: '12%' }}>
                {formatCurrency(totalGeneralSortiesMontant)}
              </Text>
              <Text style={{ width: '12%' }}>
                Qté: {formatNumber(totalGeneralStockQte)}
              </Text>
              <Text style={{ width: '12%' }}>
                {formatCurrency(totalGeneralStockMontant)}
              </Text>
            </View>
          </>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Aucune donnée disponible pour cette période
          </Text>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <Text>Généré le {new Date().toLocaleDateString('fr-FR')}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default MouvementStockPdf;