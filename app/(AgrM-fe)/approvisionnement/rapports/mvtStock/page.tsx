// MouvementStockPage.tsx
'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { format, startOfDay, endOfDay } from 'date-fns';
import axios from 'axios';
import MouvementStockForm from './MouvementStockForm';
import { MouvementStockData, MouvementStockItem, MouvementStockGrouped } from './MouvementStock';
import React from 'react';
import { API_BASE_URL } from '@/utils/apiConfig';

const BASE_URL = `${API_BASE_URL}/mouvementStock/findall`;

const MouvementStockPage: React.FC = () => {
  const [mouvementStockData, setMouvementStockData] = useState<MouvementStockData | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef<Toast>(null);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [expandedRows, setExpandedRows] = useState<any>(null);
  const [pdfGeneration, setPdfGeneration] = useState({
    loading: false,
    progress: 0
  });
  const [calculatedStocks, setCalculatedStocks] = useState<Map<string, { qte: number; situationInitiale: number; entrees: number; sorties: number }>>(new Map());
  const [isCalculatingStock, setIsCalculatingStock] = useState(false);

  const getMagasinLabel = (mouvement: MouvementStockItem) => {
    if (mouvement.magasinNom) {
      return mouvement.magasinNom;
    }
    if (mouvement.magasin?.nom) {
      return mouvement.magasin.nom;
    }
    if (mouvement.magasinId) {
      return mouvement.magasinId;
    }
    return 'Magasin non defini';
  };

  // FONCTION DE GROUPEMENT CORRIGÉE
  const groupedData = useMemo((): MouvementStockGrouped[] => {
    if (!mouvementStockData?.mouvements || mouvementStockData.mouvements.length === 0) {
      return [];
    }

    const grouped = mouvementStockData.mouvements.reduce(
      (acc: { [key: string]: { categorie: string; magasin: string; magasinId?: string; items: MouvementStockItem[] } }, mouvement) => {
        const categorie = mouvement.categorie || 'Non classe';
        const magasin = getMagasinLabel(mouvement);
        const groupKey = `${categorie}||${magasin}`;

        if (!acc[groupKey]) {
          acc[groupKey] = {
            categorie,
            magasin,
            magasinId: mouvement.magasinId,
            items: []
          };
        }

        acc[groupKey].items.push(mouvement);
        return acc;
      },
      {}
    );

    return Object.entries(grouped).map(([groupKey, group]) => {
      const { categorie, magasin, magasinId, items } = group;
      // CALCUL DES TOTAUX CORRECTS POUR CHAQUE CATEGORIE
      const totalSituationInitiale = items.reduce(
        (acc, item) => ({
          qte: acc.qte + (item.situationInitiale?.qte || 0),
          montant: acc.montant + (item.situationInitiale?.montant || 0),
        }),
        { qte: 0, montant: 0 }
      );

      const totalEntrees = items.reduce(
        (acc, item) => ({
          qte: acc.qte + (item.entrees?.qte || 0),
          montant: acc.montant + (item.entrees?.montant || 0),
        }),
        { qte: 0, montant: 0 }
      );

      const totalSorties = items.reduce(
        (acc, item) => ({
          qte: acc.qte + (item.sorties?.qte || 0),
          montant: acc.montant + (item.sorties?.montant || 0),
        }),
        { qte: 0, montant: 0 }
      );

      const totalStock = items.reduce(
        (acc, item) => {
          const calculated = calculatedStocks.get(item.numeroPiece);
          const qte = calculated !== undefined ? calculated.qte : (item.stock?.qte || 0);
          return {
            qte: acc.qte + qte,
            montant: acc.montant + (item.stock?.montant || 0),
          };
        },
        { qte: 0, montant: 0 }
      );

      return {
        groupKey,
        categorie,
        magasin,
        magasinId,
        totalArticles: items.length,
        totalSituationInitiale,
        totalEntrees,
        totalSorties,
        totalStock,
        items: items.sort((a, b) => (a.nomArticle || '').localeCompare(b.nomArticle || ''))
      };
    }).sort((a, b) => {
      const categorieCompare = (a.categorie || '').localeCompare(b.categorie || '');
      if (categorieCompare != 0) {
        return categorieCompare;
      }
      return (a.magasin || '').localeCompare(b.magasin || '');
    });
  }, [mouvementStockData, calculatedStocks]);

  const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  /**
   * Calculate stock for all articles using Fiche Stock approach
   *
   * This function uses the EXACT same logic as ficheStock/page.tsx:
   * - Fetches all inventories, entries, exits from API endpoints
   * - Filters by current fiscal year
   * - Finds latest inventory for the year
   * - Calculates TotQteI (inventory), TotQteE (entries), TotQteS (exits)
   * - Applies formula: qteStock = (TotQteE + TotQteI) - TotQteS
   *
   * For each article in Movement Stock, we calculate:
   * - Stock Initial (Inventaire) = TotQteI from latest fiscal year inventory
   * - Stock Final = (TotQteE + TotQteI) - TotQteS
   */
  const calculateStockForAllArticles = async (items: MouvementStockItem[]) => {
    setIsCalculatingStock(true);

    try {
      console.log(`📊 Calculating stock for ${items.length} articles using Fiche Stock approach...`);

      const currentYear = new Date().getFullYear().toString();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

      // Step 0: Fetch all articles to map catalogue → articleId
      console.log('Fetching all articles for mapping...');
      const articlesResponse = await fetch(`${API_BASE_URL}/stkarticle/findall`);
      const allArticles = articlesResponse.ok ? await articlesResponse.json() : [];

      // Create a mapping from catalogue to articleId
      const catalogueToArticleId = new Map<string, string>();
      allArticles.forEach((article: any) => {
        if (article.catalogue && article.articleId) {
          catalogueToArticleId.set(article.catalogue, article.articleId);
        }
      });
      console.log(`Created mapping for ${catalogueToArticleId.size} articles (catalogue → articleId)`);

      // Step 1: Fetch all inventories once
      console.log('Fetching all inventories...');
      const inventairesResponse = await fetch(`${API_BASE_URL}/stkinventaire/findall`);
      const allInventaires = inventairesResponse.ok ? await inventairesResponse.json() : [];
      console.log(`Fetched ${allInventaires.length} inventories`);

      // Step 2: Fetch all entries once
      console.log('Fetching all entries...');
      const entreesResponse = await fetch(`${API_BASE_URL}/stkEntrees/findall`);
      const allEntrees = entreesResponse.ok ? await entreesResponse.json() : [];
      console.log(`Fetched ${allEntrees.length} entries`);

      // Step 3: Fetch all exits once
      console.log('Fetching all exits...');
      const sortiesResponse = await fetch(`${API_BASE_URL}/stkSorties/findall`);
      const allSorties = sortiesResponse.ok ? await sortiesResponse.json() : [];
      console.log(`Fetched ${allSorties.length} exits`);

      // Step 4: Filter inventories for current fiscal year
      const currentYearInventaires = allInventaires.filter((inv: any) => {
        if (!inv.dateInventaire) return false;
        const invDate = new Date(inv.dateInventaire);
        return invDate.getFullYear().toString() === currentYear;
      });
      console.log(`Found ${currentYearInventaires.length} inventories for year ${currentYear}`);

      // Step 5: Find latest inventory for current year
      let latestInventaire = null;
      let inventaireDetails: any[] = [];

      if (currentYearInventaires.length > 0) {
        latestInventaire = currentYearInventaires.reduce((latest: any, current: any) => {
          const latestDate = new Date(latest.dateInventaire);
          const currentDate = new Date(current.dateInventaire);
          return currentDate > latestDate ? current : latest;
        });

        console.log(`Latest inventory: ${latestInventaire.inventaireId} (${latestInventaire.dateInventaire})`);

        // Fetch inventory details for latest inventory
        const invDetailsResponse = await fetch(
          `${API_BASE_URL}/inventaireDetails/findbyinventaire?inventaireId=${latestInventaire.inventaireId}`
        );
        if (invDetailsResponse.ok) {
          inventaireDetails = await invDetailsResponse.json();
          console.log(`Fetched ${inventaireDetails.length} inventory details`);
        }
      }

      // Step 6: Filter entries for current fiscal year
      const currentYearEntrees = allEntrees.filter((entree: any) => {
        if (!entree.dateEntree) return false;
        const entreeDate = new Date(entree.dateEntree);
        return entreeDate.getFullYear().toString() === currentYear;
      });
      console.log(`Found ${currentYearEntrees.length} entries for year ${currentYear}`);

      // Step 7: Fetch all entry details for current year entries
      let allEntreeDetails: any[] = [];
      for (const entree of currentYearEntrees) {
        const detailsResponse = await fetch(
          `${API_BASE_URL}/stkEntreeDetails/findbyentree?entreeId=${entree.entreeId}`
        );
        if (detailsResponse.ok) {
          const details = await detailsResponse.json();
          allEntreeDetails = allEntreeDetails.concat(details);
        }
      }
      console.log(`Fetched ${allEntreeDetails.length} entry details`);

      // Step 8: Filter exits for current fiscal year
      const currentYearSorties = allSorties.filter((sortie: any) => {
        if (!sortie.dateSortie) return false;
        const sortieDate = new Date(sortie.dateSortie);
        return sortieDate.getFullYear().toString() === currentYear;
      });
      console.log(`Found ${currentYearSorties.length} exits for year ${currentYear}`);

      // Step 9: Fetch all exit details for current year exits
      let allSortieDetails: any[] = [];
      for (const sortie of currentYearSorties) {
        const detailsResponse = await fetch(
          `${API_BASE_URL}/stkSortieDetails/findbysortie?sortieId=${sortie.sortieId}`
        );
        if (detailsResponse.ok) {
          const details = await detailsResponse.json();
          allSortieDetails = allSortieDetails.concat(details);
        }
      }
      console.log(`Fetched ${allSortieDetails.length} exit details`);

      // Step 10: Calculate stock for each article
      const newCalculatedStocks = new Map<string, { qte: number; situationInitiale: number; entrees: number; sorties: number }>();

      items.forEach((item) => {
        // Map catalogue to articleId using the mapping we created
        const articleId = catalogueToArticleId.get(item.catalogue);

        if (!articleId) {
          console.warn(`No articleId found for catalogue: ${item.catalogue}`);
          return; // Skip if we can't map the article
        }

        // TotQteI: Inventory quantity (Situation Initiale / Stock Initial)
        const totQteI = inventaireDetails
          .filter((detail: any) => detail.articleId === articleId)
          .reduce((sum: number, detail: any) => sum + (detail.quantitePhysique || 0), 0);

        // TotQteE: Entry quantity (Entrées)
        const totQteE = allEntreeDetails
          .filter((detail: any) => detail.articleId === articleId)
          .reduce((sum: number, detail: any) => sum + (detail.qteE || 0), 0);

        // TotQteS: Exit quantity (Sorties)
        const totQteS = allSortieDetails
          .filter((detail: any) => detail.articleId === articleId)
          .reduce((sum: number, detail: any) => sum + (detail.qteS || 0), 0);

        // Stock Final Calculation (same as Fiche Stock)
        const calculatedQte = (totQteE + totQteI) - totQteS;

        newCalculatedStocks.set(item.numeroPiece, {
          qte: calculatedQte,              // Stock Final
          situationInitiale: totQteI,       // Stock Initial (Inventaire)
          entrees: totQteE,                 // Entrées
          sorties: totQteS                  // Sorties
        });

        console.log(`Article ${item.catalogue} (ID: ${articleId}): TotQteI=${totQteI}, TotQteE=${totQteE}, TotQteS=${totQteS}, Stock=${calculatedQte}`);
      });

      setCalculatedStocks(newCalculatedStocks);
      console.log(`✅ Stock calculated for ${newCalculatedStocks.size} articles using Fiche Stock approach`);

    } catch (error) {
      console.error('Error calculating stock:', error);
      showToast('error', 'Erreur', 'Échec du calcul du stock');
    } finally {
      setIsCalculatingStock(false);
    }
  };

  const fetchMouvementStock = async (params: any) => {
    setLoading(true);
    setCalculatedStocks(new Map()); // Reset calculated stocks for new search
    const debut = format(startOfDay(params.dateDebut), 'yyyy-MM-dd');
    const fin = format(endOfDay(params.dateFin), 'yyyy-MM-dd');

    try {
      let url = `${BASE_URL}?debut=${debut}&fin=${fin}`;

      if (params.magasinId) {
        url += `&magasinId=${params.magasinId}`;
      }
      if (params.categorieId) {
        url += `&categorieId=${params.categorieId}`;
      }

      console.log("URL appelée:", url);

      const response = await axios.get<MouvementStockData>(url);
      console.log("Données reçues:", response.data);

      setMouvementStockData(response.data);
      setSearchParams(params);
      setVisibleDialog(true);
      showToast('success', 'Succès', 'Rapport de mouvement de stock généré avec succès');

      // Automatically calculate stock after fetching data
      if (response.data?.mouvements && response.data.mouvements.length > 0) {
        console.log('Triggering automatic stock calculation...');
        await calculateStockForAllArticles(response.data.mouvements);
      }

    } catch (error: any) {
      console.error("Erreur:", error);
      let errorMessage = 'Échec de la récupération des données';
      
      if (error.response) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Serveur inaccessible. Vérifiez que le serveur backend est démarré.';
      }
      
      showToast('error', 'Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'BIF',
      minimumFractionDigits: 0 
    }).format(value || 0);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value || 0);
  };

  const preloadPdfComponents = React.useCallback(async () => {
    try {
      const [pdfModule, rendererModule] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./MouvementStockPdf')
      ]);
      
      return {
        pdf: pdfModule.pdf,
        MouvementStockPdf: rendererModule.default
      };
    } catch (error) {
      console.error('Erreur préchargement PDF:', error);
      throw error;
    }
  }, []);

  const handleManualDownload = async () => {
    if (!mouvementStockData || !searchParams) return;
    
    const totalItems = mouvementStockData.mouvements?.length || 0;
    if (totalItems > 1000) {
      const confirm = window.confirm(
        `Le rapport contient ${totalItems} articles. ` +
        `La génération du PDF complet peut prendre un peu de temps. Voulez-vous continuer ?`
      );
      
      if (!confirm) return;
    }
    
    setPdfGeneration({ loading: true, progress: 0 });
    
    try {
      setPdfGeneration({ loading: true, progress: 20 });
      const { pdf, MouvementStockPdf } = await preloadPdfComponents();
      
      setPdfGeneration({ loading: true, progress: 50 });
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await pdf(
              <MouvementStockPdf
                data={mouvementStockData}
                dateDebut={searchParams.dateDebut}
                dateFin={searchParams.dateFin}
                groupedData={groupedData}
                calculatedStocks={calculatedStocks}
              />
            ).toBlob();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, 100);
      });
      
      setPdfGeneration({ loading: true, progress: 80 });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mouvement-stock-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      
      setPdfGeneration({ loading: true, progress: 100 });
      
      showToast('success', 'Succès', `PDF téléchargé avec ${totalItems} articles`);
      
      setTimeout(() => setPdfGeneration({ loading: false, progress: 0 }), 1000);
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      showToast('error', 'Erreur', 'Échec du téléchargement du PDF');
      setPdfGeneration({ loading: false, progress: 0 });
    }
  };

  const [performanceInfo, setPerformanceInfo] = useState({
    itemCount: 0,
    groupCount: 0,
    estimatedSize: '0 KB'
  });

  useEffect(() => {
    if (mouvementStockData) {
      const itemCount = mouvementStockData.mouvements?.length || 0;
      const groupCount = groupedData.length;
      
      const estimatedSizeKB = Math.round((itemCount * 2) / 1024);
      const estimatedSizeMB = (estimatedSizeKB / 1024).toFixed(1);
      
      const displaySize = estimatedSizeKB < 1024 
        ? `${estimatedSizeKB} KB` 
        : `${estimatedSizeMB} MB`;
      
      setPerformanceInfo({
        itemCount,
        groupCount,
        estimatedSize: displaySize
      });
    }
  }, [mouvementStockData, groupedData]);

  // TEMPLATE POUR LES LIGNES DÉVELOPPÉES
  const rowExpansionTemplate = (data: MouvementStockGrouped) => {
    return (
      <div className="p-3">
        {/* Formula Display Banner */}
        <div className="mb-3 p-2 bg-blue-100 border-round">
          <div className="text-center font-semibold text-blue-900 text-sm">
            Stock Final = Situation Initiale + Entrées - Sorties
          </div>
        </div>

        <DataTable
          value={data.items}
          responsiveLayout="scroll"
          size="small"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 20]}
        >
          <Column field="catalogue" header="Catalogue" style={{ minWidth: '120px' }} />
          <Column field="nomArticle" header="Nom article" style={{ minWidth: '180px' }} />
          <Column
            header="Situation initiale"
            body={(item: MouvementStockItem) => {
              const calculated = calculatedStocks.get(item.numeroPiece);
              const displayQte = calculated !== undefined ? calculated.situationInitiale : item.situationInitiale?.qte;

              return (
                <div className="flex flex-column">
                  <div className="flex align-items-center gap-2">
                    <span>Qté: {formatNumber(displayQte)}</span>
                    {calculated !== undefined && (
                      <i className="pi pi-check-circle text-green-500" style={{ fontSize: '0.9rem' }} title="TotQteI calculé"></i>
                    )}
                  </div>
                  <div>Montant: {formatCurrency(item.situationInitiale?.montant)}</div>
                </div>
              );
            }}
            style={{ minWidth: '180px' }}
          />
          <Column
            header="Entrées"
            body={(item: MouvementStockItem) => {
              const calculated = calculatedStocks.get(item.numeroPiece);
              const displayQte = calculated !== undefined ? calculated.entrees : item.entrees?.qte;

              return (
                <div className="flex flex-column">
                  <div className="flex align-items-center gap-2">
                    <span style={{ color: '#27ae60' }}>Qté: {formatNumber(displayQte)}</span>
                    {calculated !== undefined && (
                      <i className="pi pi-check-circle text-green-500" style={{ fontSize: '0.9rem' }} title="Entrées calculées"></i>
                    )}
                  </div>
                  <div style={{ color: '#27ae60' }}>Montant: {formatCurrency(item.entrees?.montant)}</div>
                </div>
              );
            }}
            style={{ minWidth: '180px' }}
          />
          <Column
            header="Sorties"
            body={(item: MouvementStockItem) => {
              const calculated = calculatedStocks.get(item.numeroPiece);
              const displayQte = calculated !== undefined ? calculated.sorties : item.sorties?.qte;

              return (
                <div className="flex flex-column">
                  <div className="flex align-items-center gap-2">
                    <span style={{ color: '#e74c3c' }}>Qté: {formatNumber(displayQte)}</span>
                    {calculated !== undefined && (
                      <i className="pi pi-check-circle text-green-500" style={{ fontSize: '0.9rem' }} title="Sorties calculées"></i>
                    )}
                  </div>
                  <div style={{ color: '#e74c3c' }}>Montant: {formatCurrency(item.sorties?.montant)}</div>
                </div>
              );
            }}
            style={{ minWidth: '180px' }}
          />
          <Column
            header="Stock"
            body={(item: MouvementStockItem) => {
              const calculated = calculatedStocks.get(item.numeroPiece);
              const displayQte = calculated !== undefined ? calculated.qte : item.stock?.qte;

              return (
                <div className="flex flex-column">
                  <div className="flex align-items-center gap-2">
                    <span>Qté: {formatNumber(displayQte)}</span>
                    {calculated !== undefined && (
                      <i className="pi pi-check-circle text-green-500" style={{ fontSize: '0.9rem' }} title="Stock calculé automatiquement"></i>
                    )}
                  </div>
                  <div>P.U: {formatCurrency(item.stock?.puStock)}</div>
                  <div style={{ color: '#2980b9' }}>Montant: {formatCurrency(item.stock?.montant)}</div>
                </div>
              );
            }}
            style={{ minWidth: '180px' }}
          />
        </DataTable>
      </div>
    );
  };

  const renderSearch = () => (
    <div className="flex justify-content-between align-items-center mb-3">
      <div className="flex gap-2">
        <Button
          icon="pi pi-filter-slash"
          label="Effacer filtres"
          outlined
          onClick={() => setGlobalFilter('')}
        />
        <Button
          icon={expandedRows ? "pi pi-minus" : "pi pi-plus"}
          label={expandedRows ? "Replier Tout" : "Développer Tout"}
          onClick={() => {
            if (expandedRows) {
              setExpandedRows(null);
            } else {
              const expanded: any = {};
              groupedData.forEach(group => {
                expanded[group.groupKey] = true;
              });
              setExpandedRows(expanded);
            }
          }}
          className="p-button-text"
        />
      </div>
      <span className="p-input-icon-left" style={{ width: '40%' }}>
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Rechercher par categorie, magasin, nom d'article ou catalogue..."
          className="w-full"
        />
      </span>
    </div>
  );

  const dialogFooter = (
    <div className="flex justify-content-between align-items-center gap-2 w-full">
      <div className="text-sm text-500">
        {performanceInfo.itemCount > 0 && (
          <span>
            {performanceInfo.itemCount} articles | {performanceInfo.groupCount} groupes |
            Estimation: {performanceInfo.estimatedSize}
          </span>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          label="Fermer"
          icon="pi pi-times"
          onClick={() => setVisibleDialog(false)}
          className="p-button-text"
        />
        
        <Button
          label={
            pdfGeneration.loading
              ? `Génération... ${pdfGeneration.progress}%`
              : "Télécharger PDF complet"
          }
          icon="pi pi-download"
          loading={pdfGeneration.loading}
          className="p-button-success"
          onClick={handleManualDownload}
          disabled={pdfGeneration.loading || isCalculatingStock || calculatedStocks.size === 0}
          tooltip={
            isCalculatingStock
              ? "Veuillez attendre la fin du calcul"
              : calculatedStocks.size === 0
                ? "Le calcul du stock doit être terminé"
                : `Télécharger tous les ${performanceInfo.itemCount} articles`
          }
        />
      </div>
    </div>
  );

  // Calcul des totaux généraux
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
    <>
      <Toast ref={toast} />
      <Card title="Rapport de Mouvement de Stock">
        <MouvementStockForm
          onSearch={fetchMouvementStock}
          loading={loading}
        />
      </Card>

      <Dialog
        header={
          <div>
            <div>Mouvement de Stock - Regroupe par Categorie et Magasin</div>
            <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '5px' }}>
              Période: {searchParams ? `${format(searchParams.dateDebut, 'dd/MM/yyyy')} - ${format(searchParams.dateFin, 'dd/MM/yyyy')}` : ''}
            </div>
          </div>
        }
        visible={visibleDialog}
        style={{ width: '95vw', maxWidth: '1600px' }}
        footer={dialogFooter}
        onHide={() => setVisibleDialog(false)}
        maximizable
      >
        <div className="card">
          {renderSearch()}

          {isCalculatingStock && (
            <div className="bg-blue-100 border-blue-500 text-blue-700 p-3 mb-3 border-l-4 flex align-items-center gap-2">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
              <span className="font-semibold">Calcul du stock en cours... Veuillez patienter.</span>
            </div>
          )}

          {mouvementStockData && (
            <>
              {/* Global Calculation Summary */}
              <div className="mb-4 p-3 surface-50 border-round">
                <div className="font-bold text-lg mb-2">Résumé Général - Calcul du Stock</div>
                <div className="mb-3 p-2 bg-blue-100 border-round">
                  <div className="text-center font-semibold text-blue-900">
                    Stock Final = Situation Initiale + Entrées - Sorties
                  </div>
                </div>
                <div className="grid">
                  <div className="col-12 md:col-3">
                    <div className="p-3 bg-blue-50 border-round">
                      <div className="text-600 text-sm mb-1">Situation Initiale (Total)</div>
                      <div className="text-900 font-bold text-xl">{formatNumber(totalGeneralSituationQte)}</div>
                      <div className="text-500 text-sm mt-1">{formatCurrency(totalGeneralSituationMontant)}</div>
                    </div>
                  </div>
                  <div className="col-12 md:col-3">
                    <div className="p-3 bg-green-50 border-round">
                      <div className="text-600 text-sm mb-1">+ Entrées (Total)</div>
                      <div className="text-900 font-bold text-xl text-green-700">{formatNumber(totalGeneralEntreesQte)}</div>
                      <div className="text-500 text-sm mt-1">{formatCurrency(totalGeneralEntreesMontant)}</div>
                    </div>
                  </div>
                  <div className="col-12 md:col-3">
                    <div className="p-3 bg-red-50 border-round">
                      <div className="text-600 text-sm mb-1">- Sorties (Total)</div>
                      <div className="text-900 font-bold text-xl text-red-700">{formatNumber(totalGeneralSortiesQte)}</div>
                      <div className="text-500 text-sm mt-1">{formatCurrency(totalGeneralSortiesMontant)}</div>
                    </div>
                  </div>
                  <div className="col-12 md:col-3">
                    <div className="p-3 bg-indigo-50 border-round" style={{ border: '2px solid #3F51B5' }}>
                      <div className="text-600 text-sm mb-1">= Stock Final (Total)</div>
                      <div className="text-primary font-bold text-2xl">{formatNumber(totalGeneralStockQte)}</div>
                      <div className="text-500 text-sm mt-1">{formatCurrency(totalGeneralStockMontant)}</div>
                      {calculatedStocks.size > 0 && (
                        <div className="mt-2">
                          <i className="pi pi-check-circle text-green-500" style={{ fontSize: '0.9rem' }}></i>
                          <span className="text-xs ml-1 text-green-600">Stock calculé</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-500 text-center">
                  Total: {totalGeneralArticles} articles repartis dans {groupedData.length} groupes
                </div>
              </div>

              <DataTable
                value={groupedData}
                loading={loading}
                responsiveLayout="scroll"
                dataKey="groupKey"
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                globalFilter={globalFilter}
                globalFilterFields={["categorie", "magasin"]}
                emptyMessage="Aucun mouvement trouvé"
                sortField="categorie"
                sortOrder={1}
              >
                <Column expander style={{ width: '3em' }} />
                <Column 
                  field="categorie" 
                  header="Categorie" 
                  sortable 
                  style={{ minWidth: '200px' }}
                />
                <Column 
                  field="magasin" 
                  header="Magasin" 
                  sortable 
                  style={{ minWidth: '200px' }}
                />
                <Column 
                  field="totalArticles" 
                  header="Nb. Articles" 
                  sortable 
                  style={{ minWidth: '120px' }}
                />
                <Column 
                  header="Situation Initiale" 
                  body={(data: MouvementStockGrouped) => (
                    <div className="flex flex-column">
                      <div>Qté: {formatNumber(data.totalSituationInitiale.qte)}</div>
                      <div>Montant: {formatCurrency(data.totalSituationInitiale.montant)}</div>
                    </div>
                  )}
                  style={{ minWidth: '150px' }}
                />
                <Column 
                  header="Total Entrées" 
                  body={(data: MouvementStockGrouped) => (
                    <div className="flex flex-column">
                      <div style={{ color: '#27ae60' }}>Qté: {formatNumber(data.totalEntrees.qte)}</div>
                      <div style={{ color: '#27ae60' }}>Montant: {formatCurrency(data.totalEntrees.montant)}</div>
                    </div>
                  )}
                  style={{ minWidth: '150px' }}
                />
                <Column 
                  header="Total Sorties" 
                  body={(data: MouvementStockGrouped) => (
                    <div className="flex flex-column">
                      <div style={{ color: '#e74c3c' }}>Qté: {formatNumber(data.totalSorties.qte)}</div>
                      <div style={{ color: '#e74c3c' }}>Montant: {formatCurrency(data.totalSorties.montant)}</div>
                    </div>
                  )}
                  style={{ minWidth: '150px' }}
                />
                <Column 
                  header="Total Stock" 
                  body={(data: MouvementStockGrouped) => (
                    <div className="flex flex-column">
                      <div>Qté: {formatNumber(data.totalStock.qte)}</div>
                      <div>Montant: {formatCurrency(data.totalStock.montant)}</div>
                    </div>
                  )}
                  style={{ minWidth: '150px' }}
                />
              </DataTable>

              {/* TOTAUX GÉNÉRAUX COMPLETS */}
              <div className="mt-3 font-bold flex justify-content-between p-3 surface-100 border-round">
                <div>
                  <i className="pi pi-box text-blue-500 mr-2"></i>
                  Total Articles: {totalGeneralArticles}
                </div>
                <div>
                  <i className="pi pi-chart-line text-purple-500 mr-2"></i>
                  Situation: {formatNumber(totalGeneralSituationQte)} / {formatCurrency(totalGeneralSituationMontant)}
                </div>
                <div>
                  <i className="pi pi-arrow-down text-green-500 mr-2"></i>
                  Entrées: {formatNumber(totalGeneralEntreesQte)} / {formatCurrency(totalGeneralEntreesMontant)}
                </div>
                <div>
                  <i className="pi pi-arrow-up text-red-500 mr-2"></i>
                  Sorties: {formatNumber(totalGeneralSortiesQte)} / {formatCurrency(totalGeneralSortiesMontant)}
                </div>
                <div>
                  <i className="pi pi-chart-bar text-orange-500 mr-2"></i>
                  Stock: {formatNumber(totalGeneralStockQte)} / {formatCurrency(totalGeneralStockMontant)}
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default MouvementStockPage;
