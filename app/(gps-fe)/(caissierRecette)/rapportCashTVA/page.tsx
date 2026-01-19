'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { useRef, useState } from 'react';
import { DataTable, DataTableExpandedRows } from 'primereact/datatable';
import { DateGroup } from './RapportTotalBanque';
import RapportTotalBanqueForm from './RapportTotalBanqueForm';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RapportTotalBanquePdf from './RapportTotalBanquePdf';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { API_BASE_URL } from '@/utils/apiConfig';

const RapportTotalBanquePage = () => {
    const baseUrl = `${API_BASE_URL}`;
    const [dateGroups, setDateGroups] = useState<DateGroup[]>([]);
    const [searchParams, setSearchParams] = useState<{ dateDebut: Date; dateFin: Date } | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
    const toast = useRef<Toast>(null);
    const [visibleDialog, setVisibleDialog] = useState(false);

    const fetchRapport = async ({ dateDebut, dateFin }: { dateDebut: Date; dateFin: Date }) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${baseUrl}/entryPayements/rapportBanqueTotal?debut=${format(startOfDay(dateDebut), 'yyyy-MM-dd')}&fin=${format(endOfDay(dateFin), 'yyyy-MM-dd')}`
            );

            if (!response.ok) throw new Error('Erreur réseau');

            const data = await response.json();
            setSearchParams({ dateDebut, dateFin });

            // Groupement par date seulement
            const groupedData = data.reduce((acc: DateGroup[], item: any) => {
                const dateStr = format(new Date(item.datePaiement), 'yyyy-MM-dd');
                let dateGroup = acc.find(d => 
                    format(d.datePaiement, 'yyyy-MM-dd') === dateStr
                );
                
                if (!dateGroup) {
                    dateGroup = {
                        datePaiement: new Date(item.datePaiement),
                        total: 0,
                         totalTVA: 0,
                         totalHTVA: 0,
                        items: []
                    };
                    acc.push(dateGroup);
                }

                dateGroup.items.push(item);
                dateGroup.total += item.montantPaye;
                dateGroup.totalTVA += item.montantTVA;
                dateGroup.totalHTVA += item.montantHTVA;

                return acc;
            }, []);

            // Trier par date
            groupedData.sort((a: { datePaiement: { getTime: () => number; }; }, b: { datePaiement: { getTime: () => number; }; }) => a.datePaiement.getTime() - b.datePaiement.getTime());
            
            setDateGroups(groupedData);
            setVisibleDialog(true);
        } catch (error) {
            //showToast('error', 'Erreur', 'Échec de la récupération des données');
        } finally {
            setLoading(false);
        }
    };

    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(value);
    };

    const formatDate = (date: Date) => date.toLocaleDateString('fr-FR');

    const banqueRowTemplate = (rowData: DateGroup) => {
        return (
            <div className="p-3">
                <DataTable value={rowData.items}>
                    <Column field="datePaiement" header="Date" body={(d) => formatDate(d.datePaiement)} />
                     <Column field="totalHTVA" header="total HTVA" body={(d) => formatCurrency(d.totalHTVA)} />
                    <Column field="totalTVA" header="Total TVA" body={(d) => formatCurrency(d.totalTVA)} />
                     <Column field="total" header="Total" body={(d) => formatCurrency(d.total)} />
                  
                </DataTable>
            </div>
        );
    };

    const expandedRowTemplate = (rowData: DateGroup) => {
        return (
            <div className="p-3">
                <DataTable value={rowData.items}>
                  {/*  <Column field="libelleBanque" header="Banque" />
                    <Column field="nomCaissier" header="Caissier" />
                    <Column field="nomClient" header="Client" /> 
                    <Column field="datePaiement" header="Date" body={(d) => formatDate(d.datePaiement)} />*/ }
                    <Column field="montantHTVA" header="montant HTVA" body={(d) => formatCurrency(d.montantHTVA)} />
                    <Column field="montantTVA" header="Montant TVA" body={(d) => formatCurrency(d.montantTVA)} />
                    <Column field="montantPaye" header="Montant TTC" body={(d) => formatCurrency(d.montantPaye)} />
                </DataTable>
            </div>
        );
    };

    const totalGeneral = dateGroups.reduce((sum, group) => sum + group.total, 0);

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Fermer"
                icon="pi pi-times"
                onClick={() => setVisibleDialog(false)}
                className="p-button-text"
            />
            {dateGroups.length > 0 && searchParams && (
                <PDFDownloadLink
                    document={
                        <RapportTotalBanquePdf
                            data={dateGroups}
                            dateDebut={searchParams.dateDebut}
                            dateFin={searchParams.dateFin}
                        />
                    }
                    fileName={`rapport-banques-global-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`}
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
            <TabView>
                <TabPanel header="Générer Rapport">
                    <Card title="Paramètres du rapport">
                        <RapportTotalBanqueForm onSearch={fetchRapport} loading={loading} />
                    </Card>
                </TabPanel>
            </TabView>

            <Dialog
                header="Rapport par Date"
                visible={visibleDialog}
                footer={dialogFooter}
                style={{ width: '90vw' }}
                onHide={() => setVisibleDialog(false)}
                maximizable
            >
                <div className="card">
                    <DataTable
                        value={dateGroups}
                        loading={loading}
                        //expandedRows={expandedRows}
                        //onRowToggle={(e) => setExpandedRows(e.data as DataTableExpandedRows)}
                        rowExpansionTemplate={expandedRowTemplate}
                        dataKey="datePaiement"
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column 
                            field="datePaiement" 
                            header="Date" 
                            body={(d) => formatDate(d.datePaiement)} 
                            sortable 
                        />
                        <Column
                            field="totalHTVA"
                            header="Total HTVA"
                            body={(d) => formatCurrency(d.totalHTVA)}
                            sortable
                        />
                        <Column
                            field="total"
                            header="Total TVA"
                            body={(d) => formatCurrency(d.totalTVA)}
                            sortable
                        />
                        <Column
                            field="total"
                            header="Total TTC"
                            body={(d) => formatCurrency(d.total)}
                            sortable
                        />
                    </DataTable>

                    <div className="mt-4 text-xl font-bold">
                        Total Général: {formatCurrency(totalGeneral)}
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default RapportTotalBanquePage;

function showToast(arg0: string, arg1: string, arg2: string) {
    throw new Error('Function not implemented.');
}

