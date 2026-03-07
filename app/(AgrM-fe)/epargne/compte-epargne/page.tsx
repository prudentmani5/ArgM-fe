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
import { Dropdown } from 'primereact/dropdown';
import Cookies from 'js-cookie';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { SavingsAccount, SavingsAccountClass } from './SavingsAccount';
import SavingsAccountForm from './SavingsAccountForm';
import { ProtectedPage } from '@/components/ProtectedPage';

const BASE_URL = `${API_BASE_URL}/api/savings-accounts`;
const CLIENTS_URL = `${API_BASE_URL}/api/clients`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const CURRENCIES_URL = `${API_BASE_URL}/api/financial-products/reference/currencies`;
const STATUSES_URL = `${API_BASE_URL}/api/financial-products/reference/savings-account-statuses`;
const INTERNAL_ACCOUNTS_URL = `${API_BASE_URL}/api/comptability/internal-accounts`;

// Fallback statuses when API is forbidden (caissier role)
const FALLBACK_STATUSES = [
    { id: 1, code: 'ACTIVE', name: 'Active', nameFr: 'Actif' },
    { id: 2, code: 'INACTIVE', name: 'Inactive', nameFr: 'Inactif' },
    { id: 3, code: 'DORMANT', name: 'Dormant', nameFr: 'Dormant' },
    { id: 4, code: 'CLOSED', name: 'Closed', nameFr: 'Fermé' },
];

