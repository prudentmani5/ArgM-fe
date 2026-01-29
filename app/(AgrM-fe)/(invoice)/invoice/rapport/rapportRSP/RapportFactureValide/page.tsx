'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import FacFactureValideForm from './FacFactureValideForm';
import { FacFactureValide } from './FacFactureValide';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FacFactureValidePdf from './FacFactureValidePdf';
import { API_BASE_URL } from '@/utils/apiConfig';
import { Dialog } from 'primereact/dialog';

const RapportFactureValidePage: React.FC = () => {
    const baseUrl = `${API_BASE_URL}`;
    const [facturesData, setFacturesData] = useState<FacFactureValide[]>([]);
    const [searchParams, setSearchParams] = useState<{
        dateDebut: Date;
        dateFin: Date;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
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
            // Générer le rapport
            const generateResponse = await fetch(
                `${baseUrl}/facturesValidees/generer?dateDebut=${debut}&dateFin=${fin}`,
                { method: 'POST' }
            );

            if (!generateResponse.ok) throw new Error('Erreur lors de la génération');

            // Récupérer les données
            const fetchResponse = await fetch(`${baseUrl}/facturesValidees/findall`);
            if (!fetchResponse.ok) throw new Error('Erreur réseau');

            const data = await fetchResponse.json();

            setSearchParams(values);
            setFacturesData(data);
            setVisibleDialog(true);
            accept('success', 'Succès', `${data.length} factures validées trouvées`);
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
            accept('error', 'Erreur', 'Échec de la récupération des données');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
        } catch (e) {
            return dateString;
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

    const filteredData = facturesData.filter(item =>
        !globalFilter ||
        Object.values(item).some(
            val => val?.toString().toLowerCase().includes(globalFilter.toLowerCase())
        )
    );

    const totalMontantTotal = filteredData.reduce((sum, item) => sum + (item.montantTotal || 0), 0);
    const totalMontantHorsTVA = filteredData.reduce((sum, item) => sum + (item.montantHorsTVA || 0), 0);
    const totalTVA = filteredData.reduce((sum, item) => sum + (item.tva || 0), 0);

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
                    placeholder="Rechercher par facture, client, marchandise..."
                    className="w-full"
                />
            </span>
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
            {facturesData.length > 0 && searchParams && (
                <PDFDownloadLink
                    document={
                        <FacFactureValidePdf
                            data={filteredData}
                            globalFilter={globalFilter}
                        />
                    }
                    fileName={`rapport-factures-validees-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`}
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
                    <Card title="Rapport des Factures Validées">
                        <FacFactureValideForm
                            onSearch={fetchRapport}
                            loading={loading}
                        />
                    </Card>
                </TabPanel>
            </TabView>

            {/* Dialog de visualisation */}
            <Dialog
                header="Rapport des Factures Validées"
                visible={visibleDialog}
                style={{ width: '95vw' }}
                footer={dialogFooter}
                onHide={() => setVisibleDialog(false)}
                maximizable
            >
                <div className="card">
                    {renderSearch()}

                    <DataTable
                        value={filteredData}
                        loading={loading}
                        responsiveLayout="scroll"
                        globalFilter={globalFilter}
                        emptyMessage="Aucune facture validée trouvée"
                        paginator
                        rows={15}
                        rowsPerPageOptions={[10, 15, 25, 50]}
                    >
                        <Column
                            field="numFacture"
                            header="N° Facture"
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column
                            field="nomClient"
                            header="Client"
                            sortable
                            style={{ minWidth: '200px' }}
                        />
                        <Column
                            field="nomMarchandise"
                            header="Marchandise"
                            sortable
                            style={{ minWidth: '250px' }}
                        />
                        <Column
                            field="montantHorsTVA"
                            header="Montant HTVA"
                            body={(data) => formatCurrency(data.montantHorsTVA)}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column
                            field="tva"
                            header="TVA"
                            body={(data) => formatCurrency(data.tva)}
                            sortable
                            style={{ minWidth: '100px' }}
                        />
                        <Column
                            field="montantTotal"
                            header="Montant Total"
                            body={(data) => formatCurrency(data.montantTotal)}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column
                            field="userValidation"
                            header="Validé par"
                            sortable
                            style={{ minWidth: '150px' }}
                        />
                        <Column
                            field="dateValidation"
                            header="Date Validation"
                            body={(data) => formatDate(data.dateValidation)}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                    </DataTable>

                    {/* Totaux */}
                    <div className="mt-4 p-3 surface-100 border-round">
                        <div className="grid">
                            <div className="col-3">
                                <div className="text-sm font-semibold text-600">Total Montant TTC</div>
                                <div className="text-xl font-bold text-primary">{formatCurrency(totalMontantTotal)}</div>
                            </div>
                            <div className="col-3">
                                <div className="text-sm font-semibold text-600">Total HTVA</div>
                                <div className="text-xl font-bold text-green-600">{formatCurrency(totalMontantHorsTVA)}</div>
                            </div>
                            <div className="col-3">
                                <div className="text-sm font-semibold text-600">Total TVA</div>
                                <div className="text-xl font-bold text-orange-600">{formatCurrency(totalTVA)}</div>
                            </div>
                            <div className="col-3">
                                <div className="text-sm font-semibold text-600">Nombre de factures</div>
                                <div className="text-xl font-bold text-cyan-600">{filteredData.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default RapportFactureValidePage;
