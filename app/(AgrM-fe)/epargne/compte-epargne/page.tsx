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
import Cookies from 'js-cookie';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { SavingsAccount, SavingsAccountClass } from './SavingsAccount';
import SavingsAccountForm from './SavingsAccountForm';

const BASE_URL = `${API_BASE_URL}/api/savings-accounts`;
const CLIENTS_URL = `${API_BASE_URL}/api/clients`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const CURRENCIES_URL = `${API_BASE_URL}/api/financial-products/reference/currencies`;
const STATUSES_URL = `${API_BASE_URL}/api/financial-products/reference/savings-account-statuses`;

function SavingsAccountPage() {
    const [savingsAccount, setSavingsAccount] = useState<SavingsAccount>(new SavingsAccountClass());
    const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);
    const toast = useRef<Toast>(null);

    // Separate hook instances for each data type
    const clientsApi = useConsumApi('');
    const branchesApi = useConsumApi('');
    const currenciesApi = useConsumApi('');
    const statusesApi = useConsumApi('');
    const accountsApi = useConsumApi('');
    const actionsApi = useConsumApi('');

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

    // Handle statuses data
    useEffect(() => {
        if (statusesApi.data) {
            setStatuses(Array.isArray(statusesApi.data) ? statusesApi.data : []);
        }
        if (statusesApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des statuts');
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

    const loadReferenceData = () => {
        clientsApi.fetchData(null, 'GET', `${CLIENTS_URL}/findall`, 'loadClients');
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        currenciesApi.fetchData(null, 'GET', `${CURRENCIES_URL}/findall`, 'loadCurrencies');
        statusesApi.fetchData(null, 'GET', `${STATUSES_URL}/findall`, 'loadStatuses');
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
        setSavingsAccount(prev => ({ ...prev, [name]: value }));
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
            statusId: rowData.status?.id || rowData.statusId
        });
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
        return (
            <span className={balance < 0 ? 'text-red-500 font-semibold' : ''}>
                {balance.toLocaleString('fr-FR')} FBU
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
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-warning p-button-sm"
                    onClick={() => editAccount(rowData)}
                    tooltip="Modifier"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-sm"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Supprimer"
                />
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
                    >
                        <Column field="accountNumber" header="N° Compte" sortable />
                        <Column
                            field="client"
                            header="Client"
                            sortable
                            body={(row) => row.client ? `${row.client.firstName} ${row.client.lastName}` : '-'}
                        />
                        <Column field="branch.name" header="Agence" sortable />
                        <Column header="Type" body={accountTypeBodyTemplate} />
                        <Column header="Solde" body={balanceBodyTemplate} sortable sortField="currentBalance" />
                        <Column field="openingDate" header="Date d'Ouverture" sortable />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
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
                        isViewMode={true}
                    />
                )}
            </Dialog>
        </div>
    );
}

export default SavingsAccountPage;
