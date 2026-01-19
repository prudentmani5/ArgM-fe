'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { DataTableExpandedRows } from 'primereact/datatable';
import { RapportConsommation, RapportConsommationGrouped, RapportConsommationParams } from './RapportConsommation';
import RapportConsommationForm from './RapportConsommationForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RapportConsommationPdf from './RapportConsommationPdf';
import { Card } from 'primereact/card';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { API_BASE_URL } from '../../../../../utils/apiConfig';

const BASE_URL = API_BASE_URL;

const RapportConsommationPage: React.FC = () => {
  const [groupedData, setGroupedData] = useState<RapportConsommationGrouped[]>([]);
  const [searchParams, setSearchParams] = useState<RapportConsommationParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | null>(null);
  const toast = useRef<Toast>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleDialog, setVisibleDialog] = useState(false);

  const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const fetchRapport = async (params: RapportConsommationParams) => {
    setLoading(true);
    const debut = format(startOfDay(params.dateDebut), 'yyyy-MM-dd');
    const fin = format(endOfDay(params.dateFin), 'yyyy-MM-dd');

    try {
        let url = `${BASE_URL}/stkConsommations/rapportConsommation?debut=${debut}&fin=${fin}`;
        
        if (params.matricule) {
            url += `&matricule=${params.matricule}`;
        }
        
        if (params.partenaireId) {
            url += `&partenaire=${params.partenaireId}`;
        }

        const response = await axios.get<RapportConsommation[]>(url);

        if (!response.data) throw new Error('Aucune donnée trouvée');

        // Grouper par partenaire au lieu de matricule
        const grouped = response.data.reduce((acc: RapportConsommationGrouped[], item: RapportConsommation) => {
            const existingGroup = acc.find(group => group.partenaireId === item.partenaireId);
            if (existingGroup) {
                existingGroup.items.push(item);
                existingGroup.totalConsommations += 1;
                existingGroup.totalMontant += item.prixTotal;
            } else {
                acc.push({
                    partenaireId: item.partenaireId,
                    libellePartenaire: item.libelle,
                    totalConsommations: 1,
                    totalMontant: item.prixTotal,
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

const expandedRowTemplate = (rowData: RapportConsommationGrouped) => {
    return (
        <div className="p-3">
            <DataTable value={rowData.items} responsiveLayout="scroll" size="small">
                <Column field="matricule" header="Matricule" />
                <Column field="nom" header="Nom" />
                <Column field="prenom" header="Prénom" />
                <Column field="dateConsommation" header="Date" 
                    body={(data) => formatDate(new Date(data.dateConsommation))} />
                <Column field="typeConsommation" header="Type" />
                <Column field="libellePrestation" header="Prestation" />
                <Column field="libelleArticle" header="Article" />
                <Column field="qte" header="Quantité" />
                <Column field="pu" header="Prix Unitaire" 
                    body={(data) => formatCurrency(data.pu)} />
                <Column field="prixTotal" header="Total" 
                    body={(data) => formatCurrency(data.prixTotal)} />
                <Column field="nomAyantDroit" header="Ayant Droit" />
            </DataTable>
        </div>
    );
};

  const totalGeneralConsommations = groupedData.reduce((sum, group) => sum + group.totalConsommations, 0);
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
                placeholder="Rechercher par partenaire ou montant..."
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
                        expanded[data.partenaireId] = true;
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
            <RapportConsommationPdf
              data={groupedData}
              dateDebut={searchParams.dateDebut}
              dateFin={searchParams.dateFin}
              searchParams={searchParams}
            />
          }
          fileName={`rapport-consommation-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`}
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
        <TabPanel header="Générer Rapport Consommation">
          <Card title="Paramètres du rapport de consommation par partenaire">
            <RapportConsommationForm
              onSearch={fetchRapport}
              loading={loading}
            />
          </Card>
        </TabPanel>
      </TabView>

      <Dialog
        //header={`Rapport des Consommations`} 
         header={
    <div>
      <div>Rapport des Consommations</div>
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
    emptyMessage="Aucune consommation trouvée"
>
    <Column expander style={{ width: '3em' }} />
    <Column field="partenaireId" header="ID Partenaire" sortable />
    <Column field="libellePartenaire" header="Partenaire" sortable />
    <Column 
        field="totalConsommations" 
        header="Nb. Consommations" 
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
            <div>Total Consommations: {totalGeneralConsommations}</div>
            <div>Total Général: {formatCurrency(totalGeneralMontant)}</div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default RapportConsommationPage;