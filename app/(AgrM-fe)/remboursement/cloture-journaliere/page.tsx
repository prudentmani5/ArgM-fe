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

import Cookies from 'js-cookie';
import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

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
// Types
// ---------------------------------------------------------------------------

interface PreviewData {
    payments: any[];
    earlyRepayments: any[];
    paymentsCount: number;
    earlyRepaymentsCount: number;
    verifiedPaymentsCount: number;
    verifiedEarlyRepaymentsCount: number;
    allVerified: boolean;
}

interface Branch {
    id: number;
    name: string;
    code?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ClotureJournalierePage = () => {
    // --- State ------------------------------------------------------------------
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [showConfirmVerifyAll, setShowConfirmVerifyAll] = useState(false);
    const [showConfirmUnverifyAll, setShowConfirmUnverifyAll] = useState(false);
    const [comptaClosingCompleted, setComptaClosingCompleted] = useState(false);

    const toast = useRef<Toast>(null);

    // Separate useConsumApi instances to avoid race conditions
    const { data: previewData, loading: loadingPreview, error: previewError, fetchData: fetchPreview, callType: previewCallType } = useConsumApi('');
    const { data: branchData, loading: loadingBranches, error: branchError, fetchData: fetchBranches } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType: actionCallType } = useConsumApi('');
    const comptaStatusApi = useConsumApi('');

    // URLs
    const BASE_URL = buildApiUrl('/api/remboursement/module-closing');
    const BRANCHES_URL = buildApiUrl('/api/reference-data/branches');
    const COMPTA_CLOSING_URL = buildApiUrl('/api/comptability/daily-closing');

    // Read branchId from cookie if available
    const getCurrentBranchId = (): number | null => {
        try {
            const exerciceCookie = Cookies.get('currentExercice');
            if (exerciceCookie) {
                const exercice = JSON.parse(exerciceCookie);
                return exercice.branchId || null;
            }
        } catch (e) {
            console.error('Error parsing currentExercice cookie:', e);
        }
        return null;
    };

    // --- Effects ----------------------------------------------------------------

    // Load branches on mount
    useEffect(() => {
        fetchBranches(null, 'GET', `${BRANCHES_URL}/findactive`, 'loadBranches');
        // Initialise selected branch from cookie
        const cookieBranch = getCurrentBranchId();
        if (cookieBranch) {
            setSelectedBranch(cookieBranch);
        }
    }, []);

    // Handle branch data
    useEffect(() => {
        if (branchData) {
            const list = Array.isArray(branchData) ? branchData : branchData.content || [];
            setBranches(list);
        }
        if (branchError) {
            showToast('error', 'Erreur', branchError.message || 'Erreur de chargement des agences');
        }
    }, [branchData, branchError]);

    // Handle preview data
    useEffect(() => {
        if (previewData && previewCallType === 'loadPreview') {
            setPreview({
                payments: Array.isArray(previewData.payments) ? previewData.payments : [],
                earlyRepayments: Array.isArray(previewData.earlyRepayments) ? previewData.earlyRepayments : [],
                paymentsCount: previewData.paymentsCount || 0,
                earlyRepaymentsCount: previewData.earlyRepaymentsCount || 0,
                verifiedPaymentsCount: previewData.verifiedPaymentsCount || 0,
                verifiedEarlyRepaymentsCount: previewData.verifiedEarlyRepaymentsCount || 0,
                allVerified: previewData.allVerified || false
            });
        }
        if (previewError) {
            showToast('error', 'Erreur', previewError.message || 'Erreur de chargement des donnees');
        }
    }, [previewData, previewError, previewCallType]);

