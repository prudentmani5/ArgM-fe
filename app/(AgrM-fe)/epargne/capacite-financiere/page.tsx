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
import { Calendar } from 'primereact/calendar';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { formatLocalDate } from '@/utils/dateUtils';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';
import { getClientDisplayName } from '@/utils/clientUtils';
import PrintableCapaciteFinanciereReceipt from './PrintableCapaciteFinanciereReceipt';

const BASE_URL = `${API_BASE_URL}/api/epargne/statement-requests`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const INTERNAL_ACCOUNTS_URL = `${API_BASE_URL}/api/comptability/internal-accounts`;
const DISBURSEMENTS_URL = `${API_BASE_URL}/api/credit/disbursements`;
const SCHEDULES_URL = `${API_BASE_URL}/api/remboursement/schedules`;

const REQUEST_TYPE = 'CAPACITE_FINANCIERE';

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

function CapaciteFinancierePage() {
    const { can } = useAuthorizedAction();
    const [requests, setRequests] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [comptesComptables, setComptesComptables] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [periodStart, setPeriodStart] = useState<Date | null>(null);
    const [periodEnd, setPeriodEnd] = useState<Date | null>(null);

    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [feeAmount, setFeeAmount] = useState<number>(2000);
    const [feeAccountId, setFeeAccountId] = useState<number | null>(null);
    const [motif, setMotif] = useState('');
    const [notes, setNotes] = useState('');

    const [verifying, setVerifying] = useState(false);
    const [verificationDone, setVerificationDone] = useState(false);
    const [clientCredits, setClientCredits] = useState<CreditInfo[]>([]);
    const [totalRemainingDebt, setTotalRemainingDebt] = useState(0);
    const [selectedSavingsAccount, setSelectedSavingsAccount] = useState<any>(null);

    const [viewDialog, setViewDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [printDialog, setPrintDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const [printCredits, setPrintCredits] = useState<CreditInfo[]>([]);
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
                const defaultCompte = mapped.find((c: any) => c.codeCompte?.startsWith('708'));
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
                    showToast('success', 'Succes', 'Demande de capacite financiere creee avec succes');
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
        setTotalRemainingDebt(0);
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
        setTotalRemainingDebt(0);

        try {
            const token = Cookies.get('token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const disbResponse = await fetch(`${DISBURSEMENTS_URL}/findall`, { method: 'GET', headers, credentials: 'include' });
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

                    const schedResponse = await fetch(`${SCHEDULES_URL}/findall`, { method: 'GET', headers, credentials: 'include' });
                    let allSchedules: any[] = [];
                    if (schedResponse.ok) {
                        const schedData = await schedResponse.json();
                        allSchedules = Array.isArray(schedData) ? schedData : schedData.content || [];
                    }

                    const remainingByLoan = new Map<number, number>();
                    allSchedules.forEach((s: any) => {
                        if (s.status !== 'PAID') {
                            const remaining = Math.max(0, (s.totalDue || 0) - (s.totalPaid || 0));
                            remainingByLoan.set(s.loanId, (remainingByLoan.get(s.loanId) || 0) + remaining);
                        }
                    });

                    credits = clientDisb.map((d: any) => ({
                        applicationNumber: d.applicationNumber || d.disbursementNumber || '-',
                        amount: d.amount || 0,
                        status: d.status,
                        remainingBalance: remainingByLoan.get(d.id) || 0,
                        disbursementDate: d.disbursementDate
                    }));

                    setTotalRemainingDebt(credits.reduce((sum, c) => sum + c.remainingBalance, 0));
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

    const savingsBalance = selectedSavingsAccount?.currentBalance || 0;
    const isCapaciteSuffisante = savingsBalance >= totalRemainingDebt;

    const handleSubmit = () => {
        if (!selectedAccountId) { showToast('warn', 'Attention', 'Veuillez selectionner un compte d\'epargne'); return; }
        if (!verificationDone) { showToast('warn', 'Attention', 'Veuillez d\'abord verifier le client'); return; }
        if (!selectedBranchId) { showToast('warn', 'Attention', 'Veuillez selectionner une agence'); return; }
        if (!feeAccountId) { showToast('warn', 'Attention', 'Veuillez selectionner le compte comptable de revenus'); return; }
        if (feeAmount <= 0) { showToast('warn', 'Attention', 'Les frais doivent etre superieurs a 0'); return; }

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
            feeAccountId,
            feeAccountCode: selectedCompte?.codeCompte || '708',
            feeAmount,
            motif: motif || 'Demande de capacite financiere',
            notes: notes + (isCapaciteSuffisante
                ? ` | RESULTAT: SUFFISANTE - Epargne: ${formatCurrency(savingsBalance)}, Dette: ${formatCurrency(totalRemainingDebt)}`
                : ` | RESULTAT: INSUFFISANTE - Epargne: ${formatCurrency(savingsBalance)}, Dette: ${formatCurrency(totalRemainingDebt)}`),
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
        setTotalRemainingDebt(0);
        const autoSelect = comptesComptables.find((c: any) => c.codeCompte?.startsWith('708'));
        if (autoSelect) setFeeAccountId(autoSelect.compteId);
    };

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '0 FBU';
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const openPrintDialog = async (rowData: any) => {
        setSelectedRequest(rowData);
        const account = savingsAccounts.find(a => a.id === rowData.savingsAccountId) || rowData.savingsAccount;
        setPrintAccount(account);

        try {
            const token = Cookies.get('token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const disbResponse = await fetch(`${DISBURSEMENTS_URL}/findall`, { method: 'GET', headers, credentials: 'include' });
            let credits: CreditInfo[] = [];
            if (disbResponse.ok) {
                const disbData = await disbResponse.json();
                const allDisb = Array.isArray(disbData) ? disbData : disbData.content || [];
                const clientId = rowData.clientId || rowData.client?.id || account?.client?.id;
                if (clientId) {
                    const clientDisb = allDisb.filter((d: any) =>
                        (d.clientId === clientId || d.application?.clientId === clientId || d.client?.id === clientId) &&
                        d.status === 'COMPLETED'
                    );
                    const schedResponse = await fetch(`${SCHEDULES_URL}/findall`, { method: 'GET', headers, credentials: 'include' });
                    let allSchedules: any[] = [];
                    if (schedResponse.ok) {
                        const schedData = await schedResponse.json();
                        allSchedules = Array.isArray(schedData) ? schedData : schedData.content || [];
                    }
                    const remainingByLoan = new Map<number, number>();
                    allSchedules.forEach((s: any) => {
                        if (s.status !== 'PAID') {
                            const remaining = Math.max(0, (s.totalDue || 0) - (s.totalPaid || 0));
                            remainingByLoan.set(s.loanId, (remainingByLoan.get(s.loanId) || 0) + remaining);
                        }
                    });
                    credits = clientDisb.map((d: any) => ({
                        applicationNumber: d.applicationNumber || d.disbursementNumber || '-',
                        amount: d.amount || 0,
                        status: d.status,
                        remainingBalance: remainingByLoan.get(d.id) || 0,
                        disbursementDate: d.disbursementDate
                    }));
                }
            }
            setPrintCredits(credits);
        } catch (err) {
            setPrintCredits([]);
        }
        setPrintDialog(true);
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML.replace(/src="\/layout\//g, `src="${window.location.origin}/layout/`);
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<!DOCTYPE html><html><head><title>Capacite Financiere - ${selectedRequest?.requestNumber}</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; padding: 15mm; } @page { margin: 15mm; } @media print { body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>${printContent}</body></html>`);
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

    const resultBodyTemplate = (row: any) => {
        const isSuffisante = row.notes?.includes('RESULTAT: SUFFISANTE');
        return <Tag value={isSuffisante ? 'Suffisante' : 'Insuffisante'} severity={isSuffisante ? 'success' : 'danger'} />;
    };

    const actionsBodyTemplate = (rowData: any) => {
        const isPending = rowData.status === 'PENDING';
        const isValidated = rowData.status === 'VALIDATED';
        const isDelivered = rowData.status === 'DELIVERED';
        return (
            <div className="flex gap-1 flex-wrap">
                <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm" onClick={() => { setSelectedRequest(rowData); setViewDialog(true); }} tooltip="Voir" />
                {isPending && can('EPARGNE_STATEMENT_VALIDATE') && (
                    <Button icon="pi pi-check" className="p-button-rounded p-button-success p-button-sm" onClick={() => {
                        confirmDialog({
                            message: `Valider la demande ${rowData.requestNumber} (frais: ${formatCurrency(rowData.feeAmount)}) ?`,
                            header: 'Valider',
                            icon: 'pi pi-check-circle',
                            acceptClassName: 'p-button-success',
                            acceptLabel: 'Oui, valider',
                            rejectLabel: 'Annuler',
                            accept: () => actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/validate/${rowData.id}`, 'validate')
                        });
                    }} tooltip="Valider" />
                )}
                {isPending && can('EPARGNE_STATEMENT_VALIDATE') && (
                    <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-sm" onClick={() => { setSelectedRequest(rowData); setRejectionReason(''); setRejectDialog(true); }} tooltip="Rejeter" />
                )}
                {isPending && (
                    <Button icon="pi pi-ban" className="p-button-rounded p-button-warning p-button-sm" onClick={() => {
                        confirmDialog({
                            message: `Annuler la demande ${rowData.requestNumber} ?`,
                            header: 'Annuler',
                            icon: 'pi pi-exclamation-triangle',
                            acceptClassName: 'p-button-danger',
                            acceptLabel: 'Oui, annuler',
                            rejectLabel: 'Non',
                            accept: () => actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/cancel/${rowData.id}`, 'cancel')
                        });
                    }} tooltip="Annuler" />
                )}
                {isValidated && can('EPARGNE_STATEMENT_DELIVER') && (
                    <Button icon="pi pi-send" className="p-button-rounded p-button-success p-button-sm" onClick={() => {
                        const clientName = getClientDisplayName(rowData.client);
                        confirmDialog({
                            message: `Livrer l'attestation a ${clientName} ?`,
                            header: 'Livrer',
                            icon: 'pi pi-send',
                            acceptClassName: 'p-button-success',
                            acceptLabel: 'Oui, livrer',
                            rejectLabel: 'Annuler',
                            accept: () => actionsApi.fetchData({ deliveredToName: clientName, userAction: getCurrentUser() }, 'POST', `${BASE_URL}/deliver/${rowData.id}`, 'deliver')
                        });
                    }} tooltip="Livrer" />
                )}
                {(isValidated || isDelivered) && (
                    <Button icon="pi pi-print" className="p-button-rounded p-button-secondary p-button-sm" onClick={() => openPrintDialog(rowData)} tooltip="Imprimer" />
                )}
            </div>
        );
    };

    const tableColumns = (
        <>
            <Column field="requestNumber" header="N° Demande" sortable />
            <Column header="Client" body={(row) => getClientDisplayName(row.client)} sortable />
            <Column field="accountNumber" header="N° Compte" sortable />
            <Column field="requestDate" header="Date" sortable />
            <Column field="feeAmount" header="Frais" sortable body={(row) => formatCurrency(row.feeAmount)} />
            <Column header="Capacite" body={resultBodyTemplate} />
            <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
            <Column field="userAction" header="Utilisateur" sortable />
            <Column header="Actions" body={actionsBodyTemplate} style={{ width: '220px' }} />
        </>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="text-primary mb-4">
                <i className="pi pi-chart-line mr-2"></i>
                Demande de Capacite Financiere
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
                            <span><strong>Analyse:</strong> Epargne vs Total Dettes Credits</span>
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
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-3">
                                <h5 className="mb-3"><i className="pi pi-wallet mr-2"></i>1. Selection du Compte Client</h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold">Compte d'Epargne *</label>
                                        <Dropdown
                                            value={selectedAccountId}
                                            options={savingsAccounts.map(a => ({ label: `${a.accountNumber} - ${getClientDisplayName(a.client)}`, value: a.id }))}
                                            onChange={(e) => handleAccountChange(e.value)}
                                            placeholder="Selectionner un compte"
                                            className="w-full" filter filterPlaceholder="Rechercher..."
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Agence</label>
                                        <Dropdown
                                            value={selectedBranchId}
                                            options={branches.map(b => ({ label: b.name, value: b.id }))}
                                            onChange={(e) => setSelectedBranchId(e.value)}
                                            placeholder="Agence" className="w-full"
                                        />
                                    </div>
                                    <div className="field col-12 md:col-2 flex align-items-end">
                                        <Button label="Verifier" icon="pi pi-search" onClick={verifyClient} className="w-full" severity="info" loading={verifying} disabled={!selectedAccountId} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {verifying && (
                            <div className="col-12">
                                <div className="flex align-items-center justify-content-center gap-3 p-4">
                                    <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                                    <span className="text-600">Analyse de la capacite financiere en cours...</span>
                                </div>
                            </div>
                        )}

                        {verificationDone && (
                            <div className="col-12">
                                <div className={`p-3 border-round mb-3 ${isCapaciteSuffisante ? 'bg-green-50 border-green-200 border-1' : 'bg-red-50 border-red-200 border-1'}`}>
                                    <h5 className="mb-3">
                                        <i className={`pi ${isCapaciteSuffisante ? 'pi-check-circle text-green-600' : 'pi-exclamation-triangle text-red-600'} mr-2`}></i>
                                        2. Resultat de l'Analyse de Capacite Financiere
                                    </h5>
                                    <div className="grid mb-3">
                                        <div className="col-12 md:col-4">
                                            <Message severity="info" text={`Solde Epargne: ${formatCurrency(savingsBalance)}`} className="w-full" />
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <Message severity={totalRemainingDebt === 0 ? 'success' : 'warn'} text={`Total Dettes: ${formatCurrency(totalRemainingDebt)}`} className="w-full" />
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <Message severity={isCapaciteSuffisante ? 'success' : 'error'} text={isCapaciteSuffisante ? 'CAPACITE FINANCIERE SUFFISANTE' : 'CAPACITE FINANCIERE INSUFFISANTE'} className="w-full" />
                                        </div>
                                    </div>
                                    {clientCredits.length > 0 && (
                                        <div className="mb-3">
                                            <h6 className="mb-2">Detail des credits du client:</h6>
                                            <DataTable value={clientCredits} size="small" stripedRows showGridlines>
                                                <Column field="applicationNumber" header="N° Dossier" />
                                                <Column field="amount" header="Montant" body={(row) => formatCurrency(row.amount)} />
                                                <Column field="disbursementDate" header="Date Decaissement" />
                                                <Column header="Reste a Payer" body={(row) => (
                                                    <span className={row.remainingBalance > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{formatCurrency(row.remainingBalance)}</span>
                                                )} />
                                                <Column header="Statut" body={(row) => <Tag value={row.remainingBalance > 0 ? 'En cours' : 'Solde'} severity={row.remainingBalance > 0 ? 'danger' : 'success'} />} />
                                            </DataTable>
                                        </div>
                                    )}
                                    {clientCredits.length === 0 && (
                                        <p className="text-600 m-0"><i className="pi pi-info-circle mr-2"></i>Aucun credit trouve pour ce client — capacite financiere non obstruee.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {verificationDone && (
                            <div className="col-12">
                                <div className="surface-100 p-3 border-round mb-3">
                                    <h5 className="mb-3"><i className="pi pi-money-bill mr-2"></i>3. Frais et Soumission</h5>
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-3">
                                            <label className="font-semibold">Frais d'Attestation (FBU) *</label>
                                            <InputNumber value={feeAmount} onValueChange={(e) => setFeeAmount(e.value ?? 0)} className="w-full" mode="decimal" locale="fr-BI" />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold">Compte Revenus *</label>
                                            <Dropdown
                                                value={feeAccountId}
                                                options={comptesComptables.map(c => ({ label: c.libelle, value: c.compteId }))}
                                                onChange={(e) => setFeeAccountId(e.value)}
                                                placeholder="Selectionner un compte" className="w-full" filter filterPlaceholder="Rechercher..."
                                            />
                                        </div>
                                        <div className="field col-12 md:col-5">
                                            <label className="font-semibold">Motif</label>
                                            <InputText value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Demande de capacite financiere" className="w-full" />
                                        </div>
                                        <div className="field col-12">
                                            <label className="font-semibold">Notes</label>
                                            <InputTextarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full" placeholder="Notes complementaires..." />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button label="Creer la Demande" icon="pi pi-save" onClick={handleSubmit} className="p-button-success" disabled={!can('EPARGNE_CAPACITE_FINANCIERE_CREATE')} />
                                        <Button label="Reinitialiser" icon="pi pi-refresh" onClick={resetForm} className="p-button-secondary" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Demandes" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={requests} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading} globalFilter={globalFilter}
                        header={
                            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                <h5 className="m-0">Demandes de Capacite Financiere</h5>
                                <span className="p-input-icon-left"><i className="pi pi-search" /><InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." /></span>
                            </div>
                        }
                        emptyMessage="Aucune demande de capacite financiere trouvee"
                        stripedRows showGridlines size="small" sortField="requestDate" sortOrder={-1}
                    >
                        {tableColumns}
                    </DataTable>
                </TabPanel>

                {can('EPARGNE_CAPACITE_FINANCIERE_VIEW_TODAY') && <TabPanel header="Demandes du Jour" leftIcon="pi pi-calendar mr-2">
                    <DataTable
                        value={requests.filter(r => r.requestDate === formatLocalDate(new Date()))}
                        paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading} globalFilter={globalFilter}
                        header={
                            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                <h5 className="m-0">Demandes de Capacite Financiere du Jour</h5>
                                <span className="p-input-icon-left"><i className="pi pi-search" /><InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." /></span>
                            </div>
                        }
                        emptyMessage="Aucune demande de capacite financiere pour aujourd'hui"
                        stripedRows showGridlines size="small" sortField="requestDate" sortOrder={-1}
                    >
                        {tableColumns}
                    </DataTable>
                </TabPanel>}

                {can('EPARGNE_CAPACITE_FINANCIERE_VIEW_PERIOD') && <TabPanel header="Mes Demandes par Période" leftIcon="pi pi-filter mr-2">
                    {(() => {
                        const currentUser = getCurrentUser();
                        const filtered = requests.filter(r => {
                            if (r.userAction !== currentUser) return false;
                            if (periodStart && r.requestDate && r.requestDate < formatLocalDate(periodStart)) return false;
                            if (periodEnd && r.requestDate && r.requestDate > formatLocalDate(periodEnd)) return false;
                            return true;
                        });
                        return (
                            <DataTable
                                value={filtered}
                                paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={loading}
                                header={
                                    <div className="flex flex-column gap-2">
                                        <div>
                                            <h5 className="m-0">Mes Demandes de Capacite Financiere par Periode</h5>
                                            <small className="text-500">Utilisateur: <strong>{currentUser}</strong> — {filtered.length} demande(s)</small>
                                        </div>
                                        <div className="flex flex-wrap gap-2 align-items-center">
                                            <label className="font-medium">Du:</label>
                                            <Calendar value={periodStart} onChange={(e) => setPeriodStart(e.value as Date | null)} dateFormat="dd/mm/yy" placeholder="Date début" showIcon />
                                            <label className="font-medium">Au:</label>
                                            <Calendar value={periodEnd} onChange={(e) => setPeriodEnd(e.value as Date | null)} dateFormat="dd/mm/yy" placeholder="Date fin" showIcon minDate={periodStart || undefined} />
                                            <Button label="Réinitialiser" icon="pi pi-refresh" onClick={() => { setPeriodStart(null); setPeriodEnd(null); }} className="p-button-secondary p-button-sm" />
                                        </div>
                                    </div>
                                }
                                emptyMessage="Aucune demande trouvee pour cette periode"
                                stripedRows showGridlines size="small" sortField="requestDate" sortOrder={-1}
                            >
                                {tableColumns}
                            </DataTable>
                        );
                    })()}
                </TabPanel>}
            </TabView>

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
                                <div className="col-12"><small className="text-600">Notes / Resultat</small><p className="font-semibold mt-1">{selectedRequest.notes}</p></div>
                            )}
                            {selectedRequest.rejectionReason && (
                                <div className="col-12"><small className="text-600">Motif de rejet</small><p className="font-semibold mt-1 text-red-600">{selectedRequest.rejectionReason}</p></div>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>

            <Dialog header="Rejeter la Demande" visible={rejectDialog} style={{ width: '450px' }} onHide={() => setRejectDialog(false)}
                footer={<div><Button label="Fermer" icon="pi pi-times" onClick={() => setRejectDialog(false)} className="p-button-text" /><Button label="Rejeter" icon="pi pi-ban" onClick={() => { if (selectedRequest && rejectionReason) actionsApi.fetchData({ rejectionReason, userAction: getCurrentUser() }, 'POST', `${BASE_URL}/reject/${selectedRequest.id}`, 'reject'); }} className="p-button-danger" disabled={!rejectionReason} /></div>}>
                <div className="p-fluid">
                    <p className="text-500 mb-3">Demande: <strong>{selectedRequest?.requestNumber}</strong></p>
                    <div className="field">
                        <label className="font-medium">Motif du rejet *</label>
                        <InputTextarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} placeholder="Expliquez la raison du rejet..." className="w-full" />
                    </div>
                </div>
            </Dialog>

            <Dialog header="Apercu - Capacite Financiere" visible={printDialog} style={{ width: '950px' }} onHide={() => setPrintDialog(false)}
                footer={<div className="flex justify-content-end gap-2"><Button label="Fermer" icon="pi pi-times" onClick={() => setPrintDialog(false)} className="p-button-text" /><Button label="Imprimer" icon="pi pi-print" onClick={handlePrint} className="p-button-success" /></div>}>
                {selectedRequest && (
                    <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                        <PrintableCapaciteFinanciereReceipt
                            ref={printRef}
                            request={selectedRequest}
                            savingsAccount={printAccount}
                            credits={printCredits}
                            companyName="AGRINOVA MICROFINANCE"
                            companyAddress="Bujumbura, Burundi"
                            companyPhone="+257 22 69 21 01 93"
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
            <CapaciteFinancierePage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
