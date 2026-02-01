'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import Cookies from 'js-cookie';
import { DemandeCredit, DemandeCreditClass } from '../types/DemandeCredit';
import { AnalyseRevenu, AnalyseRevenuClass, AnalyseDepense, AnalyseDepenseClass, AnalyseCapacite, TypesContrat, EvaluationsRisque } from '../types/AnalyseFinanciere';
import DemandeCreditForm from './DemandeCreditForm';

const BASE_URL = buildApiUrl('/api/credit/applications');
const CLIENTS_URL = buildApiUrl('/api/clients');
const BRANCHES_URL = buildApiUrl('/api/reference-data/branches');
const USERS_URL = buildApiUrl('/api/users');
const PRODUCTS_URL = buildApiUrl('/api/financial-products/loan-products');
const STATUTS_URL = buildApiUrl('/api/credit/application-statuses');
const PURPOSES_URL = buildApiUrl('/api/credit/purposes');
const SAVINGS_ACCOUNTS_URL = buildApiUrl('/api/savings-accounts');
const INCOME_URL = buildApiUrl('/api/credit/income-analysis');
const EXPENSE_URL = buildApiUrl('/api/credit/expense-analysis');
const CAPACITY_URL = buildApiUrl('/api/credit/capacity-analysis');
const INCOME_TYPES_URL = buildApiUrl('/api/credit/income-types');
const EXPENSE_TYPES_URL = buildApiUrl('/api/credit/expense-types');
const COMMITTEE_DECISIONS_URL = buildApiUrl('/api/credit/committee-decisions');
const STATUS_HISTORY_URL = buildApiUrl('/api/credit/application-status-history');

// Define workflow transitions - which status can move to which
const WORKFLOW_TRANSITIONS: { [key: string]: string[] } = {
    'INITIALIZE': ['PENDING_DOCS'],
    'PENDING_DOCS': ['DOCS_RECEIVED', 'REJETE'],
    'DOCS_RECEIVED': ['UNDER_ANALYSIS', 'PENDING_DOCS'],
    'UNDER_ANALYSIS': ['FIELD_VISIT', 'PENDING_COMMITTEE', 'REJETE'],
    'FIELD_VISIT': ['VISIT_COMPLETED'],
    'VISIT_COMPLETED': ['PENDING_COMMITTEE', 'RENVOI_ANALYSE'],
    'PENDING_COMMITTEE': [], // Committee decision will determine next status
    'APPROVED': ['PENDING_DISBURSEMENT'],
    'APPROVED_CONDITIONS': ['PENDING_DISBURSEMENT', 'REJETE'],
    'APPROUVE_MONTANT_REDUIT': ['PENDING_DISBURSEMENT'],
    'AJOURNE': ['UNDER_ANALYSIS'],
    'RENVOI_ANALYSE': ['UNDER_ANALYSIS'],
    'PENDING_DISBURSEMENT': ['DISBURSED'],
    'DISBURSED': [],
    'REJETE': []
};

// Map committee decisions to resulting statuses
const DECISION_TO_STATUS: { [key: string]: string } = {
    'APPROUVE': 'APPROVED',
    'APPROUVE_CONDITIONS': 'APPROVED_CONDITIONS',
    'APPROUVE_MONTANT_REDUIT': 'APPROUVE_MONTANT_REDUIT',
    'AJOURNE': 'AJOURNE',
    'REJETE': 'REJETE',
    'RENVOI_ANALYSE': 'RENVOI_ANALYSE'
};

