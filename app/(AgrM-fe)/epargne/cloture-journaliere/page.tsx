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

import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';

import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import { getClientDisplayName } from '@/utils/clientUtils';

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
    const [canViewAllBranches, setCanViewAllBranches] = useState(false);
    const [userBranchId, setUserBranchId] = useState<number | null>(null);

    const [deposits, setDeposits] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [statementRequests, setStatementRequests] = useState<any[]>([]);
    const [checkbookOrders, setCheckbookOrders] = useState<any[]>([]);

    const [depositsCount, setDepositsCount] = useState(0);
    const [withdrawalsCount, setWithdrawalsCount] = useState(0);
    const [statementRequestsCount, setStatementRequestsCount] = useState(0);
    const [checkbookOrdersCount, setCheckbookOrdersCount] = useState(0);

    const [verifiedDepositsCount, setVerifiedDepositsCount] = useState(0);
    const [verifiedWithdrawalsCount, setVerifiedWithdrawalsCount] = useState(0);
    const [verifiedStatementRequestsCount, setVerifiedStatementRequestsCount] = useState(0);
    const [verifiedCheckbookOrdersCount, setVerifiedCheckbookOrdersCount] = useState(0);

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

    // --- Detect user role and branch on mount ---
    useEffect(() => {
        const appUserStr = Cookies.get('appUser');
        if (appUserStr) {
            try {
                const appUser = JSON.parse(appUserStr);
                const auths: string[] = appUser.authorities || [];
                const isSuperAdmin = auths.includes('SUPER_ADMIN') || auths.includes('ROLE_SUPER_ADMIN');
                const hasViewAll = auths.includes('VIEW_ALL_BRANCHES') || auths.includes('ROLE_VIEW_ALL_BRANCHES');
                setCanViewAllBranches(isSuperAdmin || hasViewAll);
                if (appUser.branchId) {
                    setUserBranchId(appUser.branchId);
                    if (!isSuperAdmin && !hasViewAll) {
                        setSelectedBranch(appUser.branchId);
                    }
                }
            } catch (e) { /* ignore */ }
        }
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
            const preview = previewApi.data;
            setDeposits(Array.isArray(preview.deposits) ? preview.deposits : []);
            setWithdrawals(Array.isArray(preview.withdrawals) ? preview.withdrawals : []);
            setStatementRequests(Array.isArray(preview.statementRequests) ? preview.statementRequests : []);
            setCheckbookOrders(Array.isArray(preview.checkbookOrders) ? preview.checkbookOrders : []);

            setDepositsCount(preview.depositsCount || 0);
            setWithdrawalsCount(preview.withdrawalsCount || 0);
            setStatementRequestsCount(preview.statementRequestsCount || 0);
            setCheckbookOrdersCount(preview.checkbookOrdersCount || 0);

            setVerifiedDepositsCount(preview.verifiedDepositsCount || 0);
            setVerifiedWithdrawalsCount(preview.verifiedWithdrawalsCount || 0);
            setVerifiedStatementRequestsCount(preview.verifiedStatementRequestsCount || 0);
            setVerifiedCheckbookOrdersCount(preview.verifiedCheckbookOrdersCount || 0);

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

    const handleVerifySingle = (type: string, id: number) => {
        const url = `${MODULE_CLOSING_URL}/verify/${type}/${id}?userAction=${getUserAction()}`;
        verifySingleApi.fetchData(null, 'POST', url, 'verifySingle');
    };

    const handleUnverifySingle = (type: string, id: number) => {
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

    const feeAmountBodyTemplate = (rowData: any) => {
        return <span>{formatNumber(rowData.feeAmount || rowData.totalAmount)} FBU</span>;
    };

    const clientBodyTemplate = (rowData: any) => {
        return getClientDisplayName(rowData.client);
    };

    const branchBodyTemplate = (rowData: any) => {
        return rowData.branch?.name || '-';
    };

    const requestTypeBodyTemplate = (rowData: any) => {
        if (rowData.requestType === 'HISTORIQUE') {
            return <Tag value="Historique" severity="info" />;
        }
        return <Tag value="Situation" severity="success" />;
    };

    const statusBodyTemplate = (rowData: any) => {
        const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
            'VALIDATED': { label: 'Valide', severity: 'success' },
            'DELIVERED': { label: 'Livre', severity: 'info' },
            'RECEIVED': { label: 'Recu', severity: 'info' },
            'COMPLETED': { label: 'Complete', severity: 'success' },
            'DISBURSED': { label: 'Decaisse', severity: 'success' }
        };
        const info = statusMap[rowData.status] || { label: rowData.status, severity: 'warning' as const };
        return <Tag value={info.label} severity={info.severity} />;
    };

    const makeActionsTemplate = (type: string) => (rowData: any) => {
        if (rowData.closingVerified) {
            return (
                <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-sm"
                    tooltip={comptaClosingCompleted ? 'Cloture comptable completee - annulation interdite' : 'Annuler la verification'}
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleUnverifySingle(type, rowData.id)}
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
                onClick={() => handleVerifySingle(type, rowData.id)}
            />
        );
    };

    // --- Branch dropdown options ---

    const branchOptions = canViewAllBranches
        ? [
            { label: 'Toutes les agences', value: null },
            ...branches.map((b: any) => ({ label: b.name, value: b.id }))
          ]
        : branches
            .filter((b: any) => b.id === userBranchId)
            .map((b: any) => ({ label: b.name, value: b.id }));

    // --- Totals ---
    const totalItems = depositsCount + withdrawalsCount + statementRequestsCount + checkbookOrdersCount;
    const totalVerified = verifiedDepositsCount + verifiedWithdrawalsCount + verifiedStatementRequestsCount + verifiedCheckbookOrdersCount;

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
                placeholder={canViewAllBranches ? 'Toutes les agences' : 'Mon agence'}
                className="w-14rem"
                disabled={!canViewAllBranches && userBranchId !== null}
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
                disabled={loading || totalItems === 0 || allVerified}
            />
            <Button
                label="Annuler Tout"
                icon="pi pi-times-circle"
                className="p-button-danger"
                onClick={handleUnverifyAll}
                disabled={loading || comptaClosingCompleted || totalVerified === 0}
            />
        </div>
    );

    // --- Summary card helper ---
    const renderSummaryCard = (label: string, count: number, verifiedCount: number, icon: string, iconBg: string, iconColor: string) => (
        <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-card shadow-2 p-3 border-round">
                <div className="flex justify-content-between mb-2">
                    <div>
                        <span className="block text-500 font-medium mb-1" style={{ fontSize: '0.85rem' }}>{label}</span>
                        <div className="text-900 font-medium text-xl">
                            <span className={verifiedCount === count && count > 0 ? 'text-green-500' : 'text-orange-500'}>
                                {verifiedCount}
                            </span>
                            <span className="text-500 text-sm"> / {count}</span>
                        </div>
                    </div>
                    <div className={`flex align-items-center justify-content-center ${iconBg} border-round`} style={{ width: '2.5rem', height: '2.5rem' }}>
                        <i className={`${icon} ${iconColor} text-xl`}></i>
                    </div>
                </div>
            </div>
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
                {renderSummaryCard('Depots', depositsCount, verifiedDepositsCount, 'pi pi-arrow-down', 'bg-blue-100', 'text-blue-500')}
                {renderSummaryCard('Retraits', withdrawalsCount, verifiedWithdrawalsCount, 'pi pi-arrow-up', 'bg-purple-100', 'text-purple-500')}
                {renderSummaryCard('Demandes Situation', statementRequestsCount, verifiedStatementRequestsCount, 'pi pi-file', 'bg-teal-100', 'text-teal-500')}
                {renderSummaryCard('Carnets Cheques', checkbookOrdersCount, verifiedCheckbookOrdersCount, 'pi pi-book', 'bg-orange-100', 'text-orange-500')}
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
            {allVerified && totalItems > 0 && (
                <div className="bg-green-50 border-1 border-green-300 border-round p-3 mb-4 flex align-items-center gap-2">
                    <i className="pi pi-check-circle text-green-600 text-xl"></i>
                    <span className="text-green-700 font-medium">
                        Toutes les operations du {selectedDate ? toApiDate(selectedDate) : ''} sont verifiees. Elles sont pretes pour la cloture comptable.
                    </span>
                </div>
            )}

            {/* Tabs */}
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
                        <Column header="Client" body={clientBodyTemplate} sortable sortField="client.lastName" />
                        <Column field="amount" header="Montant" body={depositAmountBodyTemplate} sortable />
                        <Column field="depositDate" header="Date" sortable />
                        <Column header="Agence" body={branchBodyTemplate} sortable sortField="branch.name" />
                        <Column field="closingVerified" header="Verifie" body={verifiedBodyTemplate} sortable style={{ width: '120px' }} />
                        <Column header="Actions" body={makeActionsTemplate('deposit')} style={{ width: '100px' }} />
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
                        <Column header="Client" body={clientBodyTemplate} sortable sortField="client.lastName" />
                        <Column field="disbursedAmount" header="Montant" body={withdrawalAmountBodyTemplate} sortable />
                        <Column field="disbursementDate" header="Date Decaissement" sortable />
                        <Column header="Agence" body={branchBodyTemplate} sortable sortField="branch.name" />
                        <Column field="closingVerified" header="Verifie" body={verifiedBodyTemplate} sortable style={{ width: '120px' }} />
                        <Column header="Actions" body={makeActionsTemplate('withdrawal')} style={{ width: '100px' }} />
                    </DataTable>
                </TabPanel>

                {/* Tab Demandes Situation/Historique */}
                <TabPanel header={`Demandes (${statementRequestsCount})`} leftIcon="pi pi-file mr-2">
                    <DataTable
                        value={statementRequests}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        emptyMessage="Aucune demande de situation/historique pour cette date"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="requestDate"
                        sortOrder={-1}
                    >
                        <Column field="requestNumber" header="N. Demande" sortable />
                        <Column header="Client" body={clientBodyTemplate} sortable sortField="client.lastName" />
                        <Column header="Type" body={requestTypeBodyTemplate} sortable sortField="requestType" style={{ width: '120px' }} />
                        <Column field="feeAmount" header="Frais" body={feeAmountBodyTemplate} sortable />
                        <Column header="Statut" body={statusBodyTemplate} sortable sortField="status" style={{ width: '120px' }} />
                        <Column header="Agence" body={branchBodyTemplate} sortable sortField="branch.name" />
                        <Column field="closingVerified" header="Verifie" body={verifiedBodyTemplate} sortable style={{ width: '120px' }} />
                        <Column header="Actions" body={makeActionsTemplate('statement')} style={{ width: '100px' }} />
                    </DataTable>
                </TabPanel>

                {/* Tab Carnets de Cheques */}
                <TabPanel header={`Carnets (${checkbookOrdersCount})`} leftIcon="pi pi-book mr-2">
                    <DataTable
                        value={checkbookOrders}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        emptyMessage="Aucune commande de carnet pour cette date"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="orderDate"
                        sortOrder={-1}
                    >
                        <Column field="orderNumber" header="N. Commande" sortable />
                        <Column header="Client" body={clientBodyTemplate} sortable sortField="client.lastName" />
                        <Column field="totalAmount" header="Montant" body={feeAmountBodyTemplate} sortable />
                        <Column field="orderDate" header="Date" sortable />
                        <Column header="Statut" body={statusBodyTemplate} sortable sortField="status" style={{ width: '120px' }} />
                        <Column header="Agence" body={branchBodyTemplate} sortable sortField="branch.name" />
                        <Column field="closingVerified" header="Verifie" body={verifiedBodyTemplate} sortable style={{ width: '120px' }} />
                        <Column header="Actions" body={makeActionsTemplate('checkbook')} style={{ width: '100px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_DAILY_CLOSING']}>
            <ClotureJournalierePage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
