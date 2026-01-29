// FicheStockPage.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { FicheStockData, FicheStockItem, FicheStockParams } from './FicheStock';
import FicheStockForm from './FicheStockForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FicheStockPdf from './FicheStockPdf';
import { Card } from 'primereact/card';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/apiConfig';

const BASE_URL = `${API_BASE_URL}/ficheStock/findfiche`;

const FicheStockPage: React.FC = () => {
  const [ficheStockData, setFicheStockData] = useState<FicheStockData | null>(null);
  const [processedMouvements, setProcessedMouvements] = useState<FicheStockItem[]>([]);
  const [searchParams, setSearchParams] = useState<FicheStockParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef<Toast>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [calculatedStock, setCalculatedStock] = useState<number | null>(null);
  const [isCalculatingStock, setIsCalculatingStock] = useState(false);
  const [calculationBreakdown, setCalculationBreakdown] = useState<{
    totQteI: number;
    totQteE: number;
    totQteS: number;
  } | null>(null);

  const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  /**
   * Calculate stock for a specific article using the same logic as article page
   * Formula: qteStock = (TotQteE + TotQteI) - TotQteS
   */
  const calculateStockForArticle = async (articleId: string, dateDebut: Date, dateFin: Date) => {
    setIsCalculatingStock(true);

    try {
      console.log(`📊 Calculating stock for article: ${articleId}`);

      const currentYear = new Date().getFullYear().toString();

      // OPTIMIZATION: Fetch all data once instead of per-request
      console.log('Fetching all data for stock calculation...');

      // 1. Fetch all inventories once
      const inventairesResponse = await fetch(`${API_BASE_URL}/stkinventaire/findall`);
      const allInventaires = inventairesResponse.ok ? await inventairesResponse.json() : [];

      // 2. Fetch all entries once
      const entreesResponse = await fetch(`${API_BASE_URL}/stkEntrees/findall`);
      const allEntrees = entreesResponse.ok ? await entreesResponse.json() : [];

      // 3. Fetch all exits once
      const sortiesResponse = await fetch(`${API_BASE_URL}/stkSorties/findall`);
      const allSorties = sortiesResponse.ok ? await sortiesResponse.json() : [];

      console.log(`Fetched: ${allInventaires.length} inventories, ${allEntrees.length} entries, ${allSorties.length} exits`);

      // === CALCULATE TotQteI (Inventory Quantity) ===
      let totQteI = 0;

      // Filter inventories for current fiscal year
      const currentYearInventaires = allInventaires.filter((inv: any) => {
        if (!inv.dateInventaire) return false;
        const invDate = new Date(inv.dateInventaire);
        return invDate.getFullYear().toString() === currentYear;
      });

      if (currentYearInventaires.length > 0) {
        // Find the most recent inventory
        const latestInventaire = currentYearInventaires.reduce((latest: any, current: any) => {
          const latestDate = new Date(latest.dateInventaire);
          const currentDate = new Date(current.dateInventaire);
          return currentDate > latestDate ? current : latest;
        });

        // Fetch inventory details for the latest inventory
        try {
          const invDetailsResponse = await fetch(
            `${API_BASE_URL}/inventaireDetails/findbyinventaire?inventaireId=${latestInventaire.inventaireId}`
          );

          if (invDetailsResponse.ok) {
            const invDetails = await invDetailsResponse.json();

            // Sum quantitePhysique for this article
            totQteI = invDetails
              .filter((detail: any) => detail.articleId === articleId)
              .reduce((sum: number, detail: any) => sum + (detail.quantitePhysique || 0), 0);

            console.log(`TotQteI (Inventory): ${totQteI}`);
          }
        } catch (error) {
          console.warn('Failed to fetch inventory details:', error);
        }
      }

      // === CALCULATE TotQteE (Entry Quantity) ===
      let totQteE = 0;

      // Filter entries for current fiscal year
      const currentYearEntrees = allEntrees.filter((entree: any) => {
        if (!entree.dateEntree) return false;
        const entreeDate = new Date(entree.dateEntree);
        return entreeDate.getFullYear().toString() === currentYear;
      });

      // Fetch entry details for each entry and sum quantities for this article
      for (const entree of currentYearEntrees) {
        try {
          const entreeDetailsResponse = await fetch(
            `${API_BASE_URL}/stkEntreeDetails/findbyentree?entreeId=${entree.entreeId}`
          );

          if (entreeDetailsResponse.ok) {
            const entreeDetails = await entreeDetailsResponse.json();

            const entreeQty = entreeDetails
              .filter((detail: any) => detail.articleId === articleId)
              .reduce((sum: number, detail: any) => sum + (detail.qteE || 0), 0);

            totQteE += entreeQty;
          }
        } catch (error) {
          console.warn(`Failed to fetch entry details for ${entree.entreeId}:`, error);
        }
      }

      console.log(`TotQteE (Entries): ${totQteE}`);

      // === CALCULATE TotQteS (Exit Quantity) ===
      let totQteS = 0;

      // Filter exits for current fiscal year
      const currentYearSorties = allSorties.filter((sortie: any) => {
        if (!sortie.dateSortie) return false;
        const sortieDate = new Date(sortie.dateSortie);
        return sortieDate.getFullYear().toString() === currentYear;
      });

      // Fetch exit details for each exit and sum quantities for this article
      for (const sortie of currentYearSorties) {
        try {
          const sortieDetailsResponse = await fetch(
            `${API_BASE_URL}/stkSortieDetails/findbysortie?sortieId=${sortie.sortieId}`
          );

          if (sortieDetailsResponse.ok) {
            const sortieDetails = await sortieDetailsResponse.json();

            const sortieQty = sortieDetails
              .filter((detail: any) => detail.articleId === articleId)
              .reduce((sum: number, detail: any) => sum + (detail.qteS || 0), 0);

            totQteS += sortieQty;
          }
        } catch (error) {
          console.warn(`Failed to fetch exit details for ${sortie.sortieId}:`, error);
        }
      }

      console.log(`TotQteS (Exits): ${totQteS}`);

      // === CALCULATE FINAL STOCK ===
      const calculatedQteStock = (totQteE + totQteI) - totQteS;

      console.log(`✅ Calculated stock: ${calculatedQteStock} (Inventory: ${totQteI}, Entries: ${totQteE}, Exits: ${totQteS})`);

      setCalculatedStock(calculatedQteStock);
      setCalculationBreakdown({ totQteI, totQteE, totQteS });

      return {
        qteStock: calculatedQteStock,
        totQteI,
        totQteE,
        totQteS
      };

    } catch (error) {
      console.error('Error calculating stock:', error);
      accept('error', 'Erreur', 'Échec du calcul du stock');
      return null;
    } finally {
      setIsCalculatingStock(false);
    }
  };

  /**
   * Process movements to calculate cumulative quantities
   * CORRECTION: Calcul cumulatif correct avec stock initial comme base
   */
  const processMouvements = (mouvements: FicheStockItem[], initialStock: number): FicheStockItem[] => {
    if (!mouvements || mouvements.length === 0) return [];
    
    // Trier par date ascendante pour un calcul cumulatif correct
    const sortedMouvements = [...mouvements].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let stockDisponible = initialStock; // Commencer avec le stock initial
    const processed: FicheStockItem[] = [];
    
    // Ajouter d'abord une ligne de solde initial si elle n'existe pas
    const hasSoldeInitial = sortedMouvements.some(m => m.type === 'SOLDE_INITIAL');
    
    if (!hasSoldeInitial) {
      processed.push({
        date: sortedMouvements.length > 0 ? sortedMouvements[0].date : new Date(),
        referencePiece: 'SOLDE INITIAL',
        articleLibelle: '',
        origine: '-',
        disponibleQte: initialStock,
        type: 'SOLDE_INITIAL'
      } as FicheStockItem);
    }
    
    // Traiter tous les mouvements dans l'ordre chronologique
    sortedMouvements.forEach((mvt) => {
      // Pour SOLDE_INITIAL, utiliser la valeur du backend
      if (mvt.type === 'SOLDE_INITIAL') {
        stockDisponible = initialStock;
        processed.push({
          ...mvt,
          disponibleQte: stockDisponible,
          cumulatifQte: stockDisponible
        });
        return;
      }
      
      // Pour ENTRÉE, ajouter à la quantité disponible
      if (mvt.type === 'ENTREE') {
        const qteEntree = mvt.entreesQte || 0;
        stockDisponible = stockDisponible + qteEntree;
        processed.push({
          ...mvt,
          disponibleQte: stockDisponible,
          cumulatifQte: stockDisponible
        });
        return;
      }
      
      // Pour SORTIE, soustraire de la quantité disponible
      if (mvt.type === 'SORTIE') {
        const qteSortie = mvt.sortiesQte || 0;
        stockDisponible = stockDisponible - qteSortie;
        processed.push({
          ...mvt,
          disponibleQte: stockDisponible,
          cumulatifQte: stockDisponible
        });
        return;
      }
      
      // Pour les autres types (au cas où)
      processed.push({
        ...mvt,
        disponibleQte: stockDisponible,
        cumulatifQte: stockDisponible
      });
    });
    
    console.log('Mouvements traités avec calcul cumulatif:', processed);
    console.log('Stock initial utilisé:', initialStock);
    console.log('Stock disponible final:', stockDisponible);
    
    return processed;
  };

  const fetchFicheStock = async (params: FicheStockParams) => {
    setLoading(true);
    setCalculatedStock(null);
    setCalculationBreakdown(null);
    const debut = format(startOfDay(params.dateDebut), 'yyyy-MM-dd');
    const fin = format(endOfDay(params.dateFin), 'yyyy-MM-dd');

    try {
      let url = `${BASE_URL}?debut=${debut}&fin=${fin}&articleId=${params.articleId}`;
      
      if (params.magasinId) {
        url += `&magasinId=${params.magasinId}`;
      }

      console.log('URL de requête:', url);

      const config = {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      };

      const response = await axios.get<FicheStockData>(url, config);

      console.log('Réponse reçue:', response.data);

      if (!response.data) {
        throw new Error('Aucune donnée trouvée dans la réponse');
      }

      // CORRECTION: Vérifier et corriger le stock initial
      const stockInitialData = response.data.qteStockInitial;
      console.log(`Stock initial reçu du backend: ${stockInitialData}`);

      // Process movements with cumulative calculation
      const processedMovements = processMouvements(
        response.data.mouvements, 
        stockInitialData
      );
      
      setFicheStockData(response.data);
      setProcessedMouvements(processedMovements);
      setSearchParams(params);
      setVisibleDialog(true);
      accept('success', 'Succès', 'Fiche de stock générée avec succès');

      // Automatically calculate stock after fetching fiche stock data
      if (response.data && response.data.articleId) {
        console.log('Triggering automatic stock calculation...');
        await calculateStockForArticle(response.data.articleId, params.dateDebut, params.dateFin);
      }

    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      
      let errorMessage = 'Échec de la récupération des données';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Erreur d\'authentification. Le backend nécessite une authentification.';
        } else if (error.response.status === 404) {
          errorMessage = 'Endpoint non trouvé. Vérifiez l\'URL du backend.';
        } else if (error.response.status === 500) {
          errorMessage = 'Erreur interne du serveur. Vérifiez les logs du backend.';
        } else {
          errorMessage = `Erreur ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = 'Serveur inaccessible. Vérifiez que le serveur backend est démarré sur le port 8080.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout de la requête. Le serveur met trop de temps à répondre.';
      } else {
        errorMessage = error.message || 'Erreur inconnue lors de la requête';
      }
      
      accept('error', 'Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'BIF',
      minimumFractionDigits: 0 
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      'ENTREE': 'p-tag p-tag-success',
      'SORTIE': 'p-tag p-tag-danger',
      'SOLDE_INITIAL': 'p-tag p-tag-info'
    };
    const labels = {
      'ENTREE': 'Entrée',
      'SORTIE': 'Sortie',
      'SOLDE_INITIAL': 'Solde Initial'
    };
    return <span className={badges[type as keyof typeof badges]}>{labels[type as keyof typeof labels]}</span>;
  };

  const renderSearch = () => (
    <div className="flex justify-content-between align-items-center mb-3">
      <Button
        icon="pi pi-filter-slash"
        label="Effacer filtres"
        outlined
        onClick={() => setGlobalFilter('')}
      />
      <span className="p-input-icon-left" style={{ width: '40%' }}>
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Rechercher par référence pièce..."
          className="w-full"
        />
      </span>
    </div>
  );

  const tableChangeHandle = (e: TabViewTabChangeEvent) => {
    setActiveIndex(e.index);
  };

  // Calculer le stock initial à afficher
  const getStockInitialToDisplay = () => {
    if (calculationBreakdown !== null && calculationBreakdown !== undefined) {
      return calculationBreakdown.totQteI;
    }
    return ficheStockData?.qteStockInitial || 0;
  };

  // Calculer le stock final à afficher
  const getStockFinalToDisplay = () => {
    if (calculatedStock !== null) {
      return calculatedStock;
    }
    return ficheStockData?.soldeFinal.qte || 0;
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Fermer"
        icon="pi pi-times"
        onClick={() => setVisibleDialog(false)}
        className="p-button-text"
      />
      {ficheStockData && searchParams && (
        <PDFDownloadLink
          document={
            <FicheStockPdf
              data={ficheStockData}
              mouvements={processedMouvements}
              dateDebut={searchParams.dateDebut}
              dateFin={searchParams.dateFin}
              searchParams={searchParams}
              calculatedStock={calculatedStock}
              calculationBreakdown={calculationBreakdown}
            />
          }
          fileName={`fiche-stock-${ficheStockData.articleLibelle}-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`}
        >
          {({ loading: pdfLoading, blob, url, error }) => {
            if (error) {
              console.error("Erreur génération PDF:", error);
              accept('error', 'Erreur', 'Échec de génération du PDF');
            }
            return (
              <Button
                label={pdfLoading ? "Génération..." : "Télécharger PDF"}
                icon="pi pi-download"
                loading={pdfLoading}
                disabled={isCalculatingStock || calculatedStock === null}
                className="p-button-success"
                tooltip={isCalculatingStock ? "Veuillez attendre la fin du calcul" : calculatedStock === null ? "Le calcul du stock doit être terminé" : ""}
              />
            );
          }}
        </PDFDownloadLink>
      )}
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <TabView activeIndex={activeIndex} onTabChange={tableChangeHandle}>
        <TabPanel header="Fiche de Stock">
          <FicheStockForm
            onSearch={fetchFicheStock}
            loading={loading}
          />
        </TabPanel>
      </TabView>

      <Dialog
        header={
          <div>
            <div>Fiche de Stock - {ficheStockData?.articleLibelle}</div>
            <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '5px' }}>
              Période: {searchParams ? `${format(searchParams.dateDebut, 'dd/MM/yyyy')} - ${format(searchParams.dateFin, 'dd/MM/yyyy')}` : ''}
            </div>
          </div>
        }
        visible={visibleDialog}
        style={{ width: '95vw', maxWidth: '1400px' }}
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

          {ficheStockData && (
            <>
              <div className="mb-4 p-3 surface-100 border-round">
                <div className="grid">
                  <div className="col-3">
                    <strong>Article:</strong> {ficheStockData.articleLibelle}
                  </div>
                  <div className="col-3">
                    <strong>Catalogue:</strong> {ficheStockData.catalogue}
                  </div>
                  <div className="col-3">
                    <strong>Unité:</strong> {ficheStockData.uniteLibelle}
                  </div>
                  <div className="col-3 flex align-items-center gap-2">
                    <strong>Stock Initial (Inventaire):</strong>
                    <span className="font-bold text-primary">
                      {getStockInitialToDisplay()}
                    </span>
                    {calculationBreakdown !== null && (
                      <i className="pi pi-check-circle text-green-500" style={{ fontSize: '0.9rem' }} title="Valeur calculée automatiquement"></i>
                    )}
                  </div>
                  <div className="col-3">
                    <strong>Année:</strong> {new Date().getFullYear()}
                  </div>
                </div>
              </div>

              <DataTable
                value={processedMouvements}
                loading={loading}
                responsiveLayout="scroll"
                globalFilter={globalFilter}
                emptyMessage="Aucun mouvement trouvé"
                sortField="date"
                sortOrder={-1}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
              >
                <Column 
                  field="date" 
                  header="Date" 
                  sortable 
                  body={(data: FicheStockItem) => formatDate(new Date(data.date))}
                  style={{ minWidth: '100px' }}
                />
                <Column 
                  field="type" 
                  header="Type" 
                  body={(data: FicheStockItem) => getTypeBadge(data.type)}
                  style={{ minWidth: '120px' }}
                />
                <Column 
                  field="referencePiece" 
                  header="Réf. Pièce" 
                  sortable 
                  style={{ minWidth: '120px' }}
                />
                <Column 
                  field="origine" 
                  header="Origine" 
                  style={{ minWidth: '120px' }}
                />
                <Column 
                  field="entreesQte" 
                  header="Entrées Qté" 
                  body={(data: FicheStockItem) => data.type === 'ENTREE' ? data.entreesQte : '-'}
                  style={{ minWidth: '100px' }}
                />
                <Column 
                  field="entreesPU" 
                  header="Entrées PU" 
                  body={(data: FicheStockItem) => data.type === 'ENTREE' && data.entreesPU ? formatCurrency(data.entreesPU) : '-'}
                  style={{ minWidth: '100px' }}
                />
                <Column 
                  field="entreesPT" 
                  header="Entrées P.T" 
                  body={(data: FicheStockItem) => data.type === 'ENTREE' && data.entreesPT ? formatCurrency(data.entreesPT) : '-'}
                  style={{ minWidth: '100px' }}
                />
                <Column 
                  field="sortiesQte" 
                  header="Sorties Qté" 
                  body={(data: FicheStockItem) => data.type === 'SORTIE' ? data.sortiesQte : '-'}
                  style={{ minWidth: '100px' }}
                />
                <Column 
                  field="sortiesPU" 
                  header="Sorties P.U" 
                  body={(data: FicheStockItem) => data.type === 'SORTIE' && data.sortiesPU ? formatCurrency(data.sortiesPU) : '-'}
                  style={{ minWidth: '100px' }}
                />
                <Column 
                  field="sortiesMontant" 
                  header="Sorties Montant" 
                  body={(data: FicheStockItem) => data.type === 'SORTIE' && data.sortiesMontant ? formatCurrency(data.sortiesMontant) : '-'}
                  style={{ minWidth: '120px' }}
                />
                <Column 
                  field="disponibleQte" 
                  header="Disponible Qté" 
                  body={(data: FicheStockItem) => data.disponibleQte}
                  style={{ minWidth: '100px' }}
                />
                <Column 
                  field="disponiblePU" 
                  header="Disponible P.U" 
                  body={(data: FicheStockItem) => data.disponiblePU ? formatCurrency(data.disponiblePU) : '-'}
                  style={{ minWidth: '100px' }}
                />
                <Column 
                  field="disponibleMontant" 
                  header="Disponible Montant" 
                  body={(data: FicheStockItem) => data.disponibleMontant ? formatCurrency(data.disponibleMontant) : '-'}
                  style={{ minWidth: '120px' }}
                />
              </DataTable>

              <div className="mt-3 p-3 surface-50 border-round">
                <div className="font-bold text-lg mb-2">Calcul du Stock Final</div>
                <div className="mb-3 p-2 bg-blue-100 border-round">
                  <div className="text-center font-semibold text-blue-900">
                    Stock Final = Stock Initial (Inventaire) + Entrées - Sorties
                  </div>
                </div>
                <div className="grid">
                  <div className="col-12 md:col-4">
                    <div className="p-2 bg-blue-50 border-round">
                      <div className="text-600 text-sm">Stock Initial (Inventaire {new Date().getFullYear()})</div>
                      <div className="text-900 font-bold text-xl">
                        {getStockInitialToDisplay()}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 md:col-4">
                    <div className="p-2 bg-green-50 border-round">
                      <div className="text-600 text-sm">+ Entrées (Année {new Date().getFullYear()})</div>
                      <div className="text-900 font-bold text-xl">
                        {calculationBreakdown !== null
                          ? calculationBreakdown.totQteE
                          : processedMouvements
                              .filter(m => m.type === 'ENTREE')
                              .reduce((sum, m) => sum + (m.entreesQte || 0), 0)}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 md:col-4">
                    <div className="p-2 bg-red-50 border-round">
                      <div className="text-600 text-sm">- Sorties (Année {new Date().getFullYear()})</div>
                      <div className="text-900 font-bold text-xl">
                        {calculationBreakdown !== null
                          ? calculationBreakdown.totQteS
                          : processedMouvements
                              .filter(m => m.type === 'SORTIE')
                              .reduce((sum, m) => sum + (m.sortiesQte || 0), 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 font-bold flex justify-content-between p-3 surface-100 border-round">
                <div className="flex align-items-center gap-2">
                  <span>Stock Final:</span>
                  <span className="text-primary text-2xl">
                    {getStockFinalToDisplay()}
                  </span>
                  {calculatedStock !== null && (
                    <i className="pi pi-check-circle text-green-500" title="Stock calculé automatiquement"></i>
                  )}
                </div>
                <div>PUMP Final: {formatCurrency(ficheStockData.soldeFinal.pump)}</div>
                <div>Valeur Stock Final: {formatCurrency(ficheStockData.soldeFinal.montant)}</div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default FicheStockPage;