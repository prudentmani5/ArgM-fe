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
import { format, startOfDay, endOfDay } from 'date-fns';
import axios from 'axios';
import MouvementStockForm from './MouvementStockForm';
import MouvementStockPdf from './MouvementStockPdf';
import { MouvementStockData, MouvementStockItem, MouvementStockGrouped } from './MouvementStock';
import React from 'react';

const BASE_URL = 'http://localhost:8080/mouvementStock/findall';

const MouvementStockPage: React.FC = () => {
  const [mouvementStockData, setMouvementStockData] = useState<MouvementStockData | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef<Toast>(null);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [expandedRows, setExpandedRows] = useState<any>(null);

 // Dans MouvementStockPage.tsx - Mettre à jour la fonction de groupement
const groupedData = useMemo((): MouvementStockGrouped[] => {
  if (!mouvementStockData?.mouvements || mouvementStockData.mouvements.length === 0) {
    return [];
  }

  const grouped = mouvementStockData.mouvements.reduce((acc: { [key: string]: MouvementStockItem[] }, mouvement) => {
    const categorie = mouvement.categorie || 'Non classé';
    if (!acc[categorie]) {
      acc[categorie] = [];
    }
    acc[categorie].push(mouvement);
    return acc;
  }, {});

  return Object.entries(grouped).map(([categorie, items]) => {
    // AJOUT: Calcul de la situation initiale
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
      (acc, item) => ({
        qte: acc.qte + (item.stock?.qte || 0),
        montant: acc.montant + (item.stock?.montant || 0),
      }),
      { qte: 0, montant: 0 }
    );

    return {
      categorie,
      totalArticles: items.length,
      totalSituationInitiale, // AJOUTÉ
      totalEntrees,
      totalSorties,
      totalStock,
      items: items.sort((a, b) => (a.nomArticle || '').localeCompare(b.nomArticle || ''))
    };
  }).sort((a, b) => (a.categorie || '').localeCompare(b.categorie || ''));
}, [mouvementStockData]);


  const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const fetchMouvementStock = async (params: any) => {
    setLoading(true);
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
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  
  // Dans MouvementStockPage.tsx - FONCTION OPTIMISÉE
const [pdfGeneration, setPdfGeneration] = useState({
  loading: false,
  progress: 0
});


const preloadPdfComponents = React.useCallback(async () => {
  try {
    // Précharger en parallèle
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


// Génération PDF par étapes pour éviter le blocage
const generatePdfInChunks = async (pdf: any, MouvementStockPdf: any) => {
  return new Promise((resolve, reject) => {
    try {
      const blob = pdf(
        <MouvementStockPdf
          data={mouvementStockData}
          dateDebut={searchParams.dateDebut}
          dateFin={searchParams.dateFin}
          groupedData={groupedData}
        />
      ).toBlob();
      
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
};




  // TEMPLATE POUR LES LIGNES DÉVELOPPÉES
  const rowExpansionTemplate = (data: MouvementStockGrouped) => {
    return (
      <div className="p-3">
        <DataTable 
          value={data.items} 
          responsiveLayout="scroll"
          size="small"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 20]}
        >
          {/*<Column field="numeroPiece" header="N° Pièce" style={{ minWidth: '100px' }} /> */}
          <Column field="catalogue" header="Catalogue" style={{ minWidth: '120px' }} />
          <Column field="nomArticle" header="Nom article" style={{ minWidth: '180px' }} />
            {/* <Column field="sousCategorie" header="Sous-catégorie" style={{ minWidth: '150px' }} /> */}
          <Column 
            header="Situation initiale" 
            body={(item: MouvementStockItem) => (
              <div className="flex flex-column">
                <div>Qté: {formatNumber(item.situationInitiale.qte)}</div>
                <div>Montant: {formatCurrency(item.situationInitiale.montant)}</div>
              </div>
            )}
            style={{ minWidth: '140px' }}
          />
          <Column 
            header="Entrées" 
            body={(item: MouvementStockItem) => (
              <div className="flex flex-column">
                <div>Qté: {formatNumber(item.entrees.qte)}</div>
                <div>Montant: {formatCurrency(item.entrees.montant)}</div>
              </div>
            )}
            style={{ minWidth: '140px' }}
          />
          <Column 
            header="Sorties" 
            body={(item: MouvementStockItem) => (
              <div className="flex flex-column">
                <div>Qté: {formatNumber(item.sorties.qte)}</div>
                <div>Montant: {formatCurrency(item.sorties.montant)}</div>
              </div>
            )}
            style={{ minWidth: '140px' }}
          />
          <Column 
            header="Stock" 
            body={(item: MouvementStockItem) => (
              <div className="flex flex-column">
                <div>Qté: {formatNumber(item.stock.qte)}</div>
                <div>P.U: {formatCurrency(item.stock.puStock)}</div>
                <div>Montant: {formatCurrency(item.stock.montant)}</div>
              </div>
            )}
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
                expanded[group.categorie] = true;
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
          placeholder="Rechercher par catégorie, nom d'article ou catalogue..."
          className="w-full"
        />
      </span>
    </div>
  );

  const [pdfLoading, setPdfLoading] = useState(false);

 const handleManualDownload = async () => {
  if (!mouvementStockData || !searchParams) return;
  
  // Avertissement pour les très grandes quantités de données
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
    // Étape 1: Préchargement (20%)
    setPdfGeneration({ loading: true, progress: 20 });
    const { pdf, MouvementStockPdf } = await preloadPdfComponents();
    
    // Étape 2: Génération PDF (50%)
    setPdfGeneration({ loading: true, progress: 50 });
    
    // Utiliser setTimeout pour libérer le thread UI
    const blob = await new Promise<Blob>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await pdf(
            <MouvementStockPdf
              data={mouvementStockData}
              dateDebut={searchParams.dateDebut}
              dateFin={searchParams.dateFin}
              groupedData={groupedData}
            />
          ).toBlob();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
    
    // Étape 3: Préparation téléchargement (80%)
    setPdfGeneration({ loading: true, progress: 80 });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mouvement-stock-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyage mémoire différé
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    
    // Étape 4: Terminé (100%)
    setPdfGeneration({ loading: true, progress: 100 });
    
    showToast('success', 'Succès', `PDF téléchargé avec ${totalItems} articles`);
    
    // Réinitialiser après un délai
    setTimeout(() => setPdfGeneration({ loading: false, progress: 0 }), 1000);
    
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    showToast('error', 'Erreur', 'Échec du téléchargement du PDF');
    setPdfGeneration({ loading: false, progress: 0 });
  }
};

// Dans MouvementStockPage.tsx - INDICATEURS DE PERFORMANCE
const [performanceInfo, setPerformanceInfo] = useState({
  itemCount: 0,
  groupCount: 0,
  estimatedSize: '0 KB'
})

 // Calculer la taille estimée
useEffect(() => {
  if (mouvementStockData) {
    const itemCount = mouvementStockData.mouvements?.length || 0;
    const groupCount = groupedData.length;
    
    // Estimation grossière de la taille (environ 2KB par article)
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

// Mise à jour du footer du dialog
const dialogFooter = (
  <div className="flex justify-content-between align-items-center gap-2 w-full">
    <div className="text-sm text-500">
      {performanceInfo.itemCount > 0 && (
        <span>
          {performanceInfo.itemCount} articles • {performanceInfo.groupCount} catégories • 
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
        disabled={pdfGeneration.loading}
        tooltip={`Télécharger tous les ${performanceInfo.itemCount} articles`}
      />
    </div>
  </div>
);

  // Calcul des totaux généraux
  const totalGeneralArticles = groupedData.reduce((sum, group) => sum + group.totalArticles, 0);
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
            <div>Mouvement de Stock - Regroupé par Catégorie</div>
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

          {mouvementStockData && (
            <>
              <DataTable
                value={groupedData}
                loading={loading}
                responsiveLayout="scroll"
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                globalFilter={globalFilter}
                emptyMessage="Aucun mouvement trouvé"
                sortField="categorie"
                sortOrder={1}
              >
                <Column expander style={{ width: '3em' }} />
                <Column 
                  field="categorie" 
                  header="Catégorie" 
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
                  header="Total Entrées" 
                  body={(data: MouvementStockGrouped) => (
                    <div className="flex flex-column">
                      <div>Qté: {formatNumber(data.totalEntrees.qte)}</div>
                      <div>Montant: {formatCurrency(data.totalEntrees.montant)}</div>
                    </div>
                  )}
                  style={{ minWidth: '150px' }}
                />
                <Column 
                  header="Total Sorties" 
                  body={(data: MouvementStockGrouped) => (
                    <div className="flex flex-column">
                      <div>Qté: {formatNumber(data.totalSorties.qte)}</div>
                      <div>Montant: {formatCurrency(data.totalSorties.montant)}</div>
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

              {/* TOTAUX GÉNÉRAUX */}
              <div className="mt-3 font-bold flex justify-content-between p-3 surface-100 border-round">
                <div>
                  <i className="pi pi-box text-blue-500 mr-2"></i>
                  Total Articles: {totalGeneralArticles}
                </div>
                <div>
                  <i className="pi pi-arrow-down text-green-500 mr-2"></i>
                  Total Entrées: {formatNumber(totalGeneralEntreesQte)} / {formatCurrency(totalGeneralEntreesMontant)}
                </div>
                <div>
                  <i className="pi pi-arrow-up text-red-500 mr-2"></i>
                  Total Sorties: {formatNumber(totalGeneralSortiesQte)} / {formatCurrency(totalGeneralSortiesMontant)}
                </div>
                <div>
                  <i className="pi pi-chart-bar text-orange-500 mr-2"></i>
                  Total Stock: {formatNumber(totalGeneralStockQte)} / {formatCurrency(totalGeneralStockMontant)}
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