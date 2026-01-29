// RapportSortiesPdf.tsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { RapportSortieCategorieGroup, RapportSortieParams } from './RapportSorties';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 9,
    fontFamily: 'Helvetica'
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
  categoryHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    padding: 4,
    backgroundColor: '#f0f0f0'
  },
  table: {
    width: '100%',
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    backgroundColor: '#f8f8f8',
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid'
  },
  tableColHeader: {
    padding: 4,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tableCol: {
    padding: 4
  },
  articleCol: {
    width: '55%',
    textAlign: 'left'
  },
  quantityCol: {
    width: '15%',
    textAlign: 'right'
  },
  priceCol: {
    width: '15%',
    textAlign: 'right'
  },
  totalCol: {
    width: '15%',
    textAlign: 'right'
  },
  subCategoryTitleRow: {
    backgroundColor: '#fafafa',
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    borderBottomStyle: 'solid'
  },
  subCategoryTotalRow: {
    flexDirection: 'row',
    fontWeight: 'bold',
    padding: 4,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 0.5,
    borderTopColor: '#999',
    borderTopStyle: 'solid',
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    borderBottomStyle: 'solid'
  },
  categorySubTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 15,
    padding: 6,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    fontSize: 10
  },
  grandTotalRow: {
    flexDirection: 'row',
    marginTop: 15,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderTopWidth: 2,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    fontSize: 11
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: 'center',
    color: '#666'
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 8
  }
});

interface RapportSortiesPdfProps {
  data: RapportSortieCategorieGroup[];
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

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return '';
    
    // Format personnalisé avec espace comme séparateur de milliers
    return Math.round(value).toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Fonction pour rendre une catégorie avec sous-catégories
  const renderCategoryWithSubcategories = (category: RapportSortieCategorieGroup) => {
    // Utiliser sousCategoriesList si disponible, sinon sousCategories
    const sousCategories = category.sousCategoriesList || category.sousCategories || [];
    
    return (
      <View key={category.categorieId} style={{ marginBottom: 15 }}>
        {/* En-tête de la catégorie */}
        <View style={styles.categoryHeader}>
          <Text>Catégorie: {category.categorieNom}</Text>
        </View>
        
        {/* Tableau d'en-tête unique */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColHeader, styles.articleCol]}>Article</Text>
            <Text style={[styles.tableColHeader, styles.quantityCol]}>Qté </Text>
            <Text style={[styles.tableColHeader, styles.priceCol]}>Prix </Text>
            <Text style={[styles.tableColHeader, styles.totalCol]}>Total</Text>
          </View>
          
          {/* Afficher toutes les sous-catégories dans le même tableau */}
          {sousCategories.map((sousCategorie, subIndex) => (
            <React.Fragment key={subIndex}>
              {/* Titre de la sous-catégorie */}
              <View style={[styles.tableRow, styles.subCategoryTitleRow]}>
                <Text style={[styles.tableCol, styles.articleCol, { fontWeight: 'bold' }]}>
                  {sousCategorie.sousCategorieNom}
                </Text>
                <Text style={[styles.tableCol, styles.quantityCol]}></Text>
                <Text style={[styles.tableCol, styles.priceCol]}></Text>
                <Text style={[styles.tableCol, styles.totalCol]}></Text>
              </View>
              
              {/* Articles de la sous-catégorie */}
              {sousCategorie.items.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCol, styles.articleCol]}>{item.articleLibelle || ''}</Text>
                  <Text style={[styles.tableCol, styles.quantityCol]}>{item.totalQuantite || ''}</Text>
                  <Text style={[styles.tableCol, styles.priceCol]}>{formatCurrency(item.prixMoyen)}</Text>
                  <Text style={[styles.tableCol, styles.totalCol]}>{formatCurrency(item.totalMontant)}</Text>
                </View>
              ))}
              
