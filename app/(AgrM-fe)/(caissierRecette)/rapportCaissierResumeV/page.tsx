'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useRef, useState } from 'react';
import { DataTableExpandedRows } from 'primereact/datatable';
import { RapportCaissier, RapportCaissierGrouped } from './RapportCaissier';
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

interface ModePaiementGroup {
  modePaiement: string;
  total: number;
  totalFacture: number;
  totalExcedent: number;
  items: RapportCaissier[];
}

interface RapportCaissierSummary {
  nomBanque: string;
  total: number;
  totalFacture: number;
  totalExcedent: number;
  modePaiementGroups: ModePaiementGroup[];
}

const RapportCaissierPage: React.FC = () => {
  const baseUrl = `${API_BASE_URL}`;
  const [summaryData, setSummaryData] = useState<RapportCaissierSummary[]>([]);
  const [searchParams, setSearchParams] = useState<{
    dateDebut: Date;
    dateFin: Date;
    userCreation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
  const [expandedModeRows, setExpandedModeRows] = useState<DataTableExpandedRows>({});
  const toast = useRef<Toast>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleDialog, setVisibleDialog] = useState(false);

  const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

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

      // Group data hierarchically: Banque -> ModePaiement
      const groupedSummary = data.reduce((acc: RapportCaissierSummary[], item: RapportCaissier) => {
        // Calculate MontantFacture
        const montantExcedent = item.montantExcedent || 0;
        const montantFacture = item.montantPaye - montantExcedent;

        // Find or create banque group
        let banqueGroup = acc.find(g => g.nomBanque === item.nomBanque);

        if (!banqueGroup) {
          banqueGroup = {
            nomBanque: item.nomBanque,
            total: 0,
            totalFacture: 0,
            totalExcedent: 0,
            modePaiementGroups: []
          };
          acc.push(banqueGroup);
        }

        // Find or create modePaiement group
        let modePaiementGroup = banqueGroup.modePaiementGroups.find(m =>
          m.modePaiement === item.modePaiement
        );

        if (!modePaiementGroup) {
          modePaiementGroup = {
            modePaiement: item.modePaiement,
            total: 0,
            totalFacture: 0,
            totalExcedent: 0,
            items: []
          };
          banqueGroup.modePaiementGroups.push(modePaiementGroup);
        }

        // Add item and update totals
        modePaiementGroup.items.push(item);
        modePaiementGroup.total += item.montantPaye;
        modePaiementGroup.totalFacture += montantFacture;
        modePaiementGroup.totalExcedent += montantExcedent;

        banqueGroup.total += item.montantPaye;
        banqueGroup.totalFacture += montantFacture;
        banqueGroup.totalExcedent += montantExcedent;

        return acc;
      }, []);

      setSummaryData(groupedSummary);
      setExpandedRows({});
      setExpandedModeRows({});
      setVisibleDialog(true);
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

  const banqueRowTemplate = (rowData: RapportCaissierSummary) => {
    return (
      <div className="p-3">
        <DataTable
          value={rowData.modePaiementGroups}
          expandedRows={expandedModeRows}
          onRowToggle={(e) => setExpandedModeRows(e.data as DataTableExpandedRows)}
          rowExpansionTemplate={modePaiementRowTemplate}
          dataKey="modePaiement"
          responsiveLayout="scroll"
        >
          <Column expander style={{ width: '3em' }} />
          <Column field="modePaiement" header="Mode Paiement" sortable />
          <Column 
            field="total" 
            header="Montant Payé" 
            body={(d: ModePaiementGroup) => formatCurrency(d.total)} 
            sortable 
          />
          <Column 
            field="totalExcedent" 
            header="Montant Excédent" 
            body={(d: ModePaiementGroup) => formatCurrency(d.totalExcedent)} 
            sortable 
          />
          <Column 
            field="totalFacture" 
            header="Montant Facture" 
            body={(d: ModePaiementGroup) => formatCurrency(d.totalFacture)} 
            sortable 
          />
        </DataTable>
      </div>
    );
  };

  const modePaiementRowTemplate = (rowData: ModePaiementGroup) => {
    return (
      <div className="p-3 ml-4">
        <DataTable value={rowData.items} responsiveLayout="scroll">
          <Column field="datePaiement" header="Date" body={(d: RapportCaissier) => formatDate(new Date(d.datePaiement))} />
          <Column field="factureId" header="No Facture" />
          <Column field="reference" header="Borderau" />
          <Column field="nomClient" header="Client" />
          <Column field="modePaiement" header="Mode Paiement" />
          <Column field="montantPaye" header="Montant Payé" body={(d: RapportCaissier) => formatCurrency(d.montantPaye)} />
          <Column field="montantExcedent" header="Montant Excédent" body={(d: RapportCaissier) => formatCurrency(d.montantExcedent || 0)} />
          <Column 
            header="Montant Facture" 
            body={(d: RapportCaissier) => {
              const montantFacture = d.montantPaye - (d.montantExcedent || 0);
              return formatCurrency(montantFacture);
            }} 
          />
        </DataTable>
      </div>
    );
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
          placeholder="Rechercher par banque ou mode de paiement..."
          className="w-full"
        />
      </span>
      <Button
        icon={Object.keys(expandedRows).length > 0 ? "pi pi-minus" : "pi pi-plus"}
        label={Object.keys(expandedRows).length > 0 ? "Replier Tout" : "Développer Tout"}
        onClick={() => {
          if (Object.keys(expandedRows).length > 0) {
            setExpandedRows({});
            setExpandedModeRows({});
          } else {
            const expanded: DataTableExpandedRows = {};
            summaryData.forEach(data => {
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
      {summaryData.length > 0 && searchParams && (
        <PDFDownloadLink
          document={
            <RapportCaissierPdf
              data={summaryData}
              dateDebut={searchParams.dateDebut}
              dateFin={searchParams.dateFin}
              userCreation={searchParams.userCreation}
            />
          }
          fileName={`rapport-caissier-${searchParams.userCreation}-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`}
        >
          {({ loading: pdfLoading }) => (
            <Button
              label={pdfLoading ? "Génération..." : "Télécharger PDF"}
              icon="pi pi-download"
              loading={pdfLoading}
              className="p-button-success"
            />
          )}
        </PDFDownloadLink>
      )}
    </div>
  );

  const totalGeneral = summaryData.reduce((sum, group) => sum + group.total, 0);
  const totalGeneralFacture = summaryData.reduce((sum, group) => sum + group.totalFacture, 0);
  const totalGeneralExcedent = summaryData.reduce((sum, group) => sum + group.totalExcedent, 0);

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

      <Dialog
        header={`Rapport Caissier - ${searchParams?.userCreation || ''}`}
        visible={visibleDialog}
        style={{ width: '95vw' }}
        footer={dialogFooter}
        onHide={() => setVisibleDialog(false)}
        maximizable
      >
        <div className="card">
          {renderSearch()}

          <DataTable
            value={summaryData}
            loading={loading}
            responsiveLayout="scroll"
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data as DataTableExpandedRows)}
            rowExpansionTemplate={banqueRowTemplate}
            globalFilter={globalFilter}
            emptyMessage="Aucune donnée trouvée"
            dataKey="nomBanque"
          >
            <Column expander style={{ width: '3em' }} />
            <Column field="nomBanque" header="Banque" sortable />
            <Column
              field="total"
              header="Montant Payé"
              body={(data: RapportCaissierSummary) => formatCurrency(data.total)}
              sortable
            />
            <Column
              field="totalExcedent"
              header="Montant Excédent"
              body={(data: RapportCaissierSummary) => formatCurrency(data.totalExcedent)}
              sortable
            />
            <Column
              field="totalFacture"
              header="Montant Facture"
              body={(data: RapportCaissierSummary) => formatCurrency(data.totalFacture)}
              sortable
            />
          </DataTable>

          <div className="mt-4 p-3 surface-100 border-round">
            <div className="grid">
              <div className="col-4 text-center">
                <div className="text-sm font-semibold text-600">Total Montant Payé</div>
                <div className="text-xl font-bold">{formatCurrency(totalGeneral)}</div>
              </div>
              <div className="col-4 text-center">
                <div className="text-sm font-semibold text-600">Total Montant Facture</div>
                <div className="text-xl font-bold">{formatCurrency(totalGeneralFacture)}</div>
              </div>
              <div className="col-4 text-center">
                <div className="text-sm font-semibold text-600">Total Montant Excédent</div>
                <div className="text-xl font-bold">{formatCurrency(totalGeneralExcedent)}</div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default RapportCaissierPage;