export default function DemandesCreditPage() {
    const [demande, setDemande] = useState<DemandeCredit>(new DemandeCreditClass());
    const [demandes, setDemandes] = useState<DemandeCredit[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState<DemandeCredit | null>(null);
    const [loadingRef, setLoadingRef] = useState(false);

    // Analyse Financiere Dialog State
    const [showAnalyseDialog, setShowAnalyseDialog] = useState(false);
    const [analyseApplication, setAnalyseApplication] = useState<DemandeCredit | null>(null);
    const [revenus, setRevenus] = useState<AnalyseRevenu[]>([]);
    const [depenses, setDepenses] = useState<AnalyseDepense[]>([]);
    const [capacite, setCapacite] = useState<AnalyseCapacite | null>(null);
    const [typesRevenus, setTypesRevenus] = useState<any[]>([]);
    const [typesDepenses, setTypesDepenses] = useState<any[]>([]);
    const [loadingAnalyse, setLoadingAnalyse] = useState(false);

    // Edit forms for revenus and depenses
    const [showRevenuForm, setShowRevenuForm] = useState(false);
    const [showDepenseForm, setShowDepenseForm] = useState(false);
    const [editRevenu, setEditRevenu] = useState<AnalyseRevenu>(new AnalyseRevenuClass());
    const [editDepense, setEditDepense] = useState<AnalyseDepense>(new AnalyseDepenseClass());

    // Workflow Dialog State
    const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
    const [workflowDemande, setWorkflowDemande] = useState<DemandeCredit | null>(null);
    const [selectedNewStatus, setSelectedNewStatus] = useState<any>(null);
    const [workflowNotes, setWorkflowNotes] = useState('');
    const [availableTransitions, setAvailableTransitions] = useState<any[]>([]);

    // Committee Decision Dialog State
    const [showCommitteeDialog, setShowCommitteeDialog] = useState(false);
    const [committeeDecisions, setCommitteeDecisions] = useState<any[]>([]);
    const [selectedDecision, setSelectedDecision] = useState<any>(null);
    const [committeeNotes, setCommitteeNotes] = useState('');
    const [approvedAmount, setApprovedAmount] = useState<number | null>(null);
    const [approvedDuration, setApprovedDuration] = useState<number | null>(null);

    // Reference data
    const [clients, setClients] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [creditOfficers, setCreditOfficers] = useState<any[]>([]);
    const [loanProducts, setLoanProducts] = useState<any[]>([]);
    const [statuts, setStatuts] = useState<any[]>([]);
    const [objetsCredit, setObjetsCredit] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [connectedUser, setConnectedUser] = useState<string>('');

    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    // Helper function for direct API calls
    const fetchWithAuth = async (url: string, options?: RequestInit) => {
        const token = Cookies.get('token');
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            credentials: 'include',
            ...options
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };

    useEffect(() => {
        loadReferenceData();
        loadDemandes();
        loadAnalyseReferenceData();
        loadCommitteeDecisions();
        // Get connected user from cookies
        const appUserStr = Cookies.get('appUser');
        if (appUserStr) {
            try {
                const appUser = JSON.parse(appUserStr);
                setConnectedUser(appUser.username || appUser.fullName || appUser.email || 'Unknown');
            } catch (e) {
                setConnectedUser(appUserStr);
            }
        }
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDemandes':
                    setDemandes(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succes', 'Demande de credit creee avec succes');
                    resetForm();
                    loadDemandes();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succes', 'Demande de credit modifiee avec succes');
                    resetForm();
                    loadDemandes();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succes', 'Demande de credit supprimee avec succes');
                    loadDemandes();
                    break;
                case 'updateStatus':
                    showToast('success', 'Succes', 'Statut mis a jour avec succes');
                    setShowStatusDialog(false);
                    loadDemandes();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    // Load analyse financiere reference data (income and expense types)
    const loadAnalyseReferenceData = async () => {
        try {
            const [incomeTypesData, expenseTypesData] = await Promise.all([
                fetchWithAuth(`${INCOME_TYPES_URL}/findall/active`).catch(() => []),
                fetchWithAuth(`${EXPENSE_TYPES_URL}/findall/active`).catch(() => [])
            ]);
            setTypesRevenus(Array.isArray(incomeTypesData) ? incomeTypesData : incomeTypesData?.content || []);
            setTypesDepenses(Array.isArray(expenseTypesData) ? expenseTypesData : expenseTypesData?.content || []);
        } catch (err) {
            console.error('Error loading analyse reference data:', err);
        }
    };

    // Load all reference data in parallel using direct fetch
    const loadReferenceData = async () => {
        setLoadingRef(true);
        try {
            const [
                clientsData,
                branchesData,
                usersData,
                productsData,
                statutsData,
                purposesData,
                accountsData
            ] = await Promise.all([
                fetchWithAuth(`${CLIENTS_URL}/findall`).catch(() => []),
                fetchWithAuth(`${BRANCHES_URL}/findall`).catch(() => []),
                fetchWithAuth(`${USERS_URL}`).catch(() => []),
                fetchWithAuth(`${PRODUCTS_URL}/findall`).catch(() => []),
                fetchWithAuth(`${STATUTS_URL}/findall/active`).catch(() => []),
                fetchWithAuth(`${PURPOSES_URL}/findall/active`).catch(() => []),
                fetchWithAuth(`${SAVINGS_ACCOUNTS_URL}/findallactive`).catch(() => [])
            ]);

            setClients(Array.isArray(clientsData) ? clientsData : clientsData?.content || []);
            setBranches(Array.isArray(branchesData) ? branchesData : branchesData?.content || []);
            setCreditOfficers(Array.isArray(usersData) ? usersData : usersData?.content || []);
            // Filter to only show ACTIVE loan products
            const allProducts = Array.isArray(productsData) ? productsData : productsData?.content || [];
            setLoanProducts(allProducts.filter((p: any) => p.status === 'ACTIVE'));
            setStatuts(Array.isArray(statutsData) ? statutsData : statutsData?.content || []);
            setObjetsCredit(Array.isArray(purposesData) ? purposesData : purposesData?.content || []);
            setSavingsAccounts(Array.isArray(accountsData) ? accountsData : accountsData?.content || []);
        } catch (err) {
            console.error('Error loading reference data:', err);
            showToast('error', 'Erreur', 'Erreur lors du chargement des donnees de reference');
        } finally {
            setLoadingRef(false);
        }
    };

    // Handle account selection - auto-populate client
    const handleAccountChange = (account: any) => {
        if (account) {
            const clientId = account.client?.id || account.clientId;
            if (!clientId) {
                showToast('warn', 'Attention', 'Le compte selectionne n\'a pas de client associe');
            }
            setDemande(prev => ({
                ...prev,
                clientId: clientId,
                savingsAccountId: account.id
            }));
        } else {
            setDemande(prev => ({
                ...prev,
                clientId: undefined,
                savingsAccountId: undefined
            }));
        }
    };

    const loadDemandes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDemandes');
    };

    // Handle product selection - auto-fill default values from product
    const handleProductChange = (product: any) => {
        if (product) {
            setDemande(prev => ({
                ...prev,
                loanProductId: product.id,
                // Set default amount if not already set or if amount is 0
                amountRequested: (!prev.amountRequested || prev.amountRequested === 0)
                    ? (product.defaultAmount || product.minAmount)
                    : prev.amountRequested,
                // Set default duration if not already set
                durationMonths: (!prev.durationMonths || prev.durationMonths === 12)
                    ? (product.defaultTermMonths || product.minTermMonths)
                    : prev.durationMonths,
                // Set default frequency from product if available
                repaymentFrequency: prev.repaymentFrequency || 'MONTHLY'
            }));
            showToast('info', 'Produit selectionne',
                `Montant: ${formatCurrency(product.minAmount)} - ${formatCurrency(product.maxAmount)} | Duree: ${product.minTermMonths} - ${product.maxTermMonths} mois`);
        }
    };

    // Load committee decisions
    const loadCommitteeDecisions = async () => {
        try {
            const decisionsData = await fetchWithAuth(`${COMMITTEE_DECISIONS_URL}/findall/active`).catch(() => []);
            setCommitteeDecisions(Array.isArray(decisionsData) ? decisionsData : decisionsData?.content || []);
        } catch (err) {
            console.error('Error loading committee decisions:', err);
        }
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setDemande(new DemandeCreditClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDemande(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setDemande(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setDemande(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setDemande(prev => ({ ...prev, [name]: value?.toISOString().split('T')[0] }));
    };

    const validateForm = (): boolean => {
        const errors: string[] = [];
        if (!demande.savingsAccountId) errors.push("Le compte d'epargne est obligatoire");
        if (!demande.clientId) errors.push('Le client est obligatoire');
        if (!demande.branchId) errors.push("L'agence de traitement est obligatoire");
        if (!demande.loanProductId) errors.push('Le produit de credit est obligatoire');
        if (!demande.amountRequested || demande.amountRequested <= 0) errors.push('Le montant demande doit etre superieur a 0');
        if (!demande.creditPurposeId) errors.push("L'objet du credit est obligatoire");

        // Validate against product limits if product is selected
        if (demande.loanProductId) {
            const product = loanProducts.find((p: any) => p.id === demande.loanProductId);
            if (product) {
                // Validate amount
                if (demande.amountRequested && demande.amountRequested < product.minAmount) {
                    errors.push(`Le montant minimum pour ce produit est ${formatCurrency(product.minAmount)}`);
                }
                if (demande.amountRequested && demande.amountRequested > product.maxAmount) {
                    errors.push(`Le montant maximum pour ce produit est ${formatCurrency(product.maxAmount)}`);
                }
                // Validate duration
                if (demande.durationMonths && demande.durationMonths < product.minTermMonths) {
                    errors.push(`La duree minimum pour ce produit est ${product.minTermMonths} mois`);
                }
                if (demande.durationMonths && demande.durationMonths > product.maxTermMonths) {
                    errors.push(`La duree maximum pour ce produit est ${product.maxTermMonths} mois`);
                }
            }
        }

        if (errors.length > 0) {
            showToast('error', 'Validation echouee', errors.join(' | '));
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        if (!demande.branchId || !demande.clientId || !demande.creditPurposeId) {
            showToast('error', 'Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }
        const demandeWithUser = { ...demande, userAction: connectedUser || 'Unknown' };
        if (demande.id) {
            fetchData(demandeWithUser, 'PUT', `${BASE_URL}/update/${demande.id}`, 'update');
        } else {
            fetchData(demandeWithUser, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: DemandeCredit) => {
        setDemande({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: DemandeCredit) => {
        setDemande({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: DemandeCredit) => {
        confirmDialog({
            message: `Etes-vous sur de vouloir supprimer la demande "${rowData.applicationNumber}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    // ==================== WORKFLOW FUNCTIONS ====================

    const handleOpenWorkflowDialog = (rowData: DemandeCredit) => {
        setWorkflowDemande(rowData);
        setWorkflowNotes('');
        setSelectedNewStatus(null);

        const currentStatusCode = rowData.status?.code || '';

        // Check if current status is PENDING_COMMITTEE - open committee dialog instead
        if (currentStatusCode === 'PENDING_COMMITTEE') {
            setSelectedDecision(null);
            setCommitteeNotes('');
            setApprovedAmount(rowData.amountRequested || null);
            setApprovedDuration(rowData.durationMonths || null);
            setShowCommitteeDialog(true);
            return;
        }

        // Get available transitions for current status
        const allowedStatusCodes = WORKFLOW_TRANSITIONS[currentStatusCode] || [];
        const transitions = statuts.filter((s: any) => allowedStatusCodes.includes(s.code));
        setAvailableTransitions(transitions);
        setShowWorkflowDialog(true);
    };

    const handleChangeStatus = async () => {
        if (!workflowDemande?.id || !selectedNewStatus) {
            showToast('warn', 'Attention', 'Veuillez selectionner un nouveau statut');
            return;
        }

        try {
            const token = Cookies.get('token');

            // Update application status (backend automatically creates history)
            const updateResponse = await fetch(`${BASE_URL}/update/${workflowDemande.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...workflowDemande,
                    statusId: selectedNewStatus.id,
                    statusDate: new Date().toISOString(),
                    userAction: connectedUser,
                    changeReason: workflowNotes || `Transition vers ${selectedNewStatus.nameFr}`
                })
            });

            if (!updateResponse.ok) throw new Error('Failed to update status');

            showToast('success', 'Succes', `Statut change vers "${selectedNewStatus.nameFr}"`);
            setShowWorkflowDialog(false);
            loadDemandes();
        } catch (err) {
            console.error('Error changing status:', err);
            showToast('error', 'Erreur', 'Erreur lors du changement de statut');
        }
    };

    const handleCommitteeDecision = async () => {
        if (!workflowDemande?.id || !selectedDecision) {
            showToast('warn', 'Attention', 'Veuillez selectionner une decision');
            return;
        }

        try {
            const token = Cookies.get('token');

            // Find the new status based on committee decision
            const newStatusCode = DECISION_TO_STATUS[selectedDecision.code];
            const newStatus = statuts.find((s: any) => s.code === newStatusCode);

            if (!newStatus) {
                showToast('error', 'Erreur', 'Statut correspondant non trouve');
                return;
            }

            // Prepare updated application data (backend automatically creates history)
            const updatedData: any = {
                ...workflowDemande,
                statusId: newStatus.id,
                statusDate: new Date().toISOString(),
                userAction: connectedUser,
                changeReason: `Decision comite: ${selectedDecision.nameFr}. ${committeeNotes || ''}`
            };

            // If decision includes reduced amount, update the approved amount
            if (selectedDecision.code === 'APPROUVE_MONTANT_REDUIT' && approvedAmount) {
                updatedData.amountApproved = approvedAmount;
            }
            if (approvedDuration) {
                updatedData.durationApproved = approvedDuration;
            }

            // Update application status
            const updateResponse = await fetch(`${BASE_URL}/update/${workflowDemande.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });

            if (!updateResponse.ok) throw new Error('Failed to update status');

            showToast('success', 'Succes', `Decision du comite enregistree: "${selectedDecision.nameFr}"`);
            setShowCommitteeDialog(false);
            loadDemandes();
        } catch (err) {
            console.error('Error recording committee decision:', err);
            showToast('error', 'Erreur', 'Erreur lors de l\'enregistrement de la decision');
        }
    };

    // ==================== ANALYSE FINANCIERE FUNCTIONS ====================

    const handleOpenAnalyseDialog = async (rowData: DemandeCredit) => {
        setAnalyseApplication(rowData);
        setShowAnalyseDialog(true);
        setLoadingAnalyse(true);

        try {
            const [revenusData, depensesData, capaciteData] = await Promise.all([
                fetchWithAuth(`${INCOME_URL}/findbyapplication/${rowData.id}`).catch(() => []),
                fetchWithAuth(`${EXPENSE_URL}/findbyapplication/${rowData.id}`).catch(() => []),
                fetchWithAuth(`${CAPACITY_URL}/findbyapplication/${rowData.id}`).catch(() => null)
            ]);

            setRevenus(Array.isArray(revenusData) ? revenusData : revenusData?.content || []);
            setDepenses(Array.isArray(depensesData) ? depensesData : depensesData?.content || []);
            setCapacite(capaciteData);
        } catch (err) {
            console.error('Error loading analyse data:', err);
            showToast('error', 'Erreur', 'Erreur lors du chargement des donnees d\'analyse');
        } finally {
            setLoadingAnalyse(false);
        }
    };

    const reloadAnalyseData = async () => {
        if (!analyseApplication?.id) return;
        setLoadingAnalyse(true);
        try {
            const [revenusData, depensesData, capaciteData] = await Promise.all([
                fetchWithAuth(`${INCOME_URL}/findbyapplication/${analyseApplication.id}`).catch(() => []),
                fetchWithAuth(`${EXPENSE_URL}/findbyapplication/${analyseApplication.id}`).catch(() => []),
                fetchWithAuth(`${CAPACITY_URL}/findbyapplication/${analyseApplication.id}`).catch(() => null)
            ]);

            setRevenus(Array.isArray(revenusData) ? revenusData : revenusData?.content || []);
            setDepenses(Array.isArray(depensesData) ? depensesData : depensesData?.content || []);
            setCapacite(capaciteData);
        } catch (err) {
            console.error('Error reloading analyse data:', err);
        } finally {
            setLoadingAnalyse(false);
        }
    };

    const handleSaveRevenu = async () => {
        if (!analyseApplication?.id) return;
        const revenuToSave = { ...editRevenu, applicationId: analyseApplication.id, userAction: getUserAction() };

        try {
            const url = editRevenu.id ? `${INCOME_URL}/update/${editRevenu.id}` : `${INCOME_URL}/new`;
            const method = editRevenu.id ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(revenuToSave)
            });

            showToast('success', 'Succes', 'Revenu enregistre avec succes');
            setShowRevenuForm(false);
            setEditRevenu(new AnalyseRevenuClass());
            reloadAnalyseData();
        } catch (err) {
            showToast('error', 'Erreur', 'Erreur lors de l\'enregistrement du revenu');
        }
    };

    const handleDeleteRevenu = (revenu: AnalyseRevenu) => {
        confirmDialog({
            message: 'Etes-vous sur de vouloir supprimer ce revenu ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                try {
                    await fetch(`${INCOME_URL}/delete/${revenu.id}`, { method: 'DELETE', credentials: 'include' });
                    showToast('success', 'Succes', 'Revenu supprime');
                    reloadAnalyseData();
                } catch (err) {
                    showToast('error', 'Erreur', 'Erreur lors de la suppression');
                }
            }
        });
    };

    const handleSaveDepense = async () => {
        if (!analyseApplication?.id) return;
        const depenseToSave = { ...editDepense, applicationId: analyseApplication.id, userAction: getUserAction() };

        try {
            const url = editDepense.id ? `${EXPENSE_URL}/update/${editDepense.id}` : `${EXPENSE_URL}/new`;
            const method = editDepense.id ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(depenseToSave)
            });

            showToast('success', 'Succes', 'Depense enregistree avec succes');
            setShowDepenseForm(false);
            setEditDepense(new AnalyseDepenseClass());
            reloadAnalyseData();
        } catch (err) {
            showToast('error', 'Erreur', 'Erreur lors de l\'enregistrement de la depense');
        }
    };

    const handleDeleteDepense = (depense: AnalyseDepense) => {
        confirmDialog({
            message: 'Etes-vous sur de vouloir supprimer cette depense ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                try {
                    await fetch(`${EXPENSE_URL}/delete/${depense.id}`, { method: 'DELETE', credentials: 'include' });
                    showToast('success', 'Succes', 'Depense supprimee');
                    reloadAnalyseData();
                } catch (err) {
                    showToast('error', 'Erreur', 'Erreur lors de la suppression');
                }
            }
        });
    };

    const handleCalculateCapacity = async () => {
        if (!analyseApplication?.id) return;
        try {
            await fetch(`${CAPACITY_URL}/calculate/${analyseApplication.id}`, { method: 'POST', credentials: 'include' });
            showToast('success', 'Succes', 'Capacite de remboursement calculee');
            reloadAnalyseData();
        } catch (err) {
            showToast('error', 'Erreur', 'Erreur lors du calcul de la capacite');
        }
    };

    const formatCurrency = (value: number | undefined) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF', maximumFractionDigits: 0 }).format(value || 0);
    };

    const totalRevenus = revenus.reduce((sum, r) => sum + (r.declaredAmount || 0), 0);
    const totalRevenusVerifies = revenus.reduce((sum, r) => sum + (r.verifiedAmount || 0), 0);
    const totalDepenses = depenses.reduce((sum, d) => sum + (d.monthlyAmount || 0), 0);
    const revenuDisponible = totalRevenusVerifies - totalDepenses;

    // ==================== END ANALYSE FINANCIERE FUNCTIONS ====================

    const statusBodyTemplate = (rowData: DemandeCredit) => {
        const status = rowData.status;
        return <Tag value={status?.nameFr || 'N/A'} style={{ backgroundColor: status?.color || '#6c757d' }} />;
    };

    const amountBodyTemplate = (rowData: DemandeCredit) => {
        return formatCurrency(rowData.amountRequested);
    };

    const clientBodyTemplate = (rowData: DemandeCredit) => {
        const client = rowData.client;
        return client ? `${client.firstName} ${client.lastName}` : 'N/A';
    };

    const dateBodyTemplate = (rowData: DemandeCredit) => {
        return rowData.applicationDate ? new Date(rowData.applicationDate).toLocaleDateString('fr-FR') : 'N/A';
    };

    const actionsBodyTemplate = (rowData: DemandeCredit) => {
        const isCommitteeStatus = rowData.status?.code === 'PENDING_COMMITTEE';
        const isFinalStatus = ['DISBURSED', 'REJETE'].includes(rowData.status?.code || '');

        return (
            <div className="flex gap-1">
                <Button icon="pi pi-eye" rounded text severity="info" onClick={() => handleView(rowData)} tooltip="Voir" />
                <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(rowData)} tooltip="Modifier" disabled={!rowData.status?.allowsEdit} />
                <Button
                    icon={isCommitteeStatus ? "pi pi-users" : "pi pi-arrow-right"}
                    rounded
                    text
                    severity={isCommitteeStatus ? "danger" : "success"}
                    onClick={() => handleOpenWorkflowDialog(rowData)}
                    tooltip={isCommitteeStatus ? "Decision Comite" : "Avancer Workflow"}
                    disabled={isFinalStatus}
                />
                <Button icon="pi pi-history" rounded text severity="secondary" onClick={() => window.location.href = `/credit/historique-workflow/${rowData.id}`} tooltip="Historique Workflow" />
                <Button icon="pi pi-chart-line" rounded text severity="success" onClick={() => window.location.href = `/credit/dossier/${rowData.id}`} tooltip="Voir dossier complet" />
                <Button icon="pi pi-calculator" rounded text severity="info" onClick={() => handleOpenAnalyseDialog(rowData)} tooltip="Analyse financiere" />
                <Button icon="pi pi-map-marker" rounded text severity="help" onClick={() => window.location.href = `/credit/visites/${rowData.id}`} tooltip="Visite terrain" />
                <Button icon="pi pi-file" rounded text severity="warning" onClick={() => window.location.href = `/credit/documents/${rowData.id}`} tooltip="Documents" />
                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(rowData)} tooltip="Supprimer" disabled={!rowData.status?.allowsEdit} />
            </div>
        );
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Liste des Demandes de Credit</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="mb-4">
                <i className="pi pi-folder-open mr-2"></i>
                Gestion des Demandes de Credit
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Demande" leftIcon="pi pi-plus mr-2">
                    {loadingRef ? (
                        <div className="flex align-items-center justify-content-center p-5">
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                            <span className="ml-2">Chargement des donnees...</span>
                        </div>
                    ) : (
                        <>
                            <DemandeCreditForm
                                demande={demande}
                                handleChange={handleChange}
                                handleDropdownChange={handleDropdownChange}
                                handleNumberChange={handleNumberChange}
                                handleDateChange={handleDateChange}
                                clients={clients}
                                branches={branches}
                                creditOfficers={creditOfficers}
                                loanProducts={loanProducts}
                                statuts={statuts}
                                objetsCredit={objetsCredit}
                                savingsAccounts={savingsAccounts}
                                onAccountChange={handleAccountChange}
                                onProductChange={handleProductChange}
                                connectedUser={connectedUser}
                                isViewMode={isViewMode}
                            />
                            <div className="flex justify-content-end gap-2 mt-4">
                                <Button label="Reinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                                {!isViewMode && (
                                    <Button label={demande.id ? 'Modifier' : 'Enregistrer'} icon={demande.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                                )}
                            </div>
                        </>
                    )}
                </TabPanel>

                <TabPanel header="Liste des Demandes" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={demandes}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading && callType === 'loadDemandes'}
                        emptyMessage="Aucune demande de credit trouvee"
                        className="p-datatable-sm"
                        globalFilter={globalFilter}
                        header={header}
                        sortField="applicationDate"
                        sortOrder={-1}
                    >
                        <Column field="applicationNumber" header="N Dossier" sortable filter style={{ minWidth: '130px' }} />
                        <Column header="Client" body={clientBodyTemplate} sortable filter />
                        <Column header="Date" body={dateBodyTemplate} sortable />
                        <Column header="Montant" body={amountBodyTemplate} sortable />
                        <Column field="durationMonths" header="Duree (mois)" sortable />
                        <Column field="creditPurpose.nameFr" header="Objet" sortable filter />
                        <Column field="userAction" header="Utilisateur" sortable filter />
                        <Column header="Statut" body={statusBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '280px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Analyse Financiere Dialog */}
            <Dialog
                header={`Analyse Financiere - ${analyseApplication?.applicationNumber || ''}`}
                visible={showAnalyseDialog}
                style={{ width: '90vw', maxWidth: '1200px' }}
                onHide={() => {
                    setShowAnalyseDialog(false);
                    setAnalyseApplication(null);
                    setRevenus([]);
                    setDepenses([]);
                    setCapacite(null);
                }}
                maximizable
            >
                {loadingAnalyse ? (
                    <div className="flex align-items-center justify-content-center p-5">
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                        <span className="ml-2">Chargement des donnees d'analyse...</span>
                    </div>
                ) : (
                    <div className="grid">
                        {/* Summary Cards */}
                        <div className="col-12">
                            <div className="grid">
                                <div className="col-12 md:col-3">
                                    <Card className="bg-blue-100 text-center">
                                        <div className="text-xl font-bold text-blue-700">{formatCurrency(totalRevenus)}</div>
                                        <div className="text-500 text-sm">Revenus Declares</div>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-3">
                                    <Card className="bg-green-100 text-center">
                                        <div className="text-xl font-bold text-green-700">{formatCurrency(totalRevenusVerifies)}</div>
                                        <div className="text-500 text-sm">Revenus Verifies</div>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-3">
                                    <Card className="bg-orange-100 text-center">
                                        <div className="text-xl font-bold text-orange-700">{formatCurrency(totalDepenses)}</div>
                                        <div className="text-500 text-sm">Charges Mensuelles</div>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-3">
                                    <Card className={revenuDisponible >= 0 ? 'bg-teal-100 text-center' : 'bg-red-100 text-center'}>
                                        <div className={`text-xl font-bold ${revenuDisponible >= 0 ? 'text-teal-700' : 'text-red-700'}`}>{formatCurrency(revenuDisponible)}</div>
                                        <div className="text-500 text-sm">Revenu Disponible</div>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        {/* Revenus Section */}
                        <div className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round">
                                <div className="flex justify-content-between align-items-center mb-3">
                                    <h5 className="m-0"><i className="pi pi-dollar mr-2"></i>Revenus</h5>
                                    <Button icon="pi pi-plus" label="Ajouter" size="small" onClick={() => { setEditRevenu(new AnalyseRevenuClass()); setShowRevenuForm(true); }} />
                                </div>
                                <DataTable value={revenus} emptyMessage="Aucun revenu" className="p-datatable-sm" scrollable scrollHeight="250px">
                                    <Column field="incomeType.nameFr" header="Type" />
                                    <Column field="declaredAmount" header="Declare" body={(row) => formatCurrency(row.declaredAmount)} />
                                    <Column field="verifiedAmount" header="Verifie" body={(row) => formatCurrency(row.verifiedAmount)} />
                                    <Column field="isVerified" header="Statut" body={(row) => <Tag value={row.isVerified ? 'Verifie' : 'Non verifie'} severity={row.isVerified ? 'success' : 'warning'} />} />
                                    <Column header="Actions" body={(row) => (
                                        <div className="flex gap-1">
                                            <Button icon="pi pi-pencil" rounded text severity="warning" size="small" onClick={() => { setEditRevenu({ ...row }); setShowRevenuForm(true); }} />
                                            <Button icon="pi pi-trash" rounded text severity="danger" size="small" onClick={() => handleDeleteRevenu(row)} />
                                        </div>
                                    )} style={{ width: '100px' }} />
                                </DataTable>
                            </div>
                        </div>

                        {/* Depenses Section */}
                        <div className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round">
                                <div className="flex justify-content-between align-items-center mb-3">
                                    <h5 className="m-0"><i className="pi pi-credit-card mr-2"></i>Charges</h5>
                                    <Button icon="pi pi-plus" label="Ajouter" size="small" onClick={() => { setEditDepense(new AnalyseDepenseClass()); setShowDepenseForm(true); }} />
                                </div>
                                <DataTable value={depenses} emptyMessage="Aucune charge" className="p-datatable-sm" scrollable scrollHeight="250px">
                                    <Column field="expenseType.nameFr" header="Type" />
                                    <Column field="monthlyAmount" header="Montant" body={(row) => formatCurrency(row.monthlyAmount)} />
                                    <Column field="isEssential" header="Essentiel" body={(row) => <i className={`pi ${row.isEssential ? 'pi-check text-green-500' : 'pi-times text-red-500'}`} />} />
                                    <Column header="Actions" body={(row) => (
                                        <div className="flex gap-1">
                                            <Button icon="pi pi-pencil" rounded text severity="warning" size="small" onClick={() => { setEditDepense({ ...row }); setShowDepenseForm(true); }} />
                                            <Button icon="pi pi-trash" rounded text severity="danger" size="small" onClick={() => handleDeleteDepense(row)} />
                                        </div>
                                    )} style={{ width: '100px' }} />
                                </DataTable>
                            </div>
                        </div>

                        {/* Capacity Analysis */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round">
                                <div className="flex justify-content-between align-items-center mb-3">
                                    <h5 className="m-0"><i className="pi pi-calculator mr-2"></i>Capacite de Remboursement</h5>
                                    <Button icon="pi pi-refresh" label="Recalculer" size="small" onClick={handleCalculateCapacity} />
                                </div>
                                {capacite ? (
                                    <div className="grid">
                                        <div className="col-12 md:col-4">
                                            <div className="mb-2">
                                                <label className="font-semibold">Score de capacite:</label>
                                                <ProgressBar value={capacite.capacityPercentage || 0} className="mt-1" />
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <div className="mb-2">
                                                <label className="font-semibold">Evaluation:</label>
                                                <div className="mt-1">
                                                    <Tag value={capacite.isCapacitySufficient ? 'Suffisant' : 'Insuffisant'} severity={capacite.isCapacitySufficient ? 'success' : 'danger'} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <div className="mb-2">
                                                <label className="font-semibold">Montant recommande:</label>
                                                <div className="text-xl font-bold text-primary mt-1">{formatCurrency(capacite.recommendedMaxAmount)}</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <label className="font-semibold">Duree recommandee:</label>
                                            <div className="mt-1">{capacite.recommendedMaxDuration || 0} mois</div>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <label className="font-semibold">Ratio d'endettement:</label>
                                            <div className="mt-1">{(capacite.newDebtRatio || 0).toFixed(1)}%</div>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <label className="font-semibold">Capacite max mensuelle:</label>
                                            <div className="mt-1">{formatCurrency(capacite.repaymentCapacity)}</div>
                                        </div>
                                        {capacite.analysisNotes && (
                                            <div className="col-12">
                                                <label className="font-semibold">Notes:</label>
                                                <p className="mt-1 text-500">{capacite.analysisNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-500 text-center">Cliquez sur "Recalculer" pour generer l'analyse de capacite</p>
                                )}
                            </div>
                        </div>

                        {/* Footer buttons */}
                        <div className="col-12">
                            <div className="flex justify-content-between">
                                <Button label="Ouvrir page complete" icon="pi pi-external-link" severity="secondary" onClick={() => window.location.href = `/credit/analyses/${analyseApplication?.id}`} />
                                <Button label="Fermer" icon="pi pi-times" severity="secondary" onClick={() => setShowAnalyseDialog(false)} />
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Revenu Form Dialog */}
            <Dialog header={editRevenu.id ? "Modifier le Revenu" : "Ajouter un Revenu"} visible={showRevenuForm} style={{ width: '500px' }} onHide={() => { setShowRevenuForm(false); setEditRevenu(new AnalyseRevenuClass()); }}>
                <div className="formgrid grid">
                    <div className="field col-12">
                        <label className="font-semibold">Type de Revenu *</label>
                        <Dropdown value={editRevenu.incomeTypeId} options={typesRevenus} onChange={(e) => setEditRevenu(prev => ({ ...prev, incomeTypeId: e.value }))} optionLabel="nameFr" optionValue="id" placeholder="Selectionner" className="w-full" filter />
                    </div>
                    <div className="field col-6">
                        <label className="font-semibold">Montant Declare (BIF) *</label>
                        <InputNumber value={editRevenu.declaredAmount || 0} onValueChange={(e) => setEditRevenu(prev => ({ ...prev, declaredAmount: e.value ?? 0 }))} className="w-full" mode="currency" currency="BIF" locale="fr-FR" />
                    </div>
                    <div className="field col-6">
                        <label className="font-semibold">Montant Verifie (BIF)</label>
                        <InputNumber value={editRevenu.verifiedAmount || 0} onValueChange={(e) => setEditRevenu(prev => ({ ...prev, verifiedAmount: e.value ?? 0 }))} className="w-full" mode="currency" currency="BIF" locale="fr-FR" />
                    </div>
                    <div className="field col-6">
                        <label className="font-semibold">Employeur / Source</label>
                        <InputText value={editRevenu.employerName || ''} onChange={(e) => setEditRevenu(prev => ({ ...prev, employerName: e.target.value }))} className="w-full" />
                    </div>
                    <div className="field col-6">
                        <label className="font-semibold">Type de Contrat</label>
                        <Dropdown value={editRevenu.contractType} options={TypesContrat} onChange={(e) => setEditRevenu(prev => ({ ...prev, contractType: e.value }))} optionLabel="label" optionValue="code" placeholder="Selectionner" className="w-full" />
                    </div>
                    <div className="field col-6">
                        <label className="font-semibold">Anciennete (mois)</label>
                        <InputNumber value={editRevenu.employmentDuration || 0} onValueChange={(e) => setEditRevenu(prev => ({ ...prev, employmentDuration: e.value ?? 0 }))} className="w-full" suffix=" mois" />
                    </div>
                    <div className="field col-6">
                        <div className="flex align-items-center gap-2 mt-4">
                            <Checkbox checked={editRevenu.isVerified || false} onChange={(e) => setEditRevenu(prev => ({ ...prev, isVerified: e.checked ?? false }))} />
                            <label>Verifie</label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setShowRevenuForm(false)} />
                    <Button label="Enregistrer" icon="pi pi-save" onClick={handleSaveRevenu} />
                </div>
            </Dialog>

            {/* Depense Form Dialog */}
            <Dialog header={editDepense.id ? "Modifier la Charge" : "Ajouter une Charge"} visible={showDepenseForm} style={{ width: '500px' }} onHide={() => { setShowDepenseForm(false); setEditDepense(new AnalyseDepenseClass()); }}>
                <div className="formgrid grid">
                    <div className="field col-12">
                        <label className="font-semibold">Type de Charge *</label>
                        <Dropdown value={editDepense.expenseTypeId} options={typesDepenses} onChange={(e) => setEditDepense(prev => ({ ...prev, expenseTypeId: e.value }))} optionLabel="nameFr" optionValue="id" placeholder="Selectionner" className="w-full" filter />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Montant Mensuel (BIF) *</label>
                        <InputNumber value={editDepense.monthlyAmount || 0} onValueChange={(e) => setEditDepense(prev => ({ ...prev, monthlyAmount: e.value ?? 0 }))} className="w-full" mode="currency" currency="BIF" locale="fr-FR" />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Description</label>
                        <InputTextarea value={editDepense.description || ''} onChange={(e) => setEditDepense(prev => ({ ...prev, description: e.target.value }))} className="w-full" rows={2} />
                    </div>
                    <div className="field col-12">
                        <div className="flex align-items-center gap-2">
                            <Checkbox checked={editDepense.isEssential || false} onChange={(e) => setEditDepense(prev => ({ ...prev, isEssential: e.checked ?? false }))} />
                            <label>Charge essentielle</label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setShowDepenseForm(false)} />
                    <Button label="Enregistrer" icon="pi pi-save" onClick={handleSaveDepense} />
                </div>
            </Dialog>

            {/* Workflow Status Change Dialog */}
            <Dialog
                header={<><i className="pi pi-arrow-right mr-2"></i>Avancer le Workflow</>}
                visible={showWorkflowDialog}
                style={{ width: '500px' }}
                onHide={() => { setShowWorkflowDialog(false); setWorkflowDemande(null); }}
            >
                {workflowDemande && (
                    <div className="formgrid grid">
                        <div className="col-12 mb-3">
                            <Card className="bg-blue-50">
                                <div className="flex align-items-center gap-3">
                                    <div>
                                        <div className="text-500 text-sm">Dossier</div>
                                        <div className="font-bold">{workflowDemande.applicationNumber}</div>
                                    </div>
                                    <div className="ml-auto">
                                        <div className="text-500 text-sm">Statut actuel</div>
                                        <Tag value={workflowDemande.status?.nameFr || 'N/A'} style={{ backgroundColor: workflowDemande.status?.color || '#6c757d' }} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold">Nouveau Statut *</label>
                            <Dropdown
                                value={selectedNewStatus}
                                options={availableTransitions}
                                onChange={(e) => setSelectedNewStatus(e.value)}
                                optionLabel="nameFr"
                                placeholder="Selectionner le nouveau statut"
                                className="w-full"
                                emptyMessage="Aucune transition disponible"
                            />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold">Notes / Commentaires</label>
                            <InputTextarea
                                value={workflowNotes}
                                onChange={(e) => setWorkflowNotes(e.target.value)}
                                className="w-full"
                                rows={3}
                                placeholder="Ajouter des notes sur ce changement de statut..."
                            />
                        </div>

                        <div className="col-12">
                            <div className="flex justify-content-end gap-2">
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setShowWorkflowDialog(false)} />
                                <Button label="Confirmer" icon="pi pi-check" onClick={handleChangeStatus} disabled={!selectedNewStatus} />
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Committee Decision Dialog */}
            <Dialog
                header={<><i className="pi pi-users mr-2"></i>Decision du Comite de Credit</>}
                visible={showCommitteeDialog}
                style={{ width: '600px' }}
                onHide={() => { setShowCommitteeDialog(false); setWorkflowDemande(null); }}
            >
                {workflowDemande && (
                    <div className="formgrid grid">
                        <div className="col-12 mb-3">
                            <Card className="bg-orange-50">
                                <div className="grid">
                                    <div className="col-6">
                                        <div className="text-500 text-sm">Dossier</div>
                                        <div className="font-bold">{workflowDemande.applicationNumber}</div>
                                    </div>
                                    <div className="col-6">
                                        <div className="text-500 text-sm">Client</div>
                                        <div className="font-bold">{workflowDemande.client ? `${workflowDemande.client.firstName} ${workflowDemande.client.lastName}` : 'N/A'}</div>
                                    </div>
                                    <div className="col-6">
                                        <div className="text-500 text-sm">Montant demande</div>
                                        <div className="font-bold text-primary">{formatCurrency(workflowDemande.amountRequested)}</div>
                                    </div>
                                    <div className="col-6">
                                        <div className="text-500 text-sm">Duree demandee</div>
                                        <div className="font-bold">{workflowDemande.durationMonths} mois</div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold">Decision du Comite *</label>
                            <Dropdown
                                value={selectedDecision}
                                options={committeeDecisions}
                                onChange={(e) => setSelectedDecision(e.value)}
                                optionLabel="nameFr"
                                placeholder="Selectionner la decision"
                                className="w-full"
                                itemTemplate={(option) => (
                                    <div className="flex align-items-center gap-2">
                                        <Tag value={option.isApproval ? 'Approbation' : 'Rejet'} severity={option.isApproval ? 'success' : 'danger'} />
                                        <span>{option.nameFr}</span>
                                    </div>
                                )}
                            />
                        </div>

                        {selectedDecision && (selectedDecision.code === 'APPROUVE_MONTANT_REDUIT' || selectedDecision.isApproval) && (
                            <>
                                <div className="field col-6">
                                    <label className="font-semibold">Montant Approuve (BIF)</label>
                                    <InputNumber
                                        value={approvedAmount}
                                        onValueChange={(e) => setApprovedAmount(e.value ?? null)}
                                        className="w-full"
                                        mode="currency"
                                        currency="BIF"
                                        locale="fr-FR"
                                    />
                                </div>
                                <div className="field col-6">
                                    <label className="font-semibold">Duree Approuvee (mois)</label>
                                    <InputNumber
                                        value={approvedDuration}
                                        onValueChange={(e) => setApprovedDuration(e.value ?? null)}
                                        className="w-full"
                                        suffix=" mois"
                                    />
                                </div>
                            </>
                        )}

                        <div className="field col-12">
                            <label className="font-semibold">Notes du Comite</label>
                            <InputTextarea
                                value={committeeNotes}
                                onChange={(e) => setCommitteeNotes(e.target.value)}
                                className="w-full"
                                rows={3}
                                placeholder="Motifs de la decision, conditions, observations..."
                            />
                        </div>

                        <div className="col-12">
                            <div className="flex justify-content-end gap-2">
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setShowCommitteeDialog(false)} />
                                <Button
                                    label="Enregistrer la Decision"
                                    icon="pi pi-check"
                                    severity={selectedDecision?.isApproval ? 'success' : 'danger'}
                                    onClick={handleCommitteeDecision}
                                    disabled={!selectedDecision}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
