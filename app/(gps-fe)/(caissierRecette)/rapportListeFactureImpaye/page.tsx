'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { DataTableExpandedRows } from 'primereact/datatable';
import { RapportCaissierGrouped } from './RapportCaissierTotal';
import RapportCaissierTotalForm from './RapportCaissierTotalForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RapportCaissierTotalPdf from './RapportCaissierTotalPdf';
import { Card } from 'primereact/card';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

const RapportCaissierTotalPage: React.FC = () => {
    const baseUrl = `${API_BASE_URL}`;
    const [groupedData, setGroupedData] = useState<RapportCaissierGrouped[]>([]);
    const [searchParams, setSearchParams] = useState<{
        dateDebut: Date;
        dateFin: Date;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
    const toast = useRef<Toast>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [visibleDialog, setVisibleDialog] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const fetchRapport = async (values: { dateDebut: Date; dateFin: Date }) => {
        setLoading(true);
        const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
        const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');

        try {
            const response = await fetch(
                `${baseUrl}/entryPayements/rapportCaissierTotal?debut=${debut}&fin=${fin}`
            );

            if (!response.ok) throw new Error('Erreur réseau');

            const data = await response.json();
            setSearchParams(values);

            const grouped = data.reduce((acc: RapportCaissierGrouped[], item: any) => {
                const existingGroup = acc.find(group => group.nomClient === item.nomClient);
                if (existingGroup) {
                    existingGroup.items.push(item);
                    existingGroup.total += item.montantPaye;
                } else {
                    acc.push({
                        nomClient: item.nomClient,
                        total: item.montantPaye,
                        items: [item]
                    });
                }
                return acc;
            }, []);

            setGroupedData(grouped);
            setVisibleDialog(true);
        } catch (error) {
            console.error("Erreur:", error);
            accept('error', 'Erreur', 'Échec de la récupération');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(value);
    };

    const formatDate = (date: Date) => date.toLocaleDateString('fr-FR');

    const expandedRowTemplate = (rowData: RapportCaissierGrouped) => (
        <div className="p-3">
            <DataTable value={rowData.items} responsiveLayout="scroll">
                
                <Column field="datePaiement" header="Date" body={(data) => formatDate(new Date(data.datePaiement))} />
                <Column field="factureId" header="factureId" />
                <Column field="rsp" header="rsp" />
                <Column field="nomClient" header="Client" />
                <Column field="montantPaye" header="Montant" body={(data) => formatCurrency(data.montantPaye)} />
            </DataTable>
        </div>
    );

    const totalGeneral = groupedData.reduce((sum, group) => sum + group.total, 0);

    const toggleAllRows = () => {
        if (Object.keys(expandedRows).length > 0) {
            setExpandedRows({});
        } else {
            const expanded: DataTableExpandedRows = {};
            groupedData.forEach(data => expanded[data.nomClient] = true);
            setExpandedRows(expanded);
        }
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
                    placeholder="Rechercher par client ou montant..."
                    className="w-full"
                />
            </span>
            <Button
                icon={Object.keys(expandedRows).length > 0 ? "pi pi-minus" : "pi pi-plus"}
                label={Object.keys(expandedRows).length > 0 ? "Replier Tout" : "Développer Tout"}
                onClick={toggleAllRows}
                className="p-button-text"
            />
        </div>
    );

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
                        <RapportCaissierTotalPdf
                            data={groupedData}
                            dateDebut={searchParams.dateDebut}
                            dateFin={searchParams.dateFin}
                        />
                    }
                    fileName={`rapport-caisses-global-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`}
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

    return (
        <>
            <Toast ref={toast} />
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Générer Rapport">
                    <Card title="Paramètres du rapport">
                        <RapportCaissierTotalForm
                            onSearch={fetchRapport}
                            loading={loading}
                        />
                    </Card>
                </TabPanel>
            </TabView>

            <Dialog
                header="Rapport Global des Clients"
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
                        expandedRows={expandedRows}
                        onRowToggle={(e) => setExpandedRows(e.data as DataTableExpandedRows)}
                        rowExpansionTemplate={expandedRowTemplate}
                        globalFilter={globalFilter}
                        emptyMessage="Aucune donnée trouvée"
                        dataKey="Client" // Ajoutez cette ligne
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column field="nomClient" header="Client" sortable />
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

export default RapportCaissierTotalPage;