              {/* Sous-total de la sous-catégorie */}
              <View style={styles.subCategoryTotalRow}>
                <Text style={[styles.tableCol, styles.articleCol, { textAlign: 'right' }]}>
                  Sous-total {sousCategorie.sousCategorieNom}:
                </Text>
                <Text style={[styles.tableCol, styles.quantityCol]}>{sousCategorie.totalQuantite}</Text>
                <Text style={[styles.tableCol, styles.priceCol]}></Text>
                <Text style={[styles.tableCol, styles.totalCol, { fontWeight: 'bold' }]}>
                  {formatCurrency(sousCategorie.totalMontant)}
                </Text>
              </View>
            </React.Fragment>
          ))}
          
          {/* Si pas de sous-catégories, afficher directement les articles groupés */}
          {(sousCategories.length === 0) && category.items.length > 0 && (
            <>
              {category.items.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCol, styles.articleCol]}>{item.articleLibelle || ''}</Text>
                  <Text style={[styles.tableCol, styles.quantityCol]}>{item.totalQuantite || ''}</Text>
                  <Text style={[styles.tableCol, styles.priceCol]}>{formatCurrency(item.prixMoyen)}</Text>
                  <Text style={[styles.tableCol, styles.totalCol]}>{formatCurrency(item.totalMontant)}</Text>
                </View>
              ))}
              
              {/* Sous-total de la catégorie (sans sous-catégories) */}
              <View style={styles.subCategoryTotalRow}>
                <Text style={[styles.tableCol, styles.articleCol, { textAlign: 'right' }]}>
                  Sous-total {category.categorieNom}:
                </Text>
                <Text style={[styles.tableCol, styles.quantityCol]}>{category.totalQuantite}</Text>
                <Text style={[styles.tableCol, styles.priceCol]}></Text>
                <Text style={[styles.tableCol, styles.totalCol, { fontWeight: 'bold' }]}>
                  {formatCurrency(category.totalMontant)}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  // Calculer les totaux généraux
  const totalGeneralArticles = data.reduce((sum, group) => sum + group.totalArticles, 0);
  const totalGeneralQuantite = data.reduce((sum, group) => sum + group.totalQuantite, 0);
  const totalGeneralMontant = data.reduce((sum, group) => sum + group.totalMontant, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>LISTING DES SORTIES</Text>
          <Text style={styles.subtitle}>
            Période du {formatDate(dateDebut)} au {formatDate(dateFin)}
          </Text>
          {searchParams.numeroPiece && (
            <Text style={{ fontSize: 10, marginBottom: 3 }}>
              Numéro de Pièce: {searchParams.numeroPiece}
            </Text>
          )}
          {searchParams.magasinId && (
            <Text style={{ fontSize: 10 }}>
              Magasin: {searchParams.magasinId}
            </Text>
          )}
          {searchParams.serviceId && (
            <Text style={{ fontSize: 10 }}>
              Service: {searchParams.serviceId}
            </Text>
          )}
        </View>

        {/* Contenu principal */}
        {data.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 11 }}>
            Aucune sortie trouvée pour cette période
          </Text>
        ) : (
          <>
            {/* Affichage des catégories */}
            {data.map((categorie, index) => (
              <View key={index}>
                {renderCategoryWithSubcategories(categorie)}
              </View>
            ))}

            {/* Total Général */}
            <View style={styles.grandTotalRow}>
              <Text>Articles différents: {totalGeneralArticles}</Text>
              <Text style={{ marginLeft: 'auto', marginRight: 20 }}>Quantité totale: {totalGeneralQuantite}</Text>
              <Text>Total Général: {formatCurrency(totalGeneralMontant)}</Text>
            </View>
          </>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <Text>Signature: _________________________</Text>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>Généré le {new Date().toLocaleDateString('fr-FR')} - © Copyright BUPORTIS 2025</Text>
        </View>
        
        {/* Numéro de page */}
        <Text style={styles.pageNumber}>1/1</Text>
      </Page>
    </Document>
  );
};

export default RapportSortiesPdf;