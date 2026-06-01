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
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import Cookies from 'js-cookie';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL, buildApiUrl } from '@/utils/apiConfig';
import { formatLocalDate } from '@/utils/dateUtils';
import { SavingsAccount, SavingsAccountClass } from './SavingsAccount';
import SavingsAccountForm from './SavingsAccountForm';
import PrintableTermDepositCertificate from './PrintableTermDepositCertificate';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';

const BASE_URL = `${API_BASE_URL}/api/savings-accounts`;
const CLIENTS_URL = `${API_BASE_URL}/api/clients`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const CURRENCIES_URL = `${API_BASE_URL}/api/financial-products/reference/currencies`;
const STATUSES_URL = `${API_BASE_URL}/api/financial-products/reference/savings-account-statuses`;
const INTERNAL_ACCOUNTS_URL = `${API_BASE_URL}/api/comptability/internal-accounts`;
const TERM_DURATIONS_URL = `${API_BASE_URL}/api/epargne/term-durations`;
const GROUPS_URL = `${API_BASE_URL}/api/solidarity-groups`;

// Fallback statuses when API is forbidden (caissier role)
const FALLBACK_STATUSES = [
    { id: 1, code: 'ACTIVE', name: 'Active', nameFr: 'Actif' },
    { id: 2, code: 'INACTIVE', name: 'Inactive', nameFr: 'Inactif' },
    { id: 3, code: 'DORMANT', name: 'Dormant', nameFr: 'Dormant' },
    { id: 4, code: 'CLOSED', name: 'Closed', nameFr: 'Fermé' },
    { id: 5, code: 'PENDING_ACTIVATION', name: 'Pending Activation', nameFr: "En attente d'activation" },
];

