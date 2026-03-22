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
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';
import { getClientDisplayName } from '@/utils/clientUtils';
import { shouldFilterByBranch } from '@/utils/branchFilter';
import PrintableAttestationReceipt from './PrintableAttestationReceipt';

const BASE_URL = `${API_BASE_URL}/api/epargne/statement-requests`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const INTERNAL_ACCOUNTS_URL = `${API_BASE_URL}/api/comptability/internal-accounts`;
const DISBURSEMENTS_URL = `${API_BASE_URL}/api/credit/disbursements`;
const SCHEDULES_URL = `${API_BASE_URL}/api/remboursement/schedules`;

const REQUEST_TYPE = 'ATTESTATION';

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

interface CreditInfo {
    applicationNumber: string;
    amount: number;
    status: string;
    remainingBalance: number;
    disbursementDate?: string;
}

function AttestationNonRedevabilitePage() {
    const { can } = useAuthorizedAction();
    const [requests, setRequests] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [comptesComptables, setComptesComptables] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);

    // Form fields
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [feeAmount, setFeeAmount] = useState<number>(2000);
    const [feeAccountId, setFeeAccountId] = useState<number | null>(null);
    const [motif, setMotif] = useState('');
    const [notes, setNotes] = useState('');

    // Verification state
    const [verifying, setVerifying] = useState(false);
    const [verificationDone, setVerificationDone] = useState(false);
    const [clientCredits, setClientCredits] = useState<CreditInfo[]>([]);
    const [unpaidScheduleCount, setUnpaidScheduleCount] = useState(0);
    const [selectedSavingsAccount, setSelectedSavingsAccount] = useState<any>(null);

    // Dialogs
    const [viewDialog, setViewDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [printDialog, setPrintDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Print data
    const [printCredits, setPrintCredits] = useState<CreditInfo[]>([]);
    const [printUnpaid, setPrintUnpaid] = useState(0);
    const [printAccount, setPrintAccount] = useState<any>(null);

    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const branchesApi = useConsumApi('');
    const savingsApi = useConsumApi('');
    const comptesApi = useConsumApi('');
    const requestsApi = useConsumApi('');
    const actionsApi = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadRequests();
    }, []);

    useEffect(() => {
        if (branchesApi.data) setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
    }, [branchesApi.data]);

    useEffect(() => {
        if (savingsApi.data) setSavingsAccounts(Array.isArray(savingsApi.data) ? savingsApi.data : []);
    }, [savingsApi.data]);

    useEffect(() => {
        if (comptesApi.data) {
            const data = Array.isArray(comptesApi.data) ? comptesApi.data : [];
            const mapped = data
                .filter((a: any) => a.actif !== false)
                .map((a: any) => ({
                    compteId: a.compteComptableId,
                    codeCompte: a.codeCompte,
                    libelle: `${a.accountNumber} - ${a.libelle} (${a.codeCompte})`
                }));
            setComptesComptables(mapped);
            if (mapped.length > 0 && !feeAccountId) {
                const defaultCompte = mapped.find((c: any) => c.codeCompte === '708');
                setFeeAccountId(defaultCompte ? defaultCompte.compteId : mapped[0].compteId);
            }
        }
    }, [comptesApi.data]);

    useEffect(() => {
        if (requestsApi.data) {
            const data = Array.isArray(requestsApi.data) ? requestsApi.data : requestsApi.data?.content || [];
            setRequests(data.filter((r: any) => r.requestType === REQUEST_TYPE).map((r: any) => {
                const account = savingsAccounts.find(a => a.id === r.savingsAccountId);
                return { ...r, accountNumber: account?.accountNumber || '' };
            }));
            setLoading(false);
        }
        if (requestsApi.error) {
            showToast('error', 'Erreur', requestsApi.error.message || 'Erreur lors du chargement');
            setLoading(false);
        }
    }, [requestsApi.data, requestsApi.error, savingsAccounts]);

    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    showToast('success', 'Succes', 'Demande d\'attestation creee avec succes');
                    resetForm();
                    loadRequests();
                    setActiveIndex(1);
                    break;
                case 'validate':
                    showToast('success', 'Succes', 'Demande validee — frais debites du compte');
                    loadRequests();
                    break;
                case 'reject':
                    showToast('success', 'Succes', 'Demande rejetee');
                    setRejectDialog(false);
                    loadRequests();
                    break;
                case 'cancel':
                    showToast('success', 'Succes', 'Demande annulee');
                    loadRequests();
                    break;
                case 'deliver':
                    showToast('success', 'Succes', 'Attestation livree au client');
                    loadRequests();
                    break;
            }
        }
        if (actionsApi.error) showToast('error', 'Erreur', actionsApi.error.message || 'Une erreur est survenue');
    }, [actionsApi.data, actionsApi.error, actionsApi.callType]);

    const loadReferenceData = () => {
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        savingsApi.fetchData(null, 'GET', `${SAVINGS_URL}/findallactive`, 'loadSavingsAccounts');
        comptesApi.fetchData(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findactive`, 'loadComptes');
    };

    const loadRequests = () => {
        setLoading(true);
        requestsApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadRequests');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleAccountChange = (accountId: number) => {
        setSelectedAccountId(accountId);
        setVerificationDone(false);
        setClientCredits([]);
        setUnpaidScheduleCount(0);
        const account = savingsAccounts.find(a => a.id === accountId);
        setSelectedSavingsAccount(account || null);
        if (account?.client) {
            setSelectedBranchId(account.branch?.id || null);
        }
    };

    const verifyClient = async () => {
        if (!selectedAccountId) {
            showToast('warn', 'Attention', 'Veuillez selectionner un compte d\'epargne');
            return;
        }

        setVerifying(true);
        setVerificationDone(false);
        setClientCredits([]);
        setUnpaidScheduleCount(0);

        try {
            const token = Cookies.get('token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // 1. Fetch all disbursements to find client's credits
            const disbResponse = await fetch(`${DISBURSEMENTS_URL}/findall`, {
                method: 'GET', headers, credentials: 'include'
            });

            let credits: CreditInfo[] = [];
            if (disbResponse.ok) {
                const disbData = await disbResponse.json();
                const allDisb = Array.isArray(disbData) ? disbData : disbData.content || [];
                const account = savingsAccounts.find(a => a.id === selectedAccountId);
                const clientId = account?.client?.id;

                if (clientId) {
                    const clientDisb = allDisb.filter((d: any) =>
                        (d.clientId === clientId || d.application?.clientId === clientId || d.client?.id === clientId) &&
                        d.status === 'COMPLETED'
                    );

                    // 2. Fetch schedules to get remaining balances
                    const schedResponse = await fetch(`${SCHEDULES_URL}/findall`, {
                        method: 'GET', headers, credentials: 'include'
                    });

                    let allSchedules: any[] = [];
                    if (schedResponse.ok) {
                        const schedData = await schedResponse.json();
                        allSchedules = Array.isArray(schedData) ? schedData : schedData.content || [];
                    }

                    // Calculate remaining per loan
                    const remainingByLoan = new Map<number, number>();
                    const unpaidByLoan = new Map<number, number>();
                    allSchedules.forEach((s: any) => {
                        if (s.status !== 'PAID') {
                            const loanId = s.loanId;
                            const remaining = Math.max(0, (s.totalDue || 0) - (s.totalPaid || 0));
                            remainingByLoan.set(loanId, (remainingByLoan.get(loanId) || 0) + remaining);
                            unpaidByLoan.set(loanId, (unpaidByLoan.get(loanId) || 0) + 1);
                        }
                    });

                    credits = clientDisb.map((d: any) => ({
                        applicationNumber: d.applicationNumber || d.disbursementNumber || '-',
                        amount: d.amount || 0,
                        status: d.status,
                        remainingBalance: remainingByLoan.get(d.id) || 0,
                        disbursementDate: d.disbursementDate
                    }));

                    // Count total unpaid schedules for client's loans
                    let totalUnpaid = 0;
                    clientDisb.forEach((d: any) => {
                        totalUnpaid += unpaidByLoan.get(d.id) || 0;
                    });
                    setUnpaidScheduleCount(totalUnpaid);
                }
            }

            setClientCredits(credits);
            setVerificationDone(true);
        } catch (err) {
            showToast('error', 'Erreur', 'Erreur lors de la verification');
        } finally {
            setVerifying(false);
        }
    };

    const hasActiveCredits = clientCredits.some(c => c.remainingBalance > 0);
    const isClean = !hasActiveCredits && unpaidScheduleCount === 0;

    const handleSubmit = () => {
        if (!selectedAccountId) {
            showToast('warn', 'Attention', 'Veuillez selectionner un compte d\'epargne');
            return;
        }
        if (!verificationDone) {
            showToast('warn', 'Attention', 'Veuillez d\'abord verifier le client');
            return;
        }
        if (!selectedBranchId) {
            showToast('warn', 'Attention', 'Veuillez selectionner une agence');
            return;
        }
        if (!feeAccountId) {
            showToast('warn', 'Attention', 'Veuillez selectionner le compte comptable de revenus');
            return;
        }
        if (feeAmount <= 0) {
            showToast('warn', 'Attention', 'Les frais doivent etre superieurs a 0');
            return;
        }

        const account = savingsAccounts.find(a => a.id === selectedAccountId);
        const balance = account?.currentBalance || 0;
        if (balance < feeAmount) {
            showToast('warn', 'Attention', `Solde insuffisant. Solde: ${formatCurrency(balance)}, Frais: ${formatCurrency(feeAmount)}`);
            return;
        }

        const selectedCompte = comptesComptables.find((c: any) => c.compteId === feeAccountId);
        const requestData = {
            requestType: REQUEST_TYPE,
            savingsAccountId: selectedAccountId,
            clientId: account?.client?.id,
            branchId: selectedBranchId,
            feeAccountId: feeAccountId,
            feeAccountCode: selectedCompte?.codeCompte || '708',
            feeAmount: feeAmount,
            motif: motif || 'Demande d\'attestation de non redevabilite',
            notes: notes + (isClean ? ' | RESULTAT: FAVORABLE - Aucune dette' : ` | RESULTAT: DEFAVORABLE - ${clientCredits.filter(c => c.remainingBalance > 0).length} credit(s) actif(s), ${unpaidScheduleCount} echeance(s) impayee(s)`),
            userAction: getCurrentUser()
        };

        actionsApi.fetchData(requestData, 'POST', `${BASE_URL}/new`, 'create');
    };

    const resetForm = () => {
        setSelectedAccountId(null);
        setSelectedBranchId(null);
        setSelectedSavingsAccount(null);
        setFeeAmount(2000);
        setMotif('');
        setNotes('');
        setVerificationDone(false);
        setClientCredits([]);
        setUnpaidScheduleCount(0);
        const autoSelect = comptesComptables.find((c: any) => c.codeCompte === '708');
        if (autoSelect) setFeeAccountId(autoSelect.compteId);
    };

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '0 FBU';
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const viewRequest = (rowData: any) => {
        setSelectedRequest(rowData);
        setViewDialog(true);
    };

    const validateRequest = (rowData: any) => {
        confirmDialog({
            message: `Confirmer la validation de la demande ${rowData.requestNumber} pour des frais de ${formatCurrency(rowData.feeAmount)} ?`,
            header: 'Valider la Demande',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, valider',
            rejectLabel: 'Annuler',
            accept: () => { actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/validate/${rowData.id}`, 'validate'); }
        });
    };

    const openRejectDialog = (rowData: any) => { setSelectedRequest(rowData); setRejectionReason(''); setRejectDialog(true); };

    const handleReject = () => {
        if (selectedRequest && rejectionReason) {
            actionsApi.fetchData({ rejectionReason, userAction: getCurrentUser() }, 'POST', `${BASE_URL}/reject/${selectedRequest.id}`, 'reject');
        }
    };

    const cancelRequest = (rowData: any) => {
        confirmDialog({
            message: `Confirmer l'annulation de la demande ${rowData.requestNumber} ?`,
            header: 'Annuler la Demande',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, annuler',
            rejectLabel: 'Non',
            accept: () => { actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/cancel/${rowData.id}`, 'cancel'); }
        });
    };

    const handleDeliver = (rowData: any) => {
        const clientName = getClientDisplayName(rowData.client);
        confirmDialog({
            message: `Confirmer la livraison de l'attestation a ${clientName} ?`,
            header: 'Livrer l\'Attestation',
            icon: 'pi pi-send',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, livrer',
            rejectLabel: 'Annuler',
            accept: () => {
                actionsApi.fetchData({ deliveredToName: clientName, userAction: getCurrentUser() }, 'POST', `${BASE_URL}/deliver/${rowData.id}`, 'deliver');
            }
        });
    };

    const openPrintDialog = async (rowData: any) => {
        setSelectedRequest(rowData);

        // Resolve savings account
        const account = savingsAccounts.find(a => a.id === rowData.savingsAccountId) || rowData.savingsAccount;
        setPrintAccount(account);

        // Load client credits for the print
        try {
            const token = Cookies.get('token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const disbResponse = await fetch(`${DISBURSEMENTS_URL}/findall`, {
                method: 'GET', headers, credentials: 'include'
            });

            let credits: CreditInfo[] = [];
            let totalUnpaid = 0;

            if (disbResponse.ok) {
                const disbData = await disbResponse.json();
                const allDisb = Array.isArray(disbData) ? disbData : disbData.content || [];
                const clientId = rowData.clientId || rowData.client?.id || account?.client?.id;

                if (clientId) {
                    const clientDisb = allDisb.filter((d: any) =>
                        (d.clientId === clientId || d.application?.clientId === clientId || d.client?.id === clientId) &&
                        d.status === 'COMPLETED'
                    );

                    const schedResponse = await fetch(`${SCHEDULES_URL}/findall`, {
                        method: 'GET', headers, credentials: 'include'
                    });

                    let allSchedules: any[] = [];
                    if (schedResponse.ok) {
                        const schedData = await schedResponse.json();
                        allSchedules = Array.isArray(schedData) ? schedData : schedData.content || [];
                    }

                    const remainingByLoan = new Map<number, number>();
                    const unpaidByLoan = new Map<number, number>();
                    allSchedules.forEach((s: any) => {
                        if (s.status !== 'PAID') {
                            const loanId = s.loanId;
                            const remaining = Math.max(0, (s.totalDue || 0) - (s.totalPaid || 0));
                            remainingByLoan.set(loanId, (remainingByLoan.get(loanId) || 0) + remaining);
                            unpaidByLoan.set(loanId, (unpaidByLoan.get(loanId) || 0) + 1);
                        }
                    });

                    credits = clientDisb.map((d: any) => ({
                        applicationNumber: d.applicationNumber || d.disbursementNumber || '-',
                        amount: d.amount || 0,
                        status: d.status,
                        remainingBalance: remainingByLoan.get(d.id) || 0,
                        disbursementDate: d.disbursementDate
                    }));

                    clientDisb.forEach((d: any) => {
                        totalUnpaid += unpaidByLoan.get(d.id) || 0;
                    });
                }
            }

            setPrintCredits(credits);
            setPrintUnpaid(totalUnpaid);
        } catch (err) {
            setPrintCredits([]);
            setPrintUnpaid(0);
        }

        setPrintDialog(true);
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML.replace(/src="\/layout\//g, `src="${window.location.origin}/layout/`);
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<!DOCTYPE html><html><head><title>Attestation - ${selectedRequest?.requestNumber}</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; padding: 15mm; } @page { margin: 15mm; } @media print { body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>${printContent}</body></html>`);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
            }
        }
    };

    const statusBodyTemplate = (rowData: any) => {
        const map: { [key: string]: { severity: 'success' | 'info' | 'warning' | 'danger'; label: string } } = {
            'PENDING': { severity: 'warning', label: 'En attente' },
            'VALIDATED': { severity: 'info', label: 'Valide' },
            'DELIVERED': { severity: 'success', label: 'Livre' },
            'REJECTED': { severity: 'danger', label: 'Rejete' },
            'CANCELLED': { severity: 'danger', label: 'Annule' }
        };
        const s = map[rowData.status] || { severity: 'info' as const, label: rowData.status };
        return <Tag value={s.label} severity={s.severity} />;
    };

    const actionsBodyTemplate = (rowData: any) => {
        const isPending = rowData.status === 'PENDING';
        const isValidated = rowData.status === 'VALIDATED';
        const isDelivered = rowData.status === 'DELIVERED';
        const canPrint = isValidated || isDelivered;

        return (
            <div className="flex gap-1 flex-wrap">
                <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm" onClick={() => viewRequest(rowData)} tooltip="Voir" />
                {isPending && can('EPARGNE_STATEMENT_VALIDATE') && (
                    <Button icon="pi pi-check" className="p-button-rounded p-button-success p-button-sm" onClick={() => validateRequest(rowData)} tooltip="Valider" />
                )}
                {isPending && can('EPARGNE_STATEMENT_VALIDATE') && (
                    <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-sm" onClick={() => openRejectDialog(rowData)} tooltip="Rejeter" />
                )}
                {isPending && (
                    <Button icon="pi pi-ban" className="p-button-rounded p-button-warning p-button-sm" onClick={() => cancelRequest(rowData)} tooltip="Annuler" />
                )}
                {isValidated && can('EPARGNE_STATEMENT_DELIVER') && (
                    <Button icon="pi pi-send" className="p-button-rounded p-button-success p-button-sm" onClick={() => handleDeliver(rowData)} tooltip="Livrer" />
                )}
                {canPrint && (
                    <Button icon="pi pi-print" className="p-button-rounded p-button-secondary p-button-sm" onClick={() => openPrintDialog(rowData)} tooltip="Imprimer attestation" />
                )}
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Demandes d'Attestation de Non Redevabilite</h5>
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

            <h4 className="text-primary mb-4">
                <i className="pi pi-verified mr-2"></i>
                Attestation de Non Redevabilite
            </h4>

            <div className="surface-100 p-3 border-round mb-4">
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span><strong>Frais par defaut:</strong> 2 000 FBU</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-orange-500"></i>
                            <span><strong>Verification:</strong> Compte, Credits, Paiements</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-green-500"></i>
                            <span><strong>Cycle:</strong> Verification → Creation → Validation → Livraison</span>
                        </div>
                    </div>
                </div>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Demande" leftIcon="pi pi-plus mr-2">
                    <div className="grid">
                        {/* Step 1: Select account */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-3">
                                <h5 className="mb-3"><i className="pi pi-wallet mr-2"></i>1. Selection du Compte Client</h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold">Compte d'Epargne *</label>
                                        <Dropdown
                                            value={selectedAccountId}
                                            options={savingsAccounts.map(a => ({
                                                label: `${a.accountNumber} - ${getClientDisplayName(a.client)}`,
                                                value: a.id
                                            }))}
                                            onChange={(e) => handleAccountChange(e.value)}
                                            placeholder="Selectionner un compte"
                                            className="w-full"
                                            filter
                                            filterPlaceholder="Rechercher..."
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Agence</label>
                                        <Dropdown
                                            value={selectedBranchId}
                                            options={branches.map(b => ({ label: b.name, value: b.id }))}
                                            onChange={(e) => setSelectedBranchId(e.value)}
                                            placeholder="Agence"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="field col-12 md:col-2 flex align-items-end">
                                        <Button
                                            label="Verifier"
                                            icon="pi pi-search"
                                            onClick={verifyClient}
                                            className="w-full"
                                            severity="info"
                                            loading={verifying}
                                            disabled={!selectedAccountId}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Verification results */}
                        {verifying && (
                            <div className="col-12">
                                <div className="flex align-items-center justify-content-center gap-3 p-4">
                                    <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                                    <span className="text-600">Verification du compte, des credits et des paiements en cours...</span>
                                </div>
                            </div>
                        )}

                        {verificationDone && (
                            <div className="col-12">
                                <div className={`p-3 border-round mb-3 ${isClean ? 'bg-green-50 border-green-200 border-1' : 'bg-red-50 border-red-200 border-1'}`}>
                                    <h5 className="mb-3">
                                        <i className={`pi ${isClean ? 'pi-check-circle text-green-600' : 'pi-exclamation-triangle text-red-600'} mr-2`}></i>
                                        2. Resultat de la Verification
                                    </h5>

                                    <div className="grid mb-3">
                                        <div className="col-12 md:col-4">
                                            <Message
                                                severity={isClean ? 'success' : 'error'}
                                                text={isClean ? 'Aucune dette en cours' : `${clientCredits.filter(c => c.remainingBalance > 0).length} credit(s) avec solde restant`}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <Message
                                                severity={unpaidScheduleCount === 0 ? 'success' : 'error'}
                                                text={unpaidScheduleCount === 0 ? 'Aucune echeance impayee' : `${unpaidScheduleCount} echeance(s) impayee(s)`}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <Message
                                                severity={isClean ? 'success' : 'warn'}
                                                text={isClean ? 'ATTESTATION FAVORABLE' : 'ATTESTATION DEFAVORABLE'}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Credits detail */}
                                    {clientCredits.length > 0 && (
                                        <div className="mb-3">
                                            <h6 className="mb-2">Detail des credits du client:</h6>
                                            <DataTable value={clientCredits} size="small" stripedRows showGridlines>
                                                <Column field="applicationNumber" header="N° Dossier" />
                                                <Column field="amount" header="Montant" body={(row) => formatCurrency(row.amount)} />
                                                <Column field="disbursementDate" header="Date Decaissement" />
                                                <Column header="Reste a Payer" body={(row) => (
                                                    <span className={row.remainingBalance > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                                        {formatCurrency(row.remainingBalance)}
                                                    </span>
                                                )} />
                                                <Column header="Statut" body={(row) => (
                                                    <Tag
                                                        value={row.remainingBalance > 0 ? 'En cours' : 'Solde'}
                                                        severity={row.remainingBalance > 0 ? 'danger' : 'success'}
                                                    />
                                                )} />
                                            </DataTable>
                                        </div>
                                    )}

                                    {clientCredits.length === 0 && (
                                        <p className="text-600 m-0">
                                            <i className="pi pi-info-circle mr-2"></i>
                                            Aucun credit trouve pour ce client.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Fee config and submit */}
                        {verificationDone && (
                            <div className="col-12">
                                <div className="surface-100 p-3 border-round mb-3">
                                    <h5 className="mb-3"><i className="pi pi-money-bill mr-2"></i>3. Frais et Soumission</h5>
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-3">
                                            <label className="font-semibold">Frais d'Attestation (FBU) *</label>
                                            <InputNumber
                                                value={feeAmount}
                                                onValueChange={(e) => setFeeAmount(e.value ?? 0)}
                                                className="w-full"
                                                mode="decimal"
                                                locale="fr-BI"
                                            />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold">Compte Revenus *</label>
                                            <Dropdown
                                                value={feeAccountId}
                                                options={comptesComptables.map(c => ({ label: c.libelle, value: c.compteId }))}
                                                onChange={(e) => setFeeAccountId(e.value)}
                                                placeholder="Selectionner un compte"
                                                className="w-full"
                                                filter
                                                filterPlaceholder="Rechercher..."
                                            />
                                        </div>
                                        <div className="field col-12 md:col-5">
                                            <label className="font-semibold">Motif</label>
                                            <InputText
                                                value={motif}
                                                onChange={(e) => setMotif(e.target.value)}
                                                placeholder="Demande d'attestation de non redevabilite"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="field col-12">
                                            <label className="font-semibold">Notes</label>
                                            <InputTextarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                rows={2}
                                                className="w-full"
                                                placeholder="Notes complementaires..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            label="Creer la Demande"
                                            icon="pi pi-save"
                                            onClick={handleSubmit}
                                            className="p-button-success"
                                            disabled={!can('EPARGNE_STATEMENT_CREATE')}
                                        />
                                        <Button label="Reinitialiser" icon="pi pi-refresh" onClick={resetForm} className="p-button-secondary" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Demandes" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={requests}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucune demande d'attestation trouvee"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="requestDate"
                        sortOrder={-1}
                    >
                        <Column field="requestNumber" header="N° Demande" sortable />
                        <Column header="Client" body={(row) => getClientDisplayName(row.client)} sortable />
                        <Column field="accountNumber" header="N° Compte" sortable />
                        <Column field="requestDate" header="Date" sortable />
                        <Column field="feeAmount" header="Frais" sortable body={(row) => formatCurrency(row.feeAmount)} />
                        <Column header="Resultat" body={(row) => {
                            const isFavorable = row.notes?.includes('FAVORABLE');
                            return <Tag value={isFavorable ? 'Favorable' : 'Defavorable'} severity={isFavorable ? 'success' : 'danger'} />;
                        }} />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '220px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* View Dialog */}
            <Dialog header="Details de la Demande" visible={viewDialog} style={{ width: '700px' }} onHide={() => setViewDialog(false)}>
                {selectedRequest && (
                    <div className="p-3">
                        <div className="grid">
                            <div className="col-6"><small className="text-600">N° Demande</small><p className="font-semibold mt-1">{selectedRequest.requestNumber}</p></div>
                            <div className="col-6"><small className="text-600">Date</small><p className="font-semibold mt-1">{selectedRequest.requestDate}</p></div>
                            <div className="col-6"><small className="text-600">Client</small><p className="font-semibold mt-1">{getClientDisplayName(selectedRequest.client)}</p></div>
                            <div className="col-6"><small className="text-600">Frais</small><p className="font-semibold mt-1">{formatCurrency(selectedRequest.feeAmount)}</p></div>
                            <div className="col-6"><small className="text-600">Statut</small><div className="mt-1">{statusBodyTemplate(selectedRequest)}</div></div>
                            <div className="col-6"><small className="text-600">Utilisateur</small><p className="font-semibold mt-1">{selectedRequest.userAction || '-'}</p></div>
                            {selectedRequest.notes && (
                                <div className="col-12"><small className="text-600">Notes</small><p className="font-semibold mt-1">{selectedRequest.notes}</p></div>
                            )}
                            {selectedRequest.rejectionReason && (
                                <div className="col-12"><small className="text-600">Motif de rejet</small><p className="font-semibold mt-1 text-red-600">{selectedRequest.rejectionReason}</p></div>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Reject Dialog */}
            <Dialog header="Rejeter la Demande" visible={rejectDialog} style={{ width: '450px' }} onHide={() => setRejectDialog(false)}
                footer={<div><Button label="Fermer" icon="pi pi-times" onClick={() => setRejectDialog(false)} className="p-button-text" /><Button label="Rejeter" icon="pi pi-ban" onClick={handleReject} className="p-button-danger" disabled={!rejectionReason} /></div>}>
                <div className="p-fluid">
                    <p className="text-500 mb-3">Demande: <strong>{selectedRequest?.requestNumber}</strong></p>
                    <div className="field">
                        <label htmlFor="rejectionReason" className="font-medium">Motif du rejet *</label>
                        <InputTextarea id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} placeholder="Expliquez la raison du rejet..." className="w-full" />
                    </div>
                </div>
            </Dialog>

            {/* Print Dialog */}
            <Dialog header="Apercu de l'Attestation" visible={printDialog} style={{ width: '950px' }} onHide={() => setPrintDialog(false)}
                footer={<div className="flex justify-content-end gap-2"><Button label="Fermer" icon="pi pi-times" onClick={() => setPrintDialog(false)} className="p-button-text" /><Button label="Imprimer" icon="pi pi-print" onClick={handlePrint} className="p-button-success" /></div>}>
                {selectedRequest && (
                    <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                        <PrintableAttestationReceipt
                            ref={printRef}
                            request={selectedRequest}
                            savingsAccount={printAccount}
                            credits={printCredits}
                            unpaidSchedules={printUnpaid}
                            companyName="AGRINOVA MICROFINANCE"
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
        <ProtectedPage requiredAuthorities={['EPARGNE_VIEW']}>
            <AttestationNonRedevabilitePage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
