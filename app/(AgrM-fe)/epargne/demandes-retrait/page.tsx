'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { WithdrawalRequest, WithdrawalRequestClass, WithdrawalStatus } from './WithdrawalRequest';
import WithdrawalRequestForm from './WithdrawalRequestForm';
import Cookies from 'js-cookie';

const BASE_URL = `${API_BASE_URL}/api/epargne/withdrawal-requests`;
const CLIENTS_URL = `${API_BASE_URL}/api/clients`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const CURRENCIES_URL = `${API_BASE_URL}/api/financial-products/reference/currencies`;
const AUTH_LEVELS_URL = `${API_BASE_URL}/api/epargne/withdrawal-authorization-levels`;

// Get current user from cookies
const getCurrentUser = (): string => {
    try {
        const appUserCookie = Cookies.get('appUser');
        if (appUserCookie) {
            const appUser = JSON.parse(appUserCookie);
            return `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim() || appUser.email || 'Unknown';
        }
    } catch (e) {
        console.error('Error parsing appUser cookie:', e);
    }
    return 'Unknown';
};

function WithdrawalRequestPage() {
    const [request, setRequest] = useState<WithdrawalRequest>(new WithdrawalRequestClass());
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [pendingRequests, setPendingRequests] = useState<WithdrawalRequest[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [authorizationLevels, setAuthorizationLevels] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const toast = useRef<Toast>(null);

    // Separate hook instances for each data type to avoid race conditions
    const clientsApi = useConsumApi('');
    const branchesApi = useConsumApi('');
    const currenciesApi = useConsumApi('');
    const savingsApi = useConsumApi('');
    const authLevelsApi = useConsumApi('');
    const requestsApi = useConsumApi('');
    const pendingApi = useConsumApi('');
    const actionsApi = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadRequests();
    }, []);

    // Handle clients data
    useEffect(() => {
        if (clientsApi.data) {
            const data = clientsApi.data;
            setClients(Array.isArray(data) ? data : data.content || []);
        }
        if (clientsApi.error) {
            showToast('error', 'Erreur', clientsApi.error.message || 'Erreur lors du chargement des clients');
        }
    }, [clientsApi.data, clientsApi.error]);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            const data = branchesApi.data;
            setBranches(Array.isArray(data) ? data : []);
        }
        if (branchesApi.error) {
            showToast('error', 'Erreur', branchesApi.error.message || 'Erreur lors du chargement des agences');
        }
    }, [branchesApi.data, branchesApi.error]);

    // Handle currencies data
    useEffect(() => {
        if (currenciesApi.data) {
            const data = currenciesApi.data;
            setCurrencies(Array.isArray(data) ? data : []);
        }
        if (currenciesApi.error) {
            showToast('error', 'Erreur', currenciesApi.error.message || 'Erreur lors du chargement des devises');
        }
    }, [currenciesApi.data, currenciesApi.error]);

    // Handle savings accounts data
    useEffect(() => {
        if (savingsApi.data) {
            const data = savingsApi.data;
            setSavingsAccounts(Array.isArray(data) ? data : []);
        }
        if (savingsApi.error) {
            showToast('error', 'Erreur', savingsApi.error.message || 'Erreur lors du chargement des comptes');
        }
    }, [savingsApi.data, savingsApi.error]);

    // Handle authorization levels data
    useEffect(() => {
        if (authLevelsApi.data) {
            const data = authLevelsApi.data;
            setAuthorizationLevels(Array.isArray(data) ? data : []);
        }
        if (authLevelsApi.error) {
            showToast('error', 'Erreur', authLevelsApi.error.message || 'Erreur lors du chargement des niveaux');
        }
    }, [authLevelsApi.data, authLevelsApi.error]);

    // Handle requests data
    useEffect(() => {
        if (requestsApi.data) {
            const data = requestsApi.data;
            setRequests(Array.isArray(data) ? data : data.content || []);
            setLoading(false);
        }
        if (requestsApi.error) {
            showToast('error', 'Erreur', requestsApi.error.message || 'Erreur lors du chargement des demandes');
            setLoading(false);
        }
    }, [requestsApi.data, requestsApi.error]);

    // Handle pending requests data
    useEffect(() => {
        if (pendingApi.data) {
            const data = pendingApi.data;
            setPendingRequests(Array.isArray(data) ? data : []);
        }
    }, [pendingApi.data]);

    // Handle actions (create, verify, disburse, etc.)
    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Demande de retrait créée avec succès');
                    resetForm();
                    loadRequests();
                    setActiveIndex(2);
                    break;
                case 'verifyId':
                case 'firstVerify':
                case 'secondVerify':
                case 'approveManager':
                    showToast('success', 'Succès', 'Vérification effectuée');
                    loadRequests();
                    break;
                case 'disburse':
                    showToast('success', 'Succès', 'Retrait décaissé avec succès');
                    loadRequests();
                    break;
                case 'reject':
                    showToast('success', 'Succès', 'Demande rejetée');
                    setRejectDialog(false);
                    loadRequests();
                    break;
                case 'cancel':
                    showToast('success', 'Succès', 'Demande annulée');
                    loadRequests();
                    break;
            }
        }
        if (actionsApi.error) {
            showToast('error', 'Erreur', actionsApi.error.message || 'Une erreur est survenue');
        }
    }, [actionsApi.data, actionsApi.error, actionsApi.callType]);

    const loadReferenceData = () => {
        clientsApi.fetchData(null, 'GET', `${CLIENTS_URL}/findall`, 'loadClients');
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        currenciesApi.fetchData(null, 'GET', `${CURRENCIES_URL}/findall`, 'loadCurrencies');
        authLevelsApi.fetchData(null, 'GET', `${AUTH_LEVELS_URL}/findall`, 'loadAuthLevels');
        // Load all savings accounts on startup
        savingsApi.fetchData(null, 'GET', `${SAVINGS_URL}/findallactive`, 'loadSavingsAccounts');
    };

    const loadRequests = () => {
        setLoading(true);
        requestsApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadRequests');
        pendingApi.fetchData(null, 'GET', `${BASE_URL}/findbystatus/PENDING`, 'loadPending');
    };

    // When savings account is selected, auto-populate the client
    const handleSavingsAccountChange = (accountId: number) => {
        if (accountId) {
            const selectedAccount = savingsAccounts.find(acc => acc.id === accountId);
            if (selectedAccount) {
                setAccountBalance(selectedAccount.currentBalance || 0);
                if (selectedAccount.client) {
                    // Auto-set the client from the selected savings account
                    setRequest(prev => ({
                        ...prev,
                        savingsAccountId: accountId,
                        clientId: selectedAccount.client.id
                    }));
                }
            }
        }
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRequest(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setRequest(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setRequest(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : null
        }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setRequest(prev => ({ ...prev, [name]: value || 0 }));
    };

    const handleAmountChange = (amount: number) => {
        // Déterminer les exigences basées sur le montant
        const dualVerificationRequired = amount > 100000;
        const requiresManagerApproval = amount > 500000;
        setRequest(prev => ({
            ...prev,
            requestedAmount: amount,
            dualVerificationRequired,
            requiresManagerApproval
        }));
    };

    const validateForm = (): boolean => {
        if (!request.savingsAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un compte');
            return false;
        }
        if (!request.clientId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un client');
            return false;
        }
        if (!request.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        if (request.requestedAmount < 1000) {
            showToast('warn', 'Attention', 'Le montant minimum de retrait est de 1 000 FBU');
            return false;
        }
        if (request.requestedAmount > accountBalance - 1000) {
            showToast('warn', 'Attention', 'Solde insuffisant (solde minimum: 1 000 FBU)');
            return false;
        }
        if (request.requestedAmount > 500000) {
            showToast('info', 'Information', 'Ce retrait nécessite l\'approbation du manager');
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const requestData = {
            ...request,
            userAction: getCurrentUser()
        };
        actionsApi.fetchData(requestData, 'POST', `${BASE_URL}/new`, 'create');
    };

    const resetForm = () => {
        setRequest(new WithdrawalRequestClass());
        setAccountBalance(0);
    };

    const viewRequest = (rowData: WithdrawalRequest) => {
        setSelectedRequest(rowData);
        setViewDialog(true);
    };

    const verifyId = (rowData: WithdrawalRequest) => {
        actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/verifyid/${rowData.id}`, 'verifyId');
    };

    const firstVerify = (rowData: WithdrawalRequest) => {
        actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/firstverify/${rowData.id}`, 'firstVerify');
    };

    const secondVerify = (rowData: WithdrawalRequest) => {
        actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/secondverify/${rowData.id}`, 'secondVerify');
    };

    const approveByManager = (rowData: WithdrawalRequest) => {
        confirmDialog({
            message: `Approuver le retrait de ${formatCurrency(rowData.requestedAmount)} ?`,
            header: 'Approbation Manager',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Approuver',
            rejectLabel: 'Annuler',
            accept: () => {
                actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/approvebymanager/${rowData.id}`, 'approveManager');
            }
        });
    };

    const disburse = (rowData: WithdrawalRequest) => {
        confirmDialog({
            message: `Confirmer le décaissement de ${formatCurrency(rowData.requestedAmount)} ?`,
            header: 'Décaissement',
            icon: 'pi pi-wallet',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Décaisser',
            rejectLabel: 'Annuler',
            accept: () => {
                actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/disburse/${rowData.id}`, 'disburse');
            }
        });
    };

    const openRejectDialog = (rowData: WithdrawalRequest) => {
        setSelectedRequest(rowData);
        setRejectionReason('');
        setRejectDialog(true);
    };

    const handleReject = () => {
        if (selectedRequest && rejectionReason) {
            actionsApi.fetchData(
                { rejectionReason, userAction: getCurrentUser() },
                'POST',
                `${BASE_URL}/reject/${selectedRequest.id}`,
                'reject'
            );
        }
    };

    const cancelRequest = (rowData: WithdrawalRequest) => {
        confirmDialog({
            message: 'Annuler cette demande de retrait ?',
            header: 'Annulation',
            icon: 'pi pi-times-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, annuler',
            rejectLabel: 'Non',
            accept: () => {
                actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/cancel/${rowData.id}`, 'cancel');
            }
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const getStatusSeverity = (status: string): 'success' | 'info' | 'warning' | 'danger' => {
        switch (status) {
            case 'DISBURSED':
                return 'success';
            case 'APPROVED':
            case 'MANAGER_APPROVED':
                return 'info';
            case 'PENDING':
            case 'ID_VERIFIED':
            case 'FIRST_VERIFIED':
            case 'SECOND_VERIFIED':
                return 'warning';
            case 'REJECTED':
            case 'CANCELLED':
                return 'danger';
            default:
                return 'info';
        }
    };

    const statusBodyTemplate = (rowData: WithdrawalRequest) => {
        const labels: { [key: string]: string } = {
            PENDING: 'En attente',
            ID_VERIFIED: 'ID Vérifié',
            FIRST_VERIFIED: '1ère Vérif.',
            SECOND_VERIFIED: '2ème Vérif.',
            MANAGER_APPROVED: 'Manager OK',
            APPROVED: 'Approuvé',
            DISBURSED: 'Décaissé',
            REJECTED: 'Rejeté',
            CANCELLED: 'Annulé'
        };
        return (
            <Tag
                value={labels[rowData.status] || rowData.status}
                severity={getStatusSeverity(rowData.status)}
            />
        );
    };

    const actionsBodyTemplate = (rowData: WithdrawalRequest) => {
        const status = rowData.status;
        const canVerifyId = status === 'PENDING';
        const canFirstVerify = status === 'ID_VERIFIED' && rowData.dualVerificationRequired;
        const canSecondVerify = status === 'FIRST_VERIFIED';
        const canManagerApprove = (status === 'ID_VERIFIED' || status === 'SECOND_VERIFIED') && rowData.requiresManagerApproval;
        const canDisburse = status === 'APPROVED' || status === 'MANAGER_APPROVED' ||
            (status === 'ID_VERIFIED' && !rowData.dualVerificationRequired && !rowData.requiresManagerApproval) ||
            (status === 'SECOND_VERIFIED' && !rowData.requiresManagerApproval);
        const canReject = !['DISBURSED', 'REJECTED', 'CANCELLED'].includes(status);
        const canCancel = status === 'PENDING';

        return (
            <div className="flex gap-1 flex-wrap">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewRequest(rowData)}
                    tooltip="Voir"
                />
                {canVerifyId && (
                    <Button
                        icon="pi pi-id-card"
                        className="p-button-rounded p-button-warning p-button-sm"
                        onClick={() => verifyId(rowData)}
                        tooltip="Confirmer Saisi"
                    />
                )}
                {canFirstVerify && (
                    <Button
                        icon="pi pi-check"
                        className="p-button-rounded p-button-info p-button-sm"
                        onClick={() => firstVerify(rowData)}
                        tooltip="1ère Vérification"
                    />
                )}
                {canSecondVerify && (
                    <Button
                        icon="pi pi-check-circle"
                        className="p-button-rounded p-button-info p-button-sm"
                        onClick={() => secondVerify(rowData)}
                        tooltip="2ème Vérification"
                    />
                )}
                {canManagerApprove && (
                    <Button
                        icon="pi pi-user-edit"
                        className="p-button-rounded p-button-help p-button-sm"
                        onClick={() => approveByManager(rowData)}
                        tooltip="Approbation Manager"
                    />
                )}
                {canDisburse && (
                    <Button
                        icon="pi pi-wallet"
                        className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => disburse(rowData)}
                        tooltip="Décaisser"
                    />
                )}
                {canReject && (
                    <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => openRejectDialog(rowData)}
                        tooltip="Rejeter"
                    />
                )}
                {canCancel && (
                    <Button
                        icon="pi pi-ban"
                        className="p-button-rounded p-button-secondary p-button-sm"
                        onClick={() => cancelRequest(rowData)}
                        tooltip="Annuler"
                    />
                )}
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Demandes de Retrait</h5>
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

            <h4 className="text-primary mb-4">
                <i className="pi pi-wallet mr-2"></i>
                Opération de Retrait
            </h4>

            <div className="surface-100 p-3 border-round mb-4">
                <h6 className="m-0 mb-2">
                    <i className="pi pi-shield mr-2 text-orange-500"></i>
                    Contrôles de Sécurité
                </h6>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-check-circle text-green-500"></i>
                            <span><strong>&gt; 100 000 FBU:</strong> Double vérification</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-user-edit text-purple-500"></i>
                            <span><strong>&gt; 500 000 FBU:</strong> Approbation manager</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-clock text-blue-500"></i>
                            <span><strong>&gt; 2 000 000 FBU:</strong> Préavis 48h</span>
                        </div>
                    </div>
                </div>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Demande" leftIcon="pi pi-plus mr-2">
                    <WithdrawalRequestForm
                        request={request}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleDateChange={handleDateChange}
                        handleNumberChange={handleNumberChange}
                        clients={clients}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        currencies={currencies}
                        authorizationLevels={authorizationLevels}
                        onSavingsAccountChange={handleSavingsAccountChange}
                        onAmountChange={handleAmountChange}
                        accountBalance={accountBalance}
                    />
                    <div className="flex gap-2 mt-4">
                        <Button
                            label="Soumettre la Demande"
                            icon="pi pi-send"
                            onClick={handleSubmit}
                            className="p-button-success"
                            disabled={request.requestedAmount < 1000}
                        />
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={resetForm}
                            className="p-button-secondary"
                        />
                    </div>
                </TabPanel>

                <TabPanel header={`En Attente (${pendingRequests.length})`} leftIcon="pi pi-clock mr-2">
                    <DataTable
                        value={pendingRequests}
                        paginator
                        rows={10}
                        loading={loading}
                        emptyMessage="Aucune demande en attente"
                        stripedRows
                        showGridlines
                        size="small"
                    >
                        <Column field="requestNumber" header="N° Demande" sortable />
                        <Column
                            field="client"
                            header="Client"
                            body={(row) => row.client ? `${row.client.firstName} ${row.client.lastName}` : '-'}
                        />
                        <Column field="requestDate" header="Date" sortable />
                        <Column
                            field="requestedAmount"
                            header="Montant"
                            body={(row) => formatCurrency(row.requestedAmount)}
                            sortable
                        />
                        <Column field="status" header="Statut" body={statusBodyTemplate} />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '250px' }} />
                    </DataTable>
                </TabPanel>

                <TabPanel header="Toutes les Demandes" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={requests}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucune demande trouvée"
                        stripedRows
                        showGridlines
                        size="small"
                    >
                        <Column field="requestNumber" header="N° Demande" sortable />
                        <Column
                            field="client"
                            header="Client"
                            body={(row) => row.client ? `${row.client.firstName} ${row.client.lastName}` : '-'}
                        />
                        <Column field="requestDate" header="Date" sortable />
                        <Column
                            field="requestedAmount"
                            header="Montant"
                            body={(row) => formatCurrency(row.requestedAmount)}
                            sortable
                        />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '250px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog pour rejeter */}
            <Dialog
                header="Rejeter la Demande"
                visible={rejectDialog}
                style={{ width: '450px' }}
                onHide={() => setRejectDialog(false)}
                footer={
                    <div>
                        <Button label="Fermer" icon="pi pi-times" onClick={() => setRejectDialog(false)} className="p-button-text" />
                        <Button
                            label="Rejeter"
                            icon="pi pi-times-circle"
                            onClick={handleReject}
                            className="p-button-danger"
                            disabled={!rejectionReason}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-500 mb-3">
                        Demande: <strong>{selectedRequest?.requestNumber}</strong><br />
                        Montant: <strong>{formatCurrency(selectedRequest?.requestedAmount || 0)}</strong>
                    </p>
                    <div className="field">
                        <label htmlFor="rejectionReason" className="font-medium">Motif du rejet *</label>
                        <InputTextarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                            placeholder="Expliquez la raison du rejet..."
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog pour voir les détails */}
            <Dialog
                header="Détails de la Demande"
                visible={viewDialog}
                style={{ width: '800px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedRequest && (
                    <WithdrawalRequestForm
                        request={selectedRequest}
                        handleChange={() => {}}
                        handleDropdownChange={() => {}}
                        handleDateChange={() => {}}
                        handleNumberChange={() => {}}
                        clients={clients}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        currencies={currencies}
                        authorizationLevels={authorizationLevels}
                        isViewMode={true}
                    />
                )}
            </Dialog>
        </div>
    );
}

export default WithdrawalRequestPage;
