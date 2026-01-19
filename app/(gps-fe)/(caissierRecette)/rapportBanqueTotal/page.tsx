'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { useRef, useState } from 'react';
import { DataTable, DataTableExpandedRows } from 'primereact/datatable';
import { RapportBanqueGroup, DateGroup } from './RapportTotalBanque';
import RapportTotalBanqueForm from './RapportTotalBanqueForm';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RapportTotalBanquePdf from './RapportTotalBanquePdf';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import RapportCaissierTotalPdf from './RapportTotalBanquePdf';
import { Button } from 'primereact/button';
import { API_BASE_URL } from '@/utils/apiConfig';

const RapportTotalBanquePage = () => {
    const baseUrl = `${API_BASE_URL}`;
    const [banqueGroups, setBanqueGroups] = useState<RapportBanqueGroup[]>([]);
    //const [groupedData, setGroupedData] = useState<RapportCaissierGrouped[]>([]);
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

            // Groupement hiérarchique
            const groupedData = data.reduce((acc: RapportBanqueGroup[], item: any) => {
                // Trouver ou créer le groupe banque
                let banqueGroup = acc.find(g => g.nomBanque === item.nomBanque);

                if (!banqueGroup) {
                    banqueGroup = {
                        nomBanque: item.nomBanque,

                        total: 0,
                        datesGroups: []
                    };
                    acc.push(banqueGroup);
                }

                // Trouver ou créer le groupe date dans la banque
                const dateStr = format(new Date(item.datePaiement), 'yyyy-MM-dd');
                let dateGroup = banqueGroup.datesGroups.find(d =>
                    format(d.datePaiement, 'yyyy-MM-dd') === dateStr
                );

                if (!dateGroup) {
                    dateGroup = {
                        datePaiement: new Date(item.datePaiement),
                        total: 0,
                        items: []
                    };
                    banqueGroup.datesGroups.push(dateGroup);
                }

                // Ajouter l'item et mettre à jour les totaux
                dateGroup.items.push(item);
                dateGroup.total += item.montantPaye;
                banqueGroup.total += item.montantPaye;

                return acc;
            }, []);

            setBanqueGroups(groupedData);
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

    const banqueRowTemplate = (rowData: RapportBanqueGroup) => {
        return (
            <div className="p-3">
                <DataTable value={rowData.datesGroups}>
                    <Column field="datePaiement" header="Date" body={(d) => formatDate(d.datePaiement)} />
                    
                    <Column field="total" header="Total" body={(d) => formatCurrency(d.total)} />
                </DataTable>
            </div>
        );
    };

    const dateRowTemplate = (rowData: DateGroup) => {
        return (
            <div className="p-3 ml-3">
                <DataTable value={rowData.items}>

                    <Column field="factureId" header="No Facture" />
                    <Column field="reference" header="Borderau" />
                    <Column field="nomClient" header="Client" />
                    <Column field="modePaiement" header="Mode Paiement" />
                    <Column field="montantPaye" header="Montant" body={(d) => formatCurrency(d.montantPaye)} />
                </DataTable>
            </div>
        );
    };

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Fermer"
                icon="pi pi-times"
                onClick={() => setVisibleDialog(false)}
                className="p-button-text"
            />
            {banqueGroups.length > 0 && searchParams && (
                <PDFDownloadLink
                    document={
                        <RapportTotalBanquePdf
                            data={banqueGroups}
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
                header="Rapport Global par Banque et Date"
                visible={visibleDialog}
                footer={dialogFooter}
                style={{ width: '95vw' }}
                onHide={() => setVisibleDialog(false)}
                maximizable
            >
                <div className="card">
                    <DataTable
                        value={banqueGroups}
                        loading={loading}
                        expandedRows={expandedRows}
                        onRowToggle={(e) => setExpandedRows(e.data as DataTableExpandedRows)}
                        rowExpansionTemplate={banqueRowTemplate}
                        dataKey="nomBanque"
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column field="nomBanque" header="Banque" sortable />
                        <Column field="total" header="Total" body={(d) => formatCurrency(d.total)} sortable />
                    </DataTable>
                </div>
            </Dialog>
        </>
    );
};

export default RapportTotalBanquePage;