    // Handle action responses (verify / unverify)
    useEffect(() => {
        if (actionData) {
            switch (actionCallType) {
                case 'verifyAll':
                    showToast('success', 'Succes', 'Toutes les operations ont ete verifiees');
                    reloadPreview();
                    setShowConfirmVerifyAll(false);
                    break;
                case 'unverifyAll':
                    showToast('success', 'Succes', 'Toutes les verifications ont ete annulees');
                    reloadPreview();
                    setShowConfirmUnverifyAll(false);
                    break;
                case 'verifySingle':
                    showToast('success', 'Succes', 'Operation verifiee');
                    reloadPreview();
                    break;
                case 'unverifySingle':
                    showToast('success', 'Succes', 'Verification annulee');
                    reloadPreview();
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

    // --- Helpers -----------------------------------------------------------------

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const buildPreviewUrl = (): string => {
        const dateStr = toApiDate(selectedDate);
        let url = `${BASE_URL}/preview?date=${dateStr}`;
        if (selectedBranch) {
            url += `&branchId=${selectedBranch}`;
        }
        return url;
    };

    const reloadPreview = () => {
        fetchPreview(null, 'GET', buildPreviewUrl(), 'loadPreview');
    };

    const checkComptaClosingStatus = () => {
        setComptaClosingCompleted(false);
        try {
            const exerciceCookie = Cookies.get('currentExercice');
            if (exerciceCookie) {
                const exercice = JSON.parse(exerciceCookie);
                if (exercice.exerciceId) {
                    comptaStatusApi.fetchData(null, 'GET',
                        `${COMPTA_CLOSING_URL}/preview?date=${toApiDate(selectedDate)}&exerciceId=${exercice.exerciceId}`,
                        'checkComptaStatus');
                }
            }
        } catch (e) {
            console.error('Error checking comptability closing status:', e);
        }
    };

    const handleLoad = () => {
        reloadPreview();
        checkComptaClosingStatus();
    };

    // --- Verify / Unverify actions -----------------------------------------------

    const handleVerifyAll = () => {
        const dateStr = toApiDate(selectedDate);
        const userAction = getUserAction();
        let url = `${BASE_URL}/verify-all?date=${dateStr}&userAction=${encodeURIComponent(userAction)}`;
        if (selectedBranch) {
            url += `&branchId=${selectedBranch}`;
        }
        fetchAction(null, 'POST', url, 'verifyAll');
    };

    const handleUnverifyAll = () => {
        const dateStr = toApiDate(selectedDate);
        let url = `${BASE_URL}/unverify-all?date=${dateStr}`;
        if (selectedBranch) {
            url += `&branchId=${selectedBranch}`;
        }
        fetchAction(null, 'POST', url, 'unverifyAll');
    };

    const handleVerifySingle = (type: 'payment' | 'early-repayment', id: number) => {
        const userAction = getUserAction();
        const url = `${BASE_URL}/verify/${type}/${id}?userAction=${encodeURIComponent(userAction)}`;
        fetchAction(null, 'POST', url, 'verifySingle');
    };

    const handleUnverifySingle = (type: 'payment' | 'early-repayment', id: number) => {
        const url = `${BASE_URL}/unverify/${type}/${id}`;
        fetchAction(null, 'POST', url, 'unverifySingle');
    };

    // --- Branch dropdown options ---------------------------------------------------

    const branchOptions = [
        { label: 'Toutes les agences', value: null },
        ...branches.map(b => ({ label: b.name, value: b.id }))
    ];

    // --- Column body templates ---------------------------------------------------

    const verifiedBodyTemplate = (rowData: any) => {
        return rowData.closingVerified ? (
            <Tag value="Verifie" severity="success" />
        ) : (
            <Tag value="Non verifie" severity="warning" />
        );
    };

    const paymentActionsBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-1">
                {!rowData.closingVerified ? (
                    <Button
                        icon="pi pi-check"
                        rounded
                        text
                        severity="success"
                        tooltip="Verifier"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleVerifySingle('payment', rowData.id)}
                        loading={loadingAction}
                    />
                ) : (
                    <Button
                        icon="pi pi-times"
                        rounded
                        text
                        severity="danger"
                        tooltip={comptaClosingCompleted ? 'Cloture comptable completee - annulation interdite' : 'Annuler la verification'}
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleUnverifySingle('payment', rowData.id)}
                        loading={loadingAction}
                        disabled={comptaClosingCompleted}
                    />
                )}
            </div>
        );
    };

