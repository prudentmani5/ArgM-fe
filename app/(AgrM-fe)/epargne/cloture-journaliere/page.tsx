'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

import Cookies from 'js-cookie';

// --- Helper functions ---

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

// --- Interfaces ---

interface ClosingPreview {
    deposits: any[];
    withdrawals: any[];
    depositsCount: number;
    withdrawalsCount: number;
    verifiedDepositsCount: number;
    verifiedWithdrawalsCount: number;
    allVerified: boolean;
}

// --- API URLs ---

const MODULE_CLOSING_URL = buildApiUrl('/api/epargne/module-closing');
const BRANCHES_URL = buildApiUrl('/api/reference-data/branches');
const COMPTA_CLOSING_URL = buildApiUrl('/api/comptability/daily-closing');

// --- Component ---

const ClotureJournalierePage = () => {
    // State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [branches, setBranches] = useState<any[]>([]);

    const [deposits, setDeposits] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [depositsCount, setDepositsCount] = useState(0);
    const [withdrawalsCount, setWithdrawalsCount] = useState(0);
    const [verifiedDepositsCount, setVerifiedDepositsCount] = useState(0);
    const [verifiedWithdrawalsCount, setVerifiedWithdrawalsCount] = useState(0);
    const [allVerified, setAllVerified] = useState(false);

    const [loading, setLoading] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [comptaClosingCompleted, setComptaClosingCompleted] = useState(false);

    const toast = useRef<Toast>(null);

    // Separate useConsumApi instances
    const branchesApi = useConsumApi('');
    const previewApi = useConsumApi('');
    const verifyAllApi = useConsumApi('');
    const unverifyAllApi = useConsumApi('');
    const verifySingleApi = useConsumApi('');
    const unverifySingleApi = useConsumApi('');
    const comptaStatusApi = useConsumApi('');

    // --- Load branches on mount ---
    useEffect(() => {
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findactive`, 'loadBranches');
    }, []);

    // --- Handle branches response ---
    useEffect(() => {
        if (branchesApi.data) {
            const data = branchesApi.data;
            setBranches(Array.isArray(data) ? data : []);
        }
        if (branchesApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des agences');
        }
    }, [branchesApi.data, branchesApi.error]);

    // --- Handle preview response ---
    useEffect(() => {
        if (previewApi.data && previewApi.callType === 'loadPreview') {
            const preview: ClosingPreview = previewApi.data;
            setDeposits(Array.isArray(preview.deposits) ? preview.deposits : []);
            setWithdrawals(Array.isArray(preview.withdrawals) ? preview.withdrawals : []);
            setDepositsCount(preview.depositsCount || 0);
            setWithdrawalsCount(preview.withdrawalsCount || 0);
            setVerifiedDepositsCount(preview.verifiedDepositsCount || 0);
            setVerifiedWithdrawalsCount(preview.verifiedWithdrawalsCount || 0);
            setAllVerified(preview.allVerified || false);
            setLoading(false);
        }
        if (previewApi.error) {
            showToast('error', 'Erreur', previewApi.error.message || 'Erreur lors du chargement des donnees');
            setLoading(false);
        }
    }, [previewApi.data, previewApi.error, previewApi.callType]);

    // --- Handle verify all response ---
    useEffect(() => {
        if (verifyAllApi.data && verifyAllApi.callType === 'verifyAll') {
            showToast('success', 'Succes', 'Toutes les operations ont ete verifiees');
            loadPreview();
        }
        if (verifyAllApi.error) {
            showToast('error', 'Erreur', verifyAllApi.error.message || 'Erreur lors de la verification');
        }
    }, [verifyAllApi.data, verifyAllApi.error, verifyAllApi.callType]);

    // --- Handle unverify all response ---
    useEffect(() => {
        if (unverifyAllApi.data && unverifyAllApi.callType === 'unverifyAll') {
            showToast('success', 'Succes', 'La verification de toutes les operations a ete annulee');
            loadPreview();
        }
        if (unverifyAllApi.error) {
            showToast('error', 'Erreur', unverifyAllApi.error.message || 'Erreur lors de l\'annulation');
        }
    }, [unverifyAllApi.data, unverifyAllApi.error, unverifyAllApi.callType]);

    // --- Handle verify single response ---
    useEffect(() => {
        if (verifySingleApi.data && verifySingleApi.callType === 'verifySingle') {
            showToast('success', 'Succes', 'Operation verifiee avec succes');
            loadPreview();
        }
        if (verifySingleApi.error) {
            showToast('error', 'Erreur', verifySingleApi.error.message || 'Erreur lors de la verification');
        }
    }, [verifySingleApi.data, verifySingleApi.error, verifySingleApi.callType]);

    // --- Handle unverify single response ---
    useEffect(() => {
        if (unverifySingleApi.data && unverifySingleApi.callType === 'unverifySingle') {
            showToast('success', 'Succes', 'Verification annulee avec succes');
            loadPreview();
        }
        if (unverifySingleApi.error) {
            showToast('error', 'Erreur', unverifySingleApi.error.message || 'Erreur lors de l\'annulation');
        }
    }, [unverifySingleApi.data, unverifySingleApi.error, unverifySingleApi.callType]);

    // --- Handle comptability closing status check ---
    useEffect(() => {
        if (comptaStatusApi.data && comptaStatusApi.callType === 'checkComptaStatus') {
            setComptaClosingCompleted(comptaStatusApi.data.alreadyClosed === true);
        }
        if (comptaStatusApi.error) {
            setComptaClosingCompleted(false);
        }
    }, [comptaStatusApi.data, comptaStatusApi.error, comptaStatusApi.callType]);

    // --- Actions ---

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const loadPreview = () => {
        if (!selectedDate) {
            showToast('warn', 'Attention', 'Veuillez selectionner une date');
            return;
        }

        setLoading(true);

        let url = `${MODULE_CLOSING_URL}/preview?date=${toApiDate(selectedDate)}`;
        if (selectedBranch) {
            url += `&branchId=${selectedBranch}`;
        }

        previewApi.fetchData(null, 'GET', url, 'loadPreview');

        // Check if comptability closing is completed for this date
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

    const handleVerifyAll = () => {
        confirmDialog({
            message: 'Etes-vous sur de vouloir verifier toutes les operations du jour selectionne ?',
            header: 'Confirmation de verification globale',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, tout verifier',
            rejectLabel: 'Annuler',
            accept: () => {
                let url = `${MODULE_CLOSING_URL}/verify-all?date=${toApiDate(selectedDate)}&userAction=${getUserAction()}`;
                if (selectedBranch) {
                    url += `&branchId=${selectedBranch}`;
                }
                verifyAllApi.fetchData(null, 'POST', url, 'verifyAll');
            }
        });
    };

    const handleUnverifyAll = () => {
        confirmDialog({
            message: 'Etes-vous sur de vouloir annuler la verification de toutes les operations ?',
            header: 'Confirmation d\'annulation globale',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, tout annuler',
            rejectLabel: 'Fermer',
            accept: () => {
                let url = `${MODULE_CLOSING_URL}/unverify-all?date=${toApiDate(selectedDate)}`;
                if (selectedBranch) {
                    url += `&branchId=${selectedBranch}`;
                }
                unverifyAllApi.fetchData(null, 'POST', url, 'unverifyAll');
            }
        });
    };

    const handleVerifySingle = (type: 'deposit' | 'withdrawal', id: number) => {
        const url = `${MODULE_CLOSING_URL}/verify/${type}/${id}?userAction=${getUserAction()}`;
        verifySingleApi.fetchData(null, 'POST', url, 'verifySingle');
    };

    const handleUnverifySingle = (type: 'deposit' | 'withdrawal', id: number) => {
        const url = `${MODULE_CLOSING_URL}/unverify/${type}/${id}`;
        unverifySingleApi.fetchData(null, 'POST', url, 'unverifySingle');
    };

    // --- Column body templates ---

    const verifiedBodyTemplate = (rowData: any) => {
        if (rowData.closingVerified) {
            return <Tag value="Verifie" severity="success" />;
        }
        return <Tag value="Non verifie" severity="warning" />;
    };

    const depositAmountBodyTemplate = (rowData: any) => {
        return <span>{formatNumber(rowData.totalAmount)} FBU</span>;
    };

    const withdrawalAmountBodyTemplate = (rowData: any) => {
        return <span>{formatNumber(rowData.disbursedAmount)} FBU</span>;
    };

    const clientBodyTemplate = (rowData: any) => {
        if (rowData.client) {
            return `${rowData.client.firstName || ''} ${rowData.client.lastName || ''}`.trim() || '-';
        }
        return '-';
    };

    const branchBodyTemplate = (rowData: any) => {
        return rowData.branch?.name || '-';
    };

    const depositActionsBodyTemplate = (rowData: any) => {
        if (rowData.closingVerified) {
            return (
                <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-sm"
                    tooltip={comptaClosingCompleted ? 'Cloture comptable completee - annulation interdite' : 'Annuler la verification'}
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleUnverifySingle('deposit', rowData.id)}
                    disabled={comptaClosingCompleted}
                />
            );
        }
        return (
            <Button
                icon="pi pi-check"
                className="p-button-rounded p-button-success p-button-sm"
                tooltip="Verifier"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleVerifySingle('deposit', rowData.id)}
            />
        );
    };

    const withdrawalActionsBodyTemplate = (rowData: any) => {
        if (rowData.closingVerified) {
            return (
                <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-sm"
                    tooltip={comptaClosingCompleted ? 'Cloture comptable completee - annulation interdite' : 'Annuler la verification'}
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleUnverifySingle('withdrawal', rowData.id)}
                    disabled={comptaClosingCompleted}
                />
            );
        }
        return (
            <Button
                icon="pi pi-check"
                className="p-button-rounded p-button-success p-button-sm"
                tooltip="Verifier"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleVerifySingle('withdrawal', rowData.id)}
            />
        );
    };

    // --- Branch dropdown options ---

    const branchOptions = [
        { label: 'Toutes les agences', value: null },
        ...branches.map((b: any) => ({ label: b.name, value: b.id }))
    ];

    // --- Toolbar content ---

    const toolbarLeftContent = (
        <div className="flex flex-wrap gap-2 align-items-center">
            <Calendar
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.value as Date)}
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="Selectionner une date"
                className="w-12rem"
            />
            <Dropdown
                value={selectedBranch}
                options={branchOptions}
                onChange={(e) => setSelectedBranch(e.value)}
                placeholder="Toutes les agences"
                className="w-14rem"
            />
            <Button
                label="Charger"
                icon="pi pi-search"
                onClick={loadPreview}
                loading={loading}
            />
        </div>
    );

    const toolbarRightContent = (
        <div className="flex flex-wrap gap-2">
            <Button
                label="Tout Verifier"
                icon="pi pi-check-circle"
                className="p-button-success"
                onClick={handleVerifyAll}
                disabled={loading || (deposits.length === 0 && withdrawals.length === 0) || allVerified}
            />
            <Button
                label="Annuler Tout"
                icon="pi pi-times-circle"
                className="p-button-danger"
                onClick={handleUnverifyAll}
                disabled={loading || comptaClosingCompleted || (verifiedDepositsCount === 0 && verifiedWithdrawalsCount === 0)}
            />
        </div>
    );

    // --- Render ---

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="text-primary mb-4">
                <i className="pi pi-lock mr-2"></i>
                Verification Cloture Journaliere - Epargne
            </h4>

            {/* Toolbar */}
            <Toolbar className="mb-4" start={toolbarLeftContent} end={toolbarRightContent} />

            {/* Summary Cards */}
            <div className="grid mb-4">
                <div className="col-12 md:col-6 lg:col-3">
                    <div className="surface-card shadow-2 p-3 border-round">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-2">Total Depots</span>
                                <div className="text-900 font-medium text-xl">{depositsCount}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-arrow-down text-blue-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <div className="surface-card shadow-2 p-3 border-round">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-2">Depots Verifies</span>
                                <div className="text-900 font-medium text-xl">
                                    <span className={verifiedDepositsCount === depositsCount && depositsCount > 0 ? 'text-green-500' : 'text-orange-500'}>
                                        {verifiedDepositsCount}
                                    </span>
                                    <span className="text-500 text-sm"> / {depositsCount}</span>
                                </div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-check text-green-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <div className="surface-card shadow-2 p-3 border-round">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-2">Total Retraits</span>
                                <div className="text-900 font-medium text-xl">{withdrawalsCount}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-arrow-up text-purple-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <div className="surface-card shadow-2 p-3 border-round">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-2">Retraits Verifies</span>
                                <div className="text-900 font-medium text-xl">
                                    <span className={verifiedWithdrawalsCount === withdrawalsCount && withdrawalsCount > 0 ? 'text-green-500' : 'text-orange-500'}>
                                        {verifiedWithdrawalsCount}
                                    </span>
                                    <span className="text-500 text-sm"> / {withdrawalsCount}</span>
                                </div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-check-circle text-orange-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
            {allVerified && (deposits.length > 0 || withdrawals.length > 0) && (
                <div className="bg-green-50 border-1 border-green-300 border-round p-3 mb-4 flex align-items-center gap-2">
                    <i className="pi pi-check-circle text-green-600 text-xl"></i>
                    <span className="text-green-700 font-medium">
                        Toutes les operations du {selectedDate ? toApiDate(selectedDate) : ''} sont verifiees. Elles sont pretes pour la cloture comptable.
                    </span>
                </div>
            )}

            {/* Tabs: Depots / Retraits */}
            <TabView activeIndex={activeTabIndex} onTabChange={(e) => setActiveTabIndex(e.index)}>
                {/* Tab Depots */}
                <TabPanel header={`Depots (${depositsCount})`} leftIcon="pi pi-arrow-down mr-2">
                    <DataTable
                        value={deposits}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        emptyMessage="Aucun depot trouve pour cette date"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="depositDate"
                        sortOrder={-1}
                    >
                        <Column field="slipNumber" header="N. Bordereau" sortable />
                        <Column
                            header="Client"
                            body={clientBodyTemplate}
                            sortable
                            sortField="client.lastName"
                        />
                        <Column
                            field="amount"
                            header="Montant"
                            body={depositAmountBodyTemplate}
                            sortable
                        />
                        <Column field="depositDate" header="Date" sortable />
                        <Column
                            header="Agence"
                            body={branchBodyTemplate}
                            sortable
                            sortField="branch.name"
                        />
                        <Column
                            field="closingVerified"
                            header="Verifie"
                            body={verifiedBodyTemplate}
                            sortable
                            style={{ width: '120px' }}
                        />
                        <Column
                            header="Actions"
                            body={depositActionsBodyTemplate}
                            style={{ width: '100px' }}
                        />
                    </DataTable>
                </TabPanel>

                {/* Tab Retraits */}
                <TabPanel header={`Retraits (${withdrawalsCount})`} leftIcon="pi pi-arrow-up mr-2">
                    <DataTable
                        value={withdrawals}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        emptyMessage="Aucun retrait trouve pour cette date"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="disbursementDate"
                        sortOrder={-1}
                    >
                        <Column field="requestNumber" header="N. Demande" sortable />
                        <Column
                            header="Client"
                            body={clientBodyTemplate}
                            sortable
                            sortField="client.lastName"
                        />
                        <Column
                            field="disbursedAmount"
                            header="Montant"
                            body={withdrawalAmountBodyTemplate}
                            sortable
                        />
                        <Column field="disbursementDate" header="Date Decaissement" sortable />
                        <Column
                            header="Agence"
                            body={branchBodyTemplate}
                            sortable
                            sortField="branch.name"
                        />
                        <Column
                            field="closingVerified"
                            header="Verifie"
                            body={verifiedBodyTemplate}
                            sortable
                            style={{ width: '120px' }}
                        />
                        <Column
                            header="Actions"
                            body={withdrawalActionsBodyTemplate}
                            style={{ width: '100px' }}
                        />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default ClotureJournalierePage;