function SavingsAccountPage() {
    const [savingsAccount, setSavingsAccount] = useState<SavingsAccount>(new SavingsAccountClass());
    const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);
    const [statusDialog, setStatusDialog] = useState(false);
    const [statusChangeAccount, setStatusChangeAccount] = useState<SavingsAccount | null>(null);
    const [newStatusId, setNewStatusId] = useState<number | null>(null);
    const [selectedClientType, setSelectedClientType] = useState<string>('');
    const toast = useRef<Toast>(null);

    // Separate hook instances for each data type
    const clientsApi = useConsumApi('');
    const branchesApi = useConsumApi('');
    const currenciesApi = useConsumApi('');
    const statusesApi = useConsumApi('');
    const internalAccountsApi = useConsumApi('');
    const accountsApi = useConsumApi('');
    const actionsApi = useConsumApi('');
    const statusApi = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadSavingsAccounts();
    }, []);

    // Handle clients data
    useEffect(() => {
        if (clientsApi.data) {
            setClients(Array.isArray(clientsApi.data) ? clientsApi.data : clientsApi.data.content || []);
        }
        if (clientsApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des clients');
        }
    }, [clientsApi.data, clientsApi.error]);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
        }
        if (branchesApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des agences');
        }
    }, [branchesApi.data, branchesApi.error]);

    // Handle currencies data
    useEffect(() => {
        if (currenciesApi.data) {
            setCurrencies(Array.isArray(currenciesApi.data) ? currenciesApi.data : []);
        }
        if (currenciesApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des devises');
        }
    }, [currenciesApi.data, currenciesApi.error]);

    // Handle internal accounts data
    useEffect(() => {
        if (internalAccountsApi.data) {
            const data = Array.isArray(internalAccountsApi.data) ? internalAccountsApi.data : [];
            setInternalAccounts(data.map((a: any) => ({
                ...a,
                _displayLabel: `${a.codeCompte} - ${a.libelle} (${a.accountNumber})`
            })));
        }
    }, [internalAccountsApi.data]);

    // Handle statuses data (use fallback statuses if Forbidden for caissiers)
    useEffect(() => {
        if (statusesApi.data) {
            const data = Array.isArray(statusesApi.data) ? statusesApi.data : [];
            setStatuses(data.length > 0 ? data : FALLBACK_STATUSES);
        }
        if (statusesApi.error) {
            // Use fallback statuses for users without settings authority (403 Forbidden)
            if (statusesApi.error.status === 403 || statusesApi.error.status === 0) {
                setStatuses(FALLBACK_STATUSES);
            } else {
                showToast('error', 'Erreur', 'Erreur lors du chargement des statuts');
            }
        }
    }, [statusesApi.data, statusesApi.error]);

    // Handle accounts data
    useEffect(() => {
        if (accountsApi.data) {
            setSavingsAccounts(Array.isArray(accountsApi.data) ? accountsApi.data : accountsApi.data.content || []);
            setLoading(false);
        }
        if (accountsApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des comptes');
            setLoading(false);
        }
    }, [accountsApi.data, accountsApi.error]);

    // Handle actions
    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Compte d\'épargne créé avec succès');
                    resetForm();
                    loadSavingsAccounts();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Compte d\'épargne mis à jour avec succès');
                    resetForm();
                    loadSavingsAccounts();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Compte d\'épargne supprimé avec succès');
                    loadSavingsAccounts();
                    break;
            }
        }
        if (actionsApi.error) {
            showToast('error', 'Erreur', actionsApi.error.message || 'Une erreur est survenue');
        }
    }, [actionsApi.data, actionsApi.error, actionsApi.callType]);

    // Handle status change response (dedicated hook)
    useEffect(() => {
        if (statusApi.data) {
            showToast('success', 'Succès', 'Statut du compte mis à jour avec succès');
            setStatusDialog(false);
            setStatusChangeAccount(null);
            setNewStatusId(null);
            loadSavingsAccounts();
        }
        if (statusApi.error) {
            showToast('error', 'Erreur', statusApi.error.message || 'Erreur lors du changement de statut');
        }
    }, [statusApi.data, statusApi.error]);

    const loadReferenceData = () => {
        clientsApi.fetchData(null, 'GET', `${CLIENTS_URL}/findall`, 'loadClients');
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        currenciesApi.fetchData(null, 'GET', `${CURRENCIES_URL}/findall`, 'loadCurrencies');
        statusesApi.fetchData(null, 'GET', `${STATUSES_URL}/findall`, 'loadStatuses');
        internalAccountsApi.fetchData(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findall`, 'loadInternalAccounts');
    };

    const loadSavingsAccounts = () => {
        setLoading(true);
        accountsApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadAccounts');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSavingsAccount(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        if (name === 'clientId') {
            const client = clients.find((c: any) => c.id === value);
            const clientType = client?.clientType || '';
            setSelectedClientType(clientType);
            // Auto-set requiredSignatures to 1 for INDIVIDUAL, keep current or default for others
            if (clientType === 'INDIVIDUAL') {
                setSavingsAccount(prev => ({ ...prev, clientId: value, requiredSignatures: 1 }));
            } else {
                setSavingsAccount(prev => ({ ...prev, clientId: value }));
            }
        } else {
            setSavingsAccount(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setSavingsAccount(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : null
        }));
    };

    const handleNumberChange = (name: string, value: number | null | undefined) => {
        setSavingsAccount(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const validateForm = (): boolean => {
        if (!savingsAccount.clientId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un client');
            return false;
        }
        if (!savingsAccount.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        if (!savingsAccount.currencyId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une devise');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        // Add user action info
        const currentUser = getCurrentUser();
        const accountWithUser = {
            ...savingsAccount,
            userAction: currentUser
        };

        if (savingsAccount.id) {
            actionsApi.fetchData(accountWithUser, 'PUT', `${BASE_URL}/update/${savingsAccount.id}`, 'update');
        } else {
            actionsApi.fetchData(accountWithUser, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const resetForm = () => {
        setSavingsAccount(new SavingsAccountClass());
        setSelectedClientType('');
    };

    const viewAccount = (rowData: SavingsAccount) => {
        // Set IDs from nested objects for proper dropdown display
        setSelectedAccount({
            ...rowData,
            clientId: rowData.client?.id || rowData.clientId,
            branchId: rowData.branch?.id || rowData.branchId,
            currencyId: rowData.currency?.id || rowData.currencyId,
            statusId: rowData.status?.id || rowData.statusId
        });
        setViewDialog(true);
    };

    const editAccount = (rowData: SavingsAccount) => {
        setSavingsAccount({
            ...rowData,
            clientId: rowData.client?.id || rowData.clientId,
            branchId: rowData.branch?.id || rowData.branchId,
            currencyId: rowData.currency?.id || rowData.currencyId,
            statusId: rowData.status?.id || rowData.statusId,
            internalAccountId: rowData.internalAccountId || null
        });
        setSelectedClientType(rowData.client?.clientType || '');
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: SavingsAccount) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le compte "${rowData.accountNumber}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                actionsApi.fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const openStatusDialog = (rowData: SavingsAccount) => {
        setStatusChangeAccount(rowData);
        setNewStatusId(rowData.status?.id || rowData.statusId);
        setStatusDialog(true);
    };

    const handleStatusChange = () => {
        if (!statusChangeAccount || !newStatusId) return;
        const currentUser = getCurrentUser();
        statusApi.fetchData(
            { statusId: newStatusId, userAction: currentUser },
            'PUT',
            `${BASE_URL}/update/${statusChangeAccount.id}`,
            'changeStatus'
        );
    };

    const statusBodyTemplate = (rowData: SavingsAccount) => {
        const status = rowData.status;
        let severity: 'success' | 'info' | 'warning' | 'danger' = 'info';
        if (status?.code === 'ACTIVE' || status?.code === 'ACTIF') severity = 'success';
        else if (status?.code === 'CLOSED' || status?.code === 'FERME') severity = 'danger';
        else if (status?.code === 'DORMANT') severity = 'warning';

        return (
            <Tag value={status?.nameFr || status?.name || 'N/A'} severity={severity} />
        );
    };

    const balanceBodyTemplate = (rowData: SavingsAccount) => {
        const balance = rowData.currentBalance || 0;
        const code = rowData.currency?.code || 'FBU';
        return (
            <span className={balance < 0 ? 'text-red-500 font-semibold' : ''}>
                {balance.toLocaleString('fr-FR')} {code}
            </span>
        );
    };

    const accountTypeBodyTemplate = (rowData: SavingsAccount) => {
        const types: Record<string, string> = {
            'REGULAR': 'Régulière',
            'TERM_DEPOSIT': 'Dépôt à Terme',
            'COMPULSORY': 'Obligatoire'
        };
        return types[rowData.accountType] || rowData.accountType;
    };

    const actionsBodyTemplate = (rowData: SavingsAccount) => {
        return (
            <div className="flex gap-1 flex-wrap">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewAccount(rowData)}
                    tooltip="Voir"
                />
                <Button
                    icon="pi pi-sync"
                    className="p-button-rounded p-button-help p-button-sm"
                    onClick={() => openStatusDialog(rowData)}
                    tooltip="Changer Statut"
                />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-warning p-button-sm"
                    onClick={() => editAccount(rowData)}
                    tooltip="Modifier"
                />
                {(rowData.status?.code === 'PENDING_ACTIVATION' || rowData.status?.nameFr === 'En attente d\'activation') && (
                    <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => confirmDelete(rowData)}
                        tooltip="Supprimer"
                    />
                )}
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Comptes d'Épargne</h5>
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
                Gestion des Comptes d'Épargne
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Compte" leftIcon="pi pi-plus mr-2">
                    <SavingsAccountForm
                        savingsAccount={savingsAccount}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleDateChange={handleDateChange}
                        handleNumberChange={handleNumberChange}
                        clients={clients}
                        branches={branches}
                        currencies={currencies}
                        statuses={statuses}
                        internalAccounts={internalAccounts}
                        selectedClientType={selectedClientType}
                    />
                    <div className="flex gap-2 mt-4">
                        <Button
                            label={savingsAccount.id ? 'Mettre à jour' : 'Créer le Compte'}
                            icon="pi pi-save"
                            onClick={handleSubmit}
                            className="p-button-success"
                        />
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={resetForm}
                            className="p-button-secondary"
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Comptes" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={savingsAccounts}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun compte d'épargne trouvé"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="openingDate"
                        sortOrder={-1}
                    >
                        <Column field="accountNumber" header="N° Compte" sortable />
                        <Column
                            field="client"
                            header="Client"
                            sortable
                            body={(row) => row.client ? (row.client.businessName || `${row.client.firstName || ''} ${row.client.lastName || ''}`.trim() || '-') : '-'}
                        />
                        <Column
                            header="Type Client"
                            sortable
                            sortField="client.clientType"
                            body={(row) => {
                                const type = row.client?.clientType;
                                const labels: Record<string, string> = {
                                    'INDIVIDUAL': 'Individuel',
                                    'BUSINESS': 'Entreprise',
                                    'JOINT_ACCOUNT': 'Conjoint',
                                    'GROUP': 'Groupe'
                                };
                                const severities: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
                                    'INDIVIDUAL': 'info',
                                    'BUSINESS': 'warning',
                                    'JOINT_ACCOUNT': 'success',
                                    'GROUP': 'danger'
                                };
                                return type ? <Tag value={labels[type] || type} severity={severities[type] || 'info'} /> : '-';
                            }}
                            style={{ width: '120px' }}
                        />
                        <Column field="branch.name" header="Agence" sortable />
                        <Column header="Type" body={accountTypeBodyTemplate} />
                        <Column header="Solde" body={balanceBodyTemplate} sortable sortField="currentBalance" />
                        <Column field="openingDate" header="Date d'Ouverture" sortable />
                        <Column field="requiredSignatures" header="Signatures" sortable style={{ width: '100px' }} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '200px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog pour voir les détails */}
            <Dialog
                header="Détails du Compte"
                visible={viewDialog}
                style={{ width: '700px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedAccount && (
                    <SavingsAccountForm
                        savingsAccount={selectedAccount}
                        handleChange={() => {}}
                        handleDropdownChange={() => {}}
                        handleDateChange={() => {}}
                        handleNumberChange={() => {}}
                        clients={clients}
                        branches={branches}
                        currencies={currencies}
                        statuses={statuses}
                        internalAccounts={internalAccounts}
                        isViewMode={true}
                        selectedClientType={selectedAccount.client?.clientType || ''}
                    />
                )}
            </Dialog>

            {/* Dialog pour changer le statut */}
            <Dialog
                header="Changer le Statut du Compte"
                visible={statusDialog}
                style={{ width: '450px' }}
                onHide={() => { setStatusDialog(false); setStatusChangeAccount(null); setNewStatusId(null); }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => { setStatusDialog(false); setStatusChangeAccount(null); setNewStatusId(null); }}
                        />
                        <Button
                            label="Confirmer"
                            icon="pi pi-check"
                            className="p-button-success"
                            onClick={handleStatusChange}
                            disabled={!newStatusId || newStatusId === (statusChangeAccount?.status?.id || statusChangeAccount?.statusId)}
                        />
                    </div>
                }
            >
                {statusChangeAccount && (
                    <div>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p className="m-0"><strong>Compte:</strong> {statusChangeAccount.accountNumber}</p>
                            <p className="m-0"><strong>Client:</strong> {statusChangeAccount.client ? (statusChangeAccount.client.businessName || `${statusChangeAccount.client.firstName || ''} ${statusChangeAccount.client.lastName || ''}`.trim() || '-') : '-'}</p>
                            <p className="m-0"><strong>Statut actuel:</strong> {statusChangeAccount.status?.nameFr || statusChangeAccount.status?.name || 'N/A'}</p>
                        </div>
                        <div className="field">
                            <label htmlFor="newStatus" className="font-medium mb-2 block">Nouveau Statut *</label>
                            <Dropdown
                                id="newStatus"
                                value={newStatusId}
                                options={statuses}
                                onChange={(e) => setNewStatusId(e.value)}
                                optionLabel="nameFr"
                                optionValue="id"
                                placeholder="Sélectionner le nouveau statut"
                                className="w-full"
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_VIEW']}>
            <SavingsAccountPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
