'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { DataTableExpandedRows } from 'primereact/datatable';
import { RapportCaissier, RapportCaissierGrouped, Caissier } from './RapportCaissier';
import RapportCaissierForm from './RapportCaissierForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RapportCaissierPdf from './RapportCaissierPdf';
import { Card } from 'primereact/card';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

const RapportCaissierPage: React.FC = () => {
  const baseUrl = `${API_BASE_URL}`;
  const [groupedData, setGroupedData] = useState<RapportCaissierGrouped[]>([]);
  const [searchParams, setSearchParams] = useState<{
    dateDebut: Date;
    dateFin: Date;
    userCreation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  //const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>(null);
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | null>(null);
  const toast = useRef<Toast>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [dateDebut, setDateDebut] = useState<Date>(new Date());
  const [dateFin, setDateFin] = useState<Date>(new Date());
  const [selectedCaissier, setSelectedCaissier] = useState<number | null>(null);
  const [pdfReady, setPdfReady] = useState(false);

  const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const [visibleDialog, setVisibleDialog] = useState(false);

  const fetchRapport = async (values: { dateDebut: Date; dateFin: Date; userCreation: string }) => {
    setLoading(true);
    const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
    const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');

    try {
      const response = await fetch(
        `${baseUrl}/entryPayements/rapportCaissierByUser?debut=${debut}&fin=${fin}&userCreation=${encodeURIComponent(values.userCreation)}`
      );

      if (!response.ok) throw new Error('Erreur réseau');

      const data = await response.json();

      setSearchParams(values);

      const grouped = data.reduce((acc: RapportCaissierGrouped[], item: RapportCaissier) => {
        const existingGroup = acc.find(group => group.nomBanque === item.nomBanque);
        if (existingGroup) {
          existingGroup.items.push(item);
          existingGroup.total += item.montantPaye;
        } else {
          acc.push({
            nomBanque: item.nomBanque,
            total: item.montantPaye,
            items: [item]
          });
        }
        return acc;
      }, []);

      setGroupedData(grouped);
      //setExpandedRows(null);
      setGroupedData(grouped);
      setVisibleDialog(true); // Ouvrir le dialog après la recherche
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      accept('error', 'Erreur', 'Échec de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  const expandedRowTemplate = (rowData: RapportCaissierGrouped) => {
    return (
      <div className="p-3">
        <DataTable value={rowData.items} responsiveLayout="scroll">
          <Column field="datePaiement" header="Date" body={(data) => formatDate(new Date(data.datePaiement))} />
          <Column field="factureId" header="No Facture" />
          <Column field="reference" header="Borderau" />
          <Column field="nomClient" header="Client" />
          <Column field="modePaiement" header="Mode Paiement" />
          <Column field="reference" header="Référence" />
           <Column 
            field="difference" 
            header="Montant Facture" 
            body={(data) => {
              const difference = (data.montantPaye || 0) - (data.montantExcedent || 0);
              return (
                <span 
                  className={`font-bold ${
                    difference > 0 
                      ? 'text-green-600' 
                      : difference < 0 
                      ? 'text-red-600' 
                      : 'text-gray-600'
                  }`}
                >
                  {formatCurrency(difference)}
                </span>
              );
            }}
          />
          <Column field="montantExcedent" header="Montant Excedent" body={(data) => formatCurrency(data.montantExcedent)} />
          <Column field="montantPaye" header="Montant" body={(data) => formatCurrency(data.montantPaye)} />
         
        </DataTable>
      </div>
    );
  };

  const totalGeneral = groupedData.reduce((sum, group) => sum + group.total, 0);

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
          placeholder="Rechercher par banque ou montant..."
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
              expanded[data.nomBanque] = true;
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
            <RapportCaissierPdf
              data={groupedData}
              dateDebut={searchParams.dateDebut}
              dateFin={searchParams.dateFin}
              userCreation={searchParams.userCreation}
            />
          }
          fileName={`rapport-caissier-${searchParams.userCreation}-${format(searchParams.dateDebut, 'yyyyMMdd')
            }-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`}
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
        <TabPanel header="Générer Rapport">
          <Card title="Paramètres du rapport">
            <RapportCaissierForm
              onSearch={fetchRapport}
              loading={loading}
            />
          </Card>
        </TabPanel>
      </TabView>

      {/* Dialog de visualisation */}
      <Dialog

        header={`Rapport Caissier`}
        visible={visibleDialog}
        style={{ width: '90vw' }}
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
            onRowToggle={(e) => setExpandedRows(e.data ? (e.data as DataTableExpandedRows) : null)}
            rowExpansionTemplate={expandedRowTemplate}
            globalFilter={globalFilter}
            emptyMessage="Aucune donnée trouvée"
          >
            <Column expander style={{ width: '3em' }} />
            <Column field="nomBanque" header="Banque" sortable />
            <Column
              field="total"
              header="Total"
              body={(data) => formatCurrency(data.total)}
              sortable
            />
          </DataTable>

          <div className="mt-3 font-bold">
            Total Général: {formatCurrency(totalGeneral)}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default RapportCaissierPage;