'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { DataTableExpandedRows } from 'primereact/datatable';
import { RapportSortie, RapportSortieGrouped, RapportSortieParams } from './RapportSorties';
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
  const [groupedData, setGroupedData] = useState<RapportSortieGrouped[]>([]);
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

  const fetchRapport = async (params: RapportSortieParams) => {
    setLoading(true);
    const debut = format(startOfDay(params.dateDebut), 'yyyy-MM-dd');
    const fin = format(endOfDay(params.dateFin), 'yyyy-MM-dd');

    try {
      let url = `${BASE_URL}/rapportSorties?debut=${debut}&fin=${fin}`;
      
      if (params.numeroPiece) {
        url += `&numeroPiece=${params.numeroPiece}`;
      }
      
      if (params.magasinId) {
        url += `&magasinId=${params.magasinId}`;
      }

      if (params.serviceId) {
        url += `&serviceId=${params.serviceId}`;
      }

      if (params.destinationId) {
        url += `&destinationId=${params.destinationId}`;
      }

      const response = await axios.get<RapportSortie[]>(url);

      if (!response.data) throw new Error('Aucune donnée trouvée');

      // Grouper par destination
      const grouped = response.data.reduce((acc: RapportSortieGrouped[], item: RapportSortie) => {
        const destination = item.destinationLibelle || 'Non spécifié';
        const existingGroup = acc.find(group => group.destinationLibelle === destination);
        
        if (existingGroup) {
          existingGroup.items.push(item);
          existingGroup.totalSorties += 1;
          existingGroup.totalMontant += item.montant || 0;
        } else {
          acc.push({
            destinationLibelle: destination,
            totalSorties: 1,
            totalMontant: item.montant || 0,
            items: [item]
          });
        }
        return acc;
      }, []);

      setGroupedData(grouped);
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
      minimumFractionDigits: 0 
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  const expandedRowTemplate = (rowData: RapportSortieGrouped) => {
    return (
      <div className="p-3">
        <div className="mb-3">
          <h4>Détails pour {rowData.destinationLibelle}</h4>
          <p><strong>Total Sorties:</strong> {rowData.totalSorties}</p>
          <p><strong>Montant Total:</strong> {formatCurrency(rowData.totalMontant)}</p>
        </div>
        
        <DataTable value={rowData.items} responsiveLayout="scroll" size="small">
          <Column field="numeroPiece" header="Numéro Pièce" />
          <Column field="dateSortie" header="Date Sortie" 
            body={(data) => formatDate(new Date(data.dateSortie))} />
          <Column field="articleLibelle" header="Article" />
          <Column field="uniteLibelle" header="Unité" />
          <Column field="qteS" header="Quantité" />
          <Column field="prixS" header="Prix Unitaire" 
            body={(data) => data.prixS ? formatCurrency(data.prixS) : 'N/A'} />
          <Column field="prixTotal" header="Total" 
            body={(data) => data.prixTotal ? formatCurrency(data.prixTotal) : 'N/A'} />
          <Column field="magasinNom" header="Service destination" />
        </DataTable>
      </div>
    );
  };

  const totalGeneralSorties = groupedData.reduce((sum, group) => sum + group.totalSorties, 0);
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
          placeholder="Rechercher par destinateur ou montant..."
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
              expanded[data.destinationLibelle] = true;
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
            sortField="destinationLibelle"
            sortOrder={1}
          >
            <Column expander style={{ width: '3em' }} />
            <Column 
              field="destinationLibelle" 
              header="Destinateur" 
              sortable 
            />
            <Column 
              field="totalSorties" 
              header="Nb. Sorties" 
              sortable 
            />
            <Column
              field="totalMontant"
              header="Total Montant"
              body={(data) => formatCurrency(data.totalMontant)}
              sortable
            />
          </DataTable>

          <div className="mt-3 font-bold flex justify-content-between">
            <div>Total Sorties: {totalGeneralSorties}</div>
            <div>Total Général: {formatCurrency(totalGeneralMontant)}</div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default RapportSortiesPage;