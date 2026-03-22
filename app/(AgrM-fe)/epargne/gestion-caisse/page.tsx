'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputTextarea } from 'primereact/inputtextarea';
import Cookies from 'js-cookie';

import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { CptCaisse, CptCashCount, VirementInterne } from '../../comptability/types';
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

const toApiDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

function GestionCaissePage() {
    const [activeTab, setActiveTab] = useState(0);

    // My caisse (auto-detected from user)
    const [myCaisse, setMyCaisse] = useState<CptCaisse | null>(null);
    const [allCaisses, setAllCaisses] = useState<CptCaisse[]>([]);
    const [parentCaisse, setParentCaisse] = useState<CptCaisse | null>(null);
    const [currentUserInfo, setCurrentUserInfo] = useState<{ isCaissier: boolean; isChef: boolean; isSuperAdmin: boolean; userId: string; userName: string; branchId: string } | null>(null);
    const [cashCount, setCashCount] = useState<CptCashCount>(new CptCashCount());

    // Tab: Ouverture / Fermeture (for managers - open/close any agency caisse)
    const [ofSelectedCaisse, setOfSelectedCaisse] = useState<CptCaisse | null>(null);
    const [ofCashCount, setOfCashCount] = useState<CptCashCount>(new CptCashCount());

    // Tab 2: Distribution (for managers)
    const [childCaisses, setChildCaisses] = useState<CptCaisse[]>([]);
    const [transferDest, setTransferDest] = useState<string>('');
    const [transferMontant, setTransferMontant] = useState<number>(0);
    const [transferLibelle, setTransferLibelle] = useState<string>('');
    const [transferBilletage, setTransferBilletage] = useState<CptCashCount>(new CptCashCount());

    // Tab 3: Daily summary
    const [dailySummary, setDailySummary] = useState<any>(null);
    const [branchSummary, setBranchSummary] = useState<any>(null);
    const [summaryDate, setSummaryDate] = useState<Date>(new Date());

    // Tab 4: Transfer history
    const [transfers, setTransfers] = useState<VirementInterne[]>([]);

    // Tab 5: Mouvements (Movement history)
    const [movements, setMovements] = useState<any[]>([]);
    const [movementDate, setMovementDate] = useState<Date>(new Date());

    // Agency status (hierarchical control)
    const [agencyStatus, setAgencyStatus] = useState<any>(null);

    // Pending receipts (caissier acknowledges incoming transfers)
    const [pendingReceipts, setPendingReceipts] = useState<VirementInterne[]>([]);
    // Acknowledge receipt - view source billetage before confirming
    const [ackDialogVisible, setAckDialogVisible] = useState(false);
    const [ackVirement, setAckVirement] = useState<VirementInterne | null>(null);
    // Billetage (physical cash count after operations)
    const [billetageVisible, setBilletageVisible] = useState(false);
    const [billetageCaisse, setBilletageCaisse] = useState<CptCaisse | null>(null);
    const [billetageCount, setBilletageCount] = useState<CptCashCount>(new CptCashCount());
    const [billetageOperationType, setBilletageOperationType] = useState<string>('');

    // Billetage details (denomination view per caisse)
    const [billetageDetails, setBilletageDetails] = useState<{ [caisseId: string]: CptCashCount | null }>({});
    const [billetageDetailsLoading, setBilletageDetailsLoading] = useState(false);

    // Tab 5: Closing validation (for managers)
    const [closingComparison, setClosingComparison] = useState<any>(null);
    const [branchClosingStatus, setBranchClosingStatus] = useState<any>(null);
    const [detailDialog, setDetailDialog] = useState<any>(null);
    const [rejectDialog, setRejectDialog] = useState<{ visible: boolean; caisseId: string; reason: string }>({ visible: false, caisseId: '', reason: '' });

    const toast = useRef<Toast>(null);

    const { data: caissesData, error: caissesError, fetchData: fetchCaisses, callType: caissesCallType } = useConsumApi('');
    const { data: operationData, loading: operationLoading, error: operationError, fetchData: fetchOperation, callType: operationCallType } = useConsumApi('');
    const { data: childrenData, error: childrenError, fetchData: fetchChildren, callType: childrenCallType } = useConsumApi('');
    const { data: transferData, loading: transferLoading, error: transferError, fetchData: fetchTransfer, callType: transferCallType } = useConsumApi('');
    const { data: summaryData, error: summaryError, fetchData: fetchSummary, callType: summaryCallType } = useConsumApi('');
    const { data: branchData, error: branchError, fetchData: fetchBranch, callType: branchCallType } = useConsumApi('');
    const { data: historyData, error: historyError, fetchData: fetchHistory, callType: historyCallType } = useConsumApi('');
    const { data: agencyData, error: agencyError, fetchData: fetchAgency, callType: agencyCallType } = useConsumApi('');
    const { data: comparisonData, error: comparisonError, fetchData: fetchComparison, callType: comparisonCallType } = useConsumApi('');
    const { data: branchClosingData, error: branchClosingError, fetchData: fetchBranchClosing, callType: branchClosingCallType } = useConsumApi('');
    const { data: validateData, loading: validateLoading, error: validateError, fetchData: fetchValidate, callType: validateCallType } = useConsumApi('');
    const { data: movementsData, loading: movementsLoading, error: movementsError, fetchData: fetchMovements, callType: movementsCallType } = useConsumApi('');
    const { data: ofOperationData, loading: ofOperationLoading, error: ofOperationError, fetchData: fetchOfOperation, callType: ofOperationCallType } = useConsumApi('');
    const { data: ofSummariesData, fetchData: fetchOfSummaries, callType: ofSummariesCallType } = useConsumApi('');
    const { data: pendingData, error: pendingError, fetchData: fetchPending, callType: pendingCallType } = useConsumApi('');
    const { data: ackData, loading: ackLoading, error: ackError, fetchData: fetchAck, callType: ackCallType } = useConsumApi('');
    const { data: billetageData, loading: billetageLoading, error: billetageError, fetchData: fetchBilletage, callType: billetageCallType } = useConsumApi('');
    // billetageDetail hook removed — loadAllBilletageDetails now uses direct fetch with Promise.all

    const BASE_URL = buildApiUrl('/api/comptability/caisses');

    // ==================== Initialization ====================

    useEffect(() => {
        loadAllCaisses();
        loadOfDailySummaries();
    }, []);

    // Auto-detect user's caisse from allCaisses
    useEffect(() => {
        if (caissesData && caissesCallType === 'getall') {
            const list = Array.isArray(caissesData) ? caissesData : [];

            const appUserStr = Cookies.get('appUser');
            if (appUserStr) {
                try {
                    const appUser = JSON.parse(appUserStr);
                    const roleName = (appUser.roleName || '').toLowerCase();
                    const auths: string[] = appUser.authorities || [];
                    const isCaissier = roleName.includes('caiss') || auths.includes('GUICHET_CAISSE');
                    const isChefAgence = roleName.includes('chef') || auths.includes('CAISSE_VALIDATE_CLOSING');
                    const isSuperAdmin = auths.includes('SUPER_ADMIN') || auths.includes('ROLE_SUPER_ADMIN');
                    let found = null;
                    const isGuichet = (c: CptCaisse) =>
                        c.typeCaisse !== 'CHEF_AGENCE' && c.typeCaisse !== 'AGENCE' && c.typeCaisse !== 'SIEGE';

                    // Caissier: filter allCaisses to only their own guichet caisses
                    if (isCaissier && !isChefAgence && !isSuperAdmin) {
                        const userId = String(appUser.id || '');
                        const fullName = `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim();
                        const ownCaisses = list.filter((c: CptCaisse) =>
                            isGuichet(c) && (
                                (userId && c.agentId && String(c.agentId) === userId) ||
                                (fullName && c.agentName && c.agentName.toLowerCase() === fullName.toLowerCase())
                            )
                        );
                        setAllCaisses(ownCaisses);
                    } else {
                        setAllCaisses(list);
                    }

                    // Priority 1: Match by agentId (most precise - caisse assigned to this user)
                    if (appUser.id) {
                        found = list.find((c: CptCaisse) =>
                            c.agentId && Number(c.agentId) === Number(appUser.id) &&
                            (isCaissier && !isChefAgence && !isSuperAdmin ? isGuichet(c) : true)
                        );
                    }

                    // Priority 2: Match by agentName
                    if (!found) {
                        const userName = `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim();
                        found = list.find((c: CptCaisse) =>
                            c.agentName && c.agentName.toLowerCase() === userName.toLowerCase() &&
                            (isCaissier && !isChefAgence && !isSuperAdmin ? isGuichet(c) : true)
                        );
                    }

                    // Priority 3: Match by compteComptable (fallback, for Caissier exclude parent types)
                    if (!found && appUser.compteComptable) {
                        if (isCaissier && !isChefAgence && !isSuperAdmin) {
                            found = list.find((c: CptCaisse) =>
                                c.compteComptable === appUser.compteComptable &&
                                c.typeCaisse !== 'CHEF_AGENCE' && c.typeCaisse !== 'AGENCE' && c.typeCaisse !== 'SIEGE'
                            );
                        } else {
                            found = list.find((c: CptCaisse) =>
                                c.compteComptable === appUser.compteComptable
                            );
                        }
                    }

                    // Priority 4: For chef d'agence, auto-select CHEF_AGENCE or AGENCE type caisse in branch
                    if (!found && isChefAgence && !isSuperAdmin) {
                        found = list.find((c: CptCaisse) => c.actif && c.typeCaisse === 'CHEF_AGENCE');
                        if (!found) {
                            found = list.find((c: CptCaisse) => c.actif && c.typeCaisse === 'AGENCE');
                        }
                    }

                    if (found) {
                        setMyCaisse(found);
                        // For caissier, find parent caisse (caisse agence) for fund return
                        if (isCaissier && !isChefAgence && !isSuperAdmin && found.parentCaisseId) {
                            const parent = list.find((c: CptCaisse) => String(c.caisseId) === String(found.parentCaisseId));
                            if (parent) setParentCaisse(parent);
                        }
                    } else if (list.length > 0) {
                        setMyCaisse(null);
                        // For chef d'agence without a personal caisse, populate children from branch caisses
                        if (isChefAgence && !isSuperAdmin) {
                            const guichets = list.filter((c: CptCaisse) => c.actif);
                            setChildCaisses(guichets);
                            // Build local branchClosingStatus from loaded caisses
                            const guichetOnly = guichets.filter((c: CptCaisse) =>
                                c.typeCaisse !== 'CHEF_AGENCE' && c.typeCaisse !== 'AGENCE' && c.typeCaisse !== 'SIEGE');
                            const closedGuichets = guichetOnly.filter((c: CptCaisse) => c.status === 'CLOSED');
                            const validatedGuichets = closedGuichets.filter((c: CptCaisse) => c.closingStatus === 'VALIDATED');
                            setBranchClosingStatus({
                                totalGuichets: guichetOnly.length,
                                guichetsFermes: closedGuichets.length,
                                guichetsValides: validatedGuichets.length,
                                allClosed: guichetOnly.length > 0 && guichetOnly.every((c: CptCaisse) => c.status === 'CLOSED'),
                                allValidated: closedGuichets.length > 0 && closedGuichets.every((c: CptCaisse) => c.closingStatus === 'VALIDATED'),
                                readyForAccounting: closedGuichets.length > 0 && closedGuichets.every((c: CptCaisse) => c.closingStatus === 'VALIDATED'),
                                guichets: guichetOnly.map((c: CptCaisse) => ({
                                    caisseId: c.caisseId,
                                    codeCaisse: c.codeCaisse,
                                    agentName: c.agentName,
                                    typeCaisse: c.typeCaisse,
                                    status: c.status,
                                    closingStatus: c.closingStatus || null,
                                    validationStatus: c.closingStatus === 'VALIDATED' ? 'VALIDATED' : null,
                                    soldeActuel: c.soldeActuel
                                }))
                            });
                        }
                    }
                    const userId = String(appUser.id || '');
                    const fullName = `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim();
                    const userBranchId = String(appUser.branchId || '');
                    setCurrentUserInfo({ isCaissier, isChef: isChefAgence, isSuperAdmin, userId, userName: fullName, branchId: userBranchId });
                } catch (e) { /* ignore */ }
            }
        }
        if (caissesError && caissesCallType === 'getall') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: caissesError.message || 'Erreur chargement caisses', life: 3000 });
        }
    }, [caissesData, caissesError, caissesCallType]);

    // Load children + agency status when myCaisse changes
    useEffect(() => {
        if (myCaisse && (myCaisse.typeCaisse === 'CHEF_AGENCE' || myCaisse.typeCaisse === 'AGENCE' || myCaisse.typeCaisse === 'SIEGE')) {
            loadChildren(myCaisse.caisseId);
            loadBranchSummary(myCaisse.caisseId, toApiDate(summaryDate));
            // Load branch closing status for validation tab
            loadBranchClosingStatus(myCaisse.caisseId, toApiDate(new Date()));
        }
        if (myCaisse) {
            loadDailySummary(myCaisse.caisseId, toApiDate(summaryDate));
            loadTransferHistory(myCaisse.caisseId);
            loadMovements(myCaisse.caisseId, toApiDate(movementDate));
            // Load agency status for hierarchical control
            fetchAgency(null, 'GET', BASE_URL + '/agency-status/' + myCaisse.caisseId, 'agency-status');
            // Load billetage details for Ma Caisse tab
            const token = Cookies.get('token');
            if (token) {
                fetch(`${BASE_URL}/billetage/latest/${myCaisse.caisseId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => {
                    if (res.ok && res.status !== 204) return res.text();
                    return null;
                }).then(text => {
                    if (text && text.trim()) {
                        setBilletageDetails(prev => ({ ...prev, [String(myCaisse.caisseId)]: JSON.parse(text) as CptCashCount }));
                    }
                }).catch(() => { /* ignore */ });
            }
            // Load closing comparison for today
            if (myCaisse.status === 'CLOSED') {
                loadClosingComparison(myCaisse.caisseId, toApiDate(new Date()));
            }
            // Load pending receipts for caissier
            loadPendingReceipts(myCaisse.caisseId);
        }
    }, [myCaisse]);

    // Handle children response
    useEffect(() => {
        if (childrenData && childrenCallType === 'children') {
            setChildCaisses(Array.isArray(childrenData) ? childrenData : []);
        }
    }, [childrenData, childrenCallType]);

    // Handle agency status response
    useEffect(() => {
        if (agencyData && agencyCallType === 'agency-status') {
            setAgencyStatus(agencyData);
        }
    }, [agencyData, agencyCallType]);

    // Handle open/close response
    useEffect(() => {
        if (operationData && (operationCallType === 'open' || operationCallType === 'close')) {
            const msg = operationCallType === 'open' ? 'Caisse ouverte avec succes' : 'Caisse fermee avec succes';
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: msg, life: 5000 });

            const result = operationData as any;
            if (result.ecart && Math.abs(result.ecart) > 0.01) {
                toast.current?.show({
                    severity: result.ecart < 0 ? 'error' : 'warn',
                    summary: 'Ecart detecte',
                    detail: `Ecart de ${formatNumber(result.ecart)} FBu`,
                    life: 8000
                });
            }
            loadAllCaisses();
            setCashCount(new CptCashCount());
            // Refresh agency status and closing comparison after open/close
            if (myCaisse) {
                fetchAgency(null, 'GET', BASE_URL + '/agency-status/' + myCaisse.caisseId, 'agency-status');
                if (operationCallType === 'close') {
                    loadClosingComparison(myCaisse.caisseId, toApiDate(new Date()));
                } else {
                    setClosingComparison(null);
                }
            }
        }
        if (operationError && (operationCallType === 'open' || operationCallType === 'close')) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: operationError.message || 'Erreur operation', life: 5000 });
        }
    }, [operationData, operationError, operationCallType]);

    // Handle transfer response
    useEffect(() => {
        if (transferData && transferCallType === 'transfer') {
            const trResult = transferData as any;
            const isPending = trResult.status === 'PENDING_RECEIPT';
            toast.current?.show({
                severity: 'success',
                summary: 'Succes',
                detail: isPending
                    ? 'Virement effectue. En attente d\'accusation de reception par le caissier.'
                    : 'Virement interne effectue avec succes',
                life: isPending ? 8000 : 5000
            });
            setTransferDest('');
            setTransferMontant(0);
            setTransferLibelle('');
            setTransferBilletage(new CptCashCount());
            loadAllCaisses();
            if (myCaisse) {
                loadChildren(myCaisse.caisseId);
                loadDailySummary(myCaisse.caisseId, toApiDate(summaryDate));
                loadTransferHistory(myCaisse.caisseId);
                // Billetage already sent with the transfer — no post-transfer dialog needed
            }
        }
        if (transferError && transferCallType === 'transfer') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: transferError.message || 'Erreur virement', life: 5000 });
        }
    }, [transferData, transferError, transferCallType]);

    // Handle daily summary response
    useEffect(() => {
        if (summaryData && summaryCallType === 'daily-summary') {
            setDailySummary(summaryData);
        }
    }, [summaryData, summaryCallType]);

    // Handle branch summary response
    useEffect(() => {
        if (branchData && branchCallType === 'branch-summary') {
            setBranchSummary(branchData);
        }
    }, [branchData, branchCallType]);

    // Handle transfer history response
    useEffect(() => {
        if (historyData && historyCallType === 'history') {
            setTransfers(Array.isArray(historyData) ? historyData : []);
        }
    }, [historyData, historyCallType]);

    // Handle closing comparison response
    useEffect(() => {
        if (comparisonData && comparisonCallType === 'closing-comparison') {
            setClosingComparison(comparisonData);
        }
    }, [comparisonData, comparisonCallType]);

    // Handle branch closing status response
    useEffect(() => {
        if (branchClosingData && branchClosingCallType === 'branch-closing') {
            setBranchClosingStatus(branchClosingData);
        }
    }, [branchClosingData, branchClosingCallType]);

    // Handle validate/reject response
    useEffect(() => {
        if (validateData && (validateCallType === 'validate-closing' || validateCallType === 'reject-closing')) {
            if (validateCallType === 'validate-closing') {
                const result = validateData as any;
                const transferAmount = result.transferAmount || result.consolidationAmount;
                if (transferAmount && transferAmount > 0) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Validation + Consolidation',
                        detail: `Fermeture validee. ${formatNumber(transferAmount)} FBu consolides vers votre caisse.`,
                        life: 8000
                    });
                } else {
                    toast.current?.show({ severity: 'success', summary: 'Succes', detail: 'Fermeture validee avec succes', life: 5000 });
                }
            } else {
                toast.current?.show({ severity: 'success', summary: 'Succes', detail: 'Fermeture rejetee', life: 5000 });
            }
            setRejectDialog({ visible: false, caisseId: '', reason: '' });
            // Refresh branch closing status + caisses (balances may have changed after consolidation)
            loadAllCaisses();
            if (myCaisse) {
                loadBranchClosingStatus(myCaisse.caisseId, toApiDate(new Date()));
            }
        }
        if (validateError && (validateCallType === 'validate-closing' || validateCallType === 'reject-closing')) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: validateError.message || 'Erreur validation', life: 5000 });
        }
    }, [validateData, validateError, validateCallType]);

    // Handle movements response
    useEffect(() => {
        if (movementsData && movementsCallType === 'movements') {
            setMovements(Array.isArray(movementsData) ? movementsData : []);
        }
    }, [movementsData, movementsCallType]);

    // Handle Ouverture/Fermeture tab operation response
    const [ofDailySummaries, setOfDailySummaries] = useState<{ [caisseId: string]: any }>({});
    useEffect(() => {
        if (ofOperationData && (ofOperationCallType === 'of-open' || ofOperationCallType === 'of-close')) {
            const msg = ofOperationCallType === 'of-open' ? 'Caisse ouverte avec succes' : 'Caisse fermee avec succes';
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: msg, life: 5000 });
            const result = ofOperationData as any;
            if (result.ecart && Math.abs(result.ecart) > 0.01) {
                toast.current?.show({
                    severity: result.ecart < 0 ? 'error' : 'warn',
                    summary: 'Ecart detecte',
                    detail: `Ecart de ${formatNumber(result.ecart)} FBu (Physique: ${formatNumber(result.totalPhysique)} - Theorique: ${formatNumber(result.totalTheorique)})`,
                    life: 8000
                });
            }
            loadAllCaisses();
            setOfCashCount(new CptCashCount());
            setOfSelectedCaisse(null);
        }
        if (ofOperationError && (ofOperationCallType === 'of-open' || ofOperationCallType === 'of-close')) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: ofOperationError.message || 'Erreur operation', life: 5000 });
        }
    }, [ofOperationData, ofOperationError, ofOperationCallType]);

    // Handle Ouverture/Fermeture daily summaries
    useEffect(() => {
        if (ofSummariesData && ofSummariesCallType === 'of-summaries') {
            const map: { [key: string]: any } = {};
            if (Array.isArray(ofSummariesData)) {
                ofSummariesData.forEach((s: any) => {
                    if (s.caisseId) map[String(s.caisseId)] = s;
                });
            }
            setOfDailySummaries(map);
        }
    }, [ofSummariesData, ofSummariesCallType]);

    // Handle pending receipts response
    useEffect(() => {
        if (pendingData && pendingCallType === 'pending-receipts') {
            setPendingReceipts(Array.isArray(pendingData) ? pendingData : []);
        }
    }, [pendingData, pendingCallType]);

    // Handle acknowledge receipt response
    useEffect(() => {
        if (ackData && ackCallType === 'acknowledge') {
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: 'Reception accusee avec succes', life: 5000 });
            // Refresh pending receipts and caisses
            if (myCaisse) {
                loadPendingReceipts(myCaisse.caisseId);
                loadTransferHistory(myCaisse.caisseId);
            }
            loadAllCaisses();
        }
        if (ackError && ackCallType === 'acknowledge') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: ackError.message || 'Erreur accusation de reception', life: 5000 });
        }
    }, [ackData, ackError, ackCallType]);

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

    // ==================== API Calls ====================

    const loadAllCaisses = () => {
        // Filter by branch unless user has VIEW_ALL_BRANCHES or SUPER_ADMIN authority
        const appUserStr = Cookies.get('appUser');
        let branchId = null;
        let canViewAll = false;
        if (appUserStr) {
            try {
                const appUser = JSON.parse(appUserStr);
                branchId = appUser.branchId;
                const auths: string[] = appUser.authorities || [];
                canViewAll = auths.includes('VIEW_ALL_BRANCHES') || auths.includes('ROLE_VIEW_ALL_BRANCHES')
                    || auths.includes('SUPER_ADMIN') || auths.includes('ROLE_SUPER_ADMIN');
            } catch (e) { /* ignore */ }
        }
        if (branchId && !canViewAll) {
            fetchCaisses(null, 'GET', BASE_URL + '/findbybranch/' + branchId, 'getall');
        } else {
            fetchCaisses(null, 'GET', BASE_URL + '/findall', 'getall');
        }
    };

    const loadChildren = (parentId: string) => {
        fetchChildren(null, 'GET', BASE_URL + '/children/' + parentId, 'children');
    };

    const loadDailySummary = (caisseId: string, date: string) => {
        fetchSummary(null, 'GET', BASE_URL + '/daily-summary/' + caisseId + '?date=' + date, 'daily-summary');
    };

    const loadBranchSummary = (parentId: string, date: string) => {
        fetchBranch(null, 'GET', BASE_URL + '/branch-summary/' + parentId + '?date=' + date, 'branch-summary');
    };

    const loadTransferHistory = (caisseId: string) => {
        fetchHistory(null, 'GET', BASE_URL + '/transfers/' + caisseId, 'history');
    };

    const loadClosingComparison = (caisseId: string, date: string) => {
        fetchComparison(null, 'GET', BASE_URL + '/closing-comparison/' + caisseId + '?date=' + date, 'closing-comparison');
    };

    const loadBranchClosingStatus = (parentCaisseId: string, date: string) => {
        fetchBranchClosing(null, 'GET', BASE_URL + '/branch-closing-status/' + parentCaisseId + '?date=' + date, 'branch-closing');
    };

    const loadMovements = (caisseId: string, date: string) => {
        fetchMovements(null, 'GET', BASE_URL + '/movements/' + caisseId + '?date=' + date, 'movements');
    };

    const loadPendingReceipts = (caisseId: string) => {
        fetchPending(null, 'GET', BASE_URL + '/pending-receipts/' + caisseId, 'pending-receipts');
    };

    const handleAcknowledgeReceipt = (virement: VirementInterne) => {
        setAckVirement(virement);
        setAckDialogVisible(true);
    };

    const handleConfirmAcknowledge = () => {
        if (ackVirement) {
            fetchAck({ userAction: getUserAction() }, 'POST', BASE_URL + '/acknowledge-receipt/' + ackVirement.virementId, 'acknowledge');
            setAckDialogVisible(false);
            setAckVirement(null);
        }
    };

    const handleValidateClosing = (caisseId: string) => {
        const validatedBy = getUserAction();
        fetchValidate({ userAction: validatedBy }, 'POST',
            BASE_URL + '/validate-closing/' + caisseId + '?date=' + toApiDate(new Date()) + '&validatedBy=' + encodeURIComponent(validatedBy),
            'validate-closing');
    };

    const handleRejectClosing = () => {
        if (!rejectDialog.reason.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez indiquer un motif de rejet.', life: 3000 });
            return;
        }
        fetchValidate({ userAction: getUserAction() }, 'POST',
            BASE_URL + '/reject-closing/' + rejectDialog.caisseId + '?date=' + toApiDate(new Date()) + '&reason=' + encodeURIComponent(rejectDialog.reason),
            'reject-closing');
    };

    const handleValidateAll = () => {
        if (!branchClosingStatus?.guichets) return;
        const closedNotValidated = branchClosingStatus.guichets.filter(
            (g: any) => g.closingStatus === 'CLOSED' && g.validationStatus !== 'VALIDATED'
        );
        if (closedNotValidated.length === 0) {
            toast.current?.show({ severity: 'info', summary: 'Info', detail: 'Aucun guichet a valider.', life: 3000 });
            return;
        }
        confirmDialog({
            message: `Valider la fermeture de ${closedNotValidated.length} guichet(s) ?`,
            header: 'Validation groupee',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Valider tous',
            rejectLabel: 'Annuler',
            accept: () => {
                closedNotValidated.forEach((g: any) => handleValidateClosing(String(g.caisseId)));
            }
        });
    };

    const calculatePhysicalTotal = (): number => {
        let total = 0;
        for (const d of DENOMINATIONS) {
            total += ((cashCount as any)[d.field] || 0) * d.value;
        }
        return total;
    };

    // Load latest billetage for relevant caisses
    const loadAllBilletageDetails = async () => {
        const targetCaisses = myCaisse ? [myCaisse, ...childCaisses] : allCaisses.filter(c => c.actif);
        if (targetCaisses.length === 0) return;
        setBilletageDetailsLoading(true);
        try {
            const token = Cookies.get('token');
            const results: { [caisseId: string]: CptCashCount | null } = {};
            await Promise.all(targetCaisses.map(async (c) => {
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

    // ==================== Billetage Handlers ====================
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

    // ==================== Ouverture / Fermeture Tab Handlers ====================
    const ofCalculateTotal = (): number => {
        return DENOMINATIONS.reduce((sum, d) => sum + ((ofCashCount as any)[d.field] || 0) * d.value, 0);
    };

    const loadOfDailySummaries = () => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        fetchOfSummaries(null, 'GET', `${BASE_URL}/all-daily-summaries?date=${dateStr}`, 'of-summaries');
    };

    const handleOfSelectCaisse = (c: CptCaisse) => {
        setOfSelectedCaisse(c);
        setOfCashCount(new CptCashCount());
        // Load daily summaries for effective balance
        loadOfDailySummaries();
        // Fetch fresh caisse data and billetage
        const token = Cookies.get('token');
        if (token && c.caisseId) {
            // Refresh caisse data to get latest soldeActuel
            fetch(`${BASE_URL}/findbyid/${c.caisseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.ok ? res.json() : null)
            .then(freshCaisse => {
                if (freshCaisse) {
                    setOfSelectedCaisse(freshCaisse);
                }
            }).catch(() => { /* ignore */ });
            // Load billetage for selected caisse
            fetch(`${BASE_URL}/billetage/latest/${c.caisseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.ok && res.status !== 204 ? res.text() : null)
            .then(text => {
                if (text && text.trim()) {
                    setBilletageDetails(prev => ({ ...prev, [String(c.caisseId)]: JSON.parse(text) as CptCashCount }));
                }
            }).catch(() => { /* ignore */ });
        }
    };

    const handleOfOpen = () => {
        if (!ofSelectedCaisse) return;
        const dataToSend = { ...ofCashCount, countedBy: getUserAction(), userAction: getUserAction() };
        fetchOfOperation(dataToSend, 'POST', `${BASE_URL}/open/${ofSelectedCaisse.caisseId}`, 'of-open');
    };

    const handleOfClose = () => {
        if (!ofSelectedCaisse) return;
        confirmDialog({
            message: `Voulez-vous fermer la caisse "${ofSelectedCaisse.codeCaisse}" ?\n\nLe comptage physique sera compare au solde theorique.`,
            header: 'Confirmation de fermeture',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, Fermer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-warning',
            accept: () => {
                const dataToSend = { ...ofCashCount, countedBy: getUserAction(), userAction: getUserAction() };
                fetchOfOperation(dataToSend, 'POST', `${BASE_URL}/close/${ofSelectedCaisse.caisseId}`, 'of-close');
            }
        });
    };

    const handleOpenCaisse = () => {
        if (!myCaisse) return;
        const countData = {
            ...cashCount,
            countedBy: getUserAction(),
            userAction: getUserAction()
        };
        fetchOperation(countData, 'POST', BASE_URL + '/open/' + myCaisse.caisseId, 'open');
    };

    const handleCloseCaisse = () => {
        if (!myCaisse) return;
        confirmDialog({
            message: `Etes-vous sur de vouloir fermer la caisse ${myCaisse.codeCaisse} ? Aucune operation ne sera possible apres la fermeture.`,
            header: 'Confirmation de fermeture',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, fermer',
            rejectLabel: 'Annuler',
            accept: () => {
                const countData = {
                    ...cashCount,
                    countedBy: getUserAction(),
                    userAction: getUserAction()
                };
                fetchOperation(countData, 'POST', BASE_URL + '/close/' + myCaisse.caisseId, 'close');
            }
        });
    };

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

    // Transfer billetage helpers
    const calculateTransferBilletageTotal = (): number => {
        return DENOMINATIONS.reduce((sum, d) => sum + ((transferBilletage as any)[d.field] || 0) * d.value, 0);
    };

    const handleTransferBilletageChange = (field: string, value: number) => {
        setTransferBilletage(prev => ({ ...prev, [field]: value } as CptCashCount));
    };

    const handleTransfer = async () => {
        if (!myCaisse || !transferDest || transferMontant <= 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Selectionnez une destination et un montant valide.', life: 3000 });
            return;
        }

        const soldeSource = myCaisse.soldeActuel ?? 0;
        if (transferMontant > soldeSource) {
            toast.current?.show({ severity: 'error', summary: 'Solde insuffisant', detail: `Le solde actuel de votre caisse "${myCaisse.codeCaisse}" est de ${formatNumber(soldeSource)} FBu. Le montant demande (${formatNumber(transferMontant)} FBu) depasse le solde disponible.`, life: 5000 });
            return;
        }

        const destCaisse = childCaisses.find(c => c.caisseId === transferDest);
        const destLabel = destCaisse ? destCaisse.codeCaisse : transferDest;

        // Validate billetage total matches montant
        const billetageTotal = calculateTransferBilletageTotal();
        if (billetageTotal <= 0) {
            toast.current?.show({ severity: 'error', summary: 'Billetage requis', detail: 'Veuillez saisir le billetage (billets a transferer).', life: 5000 });
            return;
        }
        if (Math.abs(billetageTotal - transferMontant) > 0.01) {
            toast.current?.show({ severity: 'error', summary: 'Billetage incorrect', detail: `Le total du billetage (${formatNumber(billetageTotal)} FBu) ne correspond pas au montant du virement (${formatNumber(transferMontant)} FBu).`, life: 5000 });
            return;
        }

        // Get current exercice from cookies
        let exerciceId = '';
        const savedExercice = Cookies.get('currentExercice');
        if (savedExercice) {
            try {
                const ex = JSON.parse(savedExercice);
                exerciceId = ex.exerciceId || '';
            } catch (e) { /* ignore */ }
        }

        confirmDialog({
            message: `Confirmer le virement de ${formatNumber(transferMontant)} FBu de ${myCaisse.codeCaisse} vers ${destLabel} ?\n\nSolde actuel: ${formatNumber(soldeSource)} FBu\nSolde apres virement: ${formatNumber(soldeSource - transferMontant)} FBu\n\nBilletage: ${formatNumber(billetageTotal)} FBu`,
            header: 'Confirmation de virement',
            icon: 'pi pi-send',
            acceptLabel: 'Confirmer',
            rejectLabel: 'Annuler',
            accept: () => {
                const params = new URLSearchParams({
                    caisseSourceId: myCaisse.caisseId,
                    caisseDestId: transferDest,
                    montant: transferMontant.toString(),
                    libelle: transferLibelle || `Distribution de fonds vers ${destLabel}`
                });
                if (exerciceId) params.append('exerciceId', exerciceId);
                const body = { ...transferBilletage, userAction: getUserAction() };
                fetchTransfer(body, 'POST', BASE_URL + '/transfer?' + params.toString(), 'transfer');
            }
        });
    };

    const isManager = (
        (myCaisse && (myCaisse.typeCaisse === 'CHEF_AGENCE' || myCaisse.typeCaisse === 'AGENCE' || myCaisse.typeCaisse === 'SIEGE'))
        || (currentUserInfo?.isChef && !currentUserInfo?.isSuperAdmin)
    ) && !(currentUserInfo?.isCaissier && !currentUserInfo?.isChef && !currentUserInfo?.isSuperAdmin);

    // ==================== Render ====================

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2><i className="pi pi-wallet mr-2" />Gestion de Caisse {isManager ? '- Chef d\'Agence' : '- Guichet'}</h2>

            {/* Caisse selector (if not auto-detected) */}
            {!myCaisse && (
                <div className="mb-4 p-3 surface-100 border-round">
                    <div className="field">
                        <label className="font-semibold">Selectionnez votre caisse</label>
                        <Dropdown
                            value={null}
                            options={allCaisses.filter(c => {
                                if (!c.actif) return false;
                                // Caissier: only show their own guichet caisses
                                if (currentUserInfo?.isCaissier && !currentUserInfo?.isChef && !currentUserInfo?.isSuperAdmin) {
                                    const isGuichetType = c.typeCaisse !== 'CHEF_AGENCE' && c.typeCaisse !== 'AGENCE' && c.typeCaisse !== 'SIEGE';
                                    const isOwn = (!!currentUserInfo.userId && String(c.agentId) === currentUserInfo.userId) ||
                                                  (!!currentUserInfo.userName && c.agentName?.toLowerCase() === currentUserInfo.userName.toLowerCase());
                                    return isGuichetType && isOwn;
                                }
                                // Chef d'agence: only show caisses from their branch
                                if (currentUserInfo?.isChef && !currentUserInfo?.isSuperAdmin && currentUserInfo?.branchId) {
                                    return String(c.branchId) === currentUserInfo.branchId;
                                }
                                return true;
                            })}
                            onChange={(e) => {
                                const found = allCaisses.find(c => c.caisseId === e.value);
                                if (found) setMyCaisse(found);
                            }}
                            optionValue="caisseId"
                            optionLabel="codeCaisse"
                            placeholder="Choisir une caisse"
                            className="w-full md:w-20rem"
                            filter
                            filterBy="codeCaisse,libelle,agentName"
                            itemTemplate={(option: CptCaisse) => (
                                <span>{option.codeCaisse} - {option.libelle} ({option.agentName || 'N/A'})</span>
                            )}
                        />
                    </div>
                </div>
            )}

            {/* Fallback branch view for chef d'agence without personal CHEF_AGENCE caisse */}
            {!myCaisse && currentUserInfo?.isChef && !currentUserInfo?.isSuperAdmin && allCaisses.length > 0 && (
                <div>
                    <div className="mb-3 p-3 border-round bg-blue-50 border-blue-200" style={{ border: '1px solid' }}>
                        <i className="pi pi-info-circle mr-2 text-blue-600" />
                        <span className="text-blue-800">
                            Vue branche - Aucune caisse principale (CHEF_AGENCE) detectee. Selectionnez votre caisse dans le menu ci-dessus pour accuser reception des virements et gerer vos operations.
                        </span>
                    </div>

                    {/* Branch guichets overview */}
                    <div className="mb-3">
                        <h4 className="m-0 mb-2"><i className="pi pi-th-large mr-2" />Guichets de l'agence</h4>
                        <DataTable value={childCaisses} size="small" showGridlines stripedRows>
                            <Column field="codeCaisse" header="Code" />
                            <Column field="agentName" header="Agent" />
                            <Column field="typeCaisse" header="Type" />
                            <Column header="Statut" body={(row: CptCaisse) => (
                                <Tag value={row.status === 'OPEN' ? 'OUVERTE' : 'FERMEE'}
                                     severity={row.status === 'OPEN' ? 'success' : 'warning'}
                                     icon={row.status === 'OPEN' ? 'pi pi-lock-open' : 'pi pi-lock'} />
                            )} />
                            <Column header="Fermeture" body={(row: CptCaisse) => {
                                if (!row.closingStatus) return <Tag value="--" severity="secondary" />;
                                return <Tag value={row.closingStatus === 'VALIDATED' ? 'VALIDEE' : 'EN ATTENTE'}
                                            severity={row.closingStatus === 'VALIDATED' ? 'success' : 'warning'}
                                            icon={row.closingStatus === 'VALIDATED' ? 'pi pi-check-circle' : 'pi pi-clock'} />;
                            }} />
                            <Column header="Solde" body={(row: CptCaisse) => formatNumber(row.soldeActuel) + ' FBu'} style={{ textAlign: 'right' }} />
                        </DataTable>
                    </div>

                    {/* Validation section */}
                    {branchClosingStatus && (
                        <div className="mb-3">
                            <h4 className="m-0 mb-2"><i className="pi pi-verified mr-2" />Validation des Fermetures</h4>
                            <div className="grid mb-3">
                                <div className="col-4">
                                    <div className="p-3 border-round text-center surface-100">
                                        <div className="text-500 text-sm mb-1">Guichets Fermes</div>
                                        <div className="text-xl font-bold">{branchClosingStatus.guichetsFermes}/{branchClosingStatus.totalGuichets}</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className={`p-3 border-round text-center ${branchClosingStatus.allValidated ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                        <div className="text-500 text-sm mb-1">Valides</div>
                                        <div className="text-xl font-bold">{branchClosingStatus.guichetsValides}/{branchClosingStatus.totalGuichets}</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className={`p-3 border-round text-center ${branchClosingStatus.readyForAccounting ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <div className="text-500 text-sm mb-1">Pret pour comptabilisation</div>
                                        <div className="text-xl font-bold">{branchClosingStatus.readyForAccounting ? 'OUI' : 'NON'}</div>
                                    </div>
                                </div>
                            </div>

                            <DataTable value={branchClosingStatus.guichets || []} size="small" showGridlines stripedRows>
                                <Column field="codeCaisse" header="Code" />
                                <Column field="agentName" header="Agent" />
                                <Column header="Statut" body={(row: any) => (
                                    <Tag value={row.status === 'OPEN' ? 'OUVERTE' : 'FERMEE'}
                                         severity={row.status === 'OPEN' ? 'success' : 'warning'} />
                                )} />
                                <Column header="Validation" body={(row: any) => {
                                    if (row.status !== 'CLOSED') return <Tag value="--" severity="secondary" />;
                                    if (row.closingStatus === 'VALIDATED') return <Tag value="VALIDEE" severity="success" icon="pi pi-check" />;
                                    return (
                                        <div className="flex gap-1">
                                            <Button icon="pi pi-check" severity="success" size="small" text
                                                onClick={() => handleValidateClosing(String(row.caisseId))}
                                                tooltip="Valider" loading={validateLoading} />
                                            <Button icon="pi pi-times" severity="danger" size="small" text
                                                onClick={() => setRejectDialog({ visible: true, caisseId: String(row.caisseId), reason: '' })}
                                                tooltip="Rejeter" />
                                        </div>
                                    );
                                }} />
                                <Column header="Solde" body={(row: any) => formatNumber(row.soldeActuel) + ' FBu'} style={{ textAlign: 'right' }} />
                            </DataTable>
                        </div>
                    )}

                    {/* Reject Dialog */}
                    <Dialog header="Motif de rejet" visible={rejectDialog.visible} style={{ width: '30rem' }}
                        onHide={() => setRejectDialog({ visible: false, caisseId: '', reason: '' })}>
                        <div className="field">
                            <label className="font-semibold">Motif</label>
                            <InputTextarea value={rejectDialog.reason} onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
                                rows={3} className="w-full" placeholder="Indiquez le motif du rejet..." />
                        </div>
                        <div className="flex justify-content-end gap-2">
                            <Button label="Annuler" severity="secondary" text onClick={() => setRejectDialog({ visible: false, caisseId: '', reason: '' })} />
                            <Button label="Rejeter" severity="danger" icon="pi pi-times" onClick={handleRejectClosing} loading={validateLoading} />
                        </div>
                    </Dialog>
                </div>
            )}

            {myCaisse && (
                <>
                    {/* Status banner */}
                    <div className={`mb-3 p-3 border-round flex align-items-center justify-content-between ${myCaisse.status === 'OPEN' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}
                         style={{ border: '1px solid' }}>
                        <div className="flex align-items-center gap-3">
                            <Tag
                                value={myCaisse.status === 'OPEN' ? 'OUVERTE' : 'FERMEE'}
                                severity={myCaisse.status === 'OPEN' ? 'success' : 'warning'}
                                icon={myCaisse.status === 'OPEN' ? 'pi pi-lock-open' : 'pi pi-lock'}
                            />
                            <span className="font-bold text-xl">{myCaisse.codeCaisse}</span>
                            <span className="text-600">{myCaisse.libelle}</span>
                            <Tag value={myCaisse.typeCaisse} severity="info" />
                            {myCaisse.status === 'CLOSED' && myCaisse.closingStatus === 'VALIDATED' && (
                                <Tag value="VALIDEE" severity="success" icon="pi pi-check-circle" />
                            )}
                            {myCaisse.status === 'CLOSED' && myCaisse.closingStatus === 'CLOSED' && (
                                <Tag value="EN ATTENTE" severity="warning" icon="pi pi-clock" />
                            )}
                        </div>
                        <div className="flex align-items-center gap-3">
                            <span className="text-600">Compte: <strong>{myCaisse.compteComptable}</strong></span>
                            <span className="text-primary font-bold text-xl">
                                Solde: {formatNumber(myCaisse.soldeActuel)} FBu
                            </span>
                            {myCaisse.caisseId && (
                                <Button
                                    label="Changer"
                                    icon="pi pi-refresh"
                                    severity="secondary"
                                    text
                                    size="small"
                                    onClick={() => setMyCaisse(null)}
                                />
                            )}
                        </div>
                    </div>

                    <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                        {/* ==================== Tab 1: Ma Caisse (Open/Close) ==================== */}
                        <TabPanel header="Ma Caisse" leftIcon="pi pi-home mr-2">
                            <div className="grid">
                                {/* Billetage actuel */}
                                <div className="col-12 md:col-7">
                                    <div className="flex align-items-center justify-content-between mb-2">
                                        <h4 className="m-0">Billetage actuel</h4>
                                        <Button
                                            icon="pi pi-refresh"
                                            severity="secondary"
                                            text
                                            size="small"
                                            onClick={() => {
                                                const token = Cookies.get('token');
                                                if (token && myCaisse) {
                                                    fetch(`${BASE_URL}/billetage/latest/${myCaisse.caisseId}`, {
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    }).then(res => res.ok && res.status !== 204 ? res.text() : null)
                                                    .then(text => {
                                                        if (text && text.trim()) {
                                                            setBilletageDetails(prev => ({ ...prev, [String(myCaisse.caisseId)]: JSON.parse(text) as CptCashCount }));
                                                        }
                                                    }).catch(() => { /* ignore */ });
                                                }
                                            }}
                                            tooltip="Actualiser le billetage"
                                        />
                                    </div>
                                    {(() => {
                                        const detail = billetageDetails[String(myCaisse.caisseId)];
                                        const hasBilletage = detail && detail.totalPhysique != null;
                                        if (hasBilletage) {
                                            return (
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
                                                            <span className="font-medium">{formatNumber(d.value)} FBu</span>
                                                        )} style={{ width: '40%' }} />
                                                        <Column header="Quantite" body={(d: any) => (
                                                            <span className="font-semibold">{(detail as any)[d.field] || 0}</span>
                                                        )} style={{ textAlign: 'center', width: '25%' }} />
                                                        <Column header="Montant (FBu)" body={(d: any) => (
                                                            <span className="font-bold text-primary">{formatNumber(((detail as any)[d.field] || 0) * d.value)} FBu</span>
                                                        )} style={{ textAlign: 'right', width: '35%' }} />
                                                    </DataTable>
                                                </>
                                            );
                                        }
                                        return (
                                            <div className="text-center p-4 surface-100 border-round">
                                                <i className="pi pi-inbox text-3xl text-400 mb-2" style={{ display: 'block' }}></i>
                                                <span className="text-500">Aucun billetage enregistre</span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Summary */}
                                <div className="col-12 md:col-5">
                                    {(() => {
                                        const detail = billetageDetails[String(myCaisse.caisseId)];
                                        const totalPhysique = detail?.totalPhysique ?? 0;
                                        const soldeTheorique = myCaisse.soldeActuel || 0;
                                        const ecart = totalPhysique - soldeTheorique;
                                        return (
                                            <div className="p-3 surface-100 border-round mb-3">
                                                <h4 className="mt-0">Resume du billetage</h4>
                                                <div className="flex justify-content-between mb-2">
                                                    <span>Total physique:</span>
                                                    <span className="font-bold text-xl">{formatNumber(totalPhysique)} FBu</span>
                                                </div>
                                                <div className="flex justify-content-between mb-2">
                                                    <span>Solde theorique:</span>
                                                    <span className="font-bold">{formatNumber(soldeTheorique)} FBu</span>
                                                </div>
                                                <hr />
                                                <div className="flex justify-content-between">
                                                    <span>Ecart:</span>
                                                    <span className={`font-bold ${Math.abs(ecart) > 0.01 ? 'text-red-500' : 'text-green-600'}`}>
                                                        {formatNumber(ecart)} FBu
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {(() => {
                                        const detail = billetageDetails[String(myCaisse.caisseId)];
                                        return detail?.notes ? (
                                            <div className="mb-3 text-sm text-600">
                                                <i className="pi pi-comment mr-1"></i>{detail.notes}
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* Agency status banner for guichetiers (child caisses) */}
                                    {myCaisse.status === 'CLOSED' && myCaisse.parentCaisseId && agencyStatus?.agencyOpen === false && (
                                        <div className="p-3 mb-3 border-round bg-red-50 border-red-200" style={{ border: '1px solid' }}>
                                            <div className="flex align-items-center gap-2">
                                                <i className="pi pi-ban text-red-500 text-xl" />
                                                <div>
                                                    <div className="font-bold text-red-700">Journee non ouverte</div>
                                                    <div className="text-red-600 text-sm">
                                                        La journee n'est pas encore ouverte par le chef d'agence
                                                        {agencyStatus?.parentAgent ? ` (${agencyStatus.parentAgent})` : ''}.
                                                        Veuillez attendre l'ouverture.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Children status panel for managers (parent caisses) */}
                                    {isManager && myCaisse?.status === 'OPEN' && agencyStatus?.children && (
                                        <div className="p-3 mb-3 border-round surface-100">
                                            <div className="flex align-items-center justify-content-between mb-2">
                                                <span className="font-bold">Statut des guichetiers</span>
                                                <div className="flex align-items-center gap-2">
                                                    <Tag
                                                        value={`${agencyStatus.closedChildrenCount || 0}/${(agencyStatus.openChildrenCount || 0) + (agencyStatus.closedChildrenCount || 0)} fermees`}
                                                        severity={agencyStatus.allChildrenClosed ? 'success' : 'warning'}
                                                    />
                                                    <Button
                                                        icon="pi pi-refresh"
                                                        severity="secondary"
                                                        text
                                                        size="small"
                                                        onClick={() => myCaisse && fetchAgency(null, 'GET', BASE_URL + '/agency-status/' + myCaisse.caisseId, 'agency-status')}
                                                        tooltip="Actualiser"
                                                    />
                                                </div>
                                            </div>
                                            <DataTable value={agencyStatus.children} size="small" showGridlines>
                                                <Column field="codeCaisse" header="Code" />
                                                <Column field="agentName" header="Agent" />
                                                <Column header="Statut" body={(row: any) => (
                                                    <Tag value={row.status === 'OPEN' ? 'OUVERTE' : 'FERMEE'}
                                                         severity={row.status === 'OPEN' ? 'success' : 'warning'}
                                                         icon={row.status === 'OPEN' ? 'pi pi-lock-open' : 'pi pi-lock'} />
                                                )} />
                                                <Column header="Solde" body={(row: any) => formatNumber(row.soldeActuel) + ' FBu'} style={{ textAlign: 'right' }} />
                                            </DataTable>
                                            {!agencyStatus.allChildrenClosed && (
                                                <div className="mt-2 p-2 border-round bg-yellow-50 border-yellow-200 text-yellow-700 text-sm" style={{ border: '1px solid' }}>
                                                    <i className="pi pi-exclamation-triangle mr-1" />
                                                    Tous les guichetiers doivent fermer leur caisse avant de fermer la journee.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-3">
                                        {myCaisse.status === 'CLOSED' ? (
                                            <Button
                                                label="Ouvrir la Caisse"
                                                icon="pi pi-lock-open"
                                                severity="success"
                                                className="w-full"
                                                onClick={handleOpenCaisse}
                                                loading={operationLoading}
                                                disabled={(myCaisse.parentCaisseId != null && agencyStatus?.agencyOpen === false) || myCaisse.closingStatus === 'VALIDATED'}
                                                tooltip={myCaisse.closingStatus === 'VALIDATED' ? 'Fermeture deja validee par le chef d\'agence' : myCaisse.parentCaisseId != null && agencyStatus?.agencyOpen === false ? 'La journee doit etre ouverte par le chef d\'agence' : undefined}
                                            />
                                        ) : (
                                            <Button
                                                label="Fermer la Caisse"
                                                icon="pi pi-lock"
                                                severity="danger"
                                                className="w-full"
                                                onClick={handleCloseCaisse}
                                                loading={operationLoading}
                                                disabled={isManager && agencyStatus?.allChildrenClosed === false}
                                                tooltip={isManager && agencyStatus?.allChildrenClosed === false ? 'Tous les guichetiers doivent fermer leur caisse' : undefined}
                                            />
                                        )}
                                    </div>

                                    {/* Pending receipts section (caissier or chef d'agence acknowledges incoming transfers) */}
                                    {pendingReceipts.length > 0 && (
                                        <div className="mt-3 p-3 border-round" style={{ border: '1px solid var(--orange-200)', background: 'var(--orange-50)' }}>
                                            <div className="flex align-items-center justify-content-between mb-3">
                                                <div className="flex align-items-center gap-2">
                                                    <i className="pi pi-bell text-orange-500 text-xl" />
                                                    <h5 className="m-0 text-orange-700">Fonds en attente de reception - {myCaisse?.codeCaisse}</h5>
                                                </div>
                                                <Tag value={`${pendingReceipts.length} en attente`} severity="warning" />
                                            </div>
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
                                                        label="Accuser reception"
                                                        icon="pi pi-check"
                                                        severity="success"
                                                        size="small"
                                                        onClick={() => handleAcknowledgeReceipt(row)}
                                                        loading={ackLoading}
                                                    />
                                                )} />
                                            </DataTable>
                                        </div>
                                    )}

                                    {/* Closing comparison panel (visible when caisse is CLOSED) */}
                                    {myCaisse.status === 'CLOSED' && closingComparison && (
                                        <div className="mt-3 p-3 border-round surface-100" style={{ border: '1px solid var(--surface-border)' }}>
                                            <h5 className="mt-0 mb-3">
                                                <i className="pi pi-chart-line mr-2" />
                                                Comparaison Journaliere - {formatDate(closingComparison.date || toApiDate(new Date()))}
                                            </h5>
                                            <div className="flex justify-content-between mb-2">
                                                <span>Solde Ouverture (physique)</span>
                                                <span className="font-bold">{formatNumber(closingComparison.soldeOuverture)} FBu</span>
                                            </div>
                                            {closingComparison.totalDeposits > 0 && (
                                                <div className="flex justify-content-between mb-2">
                                                    <span className="text-green-600">+ Depots Clients</span>
                                                    <span className="font-bold text-green-600">{formatNumber(closingComparison.totalDeposits)} FBu</span>
                                                </div>
                                            )}
                                            {closingComparison.totalWithdrawals > 0 && (
                                                <div className="flex justify-content-between mb-2">
                                                    <span className="text-red-600">- Retraits Clients</span>
                                                    <span className="font-bold text-red-600">-{formatNumber(closingComparison.totalWithdrawals)} FBu</span>
                                                </div>
                                            )}
                                            {closingComparison.totalTransfersIn > 0 && (
                                                <div className="flex justify-content-between mb-2">
                                                    <span className="text-green-600">+ Virements Entrants</span>
                                                    <span className="font-bold text-green-600">{formatNumber(closingComparison.totalTransfersIn)} FBu</span>
                                                </div>
                                            )}
                                            {closingComparison.totalTransfersOut > 0 && (
                                                <div className="flex justify-content-between mb-2">
                                                    <span className="text-red-600">- Virements Sortants</span>
                                                    <span className="font-bold text-red-600">-{formatNumber(closingComparison.totalTransfersOut)} FBu</span>
                                                </div>
                                            )}
                                            <hr />
                                            <div className="flex justify-content-between mb-2">
                                                <span className="font-semibold">= Solde Theorique Fermeture</span>
                                                <span className="font-bold text-xl">{formatNumber(closingComparison.soldeFermetureTheorique)} FBu</span>
                                            </div>
                                            <div className="flex justify-content-between mb-2">
                                                <span>Solde Physique Fermeture</span>
                                                <span className="font-bold">{formatNumber(closingComparison.soldeFermeturePhysique)} FBu</span>
                                            </div>
                                            <hr />
                                            <div className="flex justify-content-between mb-2">
                                                <span className="font-semibold">Ecart</span>
                                                <span className={`font-bold text-xl ${closingComparison.ecart !== 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {formatNumber(closingComparison.ecart)} FBu
                                                </span>
                                            </div>
                                            <div className="flex align-items-center justify-content-between mt-3 p-2 border-round"
                                                 style={{ backgroundColor: closingComparison.validationStatus === 'VALIDATED' ? 'var(--green-50)' : closingComparison.validationStatus === 'REJECTED' ? 'var(--red-50)' : 'var(--yellow-50)' }}>
                                                <span className="font-semibold">Statut:</span>
                                                <Tag
                                                    value={closingComparison.validationStatus === 'VALIDATED' ? 'VALIDEE' : closingComparison.validationStatus === 'REJECTED' ? 'REJETEE' : 'EN ATTENTE DE VALIDATION'}
                                                    severity={closingComparison.validationStatus === 'VALIDATED' ? 'success' : closingComparison.validationStatus === 'REJECTED' ? 'danger' : 'warning'}
                                                    icon={closingComparison.validationStatus === 'VALIDATED' ? 'pi pi-check-circle' : closingComparison.validationStatus === 'REJECTED' ? 'pi pi-times-circle' : 'pi pi-clock'}
                                                />
                                            </div>
                                            {/* Consolidation feedback */}
                                            {closingComparison.validationStatus === 'VALIDATED' && closingComparison.consolidationAmount > 0 && (
                                                <div className="mt-2 p-2 border-round bg-blue-50 text-blue-700 text-sm" style={{ border: '1px solid var(--blue-200)' }}>
                                                    <i className="pi pi-info-circle mr-1" />
                                                    <strong>Consolidation:</strong> {formatNumber(closingComparison.consolidationAmount)} FBu transferes vers {closingComparison.parentCaisseCode || 'Caisse Agence'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabPanel>

                        {/* ==================== Tab: Ouverture / Fermeture (Managers only) ==================== */}
                        {isManager && (
                            <TabPanel header="Ouverture / Fermeture" leftIcon="pi pi-lock-open mr-2">
                                <div className="grid">
                                    {/* Caisse selection */}
                                    <div className="col-12 md:col-4">
                                        <div className="field">
                                            <label className="font-semibold">Selectionner une caisse</label>
                                            <Dropdown
                                                value={ofSelectedCaisse}
                                                options={allCaisses.filter(c => {
                                                    if (!c.actif) return false;
                                                    // Chef d'agence: only show caisses from their branch
                                                    if (currentUserInfo?.isChef && !currentUserInfo?.isSuperAdmin && currentUserInfo?.branchId) {
                                                        return String(c.branchId) === currentUserInfo.branchId;
                                                    }
                                                    return true;
                                                })}
                                                onChange={(e) => handleOfSelectCaisse(e.value)}
                                                optionLabel="codeCaisse"
                                                placeholder="Choisir une caisse"
                                                className="w-full"
                                                filter
                                                filterBy="codeCaisse,libelle,agentName"
                                                itemTemplate={(option: CptCaisse) => (
                                                    <div className="flex justify-content-between align-items-center">
                                                        <span>{option.codeCaisse} - {option.libelle} ({option.agentName || 'N/A'})</span>
                                                        <Tag value={option.status === 'OPEN' ? 'Ouverte' : 'Fermee'} severity={option.status === 'OPEN' ? 'success' : 'danger'} />
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {ofSelectedCaisse && (() => {
                                        const isParentCaisse = ['AGENCE', 'CHEF_AGENCE', 'SIEGE'].includes(ofSelectedCaisse.typeCaisse);
                                        const summary = ofDailySummaries[String(ofSelectedCaisse.caisseId)];
                                        const isOpening = ofSelectedCaisse.status !== 'OPEN';
                                        const theorique = ofSelectedCaisse.soldeActuel ?? 0;
                                        const ofTotal = ofCalculateTotal();
                                        const ecart = ofTotal - theorique;
                                        const hasEnteredCount = ofTotal > 0;
                                        const ecartTolerance = isOpening ? 0 : theorique * 0.001;
                                        const ecartOk = Math.abs(ecart) <= ecartTolerance;
                                        const ecartSignificant = !ecartOk && hasEnteredCount;
                                        const notProvisioned = theorique === 0 && isOpening;
                                        const canOpen = isOpening ? (ecartOk && (hasEnteredCount || theorique === 0)) : false;
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
                                                            ou d'abord la provisionner via Distribution de Fonds.
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
                                                            <span className="font-bold text-green-800">Caisse provisionnee — Comptage physique</span>
                                                        </div>
                                                        <div className="text-sm text-green-700">
                                                            Montant theorique : <strong>{formatNumber(theorique)} FBu</strong>.
                                                            Comptez les especes physiquement. L'ecart doit etre <strong>zero</strong> pour ouvrir la caisse.
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
                                                                {ofSelectedCaisse.typeCaisse === 'SIEGE' ? 'Caisse Siege (Coffre Principal)' : 'Caisse Agence (Coffre)'}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-blue-700">
                                                            Fermeture : Comptez les especes restantes dans le coffre apres toutes les operations de la journee.
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
                                                            <span className="font-bold">{ofSelectedCaisse.codeCaisse} - {ofSelectedCaisse.libelle}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-500">Agent: </span>
                                                            <span className="font-bold">{ofSelectedCaisse.agentName || 'N/A'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-500">Statut: </span>
                                                            <Tag value={ofSelectedCaisse.status === 'OPEN' ? 'Ouverte' : 'Fermee'} severity={ofSelectedCaisse.status === 'OPEN' ? 'success' : 'danger'} />
                                                        </div>
                                                        <div>
                                                            <span className="text-500">Solde theorique: </span>
                                                            <span className={`font-bold ${notProvisioned ? 'text-red-600' : 'text-blue-700'}`}>{formatNumber(theorique)} FBu</span>
                                                        </div>
                                                        {ofSelectedCaisse.plafond > 0 && (
                                                            <div>
                                                                <span className="text-500">Plafond: </span>
                                                                <span className="font-bold">{formatNumber(ofSelectedCaisse.plafond)} FBu</span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-500">Type: </span>
                                                            <Tag value={ofSelectedCaisse.typeCaisse} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Billetage actuel */}
                                            <div className="col-12 md:col-8">
                                                <div className="flex align-items-center justify-content-between mb-2">
                                                    <h5 className="m-0">
                                                        <i className="pi pi-money-bill mr-2"></i>
                                                        Billetage — {isOpening ? 'Ouverture' : 'Fermeture'}
                                                    </h5>
                                                    <Button
                                                        icon="pi pi-refresh"
                                                        severity="secondary"
                                                        text
                                                        size="small"
                                                        onClick={() => {
                                                            const token = Cookies.get('token');
                                                            if (token && ofSelectedCaisse) {
                                                                fetch(`${BASE_URL}/billetage/latest/${ofSelectedCaisse.caisseId}`, {
                                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                                }).then(res => res.ok && res.status !== 204 ? res.text() : null)
                                                                .then(text => {
                                                                    if (text && text.trim()) {
                                                                        setBilletageDetails(prev => ({ ...prev, [String(ofSelectedCaisse.caisseId)]: JSON.parse(text) as CptCashCount }));
                                                                    }
                                                                }).catch(() => { /* ignore */ });
                                                            }
                                                        }}
                                                        tooltip="Actualiser le billetage"
                                                    />
                                                </div>
                                                {(() => {
                                                    const detail = billetageDetails[String(ofSelectedCaisse.caisseId)];
                                                    const hasBilletage = detail && detail.totalPhysique != null;
                                                    if (hasBilletage) {
                                                        return (
                                                            <>
                                                                <div className="text-xs text-400 mb-2">
                                                                    <i className="pi pi-clock mr-1"></i>
                                                                    {formatDateTime(detail.countDate || detail.createdAt)}
                                                                    {detail.countedBy && <span> — par {detail.countedBy}</span>}
                                                                </div>
                                                                <DataTable value={DENOMINATIONS.filter(d => ((detail as any)[d.field] || 0) > 0)} size="small" showGridlines
                                                                    emptyMessage="Aucune denomination enregistree"
                                                                    footer={
                                                                        <div className="flex justify-content-between">
                                                                            <span className="font-bold">Total physique</span>
                                                                            <span className="font-bold text-green-600">{formatNumber(detail.totalPhysique)} FBu</span>
                                                                        </div>
                                                                    }>
                                                                    <Column header="Denomination" body={(d: any) => (
                                                                        <span className="font-medium">{formatNumber(d.value)} FBu</span>
                                                                    )} style={{ width: '35%' }} />
                                                                    <Column header="Quantite" body={(d: any) => (
                                                                        <span className="font-semibold">{(detail as any)[d.field] || 0}</span>
                                                                    )} style={{ textAlign: 'center', width: '25%' }} />
                                                                    <Column header="Montant (FBu)" body={(d: any) => (
                                                                        <span className="font-bold text-primary">{formatNumber(((detail as any)[d.field] || 0) * d.value)} FBu</span>
                                                                    )} style={{ textAlign: 'right', width: '40%' }} />
                                                                </DataTable>
                                                                {detail.notes && (
                                                                    <div className="mt-2 text-sm text-600">
                                                                        <i className="pi pi-comment mr-1"></i>{detail.notes}
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    }
                                                    return (
                                                        <div className="text-center p-4 surface-100 border-round">
                                                            <i className="pi pi-inbox text-3xl text-400 mb-2" style={{ display: 'block' }}></i>
                                                            <span className="text-500">Aucun billetage enregistre</span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Summary and action */}
                                            <div className="col-12 md:col-4">
                                                <h5 className="mb-3">Resume du billetage</h5>
                                                {(() => {
                                                    const detail = billetageDetails[String(ofSelectedCaisse.caisseId)];
                                                    const totalPhysique = detail?.totalPhysique ?? 0;
                                                    const billetageEcart = totalPhysique - theorique;
                                                    const billetageEcartOk = Math.abs(billetageEcart) < 0.01;
                                                    return (
                                                        <div className="surface-card shadow-1 p-3 border-round mb-3">
                                                            <div className="mb-3">
                                                                <div className="text-500 text-sm mb-1">
                                                                    <i className="pi pi-money-bill mr-1"></i>
                                                                    Total Physique (billetage)
                                                                </div>
                                                                <div className={`font-bold text-2xl ${totalPhysique > 0 ? 'text-blue-600' : 'text-400'}`}>
                                                                    {formatNumber(totalPhysique)} FBu
                                                                </div>
                                                            </div>
                                                            <div className="mb-3">
                                                                <div className="text-500 text-sm mb-1">
                                                                    <i className="pi pi-send mr-1"></i>
                                                                    Total Theorique
                                                                </div>
                                                                <div className={`font-bold text-2xl ${notProvisioned ? 'text-red-400' : 'text-800'}`}>
                                                                    {formatNumber(theorique)} FBu
                                                                </div>
                                                            </div>
                                                            <hr />
                                                            <div className="mt-2">
                                                                <div className="text-500 text-sm mb-1">
                                                                    Ecart (Physique - Theorique)
                                                                </div>
                                                                <div className={`font-bold text-xl ${billetageEcartOk ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {billetageEcart >= 0 ? '+' : ''}{formatNumber(billetageEcart)} FBu
                                                                    {billetageEcartOk
                                                                        ? <i className="pi pi-check-circle ml-2 text-green-500"></i>
                                                                        : <i className="pi pi-times-circle ml-2 text-red-500"></i>
                                                                    }
                                                                </div>
                                                            </div>

                                                            {billetageEcartOk && (
                                                                <div className="mt-2 p-2 border-round text-xs" style={{ background: '#E8F5E9', color: '#1B5E20', borderLeft: '3px solid #2E7D32' }}>
                                                                    <i className="pi pi-check-circle mr-1"></i>
                                                                    <strong>Billetage correct.</strong> {isOpening ? 'Vous pouvez ouvrir la caisse.' : 'Vous pouvez fermer la caisse.'}
                                                                </div>
                                                            )}
                                                            {!billetageEcartOk && totalPhysique > 0 && (
                                                                <div className="mt-2 p-2 border-round text-xs" style={{ background: '#FFF3E0', color: '#E65100', borderLeft: '3px solid #F57C00' }}>
                                                                    <i className="pi pi-exclamation-triangle mr-1"></i>
                                                                    Ecart detecte : <strong>{formatNumber(billetageEcart)} FBu</strong>.
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                <div className="flex gap-2">
                                                    {isOpening && (
                                                        <Button
                                                            label="Ouvrir la Caisse"
                                                            icon="pi pi-lock-open"
                                                            severity="success"
                                                            className="w-full"
                                                            onClick={handleOfOpen}
                                                            loading={ofOperationLoading && ofOperationCallType === 'of-open'}
                                                        />
                                                    )}
                                                    {!isOpening && (
                                                        <Button
                                                            label="Fermer la Caisse"
                                                            icon="pi pi-lock"
                                                            severity="warning"
                                                            className="w-full"
                                                            onClick={handleOfClose}
                                                            loading={ofOperationLoading && ofOperationCallType === 'of-close'}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                        );
                                    })()}
                                </div>
                            </TabPanel>
                        )}

                        {/* ==================== Tab 2: Distribution de Fonds (Managers only) ==================== */}
                        {isManager && (
                            <TabPanel header="Distribution de Fonds" leftIcon="pi pi-send mr-2">
                                <div className="grid">
                                    {/* Transfer form */}
                                    <div className="col-12 md:col-5">
                                        <Card title="Virement Interne">
                                            <div className="field">
                                                <label className="font-semibold">Source</label>
                                                <InputText
                                                    value={`${myCaisse.codeCaisse} - ${myCaisse.libelle} (Solde: ${formatNumber(myCaisse.soldeActuel)} FBu)`}
                                                    disabled
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="field">
                                                <label className="font-semibold">Destination *</label>
                                                <Dropdown
                                                    value={transferDest}
                                                    options={[
                                                        // Include parent caisse only if it belongs to the same branch (not SIEGE for chef d'agence)
                                                        ...(myCaisse.parentCaisseId
                                                            ? allCaisses.filter(c => c.caisseId === myCaisse.parentCaisseId && c.branchId === myCaisse.branchId)
                                                            : []),
                                                        // Include child caisses from same branch (for fund distribution)
                                                        ...childCaisses.filter(c => c.branchId === myCaisse.branchId)
                                                    ]}
                                                    onChange={(e) => setTransferDest(e.value)}
                                                    optionValue="caisseId"
                                                    optionLabel="codeCaisse"
                                                    placeholder="Selectionnez une caisse"
                                                    className="w-full"
                                                    filter
                                                    itemTemplate={(option: CptCaisse) => (
                                                        <div className="flex justify-content-between w-full">
                                                            <span>{option.codeCaisse} - {option.libelle}</span>
                                                            <div className="flex gap-1">
                                                                {myCaisse.parentCaisseId && option.caisseId === myCaisse.parentCaisseId && (
                                                                    <Tag value="PARENT" severity="info" className="ml-1" />
                                                                )}
                                                                <Tag
                                                                    value={option.status === 'OPEN' ? 'OUVERTE' : 'FERMEE'}
                                                                    severity={option.status === 'OPEN' ? 'success' : 'warning'}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                            <div className="field">
                                                <label className="font-semibold">Montant (FBu) *</label>
                                                <InputNumber
                                                    value={transferMontant}
                                                    onValueChange={(e) => setTransferMontant(e.value || 0)}
                                                    mode="decimal"
                                                    locale="fr-FR"
                                                    className="w-full"
                                                    min={0}
                                                />
                                            </div>
                                            <div className="field">
                                                <label className="font-semibold">Libelle</label>
                                                <InputText
                                                    value={transferLibelle}
                                                    onChange={(e) => setTransferLibelle(e.target.value)}
                                                    className="w-full"
                                                    placeholder="Distribution de fonds"
                                                />
                                            </div>
                                            {/* Billetage inline for transfer */}
                                            {transferDest && transferMontant > 0 && (
                                                <div className="mt-2 p-3 border-round" style={{ border: '1px solid var(--blue-200)', background: 'var(--blue-50)' }}>
                                                    <div className="flex align-items-center justify-content-between mb-2">
                                                        <h6 className="m-0"><i className="pi pi-money-bill mr-1 text-blue-600"></i>Billets a transferer</h6>
                                                        <span className={`font-bold text-sm ${Math.abs(calculateTransferBilletageTotal() - transferMontant) < 0.01 && calculateTransferBilletageTotal() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {formatNumber(calculateTransferBilletageTotal())} / {formatNumber(transferMontant)} FBu
                                                        </span>
                                                    </div>
                                                    <DataTable value={DENOMINATIONS} size="small" showGridlines
                                                        footer={
                                                            <div className="flex justify-content-between align-items-center">
                                                                <span className="font-bold">TOTAL</span>
                                                                <span className={`font-bold ${Math.abs(calculateTransferBilletageTotal() - transferMontant) < 0.01 && calculateTransferBilletageTotal() > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                                                    {formatNumber(calculateTransferBilletageTotal())} FBu
                                                                </span>
                                                            </div>
                                                        }
                                                    >
                                                        <Column header="Denomination" body={(d: any) => (
                                                            <span className="font-medium">{formatNumber(d.value)} FBu</span>
                                                        )} style={{ width: '100px' }} />
                                                        <Column header="Qte" body={(d: any) => (
                                                            <InputNumber
                                                                value={(transferBilletage as any)[d.field] || 0}
                                                                onValueChange={(e) => handleTransferBilletageChange(d.field, e.value || 0)}
                                                                min={0}
                                                                showButtons
                                                                buttonLayout="horizontal"
                                                                incrementButtonIcon="pi pi-plus"
                                                                decrementButtonIcon="pi pi-minus"
                                                                inputStyle={{ textAlign: 'center', fontWeight: 600, width: '50px' }}
                                                            />
                                                        )} style={{ width: '150px' }} />
                                                        <Column header="Sous-total" body={(d: any) => (
                                                            <span className="font-bold text-primary">{formatNumber(((transferBilletage as any)[d.field] || 0) * d.value)} FBu</span>
                                                        )} style={{ textAlign: 'right' }} />
                                                    </DataTable>
                                                </div>
                                            )}
                                            <Button
                                                label="Effectuer le Virement"
                                                icon="pi pi-send"
                                                className="w-full mt-2"
                                                onClick={handleTransfer}
                                                loading={transferLoading}
                                                disabled={!transferDest || transferMontant <= 0 || Math.abs(calculateTransferBilletageTotal() - transferMontant) > 0.01}
                                            />
                                        </Card>
                                    </div>

                                    {/* Children caisses overview */}
                                    <div className="col-12 md:col-7">
                                        <h4>Guichets sous votre responsabilite</h4>
                                        <DataTable value={childCaisses} size="small" showGridlines emptyMessage="Aucun guichet rattache">
                                            <Column field="codeCaisse" header="Code" sortable style={{ width: '15%' }} />
                                            <Column field="libelle" header="Libelle" style={{ width: '25%' }} />
                                            <Column field="agentName" header="Agent" style={{ width: '20%' }} />
                                            <Column
                                                field="soldeActuel"
                                                header="Solde (FBu)"
                                                body={(r: CptCaisse) => formatNumber(r.soldeActuel)}
                                                style={{ width: '15%', textAlign: 'right' }}
                                                sortable
                                            />
                                            <Column field="compteComptable" header="Compte" style={{ width: '10%' }} />
                                            <Column
                                                field="status"
                                                header="Statut"
                                                body={(r: CptCaisse) => (
                                                    <Tag
                                                        value={r.status === 'OPEN' ? 'OUVERTE' : 'FERMEE'}
                                                        severity={r.status === 'OPEN' ? 'success' : 'warning'}
                                                    />
                                                )}
                                                style={{ width: '15%' }}
                                            />
                                        </DataTable>
                                    </div>
                                </div>
                            </TabPanel>
                        )}

                        {/* ==================== Tab 3: Situation Journaliere ==================== */}
                        <TabPanel header="Situation Journaliere" leftIcon="pi pi-chart-bar mr-2">
                            <div className="mb-3 flex align-items-center gap-3">
                                <label className="font-semibold">Date:</label>
                                <Calendar
                                    value={summaryDate}
                                    onChange={(e) => {
                                        const d = e.value as Date;
                                        setSummaryDate(d);
                                        if (myCaisse) {
                                            loadDailySummary(myCaisse.caisseId, toApiDate(d));
                                            if (isManager) loadBranchSummary(myCaisse.caisseId, toApiDate(d));
                                        }
                                    }}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                />
                            </div>

                            {dailySummary && (
                                <>
                                    {/* Summary cards - row 1: Solde & Transfers */}
                                    <div className="grid mb-3">
                                        <div className="col-12 md:col-3">
                                            <div className="p-3 surface-100 border-round text-center">
                                                <div className="text-500 mb-1">Solde Actuel</div>
                                                <div className="text-primary font-bold text-xl">{formatNumber(dailySummary.soldeActuel)} FBu</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="p-3 bg-green-50 border-round text-center">
                                                <div className="text-500 mb-1">Virements Entrants</div>
                                                <div className="text-green-600 font-bold text-xl">{formatNumber(dailySummary.totalTransfersIn)} FBu</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="p-3 bg-red-50 border-round text-center">
                                                <div className="text-500 mb-1">Virements Sortants</div>
                                                <div className="text-red-600 font-bold text-xl">{formatNumber(dailySummary.totalTransfersOut)} FBu</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="p-3 surface-100 border-round text-center">
                                                <div className="text-500 mb-1">Plafond</div>
                                                <div className="font-bold text-xl">{formatNumber(dailySummary.plafond)} FBu</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary cards - row 2: Client Operations */}
                                    <div className="grid mb-3">
                                        <div className="col-12 md:col-4">
                                            <div className="p-3 bg-blue-50 border-round text-center">
                                                <div className="text-500 mb-1"><i className="pi pi-arrow-down mr-1" />Depots Clients</div>
                                                <div className="text-blue-600 font-bold text-xl">{formatNumber(dailySummary.totalClientDeposits)} FBu</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <div className="p-3 bg-orange-50 border-round text-center">
                                                <div className="text-500 mb-1"><i className="pi pi-arrow-up mr-1" />Retraits Clients</div>
                                                <div className="text-orange-600 font-bold text-xl">{formatNumber(dailySummary.totalClientWithdrawals)} FBu</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <div className="p-3 surface-100 border-round text-center">
                                                <div className="text-500 mb-1">Solde Net Client</div>
                                                <div className={`font-bold text-xl ${(dailySummary.totalClientDeposits - dailySummary.totalClientWithdrawals) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatNumber((dailySummary.totalClientDeposits || 0) - (dailySummary.totalClientWithdrawals || 0))} FBu
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Client Operations Table */}
                                    {dailySummary.clientOperations && dailySummary.clientOperations.length > 0 && (
                                        <div className="mb-3">
                                            <h5 className="text-blue-600"><i className="pi pi-users mr-2" />Operations Clients du Jour</h5>
                                            <DataTable value={dailySummary.clientOperations} size="small" showGridlines>
                                                <Column
                                                    field="type"
                                                    header="Type"
                                                    body={(r: any) => (
                                                        <Tag
                                                            value={r.type === 'DEPOT' ? 'Depot' : 'Retrait'}
                                                            severity={r.type === 'DEPOT' ? 'success' : 'warning'}
                                                            icon={r.type === 'DEPOT' ? 'pi pi-arrow-down' : 'pi pi-arrow-up'}
                                                        />
                                                    )}
                                                    style={{ width: '15%' }}
                                                />
                                                <Column field="numeroPiece" header="N Piece" style={{ width: '20%' }} />
                                                <Column field="libelle" header="Libelle" style={{ width: '35%' }} />
                                                <Column field="montant" header="Montant (FBu)" body={(r: any) => formatNumber(r.montant)} style={{ width: '15%', textAlign: 'right' }} />
                                                <Column field="date" header="Date" style={{ width: '15%' }} />
                                            </DataTable>
                                        </div>
                                    )}

                                    {/* Transfers In */}
                                    {dailySummary.transfersIn && dailySummary.transfersIn.length > 0 && (
                                        <div className="mb-3">
                                            <h5 className="text-green-600"><i className="pi pi-arrow-down mr-2" />Virements recus</h5>
                                            <DataTable value={dailySummary.transfersIn} size="small" showGridlines>
                                                <Column field="reference" header="Reference" style={{ width: '25%' }} />
                                                <Column field="codeCaisseSource" header="Source" style={{ width: '20%' }} />
                                                <Column field="montant" header="Montant (FBu)" body={(r: any) => formatNumber(r.montant)} style={{ width: '15%', textAlign: 'right' }} />
                                                <Column field="libelle" header="Libelle" style={{ width: '25%' }} />
                                                <Column field="executedAt" header="Heure" body={(r: any) => formatDateTime(r.executedAt)} style={{ width: '15%' }} />
                                            </DataTable>
                                        </div>
                                    )}

                                    {/* Transfers Out */}
                                    {dailySummary.transfersOut && dailySummary.transfersOut.length > 0 && (
                                        <div className="mb-3">
                                            <h5 className="text-red-600"><i className="pi pi-arrow-up mr-2" />Virements emis</h5>
                                            <DataTable value={dailySummary.transfersOut} size="small" showGridlines>
                                                <Column field="reference" header="Reference" style={{ width: '25%' }} />
                                                <Column field="codeCaisseDest" header="Destination" style={{ width: '20%' }} />
                                                <Column field="montant" header="Montant (FBu)" body={(r: any) => formatNumber(r.montant)} style={{ width: '15%', textAlign: 'right' }} />
                                                <Column field="libelle" header="Libelle" style={{ width: '25%' }} />
                                                <Column field="executedAt" header="Heure" body={(r: any) => formatDateTime(r.executedAt)} style={{ width: '15%' }} />
                                            </DataTable>
                                        </div>
                                    )}

                                    {(!dailySummary.transfersIn || dailySummary.transfersIn.length === 0) &&
                                     (!dailySummary.transfersOut || dailySummary.transfersOut.length === 0) &&
                                     (!dailySummary.clientOperations || dailySummary.clientOperations.length === 0) && (
                                        <p className="text-500">Aucune operation pour cette date.</p>
                                    )}
                                </>
                            )}

                            {/* Branch summary for managers */}
                            {isManager && branchSummary && (
                                <div className="mt-4">
                                    <h4><i className="pi pi-sitemap mr-2" />Vue d'ensemble - Guichets</h4>
                                    <div className="grid mb-3">
                                        <div className="col-12 md:col-2">
                                            <div className="p-3 surface-100 border-round text-center">
                                                <div className="text-500 mb-1">Guichets</div>
                                                <div className="font-bold text-xl">{branchSummary.childrenCount}</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-2">
                                            <div className="p-3 surface-100 border-round text-center">
                                                <div className="text-500 mb-1">Solde total</div>
                                                <div className="text-primary font-bold text-xl">{formatNumber(branchSummary.totalSoldeChildren)} FBu</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-2">
                                            <div className="p-3 bg-green-50 border-round text-center">
                                                <div className="text-500 mb-1">Virements In</div>
                                                <div className="text-green-600 font-bold text-xl">{formatNumber(branchSummary.totalTransfersIn)} FBu</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-2">
                                            <div className="p-3 bg-red-50 border-round text-center">
                                                <div className="text-500 mb-1">Virements Out</div>
                                                <div className="text-red-600 font-bold text-xl">{formatNumber(branchSummary.totalTransfersOut)} FBu</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-2">
                                            <div className="p-3 bg-blue-50 border-round text-center">
                                                <div className="text-500 mb-1">Depots Clients</div>
                                                <div className="text-blue-600 font-bold text-xl">{formatNumber(branchSummary.totalClientDeposits)} FBu</div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-2">
                                            <div className="p-3 bg-orange-50 border-round text-center">
                                                <div className="text-500 mb-1">Retraits Clients</div>
                                                <div className="text-orange-600 font-bold text-xl">{formatNumber(branchSummary.totalClientWithdrawals)} FBu</div>
                                            </div>
                                        </div>
                                    </div>

                                    {branchSummary.children && branchSummary.children.length > 0 && (
                                        <DataTable value={branchSummary.children} size="small" showGridlines>
                                            <Column field="codeCaisse" header="Code" style={{ width: '10%' }} />
                                            <Column field="libelle" header="Libelle" style={{ width: '16%' }} />
                                            <Column
                                                field="status"
                                                header="Statut"
                                                body={(r: any) => (
                                                    <Tag
                                                        value={r.status === 'OPEN' ? 'OUVERTE' : 'FERMEE'}
                                                        severity={r.status === 'OPEN' ? 'success' : 'warning'}
                                                    />
                                                )}
                                                style={{ width: '8%' }}
                                            />
                                            <Column field="soldeActuel" header="Solde (FBu)" body={(r: any) => formatNumber(r.soldeActuel)} style={{ width: '13%', textAlign: 'right' }} />
                                            <Column field="totalTransfersIn" header="Vir. In" body={(r: any) => formatNumber(r.totalTransfersIn)} style={{ width: '11%', textAlign: 'right' }} />
                                            <Column field="totalTransfersOut" header="Vir. Out" body={(r: any) => formatNumber(r.totalTransfersOut)} style={{ width: '11%', textAlign: 'right' }} />
                                            <Column field="totalClientDeposits" header="Depots" body={(r: any) => formatNumber(r.totalClientDeposits)} style={{ width: '11%', textAlign: 'right' }} />
                                            <Column field="totalClientWithdrawals" header="Retraits" body={(r: any) => formatNumber(r.totalClientWithdrawals)} style={{ width: '11%', textAlign: 'right' }} />
                                            <Column field="plafond" header="Plafond" body={(r: any) => formatNumber(r.plafond)} style={{ width: '9%', textAlign: 'right' }} />
                                        </DataTable>
                                    )}
                                </div>
                            )}
                        </TabPanel>

                        {/* ==================== Tab 4: Historique Transferts ==================== */}
                        <TabPanel header="Historique Transferts" leftIcon="pi pi-history mr-2">
                            <div className="flex align-items-center justify-content-between mb-3">
                                <h4 className="m-0"><i className="pi pi-history mr-2" />Historique des Virements</h4>
                                <Button
                                    icon="pi pi-refresh"
                                    severity="secondary"
                                    text
                                    onClick={() => myCaisse && loadTransferHistory(myCaisse.caisseId)}
                                    tooltip="Actualiser"
                                />
                            </div>

                            {/* Summary cards */}
                            {transfers.length > 0 && (
                                <div className="grid mb-3">
                                    <div className="col-12 md:col-4">
                                        <div className="p-3 bg-green-50 border-round text-center" style={{ border: '1px solid var(--green-200)' }}>
                                            <div className="text-500 mb-1">Termines</div>
                                            <div className="font-bold text-xl text-green-600">
                                                {transfers.filter((t: VirementInterne) => t.status === 'COMPLETED').length}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <div className="p-3 bg-orange-50 border-round text-center" style={{ border: '1px solid var(--orange-200)' }}>
                                            <div className="text-500 mb-1">En attente de confirmation</div>
                                            <div className="font-bold text-xl text-orange-600">
                                                {transfers.filter((t: VirementInterne) => t.status === 'PENDING_RECEIPT').length}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <div className="p-3 surface-100 border-round text-center" style={{ border: '1px solid var(--surface-300)' }}>
                                            <div className="text-500 mb-1">Total virements</div>
                                            <div className="font-bold text-xl text-primary">
                                                {formatNumber(transfers.reduce((sum: number, t: VirementInterne) => sum + (t.montant || 0), 0))} FBu
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <DataTable
                                value={transfers}
                                paginator
                                rows={15}
                                size="small"
                                showGridlines
                                sortField="dateVirement"
                                sortOrder={-1}
                                emptyMessage="Aucun virement trouve"
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
                                <Column field="executedBy" header="Envoye par" body={(r: VirementInterne) => (
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

                        {/* ==================== Tab 5: Mouvements (Movement History) ==================== */}
                        <TabPanel header="Mouvements" leftIcon="pi pi-list mr-2">
                            <div className="mb-3 flex align-items-center justify-content-between">
                                <h4 className="m-0"><i className="pi pi-list mr-2" />Journal des Mouvements</h4>
                                <div className="flex align-items-center gap-2">
                                    <Calendar
                                        value={movementDate}
                                        onChange={(e) => {
                                            if (e.value) {
                                                setMovementDate(e.value as Date);
                                                if (myCaisse) loadMovements(myCaisse.caisseId, toApiDate(e.value as Date));
                                            }
                                        }}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        className="w-12rem"
                                    />
                                    <Button
                                        icon="pi pi-refresh"
                                        severity="secondary"
                                        text
                                        onClick={() => myCaisse && loadMovements(myCaisse.caisseId, toApiDate(movementDate))}
                                        tooltip="Actualiser"
                                    />
                                </div>
                            </div>

                            {/* Summary cards */}
                            {movements.length > 0 && (
                                <div className="grid mb-3">
                                    <div className="col-12 md:col-4">
                                        <div className="p-3 bg-green-50 border-round text-center" style={{ border: '1px solid var(--green-200)' }}>
                                            <div className="text-500 mb-1">Total Entrees</div>
                                            <div className="font-bold text-xl text-green-600">
                                                {formatNumber(movements.reduce((sum: number, m: any) => sum + (m.entree || 0), 0))} FBu
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <div className="p-3 bg-red-50 border-round text-center" style={{ border: '1px solid var(--red-200)' }}>
                                            <div className="text-500 mb-1">Total Sorties</div>
                                            <div className="font-bold text-xl text-red-600">
                                                {formatNumber(movements.reduce((sum: number, m: any) => sum + (m.sortie || 0), 0))} FBu
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <div className="p-3 surface-100 border-round text-center" style={{ border: '1px solid var(--surface-300)' }}>
                                            <div className="text-500 mb-1">Solde Final</div>
                                            <div className="font-bold text-xl text-primary">
                                                {formatNumber(movements.length > 0 ? movements[movements.length - 1].soldeApres : 0)} FBu
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <DataTable
                                value={movements}
                                loading={movementsLoading}
                                size="small"
                                showGridlines
                                emptyMessage="Aucun mouvement trouve pour cette date"
                                rowClassName={(data: any) => ({
                                    'font-bold': data.operationType === 'CONSOLIDATION' || data.operationType === 'FERMETURE' || data.operationType === 'OUVERTURE'
                                })}
                            >
                                <Column field="heure" header="Heure" style={{ width: '10%' }} />
                                <Column
                                    field="operationType"
                                    header="Type"
                                    style={{ width: '20%' }}
                                    body={(row: any) => {
                                        const typeLabels: { [key: string]: { label: string; icon: string; color: string } } = {
                                            'OUVERTURE': { label: 'Ouverture', icon: 'pi pi-lock-open', color: 'info' },
                                            'FERMETURE': { label: 'Fermeture', icon: 'pi pi-lock', color: 'warning' },
                                            'DOTATION': { label: 'Dotation initiale', icon: 'pi pi-wallet', color: 'info' },
                                            'CREDIT': { label: 'Approvisionnement', icon: 'pi pi-download', color: 'info' },
                                            'DEBIT': { label: 'Versement', icon: 'pi pi-upload', color: 'warning' },
                                            'VIREMENT_RECU': { label: 'Virement recu', icon: 'pi pi-arrow-down', color: 'success' },
                                            'VIREMENT_EMIS': { label: 'Virement emis', icon: 'pi pi-arrow-up', color: 'danger' },
                                            'DEPOT_CLIENT': { label: 'Depot Client', icon: 'pi pi-arrow-down', color: 'success' },
                                            'RETRAIT_CLIENT': { label: 'Retrait Client', icon: 'pi pi-arrow-up', color: 'danger' },
                                            'REMBOURSEMENT': { label: 'Remboursement Credit', icon: 'pi pi-money-bill', color: 'success' },
                                            'DECAISSEMENT': { label: 'Decaissement Credit', icon: 'pi pi-send', color: 'danger' },
                                            'CONSOLIDATION': { label: 'Consolidation', icon: 'pi pi-check-circle', color: 'secondary' }
                                        };
                                        const t = typeLabels[row.operationType] || { label: row.operationType, icon: 'pi pi-circle', color: 'info' };
                                        return <Tag value={t.label} icon={t.icon} severity={t.color as any} />;
                                    }}
                                />
                                <Column field="reference" header="Reference" style={{ width: '20%' }} />
                                <Column
                                    field="entree"
                                    header="Entree (FBu)"
                                    style={{ width: '15%', textAlign: 'right' }}
                                    body={(row: any) => row.entree > 0 ? (
                                        <span className="text-green-600 font-semibold">{formatNumber(row.entree)}</span>
                                    ) : '-'}
                                />
                                <Column
                                    field="sortie"
                                    header="Sortie (FBu)"
                                    style={{ width: '15%', textAlign: 'right' }}
                                    body={(row: any) => row.sortie > 0 ? (
                                        <span className="text-red-600 font-semibold">{formatNumber(row.sortie)}</span>
                                    ) : '-'}
                                />
                                <Column
                                    field="soldeApres"
                                    header="Solde (FBu)"
                                    style={{ width: '20%', textAlign: 'right' }}
                                    body={(row: any) => <span className="font-bold">{formatNumber(row.soldeApres)}</span>}
                                />
                            </DataTable>
                        </TabPanel>

                        {/* ==================== Tab: Retour de Fonds (Caissier only) ==================== */}
                        {!isManager && myCaisse && parentCaisse && (
                            <TabPanel header="Retour de Fonds" leftIcon="pi pi-replay mr-2">
                                <div className="grid">
                                    <div className="col-12 md:col-5">
                                        <Card title="Retour de Fonds vers Caisse Agence">
                                            <div className="field">
                                                <label className="font-semibold">Source (Ma Caisse)</label>
                                                <InputText
                                                    value={`${myCaisse.codeCaisse} - ${myCaisse.libelle} (Solde: ${formatNumber(myCaisse.soldeActuel)} FBu)`}
                                                    disabled
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="field">
                                                <label className="font-semibold">Destination (Caisse Agence)</label>
                                                <InputText
                                                    value={`${parentCaisse.codeCaisse} - ${parentCaisse.libelle}`}
                                                    disabled
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="field">
                                                <label className="font-semibold">Montant a retourner (FBu)</label>
                                                <InputText
                                                    value={`${formatNumber(myCaisse.soldeActuel)} FBu (Solde total)`}
                                                    disabled
                                                    className="w-full font-bold text-blue-600"
                                                />
                                                <small className="text-500">Le solde total de la caisse sera retourne. Le solde deviendra 0 FBu.</small>
                                            </div>
                                            <div className="field">
                                                <label className="font-semibold">Libelle</label>
                                                <InputText
                                                    value={transferLibelle}
                                                    onChange={(e) => setTransferLibelle(e.target.value)}
                                                    className="w-full"
                                                    placeholder="Retour de fonds vers caisse agence"
                                                />
                                            </div>
                                            {/* Billetage for return transfer */}
                                            {(myCaisse.soldeActuel ?? 0) > 0 && (
                                                <div className="mt-2 p-3 border-round" style={{ border: '1px solid var(--blue-200)', background: 'var(--blue-50)' }}>
                                                    <div className="flex align-items-center justify-content-between mb-2">
                                                        <h6 className="m-0"><i className="pi pi-money-bill mr-1 text-blue-600"></i>Billets a retourner</h6>
                                                        <span className={`font-bold text-sm ${Math.abs(calculateTransferBilletageTotal() - (myCaisse.soldeActuel ?? 0)) < 0.01 && calculateTransferBilletageTotal() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {formatNumber(calculateTransferBilletageTotal())} / {formatNumber(myCaisse.soldeActuel)} FBu
                                                        </span>
                                                    </div>
                                                    <DataTable value={DENOMINATIONS} size="small" showGridlines
                                                        footer={
                                                            <div className="flex justify-content-between align-items-center">
                                                                <span className="font-bold">TOTAL</span>
                                                                <span className={`font-bold ${Math.abs(calculateTransferBilletageTotal() - (myCaisse.soldeActuel ?? 0)) < 0.01 && calculateTransferBilletageTotal() > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                                                    {formatNumber(calculateTransferBilletageTotal())} FBu
                                                                </span>
                                                            </div>
                                                        }
                                                    >
                                                        <Column header="Denomination" body={(d: any) => (
                                                            <span className="font-medium">{formatNumber(d.value)} FBu</span>
                                                        )} style={{ width: '100px' }} />
                                                        <Column header="Qte" body={(d: any) => (
                                                            <InputNumber
                                                                value={(transferBilletage as any)[d.field] || 0}
                                                                onValueChange={(e) => handleTransferBilletageChange(d.field, e.value || 0)}
                                                                min={0}
                                                                showButtons
                                                                buttonLayout="horizontal"
                                                                incrementButtonIcon="pi pi-plus"
                                                                decrementButtonIcon="pi pi-minus"
                                                                inputStyle={{ textAlign: 'center', fontWeight: 600, width: '50px' }}
                                                            />
                                                        )} style={{ width: '150px' }} />
                                                        <Column header="Sous-total" body={(d: any) => (
                                                            <span className="font-bold text-primary">{formatNumber(((transferBilletage as any)[d.field] || 0) * d.value)} FBu</span>
                                                        )} style={{ textAlign: 'right' }} />
                                                    </DataTable>
                                                </div>
                                            )}
                                            <Button
                                                label="Retourner tout le Solde"
                                                icon="pi pi-replay"
                                                className="w-full mt-2"
                                                severity="warning"
                                                onClick={() => {
                                                    const soldeSource = myCaisse.soldeActuel ?? 0;
                                                    if (soldeSource <= 0) {
                                                        toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Le solde de votre caisse est deja a 0.', life: 3000 });
                                                        return;
                                                    }
                                                    const billetageTotal = calculateTransferBilletageTotal();
                                                    if (billetageTotal <= 0) {
                                                        toast.current?.show({ severity: 'error', summary: 'Billetage requis', detail: 'Veuillez saisir le billetage (billets a retourner).', life: 5000 });
                                                        return;
                                                    }
                                                    if (Math.abs(billetageTotal - soldeSource) > 0.01) {
                                                        toast.current?.show({ severity: 'error', summary: 'Billetage incorrect', detail: `Le total du billetage (${formatNumber(billetageTotal)} FBu) doit correspondre au solde total (${formatNumber(soldeSource)} FBu).`, life: 5000 });
                                                        return;
                                                    }
                                                    let exerciceId = '';
                                                    const savedExercice = Cookies.get('currentExercice');
                                                    if (savedExercice) {
                                                        try { exerciceId = JSON.parse(savedExercice).exerciceId || ''; } catch (e) { /* ignore */ }
                                                    }
                                                    confirmDialog({
                                                        message: `Confirmer le retour de ${formatNumber(soldeSource)} FBu de ${myCaisse.codeCaisse} vers ${parentCaisse.codeCaisse} ?\n\nLe solde de votre caisse deviendra 0 FBu.`,
                                                        header: 'Confirmation de Retour de Fonds',
                                                        icon: 'pi pi-replay',
                                                        acceptLabel: 'Confirmer',
                                                        rejectLabel: 'Annuler',
                                                        accept: () => {
                                                            const params = new URLSearchParams({
                                                                caisseSourceId: myCaisse.caisseId,
                                                                caisseDestId: parentCaisse.caisseId,
                                                                montant: soldeSource.toString(),
                                                                libelle: transferLibelle || `Retour de fonds de ${myCaisse.codeCaisse} vers ${parentCaisse.codeCaisse}`
                                                            });
                                                            if (exerciceId) params.append('exerciceId', exerciceId);
                                                            const body = { ...transferBilletage, userAction: getUserAction() };
                                                            fetchTransfer(body, 'POST', BASE_URL + '/transfer?' + params.toString(), 'transfer');
                                                        }
                                                    });
                                                }}
                                                loading={transferLoading}
                                                disabled={(myCaisse.soldeActuel ?? 0) <= 0 || Math.abs(calculateTransferBilletageTotal() - (myCaisse.soldeActuel ?? 0)) > 0.01}
                                            />
                                        </Card>
                                    </div>
                                    <div className="col-12 md:col-7">
                                        <Card title="Informations">
                                            <div className="grid">
                                                <div className="col-6">
                                                    <div className="p-3 border-round surface-100 text-center">
                                                        <div className="text-500 text-sm mb-1">Solde Ma Caisse</div>
                                                        <div className="text-2xl font-bold text-blue-600">{formatNumber(myCaisse.soldeActuel)} FBu</div>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-3 border-round surface-100 text-center">
                                                        <div className="text-500 text-sm mb-1">Caisse Agence</div>
                                                        <div className="text-2xl font-bold text-green-600">{parentCaisse.codeCaisse}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </TabPanel>
                        )}

                        {/* ==================== Tab 6: Validation Guichets (Managers only) ==================== */}
                        {isManager && (
                            <TabPanel header="Validation Guichets" leftIcon="pi pi-check-square mr-2">
                                <div className="mb-3 flex align-items-center justify-content-between">
                                    <h4 className="m-0"><i className="pi pi-verified mr-2" />Validation des Fermetures de Guichets</h4>
                                    <Button
                                        icon="pi pi-refresh"
                                        severity="secondary"
                                        text
                                        onClick={() => myCaisse && loadBranchClosingStatus(myCaisse.caisseId, toApiDate(new Date()))}
                                        tooltip="Actualiser"
                                    />
                                </div>

                                {branchClosingStatus && (
                                    <>
                                        {/* Summary cards */}
                                        <div className="grid mb-3">
                                            <div className="col-12 md:col-3">
                                                <div className="p-3 surface-100 border-round text-center">
                                                    <div className="text-500 mb-1">Guichets Fermes</div>
                                                    <div className="font-bold text-xl">
                                                        {branchClosingStatus.guichetsFermes}/{branchClosingStatus.totalGuichets}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 md:col-3">
                                                <div className={`p-3 border-round text-center ${branchClosingStatus.allValidated ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                                    <div className="text-500 mb-1">Guichets Valides</div>
                                                    <div className="font-bold text-xl">
                                                        {branchClosingStatus.guichetsValides}/{branchClosingStatus.totalGuichets}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 md:col-3">
                                                <div className={`p-3 border-round text-center ${branchClosingStatus.readyForAccounting ? 'bg-green-50' : 'bg-red-50'}`}>
                                                    <div className="text-500 mb-1">Pret pour Comptabilite</div>
                                                    <div className="font-bold text-xl">
                                                        {branchClosingStatus.readyForAccounting ? 'OUI' : 'NON'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 md:col-3">
                                                <Button
                                                    label="Valider Tous"
                                                    icon="pi pi-check-circle"
                                                    severity="success"
                                                    className="w-full h-full"
                                                    onClick={handleValidateAll}
                                                    loading={validateLoading}
                                                    disabled={branchClosingStatus.guichetsFermes === 0 || branchClosingStatus.allValidated}
                                                />
                                            </div>
                                        </div>

                                        {/* Guichets DataTable */}
                                        <DataTable
                                            value={branchClosingStatus.guichets || []}
                                            size="small"
                                            showGridlines
                                            emptyMessage="Aucun guichet trouve"
                                        >
                                            <Column field="codeCaisse" header="Code" style={{ width: '10%' }} />
                                            <Column field="agentName" header="Agent" style={{ width: '15%' }} />
                                            <Column
                                                header="Statut"
                                                body={(row: any) => (
                                                    <Tag
                                                        value={row.status === 'OPEN' ? 'OUVERTE' : 'FERMEE'}
                                                        severity={row.status === 'OPEN' ? 'info' : 'warning'}
                                                        icon={row.status === 'OPEN' ? 'pi pi-lock-open' : 'pi pi-lock'}
                                                    />
                                                )}
                                                style={{ width: '10%' }}
                                            />
                                            <Column
                                                header="Ouverture"
                                                body={(row: any) => formatNumber(row.soldeOuverture) + ' FBu'}
                                                style={{ width: '13%', textAlign: 'right' }}
                                            />
                                            <Column
                                                header="Fermeture"
                                                body={(row: any) => row.closingStatus ? formatNumber(row.soldeFermeture) + ' FBu' : '-'}
                                                style={{ width: '13%', textAlign: 'right' }}
                                            />
                                            <Column
                                                header="Ecart"
                                                body={(row: any) => {
                                                    if (!row.closingStatus) return '-';
                                                    return (
                                                        <span className={row.ecart !== 0 ? 'text-red-500 font-bold' : 'text-green-600'}>
                                                            {formatNumber(row.ecart)} FBu
                                                        </span>
                                                    );
                                                }}
                                                style={{ width: '12%', textAlign: 'right' }}
                                            />
                                            <Column
                                                header="Validation"
                                                body={(row: any) => {
                                                    if (row.status === 'OPEN') {
                                                        return <span className="text-500">Non fermee</span>;
                                                    }
                                                    if (row.validationStatus === 'VALIDATED') {
                                                        return (
                                                            <div className="flex flex-column gap-1">
                                                                <Tag value="VALIDEE" severity="success" icon="pi pi-check-circle" />
                                                                {row.consolidated && <Tag value="Consolide" severity="info" icon="pi pi-arrows-h" className="text-xs" />}
                                                            </div>
                                                        );
                                                    }
                                                    if (row.validationStatus === 'REJECTED') {
                                                        return <Tag value="REJETEE" severity="danger" icon="pi pi-times-circle" />;
                                                    }
                                                    return (
                                                        <div className="flex gap-1">
                                                            <Button
                                                                label="Valider"
                                                                icon="pi pi-check"
                                                                severity="success"
                                                                size="small"
                                                                onClick={() => {
                                                                    confirmDialog({
                                                                        message: `Valider la fermeture de ${row.codeCaisse} (${row.agentName}) ?`,
                                                                        header: 'Confirmation',
                                                                        icon: 'pi pi-check-circle',
                                                                        acceptLabel: 'Valider',
                                                                        rejectLabel: 'Annuler',
                                                                        accept: () => handleValidateClosing(String(row.caisseId))
                                                                    });
                                                                }}
                                                                loading={validateLoading}
                                                            />
                                                            <Button
                                                                icon="pi pi-times"
                                                                severity="danger"
                                                                size="small"
                                                                outlined
                                                                onClick={() => setRejectDialog({ visible: true, caisseId: String(row.caisseId), reason: '' })}
                                                                tooltip="Rejeter"
                                                            />
                                                        </div>
                                                    );
                                                }}
                                                style={{ width: '17%' }}
                                            />
                                            <Column
                                                header=""
                                                body={(row: any) => (
                                                    <Button
                                                        icon="pi pi-eye"
                                                        severity="info"
                                                        text
                                                        size="small"
                                                        onClick={() => {
                                                            // Load detail comparison for this guichet
                                                            fetchComparison(null, 'GET',
                                                                BASE_URL + '/closing-comparison/' + row.caisseId + '?date=' + toApiDate(new Date()),
                                                                'closing-comparison');
                                                            setDetailDialog(row);
                                                        }}
                                                        tooltip="Details"
                                                    />
                                                )}
                                                style={{ width: '5%' }}
                                            />
                                        </DataTable>

                                        {!branchClosingStatus.allClosed && (
                                            <div className="mt-2 p-2 border-round bg-yellow-50 border-yellow-200 text-yellow-700 text-sm" style={{ border: '1px solid' }}>
                                                <i className="pi pi-exclamation-triangle mr-1" />
                                                Certains guichets ne sont pas encore fermes. La validation ne peut se faire que sur les guichets fermes.
                                            </div>
                                        )}

                                        {branchClosingStatus.readyForAccounting && (
                                            <div className="mt-2 p-2 border-round bg-green-50 border-green-200 text-green-700 text-sm" style={{ border: '1px solid' }}>
                                                <i className="pi pi-check-circle mr-1" />
                                                Tous les guichets sont valides. La cloture journaliere comptable peut etre executee.
                                            </div>
                                        )}
                                    </>
                                )}

                                {!branchClosingStatus && (
                                    <p className="text-500">Chargement du statut des guichets...</p>
                                )}
                            </TabPanel>
                        )}
                        {/* ==================== Tab: Billetage Details ==================== */}
                        <TabPanel header="Billetage" leftIcon="pi pi-money-bill mr-2">
                            <div className="flex align-items-center justify-content-between mb-3">
                                <p className="text-500 m-0">
                                    <i className="pi pi-info-circle mr-2"></i>
                                    Detail des billets et pieces dans chaque caisse
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

                            {Object.keys(billetageDetails).length > 0 && (() => {
                                const targetCaisses = myCaisse ? [myCaisse, ...childCaisses] : allCaisses.filter(c => c.actif);

                                const renderBilletageCard = (c: CptCaisse) => {
                                    const detail = billetageDetails[String(c.caisseId)];
                                    const hasBilletage = detail && detail.totalPhysique != null;

                                    return (
                                        <div key={c.caisseId} className="col-12 md:col-6">
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

                                // Group: my caisse first, then children
                                return (
                                    <div>
                                        {myCaisse && (
                                            <div className="mb-4">
                                                <h4 className="m-0 mb-3 flex align-items-center gap-2 text-primary">
                                                    <i className="pi pi-wallet"></i>
                                                    Ma Caisse
                                                </h4>
                                                <div className="grid">
                                                    {renderBilletageCard(myCaisse)}
                                                </div>
                                            </div>
                                        )}
                                        {childCaisses.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="m-0 mb-3 flex align-items-center gap-2" style={{ color: '#E65100' }}>
                                                    <i className="pi pi-desktop"></i>
                                                    Guichets
                                                    <Tag value={String(childCaisses.length)} severity="info" className="ml-2" />
                                                </h4>
                                                <div className="grid">
                                                    {childCaisses.map(c => renderBilletageCard(c))}
                                                </div>
                                            </div>
                                        )}
                                        {!myCaisse && childCaisses.length === 0 && (
                                            <div className="grid">
                                                {targetCaisses.map(c => renderBilletageCard(c))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </TabPanel>
                    </TabView>

                    {/* Reject Dialog */}
                    <Dialog
                        header="Rejeter la fermeture"
                        visible={rejectDialog.visible}
                        style={{ width: '30rem' }}
                        onHide={() => setRejectDialog({ visible: false, caisseId: '', reason: '' })}
                        footer={
                            <div className="flex justify-content-end gap-2">
                                <Button label="Annuler" severity="secondary" text onClick={() => setRejectDialog({ visible: false, caisseId: '', reason: '' })} />
                                <Button label="Rejeter" icon="pi pi-times" severity="danger" onClick={handleRejectClosing} loading={validateLoading} />
                            </div>
                        }
                    >
                        <div className="field">
                            <label className="font-semibold">Motif du rejet *</label>
                            <InputTextarea
                                value={rejectDialog.reason}
                                onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
                                rows={3}
                                className="w-full"
                                placeholder="Indiquez le motif du rejet..."
                            />
                        </div>
                    </Dialog>

                    {/* Detail Dialog (Denomination Breakdown) */}
                    <Dialog
                        header={`Details - ${detailDialog?.codeCaisse || ''} (${detailDialog?.agentName || ''})`}
                        visible={!!detailDialog}
                        style={{ width: '40rem' }}
                        onHide={() => setDetailDialog(null)}
                    >
                        {closingComparison && (
                            <div>
                                <div className="grid mb-3">
                                    <div className="col-6">
                                        <h5 className="text-green-600">Ouverture</h5>
                                        {closingComparison.openingCount ? (
                                            <DataTable value={DENOMINATIONS} size="small" showGridlines>
                                                <Column field="label" header="Coupure" />
                                                <Column header="Qte" body={(d: any) => (closingComparison.openingCount as any)?.[d.field] || 0} style={{ textAlign: 'right' }} />
                                                <Column header="Montant" body={(d: any) => formatNumber(((closingComparison.openingCount as any)?.[d.field] || 0) * d.value)} style={{ textAlign: 'right' }} />
                                            </DataTable>
                                        ) : <p className="text-500">Pas d'ouverture</p>}
                                        {closingComparison.openingCount && (
                                            <div className="mt-2 font-bold text-right">
                                                Total: {formatNumber(closingComparison.soldeOuverture)} FBu
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-6">
                                        <h5 className="text-red-600">Fermeture</h5>
                                        {closingComparison.closingCount ? (
                                            <DataTable value={DENOMINATIONS} size="small" showGridlines>
                                                <Column field="label" header="Coupure" />
                                                <Column header="Qte" body={(d: any) => (closingComparison.closingCount as any)?.[d.field] || 0} style={{ textAlign: 'right' }} />
                                                <Column header="Montant" body={(d: any) => formatNumber(((closingComparison.closingCount as any)?.[d.field] || 0) * d.value)} style={{ textAlign: 'right' }} />
                                            </DataTable>
                                        ) : <p className="text-500">Pas de fermeture</p>}
                                        {closingComparison.closingCount && (
                                            <div className="mt-2 font-bold text-right">
                                                Total: {formatNumber(closingComparison.soldeFermeturePhysique)} FBu
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-content-between mb-2">
                                    <span>Solde Theorique:</span>
                                    <span className="font-bold">{formatNumber(closingComparison.soldeFermetureTheorique)} FBu</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span>Ecart:</span>
                                    <span className={`font-bold ${closingComparison.ecart !== 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        {formatNumber(closingComparison.ecart)} FBu
                                    </span>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </>
            )}

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
                onHide={handleSkipBilletage}
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
                        {billetageOperationType.toLowerCase().includes('virement') || billetageOperationType.toLowerCase().includes('distribution') || billetageOperationType.toLowerCase().includes('reception') ? (
                            <span className="text-orange-600 text-sm flex align-items-center"><i className="pi pi-exclamation-triangle mr-1"></i>Billetage obligatoire pour les transferts</span>
                        ) : (
                            <Button label="Passer" icon="pi pi-forward" severity="secondary" outlined onClick={handleSkipBilletage} />
                        )}
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
        <ProtectedPage requiredAuthorities={['ACCOUNTING_CASH_MANAGEMENT', 'GUICHET_CAISSE', 'CAISSE_VALIDATE_CLOSING', 'CAISSE_ACKNOWLEDGE_RECEIPT']}>
            <GestionCaissePage />
        </ProtectedPage>
    );
}
