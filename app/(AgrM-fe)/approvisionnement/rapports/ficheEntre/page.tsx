// RapportEntreesPage.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { DataTableExpandedRows } from 'primereact/datatable';
import { RapportEntree, RapportEntreeCategorieGroup, RapportEntreeGrouped, RapportEntreeParams } from './RapportEntrees';
import RapportEntreesForm from './RapportEntreesForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RapportEntreesPdf from './RapportEntreesPdf';
import { Card } from 'primereact/card';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/apiConfig';

const BASE_URL = `${API_BASE_URL}/stkEntrees`;

const RapportEntreesPage: React.FC = () => {
  const [groupedData, setGroupedData] = useState<RapportEntreeCategorieGroup[]>([]);
  const [searchParams, setSearchParams] = useState<RapportEntreeParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | null>(null);
  const toast = useRef<Toast>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleDialog, setVisibleDialog] = useState(false);

  const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

 // page.tsx (mis à jour - partie fetchRapport)
const fetchRapport = async (params: RapportEntreeParams) => {
    setLoading(true);
    const debut = format(startOfDay(params.dateDebut), 'yyyy-MM-dd');
    const fin = format(endOfDay(params.dateFin), 'yyyy-MM-dd');

    try {
        let url = `${BASE_URL}/rapportEntrees?debut=${debut}&fin=${fin}`;
        
        if (params.numeroPiece) {
            url += `&numeroPiece=${params.numeroPiece}`;
        }
        
        if (params.magasinId) {
            url += `&magasinId=${params.magasinId}`;
        }

        if (params.fournisseurId) {
            url += `&fournisseurId=${params.fournisseurId}`;
        }

        const response = await axios.get<RapportEntree[]>(url);

        if (!response.data || response.data.length === 0) {
            accept('info', 'Information', 'Aucune donnée trouvée pour cette période');
            setGroupedData([]);
            return;
        }

        // Grouper par catégorie puis par sous-catégorie
        const groupedByCategorie = response.data.reduce((acc: RapportEntreeCategorieGroup[], item: RapportEntree) => {
            // Utiliser la catégorie de l'article
            const categorieId = item.articleCategorieId || 'non-classe';
            const categorieNom = item.articleCategorieNom || 'NON CLASSES';
            const sousCategorieId = item.sousCategorieId || 'non-classe-sous';
            const sousCategorieNom = item.sousCategorieNom || 'Sans sous-catégorie';
            
            // Chercher ou créer la catégorie
            let existingCategorie = acc.find(group => group.categorieId === categorieId);
            
            if (!existingCategorie) {
                existingCategorie = {
                    categorieId,
                    categorieNom,
                    totalArticles: 0,
                    totalMontant: 0,
                    sousCategories: [],
                    items: []
                };
                acc.push(existingCategorie);
            }
            
            // Chercher ou créer la sous-catégorie
            if (existingCategorie.sousCategories) {
                let existingSousCategorie = existingCategorie.sousCategories.find(
                    sub => sub.sousCategorieId === sousCategorieId
                );
                
                if (!existingSousCategorie) {
                    existingSousCategorie = {
                        sousCategorieId,
                        sousCategorieNom,
                        totalArticles: 0,
                        totalMontant: 0,
                        items: []
                    };
                    existingCategorie.sousCategories.push(existingSousCategorie);
                }
                
                // Ajouter l'item à la sous-catégorie
                existingSousCategorie.items.push(item);
                existingSousCategorie.totalArticles += 1;
                const montant = item.prixE || item.prixTotal || item.montant || 0;
                existingSousCategorie.totalMontant += montant;
            }
            
            // Mettre à jour les totaux de la catégorie
            existingCategorie.totalArticles += 1;
            const montant = item.prixE || item.prixTotal || item.montant || 0;
            existingCategorie.totalMontant += montant;
            
            return acc;
        }, []);

        // Trier les catégories (NON CLASSES en dernier)
        const sortedGrouped = groupedByCategorie.sort((a, b) => {
            if (a.categorieNom === 'NON CLASSES') return 1;
            if (b.categorieNom === 'NON CLASSES') return -1;
            return a.categorieNom.localeCompare(b.categorieNom);
        });

        // Trier les sous-catégories dans chaque catégorie
        sortedGrouped.forEach(categorie => {
            if (categorie.sousCategories) {
                categorie.sousCategories.sort((a, b) => 
                    a.sousCategorieNom.localeCompare(b.sousCategorieNom)
                );
            }
        });

        setGroupedData(sortedGrouped);
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

 // page.tsx (mis à jour - partie expandedRowTemplate)
const expandedRowTemplate = (rowData: RapportEntreeCategorieGroup) => {
    return (
        <div className="p-3">
            <div className="mb-3">
                <h4>Détails de la catégorie: {rowData.categorieNom}</h4>
                <p><strong>Nombre d'articles:</strong> {rowData.totalArticles}</p>
                <p><strong>Montant Total:</strong> {formatCurrency(rowData.totalMontant)}</p>
            </div>
            
            {/* Affichage par sous-catégories */}
            {rowData.sousCategories && rowData.sousCategories.map((sousCategorie, idx) => (
                <div key={idx} className="mb-4">
                    <h5 className="font-semibold text-gray-700 mb-2">
                        Sous-catégorie: {sousCategorie.sousCategorieNom}
                        <span className="ml-3 text-sm text-gray-600">
                            ({sousCategorie.totalArticles} articles, {formatCurrency(sousCategorie.totalMontant)})
                        </span>
                    </h5>
                    <DataTable 
                        value={sousCategorie.items} 
                        responsiveLayout="scroll" 
                        size="small"
                        className="mb-4"
                    >
                        <Column field="numeroPiece" header="N° Pièce" />
                        <Column field="dateEntree" header="Date" 
                            body={(data) => formatDate(new Date(data.dateEntree))} />
                        <Column field="articleLibelle" header="Article" />
                        <Column field="uniteLibelle" header="Unité" />
                        <Column field="qteE" header="Quantité" />
                        <Column field="pau" header="Prix Unitaire" 
                            body={(data) => data.pau ? data.pau : 'N/A'} />
                        <Column field="prixTotal" header="Total" 
                            body={(data) => data.prixE ? data.prixE : 'N/A'} />
                        <Column field="fournisseurNom" header="Fournisseur" />
                    </DataTable>
                </div>
            ))}
            
            {/* Articles sans sous-catégorie */}
            {(!rowData.sousCategories || rowData.sousCategories.length === 0) && rowData.items.length > 0 && (
                <DataTable value={rowData.items} responsiveLayout="scroll" size="small">
                    <Column field="numeroPiece" header="N° Pièce" />
                    <Column field="dateEntree" header="Date" 
                        body={(data) => formatDate(new Date(data.dateEntree))} />
                    <Column field="articleLibelle" header="Article" />
                    <Column field="uniteLibelle" header="Unité" />
                    <Column field="qteE" header="Quantité" />
                    <Column field="pau" header="Prix Unitaire" 
                        body={(data) => data.pau ? formatCurrency(data.pau) : 'N/A'} />
                    <Column field="prixTotal" header="Total" 
                        body={(data) => data.prixE ? formatCurrency(data.prixE) : 'N/A'} />
                    <Column field="fournisseurNom" header="Fournisseur" />
                </DataTable>
            )}
        </div>
    );
};

  const totalGeneralEntrees = groupedData.reduce((sum, group) => sum + group.totalArticles, 0);
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
            <RapportEntreesPdf
              data={groupedData}
              dateDebut={searchParams.dateDebut}
              dateFin={searchParams.dateFin}
              searchParams={searchParams}
            />
          }
          fileName={`rapport-entrees-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`}
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
        <TabPanel header="Générer Rapport Entrées">
          <Card title="Paramètres du rapport des entrées">
            <RapportEntreesForm
              onSearch={fetchRapport}
              loading={loading}
            />
          </Card>
        </TabPanel>
      </TabView>

      <Dialog
        header={
          <div>
            <div>Rapport des Entrées de Stock</div>
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
            emptyMessage="Aucune entrée trouvée"
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
              header="Nb. Articles" 
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
            <div>Total Articles: {totalGeneralEntrees}</div>
            <div>Total Général: {formatCurrency(totalGeneralMontant)}</div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default RapportEntreesPage;