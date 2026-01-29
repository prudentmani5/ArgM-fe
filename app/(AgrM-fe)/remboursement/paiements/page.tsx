'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';

import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

import PaiementForm from './PaiementForm';
import {
    PaiementCredit,
    PaiementCreditClass,
    ModeRemboursement,
    MODES_REMBOURSEMENT
} from '../types/RemboursementTypes';

const PaiementsPage = () => {
    const [paiements, setPaiements] = useState<PaiementCredit[]>([]);
    const [paiement, setPaiement] = useState<PaiementCredit>(new PaiementCreditClass());
    const [modesRemboursement, setModesRemboursement] = useState<ModeRemboursement[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [showReceiptDialog, setShowReceiptDialog] = useState(false);
    const [selectedPaiement, setSelectedPaiement] = useState<PaiementCredit | null>(null);

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/payments');
    const MODES_URL = buildApiUrl('/api/remboursement/repayment-modes');

    useEffect(() => {
        loadPaiements();
        loadModesRemboursement();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadPaiements':
                    setPaiements(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadModes':
                    setModesRemboursement(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'process':
                    showToast('success', 'Succès', 'Paiement traité avec succès. Allocation automatique effectuée.');
                    setSelectedPaiement(data);
                    setShowReceiptDialog(true);
                    resetForm();
                    loadPaiements();
                    break;
                case 'create':
                case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm();
                    loadPaiements();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Paiement supprimé');
                    loadPaiements();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadPaiements = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadPaiements');
    };

    const loadModesRemboursement = () => {
        fetchData(null, 'GET', `${MODES_URL}/findallactive`, 'loadModes');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setPaiement(new PaiementCreditClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPaiement(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setPaiement(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setPaiement(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setPaiement(prev => ({ ...prev, [name]: value?.toISOString().split('T')[0] }));
    };

    const handleCheckboxChange = (name: string, value: boolean) => {
        setPaiement(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!paiement.loanId || !paiement.amountReceived || paiement.amountReceived <= 0) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires');
            return;
        }

        // Traiter le paiement avec allocation automatique
        fetchData(paiement, 'POST', `${BASE_URL}/process`, 'process');
    };

    const handleView = (rowData: PaiementCredit) => {
        setPaiement({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleEdit = (rowData: PaiementCredit) => {
        setPaiement({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: PaiementCredit) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer ce paiement ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Non, annuler',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const handlePrintReceipt = (rowData: PaiementCredit) => {
        setSelectedPaiement(rowData);
        setShowReceiptDialog(true);
    };

    // Column body templates
    const paymentModeBodyTemplate = (rowData: PaiementCredit) => {
        let mode = 'Agence';
        let icon = 'pi-building';
        let color = 'primary';

        if (rowData.isAutoDebit) { mode = 'Prélèvement auto'; icon = 'pi-sync'; color = 'info'; }
        else if (rowData.isHomeCollection) { mode = 'Collecte domicile'; icon = 'pi-home'; color = 'warning'; }
        else if (rowData.isMobileMoney) { mode = 'Mobile Money'; icon = 'pi-mobile'; color = 'success'; }
        else if (rowData.isBankTransfer) { mode = 'Virement'; icon = 'pi-building'; color = 'help'; }

        return (
            <Tag severity={color as any}>
                <i className={`pi ${icon} mr-1`}></i>
                {mode}
            </Tag>
        );
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const dateBodyTemplate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const actionsBodyTemplate = (rowData: PaiementCredit) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                tooltip="Voir"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleView(rowData)}
            />
            <Button
                icon="pi pi-print"
                rounded
                text
                severity="success"
                tooltip="Imprimer Reçu"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handlePrintReceipt(rowData)}
            />
            <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                tooltip="Supprimer"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleDelete(rowData)}
            />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">
                <i className="pi pi-credit-card mr-2"></i>
                Liste des Paiements
            </h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Paiement" leftIcon="pi pi-plus mr-2">
                    <div className="mb-3 p-3 surface-100 border-round">
                        <h5 className="m-0 text-primary">
                            <i className="pi pi-info-circle mr-2"></i>
                            Modes de Remboursement Disponibles
                        </h5>
                        <div className="flex flex-wrap gap-3 mt-3">
                            {MODES_REMBOURSEMENT.map((mode, index) => (
                                <div key={index} className="flex align-items-center">
                                    <Tag value={mode.label} severity={['primary', 'info', 'warning', 'success', 'help'][index] as any} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <PaiementForm
                        paiement={paiement}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleCheckboxChange={handleCheckboxChange}
                        modesRemboursement={modesRemboursement}
                        isViewMode={isViewMode}
                    />

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            severity="secondary"
                            onClick={resetForm}
                        />
                        {!isViewMode && (
                            <Button
                                label="Traiter le Paiement"
                                icon="pi pi-check"
                                onClick={handleSubmit}
                                loading={loading}
                            />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Historique des Paiements" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={paiements}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun paiement trouvé"
                        className="p-datatable-sm"
                        sortField="paymentDate"
                        sortOrder={-1}
                    >
                        <Column field="paymentNumber" header="N° Paiement" sortable filter style={{ width: '12%' }} />
                        <Column field="loanId" header="ID Crédit" sortable filter style={{ width: '8%' }} />
                        <Column
                            field="paymentDate"
                            header="Date"
                            body={(rowData) => dateBodyTemplate(rowData.paymentDate)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="amountReceived"
                            header="Montant Reçu"
                            body={(rowData) => currencyBodyTemplate(rowData.amountReceived)}
                            sortable
                            style={{ width: '12%' }}
                        />
                        <Column
                            header="Mode"
                            body={paymentModeBodyTemplate}
                            style={{ width: '12%' }}
                        />
                        <Column
                            field="allocatedToPrincipal"
                            header="→ Capital"
                            body={(rowData) => currencyBodyTemplate(rowData.allocatedToPrincipal)}
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="allocatedToInterest"
                            header="→ Intérêts"
                            body={(rowData) => currencyBodyTemplate(rowData.allocatedToInterest)}
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="allocatedToPenalty"
                            header="→ Pénalités"
                            body={(rowData) => currencyBodyTemplate(rowData.allocatedToPenalty)}
                            style={{ width: '10%' }}
                        />
                        <Column
                            header="Actions"
                            body={actionsBodyTemplate}
                            style={{ width: '12%' }}
                        />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog Reçu de Paiement */}
            <Dialog
                visible={showReceiptDialog}
                onHide={() => setShowReceiptDialog(false)}
                header="Reçu de Paiement"
                style={{ width: '40vw' }}
                modal
                footer={
                    <div>
                        <Button
                            label="Fermer"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setShowReceiptDialog(false)}
                        />
                        <Button
                            label="Imprimer"
                            icon="pi pi-print"
                            onClick={() => window.print()}
                        />
                    </div>
                }
            >
                {selectedPaiement && (
                    <div className="p-4">
                        <div className="text-center mb-4">
                            <h3 className="m-0">REÇU DE PAIEMENT</h3>
                            <p className="text-color-secondary">{selectedPaiement.paymentNumber}</p>
                        </div>

                        <Divider />

                        <div className="grid">
                            <div className="col-6">
                                <p><strong>Date:</strong> {dateBodyTemplate(selectedPaiement.paymentDate)}</p>
                                <p><strong>N° Crédit:</strong> {selectedPaiement.loanId}</p>
                                <p><strong>N° Reçu:</strong> {selectedPaiement.receiptNumber || '-'}</p>
                            </div>
                            <div className="col-6 text-right">
                                <h2 className="text-primary m-0">
                                    {currencyBodyTemplate(selectedPaiement.amountReceived)}
                                </h2>
                                <p className="text-color-secondary">Montant Reçu</p>
                            </div>
                        </div>

                        <Divider />

                        <h5>Répartition du Paiement</h5>
                        <div className="grid">
                            <div className="col-6">
                                <p><strong>Pénalités:</strong></p>
                                <p><strong>Intérêts:</strong></p>
                                <p><strong>Capital:</strong></p>
                                <p><strong>Assurance:</strong></p>
                                <p><strong>Frais:</strong></p>
                            </div>
                            <div className="col-6 text-right">
                                <p>{currencyBodyTemplate(selectedPaiement.allocatedToPenalty)}</p>
                                <p>{currencyBodyTemplate(selectedPaiement.allocatedToInterest)}</p>
                                <p>{currencyBodyTemplate(selectedPaiement.allocatedToPrincipal)}</p>
                                <p>{currencyBodyTemplate(selectedPaiement.allocatedToInsurance)}</p>
                                <p>{currencyBodyTemplate(selectedPaiement.allocatedToFees)}</p>
                            </div>
                        </div>

                        <Divider />

                        <div className="text-center text-color-secondary">
                            <small>Merci pour votre paiement</small>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default PaiementsPage;
