'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

interface ScheduleDetail {
    scheduleId: number;
    installmentNumber: number;
    dueDate: string;
    amountDue: number;
    principalDue: number;
    interestDue: number;
    penaltyAccrued: number;
    status: string;
    daysOverdue: number;
}

interface LoanPreview {
    loanId: number;
    schedulesCount: number;
    totalAmountDue: number;
    clientId: number;
    clientName: string;
    applicationNumber: string;
    savingsAccountId: number | null;
    savingsAccountNumber: string | null;
    availableBalance: number;
    schedulesPayable: number;
    amountPayable: number;
    canProcessAll: boolean;
    canProcessSome: boolean;
    shortfall: number;
    schedules: ScheduleDetail[];
}

interface ProcessingResult {
    batchNumber: string;
    processingDate: string;
    startTime: string;
    endTime: string;
    totalLoansProcessed: number;
    totalSchedulesProcessed: number;
    successCount: number;
    failedCount: number;
    insufficientBalanceCount: number;
    totalAmountProcessed: number;
    processedPayments: any[];
    failedPayments: any[];
    insufficientBalancePayments: any[];
}

interface Statistics {
    processingDate: string;
    totalLoans: number;
    totalSchedules: number;
    canProcessAllLoans: number;
    canProcessSomeLoans: number;
    cannotProcessLoans: number;
    totalSchedulesPayable: number;
    totalAmountDue: number;
    totalAmountPayable: number;
    totalShortfall: number;
}

interface BatchHistory {
    id: number;
    batchNumber: string;
    processingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    totalLoansProcessed: number;
    totalSchedulesFound: number;
    totalSchedulesProcessed: number;
    successCount: number;
    failedCount: number;
    insufficientBalanceCount: number;
    totalAmountDue: number;
    totalAmountProcessed: number;
    totalShortfall: number;
    executedBy: string;
    userAction: string;
    createdAt: string;
}

interface BatchDetail {
    id: number;
    loanId: number;
    applicationNumber: string;
    clientId: number;
    clientName: string;
    scheduleId: number;
    installmentNumber: number;
    dueDate: string;
    daysOverdue: number;
    amountDue: number;
    amountPaid: number;
    principalDue: number;
    interestDue: number;
    penaltyDue: number;
    savingsAccountId: number;
    savingsAccountNumber: string;
    balanceBefore: number;
    balanceAfter: number;
    paymentId: number;
    paymentNumber: string;
    status: string;
    errorMessage: string;
    shortfall: number;
}

