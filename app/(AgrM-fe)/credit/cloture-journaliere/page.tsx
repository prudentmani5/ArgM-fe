'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import Cookies from 'js-cookie';

const MODULE_CLOSING_URL = buildApiUrl('/api/credit/module-closing');
const BRANCHES_URL = buildApiUrl('/api/reference-data/branches');
const COMPTA_CLOSING_URL = buildApiUrl('/api/comptability/daily-closing');

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('fr-FR');
};

const toApiDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const ClotureJournaliereCreditPage = () => {
    // ---- State ----
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [disbursements, setDisbursements] = useState<any[]>([]);
    const [disbursementsCount, setDisbursementsCount] = useState<number>(0);
    const [verifiedDisbursementsCount, setVerifiedDisbursementsCount] = useState<number>(0);
    const [allVerified, setAllVerified] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [confirmVerifyAllDialog, setConfirmVerifyAllDialog] = useState(false);
    const [confirmUnverifyAllDialog, setConfirmUnverifyAllDialog] = useState(false);
    const [comptaClosingCompleted, setComptaClosingCompleted] = useState(false);

    const toast = useRef<Toast>(null);

    // Separate useConsumApi instances to avoid race conditions
    const { data: previewData, loading: loadingPreview, error: previewError, fetchData: fetchPreview, callType: previewCallType } = useConsumApi('');
    const { data: branchesData, loading: loadingBranches, error: branchesError, fetchData: fetchBranches } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType: actionCallType } = useConsumApi('');
    const comptaStatusApi = useConsumApi('');

    // ---- Load branches on mount ----
    useEffect(() => {
        fetchBranches(null, 'GET', `${BRANCHES_URL}/findactive`, 'loadBranches');
    }, []);

    // ---- Handle branches response ----
    useEffect(() => {
        if (branchesData) {
            const list = Array.isArray(branchesData) ? branchesData : branchesData.content || [];
            setBranches(list);
        }
        if (branchesError) {
            showToast('error', 'Erreur', branchesError.message || 'Erreur de chargement des agences');
        }
    }, [branchesData, branchesError]);

    // ---- Handle preview response ----
    useEffect(() => {
        if (previewData && previewCallType === 'loadPreview') {
            const disbList = Array.isArray(previewData.disbursements) ? previewData.disbursements : [];
            setDisbursements(disbList);
            setDisbursementsCount(previewData.disbursementsCount ?? disbList.length);
            setVerifiedDisbursementsCount(previewData.verifiedDisbursementsCount ?? 0);
            setAllVerified(previewData.allVerified ?? false);
        }
        if (previewError) {
            showToast('error', 'Erreur', previewError.message || 'Erreur de chargement des donnees');
        }
    }, [previewData, previewError, previewCallType]);

    // ---- Handle action responses (verify / unverify) ----
    useEffect(() => {
        if (actionData) {
            switch (actionCallType) {
                case 'verifyAll':
                    showToast('success', 'Succes', 'Tous les decaissements ont ete verifies');
                    setConfirmVerifyAllDialog(false);
                    loadPreview();
                    break;
                case 'unverifyAll':
                    showToast('success', 'Succes', 'La verification de tous les decaissements a ete annulee');
                    setConfirmUnverifyAllDialog(false);
                    loadPreview();
                    break;
                case 'verifySingle':
                    showToast('success', 'Succes', 'Decaissement verifie');
                    loadPreview();
                    break;
                case 'unverifySingle':
                    showToast('success', 'Succes', 'Verification annulee');
                    loadPreview();
                    break;
            }
        }
        if (actionError) {
            showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
        }
    }, [actionData, actionError, actionCallType]);

    // ---- Handle comptability closing status check ----
    useEffect(() => {
        if (comptaStatusApi.data && comptaStatusApi.callType === 'checkComptaStatus') {
            setComptaClosingCompleted(comptaStatusApi.data.alreadyClosed === true);
        }
        if (comptaStatusApi.error) {
            setComptaClosingCompleted(false);
        }
    }, [comptaStatusApi.data, comptaStatusApi.error, comptaStatusApi.callType]);

    // ---- Data loading ----
    const loadPreview = () => {
        const dateStr = toApiDate(selectedDate);
        let url = `${MODULE_CLOSING_URL}/preview?date=${dateStr}`;
        if (selectedBranchId) {
            url += `&branchId=${selectedBranchId}`;
        }
        fetchPreview(null, 'GET', url, 'loadPreview');

        // Check if comptability closing is completed for this date
        setComptaClosingCompleted(false);
        try {
            const exerciceCookie = Cookies.get('currentExercice');
            if (exerciceCookie) {
                const exercice = JSON.parse(exerciceCookie);
                if (exercice.exerciceId) {
                    comptaStatusApi.fetchData(null, 'GET',
                        `${COMPTA_CLOSING_URL}/preview?date=${dateStr}&exerciceId=${exercice.exerciceId}`,
                        'checkComptaStatus');
                }
            }
        } catch (e) {
            console.error('Error checking comptability closing status:', e);
        }
    };

    // ---- Actions ----
    const handleVerifyAll = () => {
        const dateStr = toApiDate(selectedDate);
        const userAction = getUserAction();
        let url = `${MODULE_CLOSING_URL}/verify-all?date=${dateStr}&userAction=${userAction}`;
        if (selectedBranchId) {
            url += `&branchId=${selectedBranchId}`;
        }
        fetchAction(null, 'POST', url, 'verifyAll');
    };

    const handleUnverifyAll = () => {
        const dateStr = toApiDate(selectedDate);
        let url = `${MODULE_CLOSING_URL}/unverify-all?date=${dateStr}`;
        if (selectedBranchId) {
            url += `&branchId=${selectedBranchId}`;
        }
        fetchAction(null, 'POST', url, 'unverifyAll');
    };

    const handleVerifySingle = (id: number) => {
        const userAction = getUserAction();
        fetchAction(null, 'POST', `${MODULE_CLOSING_URL}/verify/${id}?userAction=${userAction}`, 'verifySingle');
    };

    const handleUnverifySingle = (id: number) => {
        fetchAction(null, 'POST', `${MODULE_CLOSING_URL}/unverify/${id}`, 'unverifySingle');
    };

    // ---- Toast helper ----
    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // ---- Branch dropdown options ----
    const branchOptions = [
        { label: 'Toutes les agences', value: null },
        ...branches.map((b: any) => ({ label: b.name || b.branchName || `Agence ${b.id}`, value: b.id }))
    ];

    // ---- Column body templates ----
    const amountBodyTemplate = (rowData: any) => {
        return formatNumber(rowData.amount);
    };

    const dateBodyTemplate = (rowData: any) => {
        if (!rowData.disbursementDate) return '-';
        return new Date(rowData.disbursementDate).toLocaleDateString('fr-FR');
    };

    const modeBodyTemplate = (rowData: any) => {
        return rowData.disbursementModeName || rowData.disbursementModeCode || '-';
    };

    const verifiedBodyTemplate = (rowData: any) => {
        if (rowData.closingVerified) {
            return <Tag value="Verifie" severity="success" />;
        }
        return <Tag value="Non verifie" severity="warning" />;
    };

    const actionsBodyTemplate = (rowData: any) => {
        if (rowData.closingVerified) {
            return (
                <Button
                    icon="pi pi-times"
                    rounded
                    text
                    severity="danger"
                    tooltip={comptaClosingCompleted ? 'Cloture comptable completee - annulation interdite' : 'Annuler la verification'}
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleUnverifySingle(rowData.id)}
                    loading={loadingAction}
                    disabled={comptaClosingCompleted}
                />
            );
        }
        return (
            <Button
                icon="pi pi-check"
                rounded
                text
                severity="success"
                tooltip="Verifier"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleVerifySingle(rowData.id)}
                loading={loadingAction}
            />
        );
    };

    // ---- Summary cards ----
    const unverifiedCount = disbursementsCount - verifiedDisbursementsCount;

    // ---- Toolbar content ----
    const toolbarLeftContent = (
        <div className="flex flex-wrap gap-2 align-items-center">
            <Calendar
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.value as Date)}
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="Date"
                style={{ width: '180px' }}
            />
            <Dropdown
                value={selectedBranchId}
                options={branchOptions}
                onChange={(e) => setSelectedBranchId(e.value)}
                placeholder="Toutes les agences"
                style={{ width: '220px' }}
                loading={loadingBranches}
            />
            <Button
                label="Charger"
                icon="pi pi-search"
                onClick={loadPreview}
                loading={loadingPreview}
            />
        </div>
    );

    const toolbarRightContent = (
        <div className="flex flex-wrap gap-2">
            <Button
                label="Tout Verifier"
                icon="pi pi-check-circle"
                severity="success"
                onClick={() => setConfirmVerifyAllDialog(true)}
                disabled={disbursementsCount === 0 || allVerified}
                loading={loadingAction && actionCallType === 'verifyAll'}
            />
            <Button
                label="Annuler Tout"
                icon="pi pi-times-circle"
                severity="danger"
                onClick={() => setConfirmUnverifyAllDialog(true)}
                disabled={comptaClosingCompleted || disbursementsCount === 0 || verifiedDisbursementsCount === 0}
                loading={loadingAction && actionCallType === 'unverifyAll'}
            />
        </div>
    );

    // ---- Render ----
    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Page header */}
            <div className="flex align-items-center justify-content-between mb-4">
                <h4 className="m-0">
                    <i className="pi pi-lock mr-2"></i>
                    Verification Cloture Journaliere - Credit
                </h4>
            </div>

            {/* Toolbar */}
            <Toolbar className="mb-4" start={toolbarLeftContent} end={toolbarRightContent} />

            {/* Comptability closing completed banner */}
            {comptaClosingCompleted && (
                <div className="mb-4 p-3 border-round border-1 border-red-300 bg-red-50 flex align-items-center gap-2">
                    <i className="pi pi-lock text-red-500 text-xl"></i>
                    <span className="text-red-700 font-semibold">
                        La cloture comptable pour cette date est completee. L'annulation des verifications est interdite.
                    </span>
                </div>
            )}

            {/* Summary Cards */}
            {disbursementsCount > 0 && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-4">
                        <div className="surface-card shadow-2 p-3 border-round">
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="text-500 font-medium">Total Decaissements</span>
                                <span className="bg-blue-100 text-blue-800 border-round p-2">
                                    <i className="pi pi-list text-xl"></i>
                                </span>
                            </div>
                            <div className="text-900 font-bold text-2xl">{disbursementsCount}</div>
                            <span className="text-500 text-sm">pour le {selectedDate.toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="surface-card shadow-2 p-3 border-round">
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="text-500 font-medium">Verifies</span>
                                <span className="bg-green-100 text-green-800 border-round p-2">
                                    <i className="pi pi-check-circle text-xl"></i>
                                </span>
                            </div>
                            <div className="text-900 font-bold text-2xl text-green-600">{verifiedDisbursementsCount}</div>
                            <span className="text-500 text-sm">
                                {disbursementsCount > 0
                                    ? `${Math.round((verifiedDisbursementsCount / disbursementsCount) * 100)}% du total`
                                    : '0% du total'}
                            </span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="surface-card shadow-2 p-3 border-round">
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="text-500 font-medium">Non Verifies</span>
                                <span className={`border-round p-2 ${unverifiedCount > 0 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                    <i className={`pi ${unverifiedCount > 0 ? 'pi-exclamation-circle' : 'pi-check-circle'} text-xl`}></i>
                                </span>
                            </div>
                            <div className={`text-900 font-bold text-2xl ${unverifiedCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                {unverifiedCount}
                            </div>
                            <span className="text-500 text-sm">
                                {allVerified ? 'Pret pour la cloture comptable' : 'En attente de verification'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Status banner when all verified */}
            {allVerified && disbursementsCount > 0 && (
                <div className="mb-4 p-3 border-round bg-green-50 border-1 border-green-300 flex align-items-center gap-2">
                    <i className="pi pi-check-circle text-green-600 text-xl"></i>
                    <span className="text-green-800 font-semibold">
                        Tous les decaissements sont verifies. Les donnees sont pretes pour le transfert vers la cloture comptable.
                    </span>
                </div>
            )}

            {/* DataTable */}
            <DataTable
                value={disbursements}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={loadingPreview}
                globalFilter={globalFilter}
                header={
                    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                        <h5 className="m-0">
                            <i className="pi pi-money-bill mr-2"></i>
                            Decaissements du jour
                        </h5>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <input
                                type="text"
                                className="p-inputtext p-component"
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher..."
                            />
                        </span>
                    </div>
                }
                emptyMessage="Aucun decaissement trouve pour cette date. Veuillez selectionner une date et cliquer sur Charger."
                className="p-datatable-sm"
                sortField="disbursementNumber"
                sortOrder={1}
            >
                <Column field="disbursementNumber" header="N Decaissement" sortable filter style={{ width: '12%' }} />
                <Column field="clientName" header="Client" sortable filter style={{ width: '15%' }} />
                <Column field="applicationNumber" header="N Dossier" sortable filter style={{ width: '12%' }} />
                <Column
                    field="amount"
                    header="Montant"
                    body={amountBodyTemplate}
                    sortable
                    style={{ width: '12%' }}
                />
                <Column
                    field="disbursementDate"
                    header="Date"
                    body={dateBodyTemplate}
                    sortable
                    style={{ width: '10%' }}
                />
                <Column
                    header="Mode"
                    body={modeBodyTemplate}
                    style={{ width: '10%' }}
                />
                <Column field="branchName" header="Agence" sortable filter style={{ width: '10%' }} />
                <Column
                    header="Verifie"
                    body={verifiedBodyTemplate}
                    style={{ width: '10%' }}
                />
                <Column
                    header="Actions"
                    body={actionsBodyTemplate}
                    style={{ width: '9%' }}
                />
            </DataTable>

            {/* Confirm Verify All Dialog */}
            <Dialog
                visible={confirmVerifyAllDialog}
                onHide={() => setConfirmVerifyAllDialog(false)}
                header="Confirmation"
                style={{ width: '450px' }}
                modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setConfirmVerifyAllDialog(false)}
                        />
                        <Button
                            label="Confirmer"
                            icon="pi pi-check"
                            severity="success"
                            onClick={handleVerifyAll}
                            loading={loadingAction && actionCallType === 'verifyAll'}
                        />
                    </div>
                }
            >
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-question-circle text-blue-500" style={{ fontSize: '2rem' }}></i>
                    <span>
                        Etes-vous sur de vouloir verifier <strong>tous les decaissements</strong> du{' '}
                        <strong>{selectedDate.toLocaleDateString('fr-FR')}</strong> ?
                        <br />
                        <small className="text-600">
                            {unverifiedCount} decaissement(s) seront marques comme verifies.
                        </small>
                    </span>
                </div>
            </Dialog>

            {/* Confirm Unverify All Dialog */}
            <Dialog
                visible={confirmUnverifyAllDialog}
                onHide={() => setConfirmUnverifyAllDialog(false)}
                header="Confirmation"
                style={{ width: '450px' }}
                modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setConfirmUnverifyAllDialog(false)}
                        />
                        <Button
                            label="Confirmer"
                            icon="pi pi-check"
                            severity="danger"
                            onClick={handleUnverifyAll}
                            loading={loadingAction && actionCallType === 'unverifyAll'}
                        />
                    </div>
                }
            >
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-orange-500" style={{ fontSize: '2rem' }}></i>
                    <span>
                        Etes-vous sur de vouloir <strong>annuler la verification</strong> de tous les decaissements du{' '}
                        <strong>{selectedDate.toLocaleDateString('fr-FR')}</strong> ?
                        <br />
                        <small className="text-600">
                            {verifiedDisbursementsCount} decaissement(s) seront remis a l'etat non verifie.
                        </small>
                    </span>
                </div>
            </Dialog>
        </div>
    );
};

export default ClotureJournaliereCreditPage;
