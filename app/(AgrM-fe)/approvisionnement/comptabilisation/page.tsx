// pages/ComptabilisationPage.tsx
'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { useRef, useState } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { PDFViewer } from '@react-pdf/renderer';
import ComptabilisationForm from './ComptabilisationForm';
import ComptabilisationPdf from './ComptabilisationPdf';
import { Comptabilisation, ComptabilisationGrouped, ComptabilisationApproRequest, TransferParams } from './Comptabilisation';
import { API_BASE_URL } from '@/utils/apiConfig';

export default function ComptabilisationPage() {
    const [brouillard, setBrouillard] = useState<Comptabilisation[]>([]);
    const [loading, setLoading] = useState(false);
    const [transferLoading, setTransferLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [searchParams, setSearchParams] = useState<ComptabilisationApproRequest | null>(null);
    const toast = useRef<Toast>(null);
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const genererEntree = async (values: ComptabilisationApproRequest) => {
        setLoading(true);
        try {
            const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
            const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');

            const response = await fetch(
                `${API_BASE_URL}/api/comptabilisation/generer-entree-appro`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                }
            );

            if (!response.ok) throw new Error('Erreur lors de la génération des entrées');

            // Récupérer le brouillard généré
            await fetchBrouillard();
            setSearchParams(values);
            showToast('success', 'Succès', 'Entrées comptabilisées avec succès');
            setVisibleDialog(true);
        } catch (error) {
            console.error("Erreur:", error);
            showToast('error', 'Erreur', 'Échec de la comptabilisation des entrées');
        } finally {
            setLoading(false);
        }
    };

    const genererSortie = async (values: ComptabilisationApproRequest) => {
        setLoading(true);
        try {
            const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
            const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');

            const response = await fetch(
                `${API_BASE_URL}/api/comptabilisation/generer-sortie-appro`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                }
            );

            if (!response.ok) throw new Error('Erreur lors de la génération des sorties');

            await fetchBrouillard();
            setSearchParams(values);
            showToast('success', 'Succès', 'Sorties comptabilisées avec succès');
            setVisibleDialog(true);
        } catch (error) {
            console.error("Erreur:", error);
            showToast('error', 'Erreur', 'Échec de la comptabilisation des sorties');
        } finally {
            setLoading(false);
        }
    };

    const transferer = async (values: TransferParams) => {
        setTransferLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/comptabilisation/transferer-appro`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                }
            );

            if (!response.ok) throw new Error('Erreur lors du transfert');

            showToast('success', 'Succès', 'Transfert effectué avec succès');
        } catch (error) {
            console.error("Erreur:", error);
            showToast('error', 'Erreur', 'Échec du transfert');
        } finally {
            setTransferLoading(false);
        }
    };

    const fetchBrouillard = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/comptabilisation/brouillard`);
            if (!response.ok) throw new Error('Erreur lors du chargement du brouillard');
            const data = await response.json();
            setBrouillard(data);
        } catch (error) {
            console.error("Erreur:", error);
            showToast('error', 'Erreur', 'Échec du chargement du brouillard');
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

    const groupedData = brouillard.reduce((acc: ComptabilisationGrouped[], item: Comptabilisation) => {
        const existingGroup = acc.find(group => group.libelle === item.libelle);
        if (existingGroup) {
            existingGroup.items.push(item);
            existingGroup.totalDebit += item.debit;
            existingGroup.totalCredit += item.credit;
        } else {
            acc.push({
                libelle: item.libelle,
                totalDebit: item.debit,
                totalCredit: item.credit,
                items: [item]
            });
        }
        return acc;
    }, []);

    const totalGeneralDebit = groupedData.reduce((sum, group) => sum + group.totalDebit, 0);
    const totalGeneralCredit = groupedData.reduce((sum, group) => sum + group.totalCredit, 0);

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
                        <ComptabilisationPdf
                            data={brouillard}
                            isGrouped={false}
                            dateDebut={searchParams?.dateDebut || new Date()}
                            dateFin={searchParams?.dateFin || new Date()}
                            totalDebit={totalGeneralDebit}
                            totalCredit={totalGeneralCredit}
                        />
                    </PDFViewer>
                </div>
            )}

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Comptabilisation">
                    <ComptabilisationForm
                        onGenererEntree={genererEntree}
                        onGenererSortie={genererSortie}
                        onTransfer={transferer}
                        loading={loading}
                        transferLoading={transferLoading}
                    />
                </TabPanel>

                <TabPanel header="Brouillard Comptable">
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
                                icon="pi pi-refresh"
                                onClick={fetchBrouillard}
                                disabled={loading}
                                tooltip="Rafraîchir"
                                tooltipOptions={{ position: 'left' }}
                                className="mr-2"
                            />
                            <Button
                                icon="pi pi-print"
                                onClick={handlePrintPreview}
                                disabled={loading || brouillard.length === 0}
                                tooltip="Visualiser avant impression"
                                tooltipOptions={{ position: 'left' }}
                            />
                        </div>
                    </div>

                    <DataTable
                        value={brouillard}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        emptyMessage="Aucune donnée trouvée"
                    >
                        <Column field="numeroPiece" header="N° Pièce" sortable />
                        <Column field="compte" header="Compte" sortable />
                        <Column field="libelle" header="Libellé" sortable />
                        <Column field="reference" header="Référence" sortable />
                        <Column field="dateEcriture" header="Date" body={(row) => formatDate(new Date(row.dateEcriture))} sortable />
                        <Column field="debit" header="Débit" body={(row) => formatCurrency(row.debit)} sortable />
                        <Column field="credit" header="Crédit" body={(row) => formatCurrency(row.credit)} sortable />
                    </DataTable>
                </TabPanel>
            </TabView>

            <Dialog
                header="Résultat de la Comptabilisation"
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
                        <Column field="libelle" header="Libellé" sortable />
                        <Column
                            field="totalDebit"
                            header="Total Débit"
                            body={(data) => formatCurrency(data.totalDebit)}
                            sortable
                        />
                        <Column
                            field="totalCredit"
                            header="Total Crédit"
                            body={(data) => formatCurrency(data.totalCredit)}
                            sortable
                        />
                    </DataTable>

                    <div className="mt-3 font-bold">
                        <div>Total Général Débit: {formatCurrency(totalGeneralDebit)}</div>
                        <div>Total Général Crédit: {formatCurrency(totalGeneralCredit)}</div>
                        <div>Solde: {formatCurrency(totalGeneralDebit - totalGeneralCredit)}</div>
                    </div>
                </div>
            </Dialog>
        </>
    );
}