function SavingsAccountPage() {
    const [savingsAccount, setSavingsAccount] = useState<SavingsAccount>(new SavingsAccountClass());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);
    const [termDurations, setTermDurations] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [periodStart, setPeriodStart] = useState<Date | null>(null);
    const [periodEnd, setPeriodEnd] = useState<Date | null>(null);
    const [viewDialog, setViewDialog] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);
    const [statusDialog, setStatusDialog] = useState(false);
    const [statusChangeAccount, setStatusChangeAccount] = useState<SavingsAccount | null>(null);
    const [newStatusId, setNewStatusId] = useState<number | null>(null);
    const [selectedClientType, setSelectedClientType] = useState<string>('');
    const [termDepositDialog, setTermDepositDialog] = useState(false);
    const [termDepositAccount, setTermDepositAccount] = useState<SavingsAccount | null>(null);
    const [validateTermDialog, setValidateTermDialog] = useState(false);
    const [validateTermAccount, setValidateTermAccount] = useState<SavingsAccount | null>(null);
    const [termDepositParams, setTermDepositParams] = useState({
        currentBalance: 0,
        blockedAmount: 0,
        minimumBalance: 0,
        interestRate: 0,
        accruedInterest: 0,
        termDurationId: null as number | null,
        termStartDate: null as string | null,
        maturityDate: null as string | null,
        interestInternalAccountId: null as number | null
    });
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const { can } = useAuthorizedAction();

    // Separate hook instances for each data type
    const clientsApi = useConsumApi('');
    const branchesApi = useConsumApi('');
    const currenciesApi = useConsumApi('');
    const statusesApi = useConsumApi('');
    const internalAccountsApi = useConsumApi('');
    const accountsApi = useConsumApi('');
    const actionsApi = useConsumApi('');
    const statusApi = useConsumApi('');
    const termDepositApi = useConsumApi('');
    const termDurationsApi = useConsumApi('');
    const validateTermApi = useConsumApi('');
    const maturityApi = useConsumApi('');
    const historyApi = useConsumApi('');
    const opsHistoryApi = useConsumApi('');
    const interestHistoryApi = useConsumApi('');
    const previewInterestApi = useConsumApi('');
    const processInterestApi = useConsumApi('');
    const [maturityDialog, setMaturityDialog] = useState(false);
    const [maturityAccount, setMaturityAccount] = useState<SavingsAccount | null>(null);
    const [historyDialog, setHistoryDialog] = useState(false);
    const [historyAccount, setHistoryAccount] = useState<SavingsAccount | null>(null);
    const [termDepositHistory, setTermDepositHistory] = useState<any[]>([]);
    const [opsHistoryDialog, setOpsHistoryDialog] = useState(false);
    const [interestHistoryDialog, setInterestHistoryDialog] = useState(false);
    const [interestExecutionHistory, setInterestExecutionHistory] = useState<any[]>([]);
    const [interestHistoryExpandedRows, setInterestHistoryExpandedRows] = useState<any>(null);
    const [opsHistoryAccount, setOpsHistoryAccount] = useState<SavingsAccount | null>(null);
    const [opsHistory, setOpsHistory] = useState<any[]>([]);
    const [opsHistorySummary, setOpsHistorySummary] = useState<any>(null);
    const [opsHistoryFrom, setOpsHistoryFrom] = useState<Date | null>(null);
    const [opsHistoryTo, setOpsHistoryTo] = useState<Date | null>(null);
    const [opsHistoryType, setOpsHistoryType] = useState<string>('');
    const [pendingPrint, setPendingPrint] = useState(false);
    const [monthlyInterestDialog, setMonthlyInterestDialog] = useState(false);
    const [monthlyInterestPreview, setMonthlyInterestPreview] = useState<any[]>([]);
    const [monthlyInterestResult, setMonthlyInterestResult] = useState<any[]>([]);
    const [monthlyInterestStep, setMonthlyInterestStep] = useState<'preview' | 'result'>('preview');
    const [isProcessingInterest, setIsProcessingInterest] = useState(false);
    const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
    const schedulerStatusApi = useConsumApi('');
    const [documentsDialog, setDocumentsDialog] = useState(false);
    const [documentsAccount, setDocumentsAccount] = useState<SavingsAccount | null>(null);
    const [accountDocuments, setAccountDocuments] = useState<any[]>([]);
    const [addDocDialog, setAddDocDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [newDocName, setNewDocName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const fileUploadRef = useRef<FileUpload>(null);

    // Group savings accounts
    const [solidarityGroups, setSolidarityGroups] = useState<any[]>([]);
    const [groupAccount, setGroupAccount] = useState<SavingsAccount>(new SavingsAccountClass());
    const [groupAccounts, setGroupAccounts] = useState<SavingsAccount[]>([]);
    const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
    const [groupActiveIndex, setGroupActiveIndex] = useState(0);
    const groupsApi = useConsumApi('');
    const groupAccountsApi = useConsumApi('');
    const groupActionsApi = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadSavingsAccounts();
        loadGroupAccounts();
        schedulerStatusApi.fetchData(null, 'GET', `${BASE_URL}/monthly-interest-status`, 'schedulerStatus');
    }, []);

    // Handle clients data
    useEffect(() => {
        if (clientsApi.data) {
            const allClients = Array.isArray(clientsApi.data) ? clientsApi.data : clientsApi.data.content || [];
            // Only keep clients with status ACTIVE
            const activeClients = allClients.filter((c: any) => c.status === 'ACTIVE');
            setClients(activeClients);
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

    // Handle term durations data
    useEffect(() => {
        if (termDurationsApi.data) {
            const data = Array.isArray(termDurationsApi.data) ? termDurationsApi.data : [];
            setTermDurations(data.filter((td: any) => td.isActive));
        }
    }, [termDurationsApi.data]);

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
                    {
                        const type = savingsAccount.accountType;
                        const tabIndex = type === 'TERM_DEPOSIT' ? 2 : type === 'BLOCKED' ? 4 : 1;
                        resetForm();
                        loadSavingsAccounts();
                        setActiveIndex(tabIndex);
                    }
                    setIsSubmitting(false);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Compte d\'épargne mis à jour avec succès');
                    {
                        const type = savingsAccount.accountType;
                        const tabIndex = type === 'TERM_DEPOSIT' ? 2 : type === 'BLOCKED' ? 4 : 1;
                        resetForm();
                        loadSavingsAccounts();
                        setActiveIndex(tabIndex);
                    }
                    setIsSubmitting(false);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Compte d\'épargne supprimé avec succès');
                    loadSavingsAccounts();
                    break;
            }
        }
        if (actionsApi.error) {
            showToast('error', 'Erreur', actionsApi.error.message || 'Une erreur est survenue');
            setIsSubmitting(false);
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

    // Handle term deposit params update response
    useEffect(() => {
        if (termDepositApi.data) {
            showToast('success', 'Succès', 'Paramètres du dépôt à terme mis à jour');
            setTermDepositDialog(false);
            setTermDepositAccount(null);
            loadSavingsAccounts();
        }
        if (termDepositApi.error) {
            showToast('error', 'Erreur', termDepositApi.error.message || 'Erreur lors de la mise à jour des paramètres');
        }
    }, [termDepositApi.data, termDepositApi.error]);

    // Handle term deposit validation response
    useEffect(() => {
        if (validateTermApi.data) {
            showToast('success', 'Succès', 'Dépôt à terme validé avec succès. Les montants ont été transférés vers les comptes internes.');
            setValidateTermDialog(false);
            setValidateTermAccount(null);
            loadSavingsAccounts();
        }
        if (validateTermApi.error) {
            showToast('error', 'Erreur', validateTermApi.error.message || 'Erreur lors de la validation du dépôt à terme');
        }
    }, [validateTermApi.data, validateTermApi.error]);

    // Handle term deposit maturity response
    useEffect(() => {
        if (maturityApi.data) {
            showToast('success', 'Succès', 'Échéance traitée avec succès. Le capital et les intérêts ont été restitués au client. Le compte est prêt pour un nouveau dépôt à terme.');
            setMaturityDialog(false);
            setMaturityAccount(null);
            loadSavingsAccounts();
        }
        if (maturityApi.error) {
            showToast('error', 'Erreur', maturityApi.error.message || 'Erreur lors du traitement de l\'échéance');
        }
    }, [maturityApi.data, maturityApi.error]);

    // Handle term deposit history response
    useEffect(() => {
        if (historyApi.data) {
            const data = Array.isArray(historyApi.data) ? historyApi.data : [];
            setTermDepositHistory(data);
            if (pendingPrint) {
                setPendingPrint(false);
                executePrint();
            }
        }
    }, [historyApi.data]);

    // Handle scheduler status response
    useEffect(() => {
        if (schedulerStatusApi.data) {
            setSchedulerStatus(schedulerStatusApi.data);
        }
    }, [schedulerStatusApi.data]);

    // Handle interest execution history response
    useEffect(() => {
        if (interestHistoryApi.data) {
            setInterestExecutionHistory(Array.isArray(interestHistoryApi.data) ? interestHistoryApi.data : []);
        }
    }, [interestHistoryApi.data]);

    // Handle operations history response
    useEffect(() => {
        if (opsHistoryApi.data) {
            const resp = opsHistoryApi.data as any;
            setOpsHistory(Array.isArray(resp.data) ? resp.data : Array.isArray(resp) ? resp : []);
            setOpsHistorySummary(resp.totalOperations !== undefined ? resp : null);
        }
        if (opsHistoryApi.error) {
            showToast('error', 'Erreur', opsHistoryApi.error.message || 'Erreur lors du chargement de l\'historique');
        }
    }, [opsHistoryApi.data, opsHistoryApi.error]);

    // Handle monthly interest preview response
    useEffect(() => {
        if (previewInterestApi.data) {
            const data = Array.isArray(previewInterestApi.data) ? previewInterestApi.data : [];
            setMonthlyInterestPreview(data);
            setMonthlyInterestStep('preview');
        }
        if (previewInterestApi.error) {
            showToast('error', 'Erreur', previewInterestApi.error.message || 'Erreur lors du calcul');
        }
    }, [previewInterestApi.data, previewInterestApi.error]);

    // Handle monthly interest process response
    useEffect(() => {
        if (processInterestApi.data) {
            const data = Array.isArray(processInterestApi.data) ? processInterestApi.data : [];
            setMonthlyInterestResult(data);
            setMonthlyInterestStep('result');
            setIsProcessingInterest(false);
            loadSavingsAccounts();
            showToast('success', 'Succès', `Intérêts crédités sur ${data.length} compte(s)`);
        }
        if (processInterestApi.error) {
            showToast('error', 'Erreur', processInterestApi.error.message || 'Erreur lors du traitement');
            setIsProcessingInterest(false);
        }
    }, [processInterestApi.data, processInterestApi.error]);

    const openMonthlyInterestDialog = () => {
        setMonthlyInterestPreview([]);
        setMonthlyInterestResult([]);
        setMonthlyInterestStep('preview');
        setMonthlyInterestDialog(true);
        previewInterestApi.fetchData(null, 'GET', `${BASE_URL}/preview-monthly-interest`, 'previewInterest');
        schedulerStatusApi.fetchData(null, 'GET', `${BASE_URL}/monthly-interest-status`, 'schedulerStatus');
    };

    const handleProcessMonthlyInterest = () => {
        setIsProcessingInterest(true);
        processInterestApi.fetchData(
            { userAction: getUserAction() },
            'POST',
            `${BASE_URL}/process-monthly-interest`,
            'processInterest'
        );
    };

    // Load documents for a specific savings account
    const loadAccountDocuments = async (accountId: number) => {
        setLoadingDocs(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(buildApiUrl(`/api/epargne/savings-account-documents/findbyaccount/${accountId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setAccountDocuments(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des documents');
        } finally {
            setLoadingDocs(false);
        }
    };

    // Handle solidarity groups data
    useEffect(() => {
        if (groupsApi.data) {
            const all = Array.isArray(groupsApi.data) ? groupsApi.data : groupsApi.data.content || [];
            setSolidarityGroups(all.filter((g: any) => g.status === 'ACTIVE' || g.status === undefined));
        }
    }, [groupsApi.data]);

    // Handle group savings accounts data
    useEffect(() => {
        if (groupAccountsApi.data) {
            setGroupAccounts(Array.isArray(groupAccountsApi.data) ? groupAccountsApi.data : []);
        }
    }, [groupAccountsApi.data]);

    // Handle group account actions (create/update/delete)
    useEffect(() => {
        if (groupActionsApi.data) {
            switch (groupActionsApi.callType) {
                case 'createGroup':
                    showToast('success', 'Succès', 'Compte groupe créé avec succès');
                    resetGroupForm();
                    loadGroupAccounts();
                    setActiveIndex(3);
                    setGroupActiveIndex(1);
                    setIsSubmittingGroup(false);
                    break;
                case 'updateGroup':
                    showToast('success', 'Succès', 'Compte groupe mis à jour avec succès');
                    resetGroupForm();
                    loadGroupAccounts();
                    setActiveIndex(3);
                    setGroupActiveIndex(1);
                    setIsSubmittingGroup(false);
                    break;
                case 'deleteGroup':
                    showToast('success', 'Succès', 'Compte groupe supprimé avec succès');
                    loadGroupAccounts();
                    break;
            }
        }
        if (groupActionsApi.error) {
            showToast('error', 'Erreur', groupActionsApi.error.message || 'Une erreur est survenue');
            setIsSubmittingGroup(false);
        }
    }, [groupActionsApi.data, groupActionsApi.error, groupActionsApi.callType]);

    const loadReferenceData = () => {
        clientsApi.fetchData(null, 'GET', `${CLIENTS_URL}/findall`, 'loadClients');
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        currenciesApi.fetchData(null, 'GET', `${CURRENCIES_URL}/findall`, 'loadCurrencies');
        statusesApi.fetchData(null, 'GET', `${STATUSES_URL}/findall`, 'loadStatuses');
        internalAccountsApi.fetchData(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findactive`, 'loadInternalAccounts');
        termDurationsApi.fetchData(null, 'GET', `${TERM_DURATIONS_URL}/findall`, 'loadTermDurations');
        groupsApi.fetchData(null, 'GET', `${GROUPS_URL}/findall`, 'loadGroups');
    };

    const loadSavingsAccounts = () => {
        setLoading(true);
        accountsApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadAccounts');
    };

    const loadGroupAccounts = () => {
        groupAccountsApi.fetchData(null, 'GET', `${BASE_URL}/findallgroup`, 'loadGroupAccounts');
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
            [name]: value ? formatLocalDate(value) : null
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
        if (!savingsAccount.internalAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte interne (suivi)');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (isSubmitting) return; // Prevent double-click
        if (!validateForm()) return;

        setIsSubmitting(true);

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

    const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setGroupAccount(prev => ({ ...prev, [name]: value }));
    };

    const handleGroupDropdownChange = (name: string, value: any) => {
        setGroupAccount(prev => ({ ...prev, [name]: value }));
    };

    const handleGroupDateChange = (name: string, value: Date | null) => {
        setGroupAccount(prev => ({
            ...prev,
            [name]: value ? formatLocalDate(value) : null
        }));
    };

    const handleGroupNumberChange = (name: string, value: number | null | undefined) => {
        setGroupAccount(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const validateGroupForm = (): boolean => {
        if (!groupAccount.solidarityGroupId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un groupe de solidarité');
            return false;
        }
        if (!groupAccount.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        if (!groupAccount.currencyId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une devise');
            return false;
        }
        return true;
    };

    const handleGroupSubmit = () => {
        if (isSubmittingGroup) return;
        if (!validateGroupForm()) return;
        setIsSubmittingGroup(true);
        const payload = { ...groupAccount, userAction: getCurrentUser() };
        if (groupAccount.id) {
            groupActionsApi.fetchData(payload, 'PUT', `${BASE_URL}/update/${groupAccount.id}`, 'updateGroup');
        } else {
            groupActionsApi.fetchData(payload, 'POST', `${BASE_URL}/new`, 'createGroup');
        }
    };

    const resetGroupForm = () => {
        setGroupAccount(new SavingsAccountClass());
    };

    const editGroupAccount = (rowData: SavingsAccount) => {
        setGroupAccount({
            ...rowData,
            solidarityGroupId: rowData.solidarityGroup?.id || rowData.solidarityGroupId,
            branchId: rowData.branch?.id || rowData.branchId,
            currencyId: rowData.currency?.id || rowData.currencyId,
            statusId: rowData.status?.id || rowData.statusId,
            internalAccountId: rowData.internalAccountId || null,
            termDurationId: rowData.termDuration?.id || rowData.termDurationId || null
        });
        setGroupActiveIndex(0);
        setActiveIndex(3);
    };

    const confirmDeleteGroupAccount = (rowData: SavingsAccount) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le compte "${rowData.accountNumber}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                groupActionsApi.fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'deleteGroup');
            }
        });
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
            internalAccountId: rowData.internalAccountId || null,
            termDurationId: rowData.termDuration?.id || rowData.termDurationId || null
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
        setNewStatusId(null);
        setStatusDialog(true);
    };

    const handleStatusChange = () => {
        if (!statusChangeAccount || !newStatusId) return;
        const selectedStatus = statuses.find(s => s.id === newStatusId);
        if (!selectedStatus?.code) return;
        const currentUser = getCurrentUser();
        statusApi.fetchData(
            { statusCode: selectedStatus.code, userAction: currentUser },
            'PUT',
            `${BASE_URL}/change-status/${statusChangeAccount.id}`,
            'changeStatus'
        );
    };

    const openTermDepositDialog = (rowData: SavingsAccount) => {
        setTermDepositAccount(rowData);
        setTermDepositParams({
            currentBalance: rowData.currentBalance || 0,
            blockedAmount: rowData.blockedAmount || 0,
            minimumBalance: rowData.minimumBalance || 0,
            interestRate: rowData.interestRate || 0,
            accruedInterest: rowData.accruedInterest || 0,
            termDurationId: rowData.termDurationId || rowData.termDuration?.id || null,
            termStartDate: rowData.termStartDate || null,
            maturityDate: rowData.maturityDate || null,
            interestInternalAccountId: rowData.interestInternalAccountId || rowData.interestInternalAccount?.accountId || null
        });
        setTermDepositDialog(true);
    };

    const calculateMaturityDate = (startDate: string | null, months: number): string | null => {
        if (!startDate) return null;
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + months);
        return formatLocalDate(date);
    };

    const calculateAccruedInterest = (amount: number, rate: number, months: number): number => {
        // Simple interest: amount * (rate/100) * (months/12)
        return Math.round(amount * (rate / 100) * (months / 12));
    };

    const handleTermDurationChange = (termDurationId: number | null) => {
        const td = termDurations.find((t: any) => t.id === termDurationId);
        setTermDepositParams(prev => {
            const rate = td ? td.interestRate : prev.interestRate;
            const months = td ? td.months : 0;
            const maturityDate = calculateMaturityDate(prev.termStartDate, months);
            const accruedInterest = calculateAccruedInterest(prev.currentBalance, rate, months);
            return {
                ...prev,
                termDurationId,
                interestRate: rate,
                maturityDate,
                accruedInterest
            };
        });
    };

    const handleTermStartDateChange = (date: Date | null) => {
        const dateStr = date ? formatLocalDate(date) : null;
        const td = termDurations.find((t: any) => t.id === termDepositParams.termDurationId);
        const months = td ? td.months : 0;
        const maturityDate = calculateMaturityDate(dateStr, months);
        const accruedInterest = calculateAccruedInterest(
            termDepositParams.currentBalance,
            termDepositParams.interestRate,
            months
        );
        setTermDepositParams(prev => ({
            ...prev,
            termStartDate: dateStr,
            maturityDate,
            accruedInterest
        }));
    };

    const handleTermDepositParamsUpdate = () => {
        if (!termDepositAccount) return;
        const currentUser = getCurrentUser();
        termDepositApi.fetchData(
            {
                ...termDepositAccount,
                clientId: termDepositAccount.client?.id || termDepositAccount.clientId,
                branchId: termDepositAccount.branch?.id || termDepositAccount.branchId,
                currencyId: termDepositAccount.currency?.id || termDepositAccount.currencyId,
                statusId: termDepositAccount.status?.id || termDepositAccount.statusId,
                termDurationId: termDepositParams.termDurationId,
                interestRate: termDepositParams.interestRate,
                minimumBalance: termDepositParams.minimumBalance,
                termStartDate: termDepositParams.termStartDate,
                maturityDate: termDepositParams.maturityDate,
                blockedAmount: termDepositParams.currentBalance,
                accruedInterest: termDepositParams.accruedInterest,
                interestInternalAccountId: termDepositParams.interestInternalAccountId,
                userAction: currentUser
            },
            'PUT',
            `${BASE_URL}/update/${termDepositAccount.id}`,
            'updateTermParams'
        );
    };

    const openValidateTermDialog = (rowData: SavingsAccount) => {
        setValidateTermAccount(rowData);
        setValidateTermDialog(true);
    };

    const handleValidateTermDeposit = () => {
        if (!validateTermAccount) return;
        const currentUser = getCurrentUser();
        validateTermApi.fetchData(
            { userAction: currentUser },
            'POST',
            `${BASE_URL}/${validateTermAccount.id}/validate-term-deposit`,
            'validateTerm'
        );
    };

    const canValidateTermDeposit = (rowData: SavingsAccount): boolean => {
        return !!(
            (rowData.termDuration?.id || rowData.termDurationId) &&
            rowData.termStartDate &&
            !rowData.termDepositValidated
        );
    };

    const canProcessMaturity = (rowData: SavingsAccount): boolean => {
        if (!rowData.termDepositValidated || !rowData.maturityDate) return false;
        const today = formatLocalDate(new Date());
        return rowData.maturityDate <= today;
    };

    const openMaturityDialog = (rowData: SavingsAccount) => {
        setMaturityAccount(rowData);
        setMaturityDialog(true);
    };

    const openHistoryDialog = (rowData: SavingsAccount) => {
        setHistoryAccount(rowData);
        setTermDepositHistory([]);
        setHistoryDialog(true);
        historyApi.fetchData(null, 'GET', `${BASE_URL}/${rowData.id}/term-deposit-history`, 'history');
    };

    const openOpsHistoryDialog = (rowData: SavingsAccount) => {
        setOpsHistoryAccount(rowData);
        setOpsHistory([]);
        setOpsHistorySummary(null);
        setOpsHistoryFrom(null);
        setOpsHistoryTo(null);
        setOpsHistoryType('');
        setOpsHistoryDialog(true);
        loadOpsHistory(rowData, null, null, '');
    };

    const loadOpsHistory = (account: SavingsAccount, from: Date | null, to: Date | null, type: string) => {
        let url = `${API_BASE_URL}/api/epargne/reports/operation-history?accountId=${account.id}`;
        if (from) url += `&dateFrom=${from.toISOString().split('T')[0]}`;
        if (to) url += `&dateTo=${to.toISOString().split('T')[0]}`;
        if (type) url += `&operationType=${type}`;
        opsHistoryApi.fetchData(null, 'GET', url, 'opsHistory');
    };

    const handlePrintCertificate = (account: SavingsAccount) => {
        setHistoryAccount(account);
        setTermDepositHistory([]);
        setPendingPrint(true);
        historyApi.fetchData(null, 'GET', `${BASE_URL}/${account.id}/term-deposit-history`, 'printCertificate');
    };

    const executePrint = () => {
        setTimeout(() => {
            if (printRef.current) {
                const printContent = printRef.current.innerHTML.replace(/src="\/layout\//g, `src="${window.location.origin}/layout/`);
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(`<!DOCTYPE html><html><head><title>${historyAccount?.accountType === 'BLOCKED' ? 'Certificat BLOC' : 'Certificat DAT'} - ${historyAccount?.accountNumber}</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; } @page { margin: 10mm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>${printContent}</body></html>`);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
                }
            }
        }, 300);
    };

    const handleProcessMaturity = () => {
        if (!maturityAccount) return;
        const currentUser = getCurrentUser();
        maturityApi.fetchData(
            { userAction: currentUser },
            'POST',
            `${BASE_URL}/${maturityAccount.id}/process-term-maturity`,
            'processMaturity'
        );
    };

    const openDocumentsDialog = (rowData: SavingsAccount) => {
        setDocumentsAccount(rowData);
        setDocumentsDialog(true);
        if (rowData.id) {
            loadAccountDocuments(rowData.id);
        }
    };

    const openAddDocDialog = () => {
        setSelectedFile(null);
        setNewDocName('');
        if (fileUploadRef.current) fileUploadRef.current.clear();
        setAddDocDialog(true);
    };

    const handleFileSelect = (e: any) => {
        if (e.files && e.files.length > 0) {
            const file = e.files[0];
            setSelectedFile(file);
            if (!newDocName) {
                setNewDocName(file.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    const handleAddDocument = async () => {
        if (!documentsAccount || !selectedFile) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un fichier');
            return;
        }
        if (!newDocName.trim()) {
            showToast('warn', 'Attention', 'Veuillez saisir le nom du document');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('folder', `epargne/documents/${documentsAccount.id}`);

            const token = Cookies.get('token');
            const uploadResponse = await fetch(buildApiUrl('/api/files/upload'), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('Erreur lors du téléchargement du fichier');
            }

            const uploadData = await uploadResponse.json();
            const filePath = uploadData.filePath || uploadData.path || uploadData.url;

            const currentUser = getCurrentUser();
            const docResponse = await fetch(buildApiUrl('/api/epargne/savings-account-documents/new'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify({
                    savingsAccountId: documentsAccount.id,
                    documentName: newDocName.trim(),
                    filePath,
                    fileSizeKb: Math.round(selectedFile.size / 1024),
                    mimeType: selectedFile.type,
                    userAction: currentUser
                })
            });

            if (docResponse.ok) {
                showToast('success', 'Succès', 'Document ajouté avec succès');
                setAddDocDialog(false);
                setSelectedFile(null);
                setNewDocName('');
                if (fileUploadRef.current) fileUploadRef.current.clear();
                loadAccountDocuments(documentsAccount.id!);
            } else {
                throw new Error('Erreur lors de l\'enregistrement du document');
            }
        } catch (err: any) {
            showToast('error', 'Erreur', err.message || 'Erreur lors du téléchargement');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = (doc: any) => {
        confirmDialog({
            message: `Supprimer le document "${doc.documentName}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                try {
                    const token = Cookies.get('token');
                    const response = await fetch(buildApiUrl(`/api/epargne/savings-account-documents/delete/${doc.id}`), {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: {
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        }
                    });
                    if (response.ok) {
                        showToast('success', 'Succès', 'Document supprimé');
                        if (documentsAccount?.id) loadAccountDocuments(documentsAccount.id);
                    }
                } catch (err) {
                    showToast('error', 'Erreur', 'Erreur lors de la suppression');
                }
            }
        });
    };

    const handleViewDocument = (doc: any) => {
        if (doc.filePath) {
            window.open(buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(doc.filePath)}`), '_blank');
        }
    };

    const termDepositActionsTemplate = (rowData: SavingsAccount) => {
        const isBlocked = rowData.accountType === 'BLOCKED';
        return (
            <div className="flex gap-1 flex-wrap">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewAccount(rowData)}
                    tooltip="Voir"
                />
                {can('EPARGNE_TERM_DEPOSIT_CREATE') && (
                    <Button
                        icon="pi pi-cog"
                        className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => openTermDepositDialog(rowData)}
                        tooltip="Paramètres financiers"
                    />
                )}
                {canValidateTermDeposit(rowData) && can('EPARGNE_TERM_DEPOSIT_VALIDATE') && (
                    <Button
                        icon="pi pi-check-circle"
                        className="p-button-rounded p-button-sm"
                        severity="warning"
                        onClick={() => openValidateTermDialog(rowData)}
                        tooltip={isBlocked ? 'Valider le blocage' : 'Valider le dépôt à terme'}
                    />
                )}
                {rowData.termDepositValidated && !canProcessMaturity(rowData) && (
                    <Tag value="Validé" severity="success" icon="pi pi-check" className="mt-1" />
                )}
                {rowData.termDepositValidated && (
                    <Button
                        icon="pi pi-print"
                        className="p-button-rounded p-button-sm"
                        severity="help"
                        onClick={() => handlePrintCertificate(rowData)}
                        tooltip="Imprimer Certificat"
                    />
                )}
                {canProcessMaturity(rowData) && can('EPARGNE_TERM_DEPOSIT_MATURITY') && (
                    <Button
                        icon="pi pi-wallet"
                        className="p-button-rounded p-button-sm"
                        severity="info"
                        onClick={() => openMaturityDialog(rowData)}
                        tooltip={isBlocked ? 'Traiter le déblocage' : 'Traiter l\'échéance'}
                    />
                )}
                {(rowData.termDepositCount || 0) > 0 && !rowData.termDepositValidated && (
                    <Tag value={`Cycle ${rowData.termDepositCount}`} severity="info" icon="pi pi-refresh" className="mt-1" />
                )}
                <Button
                    icon="pi pi-history"
                    className="p-button-rounded p-button-sm"
                    severity="secondary"
                    onClick={() => openHistoryDialog(rowData)}
                    tooltip={isBlocked ? 'Historique des blocages' : 'Historique des dépôts à terme'}
                />
                <Button
                    icon="pi pi-list"
                    className="p-button-rounded p-button-sm"
                    severity="secondary"
                    onClick={() => openOpsHistoryDialog(rowData)}
                    tooltip="Toutes les opérations"
                />
                <Button
                    icon="pi pi-folder"
                    className="p-button-rounded p-button-sm"
                    severity="info"
                    onClick={() => openDocumentsDialog(rowData)}
                    tooltip="Documents"
                />
                {!rowData.termDepositValidated && (
                    <Button
                        icon="pi pi-sync"
                        className="p-button-rounded p-button-help p-button-sm"
                        onClick={() => openStatusDialog(rowData)}
                        tooltip="Changer Statut"
                    />
                )}
                {!rowData.termDepositValidated && (
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-rounded p-button-warning p-button-sm"
                        onClick={() => editAccount(rowData)}
                        tooltip="Modifier"
                    />
                )}
                {!rowData.termDepositValidated && (rowData.status?.code === 'PENDING_ACTIVATION' || rowData.status?.nameFr === 'En attente d\'activation') && (
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
            'COMPULSORY': 'Obligatoire',
            'BLOCKED': 'Épargne Bloqué'
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
                    icon="pi pi-folder"
                    className="p-button-rounded p-button-sm"
                    severity="info"
                    onClick={() => openDocumentsDialog(rowData)}
                    tooltip="Documents"
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
                        termDurations={termDurations}
                        selectedClientType={selectedClientType}
                    />
                    <div className="flex gap-2 mt-4">
                        <Button
                            label={savingsAccount.id ? 'Mettre à jour' : 'Créer le Compte'}
                            icon="pi pi-save"
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            disabled={isSubmitting}
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
                        value={savingsAccounts.filter(a => !a.solidarityGroup && a.accountType !== 'TERM_DEPOSIT' && a.accountType !== 'BLOCKED')}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        globalFilterFields={['accountNumber', 'client.firstName', 'client.lastName', 'client.businessName', 'branch.name', 'userAction']}
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

                <TabPanel header="Dépôts à Terme" leftIcon="pi pi-clock mr-2">
                    <DataTable
                        value={savingsAccounts.filter(a => !a.solidarityGroup && a.accountType === 'TERM_DEPOSIT')}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        globalFilterFields={['accountNumber', 'client.firstName', 'client.lastName', 'client.businessName', 'branch.name', 'userAction']}
                        header={
                            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                <div>
                                    <h5 className="m-0">Comptes Dépôt à Terme</h5>
                                    <small className="text-500">Dépôts et retraits autorisés — Intérêts calculés et crédités mensuellement</small>
                                </div>
                                <div className="flex gap-2 align-items-center">
                                    <Button
                                        label="Calculer Intérêts du Mois"
                                        icon="pi pi-percentage"
                                        className="p-button-warning p-button-sm"
                                        onClick={openMonthlyInterestDialog}
                                        tooltip="Calculer et créditer les intérêts mensuels sur tous les comptes Dépôt à Terme"
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
                        emptyMessage="Aucun compte dépôt à terme trouvé"
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
                        <Column field="branch.name" header="Agence" sortable />
                        <Column header="Solde Actuel" body={balanceBodyTemplate} sortable sortField="currentBalance" />
                        <Column field="interestRate" header="Taux (%)" sortable body={(row) => `${(row.interestRate || 0).toFixed(2)} %`} />
                        <Column
                            header="Intérêts du Mois"
                            sortable
                            sortField="accruedInterest"
                            body={(row) => {
                                const interest = row.accruedInterest || 0;
                                const code = row.currency?.code || 'FBU';
                                return `${interest.toLocaleString('fr-FR')} ${code}`;
                            }}
                        />
                        <Column field="openingDate" header="Date d'Ouverture" sortable />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={termDepositActionsTemplate} style={{ width: '250px' }} />
                    </DataTable>

                    {/* ===== Planned Task Section ===== */}
                    <div className="mt-4">
                        <Card style={{ border: schedulerStatus?.currentMonthProcessed ? '2px solid #4caf50' : '1px solid #ddd' }}>
                            <div className="flex align-items-center justify-content-between mb-2">
                                <h4 className="m-0">
                                    <i className="pi pi-clock mr-2 text-blue-500" />
                                    Exécution Automatique (Planificateur)
                                </h4>
                                <Button
                                    label="Rafraîchir"
                                    icon="pi pi-refresh"
                                    className="p-button-outlined p-button-sm"
                                    onClick={() => schedulerStatusApi.fetchData(null, 'GET', `${BASE_URL}/monthly-interest-status`, 'schedulerStatus')}
                                    loading={schedulerStatusApi.loading && schedulerStatusApi.callType === 'schedulerStatus'}
                                />
                            </div>
                            <p className="text-color-secondary mt-0 mb-3">
                                Le calcul des intérêts mensuels sur les comptes Dépôt à Terme est exécuté automatiquement selon le calendrier ci-dessous.
                            </p>
                            <Divider className="mt-0" />

                            {/* Active indicator */}
                            <div className={`p-3 border-round mb-4 flex align-items-center gap-3 ${schedulerStatus?.currentMonthProcessed ? 'bg-green-50' : 'bg-blue-50'}`}
                                style={{ border: schedulerStatus?.currentMonthProcessed ? '1px solid #4caf50' : '1px solid #2196F3' }}>
                                <i className={`pi ${schedulerStatus?.currentMonthProcessed ? 'pi-check-circle text-green-600' : 'pi-clock text-blue-600'}`}
                                    style={{ fontSize: '1.5rem' }} />
                                <div className="flex-grow-1">
                                    <div className="font-bold">Planificateur actif</div>
                                    <div className="text-sm text-600">
                                        Tâche planifiée : {schedulerStatus?.nextRunDescription || '1er de chaque mois à 00h01'}
                                    </div>
                                </div>
                                <Tag value="Actif" severity="success" />
                            </div>

                            {/* Status grid */}
                            <div className="grid">
                                <div className="col-12 md:col-4">
                                    <div className="text-500 text-sm mb-2">Statut du mois en cours</div>
                                    <Tag
                                        value={schedulerStatus?.currentMonthProcessed ? '✓ Traité automatiquement' : 'Non encore traité'}
                                        severity={schedulerStatus?.currentMonthProcessed ? 'success' : 'info'}
                                    />
                                </div>
                                <div className="col-12 md:col-4">
                                    <div className="text-500 text-sm mb-2">Dernière exécution automatique</div>
                                    <div className="font-bold text-sm">
                                        {schedulerStatus?.lastRunMessage || 'Jamais exécuté'}
                                    </div>
                                </div>
                                <div className="col-12 md:col-4">
                                    <div className="text-500 text-sm mb-2">Prochaine exécution prévue</div>
                                    <div className="font-bold text-sm">
                                        {(() => {
                                            const now = new Date();
                                            const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                                            return next.toLocaleDateString('fr-FR') + ' à 00h01';
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-info-circle text-600" />
                                <small className="text-600">
                                    Pour lancer manuellement le calcul des intérêts avant la date planifiée, utilisez le bouton{' '}
                                    <strong>"Calculer Intérêts du Mois"</strong> dans le tableau ci-dessus.
                                </small>
                            </div>
                        </Card>
                    </div>
                </TabPanel>

                <TabPanel header="Comptes Groupe" leftIcon="pi pi-users mr-2">
                    <TabView activeIndex={groupActiveIndex} onTabChange={(e) => setGroupActiveIndex(e.index)}>
                        <TabPanel header="Nouveau Compte Groupe" leftIcon="pi pi-plus mr-2">
                            <div className="card p-fluid">
                                <div className="surface-100 p-3 border-round mb-4">
                                    <h5 className="m-0 mb-3 text-primary">
                                        <i className="pi pi-wallet mr-2"></i>
                                        Informations du Compte
                                    </h5>
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Numéro de Compte</label>
                                            <InputText value={groupAccount.accountNumber} disabled placeholder="Généré automatiquement" className="w-full" readOnly />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Type de Compte *</label>
                                            <Dropdown
                                                value={groupAccount.accountType}
                                                options={[
                                                    { label: 'Épargne Régulière', value: 'REGULAR' },
                                                    { label: 'Dépôt à Terme', value: 'TERM_DEPOSIT' },
                                                    { label: 'Épargne Bloqué', value: 'BLOCKED' }
                                                ]}
                                                onChange={(e) => handleGroupDropdownChange('accountType', e.value)}
                                                optionLabel="label" optionValue="value"
                                                placeholder="Sélectionner le type" className="w-full"
                                            />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Statut</label>
                                            <Dropdown
                                                value={groupAccount.statusId}
                                                options={statuses}
                                                onChange={(e) => handleGroupDropdownChange('statusId', e.value)}
                                                optionLabel="nameFr" optionValue="id"
                                                placeholder="Sélectionner le statut" className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="surface-100 p-3 border-round mb-4">
                                    <h5 className="m-0 mb-3 text-primary">
                                        <i className="pi pi-users mr-2"></i>
                                        Groupe et Agence
                                    </h5>
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Groupe de Solidarité *</label>
                                            <Dropdown
                                                value={groupAccount.solidarityGroupId}
                                                options={solidarityGroups}
                                                onChange={(e) => handleGroupDropdownChange('solidarityGroupId', e.value)}
                                                optionLabel="groupName" optionValue="id"
                                                placeholder="Sélectionner un groupe"
                                                filter filterBy="groupName,groupCode"
                                                filterPlaceholder="Rechercher..."
                                                className="w-full"
                                                itemTemplate={(item: any) => <span>{item.groupName} ({item.groupCode})</span>}
                                                valueTemplate={(item: any, props: any) => item ? <span>{item.groupName} ({item.groupCode})</span> : <span>{props?.placeholder}</span>}
                                            />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Agence *</label>
                                            <Dropdown
                                                value={groupAccount.branchId}
                                                options={branches}
                                                onChange={(e) => handleGroupDropdownChange('branchId', e.value)}
                                                optionLabel="name" optionValue="id"
                                                placeholder="Sélectionner l'agence"
                                                filter className="w-full"
                                            />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Devise *</label>
                                            <Dropdown
                                                value={groupAccount.currencyId}
                                                options={currencies}
                                                onChange={(e) => handleGroupDropdownChange('currencyId', e.value)}
                                                optionLabel="code" optionValue="id"
                                                placeholder="Sélectionner la devise" className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-6">
                                            <label className="font-medium">Compte Interne (suivi)</label>
                                            <Dropdown
                                                value={groupAccount.internalAccountId}
                                                options={internalAccounts.filter((a: any) => a.actif)}
                                                onChange={(e) => handleGroupDropdownChange('internalAccountId', e.value)}
                                                optionLabel="_displayLabel" optionValue="accountId"
                                                placeholder="Sélectionner le compte interne"
                                                filter filterBy="_displayLabel" className="w-full"
                                                itemTemplate={(item: any) => <span>{item.codeCompte} - {item.libelle} ({item.accountNumber})</span>}
                                                valueTemplate={(item: any, props: any) => item ? <span>{item.codeCompte} - {item.libelle}</span> : <span>{props?.placeholder}</span>}
                                            />
                                        </div>
                                        <div className="field col-12 md:col-3">
                                            <label className="font-medium">Signatures Requises</label>
                                            <InputNumber
                                                value={groupAccount.requiredSignatures}
                                                onValueChange={(e) => handleGroupNumberChange('requiredSignatures', e.value)}
                                                min={1} max={10} showButtons className="w-full"
                                            />
                                        </div>
                                        <div className="field col-12 md:col-3">
                                            <label className="font-medium">Date d'Ouverture *</label>
                                            <Calendar
                                                value={groupAccount.openingDate ? new Date(groupAccount.openingDate) : null}
                                                onChange={(e) => handleGroupDateChange('openingDate', e.value as Date | null)}
                                                dateFormat="dd/mm/yy" showIcon className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {groupAccount.accountType !== 'BLOCKED' && (
                                <div className="surface-100 p-3 border-round mb-4">
                                    <h5 className="m-0 mb-3 text-primary"><i className="pi pi-dollar mr-2"></i>Soldes et Paramètres</h5>
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Taux d'Intérêt (%)</label>
                                            <InputNumber
                                                value={groupAccount.interestRate}
                                                onValueChange={(e) => handleGroupNumberChange('interestRate', e.value)}
                                                mode="decimal" suffix=" %" min={0} max={100}
                                                minFractionDigits={2} maxFractionDigits={2} className="w-full"
                                                readOnly={groupAccount.accountType !== 'TERM_DEPOSIT'}
                                            />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Solde Minimum</label>
                                            <InputNumber
                                                value={groupAccount.minimumBalance}
                                                onValueChange={(e) => handleGroupNumberChange('minimumBalance', e.value)}
                                                mode="decimal" min={0} className="w-full" readOnly
                                            />
                                        </div>
                                    </div>
                                    {groupAccount.accountType === 'TERM_DEPOSIT' && (
                                    <div className="formgrid grid mt-2">
                                        <div className="field col-12 md:col-6">
                                            <label className="font-medium">Compte Interne (intérêts) *</label>
                                            <Dropdown
                                                value={groupAccount.interestInternalAccountId}
                                                options={internalAccounts.filter((a: any) => a.actif)}
                                                onChange={(e) => handleGroupDropdownChange('interestInternalAccountId', e.value)}
                                                optionLabel="_displayLabel" optionValue="accountId"
                                                placeholder="Sélectionner le compte intérêts"
                                                filter filterBy="_displayLabel" className="w-full"
                                                itemTemplate={(item: any) => <span>{item.codeCompte} - {item.libelle} ({item.accountNumber})</span>}
                                                valueTemplate={(item: any, props: any) => item ? <span>{item.codeCompte} - {item.libelle}</span> : <span>{props?.placeholder}</span>}
                                            />
                                        </div>
                                    </div>
                                    )}
                                </div>
                                )}

                                {groupAccount.accountType === 'BLOCKED' && (
                                <div className="surface-100 p-3 border-round mb-4">
                                    <h5 className="m-0 mb-3 text-primary"><i className="pi pi-lock mr-2"></i>Paramètres Épargne Bloqué</h5>
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Durée du Blocage</label>
                                            <Dropdown
                                                value={groupAccount.termDurationId}
                                                options={termDurations}
                                                onChange={(e) => {
                                                    const td = termDurations.find((t: any) => t.id === e.value);
                                                    handleGroupDropdownChange('termDurationId', e.value);
                                                    if (td) handleGroupNumberChange('interestRate', td.interestRate);
                                                }}
                                                optionLabel="nameFr" optionValue="id"
                                                placeholder="Sélectionner la durée" className="w-full"
                                                itemTemplate={(item: any) => <span>{item.nameFr} ({item.months} mois) - {item.interestRate?.toFixed(2)}%</span>}
                                                valueTemplate={(item: any, props: any) => item ? <span>{item.nameFr} ({item.months} mois) - {item.interestRate?.toFixed(2)}%</span> : <span>{props?.placeholder}</span>}
                                            />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Taux d'Intérêt (%)</label>
                                            <InputNumber
                                                value={groupAccount.interestRate}
                                                mode="decimal" suffix=" %" min={0} max={100}
                                                minFractionDigits={2} maxFractionDigits={2}
                                                className="w-full" disabled={!!groupAccount.termDurationId} readOnly
                                            />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-medium">Date de Début du Blocage</label>
                                            <Calendar
                                                value={groupAccount.termStartDate ? new Date(groupAccount.termStartDate) : null}
                                                onChange={(e) => {
                                                    const date = e.value as Date | null;
                                                    handleGroupDateChange('termStartDate', date);
                                                    const td = termDurations.find((t: any) => t.id === groupAccount.termDurationId);
                                                    if (date && td) {
                                                        const maturity = new Date(date);
                                                        maturity.setMonth(maturity.getMonth() + td.months);
                                                        handleGroupDateChange('maturityDate', maturity);
                                                    }
                                                }}
                                                dateFormat="dd/mm/yy" showIcon className="w-full" readOnlyInput
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Tag value="Virement autorisé" severity="success" icon="pi pi-check" />
                                        <Tag value="Dépôt interdit" severity="danger" icon="pi pi-times" />
                                        <Tag value="Retrait interdit" severity="danger" icon="pi pi-times" />
                                    </div>
                                </div>
                                )}

                                <div className="surface-100 p-3 border-round mb-4">
                                    <h5 className="m-0 mb-3 text-primary"><i className="pi pi-file mr-2"></i>Notes</h5>
                                    <InputText name="notes" value={groupAccount.notes || ''} onChange={handleGroupChange} placeholder="Notes additionnelles..." className="w-full" />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button
                                    label={groupAccount.id ? 'Mettre à jour' : 'Créer le Compte'}
                                    icon="pi pi-save"
                                    onClick={handleGroupSubmit}
                                    loading={isSubmittingGroup}
                                    disabled={isSubmittingGroup}
                                    className="p-button-success"
                                />
                                <Button label="Réinitialiser" icon="pi pi-refresh" onClick={resetGroupForm} className="p-button-secondary" />
                            </div>
                        </TabPanel>

                        <TabPanel header="Liste des Comptes Groupe" leftIcon="pi pi-list mr-2">
                            <DataTable
                                value={groupAccounts}
                                paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={groupAccountsApi.loading}
                                globalFilter={globalFilter}
                                globalFilterFields={['accountNumber', 'solidarityGroup.groupName', 'solidarityGroup.groupCode', 'branch.name', 'userAction']}
                                header={
                                    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                        <h5 className="m-0">Comptes Épargne des Groupes</h5>
                                        <span className="p-input-icon-left">
                                            <i className="pi pi-search" />
                                            <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
                                        </span>
                                    </div>
                                }
                                emptyMessage="Aucun compte groupe trouvé"
                                stripedRows showGridlines size="small"
                                sortField="openingDate" sortOrder={-1}
                            >
                                <Column field="accountNumber" header="N° Compte" sortable />
                                <Column
                                    header="Groupe"
                                    sortable sortField="solidarityGroup.groupName"
                                    body={(row) => row.solidarityGroup ? `${row.solidarityGroup.groupName} (${row.solidarityGroup.groupCode})` : '-'}
                                />
                                <Column field="branch.name" header="Agence" sortable />
                                <Column header="Type" body={accountTypeBodyTemplate} />
                                <Column header="Solde" body={balanceBodyTemplate} sortable sortField="currentBalance" />
                                <Column field="openingDate" header="Date d'Ouverture" sortable />
                                <Column header="Statut" body={statusBodyTemplate} />
                                <Column field="userAction" header="Utilisateur" sortable />
                                <Column
                                    header="Actions"
                                    style={{ width: '160px' }}
                                    body={(rowData: SavingsAccount) => (
                                        <div className="flex gap-1 flex-wrap">
                                            <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm" onClick={() => viewAccount(rowData)} tooltip="Voir" />
                                            <Button icon="pi pi-sync" className="p-button-rounded p-button-help p-button-sm" onClick={() => openStatusDialog(rowData)} tooltip="Changer Statut" />
                                            <Button icon="pi pi-folder" className="p-button-rounded p-button-sm" severity="info" onClick={() => openDocumentsDialog(rowData)} tooltip="Documents" />
                                            <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" onClick={() => editGroupAccount(rowData)} tooltip="Modifier" />
                                            {(rowData.status?.code === 'PENDING_ACTIVATION' || rowData.status?.nameFr === 'En attente d\'activation') && (
                                                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDeleteGroupAccount(rowData)} tooltip="Supprimer" />
                                            )}
                                        </div>
                                    )}
                                />
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </TabPanel>

                <TabPanel header="Épargne Bloqué" leftIcon="pi pi-lock mr-2">
                    <DataTable
                        value={savingsAccounts.filter(a => !a.solidarityGroup && a.accountType === 'BLOCKED')}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        globalFilterFields={['accountNumber', 'client.firstName', 'client.lastName', 'client.businessName', 'branch.name', 'userAction']}
                        header={
                            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                <div>
                                    <h5 className="m-0">Comptes Épargne Bloqué</h5>
                                    <small className="text-500">Opération autorisée: Virement uniquement</small>
                                </div>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        placeholder="Rechercher..."
                                    />
                                </span>
                            </div>
                        }
                        emptyMessage="Aucun compte épargne bloqué trouvé"
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
                        <Column field="branch.name" header="Agence" sortable />
                        <Column
                            header="Durée Blocage"
                            sortable
                            sortField="termDuration.nameFr"
                            body={(row) => row.termDuration ? `${row.termDuration.nameFr} (${row.termDuration.months} mois)` : '-'}
                        />
                        <Column header="Solde / Bloqué" body={balanceBodyTemplate} sortable sortField="currentBalance" />
                        <Column field="interestRate" header="Taux (%)" sortable body={(row) => `${(row.interestRate || 0).toFixed(2)} %`} />
                        <Column field="termStartDate" header="Début Blocage" sortable body={(row) => row.termStartDate ? new Date(row.termStartDate).toLocaleDateString('fr-FR') : '-'} />
                        <Column field="maturityDate" header="Date Déblocage" sortable body={(row) => row.maturityDate ? new Date(row.maturityDate).toLocaleDateString('fr-FR') : '-'} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={termDepositActionsTemplate} style={{ width: '250px' }} />
                    </DataTable>
                </TabPanel>

                {/* Tab: Comptes du Jour */}
                {can('EPARGNE_SAVINGS_ACCOUNT_VIEW_TODAY') && <TabPanel header="Comptes du Jour" leftIcon="pi pi-calendar mr-2">
                    <DataTable
                        value={savingsAccounts.filter(a => a.openingDate === formatLocalDate(new Date()))}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        globalFilterFields={['accountNumber', 'client.firstName', 'client.lastName', 'client.businessName', 'branch.name', 'userAction']}
                        header={
                            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                <h5 className="m-0">Comptes Ouverts Aujourd'hui</h5>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        placeholder="Rechercher..."
                                    />
                                </span>
                            </div>
                        }
                        emptyMessage="Aucun compte ouvert aujourd'hui"
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
                            body={(row) => row.client ? (row.client.businessName || `${row.client.firstName || ''} ${row.client.lastName || ''}`.trim() || '-') : (row.solidarityGroup?.groupName || '-')}
                        />
                        <Column field="branch.name" header="Agence" sortable />
                        <Column header="Type" body={accountTypeBodyTemplate} />
                        <Column header="Solde" body={balanceBodyTemplate} sortable sortField="currentBalance" />
                        <Column field="openingDate" header="Date d'Ouverture" sortable />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '200px' }} />
                    </DataTable>
                </TabPanel>}

                {/* Tab: Mes Comptes par Période */}
                {can('EPARGNE_SAVINGS_ACCOUNT_VIEW_PERIOD') && <TabPanel header="Mes Comptes par Période" leftIcon="pi pi-filter mr-2">
                    {(() => {
                        const currentUser = getCurrentUser();
                        const filtered = savingsAccounts.filter(a => {
                            if ((a as any).userAction !== currentUser) return false;
                            if (periodStart && a.openingDate && a.openingDate < formatLocalDate(periodStart)) return false;
                            if (periodEnd && a.openingDate && a.openingDate > formatLocalDate(periodEnd)) return false;
                            return true;
                        });
                        return (
                            <DataTable
                                value={filtered}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={loading}
                                header={
                                    <div className="flex flex-column gap-2">
                                        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                            <div>
                                                <h5 className="m-0">Mes Comptes par Période</h5>
                                                <small className="text-500">Utilisateur: <strong>{currentUser}</strong> — {filtered.length} compte(s)</small>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 align-items-center">
                                            <label className="font-medium">Du:</label>
                                            <Calendar
                                                value={periodStart}
                                                onChange={(e) => setPeriodStart(e.value as Date | null)}
                                                dateFormat="dd/mm/yy"
                                                placeholder="Date début"
                                                showIcon
                                            />
                                            <label className="font-medium">Au:</label>
                                            <Calendar
                                                value={periodEnd}
                                                onChange={(e) => setPeriodEnd(e.value as Date | null)}
                                                dateFormat="dd/mm/yy"
                                                placeholder="Date fin"
                                                showIcon
                                                minDate={periodStart || undefined}
                                            />
                                            <Button
                                                label="Réinitialiser"
                                                icon="pi pi-refresh"
                                                onClick={() => { setPeriodStart(null); setPeriodEnd(null); }}
                                                className="p-button-secondary p-button-sm"
                                            />
                                        </div>
                                    </div>
                                }
                                emptyMessage="Aucun compte trouvé pour cette période"
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
                                    body={(row) => row.client ? (row.client.businessName || `${row.client.firstName || ''} ${row.client.lastName || ''}`.trim() || '-') : (row.solidarityGroup?.groupName || '-')}
                                />
                                <Column field="branch.name" header="Agence" sortable />
                                <Column header="Type" body={accountTypeBodyTemplate} />
                                <Column header="Solde" body={balanceBodyTemplate} sortable sortField="currentBalance" />
                                <Column field="openingDate" header="Date d'Ouverture" sortable />
                                <Column header="Statut" body={statusBodyTemplate} />
                                <Column field="userAction" header="Utilisateur" sortable />
                                <Column header="Actions" body={actionsBodyTemplate} style={{ width: '200px' }} />
                            </DataTable>
                        );
                    })()}
                </TabPanel>}

                {/* Tab: Configuration Planificateur DAT */}
                {can('EPARGNE_DAT_SCHEDULER_CONFIG') && <TabPanel header="Configuration Planificateur" leftIcon="pi pi-cog mr-2">
                    <div className="p-3">
                        <Card style={{ border: schedulerStatus?.currentMonthProcessed ? '2px solid #4caf50' : '1px solid #ddd' }}>
                            <div className="flex align-items-center justify-content-between mb-2">
                                <h4 className="m-0">
                                    <i className="pi pi-clock mr-2 text-blue-500" />
                                    Exécution Automatique (Planificateur) — Dépôt à Terme
                                </h4>
                                <div className="flex gap-2">
                                    <Button
                                        label="Historique"
                                        icon="pi pi-history"
                                        className="p-button-outlined p-button-sm"
                                        onClick={() => {
                                            setInterestHistoryDialog(true);
                                            setInterestHistoryExpandedRows(null);
                                            interestHistoryApi.fetchData(null, 'GET', `${BASE_URL}/interest-execution-history`, 'interestHistory');
                                        }}
                                    />
                                    <Button
                                        label="Rafraîchir"
                                        icon="pi pi-refresh"
                                        className="p-button-outlined p-button-sm"
                                        onClick={() => schedulerStatusApi.fetchData(null, 'GET', `${BASE_URL}/monthly-interest-status`, 'schedulerStatus')}
                                        loading={schedulerStatusApi.loading && schedulerStatusApi.callType === 'schedulerStatus'}
                                    />
                                </div>
                            </div>
                            <p className="text-color-secondary mt-0 mb-3">
                                Le calcul des intérêts mensuels sur les comptes Dépôt à Terme est exécuté automatiquement selon le calendrier ci-dessous.
                                Ce planificateur est géré par le serveur et ne peut pas être désactivé depuis l'interface.
                            </p>
                            <Divider className="mt-0" />

                            {/* Active indicator */}
                            <div className={`p-3 border-round mb-4 flex align-items-center gap-3 ${schedulerStatus?.currentMonthProcessed ? 'bg-green-50' : 'bg-blue-50'}`}
                                style={{ border: schedulerStatus?.currentMonthProcessed ? '1px solid #4caf50' : '1px solid #2196F3' }}>
                                <i className={`pi ${schedulerStatus?.currentMonthProcessed ? 'pi-check-circle text-green-600' : 'pi-clock text-blue-600'}`}
                                    style={{ fontSize: '1.5rem' }} />
                                <div className="flex-grow-1">
                                    <div className="font-bold">Planificateur actif</div>
                                    <div className="text-sm text-600">
                                        Tâche planifiée : {schedulerStatus?.nextRunDescription || '1er de chaque mois à 00h01'}
                                    </div>
                                </div>
                                <Tag value="Actif" severity="success" />
                            </div>

                            {/* Status grid */}
                            <div className="grid">
                                <div className="col-12 md:col-4">
                                    <div className="text-500 text-sm mb-2">Statut du mois en cours</div>
                                    <Tag
                                        value={schedulerStatus?.currentMonthProcessed ? '✓ Traité automatiquement' : 'Non encore traité'}
                                        severity={schedulerStatus?.currentMonthProcessed ? 'success' : 'info'}
                                    />
                                </div>
                                <div className="col-12 md:col-4">
                                    <div className="text-500 text-sm mb-2">Dernière exécution automatique</div>
                                    <div className="font-bold text-sm">
                                        {schedulerStatus?.lastRunMessage || 'Jamais exécuté'}
                                    </div>
                                </div>
                                <div className="col-12 md:col-4">
                                    <div className="text-500 text-sm mb-2">Prochaine exécution prévue</div>
                                    <div className="font-bold text-sm">
                                        {(() => {
                                            const now = new Date();
                                            const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                                            return next.toLocaleDateString('fr-FR') + ' à 00h01';
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <Divider />

                            {/* Manual trigger section */}
                            <div className="mb-3">
                                <h6 className="mt-0 mb-2"><i className="pi pi-play-circle mr-2 text-orange-500"></i>Exécution Manuelle</h6>
                                <p className="text-600 text-sm mt-0 mb-3">
                                    Si le calcul automatique n'a pas encore été effectué ce mois-ci, vous pouvez le déclencher manuellement.
                                    Cela calculera et créditera les intérêts sur tous les comptes DAT actifs.
                                </p>
                                <Button
                                    label="Déclencher le calcul maintenant"
                                    icon="pi pi-play"
                                    className="p-button-warning"
                                    onClick={openMonthlyInterestDialog}
                                    disabled={schedulerStatus?.currentMonthProcessed}
                                    tooltip={schedulerStatus?.currentMonthProcessed ? 'Le calcul a déjà été effectué ce mois-ci' : 'Déclencher le calcul des intérêts maintenant'}
                                />
                                {schedulerStatus?.currentMonthProcessed && (
                                    <div className="mt-2 p-2 border-round bg-green-50" style={{ border: '1px solid #4caf50' }}>
                                        <i className="pi pi-check-circle text-green-600 mr-2"></i>
                                        <span className="text-sm text-green-700">Le calcul des intérêts du mois en cours a déjà été effectué.</span>
                                    </div>
                                )}
                            </div>

                            <div className="surface-100 border-round p-3">
                                <div className="flex align-items-center gap-2 mb-2">
                                    <i className="pi pi-info-circle text-blue-600" style={{ fontSize: '1.1rem' }} />
                                    <span className="font-bold text-sm">Informations sur le planificateur</span>
                                </div>
                                <ul className="m-0 pl-4 text-sm text-600" style={{ lineHeight: '1.8' }}>
                                    <li>Le planificateur s'exécute automatiquement le <strong>1er de chaque mois à 00h01</strong>.</li>
                                    <li>Il calcule et crédite les intérêts pour tous les comptes Dépôt à Terme actifs.</li>
                                    <li>Le déclenchement manuel ci-dessus produit le même résultat que l'exécution automatique.</li>
                                    <li>Le statut est mis à jour automatiquement après chaque exécution.</li>
                                    <li>La modification de la fréquence de planification nécessite une reconfiguration du serveur.</li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </TabPanel>}
            </TabView>

            {/* Dialog Intérêts Mensuels DAT */}
            <Dialog
                header={monthlyInterestStep === 'preview' ? 'Calcul des Intérêts Mensuels — Dépôt à Terme' : 'Résultat — Intérêts Crédités'}
                visible={monthlyInterestDialog}
                style={{ width: '750px' }}
                onHide={() => setMonthlyInterestDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Fermer"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => setMonthlyInterestDialog(false)}
                        />
                        {monthlyInterestStep === 'preview' && !schedulerStatus?.currentMonthProcessed && monthlyInterestPreview.filter((r: any) => r.eligible !== false).length > 0 && (
                            <Button
                                label={`Confirmer et Créditer (${monthlyInterestPreview.filter((r: any) => r.eligible !== false).length} compte(s))`}
                                icon="pi pi-check"
                                className="p-button-success"
                                loading={isProcessingInterest}
                                disabled={isProcessingInterest}
                                onClick={handleProcessMonthlyInterest}
                            />
                        )}
                    </div>
                }
            >
                {monthlyInterestStep === 'preview' && (
                    <div>
                        {/* Already processed blocking banner */}
                        {schedulerStatus?.currentMonthProcessed ? (
                            <div className="p-3 border-round mb-3 flex align-items-center gap-3 bg-green-50" style={{ border: '2px solid #4caf50' }}>
                                <i className="pi pi-lock text-green-600" style={{ fontSize: '1.5rem' }} />
                                <div className="flex-grow-1">
                                    <div className="font-bold text-green-700">Calcul déjà effectué ce mois-ci</div>
                                    <div className="text-sm text-green-600 mt-1">
                                        Le calcul des intérêts pour ce mois a déjà été exécuté. Une seule exécution par mois est autorisée.
                                        Consultez l'historique pour voir le détail.
                                    </div>
                                </div>
                                <Button
                                    label="Voir historique"
                                    icon="pi pi-history"
                                    className="p-button-outlined p-button-success p-button-sm"
                                    onClick={() => {
                                        setMonthlyInterestDialog(false);
                                        setInterestHistoryDialog(true);
                                        setInterestHistoryExpandedRows(null);
                                        interestHistoryApi.fetchData(null, 'GET', `${BASE_URL}/interest-execution-history`, 'interestHistory');
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="p-3 border-round mb-3 flex align-items-center gap-2 bg-blue-50">
                                <i className="pi pi-clock text-blue-500" />
                                <div>
                                    <div className="font-semibold text-sm">
                                        Tâche planifiée: {schedulerStatus?.nextRunDescription || '1er de chaque mois à 00h01'}
                                    </div>
                                    <small className="text-600">Mois en cours non encore traité. Vous pouvez lancer manuellement ci-dessous.</small>
                                </div>
                            </div>
                        )}
                        {previewInterestApi.loading ? (
                            <div className="flex justify-content-center p-4">
                                <i className="pi pi-spin pi-spinner text-4xl"></i>
                            </div>
                        ) : monthlyInterestPreview.length === 0 ? (
                            <div className="text-center p-4 text-500">
                                <i className="pi pi-info-circle mr-2" />
                                Aucun compte dépôt à terme actif trouvé.
                            </div>
                        ) : (
                            <>
                                <div className="surface-50 p-3 border-round mb-3">
                                    <small className="text-600">
                                        <i className="pi pi-info-circle mr-1" />
                                        Intérêt = Solde × Taux / 12. Les comptes non éligibles sont affichés en rouge avec la raison.
                                    </small>
                                </div>
                                {/* Eligible accounts */}
                                {monthlyInterestPreview.filter((r: any) => r.eligible !== false).length > 0 && (
                                    <>
                                        <h6 className="mt-0 mb-2 text-green-700"><i className="pi pi-check-circle mr-2"></i>Comptes éligibles ({monthlyInterestPreview.filter((r: any) => r.eligible !== false).length})</h6>
                                        <DataTable value={monthlyInterestPreview.filter((r: any) => r.eligible !== false)} size="small" stripedRows showGridlines className="mb-3">
                                            <Column field="accountNumber" header="N° Compte" sortable />
                                            <Column field="clientName" header="Client" sortable />
                                            <Column header="Solde" body={(row: any) => `${(row.balance || 0).toLocaleString('fr-FR')} ${row.currency}`} />
                                            <Column field="interestRate" header="Taux (%)" body={(row: any) => `${(row.interestRate || 0).toFixed(2)} %`} />
                                            <Column header="Intérêt Calculé" body={(row: any) => (
                                                <span className="font-bold text-green-600">{(row.calculatedInterest || 0).toLocaleString('fr-FR')} {row.currency}</span>
                                            )} />
                                        </DataTable>
                                        <div className="surface-100 p-3 border-round mb-3 flex justify-content-between align-items-center">
                                            <span className="font-bold">Total à créditer :</span>
                                            <span className="font-bold text-green-600 text-lg">
                                                {monthlyInterestPreview.filter((r: any) => r.eligible !== false).reduce((s: number, r: any) => s + (r.calculatedInterest || 0), 0).toLocaleString('fr-FR')} {monthlyInterestPreview[0]?.currency || 'BIF'}
                                            </span>
                                        </div>
                                    </>
                                )}
                                {/* Ineligible accounts */}
                                {monthlyInterestPreview.filter((r: any) => r.eligible === false).length > 0 && (
                                    <>
                                        <h6 className="mt-0 mb-2 text-orange-600"><i className="pi pi-exclamation-triangle mr-2"></i>Comptes non éligibles — configuration requise ({monthlyInterestPreview.filter((r: any) => r.eligible === false).length})</h6>
                                        <DataTable value={monthlyInterestPreview.filter((r: any) => r.eligible === false)} size="small" showGridlines
                                            rowClassName={() => 'bg-orange-50'}>
                                            <Column field="accountNumber" header="N° Compte" sortable />
                                            <Column field="clientName" header="Client" sortable />
                                            <Column header="Solde" body={(row: any) => `${(row.balance || 0).toLocaleString('fr-FR')} ${row.currency}`} />
                                            <Column field="interestRate" header="Taux (%)" body={(row: any) => `${(row.interestRate || 0).toFixed(2)} %`} />
                                            <Column header="Raison" body={(row: any) => (
                                                <span className="text-orange-700 text-sm"><i className="pi pi-exclamation-circle mr-1"></i>{row.ineligibleReason}</span>
                                            )} />
                                        </DataTable>
                                        <div className="mt-2 p-2 border-round bg-orange-50" style={{ border: '1px solid #ff9800' }}>
                                            <small className="text-orange-700">
                                                <i className="pi pi-info-circle mr-1"></i>
                                                Pour rendre un compte éligible, ouvrez l'onglet <strong>Dépôts à Terme</strong>, cliquez sur l'icône <strong>Paramètres</strong> (<i className="pi pi-cog"></i>) et configurez le <strong>Compte d'intérêts</strong>.
                                            </small>
                                        </div>
                                    </>
                                )}
                                {/* All ineligible message */}
                                {monthlyInterestPreview.filter((r: any) => r.eligible !== false).length === 0 && (
                                    <div className="text-center p-3 bg-orange-50 border-round" style={{ border: '1px solid #ff9800' }}>
                                        <i className="pi pi-exclamation-triangle text-orange-500 mr-2" />
                                        <span className="text-orange-700">Aucun compte éligible. Configurez le compte d'intérêts via le bouton <strong>Paramètres</strong> (<i className="pi pi-cog"></i>) sur chaque compte.</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
                {monthlyInterestStep === 'result' && (
                    <div>
                        <div className="surface-50 p-3 border-round mb-3 text-center">
                            <i className="pi pi-check-circle text-green-500 mr-2" style={{ fontSize: '1.5rem' }} />
                            <span className="text-green-600 font-bold">{monthlyInterestResult.length} compte(s) traité(s) avec succès</span>
                        </div>
                        <DataTable value={monthlyInterestResult} size="small" stripedRows showGridlines>
                            <Column field="accountNumber" header="N° Compte" sortable />
                            <Column field="clientName" header="Client" sortable />
                            <Column header="Intérêt Crédité" body={(row) => (
                                <span className="font-bold text-green-600">+ {(row.interest || 0).toLocaleString('fr-FR')} {row.currency}</span>
                            )} />
                            <Column header="Nouveau Solde" body={(row) => (
                                <span className="font-bold text-primary">{(row.newBalance || 0).toLocaleString('fr-FR')} {row.currency}</span>
                            )} />
                        </DataTable>
                        <div className="mt-3 text-center">
                            <Button
                                label="Voir l'historique complet des exécutions"
                                icon="pi pi-history"
                                className="p-button-outlined p-button-sm"
                                onClick={() => {
                                    setMonthlyInterestDialog(false);
                                    setInterestHistoryDialog(true);
                                    setInterestHistoryExpandedRows(null);
                                    interestHistoryApi.fetchData(null, 'GET', `${BASE_URL}/interest-execution-history`, 'interestHistory');
                                }}
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Dialog pour voir les détails */}
            <Dialog
                header="Détails du Compte"
                visible={viewDialog}
                style={{ width: '750px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedAccount && (() => {
                    const acc = selectedAccount;
                    const clientName = acc.solidarityGroup
                        ? `${acc.solidarityGroup.groupName} (${acc.solidarityGroup.groupCode})`
                        : acc.client?.businessName || `${acc.client?.firstName || ''} ${acc.client?.lastName || ''}`.trim() || '-';
                    const branchName = acc.branch?.name || '-';
                    const cCode = acc.currency?.code || 'BIF';
                    const statusName = acc.status?.nameFr || acc.status?.name || '-';
                    const accountTypeLabel = acc.accountType === 'TERM_DEPOSIT' ? 'Dépôt à Terme' : acc.accountType === 'COMPULSORY' ? 'Épargne Obligatoire' : acc.accountType === 'BLOCKED' ? 'Épargne Bloqué' : 'Épargne Régulière';
                    const fmtAmt = (val: number | null | undefined) => (val ?? 0).toLocaleString('fr-FR') + ' ' + cCode;
                    const fmtDate = (val: string | null | undefined) => val ? new Date(val).toLocaleDateString('fr-FR') : '-';
                    const internalAcc = internalAccounts.find((a: any) => a.accountId === acc.internalAccountId);
                    const interestAcc = internalAccounts.find((a: any) => a.accountId === acc.interestInternalAccountId);
                    const termDur = termDurations.find((t: any) => t.id === (acc.termDuration?.id || acc.termDurationId));

                    const DetailRow = ({ label, value }: { label: string; value: any }) => (
                        <div className="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
                            <span className="text-500">{label}</span>
                            <span className="font-semibold text-right">{value || '-'}</span>
                        </div>
                    );

                    return (
                        <div>
                            <div className="surface-100 p-3 border-round mb-3">
                                <h6 className="mt-0 mb-2 text-primary"><i className="pi pi-wallet mr-2"></i>Informations du Compte</h6>
                                <DetailRow label="Numéro de Compte" value={acc.accountNumber} />
                                <DetailRow label="Type de Compte" value={accountTypeLabel} />
                                <DetailRow label="Statut" value={<Tag value={statusName} severity={acc.status?.code === 'ACTIVE' || acc.status?.code === 'ACTIF' ? 'success' : acc.status?.code === 'CLOSED' ? 'danger' : acc.status?.code === 'DORMANT' ? 'warning' : 'info'} />} />
                                <DetailRow label="Date d'Ouverture" value={fmtDate(acc.openingDate)} />
                            </div>

                            <div className="surface-100 p-3 border-round mb-3">
                                <h6 className="mt-0 mb-2 text-primary"><i className="pi pi-user mr-2"></i>Client et Agence</h6>
                                <DetailRow label={acc.solidarityGroup ? 'Groupe de Solidarité' : 'Client'} value={clientName} />
                                <DetailRow label="Agence" value={branchName} />
                                <DetailRow label="Devise" value={cCode} />
                                {internalAcc && <DetailRow label="Compte Interne" value={`${internalAcc.codeCompte} - ${internalAcc.libelle}`} />}
                                <DetailRow label="Signatures Requises" value={acc.requiredSignatures} />
                            </div>

                            {acc.accountType !== 'TERM_DEPOSIT' && (
                                <div className="surface-100 p-3 border-round mb-3">
                                    <h6 className="mt-0 mb-2 text-primary"><i className="pi pi-dollar mr-2"></i>Soldes et Paramètres</h6>
                                    <DetailRow label="Solde Actuel" value={fmtAmt(acc.currentBalance)} />
                                    <DetailRow label="Solde Disponible" value={fmtAmt(acc.availableBalance)} />
                                    <DetailRow label="Montant Bloqué" value={fmtAmt(acc.blockedAmount)} />
                                    <DetailRow label="Solde Minimum" value={fmtAmt(acc.minimumBalance)} />
                                    <DetailRow label="Taux d'Intérêt" value={`${(acc.interestRate ?? 0).toFixed(2)} %`} />
                                    <DetailRow label="Intérêts Courus" value={fmtAmt(acc.accruedInterest)} />
                                </div>
                            )}

                            {acc.accountType === 'TERM_DEPOSIT' && (
                                <div className="surface-100 p-3 border-round mb-3">
                                    <h6 className="mt-0 mb-2 text-primary"><i className="pi pi-lock mr-2"></i>Dépôt à Terme</h6>
                                    <DetailRow label="Durée" value={termDur ? `${termDur.nameFr} (${termDur.months} mois)` : '-'} />
                                    <DetailRow label="Taux d'Intérêt" value={`${(acc.interestRate ?? 0).toFixed(2)} %`} />
                                    <DetailRow label="Solde / Capital" value={fmtAmt(acc.currentBalance)} />
                                    <DetailRow label="Montant Bloqué" value={fmtAmt(acc.blockedAmount)} />
                                    <DetailRow label="Intérêts Courus" value={fmtAmt(acc.accruedInterest)} />
                                    <DetailRow label="Date Début Terme" value={fmtDate(acc.termStartDate)} />
                                    <DetailRow label="Date Échéance" value={fmtDate(acc.maturityDate)} />
                                    <DetailRow label="Validé" value={acc.termDepositValidated ? <Tag value="Oui" severity="success" icon="pi pi-check" /> : <Tag value="Non" severity="warning" icon="pi pi-clock" />} />
                                    <DetailRow label="Cycle" value={acc.termDepositCount || 0} />
                                    {interestAcc && <DetailRow label="Compte Intérêts" value={`${interestAcc.codeCompte} - ${interestAcc.libelle}`} />}
                                </div>
                            )}

                            {acc.notes && (
                                <div className="surface-100 p-3 border-round mb-3">
                                    <h6 className="mt-0 mb-2 text-primary"><i className="pi pi-file mr-2"></i>Notes</h6>
                                    <p className="m-0">{acc.notes}</p>
                                </div>
                            )}

                            {acc.userAction && (
                                <div className="text-right text-500 text-sm mt-2">
                                    Dernière action par: <strong>{acc.userAction}</strong>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </Dialog>

            {/* Dialog pour paramètres Dépôt à Terme / Épargne Bloqué */}
            <Dialog
                header={termDepositAccount?.accountType === 'BLOCKED' ? 'Paramètres Financiers - Épargne Bloqué' : 'Paramètres Financiers - Dépôt à Terme'}
                visible={termDepositDialog}
                style={{ width: '650px' }}
                onHide={() => { setTermDepositDialog(false); setTermDepositAccount(null); }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => { setTermDepositDialog(false); setTermDepositAccount(null); }}
                        />
                        <Button
                            label="Enregistrer"
                            icon="pi pi-save"
                            className="p-button-success"
                            onClick={handleTermDepositParamsUpdate}
                            disabled={!!(
                                termDepositAccount?.termDepositValidated &&
                                termDepositAccount?.maturityDate &&
                                termDepositAccount.maturityDate > formatLocalDate(new Date())
                            )}
                            tooltip={
                                termDepositAccount?.termDepositValidated &&
                                termDepositAccount?.maturityDate &&
                                termDepositAccount.maturityDate > formatLocalDate(new Date())
                                    ? 'Modification impossible: compte validé et période en cours'
                                    : undefined
                            }
                        />
                    </div>
                }
            >
                {termDepositAccount && (
                    <div>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p className="m-0"><strong>Compte:</strong> {termDepositAccount.accountNumber}</p>
                            <p className="m-0"><strong>Client:</strong> {termDepositAccount.client ? (termDepositAccount.client.businessName || `${termDepositAccount.client.firstName || ''} ${termDepositAccount.client.lastName || ''}`.trim() || '-') : '-'}</p>
                        </div>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label className="font-medium mb-2 block">{termDepositAccount?.accountType === 'BLOCKED' ? 'Durée du Blocage *' : 'Durée du Terme *'}</label>
                                <Dropdown
                                    value={termDepositParams.termDurationId}
                                    options={termDurations}
                                    onChange={(e) => handleTermDurationChange(e.value)}
                                    optionLabel="nameFr"
                                    optionValue="id"
                                    placeholder="Sélectionner la durée"
                                    className="w-full"
                                    itemTemplate={(item: any) => (
                                        <span>{item.nameFr} ({item.months} mois) - {item.interestRate?.toFixed(2)}%</span>
                                    )}
                                    valueTemplate={(item: any, props: any) => {
                                        if (item) {
                                            return <span>{item.nameFr} ({item.months} mois) - {item.interestRate?.toFixed(2)}%</span>;
                                        }
                                        return <span>{props?.placeholder}</span>;
                                    }}
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-medium mb-2 block">Taux d'Intérêt (%)</label>
                                <InputNumber
                                    value={termDepositParams.interestRate}
                                    onValueChange={(e) => setTermDepositParams(prev => ({ ...prev, interestRate: e.value ?? 0 }))}
                                    mode="decimal"
                                    suffix=" %"
                                    min={0}
                                    max={100}
                                    minFractionDigits={2}
                                    maxFractionDigits={2}
                                    className="w-full"
                                    disabled={!!termDepositParams.termDurationId}
                                />
                                {termDepositParams.termDurationId && (
                                    <small className="text-500">Taux défini par la durée sélectionnée</small>
                                )}
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-medium mb-2 block">{termDepositAccount?.accountType === 'BLOCKED' ? 'Date de Début du Blocage *' : 'Date de Début *'}</label>
                                <Calendar
                                    value={termDepositParams.termStartDate ? new Date(termDepositParams.termStartDate) : null}
                                    onChange={(e) => handleTermStartDateChange(e.value as Date | null)}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-medium mb-2 block">{termDepositAccount?.accountType === 'BLOCKED' ? 'Date de Déblocage' : 'Date d\'Échéance'}</label>
                                <Calendar
                                    value={termDepositParams.maturityDate ? new Date(termDepositParams.maturityDate) : null}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    disabled
                                    className="w-full"
                                />
                                <small className="text-500">Calculée automatiquement</small>
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-medium mb-2 block">Compte Interne (capital)</label>
                                <Dropdown
                                    value={termDepositAccount.internalAccountId || termDepositAccount.internalAccount?.accountId}
                                    options={internalAccounts.filter((a: any) => a.actif)}
                                    optionLabel="_displayLabel"
                                    optionValue="accountId"
                                    disabled
                                    className="w-full"
                                    placeholder="Non assigné"
                                    itemTemplate={(item: any) => (
                                        <span>{item.codeCompte} - {item.libelle}</span>
                                    )}
                                    valueTemplate={(item: any, props: any) => {
                                        if (item) {
                                            return <span>{item.codeCompte} - {item.libelle}</span>;
                                        }
                                        return <span>{props?.placeholder}</span>;
                                    }}
                                />
                                <small className="text-500">Défini à la création du compte</small>
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-medium mb-2 block">Compte Interne (intérêts) *</label>
                                <Dropdown
                                    value={termDepositParams.interestInternalAccountId}
                                    options={internalAccounts.filter((a: any) => a.actif)}
                                    onChange={(e) => setTermDepositParams(prev => ({ ...prev, interestInternalAccountId: e.value }))}
                                    optionLabel="_displayLabel"
                                    optionValue="accountId"
                                    placeholder="Sélectionner le compte intérêts"
                                    filter
                                    filterBy="_displayLabel"
                                    className="w-full"
                                    itemTemplate={(item: any) => (
                                        <span>{item.codeCompte} - {item.libelle} ({item.accountNumber})</span>
                                    )}
                                    valueTemplate={(item: any, props: any) => {
                                        if (item) {
                                            return <span>{item.codeCompte} - {item.libelle}</span>;
                                        }
                                        return <span>{props?.placeholder}</span>;
                                    }}
                                />
                                <small className="text-500">Compte pour comptabiliser les intérêts</small>
                            </div>
                        </div>
                        <div className="surface-50 p-3 border-round mt-3 mb-3">
                            <h6 className="m-0 mb-2 text-600">
                                <i className="pi pi-info-circle mr-1"></i>
                                Soldes (alimentés par virements)
                            </h6>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label className="font-medium mb-2 block text-500">Solde Actuel / Montant Bloqué</label>
                                    <InputNumber
                                        value={termDepositParams.currentBalance}
                                        mode="decimal"
                                        suffix={` ${termDepositAccount.currency?.code || 'FBU'}`}
                                        disabled
                                        className="w-full"
                                    />
                                    <small className="text-500">Alimenté par les virements</small>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-medium mb-2 block text-500">Intérêts Courus</label>
                                    <InputNumber
                                        value={termDepositParams.accruedInterest}
                                        mode="decimal"
                                        suffix={` ${termDepositAccount.currency?.code || 'FBU'}`}
                                        disabled
                                        className="w-full"
                                    />
                                    <small className="text-500">Calculé: montant x taux x durée</small>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-medium mb-2 block text-500">{termDepositAccount?.accountType === 'BLOCKED' ? 'Total au Déblocage' : 'Total à l\'Échéance'}</label>
                                    <InputNumber
                                        value={termDepositParams.currentBalance + termDepositParams.accruedInterest}
                                        mode="decimal"
                                        suffix={` ${termDepositAccount.currency?.code || 'FBU'}`}
                                        disabled
                                        className="w-full"
                                    />
                                    <small className="text-500">Capital + intérêts</small>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Tag value="Virement autorisé" severity="success" icon="pi pi-check" />
                            <Tag value="Dépôt interdit" severity="danger" icon="pi pi-times" />
                            <Tag value="Retrait interdit" severity="danger" icon="pi pi-times" />
                        </div>
                    </div>
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
                            disabled={!newStatusId || statuses.find(s => s.id === newStatusId)?.code === statusChangeAccount?.status?.code}
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

            {/* Dialog pour valider le dépôt à terme */}
            <Dialog
                header={validateTermAccount?.accountType === 'BLOCKED' ? 'Validation du Blocage' : 'Validation du Dépôt à Terme'}
                visible={validateTermDialog}
                style={{ width: '600px' }}
                onHide={() => { setValidateTermDialog(false); setValidateTermAccount(null); }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => { setValidateTermDialog(false); setValidateTermAccount(null); }}
                        />
                        <Button
                            label="Confirmer la Validation"
                            icon="pi pi-check-circle"
                            className="p-button-warning"
                            onClick={handleValidateTermDeposit}
                            loading={validateTermApi.loading}
                        />
                    </div>
                }
            >
                {validateTermAccount && (() => {
                    const currCode = validateTermAccount.currency?.code || 'FBU';
                    const capital = validateTermAccount.currentBalance || 0;
                    const interest = validateTermAccount.accruedInterest || 0;
                    const total = capital + interest;
                    const capitalAccount = internalAccounts.find((a: any) =>
                        a.accountId === (validateTermAccount.internalAccountId || validateTermAccount.internalAccount?.accountId)
                    );
                    const interestAccount = internalAccounts.find((a: any) =>
                        a.accountId === (validateTermAccount.interestInternalAccountId || validateTermAccount.interestInternalAccount?.accountId)
                    );
                    const td = validateTermAccount.termDuration;

                    return (
                        <div>
                            <div className="surface-100 p-3 border-round mb-3">
                                <p className="m-0"><strong>Compte:</strong> {validateTermAccount.accountNumber}</p>
                                <p className="m-0"><strong>Client:</strong> {validateTermAccount.client ? (validateTermAccount.client.businessName || `${validateTermAccount.client.firstName || ''} ${validateTermAccount.client.lastName || ''}`.trim() || '-') : '-'}</p>
                                <p className="m-0"><strong>Durée:</strong> {td ? `${td.nameFr} (${td.months} mois)` : '-'}</p>
                                <p className="m-0"><strong>Période:</strong> {validateTermAccount.termStartDate || '-'} → {validateTermAccount.maturityDate || '-'}</p>
                            </div>

                            <div className="mb-3">
                                <div className="grid">
                                    <div className="col-4">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-xs text-500 mb-1">Capital Bloqué</div>
                                            <div className="text-lg font-bold text-primary">{capital.toLocaleString('fr-FR')} {currCode}</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-xs text-500 mb-1">Intérêts Courus</div>
                                            <div className="text-lg font-bold text-orange-500">{interest.toLocaleString('fr-FR')} {currCode}</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="border-2 border-primary p-3 border-round text-center" style={{ borderStyle: 'solid' }}>
                                            <div className="text-xs text-500 mb-1">Total à l'Échéance</div>
                                            <div className="text-lg font-bold text-green-600">{total.toLocaleString('fr-FR')} {currCode}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="surface-50 p-3 border-round mb-3">
                                <h6 className="m-0 mb-2"><i className="pi pi-arrow-right mr-1"></i>Transferts vers Comptes Internes</h6>
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between align-items-center p-2 surface-100 border-round">
                                        <div>
                                            <i className="pi pi-building mr-1 text-primary"></i>
                                            <strong>Capital:</strong> {capitalAccount ? `${capitalAccount.codeCompte} - ${capitalAccount.libelle}` : 'Non assigné'}
                                        </div>
                                        <Tag value={`${capital.toLocaleString('fr-FR')} ${currCode}`} severity="info" />
                                    </div>
                                    <div className="flex justify-content-between align-items-center p-2 surface-100 border-round">
                                        <div>
                                            <i className="pi pi-percentage mr-1 text-orange-500"></i>
                                            <strong>Intérêts:</strong> {interestAccount ? `${interestAccount.codeCompte} - ${interestAccount.libelle}` : 'Non assigné'}
                                        </div>
                                        <Tag value={`${interest.toLocaleString('fr-FR')} ${currCode}`} severity="warning" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 border-round border-1 border-orange-300 bg-orange-50">
                                <i className="pi pi-exclamation-triangle text-orange-500 mr-2"></i>
                                <strong>Attention:</strong> Cette action va bloquer le montant de {capital.toLocaleString('fr-FR')} {currCode} du compte client pendant {td?.months || '?'} mois et enregistrer les intérêts courus de {interest.toLocaleString('fr-FR')} {currCode}. Cette opération est irréversible.
                            </div>
                        </div>
                    );
                })()}
            </Dialog>

            {/* Dialog pour traiter l'échéance du dépôt à terme */}
            <Dialog
                header={maturityAccount?.accountType === 'BLOCKED' ? 'Traitement du Déblocage' : 'Traitement de l\'Échéance - Dépôt à Terme'}
                visible={maturityDialog}
                style={{ width: '600px' }}
                onHide={() => { setMaturityDialog(false); setMaturityAccount(null); }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => { setMaturityDialog(false); setMaturityAccount(null); }}
                        />
                        <Button
                            label="Confirmer l'Échéance"
                            icon="pi pi-wallet"
                            className="p-button-info"
                            onClick={handleProcessMaturity}
                            loading={maturityApi.loading}
                        />
                    </div>
                }
            >
                {maturityAccount && (() => {
                    const currCode = maturityAccount.currency?.code || 'FBU';
                    const capital = maturityAccount.blockedAmount || maturityAccount.currentBalance || 0;
                    const interest = maturityAccount.accruedInterest || 0;
                    const total = capital + interest;
                    const td = maturityAccount.termDuration;
                    const cycleCount = maturityAccount.termDepositCount || 0;

                    return (
                        <div>
                            <div className="surface-100 p-3 border-round mb-3">
                                <p className="m-0"><strong>Compte:</strong> {maturityAccount.accountNumber}</p>
                                <p className="m-0"><strong>Client:</strong> {maturityAccount.client ? (maturityAccount.client.businessName || `${maturityAccount.client.firstName || ''} ${maturityAccount.client.lastName || ''}`.trim() || '-') : '-'}</p>
                                <p className="m-0"><strong>Durée:</strong> {td ? `${td.nameFr} (${td.months} mois)` : '-'}</p>
                                <p className="m-0"><strong>Période:</strong> {maturityAccount.termStartDate || '-'} → {maturityAccount.maturityDate || '-'}</p>
                                {cycleCount > 0 && <p className="m-0"><strong>Cycle n°:</strong> {cycleCount}</p>}
                            </div>

                            <div className="mb-3">
                                <div className="grid">
                                    <div className="col-4">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-xs text-500 mb-1">Capital Bloqué</div>
                                            <div className="text-lg font-bold text-primary">{capital.toLocaleString('fr-FR')} {currCode}</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-xs text-500 mb-1">Intérêts Courus</div>
                                            <div className="text-lg font-bold text-orange-500">{interest.toLocaleString('fr-FR')} {currCode}</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="border-2 border-green-500 p-3 border-round text-center" style={{ borderStyle: 'solid' }}>
                                            <div className="text-xs text-500 mb-1">Total Restitué</div>
                                            <div className="text-lg font-bold text-green-600">{total.toLocaleString('fr-FR')} {currCode}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="surface-50 p-3 border-round mb-3">
                                <h6 className="m-0 mb-2"><i className="pi pi-arrow-left mr-1"></i>Restitution au Client</h6>
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between align-items-center p-2 surface-100 border-round">
                                        <div>
                                            <i className="pi pi-building mr-1 text-primary"></i>
                                            <strong>Capital débloqué:</strong> restitué au solde du compte
                                        </div>
                                        <Tag value={`+${capital.toLocaleString('fr-FR')} ${currCode}`} severity="success" />
                                    </div>
                                    <div className="flex justify-content-between align-items-center p-2 surface-100 border-round">
                                        <div>
                                            <i className="pi pi-percentage mr-1 text-orange-500"></i>
                                            <strong>Intérêts payés:</strong> ajoutés au solde du compte
                                        </div>
                                        <Tag value={`+${interest.toLocaleString('fr-FR')} ${currCode}`} severity="warning" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 border-round border-1 border-blue-300 bg-blue-50 mb-2">
                                <i className="pi pi-info-circle text-blue-500 mr-2"></i>
                                <strong>Info:</strong> Le capital ({capital.toLocaleString('fr-FR')} {currCode}) et les intérêts ({interest.toLocaleString('fr-FR')} {currCode}) seront restitués au solde du compte client. Le solde total sera de {total.toLocaleString('fr-FR')} {currCode}.
                            </div>

                            <div className="p-3 border-round border-1 border-green-300 bg-green-50">
                                <i className="pi pi-refresh text-green-500 mr-2"></i>
                                <strong>Renouvellement:</strong> Après l'échéance, le client pourra effectuer un nouveau dépôt à terme sur ce même compte.
                            </div>
                        </div>
                    );
                })()}
            </Dialog>

            {/* Dialog pour l'historique des dépôts à terme */}
            <Dialog
                header={historyAccount?.accountType === 'BLOCKED' ? `Historique des Blocages - ${historyAccount?.accountNumber || ''}` : `Historique des Dépôts à Terme - ${historyAccount?.accountNumber || ''}`}
                visible={historyDialog}
                style={{ width: '950px' }}
                onHide={() => { setHistoryDialog(false); setHistoryAccount(null); setTermDepositHistory([]); }}
                footer={
                    <div className="flex justify-content-end">
                        <Button label="Fermer" icon="pi pi-times" onClick={() => { setHistoryDialog(false); setHistoryAccount(null); setTermDepositHistory([]); }} className="p-button-text" />
                    </div>
                }
            >
                {historyAccount && (() => {
                    const currCode = historyAccount.currency?.code || 'BIF';
                    const clientName = historyAccount.client ? (historyAccount.client.businessName || `${historyAccount.client.firstName || ''} ${historyAccount.client.lastName || ''}`.trim() || '-') : '-';
                    const td = historyAccount.termDuration;
                    const capital = historyAccount.blockedAmount || historyAccount.currentBalance || 0;
                    const interest = historyAccount.accruedInterest || 0;
                    const total = capital + interest;
                    const today = formatLocalDate(new Date());
                    const isMatured = historyAccount.maturityDate && historyAccount.maturityDate <= today;
                    const daysRemaining = historyAccount.maturityDate ?
                        Math.max(0, Math.ceil((new Date(historyAccount.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

                    return (
                        <div>
                            {/* Info compte */}
                            <div className="surface-100 p-3 border-round mb-3">
                                <div className="grid">
                                    <div className="col-4">
                                        <p className="m-0 mb-1"><strong>Compte:</strong> {historyAccount.accountNumber}</p>
                                        <p className="m-0 mb-1"><strong>Client:</strong> {clientName}</p>
                                        <p className="m-0"><strong>Agence:</strong> {historyAccount.branch?.name || '-'}</p>
                                    </div>
                                    <div className="col-4">
                                        <p className="m-0 mb-1"><strong>Statut DAT:</strong> {historyAccount.termDepositValidated ?
                                            <Tag value="Validé" severity="success" icon="pi pi-check" className="ml-1" /> :
                                            <Tag value="Non validé" severity="warning" icon="pi pi-clock" className="ml-1" />}
                                        </p>
                                        <p className="m-0 mb-1"><strong>Cycles complétés:</strong> {historyAccount.termDepositCount || 0}</p>
                                        <p className="m-0"><strong>Statut compte:</strong> {historyAccount.status?.nameFr || historyAccount.status?.name || '-'}</p>
                                    </div>
                                    <div className="col-4">
                                        <p className="m-0 mb-1"><strong>Devise:</strong> {currCode}</p>
                                        <p className="m-0 mb-1"><strong>Ouverture:</strong> {historyAccount.openingDate || '-'}</p>
                                        <p className="m-0"><strong>Utilisateur:</strong> {historyAccount.userAction || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Détails du cycle actuel */}
                            {(historyAccount.termDepositValidated || td) && (
                                <div className="mb-3">
                                    <h6 className="m-0 mb-2"><i className="pi pi-clock mr-2"></i>Cycle Actuel {historyAccount.termDepositValidated ? '(En cours)' : '(En préparation)'}</h6>
                                    <div className="grid">
                                        <div className="col-3">
                                            <div className="surface-100 p-3 border-round text-center">
                                                <div className="text-xs text-500 mb-1">Capital Bloqué</div>
                                                <div className="text-lg font-bold text-primary">{capital.toLocaleString('fr-FR')} {currCode}</div>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div className="surface-100 p-3 border-round text-center">
                                                <div className="text-xs text-500 mb-1">Intérêts Attendus</div>
                                                <div className="text-lg font-bold text-orange-500">{interest.toLocaleString('fr-FR')} {currCode}</div>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div className="border-2 border-green-500 p-3 border-round text-center" style={{ borderStyle: 'solid' }}>
                                                <div className="text-xs text-500 mb-1">Total à l'Échéance</div>
                                                <div className="text-lg font-bold text-green-600">{total.toLocaleString('fr-FR')} {currCode}</div>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div className={`p-3 border-round text-center ${isMatured ? 'bg-red-50 border-2 border-red-300' : 'surface-100'}`} style={isMatured ? { borderStyle: 'solid' } : {}}>
                                                <div className="text-xs text-500 mb-1">{isMatured ? 'Échéance Atteinte' : 'Jours Restants'}</div>
                                                <div className={`text-lg font-bold ${isMatured ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {isMatured ? 'Échu' : `${daysRemaining} jours`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid mt-2">
                                        <div className="col-3"><span className="text-500">Durée:</span> <strong>{td ? `${td.nameFr || td.name || ''} (${td.months} mois)` : '-'}</strong></div>
                                        <div className="col-3"><span className="text-500">Taux:</span> <strong>{historyAccount.interestRate || 0} %</strong></div>
                                        <div className="col-3"><span className="text-500">Début:</span> <strong>{historyAccount.termStartDate || '-'}</strong></div>
                                        <div className="col-3"><span className="text-500">Échéance:</span> <strong>{historyAccount.maturityDate || '-'}</strong></div>
                                    </div>
                                </div>
                            )}

                            {/* Table historique */}
                            <h6 className="m-0 mb-2 mt-3"><i className="pi pi-list mr-2"></i>Historique des Cycles</h6>
                            {historyApi.loading ? (
                                <div className="flex justify-content-center p-4">
                                    <i className="pi pi-spin pi-spinner text-4xl"></i>
                                </div>
                            ) : termDepositHistory.length === 0 ? (
                                <div className="text-center p-3 surface-50 border-round text-500">
                                    <i className="pi pi-info-circle mr-2"></i>
                                    Aucun cycle enregistré dans l'historique.
                                </div>
                            ) : (
                                <DataTable value={termDepositHistory} size="small" stripedRows
                                           emptyMessage="Aucun historique trouvé"
                                           sortField="createdAt" sortOrder={-1}>
                                    <Column field="depositNumber" header="N° Dépôt" style={{ width: '130px' }} />
                                    <Column header="Cycle" body={(rowData: any) => (
                                        <Tag value={rowData.isRenewal ? `Renouvellement ${rowData.renewalCount}` : 'Initial'}
                                             severity={rowData.isRenewal ? 'info' : 'success'} />
                                    )} style={{ width: '130px' }} />
                                    <Column header="Capital" body={(rowData: any) => (
                                        <span className="font-semibold">{(rowData.principalAmount || 0).toLocaleString('fr-FR')} {rowData.currency?.code || 'BIF'}</span>
                                    )} />
                                    <Column header="Taux" body={(rowData: any) => `${rowData.interestRate || 0} %`} style={{ width: '60px' }} />
                                    <Column header="Durée" body={(rowData: any) => (
                                        rowData.termDuration ? `${rowData.termDuration.months}m` : '-'
                                    )} style={{ width: '60px' }} />
                                    <Column header="Période" body={(rowData: any) => (
                                        <span className="text-sm">{rowData.startDate || '-'} → {rowData.maturityDate || '-'}</span>
                                    )} />
                                    <Column header="Intérêts" body={(rowData: any) => (
                                        <span className="text-orange-500 font-semibold">
                                            {(rowData.accruedInterest || rowData.expectedInterest || 0).toLocaleString('fr-FR')}
                                        </span>
                                    )} style={{ width: '80px' }} />
                                    <Column header="Échu" body={(rowData: any) => (
                                        rowData.maturityProcessed ?
                                            <Tag value={rowData.maturityProcessedDate || 'Oui'} severity="info" icon="pi pi-check" /> :
                                            <Tag value="Non" severity="warning" />
                                    )} style={{ width: '100px' }} />
                                    <Column header="Statut" body={(rowData: any) => {
                                        const status = rowData.status;
                                        if (!status) return '-';
                                        let severity: 'success' | 'info' | 'warning' | 'danger' = 'info';
                                        const code = status.code || '';
                                        if (code === 'ACTIVE' || code === 'ACTIF') severity = 'success';
                                        else if (code === 'MATURED') severity = 'info';
                                        else if (code === 'CLOSED' || code === 'FERME') severity = 'danger';
                                        else if (code === 'PENDING') severity = 'warning';
                                        return <Tag value={status.nameFr || status.name || code} severity={severity} />;
                                    }} style={{ width: '90px' }} />
                                </DataTable>
                            )}
                        </div>
                    );
                })()}
            </Dialog>

            {/* Dialog Historique de toutes les opérations */}
            <Dialog
                header={`Historique des Opérations — ${opsHistoryAccount?.accountNumber || ''}`}
                visible={opsHistoryDialog}
                style={{ width: '1050px' }}
                onHide={() => { setOpsHistoryDialog(false); setOpsHistoryAccount(null); setOpsHistory([]); setOpsHistorySummary(null); }}
                footer={
                    <div className="flex justify-content-end">
                        <Button label="Fermer" icon="pi pi-times" onClick={() => { setOpsHistoryDialog(false); setOpsHistoryAccount(null); setOpsHistory([]); setOpsHistorySummary(null); }} className="p-button-text" />
                    </div>
                }
            >
                {opsHistoryAccount && (
                    <div>
                        {/* Filtres */}
                        <div className="surface-100 p-3 border-round mb-3">
                            <div className="grid align-items-end">
                                <div className="col-12 md:col-3">
                                    <label className="text-500 text-sm mb-1 block">Du</label>
                                    <Calendar
                                        value={opsHistoryFrom}
                                        onChange={(e) => {
                                            const v = e.value as Date | null;
                                            setOpsHistoryFrom(v);
                                            loadOpsHistory(opsHistoryAccount, v, opsHistoryTo, opsHistoryType);
                                        }}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        showButtonBar
                                        placeholder="Date début"
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-12 md:col-3">
                                    <label className="text-500 text-sm mb-1 block">Au</label>
                                    <Calendar
                                        value={opsHistoryTo}
                                        onChange={(e) => {
                                            const v = e.value as Date | null;
                                            setOpsHistoryTo(v);
                                            loadOpsHistory(opsHistoryAccount, opsHistoryFrom, v, opsHistoryType);
                                        }}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        showButtonBar
                                        placeholder="Date fin"
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-12 md:col-4">
                                    <label className="text-500 text-sm mb-1 block">Type d'opération</label>
                                    <Dropdown
                                        value={opsHistoryType}
                                        onChange={(e) => {
                                            setOpsHistoryType(e.value);
                                            loadOpsHistory(opsHistoryAccount, opsHistoryFrom, opsHistoryTo, e.value);
                                        }}
                                        options={[
                                            { label: 'Tous les types', value: '' },
                                            { label: 'Dépôt', value: 'DEPOSIT' },
                                            { label: 'Retrait', value: 'WITHDRAWAL' },
                                            { label: 'Virement sortant', value: 'TRANSFER_OUT' },
                                            { label: 'Virement entrant', value: 'TRANSFER_IN' },
                                            { label: 'Frais', value: 'FEE' },
                                            { label: 'Remboursement crédit', value: 'LOAN_PAYMENT' },
                                        ]}
                                        placeholder="Tous les types"
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-12 md:col-2">
                                    <Button
                                        icon="pi pi-refresh"
                                        label="Actualiser"
                                        className="p-button-outlined w-full"
                                        size="small"
                                        onClick={() => loadOpsHistory(opsHistoryAccount, opsHistoryFrom, opsHistoryTo, opsHistoryType)}
                                        loading={opsHistoryApi.loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Résumé */}
                        {opsHistorySummary && (
                            <div className="grid mb-3">
                                <div className="col-6 md:col-3">
                                    <div className="surface-100 p-3 border-round text-center">
                                        <div className="text-xs text-500 mb-1">Nb opérations</div>
                                        <div className="text-xl font-bold text-primary">{opsHistorySummary.totalOperations || 0}</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-100 p-3 border-round text-center">
                                        <div className="text-xs text-500 mb-1">Total Débits</div>
                                        <div className="text-xl font-bold text-red-500">{(opsHistorySummary.totalDebits || 0).toLocaleString('fr-FR')} FBU</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-100 p-3 border-round text-center">
                                        <div className="text-xs text-500 mb-1">Total Crédits</div>
                                        <div className="text-xl font-bold text-green-600">{(opsHistorySummary.totalCredits || 0).toLocaleString('fr-FR')} FBU</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-100 p-3 border-round text-center">
                                        <div className="text-xs text-500 mb-1">Mouvement Net</div>
                                        <div className={`text-xl font-bold ${(opsHistorySummary.netMovement || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {(opsHistorySummary.netMovement || 0).toLocaleString('fr-FR')} FBU
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Table opérations */}
                        {opsHistoryApi.loading ? (
                            <div className="flex justify-content-center p-4">
                                <i className="pi pi-spin pi-spinner text-4xl"></i>
                            </div>
                        ) : (
                            <DataTable
                                value={opsHistory}
                                size="small"
                                stripedRows
                                showGridlines
                                emptyMessage="Aucune opération trouvée"
                                sortField="operationDate"
                                sortOrder={-1}
                                paginator
                                rows={15}
                                rowsPerPageOptions={[10, 15, 25, 50]}
                            >
                                <Column field="operationDate" header="Date" sortable style={{ width: '110px' }}
                                    body={(row: any) => row.operationDate ? new Date(row.operationDate).toLocaleDateString('fr-FR') : '-'} />
                                <Column field="operationType" header="Type" style={{ width: '130px' }}
                                    body={(row: any) => {
                                        const typeMap: Record<string, { label: string; severity: 'success' | 'info' | 'danger' | 'warning' }> = {
                                            'DEPOSIT':       { label: 'Dépôt', severity: 'success' },
                                            'WITHDRAWAL':    { label: 'Retrait', severity: 'danger' },
                                            'TRANSFER_OUT':  { label: 'Virt. sortant', severity: 'warning' },
                                            'TRANSFER_IN':   { label: 'Virt. entrant', severity: 'info' },
                                            'FEE':           { label: 'Frais', severity: 'warning' },
                                            'LOAN_PAYMENT':  { label: 'Rembours.', severity: 'info' },
                                        };
                                        const t = typeMap[row.operationType];
                                        return t ? <Tag value={t.label} severity={t.severity} /> : <Tag value={row.operationType} />;
                                    }} />
                                <Column field="referenceNumber" header="Référence" style={{ width: '140px' }} />
                                <Column field="description" header="Description" />
                                <Column field="debitAmount" header="Débit" style={{ width: '110px' }}
                                    body={(row: any) => row.debitAmount ? <span className="text-red-500 font-semibold">{(row.debitAmount).toLocaleString('fr-FR')}</span> : '-'} />
                                <Column field="creditAmount" header="Crédit" style={{ width: '110px' }}
                                    body={(row: any) => row.creditAmount ? <span className="text-green-600 font-semibold">{(row.creditAmount).toLocaleString('fr-FR')}</span> : '-'} />
                                <Column field="balance" header="Solde" style={{ width: '120px' }}
                                    body={(row: any) => <span className="font-semibold">{(row.balance || 0).toLocaleString('fr-FR')}</span>} />
                                <Column field="status" header="Statut" style={{ width: '90px' }}
                                    body={(row: any) => row.status ? <Tag value={row.status} severity={row.status === 'VALIDATED' || row.status === 'COMPLETED' ? 'success' : row.status === 'REJECTED' ? 'danger' : 'info'} /> : '-'} />
                                <Column field="processedBy" header="Effectué par" style={{ width: '120px' }} />
                            </DataTable>
                        )}
                    </div>
                )}
            </Dialog>

            {/* Dialog Documents du compte */}
            <Dialog
                header={`Documents - ${documentsAccount?.accountNumber || ''}`}
                visible={documentsDialog}
                style={{ width: '750px' }}
                onHide={() => { setDocumentsDialog(false); setDocumentsAccount(null); setAccountDocuments([]); }}
            >
                {documentsAccount && (
                    <div>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p className="m-0"><strong>Compte:</strong> {documentsAccount.accountNumber}</p>
                            <p className="m-0"><strong>Client:</strong> {documentsAccount.client ? (documentsAccount.client.businessName || `${documentsAccount.client.firstName || ''} ${documentsAccount.client.lastName || ''}`.trim() || '-') : '-'}</p>
                        </div>
                        <div className="flex justify-content-between align-items-center mb-3">
                            <span className="font-semibold">Documents ({accountDocuments.length})</span>
                            <Button
                                label="Ajouter"
                                icon="pi pi-plus"
                                size="small"
                                onClick={openAddDocDialog}
                            />
                        </div>
                        {loadingDocs ? (
                            <div className="flex align-items-center justify-content-center p-4">
                                <i className="pi pi-spin pi-spinner mr-2"></i> Chargement...
                            </div>
                        ) : (
                            <DataTable
                                value={accountDocuments}
                                dataKey="id"
                                emptyMessage="Aucun document"
                                className="p-datatable-sm"
                                paginator={accountDocuments.length > 5}
                                rows={5}
                            >
                                <Column
                                    field="documentName"
                                    header="Nom du Document"
                                    body={(row: any) => (
                                        <a
                                            className="text-primary cursor-pointer hover:underline flex align-items-center gap-1"
                                            onClick={() => handleViewDocument(row)}
                                        >
                                            <i className="pi pi-file text-sm"></i>
                                            {row.documentName || 'Document'}
                                        </a>
                                    )}
                                />
                                <Column
                                    field="fileSizeKb"
                                    header="Taille"
                                    style={{ width: '80px' }}
                                    body={(row: any) => row.fileSizeKb ? `${row.fileSizeKb} KB` : '-'}
                                />
                                <Column
                                    field="createdAt"
                                    header="Date"
                                    style={{ width: '120px' }}
                                    body={(row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : '-'}
                                />
                                <Column
                                    field="userAction"
                                    header="Par"
                                    style={{ width: '120px' }}
                                />
                                <Column
                                    header="Actions"
                                    style={{ width: '100px' }}
                                    body={(row: any) => (
                                        <div className="flex gap-1">
                                            <Button
                                                icon="pi pi-eye"
                                                rounded
                                                text
                                                severity="info"
                                                size="small"
                                                onClick={() => handleViewDocument(row)}
                                                tooltip="Voir"
                                            />
                                            <Button
                                                icon="pi pi-trash"
                                                rounded
                                                text
                                                severity="danger"
                                                size="small"
                                                onClick={() => handleDeleteDocument(row)}
                                                tooltip="Supprimer"
                                            />
                                        </div>
                                    )}
                                />
                            </DataTable>
                        )}
                    </div>
                )}
            </Dialog>

            {/* Dialog Ajouter un document */}
            <Dialog
                header="Ajouter un Document"
                visible={addDocDialog}
                style={{ width: '500px' }}
                onHide={() => { setAddDocDialog(false); setSelectedFile(null); setNewDocName(''); if (fileUploadRef.current) fileUploadRef.current.clear(); }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => { setAddDocDialog(false); setSelectedFile(null); setNewDocName(''); if (fileUploadRef.current) fileUploadRef.current.clear(); }}
                        />
                        <Button
                            label={uploading ? "Téléchargement..." : "Enregistrer"}
                            icon={uploading ? "pi pi-spin pi-spinner" : "pi pi-upload"}
                            className="p-button-success"
                            onClick={handleAddDocument}
                            loading={uploading}
                            disabled={!selectedFile || !newDocName.trim()}
                        />
                    </div>
                }
            >
                <div className="field mb-3">
                    <label className="font-medium mb-2 block">Nom du document *</label>
                    <InputText
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder="Ex: Contrat signé, Pièce d'identité..."
                        className="w-full"
                    />
                </div>
                <div className="field">
                    <label className="font-medium mb-2 block">Sélectionner un fichier *</label>
                    <FileUpload
                        ref={fileUploadRef}
                        mode="basic"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        maxFileSize={10000000}
                        chooseLabel="Parcourir"
                        auto={false}
                        onSelect={handleFileSelect}
                        onClear={() => setSelectedFile(null)}
                    />
                    <small className="text-500 mt-1 block">Formats acceptés: Images, PDF, Word, Excel (max 10MB)</small>
                </div>
                {selectedFile && (
                    <div className="mt-2 p-2 surface-50 border-round">
                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                        <strong>{selectedFile.name}</strong>
                        <span className="text-500 ml-2">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                    </div>
                )}
            </Dialog>

            {/* Dialog Historique des exécutions des intérêts mensuels */}
            <Dialog
                header="Historique des Calculs d'Intérêts — Dépôt à Terme"
                visible={interestHistoryDialog}
                style={{ width: '850px' }}
                onHide={() => setInterestHistoryDialog(false)}
                footer={
                    <div className="flex justify-content-end">
                        <Button label="Fermer" icon="pi pi-times" onClick={() => setInterestHistoryDialog(false)} className="p-button-text" />
                    </div>
                }
            >
                <div>
                    <div className="surface-50 p-3 border-round mb-3">
                        <small className="text-600">
                            <i className="pi pi-info-circle mr-1" />
                            Toutes les exécutions manuelles et automatiques du calcul des intérêts DAT sont enregistrées ici.
                        </small>
                    </div>
                    {interestHistoryApi.loading ? (
                        <div className="flex justify-content-center p-4">
                            <i className="pi pi-spin pi-spinner text-4xl"></i>
                        </div>
                    ) : interestExecutionHistory.length === 0 ? (
                        <div className="text-center p-4 text-500">
                            <i className="pi pi-inbox mr-2" />
                            Aucune exécution enregistrée.
                        </div>
                    ) : (
                        <>
                            {/* Summary cards */}
                            <div className="grid mb-3">
                                <div className="col-6 md:col-3">
                                    <div className="surface-100 p-3 border-round text-center">
                                        <div className="text-xs text-500 mb-1">Total exécutions</div>
                                        <div className="text-xl font-bold text-primary">{interestExecutionHistory.length}</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-100 p-3 border-round text-center">
                                        <div className="text-xs text-500 mb-1">Manuelles</div>
                                        <div className="text-xl font-bold text-blue-600">{interestExecutionHistory.filter((e: any) => e.executionType === 'MANUAL').length}</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-100 p-3 border-round text-center">
                                        <div className="text-xs text-500 mb-1">Automatiques</div>
                                        <div className="text-xl font-bold text-green-600">{interestExecutionHistory.filter((e: any) => e.executionType === 'AUTOMATIC').length}</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-100 p-3 border-round text-center">
                                        <div className="text-xs text-500 mb-1">Total intérêts crédités</div>
                                        <div className="text-lg font-bold text-orange-500">
                                            {interestExecutionHistory.reduce((s: number, e: any) => s + (e.totalInterest || 0), 0).toLocaleString('fr-FR')} BIF
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DataTable
                                value={interestExecutionHistory}
                                size="small"
                                stripedRows
                                showGridlines
                                sortField="createdAt"
                                sortOrder={-1}
                                paginator
                                rows={10}
                                expandedRows={interestHistoryExpandedRows}
                                onRowToggle={(e) => setInterestHistoryExpandedRows(e.data)}
                                rowExpansionTemplate={(row: any) => (
                                    <div className="p-3 bg-blue-50">
                                        <h6 className="mt-0 mb-2 text-primary"><i className="pi pi-list mr-2"></i>Comptes affectés ({(row.details || []).length})</h6>
                                        {(row.details || []).length === 0 ? (
                                            <div className="text-500 text-sm text-center p-2">Aucun détail disponible pour cette exécution.</div>
                                        ) : (
                                            <DataTable value={row.details} size="small" showGridlines>
                                                <Column field="accountNumber" header="N° Compte" style={{ width: '130px' }} />
                                                <Column field="clientName" header="Client" />
                                                <Column field="interestRate" header="Taux" style={{ width: '70px' }}
                                                    body={(d: any) => `${(d.interestRate || 0).toFixed(2)} %`} />
                                                <Column header="Solde Avant" style={{ width: '130px' }}
                                                    body={(d: any) => (
                                                        <span className="text-600">{(d.balanceBefore || 0).toLocaleString('fr-FR')} {d.currency}</span>
                                                    )} />
                                                <Column header="Intérêt Crédité" style={{ width: '140px' }}
                                                    body={(d: any) => (
                                                        <span className="font-bold text-green-600">+ {(d.interestAmount || 0).toLocaleString('fr-FR')} {d.currency}</span>
                                                    )} />
                                                <Column header="Solde Après" style={{ width: '130px' }}
                                                    body={(d: any) => (
                                                        <span className="font-bold text-primary">{(d.balanceAfter || 0).toLocaleString('fr-FR')} {d.currency}</span>
                                                    )} />
                                            </DataTable>
                                        )}
                                    </div>
                                )}
                            >
                                <Column expander style={{ width: '3rem' }} />
                                <Column field="executionDate" header="Date" sortable style={{ width: '110px' }}
                                    body={(row: any) => row.executionDate || '-'} />
                                <Column field="executionType" header="Type" style={{ width: '120px' }}
                                    body={(row: any) => (
                                        <Tag
                                            value={row.executionType === 'AUTOMATIC' ? 'Automatique' : 'Manuelle'}
                                            severity={row.executionType === 'AUTOMATIC' ? 'success' : 'info'}
                                            icon={row.executionType === 'AUTOMATIC' ? 'pi pi-clock' : 'pi pi-user'}
                                        />
                                    )} />
                                <Column field="accountsProcessed" header="Comptes" style={{ width: '90px' }}
                                    body={(row: any) => <span className="font-semibold">{row.accountsProcessed}</span>} />
                                <Column field="totalInterest" header="Total Intérêts" style={{ width: '140px' }}
                                    body={(row: any) => (
                                        <span className="font-bold text-green-600">{(row.totalInterest || 0).toLocaleString('fr-FR')} {row.currency}</span>
                                    )} />
                                <Column field="referencePrefix" header="Référence" style={{ width: '150px' }} />
                                <Column field="status" header="Statut" style={{ width: '90px' }}
                                    body={(row: any) => (
                                        <Tag value={row.status === 'SUCCESS' ? 'Succès' : 'Erreur'}
                                             severity={row.status === 'SUCCESS' ? 'success' : 'danger'}
                                             icon={row.status === 'SUCCESS' ? 'pi pi-check' : 'pi pi-times'} />
                                    )} />
                                <Column field="executedBy" header="Exécuté par" />
                                <Column field="createdAt" header="Horodatage" sortable
                                    body={(row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString('fr-FR') : '-'} />
                            </DataTable>
                        </>
                    )}
                </div>
            </Dialog>

            {/* Hidden printable certificate */}
            <div style={{ display: 'none' }}>
                <PrintableTermDepositCertificate
                    ref={printRef}
                    account={historyAccount}
                    history={termDepositHistory}
                />
            </div>
        </div>
    );
}

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_CREATE', 'EPARGNE_UPDATE', 'EPARGNE_VIEW']}>
            <SavingsAccountPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
