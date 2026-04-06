'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import CancellationRefBadge from '@/components/CancellationRefBadge';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { useMarkCancellationReplaced } from '@/hooks/useMarkCancellationReplaced';
import { DepositSlip, DepositSlipClass, DepositSlipStatus, CashDenomination } from './DepositSlip';
import { getClientDisplayName } from '@/utils/clientUtils';
import DepositSlipForm from './DepositSlipForm';
import PrintableDepositSlip from './PrintableDepositSlip';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';

const BASE_URL = `${API_BASE_URL}/api/epargne/deposit-slips`;
const CLIENTS_URL = `${API_BASE_URL}/api/clients`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const CURRENCIES_URL = `${API_BASE_URL}/api/financial-products/reference/currencies`;
const CAISSES_URL = `${API_BASE_URL}/api/comptability/caisses`;

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

function DepositSlipPage() {
    const { can } = useAuthorizedAction();
    const [depositSlip, setDepositSlip] = useState<DepositSlip>(new DepositSlipClass());
    const [depositSlips, setDepositSlips] = useState<DepositSlip[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [cancelDialog, setCancelDialog] = useState(false);
    const [printDialog, setPrintDialog] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState<DepositSlip | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [caisses, setCaisses] = useState<any[]>([]);
    const [selectedCaisseId, setSelectedCaisseId] = useState<number | null>(null);
    const [agencyOpen, setAgencyOpen] = useState<boolean>(true);
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Separate hook instances for each data type to avoid race conditions
    const clientsApi = useConsumApi('');
    const branchesApi = useConsumApi('');
    const currenciesApi = useConsumApi('');
    const savingsApi = useConsumApi('');
    const slipsApi = useConsumApi('');
    const actionsApi = useConsumApi('');
    const caissesApi = useConsumApi('');
    const { markIfNeeded } = useMarkCancellationReplaced();

    useEffect(() => {
        loadReferenceData();
        loadDepositSlips();
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

    // Handle savings accounts data (exclude TERM_DEPOSIT - dépôt interdit)
    useEffect(() => {
        if (savingsApi.data) {
            const data = Array.isArray(savingsApi.data) ? savingsApi.data : [];
            setSavingsAccounts(data.filter((a: any) => a.accountType !== 'TERM_DEPOSIT'));
        }
        if (savingsApi.error) {
            showToast('error', 'Erreur', savingsApi.error.message || 'Erreur lors du chargement des comptes');
        }
    }, [savingsApi.data, savingsApi.error]);

    // Handle deposit slips data — filter by caisse for caissiers
    useEffect(() => {
        if (slipsApi.data) {
            let data: DepositSlip[] = Array.isArray(slipsApi.data) ? slipsApi.data : slipsApi.data.content || [];
            // If caissier has an assigned caisse, only show their transactions
            if (selectedCaisseId) {
                data = data.filter((s: any) => s.caisseId === selectedCaisseId);
            }
            setDepositSlips(data);
            setLoading(false);
        }
        if (slipsApi.error) {
            showToast('error', 'Erreur', slipsApi.error.message || 'Erreur lors du chargement des bordereaux');
            setLoading(false);
        }
    }, [slipsApi.data, slipsApi.error, selectedCaisseId]);

    // Handle actions (create, complete, cancel, delete)
    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Bordereau créé avec succès');
                    markIfNeeded(actionsApi.data?.notes, actionsApi.data?.slipNumber || '');
                    resetForm();
                    loadDepositSlips();
                    setActiveIndex(1);
                    break;
                case 'complete':
                    showToast('success', 'Succès', 'Dépôt validé avec succès');
                    loadDepositSlips();
                    break;
                case 'cancel':
                    showToast('success', 'Succès', 'Bordereau annulé');
                    setCancelDialog(false);
                    loadDepositSlips();
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Bordereau supprimé');
                    loadDepositSlips();
                    break;
            }
        }
        if (actionsApi.error) {
            showToast('error', 'Erreur', actionsApi.error.message || 'Une erreur est survenue');
        }
    }, [actionsApi.data, actionsApi.error, actionsApi.callType]);

    // Handle caisses data + auto-detect user's caisse
    useEffect(() => {
        if (caissesApi.data && caissesApi.callType === 'loadCaisses') {
            const allData = Array.isArray(caissesApi.data) ? caissesApi.data : [];
            try {
                const appUserCookie = Cookies.get('appUser');
                if (appUserCookie) {
                    const appUser = JSON.parse(appUserCookie);
                    const roleName = (appUser.roleName || '').toLowerCase();
                    const isCaissier = roleName.includes('caiss');
                    const isChefAgence = roleName.includes('chef');
                    const auths: string[] = appUser.authorities || [];
                    const isSuperAdmin = auths.includes('SUPER_ADMIN') || auths.includes('ROLE_SUPER_ADMIN');
                    const canViewAll = auths.includes('VIEW_ALL_BRANCHES') || auths.includes('ROLE_VIEW_ALL_BRANCHES');

                    let filteredData = allData;
                    let userCaisse = null;

                    if (isCaissier && !isChefAgence && !isSuperAdmin && !canViewAll) {
                        // Caissier: only show their own GUICHET caisse (never AGENCE/CHEF_AGENCE/SIEGE)
                        const isGuichet = (c: any) =>
                            c.typeCaisse !== 'CHEF_AGENCE' && c.typeCaisse !== 'AGENCE' && c.typeCaisse !== 'SIEGE';
                        // Priority 1: Match by agentId (most precise - caisse assigned to this user)
                        if (appUser.id) {
                            userCaisse = allData.find((c: any) =>
                                c.agentId && Number(c.agentId) === Number(appUser.id) && isGuichet(c));
                        }
                        // Priority 2: Match by agentName
                        if (!userCaisse) {
                            const userName = `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim();
                            userCaisse = allData.find((c: any) =>
                                c.agentName && c.agentName.toLowerCase() === userName.toLowerCase() && isGuichet(c));
                        }
                        // Priority 3: Match by compteComptable (fallback, exclude parent types)
                        if (!userCaisse && appUser.compteComptable) {
                            userCaisse = allData.find((c: any) =>
                                c.compteComptable === appUser.compteComptable && isGuichet(c));
                        }
                        filteredData = userCaisse ? [userCaisse] : [];
                    } else {
                        // Chef d'Agence / Admin / VIEW_ALL_BRANCHES: show all loaded caisses
                        // Auto-detect their own caisse
                        if (appUser.id) {
                            userCaisse = allData.find((c: any) => c.agentId && Number(c.agentId) === Number(appUser.id));
                        }
                        if (!userCaisse && appUser.compteComptable) {
                            userCaisse = allData.find((c: any) => c.compteComptable === appUser.compteComptable);
                        }
                        if (!userCaisse) {
                            const userName = `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim();
                            userCaisse = allData.find((c: any) => c.agentName && c.agentName.toLowerCase() === userName.toLowerCase());
                        }
                    }

                    setCaisses(filteredData);

                    if (userCaisse) {
                        setSelectedCaisseId(userCaisse.caisseId);
                        setDepositSlip(prev => ({
                            ...prev,
                            caisseId: userCaisse.caisseId,
                            branchId: userCaisse.branchId ? Number(userCaisse.branchId) : prev.branchId
                        }));
                        caissesApi.fetchData(null, 'GET', `${CAISSES_URL}/agency-status/${userCaisse.caisseId}`, 'agencyStatus');
                    }
                } else {
                    setCaisses(allData);
                }
            } catch (e) {
                setCaisses(allData);
            }
        }
        // Handle agency status response
        if (caissesApi.data && caissesApi.callType === 'agencyStatus') {
            setAgencyOpen((caissesApi.data as any).agencyOpen !== false);
        }
    }, [caissesApi.data, caissesApi.callType]);

    const loadReferenceData = () => {
        clientsApi.fetchData(null, 'GET', `${CLIENTS_URL}/findall`, 'loadClients');
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        currenciesApi.fetchData(null, 'GET', `${CURRENCIES_URL}/findall`, 'loadCurrencies');
        savingsApi.fetchData(null, 'GET', `${SAVINGS_URL}/findallactive`, 'loadSavingsAccounts');
        // Filter caisses by branch unless user has VIEW_ALL_BRANCHES or SUPER_ADMIN authority
        let userBranchId = null;
        let canViewAll = false;
        try {
            const appUserCookie = Cookies.get('appUser');
            if (appUserCookie) {
                const appUser = JSON.parse(appUserCookie);
                userBranchId = appUser.branchId;
                const auths: string[] = appUser.authorities || [];
                canViewAll = auths.includes('VIEW_ALL_BRANCHES') || auths.includes('ROLE_VIEW_ALL_BRANCHES')
                    || auths.includes('SUPER_ADMIN') || auths.includes('ROLE_SUPER_ADMIN');
            }
        } catch (e) { /* ignore */ }
        if (userBranchId && !canViewAll) {
            caissesApi.fetchData(null, 'GET', `${CAISSES_URL}/findbybranch/${userBranchId}`, 'loadCaisses');
        } else {
            caissesApi.fetchData(null, 'GET', `${CAISSES_URL}/findactive`, 'loadCaisses');
        }
    };

    const loadDepositSlips = () => {
        setLoading(true);
        slipsApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadSlips');
    };

    // When savings account is selected, auto-populate the client
    const handleSavingsAccountChange = (accountId: number) => {
        if (accountId) {
            const selectedAccount = savingsAccounts.find(acc => acc.id === accountId);
            if (selectedAccount && selectedAccount.client) {
                // Auto-set the client from the selected savings account
                setDepositSlip(prev => ({
                    ...prev,
                    savingsAccountId: accountId,
                    clientId: selectedAccount.client.id
                }));
            }
        }
    };

    // Load savings accounts for a specific client (used in view mode)
    const loadSavingsAccountsByClient = (clientId: number) => {
        savingsApi.fetchData(null, 'GET', `${SAVINGS_URL}/findactivebyclient/${clientId}`, 'loadSavingsAccounts');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDepositSlip(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setDepositSlip(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setDepositSlip(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : null
        }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setDepositSlip(prev => ({ ...prev, [name]: value || 0 }));
    };

    const handleDenominationsChange = (denominations: CashDenomination[], total: number) => {
        setDepositSlip(prev => ({
            ...prev,
            cashDenominations: denominations,
            totalAmount: total
        }));
    };

    const validateForm = (): boolean => {
        if (!depositSlip.clientId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un client');
            return false;
        }
        if (!depositSlip.savingsAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un compte');
            return false;
        }
        if (!depositSlip.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        if (!depositSlip.currencyId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une devise');
            return false;
        }
        if (depositSlip.totalAmount < 500) {
            showToast('warn', 'Attention', 'Le montant minimum de dépôt est de 500 FBU');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const slipData = {
            ...depositSlip,
            caisseId: selectedCaisseId,
            userAction: getCurrentUser()
        };
        actionsApi.fetchData(slipData, 'POST', `${BASE_URL}/new`, 'create');
    };

    const resetForm = () => {
        setDepositSlip(new DepositSlipClass());
        setSavingsAccounts([]);
    };

    const viewSlip = (rowData: DepositSlip) => {
        // Extract IDs from nested objects for proper dropdown display
        const clientId = rowData.clientId || (rowData.client?.id);
        const branchId = rowData.branchId || (rowData.branch?.id);
        const savingsAccountId = rowData.savingsAccountId;
        const currencyId = rowData.currencyId || (rowData.currency?.id);

        const slipWithIds = {
            ...rowData,
            clientId: clientId,
            branchId: branchId,
            savingsAccountId: savingsAccountId,
            currencyId: currencyId
        };

        setSelectedSlip(slipWithIds);
        // Load savings accounts for this client when viewing details
        if (clientId) {
            loadSavingsAccountsByClient(clientId);
        }
        setViewDialog(true);
    };

    const completeDeposit = (rowData: DepositSlip) => {
        confirmDialog({
            message: `Confirmer le dépôt de ${formatCurrency(rowData.totalAmount)} sur le compte ?`,
            header: 'Valider le Dépôt',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, valider',
            rejectLabel: 'Annuler',
            accept: () => {
                actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/complete/${rowData.id}`, 'complete');
            }
        });
    };

    const openCancelDialog = (rowData: DepositSlip) => {
        setSelectedSlip(rowData);
        setCancellationReason('');
        setCancelDialog(true);
    };

    const handleCancel = () => {
        if (selectedSlip && cancellationReason) {
            actionsApi.fetchData(
                { cancellationReason, userAction: getCurrentUser() },
                'POST',
                `${BASE_URL}/cancel/${selectedSlip.id}`,
                'cancel'
            );
        }
    };

    const confirmDelete = (rowData: DepositSlip) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le bordereau "${rowData.slipNumber}" ?`,
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const statusBodyTemplate = (rowData: DepositSlip) => {
        let severity: 'success' | 'info' | 'warning' | 'danger' = 'info';
        let label = rowData.status;

        switch (rowData.status) {
            case DepositSlipStatus.PENDING:
                severity = 'warning';
                label = 'En attente';
                break;
            case DepositSlipStatus.COMPLETED:
                severity = 'success';
                label = 'Validé';
                break;
            case DepositSlipStatus.CANCELLED:
                severity = 'danger';
                label = 'Annulé';
                break;
        }

        return (
            <span className="flex align-items-center flex-wrap">
                <Tag value={label} severity={severity} />
                {rowData.status === DepositSlipStatus.CANCELLED && (
                    <CancellationRefBadge text={(rowData as any).cancellationReason} />
                )}
                <CancellationRefBadge text={(rowData as any).notes} />
            </span>
        );
    };

    // Open print dialog for validated deposits only
    const openPrintDialog = (rowData: DepositSlip) => {
        if (rowData.status !== DepositSlipStatus.COMPLETED) {
            showToast('warn', 'Attention', 'Seuls les dépôts validés peuvent être imprimés');
            return;
        }
        // Resolve account number from savingsAccounts list
        const account = savingsAccounts.find(a => a.id === rowData.savingsAccountId);
        const enriched = { ...rowData, accountNumber: account?.accountNumber || rowData.savingsAccountId };
        setSelectedSlip(enriched);
        setPrintDialog(true);
    };

    // Handle print
    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML.replace(
                /src="\/layout\//g,
                `src="${window.location.origin}/layout/`
            );
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Bordereau de Dépôt - ${selectedSlip?.slipNumber}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: Arial, sans-serif; padding: 15mm; }
                            @page { margin: 15mm; }
                            @media print {
                                body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    const actionsBodyTemplate = (rowData: DepositSlip) => {
        const isPending = rowData.status === DepositSlipStatus.PENDING;
        const isCompleted = rowData.status === DepositSlipStatus.COMPLETED;
        return (
            <div className="flex gap-1 flex-wrap">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewSlip(rowData)}
                    tooltip="Voir"
                />
                {isPending && can('EPARGNE_DEPOSIT_COMPLETE') && (
                    <Button
                        icon="pi pi-check"
                        className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => completeDeposit(rowData)}
                        tooltip="Valider"
                    />
                )}
                {isPending && can('EPARGNE_DEPOSIT_CANCEL') && (
                    <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => openCancelDialog(rowData)}
                        tooltip="Annuler"
                    />
                )}
                <Button
                    icon="pi pi-print"
                    className={`p-button-rounded p-button-sm ${isCompleted ? 'p-button-secondary' : 'p-button-secondary p-button-outlined'}`}
                    onClick={() => openPrintDialog(rowData)}
                    tooltip={isCompleted ? "Imprimer le reçu" : "Validez d'abord le dépôt"}
                    disabled={!isCompleted}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Bordereaux de Dépôt</h5>
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
                <i className="pi pi-file mr-2"></i>
                Opération de Dépôt
            </h4>

            <div className="surface-100 p-3 border-round mb-4">
                <div className="grid">
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span><strong>Dépôt minimum:</strong> 500 FBU</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span><strong>Solde minimum:</strong> 1 000 FBU</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span><strong>Rémunération:</strong> 2% à 4% annuel</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-green-500"></i>
                            <span><strong>Frais:</strong> Gratuit</span>
                        </div>
                    </div>
                </div>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Dépôt" leftIcon="pi pi-plus mr-2">
                    <DepositSlipForm
                        depositSlip={depositSlip}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleDateChange={handleDateChange}
                        handleNumberChange={handleNumberChange}
                        onDenominationsChange={handleDenominationsChange}
                        clients={clients}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        currencies={currencies}
                        onSavingsAccountChange={handleSavingsAccountChange}
                        branchLocked={!!selectedCaisseId}
                    />
                    {/* Agency closed banner */}
                    {!agencyOpen && (
                        <div className="p-3 mt-3 border-round bg-red-50 border-red-200" style={{ border: '1px solid' }}>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-ban text-red-500 text-xl" />
                                <div>
                                    <div className="font-bold text-red-700">Operations bloquees</div>
                                    <div className="text-red-600 text-sm">
                                        La journee n'est pas encore ouverte par le chef d'agence. Aucun depot ne peut etre enregistre.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Caisse selection */}
                    <div className="grid mt-3">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="caisseId" className="font-medium">Caisse du Guichetier</label>
                                <Dropdown
                                    id="caisseId"
                                    value={selectedCaisseId}
                                    options={caisses.filter((c: any) => c.status === 'OPEN')}
                                    optionLabel="libelle"
                                    optionValue="caisseId"
                                    onChange={(e) => {
                                        setSelectedCaisseId(e.value);
                                        setDepositSlip(prev => ({ ...prev, caisseId: e.value }));
                                    }}
                                    placeholder="Sélectionner la caisse"
                                    className="w-full"
                                    filter
                                    showClear
                                />
                                {selectedCaisseId && (
                                    <small className="text-green-500">
                                        <i className="pi pi-check-circle mr-1"></i>
                                        Caisse sélectionnée - le solde sera mis à jour automatiquement
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button
                            label="Enregistrer le Dépôt"
                            icon="pi pi-save"
                            onClick={handleSubmit}
                            className="p-button-success"
                            disabled={depositSlip.totalAmount < 500 || !can('EPARGNE_DEPOSIT_CREATE') || !agencyOpen}
                        />
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={resetForm}
                            className="p-button-secondary"
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Dépôts" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={depositSlips}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun bordereau trouvé"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="depositDate"
                        sortOrder={-1}
                    >
                        <Column field="slipNumber" header="N° Bordereau" sortable />
                        <Column
                            field="client"
                            header="Client"
                            sortable
                            body={(row) => getClientDisplayName(row.client)}
                        />
                        <Column field="depositDate" header="Date" sortable />
                        <Column
                            field="totalAmount"
                            header="Montant"
                            sortable
                            body={(row) => formatCurrency(row.totalAmount)}
                        />
                        <Column field="depositorName" header="Déposant" />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '200px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog pour annuler */}
            <Dialog
                header="Annuler le Bordereau"
                visible={cancelDialog}
                style={{ width: '450px' }}
                onHide={() => setCancelDialog(false)}
                footer={
                    <div>
                        <Button label="Fermer" icon="pi pi-times" onClick={() => setCancelDialog(false)} className="p-button-text" />
                        <Button
                            label="Annuler le Dépôt"
                            icon="pi pi-ban"
                            onClick={handleCancel}
                            className="p-button-danger"
                            disabled={!cancellationReason}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-500 mb-3">
                        Bordereau: <strong>{selectedSlip?.slipNumber}</strong><br />
                        Montant: <strong>{formatCurrency(selectedSlip?.totalAmount || 0)}</strong>
                    </p>
                    <div className="field">
                        <label htmlFor="cancellationReason" className="font-medium">Motif d'annulation *</label>
                        <InputTextarea
                            id="cancellationReason"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            rows={3}
                            placeholder="Expliquez la raison de l'annulation..."
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog pour voir les détails */}
            <Dialog
                header="Détails du Bordereau"
                visible={viewDialog}
                style={{ width: '800px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedSlip && (
                    <DepositSlipForm
                        depositSlip={selectedSlip}
                        handleChange={() => {}}
                        handleDropdownChange={() => {}}
                        handleDateChange={() => {}}
                        handleNumberChange={() => {}}
                        onDenominationsChange={() => {}}
                        clients={clients}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        currencies={currencies}
                        isViewMode={true}
                    />
                )}
            </Dialog>

            {/* Dialog pour imprimer le reçu */}
            <Dialog
                header="Aperçu du Bordereau de Dépôt"
                visible={printDialog}
                style={{ width: '900px' }}
                onHide={() => setPrintDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Fermer"
                            icon="pi pi-times"
                            onClick={() => setPrintDialog(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Imprimer"
                            icon="pi pi-print"
                            onClick={handlePrint}
                            className="p-button-success"
                        />
                    </div>
                }
            >
                {selectedSlip && (
                    <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                        <PrintableDepositSlip
                            ref={printRef}
                            depositSlip={selectedSlip}
                            companyName=" AGRINOVA MICROFINANCE"
                            companyAddress="Bujumbura, Burundi"
                            companyPhone="+257 22 XX XX XX"
                        />
                    </div>
                )}
            </Dialog>
        </div>
    );
}

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_DEPOSIT_CREATE', 'EPARGNE_DEPOSIT_COMPLETE']}>
            <DepositSlipPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
