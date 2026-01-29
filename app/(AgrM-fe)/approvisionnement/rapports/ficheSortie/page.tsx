// RapportSortiesPage.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { DataTableExpandedRows } from 'primereact/datatable';
import { RapportSortie, RapportSortieAggrege, RapportSortieCategorieGroup, RapportSortieParams, RapportSortieSousCategorieGroup } from './RapportSorties';
import RapportSortiesForm from './RapportSortiesForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RapportSortiesPdf from './RapportSortiesPdf';
import { Card } from 'primereact/card';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/apiConfig';

const BASE_URL = `${API_BASE_URL}/stkSorties`;

const RapportSortiesPage: React.FC = () => {
  const [groupedData, setGroupedData] = useState<RapportSortieCategorieGroup[]>([]);
  const [searchParams, setSearchParams] = useState<RapportSortieParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | null>(null);
  const toast = useRef<Toast>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleDialog, setVisibleDialog] = useState(false);

  const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  // Fonction pour regrouper les articles identiques
  const regrouperArticlesIdentiques = (items: RapportSortie[]): RapportSortieAggrege[] => {
    const regroupement = new Map<string, RapportSortieAggrege>();
    
    items.forEach(item => {
      const key = `${item.articleId}_${item.uniteId}`;
      
      if (regroupement.has(key)) {
        const existant = regroupement.get(key)!;
        existant.totalQuantite += item.qteS || 0;
        existant.totalMontant += calculateItemMontant(item);
        existant.nombreSorties += 1;
        // Calculer le prix moyen pondéré
        existant.prixMoyen = existant.totalMontant / existant.totalQuantite;
        existant.detailsOrigine.push(item);
      } else {
        const montant = calculateItemMontant(item);
        const quantite = item.qteS || 0;
        
        regroupement.set(key, {
          articleId: item.articleId || '',
          articleLibelle: item.articleLibelle || '',
          uniteId: item.uniteId || '',
          uniteLibelle: item.uniteLibelle || '',
          sousCategorieId: item.sousCategorieId,
          sousCategorieNom: item.sousCategorieNom,
          totalQuantite: quantite,
          prixMoyen: quantite > 0 ? montant / quantite : 0,
          totalMontant: montant,
          nombreSorties: 1,
          detailsOrigine: [item]
        });
      }
    });
    
    return Array.from(regroupement.values());
  };

  // Fonction pour calculer le montant d'un article
  const calculateItemMontant = (item: RapportSortie): number => {
    if (item.prixTotal && item.prixTotal > 0) {
      return item.prixTotal;
    }
    
    if (item.qteS && item.prixS) {
      return item.qteS * item.prixS;
    }
    
    if (item.montant && item.montant > 0) {
      return item.montant;
    }
    
    if (item.prixS) {
      return item.prixS;
    }
    
    return 0;
  };

  const fetchRapport = async (params: RapportSortieParams) => {
  setLoading(true);
  const debut = format(startOfDay(params.dateDebut), 'yyyy-MM-dd');
  const fin = format(endOfDay(params.dateFin), 'yyyy-MM-dd');

  try {
    let url = `${BASE_URL}/rapportSortiesGrouped?debut=${debut}&fin=${fin}`;
    
    if (params.numeroPiece) {
      url += `&numeroPiece=${params.numeroPiece}`;
    }
    
    if (params.magasinId) {
      url += `&magasinId=${params.magasinId}`;
    }

    if (params.serviceId) {
      url += `&serviceId=${params.serviceId}`;
    }

    // Note: Le paramètre destinationId n'est pas utilisé dans le frontend actuel
    // url += `&destinationId=${params.destinationId || ''}`;

    const response = await axios.get<RapportSortieCategorieGroup[]>(url);

    if (!response.data || response.data.length === 0) {
      accept('info', 'Information', 'Aucune donnée trouvée pour cette période');
      setGroupedData([]);
      return;
    }

    // Les données sont déjà groupées par le backend
    setGroupedData(response.data);
    setSearchParams(params);
    setVisibleDialog(true);
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    accept('error', 'Erreur', 'Échec de la récupération des données');
  } finally {
    setLoading(false);
  }
};

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'BIF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  const expandedRowTemplate = (rowData: RapportSortieCategorieGroup) => {
    return (
        <div className="p-3">
            <div className="mb-3">
                <h4>Détails de la catégorie: {rowData.categorieNom}</h4>
                <p><strong>Nombre d'articles différents:</strong> {rowData.totalArticles}</p>
                <p><strong>Quantité totale:</strong> {rowData.totalQuantite}</p>
                <p><strong>Montant Total:</strong> {formatCurrency(rowData.totalMontant)}</p>
            </div>
            
            {/* Affichage par sous-catégories */}
            {rowData.sousCategories && rowData.sousCategories.map((sousCategorie, idx) => (
                <div key={idx} className="mb-4">
                    <h5 className="font-semibold text-gray-700 mb-2">
                        Sous-catégorie: {sousCategorie.sousCategorieNom}
                        <span className="ml-3 text-sm text-gray-600">
                            ({sousCategorie.totalArticles} articles, {sousCategorie.totalQuantite} unités, {formatCurrency(sousCategorie.totalMontant)})
                        </span>
                    </h5>
                    <DataTable 
                        value={sousCategorie.items} 
                        responsiveLayout="scroll" 
                        size="small"
                        className="mb-4"
                    >
                        <Column field="articleLibelle" header="Article" />
                        <Column field="uniteLibelle" header="Unité" />
                        <Column field="totalQuantite" header="Quantité Totale" />
                        <Column field="prixMoyen" header="Prix Moyen" 
                            body={(data) => formatCurrency(data.prixMoyen)} />
                        <Column field="totalMontant" header="Total" 
                            body={(data) => formatCurrency(data.totalMontant)} />
                        <Column field="nombreSorties" header="Nb. Sorties" />
                    </DataTable>
                </div>
            ))}
            
            {/* Articles sans sous-catégorie */}
            {(!rowData.sousCategories || rowData.sousCategories.length === 0) && rowData.items.length > 0 && (
                <DataTable value={rowData.items} responsiveLayout="scroll" size="small">
                    <Column field="articleLibelle" header="Article" />
                    <Column field="uniteLibelle" header="Unité" />
                    <Column field="totalQuantite" header="Quantité Totale" />
                    <Column field="prixMoyen" header="Prix Moyen" 
                        body={(data) => formatCurrency(data.prixMoyen)} />
                    <Column field="totalMontant" header="Total" 
                        body={(data) => formatCurrency(data.totalMontant)} />
                    <Column field="nombreSorties" header="Nb. Sorties" />
                </DataTable>
            )}
        </div>
    );
  };

  const totalGeneralArticles = groupedData.reduce((sum, group) => sum + group.totalArticles, 0);
  const totalGeneralQuantite = groupedData.reduce((sum, group) => sum + group.totalQuantite, 0);
  const totalGeneralMontant = groupedData.reduce((sum, group) => sum + group.totalMontant, 0);

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
          placeholder="Rechercher par catégorie ou article..."
          className="w-full"
        />
      </span>
      <Button
        icon={expandedRows ? "pi pi-minus" : "pi pi-plus"}
        label={expandedRows ? "Replier Tout" : "Développer Tout"}
        onClick={() => {
          if (expandedRows) {
            setExpandedRows(null);
          } else {
            const expanded: DataTableExpandedRows = {};
            groupedData.forEach(data => {
              expanded[data.categorieId] = true;
            });
            setExpandedRows(expanded);
          }
        }}
        className="p-button-text"
      />
    </div>
  );

  const tableChangeHandle = (e: TabViewTabChangeEvent) => {
    setActiveIndex(e.index);
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Fermer"
        icon="pi pi-times"
        onClick={() => setVisibleDialog(false)}
        className="p-button-text"
      />
      {groupedData.length > 0 && searchParams && (
        <PDFDownloadLink
          document={
            <RapportSortiesPdf
              data={groupedData}
              dateDebut={searchParams.dateDebut}
              dateFin={searchParams.dateFin}
              searchParams={searchParams}
            />
          }
          fileName={`rapport-sorties-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`}
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
                className="p-button-success"
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
        <TabPanel header="Générer Rapport Sorties">
          <Card title="Paramètres du rapport des sorties">
            <RapportSortiesForm
              onSearch={fetchRapport}
              loading={loading}
            />
          </Card>
        </TabPanel>
      </TabView>

      <Dialog
        header={
          <div>
            <div>Rapport des Sorties de Stock</div>
            <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '5px' }}>
              Période: {searchParams ? `${format(searchParams.dateDebut, 'dd/MM/yyyy')} - ${format(searchParams.dateFin, 'dd/MM/yyyy')}` : ''}
            </div>
          </div>
        }
        visible={visibleDialog}
        style={{ width: '95vw', maxWidth: '1200px' }}
        footer={dialogFooter}
        onHide={() => setVisibleDialog(false)}
        maximizable
      >
        <div className="card">
          {renderSearch()}

          <DataTable
            value={groupedData}
            loading={loading}
            responsiveLayout="scroll"
            expandedRows={expandedRows || undefined}
            onRowToggle={(e) => setExpandedRows(e.data as DataTableExpandedRows)}
            rowExpansionTemplate={expandedRowTemplate}
            globalFilter={globalFilter}
            emptyMessage="Aucune sortie trouvée"
            sortField="categorieNom"
            sortOrder={1}
          >
            <Column expander style={{ width: '3em' }} />
            <Column 
              field="categorieNom" 
              header="Catégorie" 
              sortable 
            />
            <Column 
              field="totalArticles" 
              header="Nb. Articles Différents" 
              sortable 
            />
            <Column 
              field="totalQuantite" 
              header="Quantité Totale" 
              sortable 
            />
            <Column
              field="totalMontant"
              header="Sous-Total"
              body={(data) => formatCurrency(data.totalMontant)}
              sortable
            />
          </DataTable>

          <div className="mt-3 font-bold flex justify-content-between">
            <div>Articles différents: {totalGeneralArticles}</div>
            <div>Quantité totale: {totalGeneralQuantite}</div>
            <div>Total Général: {formatCurrency(totalGeneralMontant)}</div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default RapportSortiesPage;