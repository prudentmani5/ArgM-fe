import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { CategorieGroup } from './RapportMouvementStock';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: { padding: 20, fontSize: 8 },
    header: { marginBottom: 15, textAlign: 'center' },
    title: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { fontSize: 10, marginBottom: 4 },
    categorieHeader: {
        fontWeight: 'bold',
        fontSize: 10,
        marginLeft: 10,
        marginTop: 8,
        marginBottom: 4,
        backgroundColor: '#f5f5f5',
        padding: 5,
        borderRadius: 2
    },
    table: { width: '100%', marginBottom: 8, borderWidth: 1, borderColor: '#000' },
    tableHeader: { backgroundColor: '#c0c0c0', color: '#000' },
    headerTopRow: { flexDirection: 'row' },
    headerSubRow: { flexDirection: 'row' },
    headerCellTop: {
        padding: 3,
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    headerCellTopLeft: { textAlign: 'left' },
    headerCellBlank: {
        padding: 3,
        fontSize: 7,
        borderRightWidth: 1,
        borderRightColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    headerSubCell: {
        padding: 3,
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#000',
        fontSize: 7
    },
    colCatalogue: { width: '12%', padding: 3, borderRightWidth: 1, borderRightColor: '#000' },
    colDesignation: { width: '26%', padding: 3, borderRightWidth: 1, borderRightColor: '#000' },
    colQte: { width: '6%', padding: 3, textAlign: 'right', borderRightWidth: 1, borderRightColor: '#000' },
    colMontant: { width: '8%', padding: 3, textAlign: 'right', borderRightWidth: 1, borderRightColor: '#000' },
    colStockPu: { width: '6%', padding: 3, textAlign: 'right', borderRightWidth: 1, borderRightColor: '#000' },
    totalRow: {
        marginTop: 4,
        marginLeft: 15,
        padding: 5,
        backgroundColor: '#e8f5e9',
        borderRadius: 2,
        fontSize: 8,
        fontWeight: 'bold'
    },
    grandTotal: {
        marginTop: 15,
        padding: 8,
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#fff3e0',
        borderRadius: 4
    },
    signature: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 9
    },
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 9,
        color: '#666'
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
        .replace(/BIF$/, ' ');
};

const formatQte = (value: number) => {
    return value.toFixed(2);
};

const isZeroRow = (item: CategorieGroup['items'][number]) => {
    const values = [
        item.qteInitiale,
        item.montantInitial,
        item.qteEntrees,
        item.montantEntrees,
        item.qteSorties,
        item.montantSorties,
        item.qteStock,
        item.prixUnitaireStock,
        item.montantStock
    ];

    return values.every((value) => (value ?? 0) === 0);
};

const isZeroCategory = (categorie: CategorieGroup) => {
    const values = [
        categorie.totalInitial,
        categorie.totalEntrees,
        categorie.totalSorties,
        categorie.totalStock
    ];

    return values.every((value) => (value ?? 0) === 0);
};

// Calculate if a category will fit on a page
const getCategoryHeight = (category: CategorieGroup): number => {
    // Estimate: header (30) + table header (30) + each row (15) + totals (30)
    return 30 + 30 + (category.items.length * 15) + 30;
};

// Maximum estimated height for content on a page (landscape A4 is ~595 points)
const MAX_PAGE_HEIGHT = 500; // Leave room for header and footer

