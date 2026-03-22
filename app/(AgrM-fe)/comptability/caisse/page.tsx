'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import Cookies from 'js-cookie';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { shouldFilterByBranch } from '../../../../utils/branchFilter';
import { CptCaisse, CptCashCount, CptCompte, CptExercice, VirementInterne } from '../types';
import { ProtectedPage } from '@/components/ProtectedPage';

const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('fr-FR');
};

const formatDate = (value: string | undefined | null): string => {
    if (!value) return '';
    try {
        const date = new Date(value);
        return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    } catch {
        return value;
    }
};

const formatDateTime = (value: string | undefined | null): string => {
    if (!value) return '';
    try {
        const date = new Date(value);
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    } catch {
        return value;
    }
};

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

function CaissePage() {
    const [activeTab, setActiveTab] = useState(0);

    // Tab 1: Caisse CRUD
    const [caisses, setCaisses] = useState<CptCaisse[]>([]);
    const [caisse, setCaisse] = useState<CptCaisse>(new CptCaisse());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');

    // Tab 2: Open/Close
    const [selectedCaisse, setSelectedCaisse] = useState<CptCaisse | null>(null);
    const [cashCount, setCashCount] = useState<CptCashCount>(new CptCashCount());
    const [plafondAlert, setPlafondAlert] = useState<any>(null);

    // Tab 3: Operations (Credit/Debit)
    const [operationCaisse, setOperationCaisse] = useState<CptCaisse | null>(null);
    const [operationMontant, setOperationMontant] = useState<number>(0);
    const [operationContrepartie, setOperationContrepartie] = useState<string>('');
    const [operationLibelle, setOperationLibelle] = useState<string>('');
    const [comptes, setComptes] = useState<CptCompte[]>([]);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);

    // Tab 3b: Virement Inter-Caisse
    const [virementSource, setVirementSource] = useState<CptCaisse | null>(null);
    const [virementDest, setVirementDest] = useState<CptCaisse | null>(null);
    const [virementMontant, setVirementMontant] = useState<number>(0);
    const [virementLibelle, setVirementLibelle] = useState<string>('');
    const [virementBilletage, setVirementBilletage] = useState<CptCashCount>(new CptCashCount());

    // Tab 4: Monitoring
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState(30);
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    // Daily summaries map: caisseId → summary data (credits, debits, theoretical balance)
    const [dailySummaries, setDailySummaries] = useState<{ [caisseId: string]: any }>({});

    // Monitoring: expanded journal per caisse
    const [expandedJournals, setExpandedJournals] = useState<{ [caisseId: string]: boolean }>({});
    const [mouvements, setMouvements] = useState<{ [caisseId: string]: any[] }>({});

    // Tab 5: History
    const [counts, setCounts] = useState<CptCashCount[]>([]);

    // All caisses without branch filter — used for Caisse Parente dropdown
    const [allCaisses, setAllCaisses] = useState<CptCaisse[]>([]);

    // Billetage (physical cash count after operation)
    const [billetageVisible, setBilletageVisible] = useState(false);
    const [billetageCaisse, setBilletageCaisse] = useState<CptCaisse | null>(null);
    const [billetageCount, setBilletageCount] = useState<CptCashCount>(new CptCashCount());
    const [billetageOperationType, setBilletageOperationType] = useState<string>('');

    // Tab 6: Billetage details per caisse
    const [billetageDetails, setBilletageDetails] = useState<{ [caisseId: string]: CptCashCount | null }>({});
    const [billetageDetailsLoading, setBilletageDetailsLoading] = useState(false);
    const [billetageDetailCaisse, setBilletageDetailCaisse] = useState<CptCaisse | null>(null);

    // Tab 7: Historique Transferts
    const [transferHistory, setTransferHistory] = useState<VirementInterne[]>([]);
    const [transferHistoryCaisse, setTransferHistoryCaisse] = useState<CptCaisse | null>(null);

    // Pending receipts (AGENCE, CHEF_AGENCE, GUICHET must confirm)
    const [pendingReceipts, setPendingReceipts] = useState<VirementInterne[]>([]);
    const [pendingReceiptsCaisse, setPendingReceiptsCaisse] = useState<CptCaisse | null>(null);
    // Acknowledge receipt - view source billetage before confirming
    const [ackDialogVisible, setAckDialogVisible] = useState(false);
    const [ackVirement, setAckVirement] = useState<VirementInterne | null>(null);
    // Reference data
    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    const toast = useRef<Toast>(null);

    const { data: caissesData, loading: caissesLoading, error: caissesError, fetchData: fetchCaisses, callType: caissesCallType } = useConsumApi('');
    const { data: crudData, loading: crudLoading, error: crudError, fetchData: fetchCrud, callType: crudCallType } = useConsumApi('');
    const { data: operationData, loading: operationLoading, error: operationError, fetchData: fetchOperation, callType: operationCallType } = useConsumApi('');
    const { data: countsData, loading: countsLoading, error: countsError, fetchData: fetchCounts, callType: countsCallType } = useConsumApi('');
    const { data: plafondData, fetchData: fetchPlafond, callType: plafondCallType } = useConsumApi('');
    const { data: comptesData, fetchData: fetchComptes, callType: comptesCallType } = useConsumApi('');
    const { data: creditDebitData, loading: creditDebitLoading, error: creditDebitError, fetchData: fetchCreditDebit, callType: creditDebitCallType } = useConsumApi('');
    const { data: usersData, fetchData: fetchUsers, callType: usersCallType } = useConsumApi('');
    const { data: branchesData, fetchData: fetchBranches, callType: branchesCallType } = useConsumApi('');
    const { data: summariesData, fetchData: fetchSummaries, callType: summariesCallType } = useConsumApi('');
    const { data: allCaissesData, error: allCaissesError, fetchData: fetchAllCaisses, callType: allCaissesCallType } = useConsumApi('');
    const { data: mouvementsData, fetchData: fetchMouvements, callType: mouvementsCallType } = useConsumApi('');
    const { data: virementData, loading: virementLoading, error: virementError, fetchData: fetchVirement, callType: virementCallType } = useConsumApi('');
    const { data: internalAccountsData, fetchData: fetchInternalAccounts, callType: internalAccountsCallType } = useConsumApi('');
    const { data: billetageData, loading: billetageLoading, error: billetageError, fetchData: fetchBilletage, callType: billetageCallType } = useConsumApi('');
    // billetageDetail hook removed — loadAllBilletageDetails now uses direct fetch with Promise.all
    const { data: transferHistoryData, loading: transferHistoryLoading, fetchData: fetchTransferHistory, callType: transferHistoryCallType } = useConsumApi('');
    const { data: pendingData, fetchData: fetchPending, callType: pendingCallType } = useConsumApi('');
    const { data: ackData, loading: ackLoading, error: ackError, fetchData: fetchAck, callType: ackCallType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/comptability/caisses');
    const INTERNAL_ACCOUNTS_URL = buildApiUrl('/api/comptability/internal-accounts');
    const ECRITURES_URL = buildApiUrl('/api/comptability/ecritures');
    const USERS_URL = buildApiUrl('/api/users');
    const REF_URL = buildApiUrl('/api/reference-data');

    useEffect(() => {
        loadCaisses();
        loadAllCaisses();
        loadComptes();
        loadInternalAccounts();
        loadUsers();
        loadBranches();
        // Load current exercice from cookies
        const savedExercice = Cookies.get('currentExercice');
        if (savedExercice) {
            try {
                setCurrentExercice(JSON.parse(savedExercice));
            } catch (e) { /* ignore */ }
        }
    }, []);

    // Auto-refresh for monitoring
    useEffect(() => {
        if (autoRefresh) {
            setCountdown(30);
            refreshTimerRef.current = setInterval(() => {
                loadCaisses();
                loadDailySummaries();
                setLastRefresh(new Date());
                setCountdown(30);
            }, 30000);
            countdownTimerRef.current = setInterval(() => {
                setCountdown(prev => (prev > 1 ? prev - 1 : 30));
            }, 1000);
        } else {
            if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        }
        return () => {
            if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        };
    }, [autoRefresh]);

    // Handle caisses list
    useEffect(() => {
        if (caissesData && caissesCallType === 'getall') {
            setCaisses(Array.isArray(caissesData) ? caissesData : []);
            setLastRefresh(new Date());
            // Load daily summaries whenever caisses are refreshed
            loadDailySummaries();
        }
        if (caissesError && caissesCallType === 'getall') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: caissesError.message || 'Erreur', life: 3000 });
        }
    }, [caissesData, caissesError, caissesCallType]);

    // Handle all-caisses (no branch filter) for Caisse Parente dropdown
    useEffect(() => {
        if (allCaissesData && allCaissesCallType === 'getallcaisses') {
            const list = Array.isArray(allCaissesData) ? allCaissesData : [];
            setAllCaisses(list);
        }
        if (allCaissesError && allCaissesCallType === 'getallcaisses') {
            // Fallback: use branch-filtered caisses already loaded
            console.warn('Could not load all caisses for parent dropdown, using filtered list:', allCaissesError);
            if (caisses.length > 0) setAllCaisses(caisses);
        }
    }, [allCaissesData, allCaissesError, allCaissesCallType]);

    // Handle mouvements response → store by caisseId extracted from callType ("mouvements-{id}")
    useEffect(() => {
        if (mouvementsData && mouvementsCallType?.startsWith('mouvements-')) {
            const caisseId = mouvementsCallType.replace('mouvements-', '');
            setMouvements(prev => ({ ...prev, [caisseId]: Array.isArray(mouvementsData) ? mouvementsData : [] }));
        }
    }, [mouvementsData, mouvementsCallType]);

    // Handle daily summaries response → build a map caisseId → summary
    useEffect(() => {
        if (summariesData && summariesCallType === 'all-summaries') {
            const map: { [key: string]: any } = {};
            if (Array.isArray(summariesData)) {
                summariesData.forEach((s: any) => {
                    if (s.caisseId) map[String(s.caisseId)] = s;
                });
            }
            setDailySummaries(map);
        }
    }, [summariesData, summariesCallType]);

    // Handle CRUD response
    useEffect(() => {
        if (crudData && (crudCallType === 'create' || crudCallType === 'update')) {
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: crudCallType === 'create' ? 'Caisse creee' : 'Caisse modifiee', life: 3000 });
            loadCaisses();
            setDialogVisible(false);
        }
        if (crudError && (crudCallType === 'create' || crudCallType === 'update')) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: crudError.message || 'Erreur', life: 3000 });
        }
    }, [crudData, crudError, crudCallType]);

    // Handle operation (open/close) response
    useEffect(() => {
        if (operationData && (operationCallType === 'open' || operationCallType === 'close')) {
            const msg = operationCallType === 'open' ? 'Caisse ouverte avec succes' : 'Caisse fermee avec succes';
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: msg, life: 5000 });

            // Check ecart
            const result = operationData as any;
            if (result.ecart && Math.abs(result.ecart) > 0.01) {
                toast.current?.show({
                    severity: result.ecart < 0 ? 'error' : 'warn',
                    summary: 'Ecart detecte',
                    detail: `Ecart de ${formatNumber(result.ecart)} FBu (Physique: ${formatNumber(result.totalPhysique)} - Theorique: ${formatNumber(result.totalTheorique)})`,
                    life: 8000
                });
            }

            loadCaisses();
            setCashCount(new CptCashCount());
            if (selectedCaisse) {
                loadCounts(selectedCaisse.caisseId);
                checkPlafond(selectedCaisse.caisseId);
            }
        }
        if (operationError && (operationCallType === 'open' || operationCallType === 'close')) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: operationError.message || 'Erreur', life: 5000 });
        }
    }, [operationData, operationError, operationCallType]);

    // Handle counts history
    useEffect(() => {
        if (countsData && countsCallType === 'counts') {
            setCounts(Array.isArray(countsData) ? countsData : []);
        }
    }, [countsData, countsCallType]);

    // Handle plafond
    useEffect(() => {
        if (plafondData && plafondCallType === 'plafond') {
            setPlafondAlert(plafondData);
        }
    }, [plafondData, plafondCallType]);

    // Handle comptes list
    useEffect(() => {
        if (comptesData && comptesCallType === 'loadComptes') {
            setComptes(Array.isArray(comptesData) ? comptesData : []);
        }
    }, [comptesData, comptesCallType]);

    // Handle internal accounts list
    useEffect(() => {
        if (internalAccountsData && internalAccountsCallType === 'loadInternalAccounts') {
            setInternalAccounts(Array.isArray(internalAccountsData) ? internalAccountsData.filter((a: any) => a.actif) : []);
        }
    }, [internalAccountsData, internalAccountsCallType]);

    // Handle users list
    useEffect(() => {
        if (usersData && usersCallType === 'loadUsers') {
            const allUsers = Array.isArray(usersData) ? usersData : [];
            // Show all users so any can be assigned as caisse agent
            // Role is displayed as a Tag in the dropdown so the user can visually identify caissiers/chefs
            setAgents(allUsers);
        }
    }, [usersData, usersCallType]);

    // Handle branches list
    useEffect(() => {
        if (branchesData && branchesCallType === 'loadBranches') {
            setBranches(Array.isArray(branchesData) ? branchesData : []);
        }
    }, [branchesData, branchesCallType]);

    // Handle credit/debit response
    useEffect(() => {
        if (creditDebitData && (creditDebitCallType === 'credit' || creditDebitCallType === 'debit')) {
            const result = creditDebitData as any;
            let opLabel = creditDebitCallType === 'debit' ? 'Versement' : 'Approvisionnement';
            if (result.isInitialProvisioning) opLabel = 'Dotation initiale';
            toast.current?.show({
                severity: 'success',
                summary: `${opLabel} effectue`,
                detail: `Montant: ${formatNumber(result.montant || operationMontant)} FBu — Nouveau solde caisse: ${formatNumber(result.nouveauSolde)} FBu`,
                life: 5000
            });
            loadCaisses();
            loadInternalAccounts();
            // Show billetage dialog
            if (operationCaisse) {
                const updatedCaisse = { ...operationCaisse, soldeActuel: result.nouveauSolde };
                setBilletageCaisse(updatedCaisse);
                setBilletageOperationType(opLabel);
                setBilletageCount(new CptCashCount());
                setBilletageVisible(true);
            }
            setOperationMontant(0);
            setOperationContrepartie('');
            setOperationLibelle('');
            setOperationCaisse(null);
        }
        if (creditDebitError && (creditDebitCallType === 'credit' || creditDebitCallType === 'debit')) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: creditDebitError.message || 'Erreur lors de l\'operation', life: 5000 });
        }
    }, [creditDebitData, creditDebitError, creditDebitCallType]);

    // Handle billetage response
    useEffect(() => {
        if (billetageData && billetageCallType === 'saveBilletage') {
            const result = billetageData as any;
            const ecart = result.ecart || 0;
            toast.current?.show({
                severity: Math.abs(ecart) > 0.01 ? 'warn' : 'success',
                summary: 'Billetage enregistre',
                detail: Math.abs(ecart) > 0.01
                    ? `Total physique: ${formatNumber(result.totalPhysique)} FBu — Ecart: ${formatNumber(ecart)} FBu`
                    : `Total physique: ${formatNumber(result.totalPhysique)} FBu — Pas d'ecart`,
                life: 5000
            });
            setBilletageVisible(false);
            setBilletageCaisse(null);
            setBilletageCount(new CptCashCount());
        }
        if (billetageError && billetageCallType === 'saveBilletage') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: billetageError.message || 'Erreur lors du billetage', life: 5000 });
        }
    }, [billetageData, billetageError, billetageCallType]);

    // billetageDetail useEffect removed — loadAllBilletageDetails handles results directly

    // Handle virement response
    useEffect(() => {
        if (virementData && virementCallType === 'virement') {
            const result = virementData as any;
            toast.current?.show({
                severity: 'success',
                summary: 'Virement effectue',
                detail: `${formatNumber(result.montant)} FBu transferes de ${result.codeCaisseSource || virementSource?.codeCaisse} vers ${result.codeCaisseDest || virementDest?.codeCaisse}`,
                life: 5000
            });
            // Billetage already sent with the transfer — no post-transfer dialog needed
            loadCaisses();
            loadAllCaisses();
            // Refresh transfer history and pending receipts if viewing
            if (transferHistoryCaisse) loadTransferHistory(transferHistoryCaisse.caisseId);
            if (pendingReceiptsCaisse) loadPendingReceipts(pendingReceiptsCaisse.caisseId);
            setVirementMontant(0);
            setVirementLibelle('');
            setVirementBilletage(new CptCashCount());
            setVirementSource(null);
            setVirementDest(null);
        }
        if (virementError && virementCallType === 'virement') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: virementError.message || 'Erreur lors du virement', life: 5000 });
        }
    }, [virementData, virementError, virementCallType]);

    // Handle transfer history response
    useEffect(() => {
        if (transferHistoryData && transferHistoryCallType === 'transfer-history') {
            setTransferHistory(Array.isArray(transferHistoryData) ? transferHistoryData : []);
        }
    }, [transferHistoryData, transferHistoryCallType]);

    const loadTransferHistory = (caisseId: string) => {
        fetchTransferHistory(null, 'GET', `${BASE_URL}/transfers/${caisseId}`, 'transfer-history');
    };

    // Handle pending receipts response
    useEffect(() => {
        if (pendingData && pendingCallType === 'pending-receipts') {
            setPendingReceipts(Array.isArray(pendingData) ? pendingData : []);
        }
    }, [pendingData, pendingCallType]);

    // Handle acknowledge receipt response
    useEffect(() => {
        if (ackData && ackCallType === 'acknowledge') {
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: 'Reception confirmee avec succes. Le virement est maintenant termine.', life: 5000 });
            if (pendingReceiptsCaisse) loadPendingReceipts(pendingReceiptsCaisse.caisseId);
            if (transferHistoryCaisse) loadTransferHistory(transferHistoryCaisse.caisseId);
            loadCaisses();
            loadAllCaisses();
        }
        if (ackError && ackCallType === 'acknowledge') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: ackError.message || 'Erreur confirmation de reception', life: 5000 });
        }
    }, [ackData, ackError, ackCallType]);

    const loadPendingReceipts = (caisseId: string) => {
        fetchPending(null, 'GET', `${BASE_URL}/pending-receipts/${caisseId}`, 'pending-receipts');
    };

    const handleAcknowledgeReceipt = (virement: VirementInterne) => {
        setAckVirement(virement);
        setAckDialogVisible(true);
    };

    const handleConfirmAcknowledge = () => {
        if (ackVirement) {
            fetchAck({ userAction: getUserAction() }, 'POST', `${BASE_URL}/acknowledge-receipt/${ackVirement.virementId}`, 'acknowledge');
            setAckDialogVisible(false);
            setAckVirement(null);
        }
    };

    const loadCaisses = () => {
        const { filter, branchId } = shouldFilterByBranch();
        const url = filter ? `${BASE_URL}/findbybranch/${branchId}` : `${BASE_URL}/findall`;
        fetchCaisses(null, 'GET', url, 'getall');
    };

    // Always load ALL caisses (no branch filter) for the Caisse Parente dropdown
    const loadAllCaisses = () => {
        fetchAllCaisses(null, 'GET', `${BASE_URL}/findall`, 'getallcaisses');
    };

    const loadMouvements = (caisseId: string) => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        fetchMouvements(null, 'GET', `${BASE_URL}/movements/${caisseId}?date=${dateStr}`, `mouvements-${caisseId}`);
    };

    const toggleJournal = (caisseId: string) => {
        const wasExpanded = expandedJournals[caisseId];
        setExpandedJournals(prev => ({ ...prev, [caisseId]: !wasExpanded }));
        if (!wasExpanded && !mouvements[caisseId]) {
            loadMouvements(caisseId);
        }
    };

    const loadDailySummaries = () => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        fetchSummaries(null, 'GET', `${BASE_URL}/all-daily-summaries?date=${dateStr}`, 'all-summaries');
    };

    const loadCounts = (caisseId: string) => {
        fetchCounts(null, 'GET', `${BASE_URL}/counts/${caisseId}`, 'counts');
    };

    const checkPlafond = (caisseId: string) => {
        fetchPlafond(null, 'GET', `${BASE_URL}/plafond-check/${caisseId}`, 'plafond');
    };

    const loadComptes = () => {
        fetchComptes(null, 'GET', `${ECRITURES_URL}/findListCompte`, 'loadComptes');
    };

    const loadInternalAccounts = () => {
        fetchInternalAccounts(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findall`, 'loadInternalAccounts');
    };

    const loadUsers = () => {
        fetchUsers(null, 'GET', USERS_URL, 'loadUsers');
    };

    const loadBranches = () => {
        fetchBranches(null, 'GET', `${REF_URL}/branches/findactive`, 'loadBranches');
    };

    // Helper: find the selected internal account object
    const getSelectedInternalAccount = () => {
        return internalAccounts.find((a: any) => a.codeCompte === operationContrepartie) || null;
    };

    // Credit/Debit handlers
    const handleCredit = () => {
        if (!operationCaisse || !operationMontant || !operationContrepartie) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez selectionner une caisse, saisir le montant et le compte de contrepartie', life: 3000 });
            return;
        }
        // Check internal account balance before crediting caisse (money leaves the internal account)
        const ia = getSelectedInternalAccount();
        if (ia) {
            const iaSolde = ia.soldeActuel ?? 0;
            if (operationMontant > iaSolde) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Solde insuffisant sur le compte interne',
                    detail: `Le solde du compte interne "${ia.codeCompte} - ${ia.libelle}" est de ${formatNumber(iaSolde)} FBu. Le montant demande (${formatNumber(operationMontant)} FBu) depasse le solde disponible.`,
                    life: 5000
                });
                return;
            }
        }
        const isClosed = operationCaisse.status !== 'OPEN';
        const creditLabel = isClosed ? 'Dotation initiale (Virement comptable)' : 'Approvisionnement';
        const soldeCaisse = operationCaisse.soldeActuel ?? 0;
        const iaSolde = ia ? (ia.soldeActuel ?? 0) : null;
        confirmDialog({
            message: `${creditLabel} de la caisse "${operationCaisse.codeCaisse}" de ${formatNumber(operationMontant)} FBu.\n\n` +
                `--- Caisse ---\nSolde actuel: ${formatNumber(soldeCaisse)} FBu\nSolde apres: ${formatNumber(soldeCaisse + operationMontant)} FBu\n\n` +
                (ia ? `--- Compte Interne (${ia.codeCompte}) ---\nSolde actuel: ${formatNumber(iaSolde)} FBu\nSolde apres: ${formatNumber((iaSolde ?? 0) - operationMontant)} FBu\n\n` : `Compte contrepartie: ${operationContrepartie}\n\n`) +
                (isClosed ? 'Note: La caisse est fermee. Ce virement servira de dotation initiale.\n\n' : '') +
                'Confirmer ?',
            header: `Confirmation - ${creditLabel}`,
            icon: 'pi pi-arrow-down',
            acceptLabel: 'Oui, Crediter',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-success',
            accept: () => {
                const params = new URLSearchParams();
                params.append('montant', operationMontant.toString());
                params.append('compteContrepartie', operationContrepartie);
                if (operationLibelle) params.append('libelle', operationLibelle);
                if (currentExercice?.exerciceId) params.append('exerciceId', currentExercice.exerciceId);
                params.append('userAction', getUserAction());
                fetchCreditDebit(null, 'POST', `${BASE_URL}/credit/${operationCaisse.caisseId}?${params.toString()}`, 'credit');
            }
        });
    };

    const handleDebit = () => {
        if (!operationCaisse || !operationMontant || !operationContrepartie) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez selectionner une caisse, saisir le montant et le compte de contrepartie', life: 3000 });
            return;
        }
        const solde = operationCaisse.soldeActuel ?? 0;
        if (operationMontant > solde) {
            toast.current?.show({ severity: 'error', summary: 'Solde insuffisant', detail: `Le solde actuel de la caisse "${operationCaisse.codeCaisse}" est de ${formatNumber(solde)} FBu. Le montant demande (${formatNumber(operationMontant)} FBu) depasse le solde disponible.`, life: 5000 });
            return;
        }
        const ia = getSelectedInternalAccount();
        const iaSolde = ia ? (ia.soldeActuel ?? 0) : null;
        confirmDialog({
            message: `Versement depuis la caisse "${operationCaisse.codeCaisse}" de ${formatNumber(operationMontant)} FBu.\n\n` +
                `--- Caisse ---\nSolde actuel: ${formatNumber(solde)} FBu\nSolde apres: ${formatNumber(solde - operationMontant)} FBu\n\n` +
                (ia ? `--- Compte Interne (${ia.codeCompte}) ---\nSolde actuel: ${formatNumber(iaSolde)} FBu\nSolde apres: ${formatNumber((iaSolde ?? 0) + operationMontant)} FBu\n\n` : `Compte contrepartie: ${operationContrepartie}\n\n`) +
                'Confirmer ?',
            header: 'Confirmation - Versement',
            icon: 'pi pi-arrow-up',
            acceptLabel: 'Oui, Debiter',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-warning',
            accept: () => {
                const params = new URLSearchParams();
                params.append('montant', operationMontant.toString());
                params.append('compteContrepartie', operationContrepartie);
                if (operationLibelle) params.append('libelle', operationLibelle);
                if (currentExercice?.exerciceId) params.append('exerciceId', currentExercice.exerciceId);
                params.append('userAction', getUserAction());
                fetchCreditDebit(null, 'POST', `${BASE_URL}/debit/${operationCaisse.caisseId}?${params.toString()}`, 'debit');
            }
        });
    };

    // Check billetage exists for a caisse (returns promise)
    const checkBilletageExists = async (caisseId: string): Promise<boolean> => {
        try {
            const token = Cookies.get('token');
            const res = await fetch(`${BASE_URL}/billetage/latest/${caisseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 204 || !res.ok) return false;
            const data = await res.json();
            return data && data.totalPhysique != null;
        } catch {
            return false;
        }
    };

    // Virement billetage helpers
    const calculateVirementBilletageTotal = (): number => {
        return DENOMINATIONS.reduce((sum, d) => sum + ((virementBilletage as any)[d.field] || 0) * d.value, 0);
    };

    const handleVirementBilletageChange = (field: string, value: number) => {
        setVirementBilletage(prev => ({ ...prev, [field]: value } as CptCashCount));
    };

    // Virement Inter-Caisse handler
    const handleVirement = async () => {
        if (!virementSource || !virementDest || !virementMontant) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez selectionner la caisse source, la caisse destination et saisir le montant.', life: 3000 });
            return;
        }
        if (virementSource.caisseId === virementDest.caisseId) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'La caisse source et destination doivent etre differentes.', life: 3000 });
            return;
        }
        const soldeSource = virementSource.soldeActuel ?? 0;
        if (virementMontant > soldeSource) {
            toast.current?.show({ severity: 'error', summary: 'Solde insuffisant', detail: `Le solde de la caisse "${virementSource.codeCaisse}" est de ${formatNumber(soldeSource)} FBu. Le montant demande (${formatNumber(virementMontant)} FBu) depasse le solde disponible.`, life: 5000 });
            return;
        }

        // Validate billetage total matches montant
        const billetageTotal = calculateVirementBilletageTotal();
        if (billetageTotal <= 0) {
            toast.current?.show({ severity: 'error', summary: 'Billetage requis', detail: 'Veuillez saisir le billetage (billets a transferer).', life: 5000 });
            return;
        }
        if (Math.abs(billetageTotal - virementMontant) > 0.01) {
            toast.current?.show({ severity: 'error', summary: 'Billetage incorrect', detail: `Le total du billetage (${formatNumber(billetageTotal)} FBu) ne correspond pas au montant du virement (${formatNumber(virementMontant)} FBu).`, life: 5000 });
            return;
        }

        confirmDialog({
            message: `Virement de ${formatNumber(virementMontant)} FBu\n\nDe: ${virementSource.codeCaisse} — ${virementSource.libelle}\nSolde actuel: ${formatNumber(soldeSource)} FBu\nSolde apres: ${formatNumber(soldeSource - virementMontant)} FBu\n\nVers: ${virementDest.codeCaisse} — ${virementDest.libelle}\nSolde actuel: ${formatNumber(virementDest.soldeActuel ?? 0)} FBu\nSolde apres: ${formatNumber((virementDest.soldeActuel ?? 0) + virementMontant)} FBu\n\nBilletage: ${formatNumber(billetageTotal)} FBu\n\nConfirmer ?`,
            header: 'Confirmation - Virement Inter-Caisse',
            icon: 'pi pi-send',
            acceptLabel: 'Confirmer le virement',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-info',
            accept: () => {
                const params = new URLSearchParams();
                params.append('caisseSourceId', virementSource.caisseId!.toString());
                params.append('caisseDestId', virementDest.caisseId!.toString());
                params.append('montant', virementMontant.toString());
                if (virementLibelle) params.append('libelle', virementLibelle);
                if (currentExercice?.exerciceId) params.append('exerciceId', currentExercice.exerciceId);
                // Send billetage in request body
                const body = { ...virementBilletage, userAction: getUserAction() };
                fetchVirement(body, 'POST', `${BASE_URL}/transfer?${params.toString()}`, 'virement');
            }
        });
    };

    // Billetage handlers
    const calculateBilletageTotal = (): number => {
        return DENOMINATIONS.reduce((sum, d) => sum + ((billetageCount as any)[d.field] || 0) * d.value, 0);
    };

    const handleBilletageDenominationChange = (field: string, value: number) => {
        setBilletageCount(prev => ({ ...prev, [field]: value || 0 }));
    };

    const handleSaveBilletage = () => {
        if (!billetageCaisse) return;
        const dataToSend = { ...billetageCount, userAction: getUserAction() };
        fetchBilletage(dataToSend, 'POST', `${BASE_URL}/billetage/${billetageCaisse.caisseId}`, 'saveBilletage');
    };

    const handleSkipBilletage = () => {
        setBilletageVisible(false);
        setBilletageCaisse(null);
        setBilletageCount(new CptCashCount());
    };

    // Load latest billetage for all active caisses
    const loadAllBilletageDetails = async () => {
        const activeCaisses = caisses.filter(c => c.actif);
        if (activeCaisses.length === 0) return;
        setBilletageDetailsLoading(true);
        try {
            const token = Cookies.get('token');
            const results: { [caisseId: string]: CptCashCount | null } = {};
            await Promise.all(activeCaisses.map(async (c) => {
                try {
                    const res = await fetch(`${BASE_URL}/billetage/latest/${c.caisseId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok && res.status !== 204) {
                        const text = await res.text();
                        if (text && text.trim()) {
                            results[String(c.caisseId)] = JSON.parse(text) as CptCashCount;
                        } else {
                            results[String(c.caisseId)] = null;
                        }
                    } else {
                        results[String(c.caisseId)] = null;
                    }
                } catch {
                    results[String(c.caisseId)] = null;
                }
            }));
            setBilletageDetails(results);
        } catch (e) {
            console.error('Error loading billetage details:', e);
        } finally {
            setBilletageDetailsLoading(false);
        }
    };

    // Calculate total from denominations
    const calculateTotal = (count: CptCashCount): number => {
        return DENOMINATIONS.reduce((sum, d) => {
            return sum + ((count as any)[d.field] || 0) * d.value;
        }, 0);
    };

    // Auto-generate next caisse number from existing caisses
    const getNextCaisseNumber = (): number => {
        const allExisting = [...caisses, ...allCaisses];
        let maxNum = 0;
        allExisting.forEach(c => {
            if (c.codeCaisse) {
                const match = c.codeCaisse.match(/(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            }
        });
        return maxNum + 1;
    };

    // Build code & libelle from type + branch
    const typeLabels: Record<string, string> = { SIEGE: 'Siege', AGENCE: 'Agence', CHEF_AGENCE: 'Chef-Agence', GUICHET: 'Guichet' };

    const buildCaisseCode = (typeCaisse: string, branchId: string | null, num: number): string => {
        const typePrefix = typeLabels[typeCaisse] || typeCaisse || 'Caisse';
        const branch = branches.find((b: any) => String(b.id) === String(branchId));
        const branchCode = branch ? branch.code : '';
        return branchCode
            ? `${typePrefix.toUpperCase()}-${branchCode}-${String(num).padStart(3, '0')}`
            : `CAISSE-${String(num).padStart(3, '0')}`;
    };

    const buildCaisseLibelle = (typeCaisse: string, branchId: string | null): string => {
        const typeLabel = typeLabels[typeCaisse] || typeCaisse || 'Caisse';
        const branch = branches.find((b: any) => String(b.id) === String(branchId));
        const branchName = branch ? branch.name : '';
        return branchName ? `Caisse ${typeLabel} - ${branchName}` : `Caisse ${typeLabel}`;
    };

    const findParentCaisse = (typeCaisse: string, branchId: string | null): string => {
        if (!branchId) return '';
        const branchCaisses = [...caisses, ...allCaisses].filter(c => String(c.branchId) === String(branchId) && c.actif);
        if (typeCaisse === 'GUICHET') {
            // Parent = CHEF_AGENCE or AGENCE in same branch
            const parent = branchCaisses.find(c => c.typeCaisse === 'CHEF_AGENCE') || branchCaisses.find(c => c.typeCaisse === 'AGENCE');
            return parent ? parent.caisseId : '';
        }
        if (typeCaisse === 'CHEF_AGENCE' || typeCaisse === 'AGENCE') {
            // Parent = SIEGE
            const parent = [...caisses, ...allCaisses].find(c => c.typeCaisse === 'SIEGE' && c.actif);
            return parent ? parent.caisseId : '';
        }
        return '';
    };

    // Track the auto-generated number for this new caisse
    const [newCaisseNum, setNewCaisseNum] = useState<number>(1);

    // When type or branch changes on new caisse, regenerate code + libelle + parent
    const handleCaisseFieldChange = (field: string, value: any) => {
        setCaisse(prev => {
            const updated = { ...prev, [field]: value };
            if (!isEdit && (field === 'typeCaisse' || field === 'branchId')) {
                const type = field === 'typeCaisse' ? value : updated.typeCaisse;
                const branch = field === 'branchId' ? value : updated.branchId;
                updated.codeCaisse = buildCaisseCode(type, branch, newCaisseNum);
                updated.libelle = buildCaisseLibelle(type, branch);
                updated.parentCaisseId = findParentCaisse(type, branch);
            }
            return updated;
        });
    };

    // CRUD handlers
    const openNew = () => {
        const newCaisse = new CptCaisse();
        const num = getNextCaisseNumber();
        setNewCaisseNum(num);
        // Auto-fill branch from connected user
        const { filter, branchId: userBranchId } = shouldFilterByBranch();
        if (userBranchId) {
            newCaisse.branchId = String(userBranchId);
        }
        const defaultType = newCaisse.typeCaisse || 'GUICHET';
        newCaisse.codeCaisse = buildCaisseCode(defaultType, newCaisse.branchId || null, num);
        newCaisse.libelle = buildCaisseLibelle(defaultType, newCaisse.branchId || null);
        newCaisse.parentCaisseId = findParentCaisse(defaultType, newCaisse.branchId || null);
        setCaisse(newCaisse);
        setIsEdit(false);
        setDialogVisible(true);
        loadAllCaisses();
    };

    const openEdit = (rowData: CptCaisse) => {
        setCaisse({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
        // Always refresh the parent caisse list when dialog opens
        loadAllCaisses();
    };

    const handleSave = () => {
        if (!caisse.codeCaisse || !caisse.libelle) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir Code et Libelle', life: 3000 });
            return;
        }
        const dataToSend = { ...caisse, userAction: getUserAction() };
        if (isEdit && caisse.caisseId) {
            fetchCrud(dataToSend, 'PUT', `${BASE_URL}/update/${caisse.caisseId}`, 'update');
        } else {
            fetchCrud(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    // Open/Close handlers
    const handleSelectCaisse = (c: CptCaisse) => {
        setSelectedCaisse(c);
        setCashCount(new CptCashCount());
        loadCounts(c.caisseId);
        checkPlafond(c.caisseId);
    };

    const handleDenominationChange = (field: string, value: number | null) => {
        setCashCount(prev => ({ ...prev, [field]: value || 0 }));
    };

    const handleOpen = () => {
        if (!selectedCaisse) return;
        const dataToSend = { ...cashCount, userAction: getUserAction() };
        fetchOperation(dataToSend, 'POST', `${BASE_URL}/open/${selectedCaisse.caisseId}`, 'open');
    };

    const handleClose = () => {
        if (!selectedCaisse) return;
        confirmDialog({
            message: `Voulez-vous fermer la caisse "${selectedCaisse.codeCaisse}" ?\n\nLe comptage physique sera compare au solde theorique.`,
            header: 'Confirmation de fermeture',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, Fermer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-warning',
            accept: () => {
                const dataToSend = { ...cashCount, userAction: getUserAction() };
                fetchOperation(dataToSend, 'POST', `${BASE_URL}/close/${selectedCaisse.caisseId}`, 'close');
            }
        });
    };

    const currentTotal = calculateTotal(cashCount);

    // Tab 1: Caisse management templates
    const statusBodyTemplate = (rowData: CptCaisse) => (
        <Tag
            value={rowData.status === 'OPEN' ? 'Ouverte' : 'Fermee'}
            severity={rowData.status === 'OPEN' ? 'success' : 'danger'}
            icon={rowData.status === 'OPEN' ? 'pi pi-lock-open' : 'pi pi-lock'}
        />
    );

    const actifBodyTemplate = (rowData: CptCaisse) => (
        <Tag value={rowData.actif ? 'Actif' : 'Inactif'} severity={rowData.actif ? 'success' : 'danger'} />
    );

    const actionBodyTemplate = (rowData: CptCaisse) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2 className="mb-4">
                <i className="pi pi-wallet mr-2"></i>
                Gestion de Caisse
            </h2>

            {/* Plafond Alert */}
            {plafondAlert && plafondAlert.alert && (
                <div className="mb-4 p-3 border-round border-1"
                     style={{ borderLeft: `4px solid ${plafondAlert.alertSeverity === 'CRITICAL' ? '#EF5350' : '#FFA726'}`, backgroundColor: plafondAlert.alertSeverity === 'CRITICAL' ? '#FFEBEE' : '#FFF3E0' }}>
                    <div className="flex align-items-center gap-3">
                        <i className={`pi pi-exclamation-triangle ${plafondAlert.alertSeverity === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'}`} style={{ fontSize: '1.5rem' }}></i>
                        <span className={plafondAlert.alertSeverity === 'CRITICAL' ? 'text-red-700 font-semibold' : 'text-orange-700 font-semibold'}>
                            {plafondAlert.alertMessage}
                        </span>
                    </div>
                </div>
            )}

            <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                {/* Tab 1: Caisse CRUD */}
                <TabPanel header="Gestion des Caisses" leftIcon="pi pi-list mr-2">
                    <Toolbar className="mb-4" left={() => (
                        <Button label="Nouvelle Caisse" icon="pi pi-plus" severity="success" onClick={openNew} />
                    )} />

                    <DataTable
                        value={caisses}
                        loading={caissesLoading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        globalFilter={globalFilter}
                        header={
                            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                <h4 className="m-0">Liste des Caisses</h4>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
                                </span>
                            </div>
                        }
                        emptyMessage="Aucune caisse trouvee"
                        stripedRows
                        className="p-datatable-sm"
                    >
                        <Column field="codeCaisse" header="Code" sortable style={{ width: '10%' }} />
                        <Column field="libelle" header="Libelle" sortable style={{ width: '20%' }} />
                        <Column field="agentName" header="Agent" sortable style={{ width: '12%' }} />
                        <Column
                            field="branchId"
                            header="Agence"
                            body={(r: CptCaisse) => {
                                const branch = branches.find((b: any) => b.id == r.branchId);
                                return branch ? `${branch.code} - ${branch.name}` : '-';
                            }}
                            sortable
                            style={{ width: '12%' }}
                        />
                        <Column
                            field="soldeActuel"
                            header="Solde Actuel"
                            body={(r: CptCaisse) => formatNumber(r.soldeActuel) + ' FBu'}
                            style={{ width: '15%', textAlign: 'right' }}
                        />
                        <Column
                            field="plafond"
                            header="Plafond"
                            body={(r: CptCaisse) => formatNumber(r.plafond) + ' FBu'}
                            style={{ width: '12%', textAlign: 'right' }}
                        />
                        <Column field="compteComptable" header="Compte" sortable style={{ width: '8%' }} />
                        <Column field="typeCaisse" header="Type" sortable style={{ width: '8%' }}
                            body={(r: CptCaisse) => {
                                const labels: Record<string, string> = { SIEGE: 'Siege', AGENCE: 'Agence', CHEF_AGENCE: "Chef d'agence", GUICHET: 'Guichet' };
                                return labels[r.typeCaisse] || r.typeCaisse;
                            }}
                        />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable style={{ width: '8%' }} />
                        <Column field="actif" header="Actif" body={actifBodyTemplate} style={{ width: '6%' }} />
                        <Column field="userAction" header="Saisie par" sortable style={{ width: '10%' }} body={(r: CptCaisse) => r.userAction ? <span className="text-sm text-600">{r.userAction}</span> : <span className="text-300">-</span>} />
                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '8%' }} />
                    </DataTable>
                </TabPanel>

                {/* Tab 2: Open/Close */}
                <TabPanel header="Ouverture / Fermeture" leftIcon="pi pi-lock-open mr-2">
                    <div className="grid">
                        {/* Caisse selection */}
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label className="font-semibold">Selectionner une caisse</label>
                                <Dropdown
                                    value={selectedCaisse}
                                    options={caisses.filter(c => c.actif)}
                                    onChange={(e) => handleSelectCaisse(e.value)}
                                    optionLabel="codeCaisse"
                                    placeholder="Choisir une caisse"
                                    className="w-full"
                                    itemTemplate={(option: CptCaisse) => (
                                        <div className="flex justify-content-between align-items-center">
                                            <span>{option.codeCaisse} - {option.libelle}</span>
                                            <Tag value={option.status === 'OPEN' ? 'Ouverte' : 'Fermee'} severity={option.status === 'OPEN' ? 'success' : 'danger'} />
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        {selectedCaisse && (() => {
                            const isParentCaisse = ['AGENCE', 'CHEF_AGENCE', 'SIEGE'].includes(selectedCaisse.typeCaisse);
                            const summary = dailySummaries[String(selectedCaisse.caisseId)];
                            const isOpening = selectedCaisse.status !== 'OPEN';
                            // Use effectiveBalance from server-side computation (all-time virements for parent, soldeActuel for guichet)
                            const theorique = summary?.effectiveBalance ?? selectedCaisse.soldeActuel ?? 0;
                            const ecart = currentTotal - theorique;
                            const hasEnteredCount = currentTotal > 0;
                            // For OPENING: écart must be EXACTLY zero (physical count must match virement exactly)
                            // For CLOSING: allow small tolerance (0.1%) — end-of-day reality
                            const ecartTolerance = isOpening ? 0 : theorique * 0.001;
                            const ecartOk = Math.abs(ecart) <= ecartTolerance;
                            const ecartSignificant = !ecartOk && hasEnteredCount;
                            // Caisse not provisioned = theorique is 0 and caisse is closed (info only, does NOT block opening)
                            const notProvisioned = theorique === 0 && isOpening;
                            // Open button: allow when écart = 0 (including both 0), OR when count entered and écart matches
                            const canOpen = isOpening
                                ? (ecartOk && (hasEnteredCount || theorique === 0))
                                : false;
                            // Close button is blocked only when no count entered
                            const canClose = hasEnteredCount;

                            return (
                            <>
                                {/* Info: caisse has zero balance */}
                                {notProvisioned && (
                                    <div className="col-12">
                                        <div className="p-3 border-round mb-2" style={{ background: '#FFF8E1', borderLeft: '4px solid #FFA000' }}>
                                            <div className="flex align-items-center gap-2 mb-1">
                                                <i className="pi pi-info-circle" style={{ color: '#F57F17' }}></i>
                                                <span className="font-bold" style={{ color: '#F57F17' }}>Caisse avec solde a zero</span>
                                            </div>
                                            <div className="text-sm" style={{ color: '#795548' }}>
                                                Cette caisse a un solde de 0 FBu. Vous pouvez l'ouvrir directement avec un comptage a 0,
                                                ou d'abord la provisionner via l'onglet <strong>Operations</strong>.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Workflow reminder for opening with balance */}
                                {!notProvisioned && isOpening && (
                                    <div className="col-12">
                                        <div className="p-3 border-round mb-2" style={{ background: '#E8F5E9', borderLeft: '4px solid #2E7D32' }}>
                                            <div className="flex align-items-center gap-2 mb-1">
                                                <i className="pi pi-check-circle text-green-700"></i>
                                                <span className="font-bold text-green-800">Caisse provisionnee — Etape 2 : Comptage physique</span>
                                            </div>
                                            <div className="text-sm text-green-700">
                                                Montant vire (theorique) : <strong>{formatNumber(theorique)} FBu</strong>.
                                                Comptez maintenant les especes physiquement remises au caissier coupure par coupure.
                                                L'ecart doit etre <strong>zero</strong> pour ouvrir la caisse.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Context banner for parent caisses during closing */}
                                {isParentCaisse && !isOpening && (
                                    <div className="col-12">
                                        <div className="p-3 border-round mb-2" style={{ background: '#E3F2FD', borderLeft: '4px solid #1976D2' }}>
                                            <div className="flex align-items-center gap-2 mb-1">
                                                <i className="pi pi-info-circle text-blue-700"></i>
                                                <span className="font-bold text-blue-800">
                                                    {selectedCaisse.typeCaisse === 'SIEGE' ? 'Caisse Siege (Coffre Principal)' : 'Caisse Agence (Coffre)'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-blue-700">
                                                Fermeture : Comptez les especes restantes dans le coffre apres toutes les operations de la journee.
                                                Un ecart sera signale mais n'empechera pas la fermeture (notes obligatoires si ecart).
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Caisse info */}
                                <div className="col-12">
                                    <div className="surface-100 p-3 border-round mb-3">
                                        <div className="flex gap-4 flex-wrap align-items-center">
                                            <div>
                                                <span className="text-500">Caisse: </span>
                                                <span className="font-bold">{selectedCaisse.codeCaisse} - {selectedCaisse.libelle}</span>
                                            </div>
                                            <div>
                                                <span className="text-500">Statut: </span>
                                                <Tag value={selectedCaisse.status === 'OPEN' ? 'Ouverte' : 'Fermee'} severity={selectedCaisse.status === 'OPEN' ? 'success' : 'danger'} />
                                            </div>
                                            <div>
                                                <span className="text-500">Solde theorique (virement): </span>
                                                <span className={`font-bold ${notProvisioned ? 'text-red-600' : 'text-blue-700'}`}>{formatNumber(theorique)} FBu</span>
                                                {summary?.isParentType && <span className="text-xs text-400 ml-1">(solde calcule)</span>}
                                            </div>
                                            {selectedCaisse.plafond > 0 && (
                                                <div>
                                                    <span className="text-500">Plafond: </span>
                                                    <span className="font-bold">{formatNumber(selectedCaisse.plafond)} FBu</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-500">Compte: </span>
                                                <Tag value={selectedCaisse.compteComptable || '571'} severity="info" icon="pi pi-book" />
                                            </div>
                                            <div>
                                                <Tag value={selectedCaisse.typeCaisse} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Denomination grid */}
                                <div className="col-12 md:col-8">
                                    <h5 className="mb-1">
                                        <i className={`pi ${isOpening ? 'pi-sign-in' : 'pi-sign-out'} mr-2`}></i>
                                        Comptage physique — {isOpening ? 'Ouverture' : 'Fermeture'}
                                    </h5>
                                    <p className="text-sm text-500 mb-3">
                                        <i className="pi pi-info-circle mr-1"></i>
                                        {isOpening
                                            ? 'Comptez les especes physiquement remises au caissier. Le total doit etre egal au montant vire (ecart = 0).'
                                            : 'Comptez les especes restantes dans la caisse en fin de journee. Un ecart sera signale.'}
                                    </p>
                                    <div className="grid">
                                        {DENOMINATIONS.map(d => (
                                            <div key={d.field} className="col-12 md:col-6 lg:col-4">
                                                <div className="field">
                                                    <label className="text-sm">{d.label}</label>
                                                    <div className="p-inputgroup">
                                                        <InputNumber
                                                            value={(cashCount as any)[d.field] || 0}
                                                            onValueChange={(e) => handleDenominationChange(d.field, e.value??null)}
                                                            min={0}
                                                            className="w-full"
                                                        />
                                                        <span className="p-inputgroup-addon text-sm" style={{ minWidth: '90px' }}>
                                                            = {formatNumber(((cashCount as any)[d.field] || 0) * d.value)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary and action */}
                                <div className="col-12 md:col-4">
                                    <h5 className="mb-3">Resume du comptage</h5>
                                    <div className="surface-card shadow-1 p-3 border-round mb-3">
                                        <div className="mb-3">
                                            <div className="text-500 text-sm mb-1">
                                                <i className="pi pi-calculator mr-1"></i>
                                                Total Physique (compte)
                                            </div>
                                            <div className={`font-bold text-2xl ${hasEnteredCount ? 'text-blue-600' : 'text-400'}`}>
                                                {formatNumber(currentTotal)} FBu
                                            </div>
                                            {!hasEnteredCount && !notProvisioned && (
                                                <div className="text-xs text-orange-500 mt-1">
                                                    <i className="pi pi-exclamation-triangle mr-1"></i>
                                                    Saisissez les coupures pour calculer
                                                </div>
                                            )}
                                        </div>
                                        <div className="mb-3">
                                            <div className="text-500 text-sm mb-1">
                                                <i className="pi pi-send mr-1"></i>
                                                Total Theorique (virement)
                                                {summary?.isParentType && <span className="ml-1 text-xs text-400">— calcule</span>}
                                            </div>
                                            <div className={`font-bold text-2xl ${notProvisioned ? 'text-red-400' : 'text-800'}`}>
                                                {formatNumber(theorique)} FBu
                                            </div>
                                            {notProvisioned && (
                                                <div className="text-xs text-red-500 mt-1">
                                                    <i className="pi pi-times-circle mr-1"></i>
                                                    Aucun virement effectue
                                                </div>
                                            )}
                                        </div>
                                        <hr />
                                        <div className="mt-2">
                                            <div className="text-500 text-sm mb-1">
                                                Ecart (Physique − Theorique)
                                                {isOpening && <span className="text-xs ml-1" style={{ color: '#1565C0' }}>— doit etre 0 pour ouvrir</span>}
                                            </div>
                                            {!hasEnteredCount && theorique > 0 ? (
                                                <div className="text-400 font-bold text-lg">— (non comptee)</div>
                                            ) : (
                                                <div className={`font-bold text-xl ${ecartOk ? 'text-green-600' : 'text-red-600'}`}>
                                                    {ecart >= 0 ? '+' : ''}{formatNumber(ecart)} FBu
                                                    {ecartOk
                                                        ? <i className="pi pi-check-circle ml-2 text-green-500"></i>
                                                        : <i className="pi pi-times-circle ml-2 text-red-500"></i>
                                                    }
                                                </div>
                                            )}
                                        </div>

                                        {/* Opening: strict — must be 0 */}
                                        {isOpening && hasEnteredCount && ecartSignificant && (
                                            <div className="mt-2 p-2 border-round text-xs" style={{ background: '#FFEBEE', color: '#C62828', borderLeft: '3px solid #C62828' }}>
                                                <i className="pi pi-times-circle mr-1"></i>
                                                <strong>Ecart non autorise a l'ouverture.</strong> Le comptage physique ({formatNumber(currentTotal)} FBu)
                                                doit correspondre exactement au montant vire ({formatNumber(theorique)} FBu).
                                                Verifiez les coupures saisies ou le virement initial.
                                            </div>
                                        )}
                                        {/* Opening: success — écart = 0 */}
                                        {isOpening && ecartOk && (hasEnteredCount || theorique === 0) && (
                                            <div className="mt-2 p-2 border-round text-xs" style={{ background: '#E8F5E9', color: '#1B5E20', borderLeft: '3px solid #2E7D32' }}>
                                                <i className="pi pi-check-circle mr-1"></i>
                                                <strong>Parfait ! Ecart = 0.</strong> Le comptage physique correspond exactement au montant vire.
                                                Vous pouvez ouvrir la caisse.
                                            </div>
                                        )}
                                        {/* Closing: écart warning (not blocking) */}
                                        {!isOpening && ecartSignificant && (
                                            <div className="mt-2 p-2 border-round text-xs" style={{ background: '#FFF3E0', color: '#E65100', borderLeft: '3px solid #F57C00' }}>
                                                <i className="pi pi-exclamation-triangle mr-1"></i>
                                                Ecart detecte : <strong>{formatNumber(ecart)} FBu</strong>.
                                                La fermeture est possible mais les notes sont obligatoires.
                                            </div>
                                        )}
                                    </div>

                                    <div className="field">
                                        <label className="font-semibold">Notes / Observations</label>
                                        <InputTextarea
                                            value={cashCount.notes || ''}
                                            onChange={(e) => setCashCount(prev => ({ ...prev, notes: e.target.value }))}
                                            rows={3}
                                            className="w-full"
                                            placeholder={
                                                ecartSignificant && !isOpening ? 'Expliquez l\'ecart constate (obligatoire)...'
                                                : 'Remarques eventuelles...'
                                            }
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        {isOpening && (
                                            <Button
                                                label="Ouvrir la Caisse"
                                                icon={canOpen ? 'pi pi-lock-open' : 'pi pi-exclamation-triangle'}
                                                severity={canOpen ? 'success' : 'secondary'}
                                                className="w-full"
                                                onClick={handleOpen}
                                                loading={operationLoading && operationCallType === 'open'}
                                                disabled={!canOpen}
                                                tooltip={
                                                    !hasEnteredCount && theorique > 0 ? 'Saisissez le comptage physique avant d\'ouvrir'
                                                    : ecartSignificant ? `Ecart de ${formatNumber(ecart)} FBu — le comptage doit etre egal au virement`
                                                    : ''
                                                }
                                                tooltipOptions={{ position: 'top' }}
                                            />
                                        )}
                                        {!isOpening && (
                                            <Button
                                                label="Fermer la Caisse"
                                                icon="pi pi-lock"
                                                severity={ecartSignificant ? 'danger' : 'warning'}
                                                className="w-full"
                                                onClick={handleClose}
                                                loading={operationLoading && operationCallType === 'close'}
                                                disabled={!canClose}
                                                tooltip={!canClose ? 'Saisissez le comptage physique avant de fermer' : ecartSignificant ? 'Ecart detecte — ajoutez des notes explicatives' : ''}
                                                tooltipOptions={{ position: 'top' }}
                                            />
                                        )}
                                    </div>
                                    {!hasEnteredCount && theorique > 0 && (
                                        <div className="text-center text-xs text-400 mt-2">
                                            <i className="pi pi-arrow-left mr-1"></i>
                                            Entrez les coupures pour activer
                                        </div>
                                    )}
                                </div>
                            </>
                            );
                        })()}
                    </div>
                </TabPanel>

                {/* Tab 3: Operations Credit/Debit */}
                <TabPanel header="Operations" leftIcon="pi pi-arrow-right-arrow-left mr-2">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="surface-card shadow-1 p-4 border-round">
                                <h5 className="mb-3"><i className="pi pi-arrow-right-arrow-left mr-2"></i>Credit / Debit de Caisse</h5>

                                <div className="field">
                                    <label className="font-semibold">Selectionner une caisse *</label>
                                    <Dropdown
                                        value={operationCaisse}
                                        options={caisses.filter(c => c.actif)}
                                        onChange={(e) => setOperationCaisse(e.value)}
                                        optionLabel="codeCaisse"
                                        placeholder="Choisir une caisse"
                                        className="w-full"
                                        filter
                                        filterBy="codeCaisse,libelle,typeCaisse"
                                        itemTemplate={(option: CptCaisse) => (
                                            <div className="flex justify-content-between align-items-center w-full gap-2">
                                                <div>
                                                    <span className="font-semibold">{option.codeCaisse}</span>
                                                    <span className="text-500 text-sm ml-2">— {option.libelle}</span>
                                                </div>
                                                <div className="flex align-items-center gap-2">
                                                    <span className="text-xs text-400">{option.compteComptable}</span>
                                                    <Tag
                                                        value={option.status === 'OPEN' ? 'Ouverte' : 'Fermee'}
                                                        severity={option.status === 'OPEN' ? 'success' : 'warning'}
                                                        style={{ fontSize: '0.7rem' }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>

                                {operationCaisse && (
                                    <div className="p-3 border-round mb-3" style={{
                                        background: operationCaisse.status !== 'OPEN' ? '#FFF8E1' : '#F1F8E9',
                                        borderLeft: `4px solid ${operationCaisse.status !== 'OPEN' ? '#FFA000' : '#388E3C'}`
                                    }}>
                                        <div className="flex align-items-center gap-3 flex-wrap">
                                            <div>
                                                <span className="text-500 text-sm">Statut: </span>
                                                <Tag value={operationCaisse.status === 'OPEN' ? 'Ouverte' : 'Fermee'} severity={operationCaisse.status === 'OPEN' ? 'success' : 'warning'} />
                                            </div>
                                            <div>
                                                <span className="text-500 text-sm">Solde actuel: </span>
                                                <span className="font-bold text-blue-600">{formatNumber(operationCaisse.soldeActuel)} FBu</span>
                                            </div>
                                            <div>
                                                <span className="text-500 text-sm">Compte: </span>
                                                <Tag value={operationCaisse.compteComptable || '571'} severity="info" icon="pi pi-book" />
                                            </div>
                                        </div>
                                        {operationCaisse.status !== 'OPEN' && (
                                            <div className="text-xs mt-2" style={{ color: '#E65100' }}>
                                                <i className="pi pi-info-circle mr-1"></i>
                                                Cette caisse est fermee. Un Credit ici servira de provisionnement initial avant l'ouverture.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="field">
                                    <label className="font-semibold">Montant (FBu) *</label>
                                    <InputNumber
                                        value={operationMontant || null}
                                        onValueChange={(e) => setOperationMontant(e.value || 0)}
                                        mode="decimal"
                                        locale="fr-FR"
                                        min={0}
                                        className="w-full"
                                        placeholder="Saisir le montant"
                                    />
                                </div>

                                <div className="field">
                                    <label className="font-semibold">Compte Interne de Contrepartie *</label>
                                    <Dropdown
                                        value={operationContrepartie}
                                        options={internalAccounts}
                                        onChange={(e) => setOperationContrepartie(e.value)}
                                        optionValue="codeCompte"
                                        optionLabel="codeCompte"
                                        placeholder="Selectionner le compte interne"
                                        className="w-full"
                                        filter
                                        filterBy="codeCompte,libelle,accountNumber"
                                        itemTemplate={(option: any) => (
                                            <div className="flex justify-content-between align-items-center w-full gap-2">
                                                <div>
                                                    <span className="font-semibold">{option.codeCompte}</span>
                                                    <span className="text-500 text-sm ml-2">— {option.libelle}</span>
                                                </div>
                                                <span className="text-xs text-blue-600 font-semibold">{formatNumber(option.soldeActuel)} FBu</span>
                                            </div>
                                        )}
                                        valueTemplate={(option: any) => {
                                            if (!option && operationContrepartie) {
                                                const found = internalAccounts.find((a: any) => a.codeCompte === operationContrepartie);
                                                return found ? <span>{found.codeCompte} - {found.libelle}</span> : <span>{operationContrepartie}</span>;
                                            }
                                            return option ? <span>{option.codeCompte} - {option.libelle}</span> : <span className="text-400">Selectionner le compte interne</span>;
                                        }}
                                    />
                                    {operationContrepartie && (() => {
                                        const ia = internalAccounts.find((a: any) => a.codeCompte === operationContrepartie);
                                        if (!ia) return null;
                                        const iaSolde = ia.soldeActuel ?? 0;
                                        const insuffisant = operationMontant > 0 && operationMontant > iaSolde;
                                        return (
                                            <div className={`mt-2 p-2 border-round text-sm ${insuffisant ? 'bg-red-50 border-left-3 border-red-500' : 'surface-100'}`}>
                                                <div className="flex justify-content-between align-items-center">
                                                    <span className="text-600">Solde compte interne:</span>
                                                    <span className={`font-bold ${insuffisant ? 'text-red-600' : 'text-blue-600'}`}>{formatNumber(iaSolde)} FBu</span>
                                                </div>
                                                {operationMontant > 0 && (
                                                    <div className="flex justify-content-between align-items-center mt-1">
                                                        <span className="text-600">Solde apres credit caisse:</span>
                                                        <span className={`font-bold ${insuffisant ? 'text-red-600' : 'text-green-600'}`}>{formatNumber(iaSolde - operationMontant)} FBu</span>
                                                    </div>
                                                )}
                                                {insuffisant && (
                                                    <div className="text-red-600 text-xs mt-1">
                                                        <i className="pi pi-exclamation-triangle mr-1"></i>
                                                        Solde insuffisant pour cette operation
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="field">
                                    <label className="font-semibold">Libelle / Description</label>
                                    <InputTextarea
                                        value={operationLibelle}
                                        onChange={(e) => setOperationLibelle(e.target.value)}
                                        rows={2}
                                        className="w-full"
                                        placeholder="Ex: Approvisionnement caisse depuis banque"
                                    />
                                </div>

                                <div className="flex gap-2 mt-3">
                                    <Button
                                        label="Crediter (Entree)"
                                        icon="pi pi-arrow-down"
                                        severity="success"
                                        className="flex-1"
                                        onClick={handleCredit}
                                        loading={creditDebitLoading && creditDebitCallType === 'credit'}
                                        tooltip="Argent entrant dans la caisse (ex: approvisionnement depuis la banque)"
                                    />
                                    <Button
                                        label="Debiter (Sortie)"
                                        icon="pi pi-arrow-up"
                                        severity="warning"
                                        className="flex-1"
                                        onClick={handleDebit}
                                        loading={creditDebitLoading && creditDebitCallType === 'debit'}
                                        tooltip="Argent sortant de la caisse (ex: versement en banque)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="surface-card shadow-1 p-4 border-round">
                                <h5 className="mb-3"><i className="pi pi-info-circle mr-2"></i>Guide des Operations</h5>

                                <div className="mb-3 p-3 border-round" style={{ backgroundColor: '#E8F5E9', borderLeft: '4px solid #4CAF50' }}>
                                    <div className="font-bold text-green-700 mb-1"><i className="pi pi-arrow-down mr-1"></i>Credit (Approvisionnement)</div>
                                    <p className="text-sm text-green-800 m-0">
                                        Argent entrant dans la caisse. Ex: Approvisionnement depuis la banque, transfert depuis un compte interne.
                                    </p>
                                    <p className="text-xs text-500 mt-1 m-0">
                                        Ecriture: Debit compte caisse / Credit compte interne de contrepartie
                                    </p>
                                </div>

                                <div className="mb-3 p-3 border-round" style={{ backgroundColor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
                                    <div className="font-bold text-orange-700 mb-1"><i className="pi pi-arrow-up mr-1"></i>Debit (Versement)</div>
                                    <p className="text-sm text-orange-800 m-0">
                                        Argent sortant de la caisse. Ex: Versement vers un compte interne, remise de fonds.
                                    </p>
                                    <p className="text-xs text-500 mt-1 m-0">
                                        Ecriture: Debit compte interne de contrepartie / Credit compte caisse
                                    </p>
                                </div>

                                {currentExercice && (
                                    <div className="p-3 surface-100 border-round">
                                        <span className="text-500 text-sm">Exercice en cours: </span>
                                        <span className="font-bold">{currentExercice.codeExercice || currentExercice.description || currentExercice.exerciceId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Virement Inter-Caisse section */}
                    <div className="grid mt-3">
                        <div className="col-12 md:col-8">
                            <div className="surface-card shadow-1 p-4 border-round" style={{ borderTop: '3px solid #1565C0' }}>
                                <h5 className="mb-3"><i className="pi pi-send mr-2 text-blue-600"></i>Virement Inter-Caisse</h5>
                                <p className="text-sm text-500 mb-3">Transfert de fonds entre deux caisses (ex: Caisse Principale vers Caisse Agence)</p>

                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <div className="field">
                                            <label className="font-semibold">Caisse Source *</label>
                                            <Dropdown
                                                value={virementSource}
                                                options={caisses.filter(c => c.actif)}
                                                onChange={(e) => {
                                                    setVirementSource(e.value);
                                                    if (virementDest && e.value && e.value.caisseId === virementDest.caisseId) setVirementDest(null);
                                                }}
                                                optionLabel="codeCaisse"
                                                placeholder="Selectionner la caisse source"
                                                className="w-full"
                                                filter
                                                filterBy="codeCaisse,libelle,typeCaisse"
                                                itemTemplate={(option: CptCaisse) => (
                                                    <div className="flex justify-content-between align-items-center w-full gap-2">
                                                        <div>
                                                            <span className="font-semibold">{option.codeCaisse}</span>
                                                            <span className="text-500 text-sm ml-2">— {option.libelle}</span>
                                                        </div>
                                                        <div className="flex align-items-center gap-1">
                                                            <span className="text-xs text-blue-600 font-semibold">{formatNumber(option.soldeActuel)} FBu</span>
                                                            <Tag
                                                                value={option.status === 'OPEN' ? 'Ouverte' : 'Fermee'}
                                                                severity={option.status === 'OPEN' ? 'success' : 'warning'}
                                                                style={{ fontSize: '0.7rem' }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        {virementSource && (
                                            <div className="p-2 border-round mb-2" style={{ background: '#E3F2FD', borderLeft: '3px solid #1565C0' }}>
                                                <div className="flex align-items-center gap-2 flex-wrap">
                                                    <Tag value={virementSource.status === 'OPEN' ? 'Ouverte' : 'Fermee'} severity={virementSource.status === 'OPEN' ? 'success' : 'warning'} />
                                                    <span className="text-sm">Solde: <strong className="text-blue-700">{formatNumber(virementSource.soldeActuel)} FBu</strong></span>
                                                    <span className="text-xs text-500">{virementSource.typeCaisse}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-12 md:col-6">
                                        <div className="field">
                                            <label className="font-semibold">Caisse Destination *</label>
                                            <Dropdown
                                                value={virementDest}
                                                options={caisses.filter(c => c.actif && (!virementSource || c.caisseId !== virementSource.caisseId))}
                                                onChange={(e) => setVirementDest(e.value)}
                                                optionLabel="codeCaisse"
                                                placeholder="Selectionner la caisse destination"
                                                className="w-full"
                                                filter
                                                filterBy="codeCaisse,libelle,typeCaisse"
                                                itemTemplate={(option: CptCaisse) => (
                                                    <div className="flex justify-content-between align-items-center w-full gap-2">
                                                        <div>
                                                            <span className="font-semibold">{option.codeCaisse}</span>
                                                            <span className="text-500 text-sm ml-2">— {option.libelle}</span>
                                                        </div>
                                                        <div className="flex align-items-center gap-1">
                                                            <span className="text-xs text-blue-600 font-semibold">{formatNumber(option.soldeActuel)} FBu</span>
                                                            <Tag
                                                                value={option.status === 'OPEN' ? 'Ouverte' : 'Fermee'}
                                                                severity={option.status === 'OPEN' ? 'success' : 'warning'}
                                                                style={{ fontSize: '0.7rem' }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        {virementDest && (
                                            <div className="p-2 border-round mb-2" style={{ background: '#E8F5E9', borderLeft: '3px solid #388E3C' }}>
                                                <div className="flex align-items-center gap-2 flex-wrap">
                                                    <Tag value={virementDest.status === 'OPEN' ? 'Ouverte' : 'Fermee'} severity={virementDest.status === 'OPEN' ? 'success' : 'warning'} />
                                                    <span className="text-sm">Solde: <strong className="text-green-700">{formatNumber(virementDest.soldeActuel)} FBu</strong></span>
                                                    <span className="text-xs text-500">{virementDest.typeCaisse}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <div className="field">
                                            <label className="font-semibold">Montant (FBu) *</label>
                                            <InputNumber
                                                value={virementMontant || null}
                                                onValueChange={(e) => setVirementMontant(e.value || 0)}
                                                mode="decimal"
                                                locale="fr-FR"
                                                min={0}
                                                className="w-full"
                                                placeholder="Saisir le montant"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <div className="field">
                                            <label className="font-semibold">Libelle</label>
                                            <InputText
                                                value={virementLibelle}
                                                onChange={(e) => setVirementLibelle(e.target.value)}
                                                className="w-full"
                                                placeholder="Ex: Approvisionnement agence Bujumbura"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {virementSource && virementDest && virementMontant > 0 && (
                                    <div className="p-3 border-round mb-3" style={{
                                        background: virementMontant > (virementSource.soldeActuel ?? 0) ? '#FFEBEE' : '#F3E5F5',
                                        borderLeft: `3px solid ${virementMontant > (virementSource.soldeActuel ?? 0) ? '#C62828' : '#7B1FA2'}`
                                    }}>
                                        <div className="text-sm">
                                            <div className="flex justify-content-between mb-1">
                                                <span>{virementSource.codeCaisse}: {formatNumber(virementSource.soldeActuel)} → <strong>{formatNumber((virementSource.soldeActuel ?? 0) - virementMontant)} FBu</strong></span>
                                                <Tag value={`- ${formatNumber(virementMontant)}`} severity="warning" />
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span>{virementDest.codeCaisse}: {formatNumber(virementDest.soldeActuel)} → <strong>{formatNumber((virementDest.soldeActuel ?? 0) + virementMontant)} FBu</strong></span>
                                                <Tag value={`+ ${formatNumber(virementMontant)}`} severity="success" />
                                            </div>
                                            {virementMontant > (virementSource.soldeActuel ?? 0) && (
                                                <div className="text-red-600 font-bold mt-2">
                                                    <i className="pi pi-exclamation-triangle mr-1"></i>
                                                    Solde insuffisant sur la caisse source !
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Billetage inline for virement */}
                                {virementSource && virementDest && virementMontant > 0 && (
                                    <div className="mt-3 p-3 border-round" style={{ border: '1px solid var(--blue-200)', background: 'var(--blue-50)' }}>
                                        <div className="flex align-items-center justify-content-between mb-2">
                                            <h6 className="m-0"><i className="pi pi-money-bill mr-2 text-blue-600"></i>Billetage — Billets a transferer</h6>
                                            <span className={`font-bold ${Math.abs(calculateVirementBilletageTotal() - virementMontant) < 0.01 && calculateVirementBilletageTotal() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatNumber(calculateVirementBilletageTotal())} / {formatNumber(virementMontant)} FBu
                                            </span>
                                        </div>
                                        <DataTable value={DENOMINATIONS} size="small" showGridlines
                                            footer={
                                                <div className="flex justify-content-between align-items-center">
                                                    <span className="font-bold">TOTAL</span>
                                                    <span className={`font-bold ${Math.abs(calculateVirementBilletageTotal() - virementMontant) < 0.01 && calculateVirementBilletageTotal() > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                                        {formatNumber(calculateVirementBilletageTotal())} FBu
                                                        {calculateVirementBilletageTotal() > 0 && Math.abs(calculateVirementBilletageTotal() - virementMontant) > 0.01 && (
                                                            <span className="text-red-600 ml-2">(ecart: {formatNumber(calculateVirementBilletageTotal() - virementMontant)} FBu)</span>
                                                        )}
                                                    </span>
                                                </div>
                                            }
                                        >
                                            <Column header="Denomination" body={(d: any) => (
                                                <span className="font-medium">{formatNumber(d.value)} FBu</span>
                                            )} style={{ width: '120px' }} />
                                            <Column header="Quantite" body={(d: any) => (
                                                <InputNumber
                                                    value={(virementBilletage as any)[d.field] || 0}
                                                    onValueChange={(e) => handleVirementBilletageChange(d.field, e.value || 0)}
                                                    min={0}
                                                    showButtons
                                                    buttonLayout="horizontal"
                                                    incrementButtonIcon="pi pi-plus"
                                                    decrementButtonIcon="pi pi-minus"
                                                    inputStyle={{ textAlign: 'center', fontWeight: 600, width: '60px' }}
                                                />
                                            )} style={{ width: '180px' }} />
                                            <Column header="Sous-total" body={(d: any) => (
                                                <span className="font-bold text-primary">{formatNumber(((virementBilletage as any)[d.field] || 0) * d.value)} FBu</span>
                                            )} style={{ textAlign: 'right' }} />
                                        </DataTable>
                                    </div>
                                )}

                                <Button
                                    label="Effectuer le Virement"
                                    icon="pi pi-send"
                                    className="w-full mt-3"
                                    severity="info"
                                    onClick={handleVirement}
                                    loading={virementLoading}
                                    disabled={!virementSource || !virementDest || virementMontant <= 0 || Math.abs(calculateVirementBilletageTotal() - virementMontant) > 0.01}
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="surface-card shadow-1 p-4 border-round">
                                <h5 className="mb-3"><i className="pi pi-info-circle mr-2"></i>Guide Virement</h5>

                                <div className="mb-3 p-3 border-round" style={{ backgroundColor: '#E3F2FD', borderLeft: '4px solid #1565C0' }}>
                                    <div className="font-bold text-blue-700 mb-1"><i className="pi pi-send mr-1"></i>Virement Inter-Caisse</div>
                                    <p className="text-sm text-blue-800 m-0">
                                        Transfert entre deux caisses. Le solde source diminue et le solde destination augmente.
                                    </p>
                                    <p className="text-xs text-500 mt-1 m-0">
                                        Les deux caisses doivent etre ouvertes. Le solde source doit etre suffisant.
                                    </p>
                                </div>

                                <div className="text-sm text-600">
                                    <p className="mb-2"><strong>Cas d'utilisation :</strong></p>
                                    <ul className="pl-3 m-0" style={{ lineHeight: '1.8' }}>
                                        <li>Caisse Principale → Caisse Agence</li>
                                        <li>Caisse Agence → Guichet</li>
                                        <li>Guichet → Caisse Agence (remise)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending receipts - AGENCE, CHEF_AGENCE, GUICHET must confirm */}
                    <div className="mt-4">
                        <div className="surface-card shadow-1 p-4 border-round">
                            <div className="flex align-items-center justify-content-between mb-3">
                                <div className="flex align-items-center gap-3">
                                    <h5 className="m-0"><i className="pi pi-bell mr-2 text-orange-500"></i>Receptions en attente de confirmation</h5>
                                    <Dropdown
                                        value={pendingReceiptsCaisse}
                                        options={caisses.filter(c => c.typeCaisse !== 'SIEGE')}
                                        onChange={(e) => {
                                            setPendingReceiptsCaisse(e.value);
                                            if (e.value) loadPendingReceipts(e.value.caisseId);
                                        }}
                                        optionLabel="codeCaisse"
                                        placeholder="Selectionner la caisse destination"
                                        className="w-18rem"
                                        itemTemplate={(option: CptCaisse) => (
                                            <span>{option.codeCaisse} - {option.libelle} <span className="text-xs text-500">({option.typeCaisse})</span></span>
                                        )}
                                    />
                                </div>
                                {pendingReceiptsCaisse && pendingReceipts.length > 0 && (
                                    <Tag value={`${pendingReceipts.length} en attente`} severity="warning" />
                                )}
                            </div>

                            {pendingReceiptsCaisse && pendingReceipts.length > 0 ? (
                                <DataTable value={pendingReceipts} size="small" showGridlines>
                                    <Column field="reference" header="Reference" />
                                    <Column header="Source" body={(row: VirementInterne) => row.codeCaisseSource || `Caisse #${row.caisseSourceId}`} />
                                    <Column header="Montant" body={(row: VirementInterne) => (
                                        <span className="font-bold text-green-600">{formatNumber(row.montant)} FBu</span>
                                    )} style={{ textAlign: 'right' }} />
                                    <Column header="Date" body={(row: VirementInterne) => formatDateTime(row.executedAt)} />
                                    <Column field="libelle" header="Libelle" />
                                    <Column header="Envoye par" body={(row: VirementInterne) => (
                                        <span className="text-sm">{row.executedBy || row.userAction || '-'}</span>
                                    )} />
                                    <Column header="Action" body={(row: VirementInterne) => (
                                        <Button
                                            label="Confirmer la reception"
                                            icon="pi pi-check"
                                            severity="success"
                                            size="small"
                                            onClick={() => handleAcknowledgeReceipt(row)}
                                            loading={ackLoading}
                                        />
                                    )} />
                                </DataTable>
                            ) : pendingReceiptsCaisse ? (
                                <div className="text-center p-4 text-500">
                                    <i className="pi pi-check-circle text-green-500 text-3xl mb-2" style={{ display: 'block' }} />
                                    <p className="m-0">Aucun virement en attente de confirmation pour {pendingReceiptsCaisse.codeCaisse}</p>
                                </div>
                            ) : (
                                <div className="text-center p-4 text-500">
                                    <i className="pi pi-info-circle text-2xl mb-2" style={{ display: 'block' }} />
                                    <p className="m-0">Selectionnez une caisse (Agence, Chef d'Agence ou Guichet) pour voir les virements en attente</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabPanel>

                {/* Tab 4: Monitoring */}
                <TabPanel header="Monitoring" leftIcon="pi pi-chart-line mr-2">
                    {/* Monitoring toolbar */}
                    <div className="flex align-items-center justify-content-between mb-3 p-2 surface-100 border-round">
                        <div className="flex align-items-center gap-3">
                            <Button
                                icon="pi pi-refresh"
                                label="Actualiser"
                                severity="info"
                                size="small"
                                onClick={() => { loadCaisses(); loadDailySummaries(); setLastRefresh(new Date()); setCountdown(30); }}
                                loading={caissesLoading}
                            />
                            <div className="flex align-items-center gap-2">
                                <InputSwitch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.value ?? false)} />
                                <span className="text-sm text-600">Auto-refresh</span>
                                {autoRefresh && (
                                    <Tag value={`${countdown}s`} severity="info" icon="pi pi-clock" />
                                )}
                            </div>
                        </div>
                        {lastRefresh && (
                            <span className="text-xs text-400">
                                <i className="pi pi-clock mr-1"></i>
                                Derniere MàJ: {lastRefresh.toLocaleTimeString('fr-FR')}
                            </span>
                        )}
                    </div>

                    {/* Branch monitoring cards */}
                    {(() => {
                        // Group caisses by branchId
                        const branchMap = new Map<string, CptCaisse[]>();
                        const noBranch: CptCaisse[] = [];
                        caisses.forEach(c => {
                            if (c.branchId) {
                                const key = String(c.branchId);
                                if (!branchMap.has(key)) branchMap.set(key, []);
                                branchMap.get(key)!.push(c);
                            } else {
                                noBranch.push(c);
                            }
                        });

                        const OP_TYPE_LABELS: Record<string, { label: string; color: string }> = {
                            DOTATION:       { label: 'Dotation initiale',    color: '#7B1FA2' },
                            CREDIT:         { label: 'Credit (Approv.)',     color: '#1B5E20' },
                            DEBIT:          { label: 'Debit (Versement)',     color: '#B71C1C' },
                            VIREMENT_RECU:  { label: 'Virement recu',        color: '#0D47A1' },
                            VIREMENT_EMIS:  { label: 'Virement emis',        color: '#E65100' },
                            DEPOT_CLIENT:   { label: 'Depot client',         color: '#2E7D32' },
                            RETRAIT_CLIENT: { label: 'Retrait client',       color: '#C62828' },
                            REMBOURSEMENT:  { label: 'Remboursement credit', color: '#1565C0' },
                            DECAISSEMENT:   { label: 'Decaissement credit',  color: '#E65100' },
                            OUVERTURE:      { label: 'Ouverture',            color: '#388E3C' },
                            FERMETURE:      { label: 'Fermeture',            color: '#616161' },
                        };

                        const renderCaisseRow = (c: CptCaisse, isChild = false) => {
                            const isOpen = c.status === 'OPEN';
                            const summary = dailySummaries[String(c.caisseId)];
                            // Real balance from movement log (computed server-side)
                            const realBalance = summary?.realBalance ?? summary?.effectiveBalance ?? c.soldeActuel ?? 0;
                            // For parent caisses: coffre = realBalance - children balances
                            const isParentCaisse = c.typeCaisse === 'AGENCE' || c.typeCaisse === 'CHEF_AGENCE' || c.typeCaisse === 'SIEGE';
                            const coffreBalance = isParentCaisse && summary?.coffreBalance !== undefined ? summary.coffreBalance : realBalance;
                            const childrenTotal = isParentCaisse ? (summary?.childrenTotalBalance ?? 0) : 0;
                            const displayBalance = isParentCaisse ? coffreBalance : realBalance;
                            const pctPlafond = c.plafond > 0 ? Math.min(100, Math.round((displayBalance / c.plafond) * 100)) : 0;
                            const pctColor = pctPlafond >= 90 ? '#EF5350' : pctPlafond >= 70 ? '#FFA726' : '#66BB6A';
                            // Today's entrees/sorties from movement log
                            const todayEntrees = summary?.todayEntrees ?? 0;
                            const todaySorties = summary?.todaySorties ?? 0;
                            const caisseIdStr = String(c.caisseId);
                            const isJournalOpen = expandedJournals[caisseIdStr] ?? false;
                            const journalRows = mouvements[caisseIdStr] ?? [];

                            return (
                                <div
                                    key={c.caisseId}
                                    className={`border-round mb-1 ${isChild ? 'ml-4' : ''}`}
                                    style={{ background: isChild ? '#F8F9FA' : '#EEF2FF', borderLeft: `4px solid ${isOpen ? '#4CAF50' : '#EF5350'}` }}
                                >
                                    {/* Main row */}
                                    <div className="flex align-items-center justify-content-between p-2">
                                        <div className="flex align-items-center gap-2 flex-1">
                                            <i className={`pi ${isChild ? 'pi-desktop' : 'pi-wallet'} text-${isOpen ? 'green' : 'red'}-500`}></i>
                                            <div>
                                                <span className="font-semibold text-sm">{c.codeCaisse}</span>
                                                <span className="text-400 text-xs ml-2">{c.libelle}</span>
                                                {c.agentName && <span className="text-500 text-xs ml-2">({c.agentName})</span>}
                                            </div>
                                        </div>
                                        <div className="flex align-items-center gap-3">
                                            {c.plafond > 0 && (
                                                <div className="flex align-items-center gap-1" style={{ minWidth: '80px' }}>
                                                    <div style={{ width: '60px', height: '6px', background: '#E0E0E0', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${pctPlafond}%`, height: '100%', background: pctColor, borderRadius: '3px' }}></div>
                                                    </div>
                                                    <span className="text-xs text-400">{pctPlafond}%</span>
                                                </div>
                                            )}
                                            <div className="text-right" style={{ minWidth: '150px' }}>
                                                <div className="font-bold text-sm" style={{ color: isOpen ? '#1565C0' : '#757575' }}>
                                                    {formatNumber(displayBalance)} FBu
                                                </div>
                                                {isParentCaisse && childrenTotal > 0 && (
                                                    <div className="text-xs text-400">
                                                        dont {formatNumber(childrenTotal)} FBu aux guichets
                                                    </div>
                                                )}
                                                {c.plafond > 0 && !isParentCaisse && (
                                                    <div className="text-xs text-400">/ {formatNumber(c.plafond)}</div>
                                                )}
                                                {summary?.hasMouvements && (
                                                    <div className="text-xs" style={{ color: '#2E7D32' }}>
                                                        <i className="pi pi-check text-xs mr-1"></i>solde reel
                                                    </div>
                                                )}
                                            </div>
                                            <Tag
                                                value={isOpen ? 'Ouverte' : 'Fermee'}
                                                severity={isOpen ? 'success' : 'danger'}
                                                icon={isOpen ? 'pi pi-lock-open' : 'pi pi-lock'}
                                                style={{ minWidth: '80px', justifyContent: 'center' }}
                                            />
                                            <Tag
                                                value={c.typeCaisse}
                                                style={{ minWidth: '90px', justifyContent: 'center', fontSize: '0.7rem', background: '#78909C', color: 'white' }}
                                            />
                                            {/* Journal toggle button */}
                                            <Button
                                                icon={isJournalOpen ? 'pi pi-chevron-up' : 'pi pi-list'}
                                                size="small"
                                                text
                                                severity="info"
                                                tooltip={isJournalOpen ? 'Fermer journal' : 'Voir journal des mouvements'}
                                                tooltipOptions={{ position: 'left' }}
                                                onClick={() => toggleJournal(caisseIdStr)}
                                                style={{ width: '2rem', height: '2rem' }}
                                            />
                                        </div>
                                    </div>
                                    {/* Daily operations summary row */}
                                    {summary && (
                                        <div className="flex align-items-center gap-4 px-3 pb-2" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '6px' }}>
                                            <div className="flex align-items-center gap-1">
                                                <i className="pi pi-arrow-down text-xs" style={{ color: '#4CAF50' }}></i>
                                                <span className="text-xs text-500">Entrees (cumul):</span>
                                                <span className="text-xs font-semibold" style={{ color: '#4CAF50' }}>
                                                    +{formatNumber(todayEntrees)} FBu
                                                </span>
                                            </div>
                                            <div className="flex align-items-center gap-1">
                                                <i className="pi pi-arrow-up text-xs" style={{ color: '#EF5350' }}></i>
                                                <span className="text-xs text-500">Sorties (cumul):</span>
                                                <span className="text-xs font-semibold" style={{ color: '#EF5350' }}>
                                                    -{formatNumber(todaySorties)} FBu
                                                </span>
                                            </div>
                                            <div className="flex align-items-center gap-1 ml-2">
                                                <i className="pi pi-calculator text-xs text-500"></i>
                                                <span className="text-xs text-500">{isParentCaisse ? 'En coffre:' : 'Solde reel:'}</span>
                                                <span className="text-xs font-bold" style={{ color: '#1565C0' }}>
                                                    {formatNumber(displayBalance)} FBu
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Journal des mouvements (expandable) */}
                                    {isJournalOpen && (
                                        <div className="px-3 pb-3" style={{ borderTop: '1px solid #E3F2FD' }}>
                                            <div className="flex align-items-center justify-content-between mb-2 pt-2">
                                                <span className="text-sm font-semibold text-blue-700">
                                                    <i className="pi pi-list mr-1"></i>Journal des mouvements — aujourd'hui
                                                </span>
                                                <Button
                                                    icon="pi pi-refresh"
                                                    size="small"
                                                    text
                                                    severity="info"
                                                    onClick={() => loadMouvements(caisseIdStr)}
                                                    tooltip="Actualiser"
                                                    style={{ width: '1.8rem', height: '1.8rem' }}
                                                />
                                            </div>
                                            {journalRows.length === 0 ? (
                                                <div className="text-xs text-400 text-center py-2">
                                                    <i className="pi pi-info-circle mr-1"></i>
                                                    Aucun mouvement enregistre aujourd'hui.
                                                    Les mouvements sont enregistres pour les operations effectuees via Credits/Debits et Virements.
                                                </div>
                                            ) : (
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                                        <thead>
                                                            <tr style={{ background: '#E3F2FD' }}>
                                                                <th style={{ padding: '4px 8px', textAlign: 'left', borderBottom: '1px solid #BBDEFB' }}>Heure</th>
                                                                <th style={{ padding: '4px 8px', textAlign: 'left', borderBottom: '1px solid #BBDEFB' }}>Type</th>
                                                                <th style={{ padding: '4px 8px', textAlign: 'left', borderBottom: '1px solid #BBDEFB' }}>Reference</th>
                                                                <th style={{ padding: '4px 8px', textAlign: 'left', borderBottom: '1px solid #BBDEFB' }}>Libelle</th>
                                                                <th style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #BBDEFB', color: '#2E7D32' }}>Entree</th>
                                                                <th style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #BBDEFB', color: '#C62828' }}>Sortie</th>
                                                                <th style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #BBDEFB', color: '#1565C0' }}>Solde</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {journalRows.map((row: any, idx: number) => {
                                                                const opMeta = OP_TYPE_LABELS[row.operationType] || { label: row.operationType, color: '#333' };
                                                                const isEntree = row.sens === 'ENTREE';
                                                                return (
                                                                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#FAFAFA' : 'white' }}>
                                                                        <td style={{ padding: '3px 8px', color: '#666' }}>{row.heure || ''}</td>
                                                                        <td style={{ padding: '3px 8px' }}>
                                                                            <span style={{
                                                                                display: 'inline-block', padding: '1px 6px',
                                                                                borderRadius: '10px', fontSize: '0.68rem', fontWeight: 600,
                                                                                background: opMeta.color + '20', color: opMeta.color,
                                                                                border: `1px solid ${opMeta.color}50`
                                                                            }}>
                                                                                {opMeta.label}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '3px 8px', color: '#555', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                                                            {row.reference || '—'}
                                                                        </td>
                                                                        <td style={{ padding: '3px 8px', color: '#444', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                            {row.libelle || ''}
                                                                        </td>
                                                                        <td style={{ padding: '3px 8px', textAlign: 'right', color: '#2E7D32', fontWeight: isEntree ? 700 : 400 }}>
                                                                            {isEntree ? `+${formatNumber(row.montant)} FBu` : '—'}
                                                                        </td>
                                                                        <td style={{ padding: '3px 8px', textAlign: 'right', color: '#C62828', fontWeight: !isEntree ? 700 : 400 }}>
                                                                            {!isEntree ? `-${formatNumber(row.montant)} FBu` : '—'}
                                                                        </td>
                                                                        <td style={{ padding: '3px 8px', textAlign: 'right', color: '#1565C0', fontWeight: 700 }}>
                                                                            {formatNumber(row.soldeApres ?? 0)} FBu
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr style={{ background: '#E8F5E9', borderTop: '2px solid #4CAF50' }}>
                                                                <td colSpan={4} style={{ padding: '4px 8px', fontWeight: 700, fontSize: '0.75rem' }}>Total</td>
                                                                <td style={{ padding: '4px 8px', textAlign: 'right', color: '#2E7D32', fontWeight: 700 }}>
                                                                    +{formatNumber(journalRows.reduce((s: number, r: any) => s + (r.sens === 'ENTREE' ? (r.montant || 0) : 0), 0))} FBu
                                                                </td>
                                                                <td style={{ padding: '4px 8px', textAlign: 'right', color: '#C62828', fontWeight: 700 }}>
                                                                    -{formatNumber(journalRows.reduce((s: number, r: any) => s + (r.sens === 'SORTIE' ? (r.montant || 0) : 0), 0))} FBu
                                                                </td>
                                                                <td style={{ padding: '4px 8px', textAlign: 'right', color: '#1565C0', fontWeight: 700 }}>
                                                                    {formatNumber(realBalance)} FBu
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        };

                        const renderBranchSection = (branchCaisses: CptCaisse[], branchLabel: string, branchCode?: string) => {
                            const isParentType = (c: CptCaisse) =>
                                c.typeCaisse === 'AGENCE' || c.typeCaisse === 'CHEF_AGENCE' || c.typeCaisse === 'SIEGE';
                            const guichetCaisses = branchCaisses.filter(c => !isParentType(c));
                            const vaultCaisses = branchCaisses.filter(c => isParentType(c));
                            const totalSoldeGuichets = guichetCaisses.reduce((sum, c) => {
                                const s = dailySummaries[String(c.caisseId)];
                                const eff = s !== undefined ? (s.effectiveBalance ?? c.soldeActuel ?? 0) : (c.soldeActuel || 0);
                                return sum + Math.max(0, eff);
                            }, 0);
                            const totalSoldeVault = vaultCaisses.reduce((sum, c) => {
                                const s = dailySummaries[String(c.caisseId)];
                                // Use coffreBalance (= realBalance, already net of all outflows) for parent caisses
                                const eff = s !== undefined ? (s.coffreBalance ?? s.effectiveBalance ?? c.soldeActuel ?? 0) : (c.soldeActuel || 0);
                                return sum + Math.max(0, eff);
                            }, 0);
                            const totalSolde = totalSoldeGuichets + totalSoldeVault;
                            const openCount = branchCaisses.filter(c => c.status === 'OPEN').length;
                            const totalCount = branchCaisses.length;

                            // Build parent → children map
                            const parentMap = new Map<string, CptCaisse[]>();
                            const roots: CptCaisse[] = [];
                            branchCaisses.forEach(c => {
                                if (c.parentCaisseId) {
                                    const key = String(c.parentCaisseId);
                                    if (!parentMap.has(key)) parentMap.set(key, []);
                                    parentMap.get(key)!.push(c);
                                } else {
                                    roots.push(c);
                                }
                            });

                            return (
                                <div className="mb-3 surface-card shadow-1 border-round overflow-hidden" key={branchLabel}>
                                    {/* Branch header */}
                                    <div className="flex align-items-center justify-content-between px-3 py-2"
                                         style={{ background: 'linear-gradient(135deg, #1565C0, #1976D2)', color: 'white' }}>
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-building"></i>
                                            <span className="font-bold">{branchCode ? `${branchCode} - ` : ''}{branchLabel}</span>
                                            <Tag value={`${openCount}/${totalCount} ouvertes`}
                                                 style={{ background: openCount === totalCount ? '#4CAF50' : openCount === 0 ? '#EF5350' : '#FFA726', color: 'white' }} />
                                        </div>
                                        <div className="text-right flex gap-3">
                                            {guichetCaisses.length > 0 && (
                                                <div>
                                                    <div className="text-xs opacity-75">Guichets</div>
                                                    <div className="font-bold text-lg">{formatNumber(totalSoldeGuichets)} FBu</div>
                                                </div>
                                            )}
                                            {vaultCaisses.length > 0 && (
                                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '12px' }}>
                                                    <div className="text-xs opacity-75">Coffre</div>
                                                    <div className="font-bold text-lg">{formatNumber(totalSoldeVault)} FBu</div>
                                                </div>
                                            )}
                                            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '12px' }}>
                                                <div className="text-xs opacity-75">Total</div>
                                                <div className="font-bold text-lg">{formatNumber(totalSolde)} FBu</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Caisses list */}
                                    <div className="p-2">
                                        {roots.length === 0 && branchCaisses.length > 0 && (
                                            branchCaisses.map(c => renderCaisseRow(c, false))
                                        )}
                                        {roots.map(parent => (
                                            <div key={parent.caisseId}>
                                                {renderCaisseRow(parent, false)}
                                                {(parentMap.get(String(parent.caisseId)) || []).map(child => (
                                                    <div key={child.caisseId}>
                                                        {renderCaisseRow(child, true)}
                                                        {(parentMap.get(String(child.caisseId)) || []).map(grandchild =>
                                                            renderCaisseRow(grandchild, true)
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        };

                        return (
                            <div>
                                {Array.from(branchMap.entries()).map(([branchId, branchCaisses]) => {
                                    const branch = branches.find((b: any) => String(b.id) === branchId);
                                    return renderBranchSection(branchCaisses, branch?.name || `Agence #${branchId}`, branch?.code);
                                })}
                                {noBranch.length > 0 && renderBranchSection(noBranch, 'Sans Agence')}
                                {caisses.length === 0 && !caissesLoading && (
                                    <div className="text-center p-5 text-400">
                                        <i className="pi pi-inbox text-4xl mb-3 block"></i>
                                        <span>Aucune caisse trouvee</span>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </TabPanel>

                {/* Tab 5: History */}
                <TabPanel header="Historique" leftIcon="pi pi-history mr-2">
                    <div className="field mb-3">
                        <label className="font-semibold">Selectionner une caisse</label>
                        <Dropdown
                            value={selectedCaisse}
                            options={caisses}
                            onChange={(e) => { setSelectedCaisse(e.value); loadCounts(e.value.caisseId); }}
                            optionLabel="codeCaisse"
                            placeholder="Choisir une caisse"
                            className="w-15rem"
                            itemTemplate={(option: CptCaisse) => <span>{option.codeCaisse} - {option.libelle}</span>}
                        />
                    </div>

                    <DataTable
                        value={counts}
                        loading={countsLoading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        emptyMessage="Aucun comptage trouve"
                        stripedRows
                        sortField="countDate"
                        sortOrder={-1}
                        className="p-datatable-sm"
                    >
                        <Column
                            field="countDate"
                            header="Date"
                            body={(r: CptCashCount) => formatDate(r.countDate)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="countType"
                            header="Type"
                            body={(r: CptCashCount) => (
                                <Tag value={r.countType === 'OPENING' ? 'Ouverture' : r.countType === 'OPERATION' ? 'Billetage' : 'Fermeture'}
                                     severity={r.countType === 'OPENING' ? 'info' : r.countType === 'OPERATION' ? 'success' : 'warning'} />
                            )}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="totalPhysique"
                            header="Total Physique"
                            body={(r: CptCashCount) => formatNumber(r.totalPhysique) + ' FBu'}
                            style={{ width: '15%', textAlign: 'right' }}
                        />
                        <Column
                            field="totalTheorique"
                            header="Total Theorique"
                            body={(r: CptCashCount) => formatNumber(r.totalTheorique) + ' FBu'}
                            style={{ width: '15%', textAlign: 'right' }}
                        />
                        <Column
                            field="ecart"
                            header="Ecart"
                            body={(r: CptCashCount) => (
                                <span className={Math.abs(r.ecart) < 0.01 ? 'text-green-600' : 'text-red-600 font-bold'}>
                                    {formatNumber(r.ecart)} FBu
                                </span>
                            )}
                            style={{ width: '12%', textAlign: 'right' }}
                        />
                        <Column field="countedBy" header="Compte par" style={{ width: '10%' }} />
                        <Column field="validatedBy" header="Valide par" style={{ width: '10%' }} />
                        <Column field="userAction" header="Saisie par" sortable style={{ width: '10%' }} body={(r: CptCashCount) => r.userAction ? <span className="text-sm text-600">{r.userAction}</span> : <span className="text-300">-</span>} />
                        <Column field="notes" header="Notes" style={{ width: '12%' }} />
                    </DataTable>
                </TabPanel>

                {/* ==================== Tab 6: Historique Transferts ==================== */}
                <TabPanel header="Historique Transferts" leftIcon="pi pi-arrow-right-arrow-left mr-2">
                    <div className="flex align-items-center justify-content-between mb-3">
                        <div className="flex align-items-center gap-3">
                            <label className="font-semibold">Selectionner une caisse</label>
                            <Dropdown
                                value={transferHistoryCaisse}
                                options={caisses}
                                onChange={(e) => {
                                    setTransferHistoryCaisse(e.value);
                                    if (e.value) loadTransferHistory(e.value.caisseId);
                                }}
                                optionLabel="codeCaisse"
                                placeholder="Choisir une caisse"
                                className="w-15rem"
                                itemTemplate={(option: CptCaisse) => <span>{option.codeCaisse} - {option.libelle}</span>}
                            />
                        </div>
                        {transferHistoryCaisse && (
                            <Button
                                icon="pi pi-refresh"
                                severity="secondary"
                                text
                                onClick={() => loadTransferHistory(transferHistoryCaisse.caisseId)}
                                tooltip="Actualiser"
                            />
                        )}
                    </div>

                    {transferHistoryCaisse && transferHistory.length > 0 && (
                        <div className="grid mb-3">
                            <div className="col-12 md:col-4">
                                <div className="p-3 bg-green-50 border-round text-center" style={{ border: '1px solid var(--green-200)' }}>
                                    <div className="text-500 mb-1">Termines</div>
                                    <div className="font-bold text-xl text-green-600">
                                        {transferHistory.filter((t: VirementInterne) => t.status === 'COMPLETED').length}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="p-3 bg-orange-50 border-round text-center" style={{ border: '1px solid var(--orange-200)' }}>
                                    <div className="text-500 mb-1">En attente de confirmation</div>
                                    <div className="font-bold text-xl text-orange-600">
                                        {transferHistory.filter((t: VirementInterne) => t.status === 'PENDING_RECEIPT').length}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="p-3 surface-100 border-round text-center" style={{ border: '1px solid var(--surface-300)' }}>
                                    <div className="text-500 mb-1">Total virements</div>
                                    <div className="font-bold text-xl text-primary">
                                        {formatNumber(transferHistory.reduce((sum: number, t: VirementInterne) => sum + (t.montant || 0), 0))} FBu
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DataTable
                        value={transferHistory}
                        loading={transferHistoryLoading}
                        paginator
                        rows={15}
                        size="small"
                        showGridlines
                        sortField="dateVirement"
                        sortOrder={-1}
                        emptyMessage={transferHistoryCaisse ? "Aucun virement trouve" : "Selectionnez une caisse pour voir l'historique"}
                        rowClassName={(data: VirementInterne) => ({
                            'bg-orange-50': data.status === 'PENDING_RECEIPT'
                        })}
                    >
                        <Column field="dateVirement" header="Date" body={(r: VirementInterne) => formatDate(r.dateVirement)} sortable style={{ width: '9%' }} />
                        <Column field="reference" header="Reference" style={{ width: '14%' }} />
                        <Column field="codeCaisseSource" header="Source" style={{ width: '10%' }} />
                        <Column field="codeCaisseDest" header="Destination" style={{ width: '10%' }} />
                        <Column field="montant" header="Montant (FBu)" body={(r: VirementInterne) => (
                            <span className="font-bold">{formatNumber(r.montant)}</span>
                        )} style={{ width: '11%', textAlign: 'right' }} sortable />
                        <Column field="libelle" header="Libelle" style={{ width: '12%' }} />
                        <Column
                            field="status"
                            header="Statut"
                            body={(r: VirementInterne) => (
                                <Tag
                                    value={r.status === 'PENDING_RECEIPT' ? 'EN ATTENTE' : r.status === 'COMPLETED' ? 'CONFIRME' : r.status}
                                    severity={r.status === 'COMPLETED' ? 'success' : r.status === 'PENDING_RECEIPT' ? 'warning' : 'info'}
                                    icon={r.status === 'PENDING_RECEIPT' ? 'pi pi-clock' : r.status === 'COMPLETED' ? 'pi pi-check-circle' : undefined}
                                />
                            )}
                            sortable
                            style={{ width: '9%' }}
                        />
                        <Column header="Envoye par" body={(r: VirementInterne) => (
                            <div>
                                <div className="text-sm">{r.executedBy || r.userAction || '-'}</div>
                                <div className="text-xs text-500">{formatDateTime(r.executedAt)}</div>
                            </div>
                        )} style={{ width: '12%' }} />
                        <Column header="Confirme par" body={(r: VirementInterne) => (
                            r.validatedBy ? (
                                <div>
                                    <div className="text-sm text-green-700 font-medium">{r.validatedBy}</div>
                                    <div className="text-xs text-500">{formatDateTime(r.validatedAt)}</div>
                                </div>
                            ) : (
                                r.status === 'PENDING_RECEIPT' ? (
                                    <span className="text-orange-600 text-sm">
                                        <i className="pi pi-clock mr-1" />En attente
                                    </span>
                                ) : (
                                    <span className="text-300">-</span>
                                )
                            )
                        )} style={{ width: '13%' }} />
                    </DataTable>
                </TabPanel>

                {/* ==================== Tab 7: Billetage Details ==================== */}
                <TabPanel header="Billetage" leftIcon="pi pi-money-bill mr-2">
                    <div className="flex align-items-center justify-content-between mb-3">
                        <p className="text-500 m-0">
                            <i className="pi pi-info-circle mr-2"></i>
                            Dernier billetage enregistre pour chaque caisse — detail des billets et pieces
                        </p>
                        <Button
                            icon="pi pi-refresh"
                            label="Actualiser"
                            severity="info"
                            size="small"
                            onClick={loadAllBilletageDetails}
                            loading={billetageDetailsLoading}
                        />
                    </div>

                    {/* Load on first visit */}
                    {Object.keys(billetageDetails).length === 0 && !billetageDetailsLoading && (
                        <div className="text-center p-5">
                            <Button
                                label="Charger les billetages"
                                icon="pi pi-download"
                                severity="info"
                                onClick={loadAllBilletageDetails}
                            />
                        </div>
                    )}

                    {/* Render by caisse level */}
                    {Object.keys(billetageDetails).length > 0 && (() => {
                        const levels = [
                            { key: 'SIEGE', label: 'Caisse Principale (Siege)', icon: 'pi pi-building', color: '#1565C0' },
                            { key: 'AGENCE', label: 'Caisses Agence', icon: 'pi pi-briefcase', color: '#2E7D32' },
                            { key: 'CHEF_AGENCE', label: 'Caisses Chef d\'Agence', icon: 'pi pi-user', color: '#7B1FA2' },
                            { key: 'GUICHET', label: 'Guichets', icon: 'pi pi-desktop', color: '#E65100' },
                        ];

                        const renderBilletageCard = (c: CptCaisse) => {
                            const detail = billetageDetails[String(c.caisseId)];
                            const hasBilletage = detail && detail.totalPhysique != null;

                            return (
                                <div key={c.caisseId} className="col-12 md:col-6 lg:col-4">
                                    <div className="surface-card border-round shadow-1 p-3 h-full">
                                        <div className="flex align-items-center justify-content-between mb-2">
                                            <div>
                                                <span className="font-bold">{c.codeCaisse}</span>
                                                <span className="text-500 text-sm ml-2">{c.libelle}</span>
                                            </div>
                                            <Tag
                                                value={c.status === 'OPEN' ? 'Ouverte' : 'Fermee'}
                                                severity={c.status === 'OPEN' ? 'success' : 'warning'}
                                                icon={c.status === 'OPEN' ? 'pi pi-lock-open' : 'pi pi-lock'}
                                            />
                                        </div>
                                        {c.agentName && (
                                            <div className="text-500 text-sm mb-2">
                                                <i className="pi pi-user mr-1"></i>{c.agentName}
                                            </div>
                                        )}
                                        <div className="flex justify-content-between mb-2 p-2 surface-100 border-round">
                                            <span className="text-500 text-sm">Solde systeme:</span>
                                            <span className="font-bold text-blue-600">{formatNumber(c.soldeActuel)} FBu</span>
                                        </div>

                                        {hasBilletage ? (
                                            <>
                                                <div className="text-xs text-400 mb-2">
                                                    <i className="pi pi-clock mr-1"></i>
                                                    {formatDateTime(detail.countDate || detail.createdAt)}
                                                    {detail.countedBy && <span> — par {detail.countedBy}</span>}
                                                </div>
                                                <DataTable value={DENOMINATIONS.filter(d => ((detail as any)[d.field] || 0) > 0)} size="small" showGridlines
                                                    footer={
                                                        <div className="flex justify-content-between">
                                                            <span className="font-bold">Total physique</span>
                                                            <span className="font-bold text-green-600">{formatNumber(detail.totalPhysique)} FBu</span>
                                                        </div>
                                                    }>
                                                    <Column header="Denomination" body={(d: any) => (
                                                        <span className="text-sm">{formatNumber(d.value)} FBu</span>
                                                    )} />
                                                    <Column header="Qte" body={(d: any) => (
                                                        <span className="font-semibold">{(detail as any)[d.field] || 0}</span>
                                                    )} style={{ textAlign: 'center', width: '60px' }} />
                                                    <Column header="Montant" body={(d: any) => (
                                                        <span className="font-bold text-primary">{formatNumber(((detail as any)[d.field] || 0) * d.value)} FBu</span>
                                                    )} style={{ textAlign: 'right' }} />
                                                </DataTable>
                                                {detail.ecart != null && Math.abs(detail.ecart) > 0.01 && (
                                                    <div className="mt-2 p-2 border-round bg-orange-50 text-orange-700 text-sm" style={{ border: '1px solid var(--orange-200)' }}>
                                                        <i className="pi pi-exclamation-triangle mr-1"></i>
                                                        Ecart: <strong>{formatNumber(detail.ecart)} FBu</strong>
                                                    </div>
                                                )}
                                                {detail.notes && (
                                                    <div className="mt-2 text-sm text-600">
                                                        <i className="pi pi-comment mr-1"></i>{detail.notes}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center p-3 text-400">
                                                <i className="pi pi-inbox text-2xl mb-2" style={{ display: 'block' }}></i>
                                                <span className="text-sm">Aucun billetage enregistre</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        };

                        return levels.map(level => {
                            const levelCaisses = caisses.filter(c => {
                                if (c.typeCaisse === level.key) return true;
                                // Group remaining types as GUICHET
                                if (level.key === 'GUICHET' && !['SIEGE', 'AGENCE', 'CHEF_AGENCE'].includes(c.typeCaisse)) return true;
                                return false;
                            }).filter(c => c.actif);

                            if (levelCaisses.length === 0) return null;

                            return (
                                <div key={level.key} className="mb-4">
                                    <h4 className="m-0 mb-3 flex align-items-center gap-2" style={{ color: level.color }}>
                                        <i className={level.icon}></i>
                                        {level.label}
                                        <Tag value={String(levelCaisses.length)} severity="info" className="ml-2" />
                                    </h4>
                                    <div className="grid">
                                        {levelCaisses.map(c => renderBilletageCard(c))}
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </TabPanel>
            </TabView>

            {/* CRUD Dialog */}
            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier la Caisse' : 'Nouvelle Caisse'}
                style={{ width: '50vw' }}
                modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setDialogVisible(false)} />
                        <Button label="Enregistrer" icon="pi pi-check" onClick={handleSave} loading={crudLoading} />
                    </div>
                }
            >
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="codeCaisse" className="font-semibold">Code Caisse *</label>
                            <InputText
                                id="codeCaisse"
                                value={caisse.codeCaisse || ''}
                                onChange={(e) => setCaisse(prev => ({ ...prev, codeCaisse: e.target.value }))}
                                className="w-full"
                                placeholder="Ex: CAISSE-01"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-8">
                        <div className="field">
                            <label htmlFor="libelle" className="font-semibold">Libelle *</label>
                            <InputText
                                id="libelle"
                                value={caisse.libelle || ''}
                                onChange={(e) => setCaisse(prev => ({ ...prev, libelle: e.target.value }))}
                                className="w-full"
                                placeholder="Description de la caisse"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="agentId" className="font-semibold">Agent</label>
                            <Dropdown
                                id="agentId"
                                value={caisse.agentId || null}
                                options={agents}
                                onChange={(e) => {
                                    const selected = agents.find((u: any) => u.id === e.value);
                                    setCaisse(prev => ({
                                        ...prev,
                                        agentId: e.value,
                                        agentName: selected ? `${selected.firstname} ${selected.lastname}` : ''
                                    }));
                                }}
                                optionValue="id"
                                optionLabel="firstname"
                                placeholder="Selectionner un agent"
                                className="w-full"
                                filter
                                showClear
                                filterBy="firstname,lastname,roleName,branchName"
                                itemTemplate={(option: any) => {
                                    const branch = branches.find((b: any) => b.id == option.branchId);
                                    const branchLabel = branch ? `${branch.code} - ${branch.name}` : (option.branchName || '');
                                    return (
                                        <div className="flex justify-content-between align-items-center w-full gap-2">
                                            <div>
                                                <span className="font-semibold">{option.lastname} {option.firstname}</span>
                                                {branchLabel && <span className="text-xs text-500 ml-2">— {branchLabel}</span>}
                                            </div>
                                            <Tag value={option.roleName} severity="info" className="text-xs" />
                                        </div>
                                    );
                                }}
                                valueTemplate={(option: any) => {
                                    const resolveUser = (u: any) => {
                                        if (!u) return null;
                                        const branch = branches.find((b: any) => b.id == u.branchId);
                                        const branchLabel = branch ? branch.name : (u.branchName || '');
                                        return branchLabel
                                            ? <span>{u.lastname} {u.firstname} <span className="text-400 text-sm">— {branchLabel}</span></span>
                                            : <span>{u.lastname} {u.firstname}</span>;
                                    };
                                    if (!option && caisse.agentId) {
                                        const found = agents.find((u: any) => u.id == caisse.agentId);
                                        return found ? resolveUser(found) : <span>{caisse.agentName || caisse.agentId}</span>;
                                    }
                                    return option ? resolveUser(option) : <span className="text-400">Selectionner un agent</span>;
                                }}
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="plafond" className="font-semibold">Plafond (FBu)</label>
                            <InputNumber
                                id="plafond"
                                value={caisse.plafond || 0}
                                onValueChange={(e) => setCaisse(prev => ({ ...prev, plafond: e.value || 0 }))}
                                mode="decimal"
                                locale="fr-FR"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="compteComptable" className="font-semibold">Compte Principal *</label>
                            <Dropdown
                                id="compteComptable"
                                value={caisse.compteComptable || '571'}
                                options={comptes.filter(c => c.typeCompte === 0 && c.codeCompte?.startsWith('5'))}
                                onChange={(e) => setCaisse(prev => ({ ...prev, compteComptable: e.value }))}
                                optionValue="codeCompte"
                                optionLabel="codeCompte"
                                placeholder="Selectionner le compte"
                                className="w-full"
                                filter
                                filterBy="codeCompte,libelle"
                                itemTemplate={(option: CptCompte) => (
                                    <span>{option.codeCompte} - {option.libelle}</span>
                                )}
                                valueTemplate={(option: CptCompte | null) => {
                                    if (!option && caisse.compteComptable) {
                                        const found = comptes.find(c => c.codeCompte === caisse.compteComptable);
                                        return found ? <span>{found.codeCompte} - {found.libelle}</span> : <span>{caisse.compteComptable}</span>;
                                    }
                                    return option ? <span>{option.codeCompte} - {option.libelle}</span> : <span className="text-400">Compte de caisse</span>;
                                }}
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="typeCaisse" className="font-semibold">Type de Caisse</label>
                            <Dropdown
                                id="typeCaisse"
                                value={caisse.typeCaisse || 'GUICHET'}
                                options={[
                                    { label: 'Siege', value: 'SIEGE' },
                                    { label: 'Agence', value: 'AGENCE' },
                                    { label: "Chef d'agence", value: 'CHEF_AGENCE' },
                                    { label: 'Guichet', value: 'GUICHET' }
                                ]}
                                onChange={(e) => handleCaisseFieldChange('typeCaisse', e.value)}
                                className="w-full"
                                placeholder="Type de caisse"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="branchId" className="font-semibold">Agence *</label>
                            <Dropdown
                                id="branchId"
                                value={caisse.branchId || null}
                                options={branches}
                                onChange={(e) => handleCaisseFieldChange('branchId', e.value)}
                                optionValue="id"
                                optionLabel="name"
                                placeholder="Selectionner une agence"
                                className="w-full"
                                filter
                                showClear
                                filterBy="code,name"
                                itemTemplate={(option: any) => (
                                    <span>{option.code} - {option.name}</span>
                                )}
                                valueTemplate={(option: any) => {
                                    if (!option && caisse.branchId) {
                                        const found = branches.find((b: any) => b.id == caisse.branchId);
                                        return found ? <span>{found.code} - {found.name}</span> : <span>{caisse.branchId}</span>;
                                    }
                                    return option ? <span>{option.code} - {option.name}</span> : <span className="text-400">Selectionner une agence</span>;
                                }}
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="parentCaisseId" className="font-semibold">Caisse Parente</label>
                            <Dropdown
                                id="parentCaisseId"
                                value={caisse.parentCaisseId || null}
                                options={(() => {
                                    // Merge allCaisses + caisses (deduplicated by caisseId), exclude self
                                    const merged = [...allCaisses];
                                    caisses.forEach(c => {
                                        if (!merged.find(m => String(m.caisseId) === String(c.caisseId))) merged.push(c);
                                    });
                                    return merged.filter(c => String(c.caisseId) !== String(caisse.caisseId));
                                })()}
                                onChange={(e) => setCaisse(prev => ({ ...prev, parentCaisseId: e.value }))}
                                optionValue="caisseId"
                                optionLabel="codeCaisse"
                                placeholder="Aucune (caisse racine)"
                                className="w-full"
                                showClear
                                filter
                                filterBy="compteComptable,codeCaisse,libelle"
                                valueTemplate={(option: CptCaisse) => option
                                    ? <span>{option.compteComptable} - {option.libelle}</span>
                                    : <span className="text-400">Aucune (caisse racine)</span>
                                }
                                itemTemplate={(option: CptCaisse) => (
                                    <div>
                                        <span className="font-bold text-blue-700">{option.compteComptable}</span>
                                        <span className="mx-1 text-400">|</span>
                                        <span className="font-semibold">{option.codeCaisse}</span>
                                        <span className="mx-1 text-400">-</span>
                                        <span className="text-600">{option.libelle}</span>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                    {!isEdit && (
                        <div className="col-12">
                            <div className="p-3 border-round" style={{ background: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
                                <div className="font-semibold text-orange-700 mb-2">
                                    <i className="pi pi-wallet mr-1"></i>
                                    Solde Initial (Dotation)
                                </div>
                                <div className="grid m-0">
                                    <div className="col-12 md:col-6">
                                        <div className="field mb-0">
                                            <label htmlFor="soldeActuel" className="text-sm font-semibold">Montant initial (FBu)</label>
                                            <InputNumber
                                                id="soldeActuel"
                                                value={caisse.soldeActuel || 0}
                                                onValueChange={(e) => setCaisse(prev => ({ ...prev, soldeActuel: e.value || 0 }))}
                                                mode="decimal"
                                                locale="fr-FR"
                                                min={0}
                                                className="w-full"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-6 flex align-items-end">
                                        <div className="text-xs text-orange-700">
                                            <i className="pi pi-info-circle mr-1"></i>
                                            Capital initial de la caisse. Peut etre ajuste via Operations (Credit/Debit) avant l'ouverture.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="actif" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="actif"
                                checked={caisse.actif}
                                onChange={(e) => setCaisse(prev => ({ ...prev, actif: e.value ?? false }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Acknowledge Receipt Dialog - read-only billetage view */}
            <Dialog
                visible={ackDialogVisible}
                onHide={() => { setAckDialogVisible(false); setAckVirement(null); }}
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-eye text-xl text-blue-600"></i>
                        <span>Billetage du Virement - Confirmation de Reception</span>
                    </div>
                }
                style={{ width: '520px' }}
                modal
                footer={
                    <div className="flex justify-content-between align-items-center">
                        <Button label="Annuler" icon="pi pi-times" severity="secondary" outlined onClick={() => { setAckDialogVisible(false); setAckVirement(null); }} />
                        <Button
                            label="Confirmer la Reception"
                            icon="pi pi-check"
                            severity="success"
                            onClick={handleConfirmAcknowledge}
                            loading={ackLoading}
                        />
                    </div>
                }
            >
                {ackVirement && (
                    <div>
                        <div className="p-3 border-round mb-3 surface-100">
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="text-500">Reference:</span>
                                <span className="font-bold">{ackVirement.reference}</span>
                            </div>
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="text-500">Source:</span>
                                <span className="font-bold">{ackVirement.codeCaisseSource || `Caisse #${ackVirement.caisseSourceId}`}</span>
                            </div>
                            <div className="flex justify-content-between align-items-center">
                                <span className="text-500">Montant:</span>
                                <span className="font-bold text-green-600 text-lg">{formatNumber(ackVirement.montant)} FBu</span>
                            </div>
                        </div>

                        <h6 className="mt-0 mb-2"><i className="pi pi-money-bill mr-2" />Billetage envoye par la source</h6>
                        <DataTable value={[
                            { label: 'Billets 10 000 FBu', value: 10000, qty: ackVirement.transferBill10000 || 0 },
                            { label: 'Billets 5 000 FBu', value: 5000, qty: ackVirement.transferBill5000 || 0 },
                            { label: 'Billets 2 000 FBu', value: 2000, qty: ackVirement.transferBill2000 || 0 },
                            { label: 'Billets 1 000 FBu', value: 1000, qty: ackVirement.transferBill1000 || 0 },
                            { label: 'Billets 500 FBu', value: 500, qty: ackVirement.transferBill500 || 0 },
                            { label: 'Pieces 100 FBu', value: 100, qty: ackVirement.transferCoin100 || 0 },
                            { label: 'Pieces 50 FBu', value: 50, qty: ackVirement.transferCoin50 || 0 },
                            { label: 'Pieces 10 FBu', value: 10, qty: ackVirement.transferCoin10 || 0 },
                            { label: 'Pieces 5 FBu', value: 5, qty: ackVirement.transferCoin5 || 0 },
                            { label: 'Pieces 1 FBu', value: 1, qty: ackVirement.transferCoin1 || 0 },
                        ].filter(d => d.qty > 0)} size="small" showGridlines
                            emptyMessage="Aucun billetage enregistre pour ce virement"
                            footer={
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-lg font-bold">TOTAL</span>
                                    <span className="text-lg font-bold text-green-600">{formatNumber(ackVirement.montant)} FBu</span>
                                </div>
                            }>
                            <Column header="Denomination" body={(d: any) => (
                                <span className="font-medium">{d.label}</span>
                            )} />
                            <Column header="Quantite" body={(d: any) => (
                                <span className="font-bold text-center">{d.qty}</span>
                            )} style={{ width: '100px', textAlign: 'center' }} />
                            <Column header="Sous-total" body={(d: any) => (
                                <span className="font-bold text-primary">{formatNumber(d.qty * d.value)} FBu</span>
                            )} style={{ textAlign: 'right' }} />
                        </DataTable>
                    </div>
                )}
            </Dialog>

            {/* Billetage Dialog - Physical cash count after operation */}
            <Dialog
                visible={billetageVisible}
                onHide={() => {/* Billetage obligatoire - ne peut pas etre ferme */}}
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-money-bill text-xl text-primary"></i>
                        <span>Billetage - Comptage Physique</span>
                    </div>
                }
                style={{ width: '520px' }}
                modal
                closable={false}
                footer={
                    <div className="flex justify-content-between">
                        <span className="text-orange-600 text-sm flex align-items-center"><i className="pi pi-exclamation-triangle mr-1"></i>Billetage obligatoire</span>
                        <Button label="Enregistrer le Billetage" icon="pi pi-check" severity="success" onClick={handleSaveBilletage} loading={billetageLoading} />
                    </div>
                }
            >
                {billetageCaisse && (
                    <div>
                        <div className="p-3 border-round mb-3 surface-100">
                            <div className="flex justify-content-between align-items-center flex-wrap gap-2">
                                <div>
                                    <span className="text-500">Caisse: </span>
                                    <span className="font-bold">{billetageCaisse.codeCaisse}</span>
                                    <span className="text-500 ml-2">— {billetageCaisse.libelle}</span>
                                </div>
                                <Tag value={billetageOperationType} severity="info" />
                            </div>
                            <div className="mt-2">
                                <span className="text-500">Solde theorique: </span>
                                <span className="font-bold text-blue-600">{formatNumber(billetageCaisse.soldeActuel)} FBu</span>
                            </div>
                        </div>

                        <DataTable value={DENOMINATIONS} size="small" showGridlines
                            footer={
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-lg font-bold">TOTAL</span>
                                    <span className="text-lg font-bold text-green-600">{formatNumber(calculateBilletageTotal())} FBu</span>
                                </div>
                            }>
                            <Column header="Denomination" body={(d: any) => (
                                <span className="font-medium">{formatNumber(d.value)} FBu</span>
                            )} style={{ width: '120px' }} />
                            <Column header="Quantite" body={(d: any) => (
                                <InputNumber
                                    value={(billetageCount as any)[d.field] || 0}
                                    onValueChange={(e) => handleBilletageDenominationChange(d.field, e.value || 0)}
                                    min={0}
                                    showButtons
                                    buttonLayout="horizontal"
                                    incrementButtonIcon="pi pi-plus"
                                    decrementButtonIcon="pi pi-minus"
                                    inputStyle={{ textAlign: 'center', fontWeight: 600, width: '60px' }}
                                />
                            )} style={{ width: '180px' }} />
                            <Column header="Sous-total" body={(d: any) => (
                                <span className="font-bold text-primary">{formatNumber(((billetageCount as any)[d.field] || 0) * d.value)} FBu</span>
                            )} style={{ textAlign: 'right' }} />
                        </DataTable>

                        <div className="mt-3 p-3 border-round" style={{
                            background: Math.abs(calculateBilletageTotal() - (billetageCaisse.soldeActuel ?? 0)) > 0.01 ? '#FFF3E0' : '#E8F5E9',
                            borderLeft: `4px solid ${Math.abs(calculateBilletageTotal() - (billetageCaisse.soldeActuel ?? 0)) > 0.01 ? '#FF9800' : '#4CAF50'}`
                        }}>
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="text-600">Solde Theorique:</span>
                                <span className="font-bold text-blue-600">{formatNumber(billetageCaisse.soldeActuel)} FBu</span>
                            </div>
                            <div className="flex justify-content-between align-items-center">
                                <span className="font-semibold">Ecart:</span>
                                <span className={`font-bold text-lg ${Math.abs(calculateBilletageTotal() - (billetageCaisse.soldeActuel ?? 0)) > 0.01 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {formatNumber(calculateBilletageTotal() - (billetageCaisse.soldeActuel ?? 0))} FBu
                                </span>
                            </div>
                        </div>

                        <div className="field mt-3">
                            <label className="font-semibold">Notes</label>
                            <InputTextarea
                                value={billetageCount.notes || ''}
                                onChange={(e) => setBilletageCount(prev => ({ ...prev, notes: e.target.value }))}
                                rows={2}
                                className="w-full"
                                placeholder="Observations sur le comptage..."
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_CASH_MANAGEMENT']}>
            <CaissePage />
        </ProtectedPage>
    );
}