    const earlyRepaymentActionsBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-1">
                {!rowData.closingVerified ? (
                    <Button
                        icon="pi pi-check"
                        rounded
                        text
                        severity="success"
                        tooltip="Verifier"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleVerifySingle('early-repayment', rowData.id)}
                        loading={loadingAction}
                    />
                ) : (
                    <Button
                        icon="pi pi-times"
                        rounded
                        text
                        severity="danger"
                        tooltip={comptaClosingCompleted ? 'Cloture comptable completee - annulation interdite' : 'Annuler la verification'}
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleUnverifySingle('early-repayment', rowData.id)}
                        loading={loadingAction}
                        disabled={comptaClosingCompleted}
                    />
                )}
            </div>
        );
    };

    const currencyBodyTemplate = (value: number | undefined | null) => {
        return formatNumber(value);
    };

    const dateBodyTemplate = (date: string | undefined | null) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    // --- Toolbar -----------------------------------------------------------------

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
                value={selectedBranch}
                options={branchOptions}
                onChange={(e) => setSelectedBranch(e.value)}
                placeholder="Agence"
                style={{ width: '220px' }}
                loading={loadingBranches}
            />
            <Button
                label="Charger"
                icon="pi pi-search"
                onClick={handleLoad}
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
                onClick={() => setShowConfirmVerifyAll(true)}
                disabled={!preview || preview.allVerified || (preview.paymentsCount === 0 && preview.earlyRepaymentsCount === 0)}
                loading={loadingAction && actionCallType === 'verifyAll'}
            />
            <Button
                label="Annuler Tout"
                icon="pi pi-times-circle"
                severity="danger"
                onClick={() => setShowConfirmUnverifyAll(true)}
                disabled={comptaClosingCompleted || !preview || (preview.verifiedPaymentsCount === 0 && preview.verifiedEarlyRepaymentsCount === 0)}
                loading={loadingAction && actionCallType === 'unverifyAll'}
            />
        </div>
    );

    // --- Summary Cards -----------------------------------------------------------

    const SummaryCards = () => {
        if (!preview) return null;

        const cards = [
            {
                label: 'Total Paiements',
                value: preview.paymentsCount,
                icon: 'pi pi-credit-card',
                color: 'blue'
            },
            {
                label: 'Paiements Verifies',
                value: preview.verifiedPaymentsCount,
                icon: 'pi pi-check-circle',
                color: 'green'
            },
            {
                label: 'Total Remb. Anticipes',
                value: preview.earlyRepaymentsCount,
                icon: 'pi pi-fast-forward',
                color: 'purple'
            },
            {
                label: 'Remb. Anticipes Verifies',
                value: preview.verifiedEarlyRepaymentsCount,
                icon: 'pi pi-check-circle',
                color: 'teal'
            }
        ];

        return (
            <div className="grid mb-4">
                {cards.map((card, idx) => (
                    <div className="col-12 md:col-3" key={idx}>
                        <div className={`surface-card shadow-1 border-round p-3 border-left-3 border-${card.color}-500`}>
                            <div className="flex align-items-center justify-content-between">
                                <div>
                                    <small className="text-600 block mb-1">{card.label}</small>
                                    <span className="text-2xl font-bold">{card.value}</span>
                                </div>
                                <div className={`flex align-items-center justify-content-center border-round`}
                                     style={{ width: '2.5rem', height: '2.5rem', backgroundColor: `var(--${card.color}-50)` }}>
                                    <i className={`${card.icon} text-${card.color}-500 text-xl`}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // --- Render ------------------------------------------------------------------

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex align-items-center mb-4">
                <i className="pi pi-verified text-primary mr-2" style={{ fontSize: '1.5rem' }}></i>
                <h3 className="m-0">Verification Cloture Journaliere - Remboursement</h3>
            </div>

            {/* Toolbar */}
            <Toolbar className="mb-4" start={toolbarLeftContent} end={toolbarRightContent} />

            {/* Summary Cards */}
            <SummaryCards />

            {/* Info message when no data */}
            {!preview && !loadingPreview && (
                <div className="p-4 surface-100 border-round text-center">
                    <i className="pi pi-info-circle text-primary mr-2" style={{ fontSize: '1.2rem' }}></i>
                    <span className="text-600">
                        Selectionnez une date et cliquez sur "Charger" pour afficher les operations a verifier.
                    </span>
                </div>
            )}

            {/* Comptability closing completed banner */}
            {comptaClosingCompleted && (
                <div className="mb-4 p-3 border-round border-1 border-red-300 bg-red-50 flex align-items-center gap-2">
                    <i className="pi pi-lock text-red-500 text-xl"></i>
                    <span className="text-red-700 font-semibold">
                        La cloture comptable pour cette date est completee. L'annulation des verifications est interdite.
                    </span>
                </div>
            )}

            {/* All verified banner */}
            {preview && preview.allVerified && (preview.paymentsCount > 0 || preview.earlyRepaymentsCount > 0) && (
                <div className="p-3 mb-4 border-round bg-green-50 border-1 border-green-200 flex align-items-center gap-2">
                    <i className="pi pi-check-circle text-green-600" style={{ fontSize: '1.3rem' }}></i>
                    <span className="font-semibold text-green-700">
                        Toutes les operations du {selectedDate.toLocaleDateString('fr-FR')} sont verifiees.
                        Elles sont pretes pour le transfert vers la cloture comptable.
                    </span>
                </div>
            )}

            {/* TabView with DataTables */}
            {preview && (
                <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                    {/* Tab: Paiements */}
                    <TabPanel
                        header={`Paiements (${preview.verifiedPaymentsCount}/${preview.paymentsCount})`}
                        leftIcon="pi pi-credit-card mr-2"
                    >
                        <DataTable
                            value={preview.payments}
                            paginator
                            rows={15}
                            rowsPerPageOptions={[10, 15, 25, 50]}
                            loading={loadingPreview}
                            emptyMessage="Aucun paiement pour cette date"
                            className="p-datatable-sm"
                            sortField="paymentDate"
                            sortOrder={-1}
                            rowClassName={(rowData) => rowData.closingVerified ? 'bg-green-50' : ''}
                        >
                            <Column
                                field="paymentNumber"
                                header="N deg Paiement"
                                sortable
                                filter
                                style={{ width: '10%' }}
                            />
                            <Column
                                field="applicationNumber"
                                header="N deg Dossier"
                                sortable
                                filter
                                style={{ width: '10%' }}
                            />
                            <Column
                                field="clientName"
                                header="Client"
                                sortable
                                filter
                                style={{ width: '14%' }}
                            />
                            <Column
                                field="amountReceived"
                                header="Montant"
                                body={(rowData) => currencyBodyTemplate(rowData.amountReceived)}
                                sortable
                                style={{ width: '10%' }}
                            />
                            <Column
                                field="paymentDate"
                                header="Date Paiement"
                                body={(rowData) => dateBodyTemplate(rowData.paymentDate)}
                                sortable
                                style={{ width: '10%' }}
                            />
                            <Column
                                field="allocatedToPrincipal"
                                header="Capital"
                                body={(rowData) => currencyBodyTemplate(rowData.allocatedToPrincipal)}
                                style={{ width: '9%' }}
                            />
                            <Column
                                field="allocatedToInterest"
                                header="Interets"
                                body={(rowData) => currencyBodyTemplate(rowData.allocatedToInterest)}
                                style={{ width: '9%' }}
                            />
                            <Column
                                field="allocatedToPenalty"
                                header="Penalites"
                                body={(rowData) => (
                                    <span className={rowData.allocatedToPenalty > 0 ? 'text-orange-600 font-semibold' : ''}>
                                        {currencyBodyTemplate(rowData.allocatedToPenalty)}
                                    </span>
                                )}
                                style={{ width: '9%' }}
                            />
                            <Column
                                field="closingVerified"
                                header="Verifie"
                                body={verifiedBodyTemplate}
                                sortable
                                style={{ width: '9%' }}
                            />
                            <Column
                                header="Actions"
                                body={paymentActionsBodyTemplate}
                                style={{ width: '7%' }}
                            />
                        </DataTable>
                    </TabPanel>

                    {/* Tab: Remboursements Anticipes */}
                    <TabPanel
                        header={`Remboursements Anticipes (${preview.verifiedEarlyRepaymentsCount}/${preview.earlyRepaymentsCount})`}
                        leftIcon="pi pi-fast-forward mr-2"
                    >
                        <DataTable
                            value={preview.earlyRepayments}
                            paginator
                            rows={15}
                            rowsPerPageOptions={[10, 15, 25, 50]}
                            loading={loadingPreview}
                            emptyMessage="Aucun remboursement anticipe pour cette date"
                            className="p-datatable-sm"
                            sortField="actualSettlementDate"
                            sortOrder={-1}
                            rowClassName={(rowData) => rowData.closingVerified ? 'bg-green-50' : ''}
                        >
                            <Column
                                field="requestNumber"
                                header="N deg Demande"
                                sortable
                                filter
                                style={{ width: '12%' }}
                            />
                            <Column
                                field="repaymentType"
                                header="Type"
                                body={(rowData) => (
                                    <Tag
                                        value={rowData.repaymentType === 'TOTAL' ? 'Total' : 'Partiel'}
                                        severity={rowData.repaymentType === 'TOTAL' ? 'success' : 'info'}
                                    />
                                )}
                                sortable
                                style={{ width: '9%' }}
                            />
                            <Column
                                field="totalSettlementAmount"
                                header="Montant Total"
                                body={(rowData) => currencyBodyTemplate(rowData.totalSettlementAmount)}
                                sortable
                                style={{ width: '12%' }}
                            />
                            <Column
                                field="remainingPrincipal"
                                header="Capital Restant"
                                body={(rowData) => currencyBodyTemplate(rowData.remainingPrincipal)}
                                style={{ width: '12%' }}
                            />
                            <Column
                                field="remainingInterest"
                                header="Interets Restants"
                                body={(rowData) => currencyBodyTemplate(rowData.remainingInterest)}
                                style={{ width: '12%' }}
                            />
                            <Column
                                field="penaltyForEarlyRepayment"
                                header="Penalite"
                                body={(rowData) => (
                                    <span className={rowData.penaltyForEarlyRepayment > 0 ? 'text-orange-600 font-semibold' : ''}>
                                        {currencyBodyTemplate(rowData.penaltyForEarlyRepayment)}
                                    </span>
                                )}
                                style={{ width: '11%' }}
                            />
                            <Column
                                field="actualSettlementDate"
                                header="Date Reglement"
                                body={(rowData) => dateBodyTemplate(rowData.actualSettlementDate)}
                                sortable
                                style={{ width: '11%' }}
                            />
                            <Column
                                field="closingVerified"
                                header="Verifie"
                                body={verifiedBodyTemplate}
                                sortable
                                style={{ width: '9%' }}
                            />
                            <Column
                                header="Actions"
                                body={earlyRepaymentActionsBodyTemplate}
                                style={{ width: '7%' }}
                            />
                        </DataTable>
                    </TabPanel>
                </TabView>
            )}

            {/* Confirm Verify All Dialog */}
            <Dialog
                visible={showConfirmVerifyAll}
                onHide={() => setShowConfirmVerifyAll(false)}
                header="Confirmation"
                style={{ width: '450px' }}
                modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setShowConfirmVerifyAll(false)}
                        />
                        <Button
                            label="Tout Verifier"
                            icon="pi pi-check"
                            severity="success"
                            onClick={handleVerifyAll}
                            loading={loadingAction && actionCallType === 'verifyAll'}
                        />
                    </div>
                }
            >
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-question-circle text-primary" style={{ fontSize: '2rem' }}></i>
                    <span>
                        Etes-vous sur de vouloir verifier toutes les operations du{' '}
                        <strong>{selectedDate.toLocaleDateString('fr-FR')}</strong> ?
                        <br />
                        <small className="text-600">
                            {preview ? preview.paymentsCount - preview.verifiedPaymentsCount : 0} paiement(s) et{' '}
                            {preview ? preview.earlyRepaymentsCount - preview.verifiedEarlyRepaymentsCount : 0} remboursement(s) anticipe(s) seront verifies.
                        </small>
                    </span>
                </div>
            </Dialog>

            {/* Confirm Unverify All Dialog */}
            <Dialog
                visible={showConfirmUnverifyAll}
                onHide={() => setShowConfirmUnverifyAll(false)}
                header="Confirmation"
                style={{ width: '450px' }}
                modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setShowConfirmUnverifyAll(false)}
                        />
                        <Button
                            label="Annuler Tout"
                            icon="pi pi-times-circle"
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
                        Etes-vous sur de vouloir annuler toutes les verifications du{' '}
                        <strong>{selectedDate.toLocaleDateString('fr-FR')}</strong> ?
                        <br />
                        <small className="text-600">
                            {preview ? preview.verifiedPaymentsCount : 0} paiement(s) et{' '}
                            {preview ? preview.verifiedEarlyRepaymentsCount : 0} remboursement(s) anticipe(s) seront deverifies.
                        </small>
                    </span>
                </div>
            </Dialog>
        </div>
    );
};

export default ClotureJournalierePage;