const PrelevementAutomatiquePage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [processingDate, setProcessingDate] = useState<Date | null>(new Date());
    const [previewData, setPreviewData] = useState<LoanPreview[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [expandedRows, setExpandedRows] = useState<any>(null);

    // History state
    const [historyData, setHistoryData] = useState<BatchHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<BatchHistory | null>(null);
    const [batchDetails, setBatchDetails] = useState<BatchDetail[]>([]);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Search/Filter state
    const [searchBatchNumber, setSearchBatchNumber] = useState('');
    const [searchStartDate, setSearchStartDate] = useState<Date | null>(null);
    const [searchEndDate, setSearchEndDate] = useState<Date | null>(null);
    const [searchStatus, setSearchStatus] = useState<string | null>(null);
    const [searchCreditNumber, setSearchCreditNumber] = useState('');
    const [searchSavingsAccount, setSearchSavingsAccount] = useState('');

    // Detail search state
    const [searchApplicationNumber, setSearchApplicationNumber] = useState('');
    const [searchPaymentNumber, setSearchPaymentNumber] = useState('');
    const [searchAccountNumber, setSearchAccountNumber] = useState('');
    const [searchDetailStatus, setSearchDetailStatus] = useState<string | null>(null);

    const statusOptions = [
        { label: 'Tous les statuts', value: null },
        { label: 'Complété', value: 'COMPLETED' },
        { label: 'Partiel', value: 'PARTIAL' },
        { label: 'Échec', value: 'FAILED' }
    ];

    const detailStatusOptions = [
        { label: 'Tous les statuts', value: null },
        { label: 'Succès', value: 'SUCCESS' },
        { label: 'Solde Insuffisant', value: 'INSUFFICIENT_BALANCE' },
        { label: 'Échec', value: 'FAILED' },
        { label: 'Pas de Compte', value: 'NO_SAVINGS_ACCOUNT' }
    ];

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/automatic-payments');

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 5000 });
    };

    // Load history when tab changes
    useEffect(() => {
        if (activeTab === 1) {
            loadHistory();
        }
    }, [activeTab]);

    const loadHistory = async () => {
        setHistoryLoading(true);
        let url = `${BASE_URL}/history?page=0&size=50`;

        if (searchStartDate && searchEndDate) {
            const startStr = searchStartDate.toISOString().split('T')[0];
            const endStr = searchEndDate.toISOString().split('T')[0];
            url += `&startDate=${startStr}&endDate=${endStr}`;
        }

        if (searchCreditNumber) {
            url += `&applicationNumber=${encodeURIComponent(searchCreditNumber)}`;
        }

        if (searchSavingsAccount) {
            url += `&savingsAccountNumber=${encodeURIComponent(searchSavingsAccount)}`;
        }

        fetchData(null, 'GET', url, 'history');
    };

    const handleSearch = () => {
        loadHistory();
    };

    const handleClearSearch = () => {
        setSearchBatchNumber('');
        setSearchStartDate(null);
        setSearchEndDate(null);
        setSearchStatus(null);
        setSearchCreditNumber('');
        setSearchSavingsAccount('');
        loadHistory();
    };

    // Filter history data based on search criteria (client-side filtering for batch number and status)
    const filteredHistoryData = historyData.filter(batch => {
        let matches = true;

        if (searchBatchNumber) {
            matches = matches && batch.batchNumber.toLowerCase().includes(searchBatchNumber.toLowerCase());
        }

        if (searchStatus) {
            matches = matches && batch.status === searchStatus;
        }

        return matches;
    });

    // Filter batch details based on search criteria
    const filteredBatchDetails = batchDetails.filter(detail => {
        let matches = true;

        if (searchApplicationNumber) {
            matches = matches && (detail.applicationNumber?.toLowerCase().includes(searchApplicationNumber.toLowerCase()) || false);
        }

        if (searchPaymentNumber) {
            matches = matches && (detail.paymentNumber?.toLowerCase().includes(searchPaymentNumber.toLowerCase()) || false);
        }

        if (searchAccountNumber) {
            matches = matches && (detail.savingsAccountNumber?.toLowerCase().includes(searchAccountNumber.toLowerCase()) || false);
        }

        if (searchDetailStatus) {
            matches = matches && detail.status === searchDetailStatus;
        }

        return matches;
    });

    const clearDetailSearch = () => {
        setSearchApplicationNumber('');
        setSearchPaymentNumber('');
        setSearchAccountNumber('');
        setSearchDetailStatus(null);
    };

    const loadBatchDetails = async (batchId: number) => {
        setDetailsLoading(true);
        fetchData(null, 'GET', `${BASE_URL}/history/${batchId}/details?page=0&size=100`, 'batchDetails');
    };

    const handlePreview = async () => {
        if (!processingDate) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une date de traitement');
            return;
        }

        const dateStr = processingDate.toISOString().split('T')[0];
        fetchData(null, 'GET', `${BASE_URL}/preview?processingDate=${dateStr}`, 'preview');
    };

    const handleLoadStatistics = async () => {
        if (!processingDate) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une date de traitement');
            return;
        }

        const dateStr = processingDate.toISOString().split('T')[0];
        fetchData(null, 'GET', `${BASE_URL}/statistics?processingDate=${dateStr}`, 'statistics');
    };

    const handleProcess = () => {
        if (!processingDate) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une date de traitement');
            return;
        }

        const processableLoans = previewData.filter(p => p.canProcessSome || p.canProcessAll).length;
        const totalSchedulesPayable = previewData.reduce((sum, p) => sum + (p.schedulesPayable || 0), 0);

        if (processableLoans === 0) {
            showToast('warn', 'Attention', 'Aucun paiement ne peut être traité. Vérifiez les soldes des comptes épargne.');
            return;
        }

        confirmDialog({
            message: `Êtes-vous sûr de vouloir exécuter le prélèvement automatique pour ${totalSchedulesPayable} échéances impayées sur ${processableLoans} crédits ?`,
            header: 'Confirmation du Prélèvement Automatique',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, Exécuter',
            rejectLabel: 'Non, Annuler',
            accept: () => executeProcess()
        });
    };

    const executeProcess = async () => {
        if (!processingDate) return;

        setIsProcessing(true);
        const dateStr = processingDate.toISOString().split('T')[0];
        const userAction = getUserAction();
        fetchData(null, 'POST', `${BASE_URL}/process?processingDate=${dateStr}&userAction=${encodeURIComponent(userAction)}`, 'process');
    };

    // Handle API responses
    React.useEffect(() => {
        if (data) {
            switch (callType) {
                case 'preview':
                    setPreviewData(Array.isArray(data) ? data : []);
                    const totalSchedules = (Array.isArray(data) ? data : []).reduce((sum: number, loan: LoanPreview) => sum + loan.schedulesCount, 0);
                    showToast('info', 'Aperçu chargé', `${(Array.isArray(data) ? data : []).length} crédits avec ${totalSchedules} échéances impayées trouvées`);
                    handleLoadStatistics();
                    break;
                case 'statistics':
                    setStatistics(data);
                    break;
                case 'process':
                    setIsProcessing(false);
                    setProcessingResult(data);
                    setShowResultDialog(true);
                    showToast('success', 'Traitement terminé',
                        `${data.totalSchedulesProcessed} échéances traitées avec succès`);
                    handlePreview();
                    break;
                case 'history':
                    setHistoryLoading(false);
                    setHistoryData(data.content || []);
                    break;
                case 'batchDetails':
                    setDetailsLoading(false);
                    setBatchDetails(data.content || []);
                    break;
            }
        }
        if (error) {
            setIsProcessing(false);
            setHistoryLoading(false);
            setDetailsLoading(false);
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    // Column templates
    const currencyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const statusTemplate = (rowData: LoanPreview) => {
        if (rowData.canProcessAll) {
            return <Tag severity="success" value="Tout traitable" icon="pi pi-check" />;
        }
        if (rowData.canProcessSome) {
            return <Tag severity="warning" value={`${rowData.schedulesPayable}/${rowData.schedulesCount} traitables`} icon="pi pi-exclamation-triangle" />;
        }
        return <Tag severity="danger" value="Solde insuffisant" icon="pi pi-times" />;
    };

    const scheduleStatusTemplate = (status: string) => {
        const statusColors: { [key: string]: string } = {
            'PENDING': 'info',
            'PARTIAL': 'warning',
            'OVERDUE': 'danger',
            'PAID': 'success'
        };
        return <Tag severity={statusColors[status] as any} value={status} />;
    };

    const batchStatusTemplate = (status: string) => {
        const statusConfig: { [key: string]: { severity: any; icon: string } } = {
            'COMPLETED': { severity: 'success', icon: 'pi pi-check-circle' },
            'PARTIAL': { severity: 'warning', icon: 'pi pi-exclamation-triangle' },
            'FAILED': { severity: 'danger', icon: 'pi pi-times-circle' },
            'PROCESSING': { severity: 'info', icon: 'pi pi-spin pi-spinner' }
        };
        const config = statusConfig[status] || { severity: 'info', icon: 'pi pi-question' };
        return <Tag severity={config.severity} value={status} icon={config.icon} />;
    };

    const detailStatusTemplate = (status: string) => {
        const statusConfig: { [key: string]: { severity: any; label: string } } = {
            'SUCCESS': { severity: 'success', label: 'Succès' },
            'FAILED': { severity: 'danger', label: 'Échec' },
            'INSUFFICIENT_BALANCE': { severity: 'warning', label: 'Solde Insuffisant' },
            'NO_SAVINGS_ACCOUNT': { severity: 'danger', label: 'Pas de Compte' }
        };
        const config = statusConfig[status] || { severity: 'info', label: status };
        return <Tag severity={config.severity} value={config.label} />;
    };

    const dateTimeTemplate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString('fr-FR');
    };

    const dateTemplate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR');
    };

    // Row expansion template to show schedule details
    const rowExpansionTemplate = (data: LoanPreview) => {
        return (
            <div className="p-3">
                <h5 className="mb-3">Détail des échéances impayées pour le crédit {data.applicationNumber}</h5>
                <DataTable value={data.schedules} className="p-datatable-sm">
                    <Column field="installmentNumber" header="Éch. N°" style={{ width: '10%' }} />
                    <Column
                        field="dueDate"
                        header="Date Échéance"
                        body={(row) => {
                            const dueDate = new Date(row.dueDate);
                            return (
                                <div>
                                    <span className={row.daysOverdue > 0 ? 'text-red-500 font-bold' : ''}>
                                        {dueDate.toLocaleDateString('fr-FR')}
                                    </span>
                                    {row.daysOverdue > 0 && (
                                        <div className="text-xs text-red-500">
                                            {row.daysOverdue} jours de retard
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                        style={{ width: '15%' }}
                    />
                    <Column
                        field="status"
                        header="Statut"
                        body={(row) => scheduleStatusTemplate(row.status)}
                        style={{ width: '12%' }}
                    />
                    <Column
                        field="principalDue"
                        header="Principal"
                        body={(row) => currencyTemplate(row.principalDue)}
                        style={{ width: '15%' }}
                    />
                    <Column
                        field="interestDue"
                        header="Intérêts"
                        body={(row) => currencyTemplate(row.interestDue)}
                        style={{ width: '15%' }}
                    />
                    <Column
                        field="penaltyAccrued"
                        header="Pénalités"
                        body={(row) => currencyTemplate(row.penaltyAccrued)}
                        style={{ width: '15%' }}
                    />
                    <Column
                        field="amountDue"
                        header="Montant Dû"
                        body={(row) => <strong>{currencyTemplate(row.amountDue)}</strong>}
                        style={{ width: '18%' }}
                    />
                </DataTable>
            </div>
        );
    };

    const viewBatchDetails = (batch: BatchHistory) => {
        setSelectedBatch(batch);
        loadBatchDetails(batch.id);
        setShowDetailDialog(true);
    };

    const actionTemplate = (rowData: BatchHistory) => {
        return (
            <Button
                icon="pi pi-eye"
                rounded
                outlined
                severity="info"
                onClick={() => viewBatchDetails(rowData)}
                tooltip="Voir les détails"
            />
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex align-items-center justify-content-between mb-4">
                <h2 className="m-0">
                    <i className="pi pi-sync mr-2"></i>
                    Prélèvement Automatique
                </h2>
            </div>

            <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                {/* Tab 1: Exécution */}
                <TabPanel header="Exécution" leftIcon="pi pi-play mr-2">
                    {/* Date Selection and Actions */}
                    <Card className="mb-4">
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <label className="block font-semibold mb-2">
                                    <i className="pi pi-calendar mr-2"></i>
                                    Date de Référence
                                </label>
                                <Calendar
                                    value={processingDate}
                                    onChange={(e) => setProcessingDate(e.value as Date)}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                    placeholder="Sélectionner la date..."
                                />
                                <small className="text-color-secondary block mt-1">
                                    <i className="pi pi-info-circle mr-1"></i>
                                    Seules les échéances <strong>expirées</strong> (date d'échéance &lt; date de référence) seront traitées
                                </small>
                            </div>
                            <div className="col-12 md:col-8 flex align-items-end gap-2">
                                <Button
                                    label="Aperçu"
                                    icon="pi pi-eye"
                                    onClick={handlePreview}
                                    loading={loading && callType === 'preview'}
                                    outlined
                                />
                                <Button
                                    label="Exécuter le Prélèvement"
                                    icon="pi pi-play"
                                    onClick={handleProcess}
                                    loading={isProcessing}
                                    disabled={previewData.length === 0 || previewData.filter(p => p.canProcessSome || p.canProcessAll).length === 0}
                                    severity="success"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Statistics Card */}
                    {statistics && (
                        <Card className="mb-4" title="Statistiques des Échéances Expirées">
                            <div className="grid">
                                <div className="col-6 md:col-2">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary">{statistics.totalLoans}</div>
                                        <div className="text-color-secondary">Crédits</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-2">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-500">{statistics.totalSchedules}</div>
                                        <div className="text-color-secondary">Échéances Expirées</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-2">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-500">{statistics.totalSchedulesPayable}</div>
                                        <div className="text-color-secondary">Éch. Traitables</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-2">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-primary">
                                            {currencyTemplate(statistics.totalAmountDue)}
                                        </div>
                                        <div className="text-color-secondary">Montant Total Dû</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-2">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-green-500">
                                            {currencyTemplate(statistics.totalAmountPayable)}
                                        </div>
                                        <div className="text-color-secondary">Montant Traitable</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-2">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-red-500">
                                            {currencyTemplate(statistics.totalShortfall)}
                                        </div>
                                        <div className="text-color-secondary">Déficit Total</div>
                                    </div>
                                </div>
                            </div>
                            {statistics.totalSchedules > 0 && (
                                <div className="mt-3">
                                    <label className="block mb-2 text-sm">Taux de couverture des échéances</label>
                                    <ProgressBar
                                        value={Math.round((statistics.totalSchedulesPayable / statistics.totalSchedules) * 100)}
                                        showValue
                                    />
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Preview Table - Grouped by Loan */}
                    <Card title="Aperçu des Crédits avec Échéances Expirées">
                        <DataTable
                            value={previewData}
                            loading={loading && callType === 'preview'}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            emptyMessage="Aucune échéance expirée trouvée. Sélectionnez une date et cliquez sur Aperçu."
                            className="p-datatable-sm"
                            rowClassName={(rowData) => (rowData.canProcessAll || rowData.canProcessSome) ? '' : 'bg-red-50'}
                            expandedRows={expandedRows}
                            onRowToggle={(e) => setExpandedRows(e.data)}
                            rowExpansionTemplate={rowExpansionTemplate}
                            dataKey="loanId"
                        >
                            <Column expander style={{ width: '3em' }} />
                            <Column field="applicationNumber" header="N° Dossier" sortable style={{ width: '12%' }} />
                            <Column field="clientName" header="Client" sortable style={{ width: '18%' }} />
                            <Column
                                field="schedulesCount"
                                header="Nb Échéances"
                                sortable
                                style={{ width: '10%' }}
                                body={(row) => <Tag value={`${row.schedulesCount} échéance(s)`} severity="info" />}
                            />
                            <Column
                                field="totalAmountDue"
                                header="Montant Total Dû"
                                body={(rowData) => <strong>{currencyTemplate(rowData.totalAmountDue)}</strong>}
                                sortable
                                style={{ width: '14%' }}
                            />
                            <Column field="savingsAccountNumber" header="Compte Épargne" style={{ width: '12%' }} />
                            <Column
                                field="availableBalance"
                                header="Solde Disponible"
                                body={(rowData) => currencyTemplate(rowData.availableBalance)}
                                sortable
                                style={{ width: '14%' }}
                            />
                            <Column header="Statut" body={statusTemplate} style={{ width: '15%' }} />
                        </DataTable>
                    </Card>
                </TabPanel>

                {/* Tab 2: Historique */}
                <TabPanel header="Historique" leftIcon="pi pi-history mr-2">
                    <Card className="mb-3">
                        <div className="flex justify-content-between align-items-center mb-3">
                            <h4 className="m-0">
                                <i className="pi pi-search mr-2"></i>
                                Rechercher dans l'Historique
                            </h4>
                        </div>

                        <div className="grid">
                            <div className="col-12 md:col-2">
                                <label className="block font-semibold mb-2">N° Batch</label>
                                <InputText
                                    value={searchBatchNumber}
                                    onChange={(e) => setSearchBatchNumber(e.target.value)}
                                    placeholder="N° Batch..."
                                    className="w-full"
                                />
                            </div>
                            <div className="col-12 md:col-2">
                                <label className="block font-semibold mb-2">N° Crédit</label>
                                <InputText
                                    value={searchCreditNumber}
                                    onChange={(e) => setSearchCreditNumber(e.target.value)}
                                    placeholder="N° Crédit..."
                                    className="w-full"
                                />
                            </div>
                            <div className="col-12 md:col-2">
                                <label className="block font-semibold mb-2">N° Compte Épargne</label>
                                <InputText
                                    value={searchSavingsAccount}
                                    onChange={(e) => setSearchSavingsAccount(e.target.value)}
                                    placeholder="N° Compte..."
                                    className="w-full"
                                />
                            </div>
                            <div className="col-12 md:col-2">
                                <label className="block font-semibold mb-2">Date Début</label>
                                <Calendar
                                    value={searchStartDate}
                                    onChange={(e) => setSearchStartDate(e.value as Date)}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                    placeholder="Du..."
                                />
                            </div>
                            <div className="col-12 md:col-2">
                                <label className="block font-semibold mb-2">Date Fin</label>
                                <Calendar
                                    value={searchEndDate}
                                    onChange={(e) => setSearchEndDate(e.value as Date)}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                    placeholder="Au..."
                                />
                            </div>
                            <div className="col-12 md:col-2">
                                <label className="block font-semibold mb-2">Statut</label>
                                <Dropdown
                                    value={searchStatus}
                                    options={statusOptions}
                                    onChange={(e) => setSearchStatus(e.value)}
                                    placeholder="Tous"
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex justify-content-end gap-2 mt-3">
                            <Button
                                icon="pi pi-search"
                                label="Rechercher"
                                onClick={handleSearch}
                                loading={historyLoading}
                            />
                            <Button
                                icon="pi pi-times"
                                label="Effacer"
                                onClick={handleClearSearch}
                                outlined
                                severity="secondary"
                            />
                        </div>
                    </Card>

                    <Card>
                        <div className="flex justify-content-between align-items-center mb-3">
                            <h4 className="m-0">
                                <i className="pi pi-list mr-2"></i>
                                Historique des Prélèvements Automatiques
                                <Tag value={`${filteredHistoryData.length} résultat(s)`} severity="info" className="ml-2" />
                            </h4>
                            <Button
                                icon="pi pi-refresh"
                                label="Actualiser"
                                onClick={loadHistory}
                                loading={historyLoading}
                                outlined
                            />
                        </div>

                        <DataTable
                            value={filteredHistoryData}
                            loading={historyLoading}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            emptyMessage="Aucun historique de prélèvement trouvé."
                            className="p-datatable-sm"
                            sortField="createdAt"
                            sortOrder={-1}
                        >
                            <Column
                                field="batchNumber"
                                header="N° Batch"
                                sortable
                                style={{ width: '15%' }}
                                body={(row) => <span className="font-mono text-sm">{row.batchNumber}</span>}
                            />
                            <Column
                                field="processingDate"
                                header="Date Traitement"
                                sortable
                                style={{ width: '10%' }}
                                body={(row) => dateTemplate(row.processingDate)}
                            />
                            <Column
                                field="status"
                                header="Statut"
                                sortable
                                style={{ width: '10%' }}
                                body={(row) => batchStatusTemplate(row.status)}
                            />
                            <Column
                                field="totalSchedulesProcessed"
                                header="Échéances"
                                sortable
                                style={{ width: '8%' }}
                                body={(row) => (
                                    <div className="text-center">
                                        <span className="text-green-600 font-bold">{row.totalSchedulesProcessed || 0}</span>
                                        <span className="text-color-secondary"> / {row.totalSchedulesFound || 0}</span>
                                    </div>
                                )}
                            />
                            <Column
                                field="totalAmountProcessed"
                                header="Montant Traité"
                                sortable
                                style={{ width: '12%' }}
                                body={(row) => <span className="text-green-600 font-bold">{currencyTemplate(row.totalAmountProcessed)}</span>}
                            />
                            <Column
                                field="successCount"
                                header="Succès"
                                style={{ width: '7%' }}
                                body={(row) => <Tag severity="success" value={row.successCount || 0} />}
                            />
                            <Column
                                field="insufficientBalanceCount"
                                header="Solde Insuf."
                                style={{ width: '8%' }}
                                body={(row) => <Tag severity="warning" value={row.insufficientBalanceCount || 0} />}
                            />
                            <Column
                                field="failedCount"
                                header="Échecs"
                                style={{ width: '7%' }}
                                body={(row) => <Tag severity="danger" value={row.failedCount || 0} />}
                            />
                            <Column
                                field="userAction"
                                header="Exécuté Par"
                                style={{ width: '15%' }}
                                body={(row) => (
                                    <span className="text-sm">
                                        <i className="pi pi-user mr-1"></i>
                                        {row.userAction || 'system'}
                                    </span>
                                )}
                            />
                            <Column
                                header="Actions"
                                body={actionTemplate}
                                style={{ width: '8%' }}
                            />
                        </DataTable>
                    </Card>
                </TabPanel>
            </TabView>

            {/* Processing Result Dialog */}
            <Dialog
                visible={showResultDialog}
                onHide={() => setShowResultDialog(false)}
                header="Résultat du Prélèvement Automatique"
                style={{ width: '80vw' }}
                modal
                footer={
                    <Button
                        label="Fermer"
                        icon="pi pi-times"
                        onClick={() => setShowResultDialog(false)}
                    />
                }
            >
                {processingResult && (
                    <div>
                        <div className="grid mb-4">
                            <div className="col-12 md:col-3">
                                <Card className="bg-primary text-white">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold">{processingResult.totalSchedulesProcessed}</div>
                                        <div>Échéances Payées</div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="bg-green-500 text-white">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold">{processingResult.successCount}</div>
                                        <div>Crédits Traités</div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="bg-orange-500 text-white">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold">{processingResult.insufficientBalanceCount}</div>
                                        <div>Solde Insuffisant</div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="bg-red-500 text-white">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold">{processingResult.failedCount}</div>
                                        <div>Échecs</div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <Divider />

                        <div className="grid">
                            <div className="col-6">
                                <p><strong>N° Batch:</strong> {processingResult.batchNumber}</p>
                                <p><strong>Date de traitement:</strong> {processingResult.processingDate}</p>
                            </div>
                            <div className="col-6">
                                <p><strong>Montant total traité:</strong> {currencyTemplate(processingResult.totalAmountProcessed)}</p>
                                <p><strong>Crédits traités:</strong> {processingResult.totalLoansProcessed}</p>
                            </div>
                        </div>

                        {processingResult.processedPayments.length > 0 && (
                            <>
                                <Divider />
                                <h4 className="text-green-600">
                                    <i className="pi pi-check-circle mr-2"></i>
                                    Crédits Traités avec Succès ({processingResult.processedPayments.length})
                                </h4>
                                <DataTable
                                    value={processingResult.processedPayments}
                                    className="p-datatable-sm"
                                    scrollable
                                    scrollHeight="250px"
                                >
                                    <Column field="applicationNumber" header="N° Dossier" />
                                    <Column field="clientName" header="Client" />
                                    <Column field="schedulesProcessed" header="Échéances Payées" />
                                    <Column field="totalAmountPaid" header="Montant Total" body={(row) => currencyTemplate(row.totalAmountPaid)} />
                                    <Column field="savingsAccountNumber" header="Compte Débité" />
                                    <Column field="balanceBefore" header="Solde Avant" body={(row) => currencyTemplate(row.balanceBefore)} />
                                    <Column field="balanceAfter" header="Solde Après" body={(row) => currencyTemplate(row.balanceAfter)} />
                                    <Column
                                        field="partialPayment"
                                        header="Statut"
                                        body={(row) => row.partialPayment ?
                                            <Tag severity="warning" value="Partiel" /> :
                                            <Tag severity="success" value="Complet" />
                                        }
                                    />
                                </DataTable>
                            </>
                        )}

                        {processingResult.insufficientBalancePayments.length > 0 && (
                            <>
                                <Divider />
                                <h4 className="text-orange-600">
                                    <i className="pi pi-exclamation-triangle mr-2"></i>
                                    Solde Insuffisant ({processingResult.insufficientBalancePayments.length})
                                </h4>
                                <DataTable
                                    value={processingResult.insufficientBalancePayments}
                                    className="p-datatable-sm"
                                    scrollable
                                    scrollHeight="200px"
                                >
                                    <Column field="applicationNumber" header="N° Dossier" />
                                    <Column field="clientName" header="Client" />
                                    <Column field="totalSchedules" header="Nb Échéances" />
                                    <Column field="totalAmountDue" header="Montant Total Dû" body={(row) => currencyTemplate(row.totalAmountDue)} />
                                    <Column field="availableBalance" header="Solde Disponible" body={(row) => currencyTemplate(row.availableBalance)} />
                                    <Column field="message" header="Message" />
                                </DataTable>
                            </>
                        )}

                        {processingResult.failedPayments.length > 0 && (
                            <>
                                <Divider />
                                <h4 className="text-red-600">
                                    <i className="pi pi-times-circle mr-2"></i>
                                    Échecs ({processingResult.failedPayments.length})
                                </h4>
                                <DataTable
                                    value={processingResult.failedPayments}
                                    className="p-datatable-sm"
                                    scrollable
                                    scrollHeight="200px"
                                >
                                    <Column field="loanId" header="ID Crédit" />
                                    <Column field="schedulesCount" header="Nb Échéances" />
                                    <Column field="error" header="Erreur" />
                                </DataTable>
                            </>
                        )}
                    </div>
                )}
            </Dialog>

            {/* Batch Detail Dialog */}
            <Dialog
                visible={showDetailDialog}
                onHide={() => { setShowDetailDialog(false); setSelectedBatch(null); setBatchDetails([]); clearDetailSearch(); }}
                header={`Détails du Batch: ${selectedBatch?.batchNumber || ''}`}
                style={{ width: '90vw' }}
                modal
                footer={
                    <Button
                        label="Fermer"
                        icon="pi pi-times"
                        onClick={() => { setShowDetailDialog(false); setSelectedBatch(null); setBatchDetails([]); clearDetailSearch(); }}
                    />
                }
            >
                {selectedBatch && (
                    <div>
                        {/* Batch Summary */}
                        <div className="grid mb-4">
                            <div className="col-12 md:col-3">
                                <Card className="h-full">
                                    <div className="text-center">
                                        <div className="text-sm text-color-secondary mb-1">Statut</div>
                                        {batchStatusTemplate(selectedBatch.status)}
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="h-full">
                                    <div className="text-center">
                                        <div className="text-sm text-color-secondary mb-1">Date Traitement</div>
                                        <div className="font-bold">{dateTemplate(selectedBatch.processingDate)}</div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="h-full">
                                    <div className="text-center">
                                        <div className="text-sm text-color-secondary mb-1">Montant Traité</div>
                                        <div className="font-bold text-green-600">{currencyTemplate(selectedBatch.totalAmountProcessed)}</div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="h-full">
                                    <div className="text-center">
                                        <div className="text-sm text-color-secondary mb-1">Exécuté Par</div>
                                        <div className="font-bold"><i className="pi pi-user mr-1"></i>{selectedBatch.userAction || 'system'}</div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="grid mb-4">
                            <div className="col-6 md:col-3">
                                <div className="surface-card p-3 border-round shadow-1 text-center">
                                    <div className="text-2xl font-bold text-green-600">{selectedBatch.successCount || 0}</div>
                                    <div className="text-sm text-color-secondary">Succès</div>
                                </div>
                            </div>
                            <div className="col-6 md:col-3">
                                <div className="surface-card p-3 border-round shadow-1 text-center">
                                    <div className="text-2xl font-bold text-orange-500">{selectedBatch.insufficientBalanceCount || 0}</div>
                                    <div className="text-sm text-color-secondary">Solde Insuffisant</div>
                                </div>
                            </div>
                            <div className="col-6 md:col-3">
                                <div className="surface-card p-3 border-round shadow-1 text-center">
                                    <div className="text-2xl font-bold text-red-500">{selectedBatch.failedCount || 0}</div>
                                    <div className="text-sm text-color-secondary">Échecs</div>
                                </div>
                            </div>
                            <div className="col-6 md:col-3">
                                <div className="surface-card p-3 border-round shadow-1 text-center">
                                    <div className="text-2xl font-bold text-primary">{selectedBatch.totalSchedulesProcessed || 0}</div>
                                    <div className="text-sm text-color-secondary">Échéances Payées</div>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Search Section for Details */}
                        <div className="surface-ground p-3 border-round mb-3">
                            <h5 className="mt-0 mb-3">
                                <i className="pi pi-search mr-2"></i>
                                Rechercher dans les Détails
                            </h5>
                            <div className="grid">
                                <div className="col-12 md:col-3">
                                    <label className="block font-semibold mb-2">N° Crédit</label>
                                    <InputText
                                        value={searchApplicationNumber}
                                        onChange={(e) => setSearchApplicationNumber(e.target.value)}
                                        placeholder="Rechercher par N° crédit..."
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-12 md:col-3">
                                    <label className="block font-semibold mb-2">N° Paiement</label>
                                    <InputText
                                        value={searchPaymentNumber}
                                        onChange={(e) => setSearchPaymentNumber(e.target.value)}
                                        placeholder="Rechercher par N° paiement..."
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-12 md:col-3">
                                    <label className="block font-semibold mb-2">N° Compte Épargne</label>
                                    <InputText
                                        value={searchAccountNumber}
                                        onChange={(e) => setSearchAccountNumber(e.target.value)}
                                        placeholder="Rechercher par N° compte..."
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-12 md:col-2">
                                    <label className="block font-semibold mb-2">Statut</label>
                                    <Dropdown
                                        value={searchDetailStatus}
                                        options={detailStatusOptions}
                                        onChange={(e) => setSearchDetailStatus(e.value)}
                                        placeholder="Tous"
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-12 md:col-1 flex align-items-end">
                                    <Button
                                        icon="pi pi-times"
                                        onClick={clearDetailSearch}
                                        outlined
                                        severity="secondary"
                                        tooltip="Effacer les filtres"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Details Table */}
                        <h5 className="mb-3">
                            <i className="pi pi-list mr-2"></i>
                            Détails des Paiements
                            <Tag value={`${filteredBatchDetails.length} résultat(s)`} severity="info" className="ml-2" />
                        </h5>
                        <DataTable
                            value={filteredBatchDetails}
                            loading={detailsLoading}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            emptyMessage="Aucun détail trouvé."
                            className="p-datatable-sm"
                            rowClassName={(row) => {
                                if (row.status === 'SUCCESS') return '';
                                if (row.status === 'INSUFFICIENT_BALANCE') return 'bg-orange-50';
                                return 'bg-red-50';
                            }}
                        >
                            <Column field="applicationNumber" header="N° Dossier" sortable style={{ width: '10%' }} />
                            <Column field="clientName" header="Client" sortable style={{ width: '15%' }} />
                            <Column field="installmentNumber" header="Éch. N°" style={{ width: '6%' }} />
                            <Column
                                field="dueDate"
                                header="Date Échéance"
                                body={(row) => dateTemplate(row.dueDate)}
                                style={{ width: '10%' }}
                            />
                            <Column
                                field="amountDue"
                                header="Montant Dû"
                                body={(row) => currencyTemplate(row.amountDue)}
                                style={{ width: '9%' }}
                            />
                            <Column
                                field="penaltyDue"
                                header="Pénalités"
                                body={(row) => (
                                    <span className={row.penaltyDue > 0 ? 'text-orange-600 font-semibold' : ''}>
                                        {currencyTemplate(row.penaltyDue || 0)}
                                    </span>
                                )}
                                style={{ width: '8%' }}
                            />
                            <Column
                                field="amountPaid"
                                header="Montant Payé"
                                body={(row) => <span className="text-green-600 font-bold">{currencyTemplate(row.amountPaid)}</span>}
                                style={{ width: '9%' }}
                            />
                            <Column field="savingsAccountNumber" header="Compte Épargne" style={{ width: '10%' }} />
                            <Column
                                field="balanceBefore"
                                header="Solde Avant"
                                body={(row) => currencyTemplate(row.balanceBefore)}
                                style={{ width: '9%' }}
                            />
                            <Column
                                field="balanceAfter"
                                header="Solde Après"
                                body={(row) => currencyTemplate(row.balanceAfter)}
                                style={{ width: '9%' }}
                            />
                            <Column
                                field="status"
                                header="Statut"
                                body={(row) => detailStatusTemplate(row.status)}
                                style={{ width: '11%' }}
                            />
                        </DataTable>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default PrelevementAutomatiquePage;