const RapportMouvementStockPdf = ({
    data,
    dateDebut,
    dateFin
}: {
    data: CategorieGroup[];
    dateDebut: Date;
    dateFin: Date;
}) => {
    const visibleData = data
        .map((categorie) => ({
            ...categorie,
            items: categorie.items.filter((item) => !isZeroRow(item))
        }))
        .filter((categorie) => !isZeroCategory(categorie));

    const totalGeneral = {
        initial: data.reduce((sum, c) => sum + c.totalInitial, 0),
        entrees: data.reduce((sum, c) => sum + c.totalEntrees, 0),
        sorties: data.reduce((sum, c) => sum + c.totalSorties, 0),
        stock: data.reduce((sum, c) => sum + c.totalStock, 0)
    };

    // Group categories into pages
    const pages: CategorieGroup[][] = [];
    let currentPage: CategorieGroup[] = [];
    let currentHeight = 100; // Start with header height

    visibleData.forEach((categorie, index) => {
        const categoryHeight = getCategoryHeight(categorie);
        
        // If this is the first category on the page OR adding it would exceed page height
        if (currentHeight + categoryHeight > MAX_PAGE_HEIGHT && currentPage.length > 0) {
            // Start a new page
            pages.push([...currentPage]);
            currentPage = [categorie];
            currentHeight = 100 + categoryHeight; // Reset with new category
        } else {
            // Add to current page
            currentPage.push(categorie);
            currentHeight += categoryHeight;
        }

        // If this is the last category, add current page to pages
        if (index === visibleData.length - 1 && currentPage.length > 0) {
            pages.push([...currentPage]);
        }
    });

    return (
        <Document>
            {pages.map((pageCategories, pageIndex) => (
                <Page 
                    key={pageIndex} 
                    size="A4" 
                    orientation="landscape" 
                    style={styles.page}
                >
                    {/* Header only on first page */}
                    {pageIndex === 0 && (
                        <View style={styles.header}>
                            <Text style={styles.title}>Rapport de Mouvement de Stock</Text>
                            
                            <Text style={styles.subtitle}>
                                Période du {format(dateDebut, 'dd/MM/yyyy')} au {format(dateFin, 'dd/MM/yyyy')}
                            </Text>
                        </View>
                    )}

                    {pageCategories.map((categorie, catIndex) => (
                        <View key={`${pageIndex}-${catIndex}`}>
                            <Text style={styles.categorieHeader}>
                                {categorie.categorieLibelle}
                            </Text>

                            <View style={styles.table}>
                                <View style={styles.tableHeader}>
                                    <View style={styles.headerTopRow}>
                                        <Text style={[styles.headerCellTop, styles.headerCellTopLeft, { width: '12%' }]}>
                                            Catalogue
                                        </Text>
                                        <Text style={[styles.headerCellTop, styles.headerCellTopLeft, { width: '26%' }]}>
                                            Désignation
                                        </Text>
                                        <Text style={[styles.headerCellTop, { width: '14%' }]}>Situation initiale</Text>
                                        <Text style={[styles.headerCellTop, { width: '14%' }]}>Entrées</Text>
                                        <Text style={[styles.headerCellTop, { width: '14%' }]}>Sorties</Text>
                                        <Text style={[styles.headerCellTop, { width: '20%' }]}>Stock</Text>
                                    </View>
                                    <View style={styles.headerSubRow}>
                                        <Text style={[styles.headerCellBlank, { width: '12%' }]} />
                                        <Text style={[styles.headerCellBlank, { width: '26%' }]} />
                                        <Text style={[styles.headerSubCell, { width: '6%' }]}>Qte</Text>
                                        <Text style={[styles.headerSubCell, { width: '8%' }]}>Montant</Text>
                                        <Text style={[styles.headerSubCell, { width: '6%' }]}>Qte</Text>
                                        <Text style={[styles.headerSubCell, { width: '8%' }]}>Montant</Text>
                                        <Text style={[styles.headerSubCell, { width: '6%' }]}>Qte</Text>
                                        <Text style={[styles.headerSubCell, { width: '8%' }]}>Montant</Text>
                                        <Text style={[styles.headerSubCell, { width: '6%' }]}>Qte</Text>
                                        <Text style={[styles.headerSubCell, { width: '6%' }]}>PUStock</Text>
                                        <Text style={[styles.headerSubCell, { width: '8%' }]}>Montant</Text>
                                    </View>
                                </View>

                                {categorie.items.map((item, itemIndex) => (
                                    <View key={itemIndex} style={styles.tableRow}>
                                        <Text style={styles.colCatalogue}>{item.articleId || item.articleStockId}</Text>
                                        <Text style={styles.colDesignation}>{item.articleLibelle}</Text>
                                        <Text style={styles.colQte}>{formatQte(item.qteInitiale)}</Text>
                                        <Text style={styles.colMontant}>{formatCurrency(item.montantInitial)}</Text>
                                        <Text style={styles.colQte}>{formatQte(item.qteEntrees)}</Text>
                                        <Text style={styles.colMontant}>{formatCurrency(item.montantEntrees)}</Text>
                                        <Text style={styles.colQte}>{formatQte(item.qteSorties)}</Text>
                                        <Text style={styles.colMontant}>{formatCurrency(item.montantSorties)}</Text>
                                        <Text style={styles.colQte}>{formatQte(item.qteStock)}</Text>
                                        <Text style={styles.colStockPu}>{formatCurrency(item.prixUnitaireStock)}</Text>
                                        <Text style={styles.colMontant}>{formatCurrency(item.montantStock)}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.totalRow}>
                                <Text>
                                    Total Catégorie - Initial: {formatCurrency(categorie.totalInitial)} |{' '}
                                    Entrées: {formatCurrency(categorie.totalEntrees)} |{' '}
                                    Sorties: {formatCurrency(categorie.totalSorties)} |{' '}
                                    Stock: {formatCurrency(categorie.totalStock)}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {/* Grand total and signatures only on last page */}
                    {pageIndex === pages.length - 1 && (
                        <>
                            <View style={styles.grandTotal}>
                                <Text>
                                    TOTAL GÉNÉRAL -{' '}
                                    Initial: {formatCurrency(totalGeneral.initial)} |{' '}
                                    Entrées: {formatCurrency(totalGeneral.entrees)} |{' '}
                                    Sorties: {formatCurrency(totalGeneral.sorties)} |{' '}
                                    Stock Final: {formatCurrency(totalGeneral.stock)}
                                </Text>
                            </View>

                            <View style={styles.signature}>
                                <Text>Préparé par: _________________________</Text>
                                <Text>Vérifié par: _________________________</Text>
                                <Text>Approuvé par: _________________________</Text>
                            </View>
                        </>
                    )}

                    {/* Page number */}
                    <Text 
                        style={styles.pageNumber}
                        render={({ pageNumber, totalPages }) => (
                            `Page ${pageNumber} sur ${totalPages}`
                        )}
                        fixed
                    />
                </Page>
            ))}
        </Document>
    );
};

export default RapportMouvementStockPdf;
