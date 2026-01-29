'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { useRef, useState, useEffect } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { PDFViewer } from '@react-pdf/renderer';
import RecetteCREDITForm from './RecetteCREDITForm';
import RecetteCREDITPdf from './RecetteCREDITPdf';
import { API_BASE_URL } from '@/utils/apiConfig';

interface RecetteCREDIT {
    recetteId: number;
    numCompte: string;
    libelle: string;
    montantTT: number;
    montantExo: number;
    dateSaisie: Date;
}

interface RecetteCREDITGrouped {
    libelle: string;
    totalTT: number;
    totalExo: number;
    items: RecetteCREDIT[];
}

export default function RecetteCREDITPage() {
    const [recettes, setRecettes] = useState<RecetteCREDIT[]>([]);
    const [recettesTVA, setRecettesTVA] = useState<RecetteCREDIT[]>([]);
    const [loading, setLoading] = useState(false);
    const [transferLoading, setTransferLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [searchParams, setSearchParams] = useState<{
        dateDebut: Date;
        dateFin: Date;
        importateur: string;
    } | null>(null);
    const toast = useRef<Toast>(null);
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recettesResponse, tvaResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/recetteCredits/findall`),
                fetch(`${API_BASE_URL}/recetteCredits/tva`)
            ]);

            if (!recettesResponse.ok) throw new Error('Erreur lors du chargement des recettes');
            if (!tvaResponse.ok) throw new Error('Erreur lors du chargement des recettes TVA');

            const recettesData = await recettesResponse.json();
            const tvaData = await tvaResponse.json();

            setRecettes(recettesData);
            setRecettesTVA(tvaData);
        } catch (error) {
            console.error("Erreur de chargement:", error);
            showToast('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const genererRecettes = async (values: { dateDebut: Date; dateFin: Date; importateur: string }) => {
        if (!values.dateDebut || !values.dateFin) {
            showToast('error', 'Erreur', 'Les dates sont requises');
            return;
        }
        setLoading(true);
        try {
            const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
            const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');

            const response = await fetch(
                `${API_BASE_URL}/recetteCredits/generer?dateDebut=${debut}&dateFin=${fin}&importateur=${values.importateur}`,
                { method: 'POST' }
            );

            if (!response.ok) throw new Error('Erreur lors de la génération');

            await fetchData();
            setSearchParams(values);
            showToast('success', 'Succès', 'Recettes générées avec succès');
            setVisibleDialog(false);
        } catch (error) {
            console.error("Erreur:", error);
            showToast('error', 'Erreur', 'Échec de la génération des recettes');
        } finally {
            setLoading(false);
        }
    };

    const transfererRecettes = async (values: {
        annee: string;
        dossierId: string;
        dateDebut: Date;
        dateFin: Date;
        codeJournal: string;
        brouillard: string;
        numeroPiece: number;
        dateTransfert: Date;
    }) => {
        setTransferLoading(true);
        try {
            const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
            const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');
            const dateTransfert = format(values.dateTransfert, 'yyyy-MM-dd');

            const response = await fetch(
                `${API_BASE_URL}/recetteCredits/transferer?annee=${values.annee}` +
                `&dossierId=${values.dossierId}&dateDebut=${debut}&dateFin=${fin}` +
                `&codeJournal=${values.codeJournal}&brouillard=${values.brouillard}` +
                `&numeroPiece=${values.numeroPiece}&dateTransfert=${dateTransfert}`,
                { method: 'POST' }
            );

            if (!response.ok) throw new Error('Erreur lors du transfert');

            showToast('success', 'Succès', 'Recettes transférées avec succès');
        } catch (error) {
            console.error("Erreur:", error);
            showToast('error', 'Erreur', 'Échec du transfert des recettes');
        } finally {
            setTransferLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const groupedData = recettes.reduce((acc: RecetteCREDITGrouped[], item: RecetteCREDIT) => {
        const existingGroup = acc.find(group => group.libelle === item.libelle);
        if (existingGroup) {
            existingGroup.items.push(item);
            existingGroup.totalTT += item.montantTT;
            existingGroup.totalExo += item.montantExo || 0;
        } else {
            acc.push({
                libelle: item.libelle,
                totalTT: item.montantTT,
                totalExo: item.montantExo || 0,
                items: [item]
            });
        }
        return acc;
    }, []);

    const totalGeneralTT = groupedData.reduce((sum, group) => sum + group.totalTT, 0);
    const totalGeneralExo = groupedData.reduce((sum, group) => sum + group.totalExo, 0);


// Après les totaux généraux existants
const totalTVA_TT = recettesTVA.reduce((sum, item) => sum + item.montantTT, 0);
const totalTVA_Exo = recettesTVA.reduce((sum, item) => sum + (item.montantExo || 0), 0);

const totalHTVA_TT = totalGeneralTT - totalTVA_TT;

    const handlePrintPreview = () => {
        setShowPdfPreview(true);
    };

    return (
        <>
            <Toast ref={toast} />

            {/* PDF Preview Modal */}
            {showPdfPreview && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: '10px',
                        backgroundColor: 'white'
                    }}>
                        <Button
                            icon="pi pi-times"
                            onClick={() => setShowPdfPreview(false)}
                            className="p-button-text"
                        />
                        <Button
                            icon="pi pi-print"
                            onClick={() => window.print()}
                            label="Imprimer"
                            className="ml-2"
                        />
                    </div>
                    <PDFViewer style={{
                        width: '100%',
                        height: '100%'
                    }}>
                        <RecetteCREDITPdf
                            data={recettes}
                            isGrouped={false}
                            dateDebut={searchParams?.dateDebut || new Date()}
                            dateFin={searchParams?.dateFin || new Date()}
                            totalTT={totalGeneralTT}
                            totalExo={totalGeneralExo}
                            
                            totalHTVA_TT={totalHTVA_TT}
                            totalTVA_TT={totalTVA_TT}
                        />
                    </PDFViewer>
                </div>
            )}

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Génération">
                    <Card title="Génération des recettes CREDIT">
                        <RecetteCREDITForm
                            onSearch={genererRecettes}
                            onTransfer={transfererRecettes}
                            loading={loading}
                            transferLoading={transferLoading}
                        />
                    </Card>
                </TabPanel>

                <TabPanel header="Liste des recettes">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <span className="p-input-icon-left" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full"
                            />
                        </span>
                        <div>

                            <Button
                                icon="pi pi-print"
                                onClick={handlePrintPreview}
                                disabled={loading || recettes.length === 0}
                                tooltip="Visualiser avant impression"
                                tooltipOptions={{ position: 'left' }}
                                className="mr-2"
                            />
                            <Button
                                icon="pi pi-refresh"
                                onClick={fetchData}
                                disabled={loading}
                                tooltip="Rafraîchir"
                                tooltipOptions={{ position: 'left' }}
                            />

                        </div>

                    </div>


                    <DataTable
                        value={recettes}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        emptyMessage="Aucune donnée trouvée"
                        footer={
                            <div className="flex justify-content-between font-bold">
                                <div>Total TVA:{formatCurrency(totalTVA_TT)}</div>
                                
                                   
                                    <div>HTVA: {formatCurrency( totalHTVA_TT)}</div>
                                    <div>TT: {formatCurrency(totalGeneralTT)}</div>
                                    <div>Exo: {formatCurrency(totalGeneralExo)}</div>
                                
                            </div>
                        }

                    >

                        <Column field="numCompte" header="Num Compte" sortable />
                        <Column field="libelle" header="Libellé" sortable />
                        <Column field="montantTT" header="Montant TT" body={(row) => formatCurrency(row.montantTT)} sortable />
                        <Column field="montantExo" header="Montant Exo" body={(row) => formatCurrency(row.montantExo || 0)} sortable />
                    </DataTable>
                </TabPanel>

                <TabPanel header="Sommation TVA">
                    <DataTable
                        value={recettesTVA}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        emptyMessage="Aucune donnée trouvée"
                    >

                        <Column field="montantTT" header="Montant TT" body={(row) => formatCurrency(row.montantTT)} sortable />
                        <Column field="montantExo" header="Montant Exo" body={(row) => formatCurrency(row.montantExo || 0)} sortable />
                    </DataTable>
                </TabPanel>
            </TabView>

            <Dialog
                header="Résultat des recettes CREDIT"
                visible={visibleDialog}
                style={{ width: '80vw' }}
                onHide={() => setVisibleDialog(false)}
                maximizable
            >
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <span className="p-input-icon-left" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par libellé..."
                                className="w-full"
                            />
                        </span>
                    </div>

                    <DataTable
                        value={groupedData}
                        loading={loading}
                        responsiveLayout="scroll"
                        globalFilter={globalFilter}
                        emptyMessage="Aucune donnée trouvée"
                    >
                        <Column field="numCompte" header="Numero du Compte" sortable />
                        <Column
                            field="totalTT"
                            header="Total TT"
                            body={(data) => formatCurrency(data.totalTT)}
                            sortable
                        />
                        <Column
                            field="totalExo"
                            header="Total Exo"
                            body={(data) => formatCurrency(data.totalExo)}
                            sortable
                        />
                    </DataTable>

                   <div className="mt-3 font-bold">
                        <div>Total Général TT: {formatCurrency(totalGeneralTT)}</div>
                        <div>Total Général Exo: {formatCurrency(totalGeneralExo)}</div>
                    </div> 
                </div>
            </Dialog>
        </>
    );
}