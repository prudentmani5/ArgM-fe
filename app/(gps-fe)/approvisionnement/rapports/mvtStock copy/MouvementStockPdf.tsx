// MouvementStockPdf.tsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { MouvementStockData, MouvementStockGrouped } from './MouvementStock';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 6,  // Taille réduite pour plus de données
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
  // Largeurs des colonnes optimisées
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
}

const MouvementStockPdf: React.FC<MouvementStockPdfProps> = ({ 
  data, dateDebut, dateFin, groupedData 
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
  
  // Situation initiale générale
  const totalGeneralSituationQte = groupedData.reduce((sum, group) => {
    return sum + group.items.reduce((itemSum, item) => itemSum + (item.situationInitiale?.qte || 0), 0);
  }, 0);
  
  const totalGeneralSituationMontant = groupedData.reduce((sum, group) => {
    return sum + group.items.reduce((itemSum, item) => itemSum + (item.situationInitiale?.montant || 0), 0);
  }, 0);

  const totalGeneralEntreesQte = groupedData.reduce((sum, group) => sum + group.totalEntrees.qte, 0);
  const totalGeneralEntreesMontant = groupedData.reduce((sum, group) => sum + group.totalEntrees.montant, 0);
  const totalGeneralSortiesQte = groupedData.reduce((sum, group) => sum + group.totalSorties.qte, 0);
  const totalGeneralSortiesMontant = groupedData.reduce((sum, group) => sum + group.totalSorties.montant, 0);
  const totalGeneralStockQte = groupedData.reduce((sum, group) => sum + group.totalStock.qte, 0);
  const totalGeneralStockMontant = groupedData.reduce((sum, group) => sum + group.totalStock.montant, 0);

  // Fonction pour calculer les totaux par catégorie
  const calculateCategoryTotals = (group: MouvementStockGrouped) => {
    const situationQte = group.items.reduce((sum, item) => sum + (item.situationInitiale?.qte || 0), 0);
    const situationMontant = group.items.reduce((sum, item) => sum + (item.situationInitiale?.montant || 0), 0);
    
    return {
      situationQte,
      situationMontant,
      entreesQte: group.totalEntrees.qte,
      entreesMontant: group.totalEntrees.montant,
      sortiesQte: group.totalSorties.qte,
      sortiesMontant: group.totalSorties.montant,
      stockQte: group.totalStock.qte,
      stockMontant: group.totalStock.montant
    };
  };

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
            Total articles: {totalGeneralArticles} • Catégories: {groupedData.length}
          </Text>
        </View>

        {groupedData.length > 0 ? (
          <>
            {groupedData.map((group: MouvementStockGrouped, index: number) => {
              const categoryTotals = calculateCategoryTotals(group);
              
              return (
                <View key={index} style={styles.groupContainer} wrap={false}>
                  {/* En-tête de catégorie */}
                  <View style={styles.groupHeader}>
                    <Text>
                      Catégorie: {group.categorie} - 
                      Articles: {group.totalArticles}
                    </Text>
                  </View>
                  
                  {/* Tableau des articles - TOUS les articles affichés */}
                  <View style={styles.table}>
                    {/* En-tête du tableau */}
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableColHeader, styles.colCatalogue]}>Catalogue</Text>
                      <Text style={[styles.tableColHeader, styles.colNomArticle]}>Article</Text>
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
                    
                    {/* Lignes de données - TOUS les articles */}
                    {group.items.map((item: any, itemIndex: number) => (
                      <View key={itemIndex} style={styles.tableRow}>
                        <Text style={[styles.tableCol, styles.colCatalogue]}>{item.catalogue || '-'}</Text>
                        <Text style={[styles.tableCol, styles.colNomArticle]}>{item.nomArticle || '-'}</Text>
                        
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
                            <Text style={{ width: '40%' }}>{formatNumber(item.stock?.qte)}</Text>
                            <Text style={{ width: '30%' }}>{formatCurrency(item.stock?.puStock)}</Text>
                            <Text style={{ width: '30%', color: '#2980b9' }}>{formatCurrency(item.stock?.montant)}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                {/*   SOMMATION COMPLÈTE POUR LA CATÉGORIE */}
                  <View style={styles.categorySummary}>
                    <Text style={{ width: '25%' }}> {group.categorie.toUpperCase()}:</Text>
                    {/*  <Text style={{ width: '15%' }}>Articles: {group.totalArticles}</Text>  */}
                    <Text style={{ width: '12%' }}>
                      Sit: {formatNumber(categoryTotals.situationQte)}
                    </Text>
                    <Text style={{ width: '12%', color: '#2980b9' }}>
                      {formatCurrency(categoryTotals.situationMontant)}
                    </Text>
                    <Text style={{ width: '12%', color: '#27ae60' }}>
                      Ent: {formatNumber(categoryTotals.entreesQte)}
                    </Text>
                    <Text style={{ width: '12%', color: '#e74c3c' }}>
                      Sort: {formatNumber(categoryTotals.sortiesQte)}
                    </Text>
                    <Text style={{ width: '12%' }}>
                      Stock: {formatNumber(categoryTotals.stockQte)}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* TOTAUX GÉNÉRAUX COMPLETS */}
            <View style={styles.totalRow}>
              <Text style={{ width: '12%' }}>TOTAUX GÉNÉRAUX:</Text>
             {/*  <Text style={{ width: '10%' }}>Articles: {totalGeneralArticles}</Text>*/}
              <Text style={{ width: '11%' }}>
                Sit: {formatNumber(totalGeneralSituationQte)}
              </Text>
              <Text style={{ width: '11%' }}>
                {formatCurrency(totalGeneralSituationMontant)}
              </Text>
              <Text style={{ width: '11%' }}>
                Ent: {formatNumber(totalGeneralEntreesQte)}
              </Text>
              <Text style={{ width: '11%' }}>
                {formatCurrency(totalGeneralEntreesMontant)}
              </Text>
              <Text style={{ width: '11%' }}>
                Sort: {formatNumber(totalGeneralSortiesQte)}
              </Text>
              <Text style={{ width: '11%' }}>
                {formatCurrency(totalGeneralSortiesMontant)}
              </Text>
              <Text style={{ width: '12%' }}>
                Stock: {formatNumber(totalGeneralStockQte)}
              </Text>
            </View>

            {/* RÉSUMÉ FINAL DÉTAILLÉ */}
            <View style={{ 
              flexDirection: 'row', 
              marginTop: 8, 
              padding: 4, 
              backgroundColor: '#e8f4fd',
              border: '0.5pt solid #b3d9ff',
              fontSize: 6.5,
              justifyContent: 'space-between'
            }}>
              <Text style={{ fontWeight: 'bold' }}>SOLDE FINAL DÉTAILLÉ:</Text>
              <Text>
                Situation Initiale: {formatCurrency(totalGeneralSituationMontant)} |
                Entrées: {formatCurrency(totalGeneralEntreesMontant)} |
                Sorties: {formatCurrency(totalGeneralSortiesMontant)} |
                Stock Final: {formatCurrency(totalGeneralStockMontant)}
              </Text>
            </View>
          </>
        ) : (
          <View style={{ marginTop: 20, textAlign: 'center' }}>
            <Text>Aucun mouvement trouvé pour la période sélectionnée</Text>
          </View>
        )}

        <View style={styles.signature}>
          <Text>Signature: _________________________</Text>
        </View>
      </Page>
    </Document>
  );
};

export default MouvementStockPdf;