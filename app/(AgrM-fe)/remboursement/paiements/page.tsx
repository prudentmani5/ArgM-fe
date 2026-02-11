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

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
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

    // Disbursement selection
    const [showLoanSelectionDialog, setShowLoanSelectionDialog] = useState(false);
    const [disbursements, setDisbursements] = useState<any[]>([]);
    const [filteredDisbursements, setFilteredDisbursements] = useState<any[]>([]);
    const [disbursementFilter, setDisbursementFilter] = useState('');
    const [loadingDisbursements, setLoadingDisbursements] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);

    const toast = useRef<Toast>(null);
    // Use separate hooks for different API calls to avoid race conditions
    const { data: paiementsData, loading: loadingPaiements, error: paiementsError, fetchData: fetchPaiements } = useConsumApi('');
    const { data: modesData, loading: loadingModes, error: modesError, fetchData: fetchModes } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/remboursement/payments');
    const MODES_URL = buildApiUrl('/api/remboursement/repayment-modes');
    const DISBURSEMENTS_URL = buildApiUrl('/api/credit/disbursements');
    const SCHEDULES_URL = buildApiUrl('/api/remboursement/schedules');

    // Store loan IDs that are fully paid (all schedules are PAID)
    const [fullyPaidLoanIds, setFullyPaidLoanIds] = useState<number[]>([]);

    // Track receipt number validation
    const [isReceiptValid, setIsReceiptValid] = useState(true);

    // Load paiements on mount
    useEffect(() => {
        loadPaiements();
        loadModesRemboursement();
    }, []);

    // Handle paiements data
    useEffect(() => {
        if (paiementsData) {
            const paymentsArray = Array.isArray(paiementsData) ? paiementsData : paiementsData.content || [];
            console.log('[DEBUG] Paiements loaded:', paymentsArray.length, 'records');
            setPaiements(paymentsArray);
        }
        if (paiementsError) {
            console.error('[DEBUG] Paiements Error:', paiementsError);
            showToast('error', 'Erreur', paiementsError.message || 'Erreur de chargement des paiements');
        }
    }, [paiementsData, paiementsError]);

    // Handle modes data
    useEffect(() => {
        if (modesData) {
            setModesRemboursement(Array.isArray(modesData) ? modesData : modesData.content || []);
        }
    }, [modesData]);

    // Handle action responses (process, create, update, delete, disbursements)
    useEffect(() => {
        if (actionData) {
            console.log('[DEBUG] Action completed - callType:', callType, 'data:', actionData);
            switch (callType) {
                case 'loadDisbursements':
                    const disb = Array.isArray(actionData) ? actionData : actionData.content || [];
                    const completedDisb = disb.filter((d: any) => d.status === 'COMPLETED');
                    // Filter out disbursements that are fully paid
                    const eligibleDisb = completedDisb.filter((d: any) => {
                        const loanId = d.id;
                        return !fullyPaidLoanIds.includes(loanId);
                    });
                    setDisbursements(eligibleDisb);
                    setFilteredDisbursements(eligibleDisb);
                    setLoadingDisbursements(false);
                    break;
                case 'loadSchedulesForFilter':
                    const allSchedules = Array.isArray(actionData) ? actionData : actionData.content || [];
                    // Group schedules by loanId and check if all are PAID
                    const loanScheduleMap = new Map<number, boolean>();

                    allSchedules.forEach((s: any) => {
                        const loanId = s.loanId;
                        if (!loanScheduleMap.has(loanId)) {
                            loanScheduleMap.set(loanId, true);
                        }
                        if (s.status !== 'PAID') {
                            loanScheduleMap.set(loanId, false);
                        }
                    });

                    const paidLoanIds: number[] = [];
                    loanScheduleMap.forEach((allPaid, loanId) => {
                        if (allPaid) {
                            paidLoanIds.push(loanId);
                        }
                    });

                    setFullyPaidLoanIds(paidLoanIds);
                    fetchAction(null, 'GET', `${DISBURSEMENTS_URL}/findbystatus/COMPLETED/paginated?page=0&size=100&sortBy=disbursementDate&sortDir=desc`, 'loadDisbursements');
                    break;
                case 'process':
                    showToast('success', 'Succès', 'Paiement traité avec succès. Allocation automatique effectuée.');
                    setSelectedPaiement(actionData);
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
        if (actionError) {
            console.error('[DEBUG] Action Error:', actionError);
            showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
        }
    }, [actionData, actionError, callType]);

    const loadPaiements = () => {
        console.log('[DEBUG] loadPaiements - URL:', `${BASE_URL}/findall`);
        fetchPaiements(null, 'GET', `${BASE_URL}/findall`, 'loadPaiements');
    };

    const loadModesRemboursement = () => {
        fetchModes(null, 'GET', `${MODES_URL}/findallactive`, 'loadModes');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setPaiement(new PaiementCreditClass());
        setSelectedLoan(null);
        setIsViewMode(false);
        setIsReceiptValid(true);
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

        // Check if it's "Paiement en agence" mode (no other mode selected)
        const isAgencyMode = !paiement.isAutoDebit && !paiement.isHomeCollection && !paiement.isMobileMoney && !paiement.isBankTransfer;

        // For agency mode, receipt number is required and must be valid
        if (isAgencyMode) {
            if (!paiement.receiptNumber || paiement.receiptNumber.trim() === '') {
                showToast('error', 'Erreur', 'Le numéro de reçu (bordereau de dépôt) est obligatoire pour un paiement en agence');
                return;
            }
            if (!isReceiptValid) {
                showToast('error', 'Erreur', 'Le numéro de reçu est invalide. Vérifiez qu\'il existe dans les bordereaux de dépôt et n\'est pas déjà utilisé.');
                return;
            }
        }

        // Add user action
        const dataToSend = {
            ...paiement,
            userAction: getUserAction()
        };

        // Traiter le paiement avec allocation automatique
        fetchAction(dataToSend, 'POST', `${BASE_URL}/process`, 'process');
    };

    const loadDisbursements = () => {
        setLoadingDisbursements(true);
        // First load all schedules to determine which loans are fully paid
        fetchAction(null, 'GET', `${SCHEDULES_URL}/findall`, 'loadSchedulesForFilter');
    };

    const handleLoadFromDisbursement = () => {
        loadDisbursements();
        setShowLoanSelectionDialog(true);
    };

    const handleDisbursementSelect = (disbursement: any) => {
        setSelectedLoan(disbursement);

        // Update payment with selected loan info - include credit details
        setPaiement(prev => ({
            ...prev,
            loanId: disbursement.loanId || disbursement.loan?.id || disbursement.id,
            applicationNumber: disbursement.applicationNumber || '',
            disbursementNumber: disbursement.disbursementNumber || '',
            clientName: disbursement.clientName || '',
            paymentDate: new Date().toISOString().split('T')[0]
        }));

        setShowLoanSelectionDialog(false);
        showToast('info', 'Crédit Sélectionné',
            `${disbursement.applicationNumber} - ${disbursement.clientName} - Montant: ${disbursement.amount?.toLocaleString()} FBU`);
    };

    const handleDisbursementFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setDisbursementFilter(value);

        if (!value) {
            setFilteredDisbursements(disbursements);
            return;
        }

        const filtered = disbursements.filter((d: any) =>
            (d.disbursementNumber || '').toLowerCase().includes(value) ||
            (d.applicationNumber || '').toLowerCase().includes(value) ||
            (d.clientName || '').toLowerCase().includes(value)
        );

        setFilteredDisbursements(filtered);
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
                fetchAction(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
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
                    {/* Loan Selection Section */}
                    <div className="mb-3 p-3 surface-border border-round border-1">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <h5 className="m-0">
                                <i className="pi pi-file mr-2"></i>
                                Sélection du Crédit
                            </h5>
                            <Button
                                label="Sélectionner un Crédit"
                                icon="pi pi-search"
                                onClick={handleLoadFromDisbursement}
                                outlined
                                size="small"
                            />
                        </div>
                        {selectedLoan && (
                            <div className="grid">
                                <div className="col-12 md:col-3">
                                    <small className="text-600">N° Dossier</small>
                                    <p className="mt-1 mb-0 font-semibold">{selectedLoan.applicationNumber}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">N° Décaissement</small>
                                    <p className="mt-1 mb-0 font-semibold">{selectedLoan.disbursementNumber}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Client</small>
                                    <p className="mt-1 mb-0 font-semibold">{selectedLoan.clientName}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Montant Décaissé</small>
                                    <p className="mt-1 mb-0 font-semibold text-primary">
                                        {selectedLoan.amount?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}
                                    </p>
                                </div>
                            </div>
                        )}
                        {!selectedLoan && (
                            <p className="text-500 m-0">
                                <i className="pi pi-info-circle mr-2"></i>
                                Veuillez sélectionner un crédit pour effectuer le paiement
                            </p>
                        )}
                    </div>

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
                        selectedLoan={selectedLoan}
                        isViewMode={isViewMode}
                        onReceiptValidation={setIsReceiptValid}
                        onAmountAutoFill={(amount) => {
                            handleNumberChange('amountReceived', amount);
                            showToast('info', 'Montant Auto-Rempli', `Montant du bordereau: ${amount.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}`);
                        }}
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
                                loading={loadingAction}
                            />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Historique des Paiements" leftIcon="pi pi-list mr-2">
                    <div className="mb-2 text-sm text-500">
                        <i className="pi pi-info-circle mr-1"></i>
                        Total paiements chargés: {paiements.length}
                    </div>
                    <DataTable
                        value={paiements}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loadingPaiements}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun paiement trouvé"
                        className="p-datatable-sm"
                        sortField="paymentDate"
                        sortOrder={-1}
                    >
                        <Column field="paymentNumber" header="N° Paiement" sortable filter style={{ width: '10%' }} />
                        <Column field="applicationNumber" header="N° Dossier" sortable filter style={{ width: '12%' }} />
                        <Column field="disbursementNumber" header="N° Décaissement" sortable filter style={{ width: '12%' }} />
                        <Column field="clientName" header="Client" sortable filter style={{ width: '12%' }} />
                        <Column
                            field="paymentDate"
                            header="Date"
                            body={(rowData) => dateBodyTemplate(rowData.paymentDate)}
                            sortable
                            style={{ width: '8%' }}
                        />
                        <Column
                            field="amountReceived"
                            header="Montant Reçu"
                            body={(rowData) => currencyBodyTemplate(rowData.amountReceived)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            header="Mode"
                            body={paymentModeBodyTemplate}
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="allocatedToPenalty"
                            header="→ Pénalités"
                            body={(rowData) => (
                                <span className={rowData.allocatedToPenalty > 0 ? 'text-orange-600 font-semibold' : ''}>
                                    {currencyBodyTemplate(rowData.allocatedToPenalty)}
                                </span>
                            )}
                            style={{ width: '8%' }}
                        />
                        <Column
                            field="allocatedToPrincipal"
                            header="→ Capital"
                            body={(rowData) => currencyBodyTemplate(rowData.allocatedToPrincipal)}
                            style={{ width: '8%' }}
                        />
                        <Column
                            field="allocatedToInterest"
                            header="→ Intérêts"
                            body={(rowData) => currencyBodyTemplate(rowData.allocatedToInterest)}
                            style={{ width: '8%' }}
                        />
                        <Column
                            header="Actions"
                            body={actionsBodyTemplate}
                            style={{ width: '10%' }}
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
                                <p><strong>N° Dossier:</strong> {selectedPaiement.applicationNumber || '-'}</p>
                                <p><strong>N° Décaissement:</strong> {selectedPaiement.disbursementNumber || '-'}</p>
                                <p><strong>Client:</strong> {selectedPaiement.clientName || '-'}</p>
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

            {/* Dialog Sélection Crédit Décaissé */}
            <Dialog
                visible={showLoanSelectionDialog}
                onHide={() => {
                    setShowLoanSelectionDialog(false);
                    setDisbursementFilter('');
                    setFilteredDisbursements(disbursements);
                }}
                header="Sélectionner un Crédit Décaissé"
                style={{ width: '65vw' }}
                modal
            >
                <div className="mb-3">
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-search" />
                        <InputText
                            placeholder="Rechercher par N° décaissement, N° dossier ou client..."
                            className="w-full"
                            onChange={handleDisbursementFilterChange}
                        />
                    </span>
                </div>
                <DataTable
                    value={filteredDisbursements}
                    loading={loadingDisbursements}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 20, 50]}
                    emptyMessage="Aucun crédit décaissé trouvé"
                    selectionMode="single"
                    onRowSelect={(e) => handleDisbursementSelect(e.data)}
                    className="p-datatable-sm"
                    sortField="disbursementDate"
                    sortOrder={-1}
                >
                    <Column
                        field="disbursementNumber"
                        header="N° Décaissement"
                        sortable
                        style={{ width: '20%' }}
                    />
                    <Column
                        field="applicationNumber"
                        header="N° Dossier"
                        sortable
                        style={{ width: '20%' }}
                    />
                    <Column
                        field="clientName"
                        header="Client"
                        sortable
                        style={{ width: '25%' }}
                    />
                    <Column
                        field="amount"
                        header="Montant"
                        body={(row) => row.amount?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}
                        sortable
                        style={{ width: '20%' }}
                    />
                    <Column
                        field="disbursementDate"
                        header="Date Décaissement"
                        body={(row) => row.disbursementDate ? new Date(row.disbursementDate).toLocaleDateString('fr-FR') : '-'}
                        sortable
                        style={{ width: '15%' }}
                    />
                </DataTable>
                <div className="mt-3 p-3 surface-100 border-round">
                    <p className="text-sm text-color-secondary m-0">
                        <i className="pi pi-info-circle mr-2"></i>
                        Utilisez la barre de recherche pour filtrer les dossiers. Cliquez sur une ligne pour sélectionner
                        un crédit et commencer le processus de paiement.
                    </p>
                </div>
            </Dialog>
        </div>
    );
};

export default PaiementsPage;
