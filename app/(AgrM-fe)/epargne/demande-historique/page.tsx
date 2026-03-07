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
import { Dialog } from 'primereact/dialog';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { StatementRequest, StatementRequestClass, StatementRequestStatus } from '../demande-situation/StatementRequest';
import StatementRequestForm from '../demande-situation/StatementRequestForm';
import PrintableHistoriqueReceipt from './PrintableHistoriqueReceipt';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';
import { getClientDisplayName } from '@/utils/clientUtils';

const REQUEST_TYPE = 'HISTORIQUE';

const BASE_URL = `${API_BASE_URL}/api/epargne/statement-requests`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const INTERNAL_ACCOUNTS_URL = `${API_BASE_URL}/api/comptability/internal-accounts`;
const REPORTS_URL = `${API_BASE_URL}/api/epargne/reports`;

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

function HistoriqueRequestPage() {
    const { can } = useAuthorizedAction();
    const [request, setRequest] = useState<StatementRequest>({ ...new StatementRequestClass(), requestType: REQUEST_TYPE });
    const [requests, setRequests] = useState<StatementRequest[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [comptesComptables, setComptesComptables] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [deliverDialog, setDeliverDialog] = useState(false);
    const [printDialog, setPrintDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<StatementRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [deliveredToName, setDeliveredToName] = useState('');
    const [operations, setOperations] = useState<any[]>([]);
    const [operationsTotals, setOperationsTotals] = useState({
        totalOperations: 0, totalDebits: 0, totalCredits: 0,
        netMovement: 0, openingBalance: 0, closingBalance: 0
    });
    const [loadingOperations, setLoadingOperations] = useState(false);
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const branchesApi = useConsumApi('');
    const savingsApi = useConsumApi('');
    const comptesApi = useConsumApi('');
    const requestsApi = useConsumApi('');
    const actionsApi = useConsumApi('');
    const operationsApi = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadRequests();
    }, []);

    useEffect(() => {
        if (branchesApi.data) setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
        if (branchesApi.error) showToast('error', 'Erreur', branchesApi.error.message || 'Erreur lors du chargement des agences');
    }, [branchesApi.data, branchesApi.error]);

    useEffect(() => {
        if (savingsApi.data) setSavingsAccounts(Array.isArray(savingsApi.data) ? savingsApi.data : []);
        if (savingsApi.error) showToast('error', 'Erreur', savingsApi.error.message || 'Erreur lors du chargement des comptes');
    }, [savingsApi.data, savingsApi.error]);

    useEffect(() => {
        if (comptesApi.data) {
            const data = Array.isArray(comptesApi.data) ? comptesApi.data : [];
            const mapped = data
                .filter((a: any) => a.actif !== false && a.codeCompte === '708')
                .map((a: any) => ({
                    compteId: a.compteComptableId,
                    codeCompte: a.codeCompte,
                    libelle: `${a.accountNumber} - ${a.libelle} (${a.codeCompte})`
                }));
            setComptesComptables(mapped);
            // Auto-select 708 for HISTORIQUE
            if (mapped.length > 0) {
                setRequest(prev => prev.feeAccountId ? prev : { ...prev, feeAccountId: mapped[0].compteId });
            }
        }
        if (comptesApi.error) showToast('error', 'Erreur', comptesApi.error.message || 'Erreur lors du chargement des comptes internes');
    }, [comptesApi.data, comptesApi.error]);

    useEffect(() => {
        if (requestsApi.data) {
            const data = Array.isArray(requestsApi.data) ? requestsApi.data : requestsApi.data?.content || [];
            setRequests(data.filter((r: StatementRequest) => r.requestType === REQUEST_TYPE));
            setLoading(false);
        }
        if (requestsApi.error) {
            showToast('error', 'Erreur', requestsApi.error.message || 'Erreur lors du chargement des demandes');
            setLoading(false);
        }
    }, [requestsApi.data, requestsApi.error]);

    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Demande d\'historique créée avec succès');
                    resetForm();
                    loadRequests();
                    setActiveIndex(1);
                    break;
                case 'validate':
                    showToast('success', 'Succès', 'Demande validée — frais débités du compte');
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
                case 'deliver':
                    showToast('success', 'Succès', 'Historique livré au client');
                    setDeliverDialog(false);
                    loadRequests();
                    break;
            }
        }
        if (actionsApi.error) showToast('error', 'Erreur', actionsApi.error.message || 'Une erreur est survenue');
    }, [actionsApi.data, actionsApi.error, actionsApi.callType]);

    useEffect(() => {
        if (operationsApi.data) {
            const responseData = operationsApi.data;
            const ops = responseData.data || responseData.content || [];
            setOperations(Array.isArray(ops) ? ops : []);
            setOperationsTotals({
                totalOperations: responseData.totalOperations || ops.length || 0,
                totalDebits: responseData.totalDebits || 0,
                totalCredits: responseData.totalCredits || 0,
                netMovement: responseData.netMovement || 0,
                openingBalance: responseData.openingBalance || 0,
                closingBalance: responseData.closingBalance || 0
            });
            setLoadingOperations(false);
            setPrintDialog(true);
        }
        if (operationsApi.error) {
            showToast('warn', 'Attention', 'Impossible de charger les opérations. Le reçu sera imprimé sans détail.');
            setOperations([]);
            setOperationsTotals({ totalOperations: 0, totalDebits: 0, totalCredits: 0, netMovement: 0, openingBalance: 0, closingBalance: 0 });
            setLoadingOperations(false);
            setPrintDialog(true);
        }
    }, [operationsApi.data, operationsApi.error]);

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

    const handleSavingsAccountChange = (accountId: number) => {
        if (accountId) {
            const selectedAccount = savingsAccounts.find(acc => acc.id === accountId);
            if (selectedAccount && selectedAccount.client) {
                setRequest(prev => ({
                    ...prev,
                    savingsAccountId: accountId,
                    clientId: selectedAccount.client.id,
                    branchId: selectedAccount.branch?.id || prev.branchId
                }));
            }
        }
    };

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '0 FBU';
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const validateForm = (): boolean => {
        if (!request.savingsAccountId) { showToast('warn', 'Attention', 'Veuillez sélectionner un compte d\'épargne'); return false; }
        if (!request.branchId) { showToast('warn', 'Attention', 'Veuillez sélectionner une agence'); return false; }
        if (!request.periodStart) { showToast('warn', 'Attention', 'Veuillez sélectionner la date de début de la période'); return false; }
        if (!request.periodEnd) { showToast('warn', 'Attention', 'Veuillez sélectionner la date de fin de la période'); return false; }
        if (!request.feeAccountId) { showToast('warn', 'Attention', 'Veuillez sélectionner le compte comptable de revenus (ex: 708)'); return false; }
        if (!request.feeAmount || request.feeAmount <= 0) { showToast('warn', 'Attention', 'Les frais doivent être supérieurs à 0'); return false; }
        const selectedAccount = savingsAccounts.find(acc => acc.id === request.savingsAccountId);
        if (selectedAccount) {
            const balance = selectedAccount.currentBalance || 0;
            if (balance < request.feeAmount) {
                showToast('warn', 'Attention', `Solde insuffisant. Solde actuel: ${formatCurrency(balance)}, Frais requis: ${formatCurrency(request.feeAmount)}`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const selectedAccount = savingsAccounts.find(acc => acc.id === request.savingsAccountId);
        const selectedCompte = comptesComptables.find((c: any) => c.compteId === request.feeAccountId);
        const requestData = {
            ...request,
            requestType: REQUEST_TYPE,
            clientId: selectedAccount?.client?.id || request.clientId,
            feeAccountCode: selectedCompte?.codeCompte || '708',
            userAction: getCurrentUser()
        };
        actionsApi.fetchData(requestData, 'POST', `${BASE_URL}/new`, 'create');
    };

    const resetForm = () => {
        const autoSelect = comptesComptables.find((c: any) => c.codeCompte === '708');
        setRequest({ ...new StatementRequestClass(), requestType: REQUEST_TYPE, feeAccountId: autoSelect?.compteId });
    };

    const viewRequest = (rowData: StatementRequest) => {
        setSelectedRequest({ ...rowData, clientId: rowData.clientId || rowData.client?.id, branchId: rowData.branchId || rowData.branch?.id });
        setViewDialog(true);
    };

    const validateRequest = (rowData: StatementRequest) => {
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

    const openRejectDialog = (rowData: StatementRequest) => { setSelectedRequest(rowData); setRejectionReason(''); setRejectDialog(true); };

    const handleReject = () => {
        if (selectedRequest && rejectionReason) {
            actionsApi.fetchData({ rejectionReason, userAction: getCurrentUser() }, 'POST', `${BASE_URL}/reject/${selectedRequest.id}`, 'reject');
        }
    };

    const cancelRequest = (rowData: StatementRequest) => {
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

    const openDeliverDialog = (rowData: StatementRequest) => {
        setSelectedRequest(rowData);
        const clientName = getClientDisplayName(rowData.client);
        setDeliveredToName(clientName === '-' ? '' : clientName);
        setDeliverDialog(true);
    };

    const handleDeliver = () => {
        if (selectedRequest) {
            actionsApi.fetchData({ deliveredToName, userAction: getCurrentUser() }, 'POST', `${BASE_URL}/deliver/${selectedRequest.id}`, 'deliver');
        }
    };

    const openPrintDialog = (rowData: StatementRequest) => {
        setSelectedRequest(rowData);
        setLoadingOperations(true);
        setOperations([]);
        const accountId = rowData.savingsAccountId || (rowData as any).savingsAccount?.id;
        if (accountId) {
            const params = new URLSearchParams();
            params.append('accountId', String(accountId));
            if (rowData.periodStart) params.append('dateFrom', rowData.periodStart);
            if (rowData.periodEnd) params.append('dateTo', rowData.periodEnd);
            operationsApi.fetchData(null, 'GET', `${REPORTS_URL}/operation-history?${params.toString()}`, 'loadOperations');
        } else {
            setLoadingOperations(false);
            setPrintDialog(true);
        }
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML.replace(/src="\/layout\//g, `src="${window.location.origin}/layout/`);
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<!DOCTYPE html><html><head><title>Historique - ${selectedRequest?.requestNumber}</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; padding: 15mm; } @page { margin: 15mm; } @media print { body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>${printContent}</body></html>`);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
            }
        }
    };

    const statusBodyTemplate = (rowData: StatementRequest) => {
        let severity: 'success' | 'info' | 'warning' | 'danger' = 'info';
        let label = rowData.status;
        switch (rowData.status) {
            case StatementRequestStatus.PENDING: severity = 'warning'; label = 'En attente'; break;
            case StatementRequestStatus.VALIDATED: severity = 'info'; label = 'Validé'; break;
            case StatementRequestStatus.DELIVERED: severity = 'success'; label = 'Livré'; break;
            case StatementRequestStatus.REJECTED: severity = 'danger'; label = 'Rejeté'; break;
            case StatementRequestStatus.CANCELLED: severity = 'danger'; label = 'Annulé'; break;
        }
        return <Tag value={label} severity={severity} />;
    };

    const clientBodyTemplate = (rowData: StatementRequest) => {
        return getClientDisplayName(rowData.client);
    };

    const actionsBodyTemplate = (rowData: StatementRequest) => {
        const isPending = rowData.status === StatementRequestStatus.PENDING;
        const isValidated = rowData.status === StatementRequestStatus.VALIDATED;
        const isDelivered = rowData.status === StatementRequestStatus.DELIVERED;
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
                    <Button icon="pi pi-send" className="p-button-rounded p-button-success p-button-sm" onClick={() => openDeliverDialog(rowData)} tooltip="Livrer" />
                )}
                {canPrint && (
                    <Button icon="pi pi-print" className="p-button-rounded p-button-secondary p-button-sm" onClick={() => openPrintDialog(rowData)} tooltip="Imprimer historique" loading={loadingOperations} />
                )}
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Demandes d'Historique</h5>
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
                <i className="pi pi-history mr-2"></i>
                Demande d'Historique des Opérations
            </h4>

            <div className="surface-100 p-3 border-round mb-4">
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span><strong>Frais par défaut:</strong> 1 000 FBU</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-orange-500"></i>
                            <span><strong>Compte revenus:</strong> 708 (Frais d'historique)</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-green-500"></i>
                            <span><strong>Cycle:</strong> Création → Validation → Livraison</span>
                        </div>
                    </div>
                </div>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Demande" leftIcon="pi pi-plus mr-2">
                    <StatementRequestForm
                        request={request}
                        setRequest={setRequest}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        comptesComptables={comptesComptables}
                        onSavingsAccountChange={handleSavingsAccountChange}
                        fixedRequestType="HISTORIQUE"
                    />
                    <div className="flex gap-2 mt-4">
                        <Button label="Créer la Demande" icon="pi pi-save" onClick={handleSubmit} className="p-button-success" disabled={!can('EPARGNE_STATEMENT_CREATE')} />
                        <Button label="Réinitialiser" icon="pi pi-refresh" onClick={resetForm} className="p-button-secondary" />
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Demandes" leftIcon="pi pi-list mr-2">
                    <DataTable value={requests} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading} globalFilter={globalFilter} header={header} emptyMessage="Aucune demande d'historique trouvée" stripedRows showGridlines size="small" sortField="requestDate" sortOrder={-1}>
                        <Column field="requestNumber" header="N° Demande" sortable />
                        <Column field="client" header="Client" body={clientBodyTemplate} sortable />
                        <Column field="requestDate" header="Date" sortable />
                        <Column header="Période" body={(row: StatementRequest) => {
                            if (row.periodStart && row.periodEnd) {
                                const [ys, ms, ds] = row.periodStart.split('-').map(Number);
                                const [ye, me, de] = row.periodEnd.split('-').map(Number);
                                return `${new Date(ys, ms - 1, ds).toLocaleDateString('fr-FR')} — ${new Date(ye, me - 1, de).toLocaleDateString('fr-FR')}`;
                            }
                            return '-';
                        }} />
                        <Column field="feeAmount" header="Frais" sortable body={(row) => formatCurrency(row.feeAmount)} />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '220px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* View Dialog */}
            <Dialog header="Détails de la Demande" visible={viewDialog} style={{ width: '800px' }} onHide={() => setViewDialog(false)}>
                {selectedRequest && (
                    <StatementRequestForm request={selectedRequest} setRequest={() => {}} branches={branches} savingsAccounts={savingsAccounts} comptesComptables={comptesComptables} isViewMode={true} />
                )}
            </Dialog>

            {/* Reject Dialog */}
            <Dialog header="Rejeter la Demande" visible={rejectDialog} style={{ width: '450px' }} onHide={() => setRejectDialog(false)}
                footer={<div><Button label="Fermer" icon="pi pi-times" onClick={() => setRejectDialog(false)} className="p-button-text" /><Button label="Rejeter" icon="pi pi-ban" onClick={handleReject} className="p-button-danger" disabled={!rejectionReason} /></div>}>
                <div className="p-fluid">
                    <p className="text-500 mb-3">Demande: <strong>{selectedRequest?.requestNumber}</strong><br />Frais: <strong>{formatCurrency(selectedRequest?.feeAmount)}</strong></p>
                    <div className="field">
                        <label htmlFor="rejectionReason" className="font-medium">Motif du rejet *</label>
                        <InputTextarea id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} placeholder="Expliquez la raison du rejet..." className="w-full" />
                    </div>
                </div>
            </Dialog>

            {/* Deliver Dialog */}
            <Dialog header="Livraison de l'Historique" visible={deliverDialog} style={{ width: '450px' }} onHide={() => setDeliverDialog(false)}
                footer={<div><Button label="Fermer" icon="pi pi-times" onClick={() => setDeliverDialog(false)} className="p-button-text" /><Button label="Confirmer la livraison" icon="pi pi-check" onClick={handleDeliver} className="p-button-success" /></div>}>
                <div className="p-fluid">
                    <p className="text-500 mb-3">Demande: <strong>{selectedRequest?.requestNumber}</strong><br />Client: <strong>{getClientDisplayName(selectedRequest?.client)}</strong></p>
                    <div className="field">
                        <label htmlFor="deliveredToName" className="font-medium">Remis à (nom du bénéficiaire)</label>
                        <InputText id="deliveredToName" value={deliveredToName} onChange={(e) => setDeliveredToName(e.target.value)} placeholder="Nom de la personne qui récupère le document..." className="w-full" />
                    </div>
                </div>
            </Dialog>

            {/* Print Dialog */}
            <Dialog header="Aperçu de l'Historique" visible={printDialog} style={{ width: '950px' }} onHide={() => setPrintDialog(false)}
                footer={<div className="flex justify-content-end gap-2"><Button label="Fermer" icon="pi pi-times" onClick={() => setPrintDialog(false)} className="p-button-text" /><Button label="Imprimer" icon="pi pi-print" onClick={handlePrint} className="p-button-success" /></div>}>
                {selectedRequest && (
                    <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                        <PrintableHistoriqueReceipt
                            ref={printRef}
                            request={selectedRequest}
                            operations={operations}
                            totals={operationsTotals}
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
            <HistoriqueRequestPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
