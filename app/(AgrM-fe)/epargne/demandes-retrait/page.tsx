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
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Image } from 'primereact/image';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { formatLocalDate } from '@/utils/dateUtils';
import { API_BASE_URL, buildApiUrl } from '@/utils/apiConfig';
import { useMarkCancellationReplaced } from '@/hooks/useMarkCancellationReplaced';
import { WithdrawalRequest, WithdrawalRequestClass, WithdrawalStatus } from './WithdrawalRequest';
import { getClientDisplayName } from '@/utils/clientUtils';
import { ClientType } from '@/app/(AgrM-fe)/moduleCostumerGroup/clients/Client';
import WithdrawalRequestForm from './WithdrawalRequestForm';
import PrintableWithdrawalReceipt from './PrintableWithdrawalReceipt';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';

const BASE_URL = `${API_BASE_URL}/api/epargne/withdrawal-requests`;
const CLIENTS_URL = `${API_BASE_URL}/api/clients`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const CURRENCIES_URL = `${API_BASE_URL}/api/financial-products/reference/currencies`;
const AUTH_LEVELS_URL = `${API_BASE_URL}/api/epargne/withdrawal-authorization-levels`;
const CAISSES_URL = `${API_BASE_URL}/api/comptability/caisses`;
const INTERNAL_ACCOUNTS_URL = `${API_BASE_URL}/api/comptability/internal-accounts`;
const GROUPS_URL = `${API_BASE_URL}/api/solidarity-groups`;

const DENOMINATIONS = [
    { field: 'bill10000', label: 'Billets 10 000 FBu', value: 10000 },
    { field: 'bill5000', label: 'Billets 5 000 FBu', value: 5000 },
    { field: 'bill2000', label: 'Billets 2 000 FBu', value: 2000 },
    { field: 'bill1000', label: 'Billets 1 000 FBu', value: 1000 },
    { field: 'bill500', label: 'Billets 500 FBu', value: 500 },
    { field: 'coin100', label: 'Pieces 100 FBu', value: 100 },
    { field: 'coin50', label: 'Pieces 50 FBu', value: 50 },
    { field: 'coin10', label: 'Pieces 10 FBu', value: 10 },
    { field: 'coin5', label: 'Pieces 5 FBu', value: 5 },
    { field: 'coin1', label: 'Pieces 1 FBu', value: 1 },
];

