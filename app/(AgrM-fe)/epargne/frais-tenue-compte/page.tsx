'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabView, TabPanel } from 'primereact/tabview';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';

// Types
interface FraisTenueCompte {
    id?: number;
    accountType: string;
    label: string;
    amount: number;
    frequency: string;
    debitAccountCode: string;
    revenueAccountCode: string;
    isActive: boolean;
    minBalanceExempt: number | null;
    description: string;
    userAction?: string;
    schedulerEnabled?: boolean;
    executionDay?: number;
    executionHour?: number;
    executionMinute?: number;
    lastExecutionDate?: string;
    nextExecutionDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface SchedulerStatus {
    configId: number;
    label: string;
    accountType: string;
    frequency: string;
    schedulerEnabled: boolean;
    executionDay: number;
    executionTime: string;
    lastExecutionDate: string | null;
    nextExecutionDate: string | null;
    alreadyExecutedForPeriod: boolean;
    currentPeriodStart: string;
    currentPeriodEnd: string;
}

interface FraisTenueCompteExecution {
    id: number;
    batchNumber: string;
    executionDate: string;
    periodStart: string;
    periodEnd: string;
    frequency: string;
    accountType: string;
    feeAmount: number;
    totalAccountsProcessed: number;
    totalAccountsSkipped: number;
    totalAmountCollected: number;
    status: string;
    errorMessage: string | null;
    executedBy: string;
    createdAt: string;
}

interface FraisTenueCompteDetail {
    id: number;
    savingsAccountId: number;
    accountNumber: string;
    clientName: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    status: string;
    skipReason: string | null;
    pieceId: string | null;
    createdAt: string;
}

interface PreviewResult {
    fraisId: number;
    accountType: string;
    label: string;
    feeAmount: number;
    frequency: string;
    periodStart: string;
    periodEnd: string;
    debitAccountCode: string;
    revenueAccountCode: string;
    totalActiveAccounts: number;
    withSufficientBalance: number;
    withInsufficientBalance: number;
    estimatedTotal: number;
    alreadyExecuted: boolean;
}

interface CptCompte {
    compteId: number;
    codeCompte: string;
    libelle: string;
}

const EMPTY_FRAIS: FraisTenueCompte = {
    accountType: 'REGULAR',
    label: '',
    amount: 0,
    frequency: 'MONTHLY',
    debitAccountCode: '291',
    revenueAccountCode: '703',
    isActive: true,
    minBalanceExempt: null,
    description: ''
};

const ACCOUNT_TYPES = [
    { label: 'Compte Ordinaire (REGULAR)', value: 'REGULAR' },
    { label: 'Dépôt à Terme (TERM_DEPOSIT)', value: 'TERM_DEPOSIT' },
    { label: 'Épargne Obligatoire (COMPULSORY)', value: 'COMPULSORY' }
];

const FREQUENCIES = [
    { label: 'Mensuel', value: 'MONTHLY' },
    { label: 'Trimestriel', value: 'QUARTERLY' },
    { label: 'Semestriel', value: 'SEMI_ANNUAL' },
    { label: 'Annuel', value: 'ANNUAL' }
];

export default function FraisTenueComptePage() {
    const toast = useRef<Toast>(null);

    // Config state
    const [configs, setConfigs] = useState<FraisTenueCompte[]>([]);
    const [editingConfig, setEditingConfig] = useState<FraisTenueCompte>({ ...EMPTY_FRAIS });
    const [configDialog, setConfigDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Accounting accounts state
    const [comptesComptables, setComptesComptables] = useState<CptCompte[]>([]);

    // Execution state
    const [activeConfigs, setActiveConfigs] = useState<FraisTenueCompte[]>([]);
    const [selectedFraisId, setSelectedFraisId] = useState<number | null>(null);
    const [preview, setPreview] = useState<PreviewResult | null>(null);
    const [executing, setExecuting] = useState(false);

    // Scheduler state
    const [schedulerConfigId, setSchedulerConfigId] = useState<number | null>(null);
    const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
    const [schedulerSettings, setSchedulerSettings] = useState<{ executionDay: number; executionHour: number; executionMinute: number }>({
        executionDay: 1, executionHour: 6, executionMinute: 0
    });

    // History state
    const [executions, setExecutions] = useState<FraisTenueCompteExecution[]>([]);
    const [selectedExecution, setSelectedExecution] = useState<FraisTenueCompteExecution | null>(null);
    const [details, setDetails] = useState<FraisTenueCompteDetail[]>([]);
    const [detailDialog, setDetailDialog] = useState(false);

    // Comptes Affectés tab state
    const [periodFrom, setPeriodFrom] = useState<Date | null>(null);
    const [periodTo, setPeriodTo] = useState<Date | null>(null);
    const [affectedDetails, setAffectedDetails] = useState<FraisTenueCompteDetail[]>([]);
    const [affectedLoading, setAffectedLoading] = useState(false);

    // Loading
    const [initialLoading, setInitialLoading] = useState(true);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/epargne/frais-tenue-compte');
    const INTERNAL_ACCOUNTS_URL = buildApiUrl('/api/comptability/internal-accounts');

    // Handle API responses
    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadComptes': {
                    const allAccounts = Array.isArray(data) ? data : [];
                    const mapAccount = (a: any) => ({
                        compteId: a.compteComptableId,
                        codeCompte: a.codeCompte,
                        libelle: `${a.accountNumber} - ${a.libelle} (${a.codeCompte})`
                    });
                    const filtered = allAccounts
                        .filter((a: any) => a.actif !== false && a.codeCompte === '703')
                        .map(mapAccount);
                    setComptesComptables(filtered);
                    // Chain: load configs
                    fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadConfigs');
                    break;
                }
                case 'loadConfigs':
                    setConfigs(Array.isArray(data) ? data : []);
                    setInitialLoading(false);
                    // Chain: load active configs for execution tab
                    fetchData(null, 'GET', `${BASE_URL}/findallactive`, 'loadActiveConfigs');
                    break;
                case 'loadActiveConfigs':
                    setActiveConfigs(Array.isArray(data) ? data : []);
                    // Chain: load execution history
                    fetchData(null, 'GET', `${BASE_URL}/executions/findall`, 'loadExecutions');
                    break;
                case 'loadExecutions':
                    setExecutions(Array.isArray(data) ? data : []);
                    break;
                case 'createConfig':
                    showToast('success', 'Succès', 'Configuration créée avec succès');
                    setConfigDialog(false);
                    fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadConfigs');
                    break;
                case 'updateConfig':
                    showToast('success', 'Succès', 'Configuration mise à jour avec succès');
                    setConfigDialog(false);
                    fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadConfigs');
                    break;
                case 'deleteConfig':
                    showToast('success', 'Succès', 'Configuration supprimée');
                    fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadConfigs');
                    break;
                case 'loadPreview':
                    setPreview(data);
                    break;
                case 'executeBatch':
                    setExecuting(false);
                    const exec = data as FraisTenueCompteExecution;
                    if (exec.status === 'COMPLETED') {
                        showToast('success', 'Prélèvement terminé',
                            `${exec.totalAccountsProcessed} comptes traités, ${formatCurrency(exec.totalAmountCollected)} prélevés`);
                    } else {
                        showToast('warn', 'Prélèvement avec erreurs', exec.errorMessage || 'Erreur inconnue');
                    }
                    setPreview(null);
                    setSelectedFraisId(null);
                    // Refresh history
                    fetchData(null, 'GET', `${BASE_URL}/executions/findall`, 'loadExecutions');
                    break;
                case 'loadDetails':
                    setDetails(Array.isArray(data) ? data : []);
                    setDetailDialog(true);
                    break;
                case 'loadAffectedDetails':
                    setAffectedDetails(Array.isArray(data) ? data : []);
                    setAffectedLoading(false);
                    break;
                case 'toggleScheduler':
                    showToast('success', 'Succès', (data as FraisTenueCompte).schedulerEnabled ? 'Planificateur activé' : 'Planificateur désactivé');
                    fetchData(null, 'GET', `${BASE_URL}/findallactive`, 'loadActiveConfigs');
                    break;
                case 'updateSchedulerSettings':
                    showToast('success', 'Succès', 'Paramètres du planificateur mis à jour');
                    fetchData(null, 'GET', `${BASE_URL}/findallactive`, 'loadActiveConfigs');
                    break;
                case 'loadSchedulerStatus':
                    setSchedulerStatus(data as SchedulerStatus);
                    break;
            }
        }
        if (error) {
            setInitialLoading(false);
            setExecuting(false);
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    // Initial load: first load internal accounts, then chain the rest
    useEffect(() => {
        fetchData(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findactive`, 'loadComptes');
    }, []);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF', minimumFractionDigits: 0 }).format(value || 0);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    const getFrequencyLabel = (value: string) => {
        return FREQUENCIES.find(f => f.value === value)?.label || value;
    };

    const getAccountTypeLabel = (value: string) => {
        return ACCOUNT_TYPES.find(t => t.value === value)?.label || value;
    };

    // Build dropdown options for internal accounts
    const comptesOptions = comptesComptables.map(c => ({
        label: c.libelle,
        value: c.codeCompte
    }));

    // ========== Configuration Tab ==========

    const openNewConfig = () => {
        setEditingConfig({ ...EMPTY_FRAIS });
        setIsEditing(false);
        setConfigDialog(true);
    };

    const openEditConfig = (config: FraisTenueCompte) => {
        setEditingConfig({ ...config });
        setIsEditing(true);
        setConfigDialog(true);
    };

    const saveConfig = () => {
        if (!editingConfig.label || !editingConfig.amount || editingConfig.amount <= 0) {
            showToast('warn', 'Validation', 'Veuillez remplir le libellé et le montant');
            return;
        }
        if (!editingConfig.revenueAccountCode) {
            showToast('warn', 'Validation', 'Veuillez sélectionner le compte comptable commission (revenu)');
            return;
        }
        const dataToSend = { ...editingConfig, userAction: getUserAction() };
        if (isEditing && editingConfig.id) {
            fetchData(dataToSend, 'PUT', `${BASE_URL}/update/${editingConfig.id}`, 'updateConfig');
        } else {
            fetchData(dataToSend, 'POST', `${BASE_URL}/new`, 'createConfig');
        }
    };

    const deleteConfig = (config: FraisTenueCompte) => {
        confirmDialog({
            message: `Supprimer la configuration "${config.label}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${config.id}`, 'deleteConfig');
            }
        });
    };

    // ========== Scheduler ==========

    const handleToggleScheduler = (configId: number, enabled: boolean) => {
        fetchData(null, 'PUT', `${BASE_URL}/toggle-scheduler/${configId}?enabled=${enabled}`, 'toggleScheduler');
    };

    const handleSaveSchedulerSettings = (configId: number) => {
        const dataToSend = {
            schedulerEnabled: true,
            executionDay: schedulerSettings.executionDay,
            executionHour: schedulerSettings.executionHour,
            executionMinute: schedulerSettings.executionMinute,
            userAction: getUserAction()
        };
        fetchData(dataToSend, 'PUT', `${BASE_URL}/update-scheduler/${configId}`, 'updateSchedulerSettings');
    };

    const loadSchedulerStatus = (configId: number) => {
        setSchedulerConfigId(configId);
        fetchData(null, 'GET', `${BASE_URL}/scheduler-status/${configId}`, 'loadSchedulerStatus');
    };

    const formatDateTime = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch { return dateStr; }
    };

    // ========== Execution Tab ==========

    const loadPreview = () => {
        if (!selectedFraisId) {
            showToast('warn', 'Sélection requise', 'Veuillez sélectionner une configuration de frais');
            return;
        }
        setPreview(null);
        fetchData(null, 'GET', `${BASE_URL}/preview/${selectedFraisId}`, 'loadPreview');
    };

    const executeBatch = () => {
        if (!selectedFraisId) return;
        confirmDialog({
            message: `Êtes-vous sûr de vouloir exécuter le prélèvement des frais de tenue de compte ?\n\nCette action va débiter ${preview?.totalActiveAccounts || 0} comptes de ${formatCurrency(preview?.feeAmount || 0)} chacun.\n(${preview?.withInsufficientBalance || 0} comptes passeront en solde négatif)\n\nTotal estimé: ${formatCurrency(preview?.estimatedTotal || 0)}`,
            header: 'Confirmation du prélèvement',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Exécuter le Prélèvement',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () => {
                setExecuting(true);
                fetchData({ userAction: getUserAction() }, 'POST', `${BASE_URL}/execute/${selectedFraisId}`, 'executeBatch');
            }
        });
    };

    // ========== History Tab ==========

    const viewDetails = (execution: FraisTenueCompteExecution) => {
        setSelectedExecution(execution);
        setDetails([]);
        fetchData(null, 'GET', `${BASE_URL}/executions/${execution.id}/details`, 'loadDetails');
    };

    const searchAffectedAccounts = () => {
        if (!periodFrom || !periodTo) {
            showToast('warn', 'Validation', 'Veuillez sélectionner les deux dates de la période');
            return;
        }
        const from = periodFrom.toISOString().split('T')[0];
        const to = periodTo.toISOString().split('T')[0];
        setAffectedLoading(true);
        setAffectedDetails([]);
        fetchData(null, 'GET', `${BASE_URL}/details/by-period?dateFrom=${from}&dateTo=${to}`, 'loadAffectedDetails');
    };

    // ========== Renderers ==========

    const statusBodyTemplate = (rowData: FraisTenueCompteExecution) => {
        const severity = rowData.status === 'COMPLETED' ? 'success' : rowData.status === 'FAILED' ? 'danger' : 'warning';
        const label = rowData.status === 'COMPLETED' ? 'Terminé' : rowData.status === 'FAILED' ? 'Échoué' : 'En cours';
        return <Tag value={label} severity={severity} />;
    };

    const detailStatusTemplate = (rowData: FraisTenueCompteDetail) => {
        if (rowData.status === 'SUCCESS') return <Tag value="Prélevé" severity="success" />;
        return <Tag value={rowData.status} />;
    };

    const detailBalanceAfterTemplate = (rowData: FraisTenueCompteDetail) => {
        const isNegative = rowData.balanceAfter < 0;
        return (
            <span style={{ color: isNegative ? '#e74c3c' : 'inherit', fontWeight: isNegative ? 'bold' : 'normal' }}>
                {formatCurrency(rowData.balanceAfter)}
            </span>
        );
    };

    const activeBodyTemplate = (rowData: FraisTenueCompte) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const configActionsTemplate = (rowData: FraisTenueCompte) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-sm" onClick={() => openEditConfig(rowData)} tooltip="Modifier" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => deleteConfig(rowData)} tooltip="Supprimer" />
            </div>
        );
    };

    // Get libelle for an accounting code
    const getCompteLibelle = (code: string) => {
        const compte = comptesComptables.find(c => c.codeCompte === code);
        return compte ? compte.libelle : code;
    };

    if (initialLoading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex align-items-center justify-content-between mb-4">
                <h2 className="m-0">
                    <i className="pi pi-money-bill mr-2" />
                    Frais de Tenue de Compte
                </h2>
            </div>

            <TabView>
                {/* ===== TAB 1: Configuration ===== */}
                <TabPanel header="Configuration" leftIcon="pi pi-cog mr-2">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h3 className="m-0">Configurations des frais</h3>
                        <Button label="Nouvelle Configuration" icon="pi pi-plus" onClick={openNewConfig} />
                    </div>

                    <DataTable value={configs} paginator rows={10} emptyMessage="Aucune configuration trouvée" stripedRows>
                        <Column field="label" header="Libellé" sortable />
                        <Column field="accountType" header="Type de Compte" body={(row) => getAccountTypeLabel(row.accountType)} sortable />
                        <Column field="amount" header="Montant (FBU)" body={(row) => formatCurrency(row.amount)} sortable />
                        <Column field="frequency" header="Fréquence" body={(row) => getFrequencyLabel(row.frequency)} sortable />
                        <Column field="revenueAccountCode" header="Compte Revenu (Commission)" body={(row) => getCompteLibelle(row.revenueAccountCode)} sortable />
                        <Column field="isActive" header="Actif" body={activeBodyTemplate} sortable />
                        <Column header="Actions" body={configActionsTemplate} style={{ width: '120px' }} />
                    </DataTable>

                    {/* Config Create/Edit Dialog */}
                    <Dialog
                        header={isEditing ? 'Modifier la Configuration' : 'Nouvelle Configuration'}
                        visible={configDialog}
                        style={{ width: '650px' }}
                        modal
                        onHide={() => setConfigDialog(false)}
                        footer={
                            <div>
                                <Button label="Annuler" icon="pi pi-times" className="p-button-text" onClick={() => setConfigDialog(false)} />
                                <Button label="Enregistrer" icon="pi pi-check" onClick={saveConfig} loading={loading} />
                            </div>
                        }
                    >
                        <div className="grid p-fluid">
                            <div className="col-12">
                                <label htmlFor="label" className="font-bold block mb-2">Libellé *</label>
                                <InputText id="label" value={editingConfig.label} onChange={(e) => setEditingConfig({ ...editingConfig, label: e.target.value })} />
                            </div>
                            <div className="col-6">
                                <label htmlFor="accountType" className="font-bold block mb-2">Type de Compte *</label>
                                <Dropdown id="accountType" value={editingConfig.accountType} options={ACCOUNT_TYPES} onChange={(e) => setEditingConfig({ ...editingConfig, accountType: e.value })} />
                            </div>
                            <div className="col-6">
                                <label htmlFor="amount" className="font-bold block mb-2">Montant (FBU) *</label>
                                <InputNumber id="amount" value={editingConfig.amount} onValueChange={(e) => setEditingConfig({ ...editingConfig, amount: e.value || 0 })} mode="decimal" minFractionDigits={0} />
                            </div>
                            <div className="col-6">
                                <label htmlFor="frequency" className="font-bold block mb-2">Fréquence *</label>
                                <Dropdown id="frequency" value={editingConfig.frequency} options={FREQUENCIES} onChange={(e) => setEditingConfig({ ...editingConfig, frequency: e.value })} />
                            </div>
                            <div className="col-6">
                                <label htmlFor="minBalanceExempt" className="font-bold block mb-2">Solde Minimum Exempt</label>
                                <InputNumber id="minBalanceExempt" value={editingConfig.minBalanceExempt} onValueChange={(e) => setEditingConfig({ ...editingConfig, minBalanceExempt: e.value??null })} mode="decimal" minFractionDigits={0} placeholder="Laisser vide = pas d'exemption" />
                            </div>
                            <div className="col-12">
                                <label htmlFor="revenueAccountCode" className="font-bold block mb-2">Compte Comptable Commission (Revenu) *</label>
                                <Dropdown
                                    id="revenueAccountCode"
                                    value={editingConfig.revenueAccountCode}
                                    options={comptesOptions}
                                    onChange={(e) => setEditingConfig({ ...editingConfig, revenueAccountCode: e.value })}
                                    filter
                                    filterPlaceholder="Rechercher un compte..."
                                    placeholder="Sélectionner le compte revenu (commission)"
                                />
                            </div>
                            <div className="col-12">
                                <label htmlFor="description" className="font-bold block mb-2">Description</label>
                                <InputTextarea id="description" value={editingConfig.description} onChange={(e) => setEditingConfig({ ...editingConfig, description: e.target.value })} rows={3} />
                            </div>
                            <div className="col-12 flex align-items-center gap-2">
                                <InputSwitch checked={editingConfig.isActive ?? false} onChange={(e) => setEditingConfig({ ...editingConfig, isActive: e.value ?? false })} />
                                <label className="font-bold">Actif</label>
                            </div>
                        </div>
                    </Dialog>
                </TabPanel>

                {/* ===== TAB 2: Execution ===== */}
                <TabPanel header="Exécution" leftIcon="pi pi-play mr-2">
                    <div className="grid">
                        <div className="col-12">
                            <Card>
                                <h3 className="mt-0">Prélèvement des Frais de Tenue de Compte</h3>
                                <p className="text-color-secondary">
                                    Sélectionnez une configuration active, visualisez l'aperçu, puis exécutez le prélèvement.
                                    Les frais seront déduits du solde de chaque compte actif (virement automatique).
                                    Les comptes sans solde suffisant passeront en négatif et seront récupérés lors du prochain dépôt.
                                </p>

                                <Divider />

                                <div className="flex align-items-end gap-3 mb-4">
                                    <div className="flex-grow-1">
                                        <label className="font-bold block mb-2">Configuration des frais</label>
                                        <Dropdown
                                            value={selectedFraisId}
                                            options={activeConfigs.map(c => ({
                                                label: `${c.label} - ${getAccountTypeLabel(c.accountType)} - ${formatCurrency(c.amount)} (${getFrequencyLabel(c.frequency)})`,
                                                value: c.id
                                            }))}
                                            onChange={(e) => { setSelectedFraisId(e.value); setPreview(null); }}
                                            placeholder="Sélectionner une configuration..."
                                            className="w-full"
                                        />
                                    </div>
                                    <Button
                                        label="Aperçu"
                                        icon="pi pi-eye"
                                        className="p-button-info"
                                        onClick={loadPreview}
                                        loading={loading && callType === 'loadPreview'}
                                        disabled={!selectedFraisId}
                                    />
                                </div>

                                {/* Preview Results */}
                                {preview && (
                                    <div className="mt-3">
                                        <Divider />
                                        <h4 className="mt-0">Aperçu du prélèvement</h4>

                                        {preview.alreadyExecuted && (
                                            <Message severity="warn" className="w-full mb-3"
                                                text={`Les frais ont déjà été prélevés pour la période ${formatDate(preview.periodStart)} au ${formatDate(preview.periodEnd)}. Un nouveau prélèvement sera bloqué.`}
                                            />
                                        )}

                                        <div className="grid">
                                            <div className="col-6 md:col-3">
                                                <Card className="text-center">
                                                    <div className="text-color-secondary text-sm mb-1">Période</div>
                                                    <div className="font-bold">{formatDate(preview.periodStart)} - {formatDate(preview.periodEnd)}</div>
                                                </Card>
                                            </div>
                                            <div className="col-6 md:col-3">
                                                <Card className="text-center">
                                                    <div className="text-color-secondary text-sm mb-1">Frais par compte</div>
                                                    <div className="font-bold text-lg">{formatCurrency(preview.feeAmount)}</div>
                                                </Card>
                                            </div>
                                            <div className="col-6 md:col-3">
                                                <Card className="text-center">
                                                    <div className="text-color-secondary text-sm mb-1">Comptes à débiter</div>
                                                    <div className="font-bold text-lg">{preview.totalActiveAccounts}</div>
                                                </Card>
                                            </div>
                                            <div className="col-6 md:col-3">
                                                <Card className="text-center" style={{ backgroundColor: '#e8f5e9' }}>
                                                    <div className="text-color-secondary text-sm mb-1">Total estimé</div>
                                                    <div className="font-bold text-lg text-green-700">{formatCurrency(preview.estimatedTotal)}</div>
                                                </Card>
                                            </div>
                                        </div>

                                        <div className="grid mt-2">
                                            <div className="col-6">
                                                <div className="flex align-items-center gap-2">
                                                    <Tag value={String(preview.withSufficientBalance)} severity="success" />
                                                    <span>Comptes avec solde suffisant</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="flex align-items-center gap-2">
                                                    <Tag value={String(preview.withInsufficientBalance)} severity="warning" />
                                                    <span>Comptes qui passeront en négatif</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex align-items-center gap-2 mt-2">
                                            <span className="text-sm text-color-secondary">
                                                Commission vers: {getCompteLibelle(preview.revenueAccountCode)} (montant déduit du compte client)
                                            </span>
                                        </div>

                                        <Divider />

                                        <div className="flex justify-content-end">
                                            <Button
                                                label="Exécuter le Prélèvement"
                                                icon="pi pi-bolt"
                                                className="p-button-danger"
                                                onClick={executeBatch}
                                                loading={executing}
                                                disabled={preview.alreadyExecuted || preview.totalActiveAccounts === 0}
                                            />
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* ===== Scheduler Section ===== */}
                        <div className="col-12 mt-4">
                            <Card>
                                <h3 className="mt-0">
                                    <i className="pi pi-clock mr-2" />
                                    Exécution Automatique (Planificateur)
                                </h3>
                                <p className="text-color-secondary">
                                    Configurez l'exécution automatique des frais de tenue de compte. Le planificateur exécutera
                                    le prélèvement automatiquement au jour et à l'heure configurés selon la fréquence définie.
                                </p>

                                <Divider />

                                {activeConfigs.length === 0 ? (
                                    <Message severity="info" text="Aucune configuration active trouvée. Créez d'abord une configuration dans l'onglet Configuration." className="w-full" />
                                ) : (
                                    <div>
                                        {activeConfigs.map((config) => (
                                            <Card key={config.id} className="mb-3" style={{ border: config.schedulerEnabled ? '2px solid #4caf50' : '1px solid #ddd' }}>
                                                <div className="grid align-items-center">
                                                    {/* Config info */}
                                                    <div className="col-12 md:col-3">
                                                        <div className="font-bold text-lg">{config.label}</div>
                                                        <div className="text-color-secondary text-sm">
                                                            {getAccountTypeLabel(config.accountType)} - {formatCurrency(config.amount)} ({getFrequencyLabel(config.frequency)})
                                                        </div>
                                                    </div>

                                                    {/* Scheduler toggle */}
                                                    <div className="col-6 md:col-2">
                                                        <label className="font-bold block mb-2">Planificateur</label>
                                                        <div className="flex align-items-center gap-2">
                                                            <InputSwitch
                                                                checked={config.schedulerEnabled ?? false}
                                                                onChange={(e) => handleToggleScheduler(config.id!, e.value ?? false)}
                                                            />
                                                            <Tag
                                                                value={config.schedulerEnabled ? 'Actif' : 'Inactif'}
                                                                severity={config.schedulerEnabled ? 'success' : 'danger'}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Scheduler settings */}
                                                    <div className="col-6 md:col-5">
                                                        {config.schedulerEnabled && (
                                                            <div className="flex align-items-end gap-2">
                                                                <div>
                                                                    <label className="font-bold block mb-1 text-sm">Jour du mois</label>
                                                                    <InputNumber
                                                                        value={schedulerConfigId === config.id ? schedulerSettings.executionDay : (config.executionDay || 1)}
                                                                        onValueChange={(e) => {
                                                                            setSchedulerConfigId(config.id!);
                                                                            setSchedulerSettings(prev => ({ ...prev, executionDay: e.value ?? 1 }));
                                                                        }}
                                                                        onFocus={() => {
                                                                            if (schedulerConfigId !== config.id) {
                                                                                setSchedulerConfigId(config.id!);
                                                                                setSchedulerSettings({
                                                                                    executionDay: config.executionDay || 1,
                                                                                    executionHour: config.executionHour || 6,
                                                                                    executionMinute: config.executionMinute || 0
                                                                                });
                                                                            }
                                                                        }}
                                                                        min={1} max={28} showButtons
                                                                        style={{ width: '90px' }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="font-bold block mb-1 text-sm">Heure</label>
                                                                    <InputNumber
                                                                        value={schedulerConfigId === config.id ? schedulerSettings.executionHour : (config.executionHour || 6)}
                                                                        onValueChange={(e) => {
                                                                            setSchedulerConfigId(config.id!);
                                                                            setSchedulerSettings(prev => ({ ...prev, executionHour: e.value ?? 6 }));
                                                                        }}
                                                                        onFocus={() => {
                                                                            if (schedulerConfigId !== config.id) {
                                                                                setSchedulerConfigId(config.id!);
                                                                                setSchedulerSettings({
                                                                                    executionDay: config.executionDay || 1,
                                                                                    executionHour: config.executionHour || 6,
                                                                                    executionMinute: config.executionMinute || 0
                                                                                });
                                                                            }
                                                                        }}
                                                                        min={0} max={23} showButtons
                                                                        style={{ width: '80px' }}
                                                                        suffix=" h"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="font-bold block mb-1 text-sm">Minute</label>
                                                                    <InputNumber
                                                                        value={schedulerConfigId === config.id ? schedulerSettings.executionMinute : (config.executionMinute || 0)}
                                                                        onValueChange={(e) => {
                                                                            setSchedulerConfigId(config.id!);
                                                                            setSchedulerSettings(prev => ({ ...prev, executionMinute: e.value ?? 0 }));
                                                                        }}
                                                                        onFocus={() => {
                                                                            if (schedulerConfigId !== config.id) {
                                                                                setSchedulerConfigId(config.id!);
                                                                                setSchedulerSettings({
                                                                                    executionDay: config.executionDay || 1,
                                                                                    executionHour: config.executionHour || 6,
                                                                                    executionMinute: config.executionMinute || 0
                                                                                });
                                                                            }
                                                                        }}
                                                                        min={0} max={59} showButtons
                                                                        style={{ width: '80px' }}
                                                                        suffix=" min"
                                                                    />
                                                                </div>
                                                                <Button
                                                                    icon="pi pi-save"
                                                                    className="p-button-success p-button-sm"
                                                                    onClick={() => handleSaveSchedulerSettings(config.id!)}
                                                                    tooltip="Enregistrer les paramètres"
                                                                    loading={loading && callType === 'updateSchedulerSettings'}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Status info */}
                                                    <div className="col-12 md:col-2 text-right">
                                                        <Button
                                                            icon="pi pi-info-circle"
                                                            className="p-button-outlined p-button-sm"
                                                            label="Statut"
                                                            onClick={() => loadSchedulerStatus(config.id!)}
                                                            loading={loading && callType === 'loadSchedulerStatus' && schedulerConfigId === config.id}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Scheduler status display */}
                                                {config.schedulerEnabled && (
                                                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid #eee' }}>
                                                        <div className="grid">
                                                            <div className="col-6 md:col-3">
                                                                <div className="text-500 text-sm mb-1">Prochaine exécution prévue</div>
                                                                <div className="font-bold">
                                                                    {config.nextExecutionDate ? formatDateTime(config.nextExecutionDate) : 'Non planifiée'}
                                                                </div>
                                                            </div>
                                                            <div className="col-6 md:col-3">
                                                                <div className="text-500 text-sm mb-1">Dernière exécution</div>
                                                                <div className="font-bold">
                                                                    {config.lastExecutionDate ? formatDateTime(config.lastExecutionDate) : 'Jamais'}
                                                                </div>
                                                            </div>
                                                            <div className="col-6 md:col-3">
                                                                <div className="text-500 text-sm mb-1">Jour d'exécution</div>
                                                                <div className="font-bold">Le {config.executionDay || 1} du mois</div>
                                                            </div>
                                                            <div className="col-6 md:col-3">
                                                                <div className="text-500 text-sm mb-1">Heure d'exécution</div>
                                                                <div className="font-bold">
                                                                    {String(config.executionHour || 6).padStart(2, '0')}:{String(config.executionMinute || 0).padStart(2, '0')}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Message
                                                            severity="info"
                                                            className="w-full mt-2"
                                                            text={`Le prélèvement s'exécutera automatiquement le ${config.executionDay || 1} de chaque ${config.frequency === 'MONTHLY' ? 'mois' : config.frequency === 'QUARTERLY' ? 'trimestre' : config.frequency === 'SEMI_ANNUAL' ? 'semestre' : 'année'} à ${String(config.executionHour || 6).padStart(2, '0')}:${String(config.executionMinute || 0).padStart(2, '0')}`}
                                                        />
                                                    </div>
                                                )}

                                                {/* Detailed status dialog result */}
                                                {schedulerStatus && schedulerConfigId === config.id && (
                                                    <div className="mt-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                                        <div className="flex justify-content-between align-items-center mb-2">
                                                            <strong>Statut détaillé</strong>
                                                            <Button icon="pi pi-times" className="p-button-text p-button-sm" onClick={() => setSchedulerStatus(null)} />
                                                        </div>
                                                        <div className="grid">
                                                            <div className="col-4">
                                                                <span className="text-500 text-sm">Période en cours:</span><br />
                                                                <strong>{formatDate(schedulerStatus.currentPeriodStart)} - {formatDate(schedulerStatus.currentPeriodEnd)}</strong>
                                                            </div>
                                                            <div className="col-4">
                                                                <span className="text-500 text-sm">Déjà exécuté cette période:</span><br />
                                                                <Tag
                                                                    value={schedulerStatus.alreadyExecutedForPeriod ? 'Oui' : 'Non'}
                                                                    severity={schedulerStatus.alreadyExecutedForPeriod ? 'warning' : 'success'}
                                                                />
                                                            </div>
                                                            <div className="col-4">
                                                                <span className="text-500 text-sm">Prochaine exécution:</span><br />
                                                                <strong>{schedulerStatus.nextExecutionDate ? formatDateTime(schedulerStatus.nextExecutionDate) : '-'}</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </TabPanel>

                {/* ===== TAB 3: History ===== */}
                <TabPanel header="Historique" leftIcon="pi pi-history mr-2">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h3 className="m-0">Historique des Exécutions</h3>
                        <Button
                            label="Rafraîchir"
                            icon="pi pi-refresh"
                            className="p-button-outlined"
                            onClick={() => fetchData(null, 'GET', `${BASE_URL}/executions/findall`, 'loadExecutions')}
                            loading={loading && callType === 'loadExecutions'}
                        />
                    </div>

                    <DataTable value={executions} paginator rows={10} emptyMessage="Aucune exécution trouvée" stripedRows sortField="executionDate" sortOrder={-1}>
                        <Column field="batchNumber" header="N° Batch" sortable />
                        <Column field="executionDate" header="Date" body={(row) => formatDate(row.executionDate)} sortable />
                        <Column field="accountType" header="Type Compte" body={(row) => getAccountTypeLabel(row.accountType)} sortable />
                        <Column field="feeAmount" header="Montant Frais" body={(row) => formatCurrency(row.feeAmount)} sortable />
                        <Column field="totalAccountsProcessed" header="Comptes Traités" sortable />
                        <Column field="totalAmountCollected" header="Total Prélevé (FBU)" body={(row) => formatCurrency(row.totalAmountCollected)} sortable />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column field="executedBy" header="Exécuté Par" sortable style={{ maxWidth: '150px' }} />
                        <Column
                            header="Détails"
                            body={(row) => (
                                <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm" onClick={() => viewDetails(row)} tooltip="Voir les détails" />
                            )}
                            style={{ width: '80px' }}
                        />
                    </DataTable>
                </TabPanel>

                {/* ===== TAB 4: Comptes Affectés ===== */}
                <TabPanel header="Comptes Affectés" leftIcon="pi pi-users mr-2">
                    <div className="flex flex-wrap gap-3 align-items-end mb-4">
                        <div className="field mb-0">
                            <label htmlFor="periodFrom" className="font-semibold block mb-2">Date Début</label>
                            <Calendar
                                id="periodFrom"
                                value={periodFrom}
                                onChange={(e) => setPeriodFrom(e.value as Date)}
                                dateFormat="dd/mm/yy"
                                placeholder="Sélectionner"
                                showIcon
                                className="w-full"
                                style={{ minWidth: '200px' }}
                            />
                        </div>
                        <div className="field mb-0">
                            <label htmlFor="periodTo" className="font-semibold block mb-2">Date Fin</label>
                            <Calendar
                                id="periodTo"
                                value={periodTo}
                                onChange={(e) => setPeriodTo(e.value as Date)}
                                dateFormat="dd/mm/yy"
                                placeholder="Sélectionner"
                                showIcon
                                className="w-full"
                                style={{ minWidth: '200px' }}
                            />
                        </div>
                        <Button
                            label="Rechercher"
                            icon="pi pi-search"
                            onClick={searchAffectedAccounts}
                            loading={affectedLoading}
                            className="mb-0"
                        />
                    </div>

                    {affectedDetails.length > 0 && (
                        <div className="mb-3 flex gap-3">
                            <Tag severity="info" value={`${affectedDetails.length} comptes affectés`} />
                            <Tag severity="success" value={`Total prélevé: ${formatCurrency(affectedDetails.filter(d => d.status === 'SUCCESS').reduce((sum, d) => sum + (d.amount || 0), 0))}`} />
                        </div>
                    )}

                    <DataTable
                        value={affectedDetails}
                        paginator
                        rows={15}
                        rowsPerPageOptions={[10, 15, 25, 50]}
                        emptyMessage={periodFrom && periodTo ? "Aucun compte affecté pour cette période" : "Sélectionnez une période pour afficher les comptes affectés"}
                        stripedRows
                        sortField="createdAt"
                        sortOrder={-1}
                        loading={affectedLoading}
                        globalFilterFields={['accountNumber', 'clientName', 'status']}
                    >
                        <Column field="accountNumber" header="N° Compte" sortable filter style={{ width: '12%' }} />
                        <Column field="clientName" header="Nom Client" sortable filter style={{ width: '20%' }} />
                        <Column field="amount" header="Montant Prélevé" body={(row) => formatCurrency(row.amount)} sortable style={{ width: '12%' }} />
                        <Column field="balanceBefore" header="Solde Avant" body={(row) => formatCurrency(row.balanceBefore)} sortable style={{ width: '12%' }} />
                        <Column field="balanceAfter" header="Solde Après" body={(row) => {
                            const val = row.balanceAfter;
                            const color = val < 0 ? 'text-red-600' : '';
                            return <span className={color}>{formatCurrency(val)}</span>;
                        }} sortable style={{ width: '12%' }} />
                        <Column field="status" header="Statut" body={(row) => (
                            <Tag value={row.status} severity={row.status === 'SUCCESS' ? 'success' : row.status === 'SKIPPED' ? 'warning' : 'danger'} />
                        )} sortable style={{ width: '8%' }} />
                        <Column field="pieceId" header="Pièce" sortable style={{ width: '12%' }} />
                        <Column field="createdAt" header="Date" body={(row) => formatDate(row.createdAt)} sortable style={{ width: '10%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Detail Dialog */}
            <Dialog
                header={selectedExecution ? `Détails - Batch ${selectedExecution.batchNumber}` : 'Détails'}
                visible={detailDialog}
                style={{ width: '90vw', maxWidth: '1200px' }}
                modal
                onHide={() => { setDetailDialog(false); setSelectedExecution(null); }}
            >
                {selectedExecution && (
                    <div className="mb-3">
                        <div className="grid">
                            <div className="col-3"><strong>Date:</strong> {formatDate(selectedExecution.executionDate)}</div>
                            <div className="col-3"><strong>Type:</strong> {getAccountTypeLabel(selectedExecution.accountType)}</div>
                            <div className="col-3"><strong>Frais:</strong> {formatCurrency(selectedExecution.feeAmount)}</div>
                            <div className="col-3"><strong>Total prélevé:</strong> {formatCurrency(selectedExecution.totalAmountCollected)}</div>
                        </div>
                        <Divider />
                    </div>
                )}

                <DataTable value={details} paginator rows={15} emptyMessage="Aucun détail trouvé" stripedRows>
                    <Column field="accountNumber" header="N° Compte" sortable />
                    <Column field="clientName" header="Nom Client" sortable />
                    <Column field="amount" header="Montant" body={(row) => formatCurrency(row.amount)} sortable />
                    <Column field="balanceBefore" header="Solde Avant" body={(row) => formatCurrency(row.balanceBefore)} sortable />
                    <Column field="balanceAfter" header="Solde Après" body={detailBalanceAfterTemplate} sortable />
                    <Column field="status" header="Statut" body={detailStatusTemplate} sortable />
                </DataTable>
            </Dialog>
        </div>
    );
}