const formatNumberFBu = (val: number | null | undefined): string => {
    if (val == null) return '0';
    return val.toLocaleString('fr-FR');
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

function WithdrawalRequestPage() {
    const { can } = useAuthorizedAction();
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
    const [caisses, setCaisses] = useState<any[]>([]);
    const [selectedCaisseId, setSelectedCaisseId] = useState<number | null>(null);
    const [selectedAccountGroup, setSelectedAccountGroup] = useState<any>(null);
    const [agencyOpen, setAgencyOpen] = useState<boolean>(true);
    const [isCaissierWithoutCaisse, setIsCaissierWithoutCaisse] = useState(false);
    const [isNotCaissierRole, setIsNotCaissierRole] = useState(false);
    const isCaisseClosed = !!(selectedCaisseId && caisses.find((c: any) => c.caisseId === selectedCaisseId)?.status === 'CLOSED');
    const [isManager, setIsManager] = useState<boolean>(false);
    const [printDialog, setPrintDialog] = useState(false);
    const [periodStart, setPeriodStart] = useState<Date | null>(null);
    const [periodEnd, setPeriodEnd] = useState<Date | null>(null);
    const [viewClientDialog, setViewClientDialog] = useState(false);
    const [clientDetail, setClientDetail] = useState<any>(null);
    const [clientSignatories, setClientSignatories] = useState<any[]>([]);
    const [selectedSignatory, setSelectedSignatory] = useState<any>(null);
    const [signatoryDetailDialog, setSignatoryDetailDialog] = useState(false);
    const [viewGroupDialog, setViewGroupDialog] = useState(false);
    const [groupMembers, setGroupMembers] = useState<any[]>([]);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [memberDetailDialog, setMemberDetailDialog] = useState(false);
    const [memberDocuments, setMemberDocuments] = useState<any[]>([]);
    const [deliveredCheckbooks, setDeliveredCheckbooks] = useState<any[]>([]);
    const [chequierValidation, setChequierValidation] = useState<'valid' | 'invalid' | 'checking' | null>(null);
    const [chequierValidationMessage, setChequierValidationMessage] = useState<string>('');
    const [recuValidation, setRecuValidation] = useState<'valid' | 'invalid' | 'checking' | null>(null);
    const [recuValidationMessage, setRecuValidationMessage] = useState<string>('');
    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);
    // Disburse billetage dialog
    const [disburseBilletageVisible, setDisburseBilletageVisible] = useState(false);
    const [disburseBilletage, setDisburseBilletage] = useState<Record<string, number>>({});
    const [disburseRequestId, setDisburseRequestId] = useState<number | null>(null);
    const [disburseAmount, setDisburseAmount] = useState<number>(0);
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Separate hook instances for each data type to avoid race conditions
    const clientsApi = useConsumApi('');
    const branchesApi = useConsumApi('');
    const currenciesApi = useConsumApi('');
    const savingsApi = useConsumApi('');
    const authLevelsApi = useConsumApi('');
    const requestsApi = useConsumApi('');
    const actionsApi = useConsumApi('');
    const caissesApi = useConsumApi('');
    const { markIfNeeded } = useMarkCancellationReplaced();
    const clientDetailApi = useConsumApi('');
    const checkbookApi = useConsumApi('');
    const internalAccountsApi = useConsumApi('');
    const receiptSeriesApi = useConsumApi('');
    const groupMembersApi = useConsumApi('');
    const memberDocumentsApi = useConsumApi('');
    const clientSignatoriesApi = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadRequests();
        // Block non-caissier roles from creating withdrawals
        try {
            const appUser = JSON.parse(Cookies.get('appUser') || '{}');
            const roleName = (appUser.roleName || '').toLowerCase();
            setIsNotCaissierRole(!roleName.includes('caiss'));
        } catch (e) {}
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

    // Handle savings accounts data (exclude BLOCKED - retrait interdit; TERM_DEPOSIT autorisé)
    useEffect(() => {
        if (savingsApi.data) {
            const data = Array.isArray(savingsApi.data) ? savingsApi.data : [];
            setSavingsAccounts(data.filter((a: any) => a.accountType !== 'BLOCKED'));
        }
        if (savingsApi.error) {
            showToast('error', 'Erreur', savingsApi.error.message || 'Erreur lors du chargement des comptes');
        }
    }, [savingsApi.data, savingsApi.error]);

    // Handle authorization levels data (silently ignore Forbidden for caissiers who lack EPARGNE_SETTINGS)
    useEffect(() => {
        if (authLevelsApi.data) {
            const data = authLevelsApi.data;
            setAuthorizationLevels(Array.isArray(data) ? data : []);
        }
        if (authLevelsApi.error) {
            // Silently ignore 403 Forbidden for caissiers who lack EPARGNE_SETTINGS
            if (authLevelsApi.error.status !== 403 && authLevelsApi.error.status !== 0) {
                showToast('error', 'Erreur', authLevelsApi.error.message || 'Erreur lors du chargement des niveaux');
            }
        }
    }, [authLevelsApi.data, authLevelsApi.error]);

    // Handle requests data — filter by userAction for caissiers, show all for chef d'agence/admin
    useEffect(() => {
        if (requestsApi.data) {
            let data: WithdrawalRequest[] = Array.isArray(requestsApi.data) ? requestsApi.data : requestsApi.data.content || [];
            if (selectedCaisseId && !isManager) {
                const currentUser = getCurrentUser();
                if (currentUser && currentUser !== 'Unknown') {
                    // Also keep MANAGER_APPROVED requests from this caisse — after manager approval
                    // userAction changes to the manager's name, so the caissier would lose visibility
                    data = data.filter((r: any) =>
                        r.userAction === currentUser ||
                        (r.status === 'MANAGER_APPROVED' && r.caisseId === selectedCaisseId)
                    );
                } else {
                    data = data.filter((r: any) => r.caisseId === selectedCaisseId);
                }
            }
            setRequests(data);
            setLoading(false);
        }
        if (requestsApi.error) {
            showToast('error', 'Erreur', requestsApi.error.message || 'Erreur lors du chargement des demandes');
            setLoading(false);
        }
    }, [requestsApi.data, requestsApi.error, selectedCaisseId, isManager]);

    // Derive pending requests from all requests — show all that are not DISBURSED, REJECTED, or CANCELLED
    useEffect(() => {
        const notCompleted = requests.filter(
            (r: WithdrawalRequest) => !['DISBURSED', 'REJECTED', 'CANCELLED'].includes(r.status)
        );
        setPendingRequests(notCompleted);
    }, [requests]);

    // Handle actions (create, verify, disburse, etc.)
    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Demande de retrait créée avec succès');
                    markIfNeeded(actionsApi.data?.notes, actionsApi.data?.requestNumber || '');
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

                    setIsManager(isChefAgence || isSuperAdmin || canViewAll);

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
                        // Priority 4: Match by codeCaisse (user management stores caisse code in compteComptable)
                        if (!userCaisse && appUser.compteComptable) {
                            userCaisse = allData.find((c: any) =>
                                c.codeCaisse === appUser.compteComptable && isGuichet(c));
                        }
                        // Priority 5: If only one GUICHET caisse in branch, auto-assign (handles stale cookie)
                        if (!userCaisse) {
                            const guichetCaisses = allData.filter(isGuichet);
                            if (guichetCaisses.length === 1) {
                                userCaisse = guichetCaisses[0];
                            }
                        }
                        filteredData = userCaisse ? [userCaisse] : [];
                    } else {
                        // Chef d'Agence / Admin / VIEW_ALL_BRANCHES: show all loaded caisses
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
                    setIsCaissierWithoutCaisse(isCaissier && !isChefAgence && !isSuperAdmin && !canViewAll && !userCaisse);

                    if (userCaisse) {
                        setSelectedCaisseId(userCaisse.caisseId);
                        setRequest(prev => ({
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

    // Handle client detail API response
    useEffect(() => {
        if (clientDetailApi.data && clientDetailApi.callType === 'viewClientById') {
            const client = clientDetailApi.data;
            setClientDetail(client);
            setViewClientDialog(true);
            // Fetch signatory members separately for BUSINESS clients
            if (client.clientType === 'BUSINESS' && client.id) {
                setClientSignatories([]);
                clientSignatoriesApi.fetchData(null, 'GET', `${CLIENTS_URL}/${client.id}/signatory-members/findall`, 'loadSignatories');
            }
        }
    }, [clientDetailApi.data, clientDetailApi.callType]);

    // Handle client signatories API response
    useEffect(() => {
        if (clientSignatoriesApi.data && clientSignatoriesApi.callType === 'loadSignatories') {
            setClientSignatories(Array.isArray(clientSignatoriesApi.data) ? clientSignatoriesApi.data : []);
        }
        if (clientSignatoriesApi.error) {
            setClientSignatories([]);
        }
    }, [clientSignatoriesApi.data, clientSignatoriesApi.error, clientSignatoriesApi.callType]);

    // Handle group members API response
    useEffect(() => {
        if (groupMembersApi.data && groupMembersApi.callType === 'loadGroupMembers') {
            setGroupMembers(Array.isArray(groupMembersApi.data) ? groupMembersApi.data : []);
        }
        if (groupMembersApi.error) {
            setGroupMembers([]);
        }
    }, [groupMembersApi.data, groupMembersApi.error, groupMembersApi.callType]);

    // Handle member documents API response
    useEffect(() => {
        if (memberDocumentsApi.data && memberDocumentsApi.callType === 'loadMemberDocs') {
            setMemberDocuments(Array.isArray(memberDocumentsApi.data) ? memberDocumentsApi.data : []);
        }
        if (memberDocumentsApi.error) {
            setMemberDocuments([]);
        }
    }, [memberDocumentsApi.data, memberDocumentsApi.error, memberDocumentsApi.callType]);

    // Handle checkbook API responses (load + validate)
    useEffect(() => {
        if (checkbookApi.data && checkbookApi.callType === 'loadCheckbooks') {
            const data = Array.isArray(checkbookApi.data) ? checkbookApi.data : [];
            const delivered = data.filter((cb: any) => cb.status === 'DELIVERED');
            setDeliveredCheckbooks(delivered);
        }
        if (checkbookApi.data && checkbookApi.callType === 'validateCheck') {
            const result = checkbookApi.data as any;
            setChequierValidation(result.valid ? 'valid' : 'invalid');
            setChequierValidationMessage(result.reason || '');
        }
        if (checkbookApi.error && checkbookApi.callType === 'validateCheck') {
            setChequierValidation('invalid');
            setChequierValidationMessage('Erreur lors de la vérification du chèque');
        }
    }, [checkbookApi.data, checkbookApi.callType, checkbookApi.error]);

    // Handle receipt series validation response
    useEffect(() => {
        if (receiptSeriesApi.data && receiptSeriesApi.callType === 'validateRecu') {
            const result = receiptSeriesApi.data as any;
            setRecuValidation(result.valid ? 'valid' : 'invalid');
            setRecuValidationMessage(result.reason || '');
        }
        if (receiptSeriesApi.error && receiptSeriesApi.callType === 'validateRecu') {
            setRecuValidation('invalid');
            setRecuValidationMessage('Erreur lors de la vérification du reçu');
        }
    }, [receiptSeriesApi.data, receiptSeriesApi.callType, receiptSeriesApi.error]);

    // Handle internal accounts data
    useEffect(() => {
        if (internalAccountsApi.data) {
            setInternalAccounts(Array.isArray(internalAccountsApi.data) ? internalAccountsApi.data : []);
        }
    }, [internalAccountsApi.data]);

    const viewClientDetails = (clientId: number) => {
        if (clientId) {
            clientDetailApi.fetchData(null, 'GET', `${CLIENTS_URL}/findbyid/${clientId}`, 'viewClientById');
        }
    };

    const viewGroupDetails = () => {
        if (selectedAccountGroup) {
            setGroupMembers([]);
            setViewGroupDialog(true);
            groupMembersApi.fetchData(null, 'GET', `${GROUPS_URL}/${selectedAccountGroup.id}/members`, 'loadGroupMembers');
        }
    };

    const loadReferenceData = () => {
        clientsApi.fetchData(null, 'GET', `${CLIENTS_URL}/findall`, 'loadClients');
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        currenciesApi.fetchData(null, 'GET', `${CURRENCIES_URL}/findall`, 'loadCurrencies');
        authLevelsApi.fetchData(null, 'GET', `${AUTH_LEVELS_URL}/findall`, 'loadAuthLevels');
        savingsApi.fetchData(null, 'GET', `${SAVINGS_URL}/findallactive`, 'loadSavingsAccounts');
        internalAccountsApi.fetchData(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findactive`, 'loadInternalAccounts');
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

    const loadRequests = () => {
        setLoading(true);
        requestsApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadRequests');
    };

    // When savings account is selected, auto-populate the client and load checkbooks
    const handleSavingsAccountChange = (accountId: number) => {
        if (accountId) {
            const selectedAccount = savingsAccounts.find(acc => acc.id === accountId);
            if (selectedAccount) {
                setAccountBalance(selectedAccount.currentBalance || 0);
                if (selectedAccount.solidarityGroup) {
                    setSelectedAccountGroup(selectedAccount.solidarityGroup);
                    setRequest(prev => ({
                        ...prev,
                        savingsAccountId: accountId,
                        clientId: undefined
                    }));
                } else if (selectedAccount.client) {
                    setSelectedAccountGroup(null);
                    setRequest(prev => ({
                        ...prev,
                        savingsAccountId: accountId,
                        clientId: selectedAccount.client.id
                    }));
                } else {
                    setSelectedAccountGroup(null);
                }
            }
            // Load checkbooks for this account to validate chequier number
            setDeliveredCheckbooks([]);
            setChequierValidation(null);
            setChequierValidationMessage('');
            checkbookApi.fetchData(null, 'GET', `${API_BASE_URL}/api/epargne/checkbook-orders/findbyaccount/${accountId}`, 'loadCheckbooks');
        }
    };

    const handleNumeroCHequierBlur = (numero: string) => {
        if (!numero.trim()) {
            setChequierValidation(null);
            setChequierValidationMessage('');
            return;
        }
        if (!request.savingsAccountId) {
            setChequierValidation(null);
            return;
        }
        setChequierValidation('checking');
        setChequierValidationMessage('');
        checkbookApi.fetchData(
            null,
            'GET',
            `${API_BASE_URL}/api/epargne/checkbook-orders/validate-check?savingsAccountId=${request.savingsAccountId}&checkNumber=${encodeURIComponent(numero.trim())}`,
            'validateCheck'
        );
    };

    const handleNumeroRecuBlur = (numero: string) => {
        if (!numero.trim()) {
            setRecuValidation(null);
            setRecuValidationMessage('');
            return;
        }
        const branchId = request.branchId;
        if (!branchId) {
            setRecuValidation('invalid');
            setRecuValidationMessage('Veuillez d\'abord sélectionner une agence');
            return;
        }
        setRecuValidation('checking');
        setRecuValidationMessage('');
        receiptSeriesApi.fetchData(
            null,
            'GET',
            `${API_BASE_URL}/api/epargne/receipt-series/validate?branchId=${branchId}&receiptNumber=${encodeURIComponent(numero.trim())}`,
            'validateRecu'
        );
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
        if (name === 'moyenRetrait') {
            setChequierValidation(null);
            setChequierValidationMessage('');
            setRecuValidation(null);
            setRecuValidationMessage('');
        }
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setRequest(prev => ({
            ...prev,
            [name]: value ? formatLocalDate(value) : null
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

    const handleDenominationsChange = (denominations: any[], total: number) => {
        setRequest(prev => ({
            ...prev,
            cashDenominations: denominations,
            totalAmount: total
        }));
    };

    const validateForm = (): boolean => {
        if (!request.savingsAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un compte');
            return false;
        }
        if (!request.clientId && !selectedAccountGroup) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un client');
            return false;
        }
        if (!request.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        const selectedAccForValidation = savingsAccounts.find((a: any) => a.id === request.savingsAccountId);
        const validationCurrency = selectedAccForValidation?.currency?.code || 'FBU';
        const isBIF = validationCurrency === 'FBU' || validationCurrency === 'BIF';
        const minBalance = isBIF ? 2000 : 5;
        const minWithdrawal = minBalance + 1;
        if (request.requestedAmount <= minBalance) {
            showToast('warn', 'Attention', `Le montant de retrait doit être supérieur à ${minBalance} ${validationCurrency}`);
            return false;
        }
        const recuFee = request.moyenRetrait === 'RECU' ? (request.recuFeeAmount ?? 1000) : 0;
        if (request.requestedAmount + recuFee > accountBalance - minBalance) {
            const msg = request.moyenRetrait === 'RECU'
                ? `Solde insuffisant. Montant (${request.requestedAmount} ${validationCurrency}) + commission (${recuFee} FBU) dépasse le solde disponible (solde minimum à conserver: ${minBalance} ${validationCurrency})`
                : `Solde insuffisant (solde minimum à conserver: ${minBalance} ${validationCurrency})`;
            showToast('warn', 'Attention', msg);
            return false;
        }
        if (!request.totalAmount || request.totalAmount <= 0) {
            showToast('warn', 'Attention', 'Veuillez saisir le billetage (décompte des billets)');
            return false;
        }
        if (Math.abs((request.totalAmount || 0) - request.requestedAmount) > 0.01) {
            showToast('warn', 'Attention', `Le total du billetage (${formatNumberFBu(request.totalAmount || 0)} ${validationCurrency}) ne correspond pas au montant demandé (${formatNumberFBu(request.requestedAmount)} ${validationCurrency})`);
            return false;
        }
        if (request.moyenRetrait === 'CHEQUIER') {
            if (!request.numeroChequier?.trim()) {
                showToast('warn', 'Attention', 'Veuillez saisir le numéro de chéquier');
                return false;
            }
            if (chequierValidation !== 'valid') {
                showToast('warn', 'Attention', 'Le numéro de chéquier est invalide ou n\'a pas été vérifié');
                return false;
            }
        }
        if (request.moyenRetrait === 'RECU') {
            if (!request.numeroRecu?.trim()) {
                showToast('warn', 'Attention', 'Veuillez saisir le numéro de reçu');
                return false;
            }
            if (recuValidation !== 'valid') {
                showToast('warn', 'Attention', 'Le numéro de reçu est invalide ou n\'a pas été vérifié. Veuillez saisir un numéro appartenant à une série active de cette agence.');
                return false;
            }
            if (!request.recuInternalAccountId) {
                showToast('warn', 'Attention', 'Veuillez sélectionner le compte interne de règlement');
                return false;
            }
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
            caisseId: selectedCaisseId,
            userAction: getCurrentUser()
        };
        actionsApi.fetchData(requestData, 'POST', `${BASE_URL}/new`, 'create');
    };

    const resetForm = () => {
        setRequest(new WithdrawalRequestClass());
        setAccountBalance(0);
        setDeliveredCheckbooks([]);
        setChequierValidation(null);
        setChequierValidationMessage('');
        setRecuValidation(null);
        setRecuValidationMessage('');
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
            message: `Approuver le retrait de ${formatCurrency(rowData.requestedAmount, rowData.currency?.code)} ?`,
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
        setDisburseRequestId(rowData.id ?? null);
        setDisburseAmount(rowData.requestedAmount || 0);
        setDisburseBilletage({});
        setDisburseBilletageVisible(true);
    };

    const calculateDisburseBilletageTotal = (): number => {
        return DENOMINATIONS.reduce((sum, d) => sum + (disburseBilletage[d.field] || 0) * d.value, 0);
    };

    const handleDisburseBilletageChange = (field: string, value: number) => {
        setDisburseBilletage(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitDisburse = () => {
        const billetageTotal = calculateDisburseBilletageTotal();
        if (billetageTotal <= 0) {
            showToast('error', 'Billetage requis', 'Veuillez saisir le billetage (billets a remettre au client).');
            return;
        }
        if (disburseAmount > 0 && Math.abs(billetageTotal - disburseAmount) > 0.01) {
            showToast('error', 'Billetage incorrect', `Le total du billetage (${formatNumberFBu(billetageTotal)} FBu) ne correspond pas au montant du retrait (${formatNumberFBu(disburseAmount)} FBu).`);
            return;
        }
        actionsApi.fetchData(
            { userAction: getCurrentUser(), billetage: disburseBilletage },
            'POST',
            `${BASE_URL}/disburse/${disburseRequestId}`,
            'disburse'
        );
        setDisburseBilletageVisible(false);
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

    // Open print dialog for disbursed withdrawals
    const openPrintDialog = (rowData: WithdrawalRequest) => {
        if (rowData.status !== 'DISBURSED') {
            showToast('warn', 'Attention', 'Seuls les retraits decaisses peuvent etre imprimes');
            return;
        }
        const acc = savingsAccounts.find((a: any) => Number(a.id) === Number(rowData.savingsAccountId));
        setSelectedRequest({ ...rowData, savingsAccount: acc || (rowData as any).savingsAccount } as any);
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
                        <title>Recu de Retrait - ${selectedRequest?.requestNumber}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: Arial, sans-serif; padding: 15mm; }
                            @page { margin: 15mm; size: A4; }
                            @media print {
                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
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

    const formatCurrency = (value: number, currencyCode?: string) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' ' + (currencyCode || 'FBU');
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
            <span className="flex align-items-center flex-wrap">
                <Tag
                    value={labels[rowData.status] || rowData.status}
                    severity={getStatusSeverity(rowData.status)}
                />
                {rowData.status === 'CANCELLED' && (
                    <CancellationRefBadge text={(rowData as any).rejectionReason} />
                )}
                <CancellationRefBadge text={(rowData as any).notes} />
            </span>
        );
    };

    const numeroDocumentBodyTemplate = (rowData: WithdrawalRequest) => {
        const moyen = (rowData as any).moyenRetrait || 'ESPECES';
        if (moyen === 'CHEQUIER') return (rowData as any).numeroChequier || '-';
        if (moyen === 'RECU') return (rowData as any).numeroRecu || '-';
        return '-';
    };

    const moyenRetraitBodyTemplate = (rowData: WithdrawalRequest) => {
        const labels: { [key: string]: { label: string; icon: string } } = {
            CHEQUIER: { label: 'Chéquier', icon: 'pi pi-book' },
            RECU: { label: 'Reçu', icon: 'pi pi-file' },
            ESPECES: { label: 'Espèces', icon: 'pi pi-money-bill' }
        };
        const moyen = (rowData as any).moyenRetrait || 'ESPECES';
        const info = labels[moyen] || labels['ESPECES'];
        return (
            <span className="flex align-items-center gap-1">
                <i className={`${info.icon} text-xs`}></i>
                <span>{info.label}</span>
            </span>
        );
    };

    const actionsBodyTemplate = (rowData: WithdrawalRequest) => {
        const status = rowData.status;
        const canVerifyId = status === 'PENDING' && can('EPARGNE_WITHDRAWAL_VERIFY');
        const canFirstVerify = status === 'ID_VERIFIED' && rowData.dualVerificationRequired && can('EPARGNE_WITHDRAWAL_VERIFY');
        const canSecondVerify = status === 'FIRST_VERIFIED' && can('EPARGNE_WITHDRAWAL_SECOND_VERIFY');
        const canManagerApprove = (status === 'ID_VERIFIED' || status === 'SECOND_VERIFIED') && rowData.requiresManagerApproval && can('EPARGNE_WITHDRAWAL_MANAGER_APPROVE');
        const canDisburse = (status === 'APPROVED' || status === 'MANAGER_APPROVED' ||
            (status === 'ID_VERIFIED' && !rowData.dualVerificationRequired && !rowData.requiresManagerApproval) ||
            (status === 'SECOND_VERIFIED' && !rowData.requiresManagerApproval)) && can('EPARGNE_WITHDRAWAL_DISBURSE');
        const canReject = !['DISBURSED', 'REJECTED', 'CANCELLED'].includes(status) && can('EPARGNE_WITHDRAWAL_REJECT');
        const canCancel = status === 'PENDING' && can('EPARGNE_WITHDRAWAL_REJECT');

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
                <Button
                    icon="pi pi-print"
                    className={`p-button-rounded p-button-sm ${status === 'DISBURSED' ? 'p-button-secondary' : 'p-button-secondary p-button-outlined'}`}
                    onClick={() => openPrintDialog(rowData)}
                    tooltip={status === 'DISBURSED' ? "Imprimer le recu" : "Decaissez d'abord le retrait"}
                    disabled={status !== 'DISBURSED'}
                />
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
                        selectedAccountGroup={selectedAccountGroup}
                        onViewGroupDetails={viewGroupDetails}
                        onAmountChange={handleAmountChange}
                        accountBalance={accountBalance}
                        branchLocked={!!selectedCaisseId}
                        onViewClientDetails={viewClientDetails}
                        onDenominationsChange={handleDenominationsChange}
                        deliveredCheckbooks={deliveredCheckbooks}
                        chequierValidation={chequierValidation}
                        chequierValidationMessage={chequierValidationMessage}
                        onNumeroCHequierBlur={handleNumeroCHequierBlur}
                        recuValidation={recuValidation}
                        recuValidationMessage={recuValidationMessage}
                        onNumeroRecuBlur={handleNumeroRecuBlur}
                        internalAccounts={internalAccounts}
                    />
                    {/* Agency closed banner */}
                    {!agencyOpen && (
                        <div className="p-3 mt-3 border-round bg-red-50 border-red-200" style={{ border: '1px solid' }}>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-ban text-red-500 text-xl" />
                                <div>
                                    <div className="font-bold text-red-700">Operations bloquees</div>
                                    <div className="text-red-600 text-sm">
                                        La journee n'est pas encore ouverte par le chef d'agence. Aucun retrait ne peut etre enregistre.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isNotCaissierRole && (
                        <div className="p-3 mt-3 border-round bg-red-50 border-red-300" style={{ border: '1px solid' }}>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-lock text-red-500 text-xl" />
                                <div>
                                    <div className="font-bold text-red-700">Opération non autorisée</div>
                                    <div className="text-red-600 text-sm">
                                        Seuls les utilisateurs ayant le rôle Caissier avec une caisse assignée peuvent enregistrer des retraits.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isCaissierWithoutCaisse && (
                        <div className="p-3 mt-3 border-round bg-orange-50 border-orange-300" style={{ border: '1px solid' }}>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-exclamation-triangle text-orange-500 text-xl" />
                                <div>
                                    <div className="font-bold text-orange-700">Aucune caisse assignée</div>
                                    <div className="text-orange-600 text-sm">
                                        Votre compte n'est associé à aucune caisse guichetier. Contactez l'administrateur pour assigner votre caisse avant d'enregistrer des retraits.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isCaisseClosed && (
                        <div className="p-3 mt-3 border-round bg-red-50 border-red-200" style={{ border: '1px solid' }}>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-lock text-red-500 text-xl" />
                                <div>
                                    <div className="font-bold text-red-700">Caisse fermée</div>
                                    <div className="text-red-600 text-sm">
                                        La caisse sélectionnée est fermée. Aucune opération ne peut être enregistrée tant que la caisse n'est pas ouverte.
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
                                        setRequest(prev => ({ ...prev, caisseId: e.value }));
                                    }}
                                    placeholder="Sélectionner la caisse"
                                    className="w-full"
                                    filter
                                    showClear
                                />
                                {selectedCaisseId && (
                                    <small className="text-green-500">
                                        <i className="pi pi-check-circle mr-1"></i>
                                        Caisse sélectionnée - le solde sera mis à jour au décaissement
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button
                            label="Soumettre la Demande"
                            icon="pi pi-send"
                            onClick={handleSubmit}
                            className="p-button-success"
                            disabled={request.requestedAmount <= 2000 || !can('EPARGNE_WITHDRAWAL_CREATE') || !agencyOpen || isCaissierWithoutCaisse || isNotCaissierRole || isCaisseClosed}
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
                            header="Client / Groupe"
                            body={(row) => row.solidarityGroup
                                ? (row.solidarityGroup.groupName || row.solidarityGroup.name || '—')
                                : getClientDisplayName(row.client)}
                        />
                        <Column
                            header="N° Compte"
                            body={(row) => {
                                const acc = savingsAccounts.find((a: any) => Number(a.id) === Number(row.savingsAccountId));
                                return acc?.accountNumber || (row as any).savingsAccount?.accountNumber || '-';
                            }}
                        />
                        <Column field="requestDate" header="Date" sortable />
                        <Column
                            field="requestedAmount"
                            header="Montant"
                            body={(row) => formatCurrency(row.requestedAmount, row.currency?.code)}
                            sortable
                        />
                        <Column field="moyenRetrait" header="Moyen Utilisé" body={moyenRetraitBodyTemplate} />
                        <Column header="N° Reçu/Chèque" body={numeroDocumentBodyTemplate} />
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
                            header="Client / Groupe"
                            body={(row) => row.solidarityGroup
                                ? (row.solidarityGroup.groupName || row.solidarityGroup.name || '—')
                                : getClientDisplayName(row.client)}
                        />
                        <Column
                            header="N° Compte"
                            body={(row) => {
                                const acc = savingsAccounts.find((a: any) => Number(a.id) === Number(row.savingsAccountId));
                                return acc?.accountNumber || (row as any).savingsAccount?.accountNumber || '-';
                            }}
                        />
                        <Column field="requestDate" header="Date" sortable />
                        <Column
                            field="requestedAmount"
                            header="Montant"
                            body={(row) => formatCurrency(row.requestedAmount, row.currency?.code)}
                            sortable
                        />
                        <Column field="moyenRetrait" header="Moyen Utilisé" body={moyenRetraitBodyTemplate} sortable />
                        <Column header="N° Reçu/Chèque" body={numeroDocumentBodyTemplate} />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '250px' }} />
                    </DataTable>
                </TabPanel>

                {can('EPARGNE_WITHDRAWAL_VIEW_TODAY') && <TabPanel header="Retraits du Jour" leftIcon="pi pi-calendar mr-2">
                    <DataTable
                        value={requests.filter(r => r.requestDate === formatLocalDate(new Date()))}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun retrait enregistré aujourd'hui"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="requestDate"
                        sortOrder={-1}
                    >
                        <Column field="requestNumber" header="N° Demande" sortable />
                        <Column
                            field="client"
                            header="Client / Groupe"
                            body={(row) => row.solidarityGroup
                                ? (row.solidarityGroup.groupName || row.solidarityGroup.name || '—')
                                : getClientDisplayName(row.client)}
                        />
                        <Column
                            header="N° Compte"
                            body={(row) => {
                                const acc = savingsAccounts.find((a: any) => Number(a.id) === Number(row.savingsAccountId));
                                return acc?.accountNumber || (row as any).savingsAccount?.accountNumber || '-';
                            }}
                        />
                        <Column field="requestDate" header="Date" sortable />
                        <Column
                            field="requestedAmount"
                            header="Montant"
                            body={(row) => formatCurrency(row.requestedAmount, row.currency?.code)}
                            sortable
                        />
                        <Column field="moyenRetrait" header="Moyen Utilisé" body={moyenRetraitBodyTemplate} sortable />
                        <Column header="N° Reçu/Chèque" body={numeroDocumentBodyTemplate} />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '250px' }} />
                    </DataTable>
                </TabPanel>}

                {can('EPARGNE_WITHDRAWAL_VIEW_PERIOD') && <TabPanel header="Mes Retraits par Période" leftIcon="pi pi-filter mr-2">
                    {(() => {
                        const currentUser = getCurrentUser();
                        const filtered = requests.filter(r => {
                            if ((r as any).userAction !== currentUser) return false;
                            if (periodStart && r.requestDate && r.requestDate < formatLocalDate(periodStart)) return false;
                            if (periodEnd && r.requestDate && r.requestDate > formatLocalDate(periodEnd)) return false;
                            return true;
                        });
                        return (
                            <DataTable
                                value={filtered}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={loading}
                                globalFilter={globalFilter}
                                globalFilterFields={['requestNumber', 'client.firstName', 'client.lastName', 'client.businessName', 'depositorName']}
                                emptyMessage="Aucun retrait trouvé pour cette période"
                                stripedRows
                                showGridlines
                                size="small"
                                sortField="requestDate"
                                sortOrder={-1}
                                header={
                                    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0">Mes Retraits</h5>
                                            <small className="text-500">Utilisateur: <strong>{currentUser}</strong> — {filtered.length} demande(s)</small>
                                        </div>
                                        <div className="flex gap-2 align-items-center flex-wrap">
                                            <div className="flex align-items-center gap-1">
                                                <label className="text-sm font-medium">Du:</label>
                                                <Calendar
                                                    value={periodStart}
                                                    onChange={(e) => setPeriodStart(e.value as Date | null)}
                                                    dateFormat="dd/mm/yy"
                                                    placeholder="Date début"
                                                    showButtonBar
                                                    style={{ width: '150px' }}
                                                />
                                            </div>
                                            <div className="flex align-items-center gap-1">
                                                <label className="text-sm font-medium">Au:</label>
                                                <Calendar
                                                    value={periodEnd}
                                                    onChange={(e) => setPeriodEnd(e.value as Date | null)}
                                                    dateFormat="dd/mm/yy"
                                                    placeholder="Date fin"
                                                    showButtonBar
                                                    minDate={periodStart || undefined}
                                                    style={{ width: '150px' }}
                                                />
                                            </div>
                                            <Button
                                                icon="pi pi-times"
                                                className="p-button-secondary p-button-sm p-button-outlined"
                                                onClick={() => { setPeriodStart(null); setPeriodEnd(null); }}
                                                tooltip="Réinitialiser la période"
                                            />
                                            <span className="p-input-icon-left">
                                                <i className="pi pi-search" />
                                                <InputText
                                                    value={globalFilter}
                                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                                    placeholder="Rechercher..."
                                                />
                                            </span>
                                        </div>
                                    </div>
                                }
                            >
                                <Column field="requestNumber" header="N° Demande" sortable />
                                <Column
                                    header="Client / Groupe"
                                    body={(row) => row.solidarityGroup
                                        ? (row.solidarityGroup.groupName || row.solidarityGroup.name || '—')
                                        : getClientDisplayName(row.client)}
                                />
                                <Column
                                    header="N° Compte"
                                    body={(row) => {
                                        const acc = savingsAccounts.find((a: any) => Number(a.id) === Number(row.savingsAccountId));
                                        return acc?.accountNumber || (row as any).savingsAccount?.accountNumber || '-';
                                    }}
                                />
                                <Column field="requestDate" header="Date" sortable />
                                <Column
                                    header="Montant"
                                    sortable sortField="requestedAmount"
                                    body={(row) => formatCurrency(row.requestedAmount, row.currency?.code)}
                                />
                                <Column field="moyenRetrait" header="Moyen Utilisé" body={moyenRetraitBodyTemplate} sortable />
                                <Column header="N° Reçu/Chèque" body={numeroDocumentBodyTemplate} />
                                <Column header="Statut" body={statusBodyTemplate} sortable sortField="status" />
                                <Column header="Actions" body={actionsBodyTemplate} style={{ width: '250px' }} />
                            </DataTable>
                        );
                    })()}
                </TabPanel>}
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
                        Montant: <strong>{formatCurrency(selectedRequest?.requestedAmount || 0, selectedRequest?.currency?.code)}</strong>
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
                    <>
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
                            onViewClientDetails={viewClientDetails}
                            internalAccounts={internalAccounts}
                        />
                    </>
                )}
            </Dialog>

            {/* Dialog pour imprimer le recu */}
            <Dialog
                header="Apercu du Recu de Retrait"
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
                {selectedRequest && (
                    <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                        <PrintableWithdrawalReceipt
                            ref={printRef}
                            withdrawal={selectedRequest}
                            companyName=" AGRINOVA MICROFINANCE"
                            companyAddress="Bujumbura, Burundi"
                            companyPhone="+257 22 69 21 01 93"
                        />
                    </div>
                )}
            </Dialog>

            {/* Dialog pour voir les détails du client */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user text-2xl text-primary"></i>
                        <span>Details du Client</span>
                    </div>
                }
                visible={viewClientDialog}
                style={{ width: '90vw', maxWidth: '1200px' }}
                modal
                onHide={() => setViewClientDialog(false)}
            >
                {clientDetail && (
                    <>
                    <div className="grid">
                        {/* Left Column */}
                        <div className="col-12 md:col-4">
                            <Card className="mb-3">
                                <div className="flex flex-column align-items-center text-center mb-3">
                                    {clientDetail.photoPath ? (
                                        <Image
                                            src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientDetail.photoPath)}`)}
                                            alt="Photo /Fiche du client"
                                            width="150"
                                            height="150"
                                            preview
                                            imageClassName="border-round-xl shadow-2"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Avatar
                                            icon={clientDetail.clientType === ClientType.BUSINESS ? "pi pi-building" : clientDetail.clientType === ClientType.JOINT_ACCOUNT ? "pi pi-users" : "pi pi-user"}
                                            size="xlarge"
                                            shape="circle"
                                            className={clientDetail.clientType === ClientType.BUSINESS ? "bg-green-100 text-green-600" : clientDetail.clientType === ClientType.JOINT_ACCOUNT ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}
                                            style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                                        />
                                    )}
                                    <h4 className="m-0 mt-3">
                                        {clientDetail.clientType === ClientType.JOINT_ACCOUNT
                                            ? `${clientDetail.firstName || ''} ${clientDetail.lastName || ''} & ${clientDetail.secondFirstName || ''} ${clientDetail.secondLastName || ''}`.trim()
                                            : (clientDetail.clientType === ClientType.INDIVIDUAL)
                                                ? `${clientDetail.firstName} ${clientDetail.lastName}`
                                                : clientDetail.businessName}
                                    </h4>
                                    <p className="text-500 m-0">{clientDetail.clientNumber}</p>
                                    <div className="flex gap-2 mt-2">
                                        {clientDetail.clientType === ClientType.INDIVIDUAL && <Tag value="Individuel" severity="info" icon="pi pi-user" />}
                                        {clientDetail.clientType === ClientType.JOINT_ACCOUNT && <Tag value="Compte Conjoint" severity="warning" icon="pi pi-users" />}
                                        {clientDetail.clientType === ClientType.BUSINESS && <Tag value="Entreprise" severity="success" icon="pi pi-building" />}
                                        <Tag
                                            value={clientDetail.status === 'ACTIVE' ? 'Actif' : clientDetail.status === 'PENDING' ? 'En attente' : clientDetail.status === 'SUSPENDED' ? 'Suspendu' : clientDetail.status}
                                            severity={clientDetail.status === 'ACTIVE' ? 'success' : clientDetail.status === 'PENDING' ? 'info' : clientDetail.status === 'SUSPENDED' ? 'warning' : null}
                                        />
                                    </div>
                                </div>
                                <Divider />
                                <div className="flex flex-column gap-2">
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-phone text-primary"></i>
                                        <span className="font-semibold">{clientDetail.phonePrimary || 'N/A'}</span>
                                    </div>
                                    {clientDetail.phoneSecondary && (
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-phone text-500"></i>
                                            <span>{clientDetail.phoneSecondary}</span>
                                        </div>
                                    )}
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-envelope text-primary"></i>
                                        <span>{clientDetail.email || 'N/A'}</span>
                                    </div>
                                </div>
                                {clientDetail.clientType !== ClientType.BUSINESS && clientDetail.signatureImagePath && (
                                    <>
                                        <Divider />
                                        <div>
                                            <p className="text-500 mb-2">Signature</p>
                                            <Image
                                                src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientDetail.signatureImagePath)}`)}
                                                alt="Signature du client"
                                                width="150"
                                                preview
                                            />
                                        </div>
                                    </>
                                )}
                            </Card>
                        </div>

                        {/* Middle Column */}
                        <div className="col-12 md:col-4">
                            {(clientDetail.clientType === ClientType.INDIVIDUAL || clientDetail.clientType === ClientType.JOINT_ACCOUNT) && (
                                <Card title={clientDetail.clientType === ClientType.JOINT_ACCOUNT ? "Titulaire Principal (1ère Personne)" : "Informations Personnelles"} className="mb-3">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Nom complet</span>
                                            <span className="font-semibold">{`${clientDetail.lastName || ''} ${clientDetail.firstName || ''} ${clientDetail.middleName || ''}`.trim() || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Genre</span>
                                            <span className="font-semibold">{clientDetail.gender === 'M' ? 'Masculin' : clientDetail.gender === 'F' ? 'Féminin' : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Date de naissance</span>
                                            <span className="font-semibold">{clientDetail.dateOfBirth ? new Date(clientDetail.dateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Lieu de naissance</span>
                                            <span className="font-semibold">{clientDetail.placeOfBirth || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Nationalité</span>
                                            <span className="font-semibold">{clientDetail.nationality?.name || 'N/A'}</span>
                                        </div>
                                        {clientDetail.clientType === ClientType.INDIVIDUAL && (
                                            <>
                                                <div className="flex justify-content-between">
                                                    <span className="text-500">Etat civil</span>
                                                    <span className="font-semibold">{clientDetail.maritalStatus?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-content-between">
                                                    <span className="text-500">Niveau d'étude</span>
                                                    <span className="font-semibold">{clientDetail.educationLevel?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-content-between">
                                                    <span className="text-500">Type d'habitation</span>
                                                    <span className="font-semibold">{clientDetail.housingType?.name || 'N/A'}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Card>
                            )}

                            {/* Co-titulaire */}
                            {clientDetail.clientType === ClientType.JOINT_ACCOUNT && (
                                <Card title="Co-titulaire (2ème Personne)" className="mb-3" style={{ borderLeft: '4px solid #f97316' }}>
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Nom complet</span>
                                            <span className="font-semibold">{`${clientDetail.secondLastName || ''} ${clientDetail.secondFirstName || ''}`.trim() || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Genre</span>
                                            <span className="font-semibold">{clientDetail.secondGender === 'M' ? 'Masculin' : clientDetail.secondGender === 'F' ? 'Féminin' : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Date de naissance</span>
                                            <span className="font-semibold">{clientDetail.secondDateOfBirth ? new Date(clientDetail.secondDateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Lieu de naissance</span>
                                            <span className="font-semibold">{clientDetail.secondPlaceOfBirth || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Nationalité</span>
                                            <span className="font-semibold">{clientDetail.secondNationality?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Téléphone</span>
                                            <span className="font-semibold">{clientDetail.secondPhonePrimary || 'N/A'}</span>
                                        </div>
                                        <Divider />
                                        <h6 className="m-0 text-primary">Document d'identité</h6>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Type</span>
                                            <span className="font-semibold">{clientDetail.secondIdDocumentType?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Numéro</span>
                                            <span className="font-semibold">{clientDetail.secondIdDocumentNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Date de délivrance</span>
                                            <span className="font-semibold">{clientDetail.secondIdIssueDate ? new Date(clientDetail.secondIdIssueDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Date d'expiration</span>
                                            <span className="font-semibold">{clientDetail.secondIdExpiryDate ? new Date(clientDetail.secondIdExpiryDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Business Info */}
                            {clientDetail.clientType === ClientType.BUSINESS && (
                                <Card title="Informations Entreprise" className="mb-3">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Nom entreprise</span>
                                            <span className="font-semibold">{clientDetail.businessName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Numéro RCCM</span>
                                            <span className="font-semibold">{clientDetail.businessRegistrationNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Type entreprise</span>
                                            <span className="font-semibold">{clientDetail.businessType || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Date de création</span>
                                            <span className="font-semibold">{clientDetail.dateOfIncorporation ? new Date(clientDetail.dateOfIncorporation).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* ID Document */}
                            <Card title="Document d'Identité" className="mb-3">
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Type de document</span>
                                        <span className="font-semibold">{clientDetail.idDocumentType?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Numéro</span>
                                        <span className="font-semibold">{clientDetail.idDocumentNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date de délivrance</span>
                                        <span className="font-semibold">{(clientDetail.idDocumentIssueDate || clientDetail.idIssueDate) ? new Date(clientDetail.idDocumentIssueDate || clientDetail.idIssueDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date d'expiration</span>
                                        <span className="font-semibold">{(clientDetail.idDocumentExpiryDate || clientDetail.idExpiryDate) ? new Date(clientDetail.idDocumentExpiryDate || clientDetail.idExpiryDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Délivré par</span>
                                        <span className="font-semibold">{clientDetail.idDocumentIssuedBy || clientDetail.idIssuePlace || 'N/A'}</span>
                                    </div>
                                    {clientDetail.idDocumentScanPath && (
                                        <div className="mt-2">
                                            <p className="text-500 mb-2">Document scanné</p>
                                            {clientDetail.idDocumentScanPath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientDetail.idDocumentScanPath)}`)}
                                                    alt="Document d'identité"
                                                    width="200"
                                                    preview
                                                    imageClassName="border-round shadow-1"
                                                />
                                            ) : (
                                                <Button
                                                    icon="pi pi-eye"
                                                    label="Voir le document"
                                                    className="p-button-outlined p-button-info p-button-sm"
                                                    onClick={() => window.open(buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientDetail.idDocumentScanPath)}`), '_blank')}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="col-12 md:col-4">
                            {/* Address */}
                            <Card title={clientDetail.clientType === ClientType.JOINT_ACCOUNT ? "Adresse (Titulaire Principal)" : "Adresse"} className="mb-3">
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Province</span>
                                        <span className="font-semibold">{clientDetail.province?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Commune</span>
                                        <span className="font-semibold">{clientDetail.commune?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Zone</span>
                                        <span className="font-semibold">{clientDetail.zone?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Colline</span>
                                        <span className="font-semibold">{clientDetail.colline?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Adresse détaillée</span>
                                        <span className="font-semibold text-right" style={{ maxWidth: '60%' }}>{clientDetail.streetAddress || 'N/A'}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Professional Info */}
                            <Card title={clientDetail.clientType === ClientType.BUSINESS ? "Secteur d'Activité" : "Informations Professionnelles"} className="mb-3">
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Secteur d'activité</span>
                                        <span className="font-semibold">{clientDetail.activitySector?.name || 'N/A'}</span>
                                    </div>
                                    {clientDetail.clientType !== ClientType.BUSINESS && (
                                        <>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Profession</span>
                                                <span className="font-semibold">{clientDetail.profession || clientDetail.occupation || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Employeur</span>
                                                <span className="font-semibold">{clientDetail.employerName || clientDetail.employer || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Revenu mensuel</span>
                                                <span className="font-semibold text-green-600">
                                                    {clientDetail.monthlyIncome?.toLocaleString('fr-BI') || '0'} BIF
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>

                            {/* Assignment */}
                            <Card title="Affectation" className="mb-3">
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Agence</span>
                                        <span className="font-semibold">{clientDetail.branch?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Agent assigné</span>
                                        <span className="font-semibold">{clientDetail.assignedOfficer?.firstName ? `${clientDetail.assignedOfficer.firstName} ${clientDetail.assignedOfficer.lastName}` : 'N/A'}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Notes */}
                            {clientDetail.notes && (
                                <Card title="Notes">
                                    <p className="m-0 text-600">{clientDetail.notes}</p>
                                </Card>
                            )}
                        </div>
                    </div>

                        {/* Signatory Members — for BUSINESS clients */}
                        {clientDetail.clientType === ClientType.BUSINESS && (
                            <div className="mt-3">
                                <Card title={
                                    <div className="flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-id-card text-primary" />
                                            <span>Membres de Signature</span>
                                            {clientSignatoriesApi.loading && <i className="pi pi-spin pi-spinner text-500 text-sm" />}
                                            {!clientSignatoriesApi.loading && (
                                                <Tag value={`${clientSignatories.length} membre(s)`} severity="info" />
                                            )}
                                        </div>
                                    </div>
                                }>
                                    <DataTable
                                        value={clientSignatories}
                                        loading={clientSignatoriesApi.loading}
                                        stripedRows
                                        showGridlines
                                        size="small"
                                        emptyMessage="Aucun membre de signature enregistré"
                                        paginator
                                        rows={5}
                                    >
                                        <Column
                                            header="Photo"
                                            style={{ width: '70px', textAlign: 'center' }}
                                            body={(s: any) => s.photoPath ? (
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(s.photoPath)}`)}
                                                    alt="Photo"
                                                    width="45"
                                                    preview
                                                    imageClassName="border-round-xl shadow-1"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : <Avatar icon="pi pi-user" size="normal" shape="circle" className="bg-gray-100" />}
                                        />
                                        <Column
                                            header="Nom Complet"
                                            sortable
                                            body={(s: any) => (
                                                <div>
                                                    <div className="font-semibold">{`${s.firstName || ''} ${s.lastName || ''}`.trim() || '—'}</div>
                                                    <div className="text-xs text-500">{s.functionRole || '—'}</div>
                                                </div>
                                            )}
                                        />
                                        <Column
                                            header="Téléphone"
                                            body={(s: any) => (
                                                <div>
                                                    <div>{s.phonePrimary || '—'}</div>
                                                    {s.phoneSecondary && <div className="text-500 text-xs">{s.phoneSecondary}</div>}
                                                </div>
                                            )}
                                            style={{ width: '130px' }}
                                        />
                                        <Column
                                            header="Email"
                                            body={(s: any) => s.email || '—'}
                                            style={{ width: '180px' }}
                                        />
                                        <Column
                                            header="Pièce d'identité"
                                            body={(s: any) => (
                                                <div>
                                                    <div className="text-xs text-500">{s.idDocumentType?.name || '—'}</div>
                                                    <div className="font-semibold">{s.idDocumentNumber || '—'}</div>
                                                </div>
                                            )}
                                            style={{ width: '150px' }}
                                        />
                                        <Column
                                            header="Statut"
                                            style={{ width: '80px' }}
                                            body={(s: any) => (
                                                <Tag
                                                    value={s.isActive ? 'Actif' : 'Inactif'}
                                                    severity={s.isActive ? 'success' : 'warning'}
                                                />
                                            )}
                                        />
                                        <Column
                                            header="Signature"
                                            style={{ width: '90px', textAlign: 'center' }}
                                            body={(s: any) => s.signatureImagePath ? (
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(s.signatureImagePath)}`)}
                                                    alt="Signature"
                                                    width="75"
                                                    preview
                                                    imageClassName="border-round shadow-1"
                                                    style={{ objectFit: 'contain' }}
                                                />
                                            ) : <span className="text-500 text-xs">—</span>}
                                        />
                                        <Column
                                            header="Détails"
                                            style={{ width: '70px', textAlign: 'center' }}
                                            body={(s: any) => (
                                                <Button
                                                    icon="pi pi-eye"
                                                    className="p-button-rounded p-button-info p-button-sm"
                                                    tooltip="Voir tous les détails"
                                                    tooltipOptions={{ position: 'left' }}
                                                    onClick={() => { setSelectedSignatory(s); setSignatoryDetailDialog(true); }}
                                                />
                                            )}
                                        />
                                    </DataTable>
                                </Card>
                            </div>
                        )}
                    </>
                )}
            </Dialog>

            {/* Dialog détails d'un membre signataire */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user text-xl text-primary" />
                        <span>Détails du Signataire — {selectedSignatory ? `${selectedSignatory.firstName || ''} ${selectedSignatory.lastName || ''}`.trim() : ''}</span>
                    </div>
                }
                visible={signatoryDetailDialog}
                style={{ width: '80vw', maxWidth: '900px' }}
                modal
                onHide={() => setSignatoryDetailDialog(false)}
                footer={<Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={() => setSignatoryDetailDialog(false)} />}
            >
                {selectedSignatory && (
                    <div className="flex flex-column gap-3">
                        {/* Header strip */}
                        <div className="flex align-items-center gap-3 p-3 surface-100 border-round">
                            {selectedSignatory.photoPath ? (
                                <Image
                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedSignatory.photoPath)}`)}
                                    alt="Photo"
                                    width="70"
                                    preview
                                    imageClassName="border-round-xl shadow-2"
                                    style={{ objectFit: 'cover', height: '70px' }}
                                />
                            ) : (
                                <Avatar icon="pi pi-user" size="xlarge" shape="circle" className="bg-green-100 text-green-600" style={{ width: '70px', height: '70px', fontSize: '2rem' }} />
                            )}
                            <div className="flex-grow-1">
                                <div className="font-bold text-xl">{`${selectedSignatory.firstName || ''} ${selectedSignatory.lastName || ''}`.trim() || '—'}</div>
                                <div className="text-primary font-medium mt-1">{selectedSignatory.functionRole || '—'}</div>
                                <div className="flex gap-2 mt-2">
                                    <Tag value={selectedSignatory.isActive ? 'Actif' : 'Inactif'} severity={selectedSignatory.isActive ? 'success' : 'warning'} />
                                </div>
                            </div>
                        </div>

                        <div className="grid">
                            {/* Coordonnées */}
                            <div className="col-12 md:col-4">
                                <div className="surface-50 border-round p-3 h-full">
                                    <div className="font-bold text-sm mb-3 text-primary flex align-items-center gap-2">
                                        <i className="pi pi-phone" />Coordonnées
                                    </div>
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between text-sm"><span className="text-500">Téléphone</span><span className="font-semibold">{selectedSignatory.phonePrimary || '—'}</span></div>
                                        {selectedSignatory.phoneSecondary && <div className="flex justify-content-between text-sm"><span className="text-500">Tél. 2</span><span className="font-semibold">{selectedSignatory.phoneSecondary}</span></div>}
                                        <div className="flex justify-content-between text-sm"><span className="text-500">Email</span><span className="font-semibold" style={{ wordBreak: 'break-all' }}>{selectedSignatory.email || '—'}</span></div>
                                        <div className="flex justify-content-between text-sm"><span className="text-500">Adresse</span><span className="font-semibold text-right" style={{ maxWidth: '55%' }}>{selectedSignatory.address || '—'}</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Pièce d'identité */}
                            <div className="col-12 md:col-4">
                                <div className="surface-50 border-round p-3 h-full">
                                    <div className="font-bold text-sm mb-3 text-primary flex align-items-center gap-2">
                                        <i className="pi pi-id-card" />Pièce d'Identité
                                    </div>
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between text-sm"><span className="text-500">Type</span><span className="font-semibold">{selectedSignatory.idDocumentType?.name || '—'}</span></div>
                                        <div className="flex justify-content-between text-sm"><span className="text-500">Numéro</span><span className="font-semibold">{selectedSignatory.idDocumentNumber || '—'}</span></div>
                                        {selectedSignatory.idIssueDate && <div className="flex justify-content-between text-sm"><span className="text-500">Délivré le</span><span className="font-semibold">{new Date(selectedSignatory.idIssueDate).toLocaleDateString('fr-FR')}</span></div>}
                                        {selectedSignatory.idExpiryDate && <div className="flex justify-content-between text-sm"><span className="text-500">Expire le</span><span className="font-semibold">{new Date(selectedSignatory.idExpiryDate).toLocaleDateString('fr-FR')}</span></div>}
                                    </div>
                                    {selectedSignatory.idDocumentScanPath && (
                                        <div className="mt-3">
                                            <div className="text-xs text-500 mb-1">Scan du document</div>
                                            {selectedSignatory.idDocumentScanPath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedSignatory.idDocumentScanPath)}`)}
                                                    alt="Scan ID"
                                                    width="120"
                                                    preview
                                                    imageClassName="border-round shadow-1"
                                                />
                                            ) : (
                                                <a href={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedSignatory.idDocumentScanPath)}`)} target="_blank" rel="noopener noreferrer" className="text-primary text-sm">
                                                    <i className="pi pi-download mr-1" />Télécharger le scan
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact & Signature */}
                            <div className="col-12 md:col-4">
                                <div className="flex flex-column gap-2 h-full">
                                    {/* Signature */}
                                    {selectedSignatory.signatureImagePath && (
                                        <div className="surface-50 border-round p-3">
                                            <div className="font-bold text-sm mb-2 text-primary flex align-items-center gap-2">
                                                <i className="pi pi-pencil" />Signature
                                            </div>
                                            <Image
                                                src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedSignatory.signatureImagePath)}`)}
                                                alt="Signature"
                                                width="180"
                                                preview
                                                imageClassName="border-round shadow-1"
                                                style={{ objectFit: 'contain', background: '#fff', padding: '4px' }}
                                            />
                                        </div>
                                    )}
                                    {/* Personne de contact */}
                                    {selectedSignatory.contactPersonName && (
                                        <div className="surface-50 border-round p-3 flex-grow-1">
                                            <div className="font-bold text-sm mb-2 text-primary flex align-items-center gap-2">
                                                <i className="pi pi-users" />Personne de Contact
                                            </div>
                                            <div className="flex flex-column gap-2">
                                                <div className="flex justify-content-between text-sm"><span className="text-500">Nom</span><span className="font-semibold">{selectedSignatory.contactPersonName}</span></div>
                                                {selectedSignatory.contactPersonRelationshipType && <div className="flex justify-content-between text-sm"><span className="text-500">Relation</span><span className="font-semibold">{selectedSignatory.contactPersonRelationshipType?.name || selectedSignatory.contactPersonRelationshipOther || '—'}</span></div>}
                                                {selectedSignatory.contactPersonPhone && <div className="flex justify-content-between text-sm"><span className="text-500">Téléphone</span><span className="font-semibold">{selectedSignatory.contactPersonPhone}</span></div>}
                                                {selectedSignatory.contactPersonAddress && <div className="flex justify-content-between text-sm"><span className="text-500">Adresse</span><span className="font-semibold">{selectedSignatory.contactPersonAddress}</span></div>}
                                            </div>
                                        </div>
                                    )}
                                    {/* Notes */}
                                    {selectedSignatory.notes && (
                                        <div className="p-2 border-round surface-50 text-sm">
                                            <div className="text-500 text-xs mb-1">Notes</div>
                                            <div>{selectedSignatory.notes}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Dialog pour voir les détails du groupe solidaire */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-users text-2xl text-primary"></i>
                        <span>Détails du Groupe Solidaire</span>
                    </div>
                }
                visible={viewGroupDialog}
                style={{ width: '900px' }}
                modal
                onHide={() => setViewGroupDialog(false)}
                footer={
                    <Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={() => setViewGroupDialog(false)} />
                }
            >
                {selectedAccountGroup && (
                    <div className="flex flex-column gap-4">
                        {/* Group summary header */}
                        <div className="grid">
                            <div className="col-12 md:col-8">
                                <div className="flex align-items-center gap-3 p-3 surface-100 border-round h-full">
                                    <i className="pi pi-users text-3xl text-primary" />
                                    <div>
                                        <div className="font-bold text-xl">{selectedAccountGroup.groupName || selectedAccountGroup.name || '—'}</div>
                                        {selectedAccountGroup.groupCode && <div className="text-500 text-sm mt-1">{selectedAccountGroup.groupCode}</div>}
                                        {selectedAccountGroup.branch?.name && <div className="text-600 text-sm mt-1"><i className="pi pi-map-marker mr-1" />{selectedAccountGroup.branch.name}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="flex flex-column gap-2 p-3 surface-100 border-round h-full justify-content-center">
                                    <div className="flex align-items-center justify-content-between">
                                        <span className="text-500 text-sm">Statut</span>
                                        <Tag
                                            value={selectedAccountGroup.status || '—'}
                                            severity={selectedAccountGroup.status === 'ACTIVE' ? 'success' : selectedAccountGroup.status === 'PENDING' ? 'warning' : 'danger'}
                                        />
                                    </div>
                                    <div className="flex align-items-center justify-content-between">
                                        <span className="text-500 text-sm">Membres</span>
                                        <Tag value={`${groupMembers.length} membres`} severity="info" icon="pi pi-users" />
                                    </div>
                                    {selectedAccountGroup.formationDate && (
                                        <div className="flex align-items-center justify-content-between">
                                            <span className="text-500 text-sm">Formation</span>
                                            <span className="font-medium text-sm">{new Date(selectedAccountGroup.formationDate).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Members table */}
                        <div>
                            <h5 className="m-0 mb-3">
                                <i className="pi pi-list mr-2 text-primary" />
                                Liste des Membres
                            </h5>
                            <DataTable
                                value={groupMembers}
                                loading={groupMembersApi.loading}
                                emptyMessage="Aucun membre trouvé"
                                stripedRows
                                showGridlines
                                size="small"
                                paginator
                                rows={10}
                            >
                                <Column field="membershipNumber" header="N° Adhésion" sortable style={{ width: '130px' }} />
                                <Column
                                    header="Nom / Prénom"
                                    sortable
                                    body={(row: any) => {
                                        if (row.client) {
                                            return row.client.businessName
                                                || `${row.client.firstName || ''} ${row.client.lastName || ''}`.trim()
                                                || row.client.clientNumber || '—';
                                        }
                                        if (row.memberProfile) {
                                            return row.memberProfile.fullName || '—';
                                        }
                                        return '—';
                                    }}
                                />
                                <Column
                                    header="N° Client"
                                    body={(row: any) => row.client?.clientNumber || row.memberProfile?.id ? `PROFIL-${row.memberProfile.id}` : '—'}
                                    style={{ width: '120px' }}
                                />
                                <Column
                                    header="Téléphone"
                                    body={(row: any) => row.client?.phonePrimary || row.memberProfile?.phone || '—'}
                                    style={{ width: '130px' }}
                                />
                                <Column
                                    field="role.nameFr"
                                    header="Rôle"
                                    sortable
                                    body={(row: any) => (
                                        <div className="flex align-items-center gap-1">
                                            {row.isExecutive && <Tag value="Bureau" severity="warning" style={{ fontSize: '0.7rem' }} />}
                                            <span>{row.role?.nameFr || row.role?.name || '—'}</span>
                                        </div>
                                    )}
                                />
                                <Column
                                    field="joinDate"
                                    header="Date Adhésion"
                                    sortable
                                    body={(row: any) => row.joinDate ? new Date(row.joinDate).toLocaleDateString('fr-FR') : '—'}
                                    style={{ width: '130px' }}
                                />
                                <Column
                                    field="status"
                                    header="Statut"
                                    sortable
                                    style={{ width: '110px' }}
                                    body={(row: any) => (
                                        <Tag
                                            value={row.status || '—'}
                                            severity={row.status === 'ACTIVE' ? 'success' : row.status === 'PENDING' ? 'warning' : row.status === 'SUSPENDED' ? 'danger' : null}
                                        />
                                    )}
                                />
                                <Column
                                    header="Contributions"
                                    sortable
                                    sortField="totalContributions"
                                    style={{ width: '140px' }}
                                    body={(row: any) => row.totalContributions != null
                                        ? `${Number(row.totalContributions).toLocaleString('fr-FR')} FBu`
                                        : '—'}
                                />
                                <Column
                                    header="Actions"
                                    style={{ width: '80px', textAlign: 'center' }}
                                    body={(row: any) => (
                                        <Button
                                            icon="pi pi-eye"
                                            className="p-button-rounded p-button-info p-button-sm"
                                            tooltip="Voir détails"
                                            tooltipOptions={{ position: 'left' }}
                                            onClick={() => {
                                                setSelectedMember(row);
                                                setMemberDocuments([]);
                                                setMemberDetailDialog(true);
                                                if (selectedAccountGroup?.id && row.id) {
                                                    memberDocumentsApi.fetchData(null, 'GET', `${GROUPS_URL}/${selectedAccountGroup.id}/members/${row.id}/documents`, 'loadMemberDocs');
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </DataTable>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Dialog détails d'un membre du groupe */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user text-xl text-primary"></i>
                        <span>Détails du Membre — {selectedMember?.client
                            ? (selectedMember.client.businessName || `${selectedMember.client.firstName || ''} ${selectedMember.client.lastName || ''}`.trim())
                            : (`${selectedMember?.memberProfile?.firstName || ''} ${selectedMember?.memberProfile?.lastName || ''}`.trim() || '—')}
                        </span>
                    </div>
                }
                visible={memberDetailDialog}
                style={{ width: '85vw', maxWidth: '1000px' }}
                modal
                onHide={() => setMemberDetailDialog(false)}
                footer={
                    <Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={() => setMemberDetailDialog(false)} />
                }
            >
                {selectedMember && (() => {
                    const c = selectedMember.client;
                    const p = selectedMember.memberProfile;
                    const fullName = c
                        ? (c.businessName || `${c.firstName || ''} ${c.lastName || ''}`.trim())
                        : (`${p?.firstName || ''} ${p?.lastName || ''}`.trim());
                    const phone1 = c?.phonePrimary || p?.phonePrimary || '—';
                    const phone2 = c?.phoneSecondary || p?.phoneSecondary;
                    const email = c?.email || p?.email;
                    const idNum = c?.idDocumentNumber || p?.idDocumentNumber;
                    const idType = c?.idDocumentType?.name;
                    const idIssue = c?.idIssueDate || p?.idDocumentIssueDate;
                    const idExpiry = c?.idExpiryDate || p?.idDocumentExpiryDate;
                    const address = c?.streetAddress || p?.streetAddress;
                    const province = c?.province?.name;
                    const commune = c?.commune?.name;
                    const zone = c?.zone?.name;
                    const colline = c?.colline?.name;
                    const dob = c?.dateOfBirth || p?.dateOfBirth;
                    const placeOfBirth = c?.placeOfBirth || p?.placeOfBirth;
                    const gender = c?.gender || p?.gender;
                    const profession = c?.profession;
                    const employer = c?.employerName;
                    const income = c?.monthlyIncome;

                    return (
                        <div className="flex flex-column gap-3">

                            {/* Header identity strip */}
                            <div className="flex align-items-center gap-3 p-3 surface-100 border-round">
                                <Avatar icon="pi pi-user" size="xlarge" shape="circle" className="bg-blue-100 text-blue-600" style={{ width: '70px', height: '70px', fontSize: '2rem' }} />
                                <div className="flex-grow-1">
                                    <div className="font-bold text-xl">{fullName || '—'}</div>
                                    {c?.clientNumber && <div className="text-500 text-sm mt-1">{c.clientNumber}</div>}
                                    {selectedMember.membershipNumber && <div className="text-500 text-sm">Adhésion: {selectedMember.membershipNumber}</div>}
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {selectedMember.isExecutive && <Tag value="Membre du Bureau" severity="warning" icon="pi pi-star" />}
                                        <Tag
                                            value={selectedMember.role?.nameFr || selectedMember.role?.name || '—'}
                                            severity="info"
                                        />
                                        <Tag
                                            value={selectedMember.status || '—'}
                                            severity={selectedMember.status === 'ACTIVE' ? 'success' : selectedMember.status === 'PENDING' ? 'warning' : selectedMember.status === 'SUSPENDED' ? 'danger' : null}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-500 text-xs mb-1">Date d'adhésion</div>
                                    <div className="font-bold">{selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString('fr-FR') : '—'}</div>
                                </div>
                            </div>

                            <div className="grid">
                                {/* === Informations Personnelles === */}
                                <div className="col-12 md:col-4">
                                    <div className="surface-50 border-round p-3 h-full">
                                        <div className="font-bold text-sm mb-3 text-primary flex align-items-center gap-2">
                                            <i className="pi pi-user" />
                                            Informations Personnelles
                                        </div>
                                        <div className="flex flex-column gap-2">
                                            {gender && <div className="flex justify-content-between text-sm"><span className="text-500">Genre</span><span className="font-semibold">{gender === 'M' ? 'Masculin' : gender === 'F' ? 'Féminin' : gender}</span></div>}
                                            {dob && <div className="flex justify-content-between text-sm"><span className="text-500">Date de naissance</span><span className="font-semibold">{new Date(dob).toLocaleDateString('fr-FR')}</span></div>}
                                            {placeOfBirth && <div className="flex justify-content-between text-sm"><span className="text-500">Lieu de naissance</span><span className="font-semibold">{placeOfBirth}</span></div>}
                                            <div className="flex justify-content-between text-sm"><span className="text-500">Téléphone</span><span className="font-semibold">{phone1}</span></div>
                                            {phone2 && <div className="flex justify-content-between text-sm"><span className="text-500">Tél. secondaire</span><span className="font-semibold">{phone2}</span></div>}
                                            {email && <div className="flex justify-content-between text-sm"><span className="text-500">Email</span><span className="font-semibold" style={{ wordBreak: 'break-all' }}>{email}</span></div>}
                                            {profession && <div className="flex justify-content-between text-sm"><span className="text-500">Profession</span><span className="font-semibold">{profession}</span></div>}
                                            {employer && <div className="flex justify-content-between text-sm"><span className="text-500">Employeur</span><span className="font-semibold">{employer}</span></div>}
                                            {income != null && <div className="flex justify-content-between text-sm"><span className="text-500">Revenu mensuel</span><span className="font-semibold text-green-600">{Number(income).toLocaleString('fr-FR')} FBu</span></div>}
                                        </div>
                                    </div>
                                </div>

                                {/* === Pièce d'identité & Adresse === */}
                                <div className="col-12 md:col-4">
                                    <div className="flex flex-column gap-2 h-full">
                                        <div className="surface-50 border-round p-3">
                                            <div className="font-bold text-sm mb-3 text-primary flex align-items-center gap-2">
                                                <i className="pi pi-id-card" />
                                                Pièce d'Identité
                                            </div>
                                            <div className="flex flex-column gap-2">
                                                {idType && <div className="flex justify-content-between text-sm"><span className="text-500">Type</span><span className="font-semibold">{idType}</span></div>}
                                                <div className="flex justify-content-between text-sm"><span className="text-500">Numéro</span><span className="font-semibold">{idNum || '—'}</span></div>
                                                {idIssue && <div className="flex justify-content-between text-sm"><span className="text-500">Délivré le</span><span className="font-semibold">{new Date(idIssue).toLocaleDateString('fr-FR')}</span></div>}
                                                {idExpiry && <div className="flex justify-content-between text-sm"><span className="text-500">Expire le</span><span className="font-semibold">{new Date(idExpiry).toLocaleDateString('fr-FR')}</span></div>}
                                                {c?.idIssuePlace && <div className="flex justify-content-between text-sm"><span className="text-500">Délivré par</span><span className="font-semibold">{c.idIssuePlace}</span></div>}
                                            </div>
                                        </div>
                                        <div className="surface-50 border-round p-3 flex-grow-1">
                                            <div className="font-bold text-sm mb-3 text-primary flex align-items-center gap-2">
                                                <i className="pi pi-map-marker" />
                                                Adresse
                                            </div>
                                            <div className="flex flex-column gap-2">
                                                {province && <div className="flex justify-content-between text-sm"><span className="text-500">Province</span><span className="font-semibold">{province}</span></div>}
                                                {commune && <div className="flex justify-content-between text-sm"><span className="text-500">Commune</span><span className="font-semibold">{commune}</span></div>}
                                                {zone && <div className="flex justify-content-between text-sm"><span className="text-500">Zone</span><span className="font-semibold">{zone}</span></div>}
                                                {colline && <div className="flex justify-content-between text-sm"><span className="text-500">Colline</span><span className="font-semibold">{colline}</span></div>}
                                                {c?.quartier && <div className="flex justify-content-between text-sm"><span className="text-500">Quartier</span><span className="font-semibold">{c.quartier}</span></div>}
                                                {address && <div className="flex justify-content-between text-sm"><span className="text-500">Adresse</span><span className="font-semibold text-right" style={{ maxWidth: '55%' }}>{address}</span></div>}
                                                {!province && !commune && !address && <span className="text-500 text-sm">—</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* === Informations d'Adhésion & Contributions === */}
                                <div className="col-12 md:col-4">
                                    <div className="flex flex-column gap-2 h-full">
                                        <div className="surface-50 border-round p-3">
                                            <div className="font-bold text-sm mb-3 text-primary flex align-items-center gap-2">
                                                <i className="pi pi-users" />
                                                Adhésion au Groupe
                                            </div>
                                            <div className="flex flex-column gap-2">
                                                <div className="flex justify-content-between text-sm"><span className="text-500">N° Adhésion</span><span className="font-semibold">{selectedMember.membershipNumber || '—'}</span></div>
                                                <div className="flex justify-content-between text-sm"><span className="text-500">Rôle</span><span className="font-semibold">{selectedMember.role?.nameFr || selectedMember.role?.name || '—'}</span></div>
                                                <div className="flex justify-content-between text-sm"><span className="text-500">Membre du bureau</span><span className="font-semibold">{selectedMember.isExecutive ? 'Oui' : 'Non'}</span></div>
                                                <div className="flex justify-content-between text-sm"><span className="text-500">Date d'adhésion</span><span className="font-semibold">{selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString('fr-FR') : '—'}</span></div>
                                                <div className="flex justify-content-between text-sm"><span className="text-500">Statut</span>
                                                    <Tag value={selectedMember.status || '—'} severity={selectedMember.status === 'ACTIVE' ? 'success' : selectedMember.status === 'PENDING' ? 'warning' : selectedMember.status === 'SUSPENDED' ? 'danger' : null} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="surface-50 border-round p-3 flex-grow-1">
                                            <div className="font-bold text-sm mb-3 text-primary flex align-items-center gap-2">
                                                <i className="pi pi-wallet" />
                                                Contributions
                                            </div>
                                            <div className="flex flex-column gap-2">
                                                <div className="flex justify-content-between text-sm">
                                                    <span className="text-500">Part sociale</span>
                                                    <span className="font-semibold text-primary">{selectedMember.shareContribution != null ? `${Number(selectedMember.shareContribution).toLocaleString('fr-FR')} FBu` : '—'}</span>
                                                </div>
                                                <div className="flex justify-content-between text-sm">
                                                    <span className="text-500">Total versé</span>
                                                    <span className="font-semibold text-green-600">{selectedMember.totalContributions != null ? `${Number(selectedMember.totalContributions).toLocaleString('fr-FR')} FBu` : '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedMember.statusReason && selectedMember.status !== 'ACTIVE' && (
                                            <div className="p-2 border-round bg-orange-50 text-sm" style={{ border: '1px solid #f59e0b' }}>
                                                <div className="text-500 text-xs mb-1">Raison du statut</div>
                                                <div>{selectedMember.statusReason}</div>
                                            </div>
                                        )}
                                        {selectedMember.notes && (
                                            <div className="p-2 border-round surface-50 text-sm">
                                                <div className="text-500 text-xs mb-1">Notes</div>
                                                <div>{selectedMember.notes}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Documents Joints du Membre */}
                            <div className="surface-50 border-round p-3">
                                <div className="font-bold text-sm mb-3 text-primary flex align-items-center gap-2">
                                    <i className="pi pi-paperclip" />
                                    Documents Joints
                                    {memberDocumentsApi.loading && <i className="pi pi-spin pi-spinner text-500" />}
                                </div>
                                {!memberDocumentsApi.loading && memberDocuments.length === 0 ? (
                                    <div className="text-500 text-sm flex align-items-center gap-2">
                                        <i className="pi pi-inbox" />
                                        Aucun document joint pour ce membre
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {memberDocuments.map((doc: any, idx: number) => {
                                            const ext = (doc.filePath || doc.fileName || '').split('.').pop()?.toLowerCase() || '';
                                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
                                            const fileUrl = buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(doc.filePath)}`);
                                            const docLabel = doc.documentType === 'ESPACE_HUMAINE' ? 'Photo (Espace Humaine)'
                                                : doc.documentType === 'ID_CARTE' ? "Carte d'identité"
                                                : doc.documentType || 'Document';
                                            return (
                                                <div key={idx} className="p-2 surface-100 border-round flex flex-column align-items-center gap-1" style={{ minWidth: '120px', maxWidth: '160px' }}>
                                                    <div className="text-xs text-500 text-center font-medium">{docLabel}</div>
                                                    {isImage ? (
                                                        <Image
                                                            src={fileUrl}
                                                            alt={docLabel}
                                                            width="120"
                                                            preview
                                                            imageClassName="border-round shadow-1"
                                                            style={{ objectFit: 'contain', maxHeight: '90px' }}
                                                        />
                                                    ) : (
                                                        <div className="flex flex-column align-items-center gap-1">
                                                            <i className="pi pi-file-pdf text-3xl text-red-400" />
                                                            <div className="text-xs text-center text-500" style={{ wordBreak: 'break-all' }}>
                                                                {doc.fileName || doc.filePath?.split(/[\\/]/).pop() || 'Fichier'}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs">
                                                        <i className="pi pi-download mr-1" />
                                                        Ouvrir
                                                    </a>
                                                    {doc.fileSizeBytes && (
                                                        <div className="text-xs text-500">{Math.round(doc.fileSizeBytes / 1024)} Ko</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </Dialog>

            {/* Disburse Billetage Dialog */}
            <Dialog
                visible={disburseBilletageVisible}
                onHide={() => {/* Obligatoire */}}
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-money-bill text-xl text-orange-600"></i>
                        <span>Billetage - Decaissement Retrait</span>
                    </div>
                }
                style={{ width: '520px' }}
                modal
                closable={false}
                footer={
                    <div className="flex justify-content-between align-items-center">
                        <Button label="Annuler" icon="pi pi-times" severity="secondary" outlined onClick={() => setDisburseBilletageVisible(false)} />
                        <Button
                            label="Decaisser"
                            icon="pi pi-wallet"
                            severity="success"
                            onClick={handleSubmitDisburse}
                            loading={actionsApi.loading}
                            disabled={disburseAmount > 0 && Math.abs(calculateDisburseBilletageTotal() - disburseAmount) > 0.01}
                        />
                    </div>
                }
            >
                <div>
                    <div className="p-3 border-round mb-3 surface-100">
                        <div className="flex justify-content-between align-items-center">
                            <span className="text-500">Montant du retrait:</span>
                            <span className="font-bold text-orange-600 text-lg">{formatNumberFBu(disburseAmount)} FBu</span>
                        </div>
                    </div>

                    <DataTable value={DENOMINATIONS} size="small" showGridlines
                        footer={
                            <div className="flex justify-content-between align-items-center">
                                <span className="text-lg font-bold">TOTAL</span>
                                <span className={`text-lg font-bold ${Math.abs(calculateDisburseBilletageTotal() - disburseAmount) > 0.01 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {formatNumberFBu(calculateDisburseBilletageTotal())} FBu
                                </span>
                            </div>
                        }>
                        <Column header="Denomination" body={(d: any) => (
                            <span className="font-medium">{formatNumberFBu(d.value)} FBu</span>
                        )} style={{ width: '120px' }} />
                        <Column header="Quantite" body={(d: any) => (
                            <InputNumber
                                value={disburseBilletage[d.field] || 0}
                                onValueChange={(e) => handleDisburseBilletageChange(d.field, e.value || 0)}
                                min={0}
                                showButtons
                                buttonLayout="horizontal"
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                inputStyle={{ textAlign: 'center', fontWeight: 600, width: '60px' }}
                            />
                        )} style={{ width: '180px' }} />
                        <Column header="Sous-total" body={(d: any) => (
                            <span className="font-bold text-primary">{formatNumberFBu((disburseBilletage[d.field] || 0) * d.value)} FBu</span>
                        )} style={{ textAlign: 'right' }} />
                    </DataTable>

                    {disburseAmount > 0 && (
                        <div className="mt-3 p-3 border-round" style={{
                            background: Math.abs(calculateDisburseBilletageTotal() - disburseAmount) > 0.01 ? '#FFF3E0' : '#E8F5E9',
                            borderLeft: `4px solid ${Math.abs(calculateDisburseBilletageTotal() - disburseAmount) > 0.01 ? '#FF9800' : '#4CAF50'}`
                        }}>
                            <div className="flex justify-content-between align-items-center">
                                <span className="text-600">Difference:</span>
                                <span className={`font-bold ${Math.abs(calculateDisburseBilletageTotal() - disburseAmount) > 0.01 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {formatNumberFBu(calculateDisburseBilletageTotal() - disburseAmount)} FBu
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    );
}

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_WITHDRAWAL_CREATE', 'EPARGNE_WITHDRAWAL_VERIFY', 'EPARGNE_WITHDRAWAL_DISBURSE']}>
            <WithdrawalRequestPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
