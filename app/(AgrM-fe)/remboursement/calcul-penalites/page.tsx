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
import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import {
    PenaltySchedulerConfig,
    PenaltySchedulerConfigClass,
    PenaltyExecutionHistory,
    PenaltySchedulerStatus,
    BASES_CALCUL_PENALITE
} from '../types/RemboursementTypes';

export default function CalculPenalitesPage() {
    const toast = useRef<Toast>(null);

    // State for configuration
    const [config, setConfig] = useState<PenaltySchedulerConfig>(new PenaltySchedulerConfigClass());
    const [status, setStatus] = useState<PenaltySchedulerStatus | null>(null);
    const [history, setHistory] = useState<PenaltyExecutionHistory[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<PenaltyExecutionHistory | null>(null);
    const [showLogDialog, setShowLogDialog] = useState(false);

    // Overdue schedules state
    const [overdueSchedules, setOverdueSchedules] = useState<any[]>([]);
    const [overdueLoaded, setOverdueLoaded] = useState(false);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/late-payment-classifications/penalty-scheduler');
    const SCHEDULES_URL = buildApiUrl('/api/remboursement/schedules');

    // Handle API responses
    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadConfig':
                    setConfig(data);
                    setInitialLoading(false);
                    // After config loads, load status and history
                    fetchData(null, 'GET', `${BASE_URL}/status`, 'loadStatus');
                    break;
                case 'loadStatus':
                    setStatus(data);
                    fetchData(null, 'GET', `${BASE_URL}/history`, 'loadHistory');
                    break;
                case 'loadHistory':
                    setHistory(Array.isArray(data) ? data : []);
                    break;
                case 'loadOverdue':
                    setOverdueSchedules(Array.isArray(data) ? data : []);
                    setOverdueLoaded(true);
                    break;
                case 'saveConfig':
                    setConfig(data);
                    setSaving(false);
                    showToast('success', 'Succès', 'Configuration enregistrée avec succès');
                    fetchData(null, 'GET', `${BASE_URL}/status`, 'loadStatus');
                    break;
                case 'toggleScheduler':
                    setConfig(data);
                    showToast('success', 'Succès', data.schedulerEnabled ? 'Planificateur activé' : 'Planificateur désactivé');
                    fetchData(null, 'GET', `${BASE_URL}/status`, 'loadStatus');
                    break;
                case 'execute':
                    setExecuting(false);
                    showToast(
                        data.status === 'COMPLETED' ? 'success' : 'warn',
                        data.status === 'COMPLETED' ? 'Exécution terminée' : 'Exécution avec avertissements',
                        `${data.totalSchedulesProcessed || 0} échéances traitées, ${formatCurrency(data.totalPenaltyCalculated || 0)} de pénalités calculées`
                    );
                    fetchData(null, 'GET', `${BASE_URL}/status`, 'loadStatus');
                    break;
            }
        }
        if (error) {
            setInitialLoading(false);
            setSaving(false);
            setExecuting(false);
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    // Load data on mount - start with config, then chain status -> history
    useEffect(() => {
        loadConfiguration();
    }, []);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const loadConfiguration = () => {
        fetchData(null, 'GET', `${BASE_URL}/config`, 'loadConfig');
    };

    const loadOverdueSchedules = () => {
        if (!overdueLoaded) {
            fetchData(null, 'GET', `${SCHEDULES_URL}/findoverdue`, 'loadOverdue');
        }
    };

    const getDaysOverdue = (dueDate: string): number => {
        if (!dueDate) return 0;
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today.getTime() - due.getTime();
        return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    };

    const handleSaveConfiguration = () => {
        if (!config.id) {
            showToast('warn', 'Configuration manquante', 'Aucune configuration trouvée. Veuillez rafraîchir la page.');
            return;
        }
        setSaving(true);
        fetchData(config, 'PUT', `${BASE_URL}/config/${config.id}`, 'saveConfig');
    };

    const handleToggleScheduler = (enabled: boolean) => {
        if (!config.id) {
            showToast('warn', 'Configuration manquante', 'Veuillez enregistrer la configuration d\'abord.');
            return;
        }
        fetchData(null, 'PUT', `${BASE_URL}/toggle/${config.id}?enabled=${enabled}`, 'toggleScheduler');
    };

    const handleExecuteNow = () => {
        setExecuting(true);
        const userAction = getUserAction();
        fetchData(null, 'POST', `${BASE_URL}/execute?userAction=${encodeURIComponent(userAction || 'MANUAL_TRIGGER')}`, 'execute');
    };

    const formatCurrency = (value: number | undefined | null): string => {
        if (value === undefined || value === null) return '0 FBU';
        return new Intl.NumberFormat('fr-BI', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString: string | undefined | null): string => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatDuration = (ms: number | undefined | null): string => {
        if (!ms) return '-';
        if (ms < 1000) return `${ms} ms`;
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds} s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const getStatusSeverity = (statusVal: string | undefined): "success" | "info" | "warning" | "danger" | null | undefined => {
        switch (statusVal) {
            case 'COMPLETED': return 'success';
            case 'RUNNING': return 'info';
            case 'PENDING': return 'warning';
            case 'FAILED': return 'danger';
            default: return null;
        }
    };

    const getStatusLabel = (statusVal: string | undefined): string => {
        switch (statusVal) {
            case 'COMPLETED': return 'Terminé';
            case 'RUNNING': return 'En cours';
            case 'PENDING': return 'En attente';
            case 'FAILED': return 'Échoué';
            default: return statusVal || '-';
        }
    };

    const statusBodyTemplate = (rowData: PenaltyExecutionHistory) => {
        return <Tag severity={getStatusSeverity(rowData.status)} value={getStatusLabel(rowData.status)} />;
    };

    const triggeredByBodyTemplate = (rowData: PenaltyExecutionHistory) => {
        return (
            <Tag
                severity={rowData.triggeredBy === 'SCHEDULER' ? 'info' : 'warning'}
                value={rowData.triggeredBy === 'SCHEDULER' ? 'Automatique' : 'Manuel'}
            />
        );
    };

    const dateBodyTemplate = (rowData: PenaltyExecutionHistory) => {
        return formatDate(rowData.executionDate);
    };

    const durationBodyTemplate = (rowData: PenaltyExecutionHistory) => {
        return formatDuration(rowData.durationMs);
    };

    const actionsBodyTemplate = (rowData: PenaltyExecutionHistory) => {
        return (
            <Button
                icon="pi pi-eye"
                className="p-button-text p-button-sm"
                tooltip="Voir le log"
                tooltipOptions={{ position: 'left' }}
                onClick={() => {
                    setSelectedHistory(rowData);
                    setShowLogDialog(true);
                }}
            />
        );
    };

    if (initialLoading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <div className="flex justify-content-between align-items-center mb-4">
                    <h2 className="m-0">
                        <i className="pi pi-calculator mr-2"></i>
                        Calcul Automatique des Pénalités
                    </h2>
                    <Button
                        label="Exécuter maintenant"
                        icon="pi pi-play"
                        className="p-button-warning"
                        onClick={handleExecuteNow}
                        loading={executing}
                        disabled={executing}
                    />
                </div>
            </div>

            {/* Status Card */}
            <div className="col-12">
                <Card className="mb-4">
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <div className="text-500 font-medium mb-1">Statut du Planificateur</div>
                            <div className="flex align-items-center">
                                <Tag
                                    severity={status?.schedulerEnabled ? 'success' : 'danger'}
                                    value={status?.schedulerEnabled ? 'Actif' : 'Inactif'}
                                    className="mr-2"
                                />
                                <span className="text-600">
                                    {status?.executionTime ? `à ${status.executionTime}` : ''}
                                </span>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="text-500 font-medium mb-1">Dernière Exécution</div>
                            <div className="text-900 font-medium">
                                {status?.lastExecutionDate ? formatDate(status.lastExecutionDate) : 'Jamais'}
                            </div>
                            {status?.lastExecutionStatus && (
                                <Tag
                                    severity={getStatusSeverity(status.lastExecutionStatus)}
                                    value={getStatusLabel(status.lastExecutionStatus)}
                                    className="mt-1"
                                />
                            )}
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="text-500 font-medium mb-1">Prochaine Exécution</div>
                            <div className="text-900 font-medium">
                                {status?.nextExecutionDate ? formatDate(status.nextExecutionDate) : '-'}
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="text-500 font-medium mb-1">Dernière Pénalité Calculée</div>
                            <div className="text-900 font-medium text-orange-500">
                                {formatCurrency(status?.lastTotalPenalty)}
                            </div>
                            <span className="text-600 text-sm">
                                {status?.lastSchedulesProcessed || 0} échéances
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12">
                <TabView>
                    {/* Configuration Tab */}
                    <TabPanel header="Configuration" leftIcon="pi pi-cog mr-2">
                        <div className="grid">
                            {/* Scheduler Settings */}
                            <div className="col-12 md:col-6">
                                <Card title="Paramètres du Planificateur" className="h-full">
                                    <div className="field">
                                        <label className="font-semibold">Activer le Planificateur</label>
                                        <div className="flex align-items-center mt-2">
                                            <InputSwitch
                                                checked={config.schedulerEnabled || false}
                                                onChange={(e) => handleToggleScheduler(e.value)}
                                            />
                                            <span className="ml-2 text-600">
                                                {config.schedulerEnabled ? 'Activé' : 'Désactivé'}
                                            </span>
                                        </div>
                                    </div>

                                    <Divider />

                                    <div className="formgrid grid">
                                        <div className="field col-6">
                                            <label htmlFor="executionHour" className="font-semibold">
                                                Heure d'Exécution
                                            </label>
                                            <InputNumber
                                                id="executionHour"
                                                value={config.executionHour || 6}
                                                onValueChange={(e) => setConfig({ ...config, executionHour: e.value ?? 6 })}
                                                min={0}
                                                max={23}
                                                showButtons
                                                className="w-full"
                                                suffix=" h"
                                            />
                                        </div>
                                        <div className="field col-6">
                                            <label htmlFor="executionMinute" className="font-semibold">
                                                Minute d'Exécution
                                            </label>
                                            <InputNumber
                                                id="executionMinute"
                                                value={config.executionMinute || 0}
                                                onValueChange={(e) => setConfig({ ...config, executionMinute: e.value ?? 0 })}
                                                min={0}
                                                max={59}
                                                showButtons
                                                className="w-full"
                                                suffix=" min"
                                            />
                                        </div>
                                    </div>

                                    <Message
                                        severity="info"
                                        text={`Le calcul des pénalités s'exécutera tous les jours à ${String(config.executionHour || 6).padStart(2, '0')}:${String(config.executionMinute || 0).padStart(2, '0')}`}
                                        className="w-full mt-2"
                                    />
                                </Card>
                            </div>

                            {/* Rate Settings */}
                            <div className="col-12 md:col-6">
                                <Card title="Paramètres de Calcul" className="h-full">
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="code" className="font-semibold">Code *</label>
                                            <InputText
                                                id="code"
                                                value={config.code || ''}
                                                onChange={(e) => setConfig({ ...config, code: e.target.value })}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="name" className="font-semibold">Nom *</label>
                                            <InputText
                                                id="name"
                                                value={config.name || ''}
                                                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="dailyRate" className="font-semibold">
                                                Taux Journalier (%)
                                            </label>
                                            <InputNumber
                                                id="dailyRate"
                                                value={config.dailyRate}
                                                onValueChange={(e) => setConfig({ ...config, dailyRate: e.value ?? 0 })}
                                                min={0}
                                                max={5}
                                                minFractionDigits={2}
                                                maxFractionDigits={5}
                                                className="w-full"
                                                suffix=" %"
                                            />
                                            <small className="text-500">
                                                Taux appliqué chaque jour sur le montant impayé
                                            </small>
                                        </div>

                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="maxCapPercentage" className="font-semibold">
                                                Plafond Maximum (%)
                                            </label>
                                            <InputNumber
                                                id="maxCapPercentage"
                                                value={config.maxCapPercentage}
                                                onValueChange={(e) => setConfig({ ...config, maxCapPercentage: e.value ?? 0 })}
                                                min={0}
                                                max={100}
                                                className="w-full"
                                                suffix=" %"
                                            />
                                            <small className="text-500">
                                                % maximum du capital restant dû
                                            </small>
                                        </div>

                                        <div className="field col-12">
                                            <label htmlFor="calculationBase" className="font-semibold">
                                                Base de Calcul
                                            </label>
                                            <Dropdown
                                                id="calculationBase"
                                                value={config.calculationBase}
                                                options={BASES_CALCUL_PENALITE}
                                                onChange={(e) => setConfig({ ...config, calculationBase: e.value })}
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="field col-12">
                                            <label htmlFor="description" className="font-semibold">
                                                Description
                                            </label>
                                            <InputTextarea
                                                id="description"
                                                value={config.description || ''}
                                                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                                className="w-full"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Save Button */}
                            <div className="col-12 flex justify-content-end">
                                <Button
                                    label="Enregistrer la Configuration"
                                    icon="pi pi-save"
                                    className="p-button-success"
                                    onClick={handleSaveConfiguration}
                                    loading={saving}
                                />
                            </div>
                        </div>
                    </TabPanel>

                    {/* History Tab */}
                    <TabPanel header="Historique d'Exécution" leftIcon="pi pi-history mr-2">
                        <DataTable
                            value={history}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            emptyMessage="Aucun historique d'exécution"
                            className="p-datatable-sm"
                            sortField="executionDate"
                            sortOrder={-1}
                        >
                            <Column
                                field="executionDate"
                                header="Date d'Exécution"
                                body={dateBodyTemplate}
                                sortable
                                style={{ minWidth: '150px' }}
                            />
                            <Column
                                field="status"
                                header="Statut"
                                body={statusBodyTemplate}
                                sortable
                                style={{ minWidth: '100px' }}
                            />
                            <Column
                                field="triggeredBy"
                                header="Déclencheur"
                                body={triggeredByBodyTemplate}
                                sortable
                                style={{ minWidth: '120px' }}
                            />
                            <Column
                                field="totalOverdueFound"
                                header="Éch. en Retard"
                                body={(rowData) => (
                                    <span className="font-semibold">
                                        {rowData.totalOverdueFound ?? 0}
                                    </span>
                                )}
                                sortable
                                style={{ minWidth: '100px' }}
                            />
                            <Column
                                field="totalSchedulesProcessed"
                                header="Éch. Pénalisées"
                                body={(rowData) => {
                                    const processed = rowData.totalSchedulesProcessed || 0;
                                    const found = rowData.totalOverdueFound || 0;
                                    return (
                                        <span>
                                            <span className={processed > 0 ? 'text-orange-600 font-semibold' : ''}>
                                                {processed}
                                            </span>
                                            {found > 0 && <span className="text-500 text-sm"> / {found}</span>}
                                        </span>
                                    );
                                }}
                                sortable
                                style={{ minWidth: '110px' }}
                            />
                            <Column
                                field="totalLoansProcessed"
                                header="Crédits Touchés"
                                body={(rowData) => rowData.totalLoansProcessed || 0}
                                sortable
                                style={{ minWidth: '100px' }}
                            />
                            <Column
                                field="totalPenaltyCalculated"
                                header="Pénalités Calculées"
                                body={(rowData) => (
                                    <span className={rowData.totalPenaltyCalculated > 0 ? 'text-orange-600 font-bold' : ''}>
                                        {formatCurrency(rowData.totalPenaltyCalculated)}
                                    </span>
                                )}
                                sortable
                                style={{ minWidth: '130px' }}
                            />
                            <Column
                                field="penaltyRateUsed"
                                header="Taux Utilisé"
                                body={(rowData) => {
                                    const rate = rowData.penaltyRateUsed;
                                    return rate != null && rate > 0
                                        ? <span className="font-semibold">{rate}%</span>
                                        : <span className="text-500">-</span>;
                                }}
                                style={{ minWidth: '90px' }}
                            />
                            <Column
                                field="durationMs"
                                header="Durée"
                                body={durationBodyTemplate}
                                style={{ minWidth: '80px' }}
                            />
                            <Column
                                body={actionsBodyTemplate}
                                style={{ width: '60px' }}
                            />
                        </DataTable>
                    </TabPanel>

                    {/* Overdue Schedules Tab */}
                    <TabPanel header="Échéances en Retard" leftIcon="pi pi-exclamation-triangle mr-2">
                        <div className="mb-3 flex justify-content-between align-items-center">
                            <h5 className="m-0">
                                <i className="pi pi-list mr-2"></i>
                                Échéances impayées soumises au calcul de pénalités
                            </h5>
                            <Button
                                label={overdueLoaded ? "Rafraîchir" : "Charger les données"}
                                icon={overdueLoaded ? "pi pi-refresh" : "pi pi-download"}
                                outlined
                                size="small"
                                onClick={() => { setOverdueLoaded(false); fetchData(null, 'GET', `${SCHEDULES_URL}/findoverdue`, 'loadOverdue'); }}
                                loading={loading && callType === 'loadOverdue'}
                            />
                        </div>

                        {!overdueLoaded ? (
                            <Message
                                severity="info"
                                text="Cliquez sur 'Charger les données' pour voir les échéances en retard actuelles."
                                className="w-full"
                            />
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div className="grid mb-3">
                                    <div className="col-6 md:col-3">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-2xl font-bold text-primary">{overdueSchedules.length}</div>
                                            <div className="text-500 text-sm">Échéances en retard</div>
                                        </div>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-2xl font-bold text-blue-500">
                                                {new Set(overdueSchedules.map((s: any) => s.loanId)).size}
                                            </div>
                                            <div className="text-500 text-sm">Crédits concernés</div>
                                        </div>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-lg font-bold text-red-500">
                                                {formatCurrency(overdueSchedules.reduce((sum: number, s: any) => sum + ((s.totalDue || 0) - (s.totalPaid || 0)), 0))}
                                            </div>
                                            <div className="text-500 text-sm">Total impayé</div>
                                        </div>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-lg font-bold text-orange-500">
                                                {formatCurrency(overdueSchedules.reduce((sum: number, s: any) => sum + (s.penaltyAccrued || 0), 0))}
                                            </div>
                                            <div className="text-500 text-sm">Pénalités accumulées</div>
                                        </div>
                                    </div>
                                </div>

                                <DataTable
                                    value={overdueSchedules}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    emptyMessage="Aucune échéance en retard"
                                    className="p-datatable-sm"
                                    sortField="dueDate"
                                    sortOrder={1}
                                >
                                    <Column
                                        field="applicationNumber"
                                        header="N° Dossier"
                                        sortable
                                        filter
                                        style={{ width: '9%' }}
                                    />
                                    <Column
                                        field="clientName"
                                        header="Client"
                                        sortable
                                        filter
                                        style={{ width: '12%' }}
                                    />
                                    <Column
                                        field="accountNumber"
                                        header="N° Compte"
                                        sortable
                                        filter
                                        style={{ width: '9%' }}
                                    />
                                    <Column
                                        field="installmentNumber"
                                        header="N°"
                                        sortable
                                        style={{ width: '4%' }}
                                    />
                                    <Column
                                        field="dueDate"
                                        header="Date Éch."
                                        body={(row) => formatDate(row.dueDate)?.split(' ')[0] || '-'}
                                        sortable
                                        style={{ width: '8%' }}
                                    />
                                    <Column
                                        header="Jours Retard"
                                        body={(row) => {
                                            const days = getDaysOverdue(row.dueDate);
                                            let severity: 'success' | 'warning' | 'danger' = 'success';
                                            if (days > 90) severity = 'danger';
                                            else if (days > 30) severity = 'warning';
                                            return <Tag value={`${days} j`} severity={severity} />;
                                        }}
                                        sortable
                                        sortField="dueDate"
                                        style={{ width: '7%' }}
                                    />
                                    <Column
                                        field="principalDue"
                                        header="Capital Dû"
                                        body={(row) => formatCurrency(row.principalDue)}
                                        style={{ width: '9%' }}
                                    />
                                    <Column
                                        field="interestDue"
                                        header="Intérêt Dû"
                                        body={(row) => formatCurrency(row.interestDue)}
                                        style={{ width: '8%' }}
                                    />
                                    <Column
                                        header="Restant Dû"
                                        body={(row) => (
                                            <span className="text-red-600 font-semibold">
                                                {formatCurrency((row.totalDue || 0) - (row.totalPaid || 0))}
                                            </span>
                                        )}
                                        style={{ width: '9%' }}
                                    />
                                    <Column
                                        field="penaltyAccrued"
                                        header="Pénalités"
                                        body={(row) => (
                                            <span className={row.penaltyAccrued > 0 ? 'text-orange-600 font-semibold' : ''}>
                                                {formatCurrency(row.penaltyAccrued || 0)}
                                            </span>
                                        )}
                                        sortable
                                        style={{ width: '9%' }}
                                    />
                                    <Column
                                        field="status"
                                        header="Statut"
                                        body={(row) => (
                                            <Tag
                                                value={row.status === 'OVERDUE' ? 'En retard' : row.status === 'PENDING' ? 'En attente' : row.status}
                                                severity={row.status === 'OVERDUE' ? 'danger' : 'warning'}
                                            />
                                        )}
                                        sortable
                                        style={{ width: '7%' }}
                                    />
                                </DataTable>
                            </>
                        )}
                    </TabPanel>

                    {/* Formula Tab */}
                    <TabPanel header="Formule de Calcul" leftIcon="pi pi-info-circle mr-2">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <Card title="Formule Appliquée" className="h-full">
                                    <div className="surface-100 p-3 border-round mb-3">
                                        <p className="font-medium text-lg m-0">
                                            Pénalité = (Capital impayé + Intérêt impayé + Pénalités non payées) × Taux Journalier
                                        </p>
                                    </div>

                                    <h5>Détails du Calcul:</h5>
                                    <ul className="line-height-3">
                                        <li>
                                            <strong>Capital impayé</strong> = Capital dû - Capital payé
                                        </li>
                                        <li>
                                            <strong>Intérêt impayé</strong> = Intérêt dû - Intérêt payé
                                        </li>
                                        <li>
                                            <strong>Pénalités non payées</strong> = Pénalités accumulées - Pénalités payées
                                        </li>
                                        <li>
                                            <strong>Taux Journalier</strong> = {config.dailyRate}% (configurable)
                                        </li>
                                        <li>
                                            <strong>Plafond</strong> = Maximum {config.maxCapPercentage || 0}% du capital restant dû
                                        </li>
                                    </ul>

                                    <Message
                                        severity="warn"
                                        text="La pénalité s'accumule chaque jour! Si la pénalité d'aujourd'hui n'est pas payée, demain le calcul inclura: Capital impayé + Intérêt impayé + Pénalités d'hier + Pénalité d'aujourd'hui"
                                        className="w-full mt-3"
                                    />
                                </Card>
                            </div>

                            <div className="col-12 md:col-6">
                                <Card title="Exemple de Calcul (Jour 1)" className="h-full">
                                    <div className="surface-50 p-3 border-round mb-3">
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="py-2">Capital impayé:</td>
                                                    <td className="py-2 text-right font-semibold">50 000 FBU</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2">Intérêt impayé:</td>
                                                    <td className="py-2 text-right font-semibold">+ 10 000 FBU</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2">Pénalités non payées:</td>
                                                    <td className="py-2 text-right font-semibold">+ 0 FBU</td>
                                                </tr>
                                                <tr className="border-top-1 surface-border">
                                                    <td className="py-2 text-primary font-bold">Base de calcul:</td>
                                                    <td className="py-2 text-right text-primary font-bold">60 000 FBU</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2">Taux journalier:</td>
                                                    <td className="py-2 text-right font-semibold">× {config.dailyRate}%</td>
                                                </tr>
                                                <tr className="border-top-1 surface-border">
                                                    <td className="py-2 text-orange-500 font-bold">Pénalité Jour 1:</td>
                                                    <td className="py-2 text-right text-orange-500 font-bold">
                                                        {formatCurrency(60000 * ((config.dailyRate || 0) / 100))}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="surface-50 p-3 border-round">
                                        <h6 className="mt-0 mb-2 text-600">Jour 2 (si non payé):</h6>
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="py-1 text-sm">Capital impayé:</td>
                                                    <td className="py-1 text-right font-semibold text-sm">50 000 FBU</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-sm">Intérêt impayé:</td>
                                                    <td className="py-1 text-right font-semibold text-sm">+ 10 000 FBU</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-sm text-orange-500">+ Pénalité Jour 1:</td>
                                                    <td className="py-1 text-right font-semibold text-sm text-orange-500">
                                                        + {formatCurrency(60000 * ((config.dailyRate || 0) / 100))}
                                                    </td>
                                                </tr>
                                                <tr className="border-top-1 surface-border">
                                                    <td className="py-1 text-primary font-bold text-sm">Nouvelle base:</td>
                                                    <td className="py-1 text-right text-primary font-bold text-sm">
                                                        {formatCurrency(60000 + 60000 * ((config.dailyRate || 0) / 100))}
                                                    </td>
                                                </tr>
                                                <tr className="border-top-1 surface-border">
                                                    <td className="py-1 text-red-500 font-bold text-sm">Pénalité Jour 2:</td>
                                                    <td className="py-1 text-right text-red-500 font-bold text-sm">
                                                        {formatCurrency((60000 + 60000 * ((config.dailyRate || 0) / 100)) * ((config.dailyRate || 0) / 100))}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </div>

            {/* Execution Log Dialog */}
            <Dialog
                visible={showLogDialog}
                onHide={() => setShowLogDialog(false)}
                header="Détails de l'Exécution"
                style={{ width: '70vw' }}
                maximizable
            >
                {selectedHistory && (
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label className="font-semibold">Date d'Exécution</label>
                                <p className="m-0">{formatDate(selectedHistory.executionDate)}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label className="font-semibold">Statut</label>
                                <p className="m-0">
                                    <Tag
                                        severity={getStatusSeverity(selectedHistory.status)}
                                        value={getStatusLabel(selectedHistory.status)}
                                    />
                                </p>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label className="font-semibold">Déclencheur</label>
                                <p className="m-0">
                                    <Tag
                                        severity={selectedHistory.triggeredBy === 'SCHEDULER' ? 'info' : 'warning'}
                                        value={selectedHistory.triggeredBy === 'SCHEDULER' ? 'Automatique' : 'Manuel'}
                                    />
                                </p>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label className="font-semibold">Éch. en Retard Trouvées</label>
                                <p className="m-0 text-lg font-bold">{selectedHistory.totalOverdueFound ?? 0}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label className="font-semibold">Éch. Pénalisées</label>
                                <p className="m-0 text-lg font-bold text-orange-500">{selectedHistory.totalSchedulesProcessed || 0}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label className="font-semibold">Crédits Touchés</label>
                                <p className="m-0 text-lg font-bold">{selectedHistory.totalLoansProcessed || 0}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label className="font-semibold">Taux Utilisé</label>
                                <p className="m-0 text-lg font-bold">
                                    {selectedHistory.penaltyRateUsed != null && selectedHistory.penaltyRateUsed > 0
                                        ? `${selectedHistory.penaltyRateUsed}%`
                                        : '-'}
                                </p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold">Pénalités Calculées</label>
                                <p className="m-0 text-orange-500 font-bold text-xl">
                                    {formatCurrency(selectedHistory.totalPenaltyCalculated)}
                                </p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold">Durée d'Exécution</label>
                                <p className="m-0 text-lg">{formatDuration(selectedHistory.durationMs)}</p>
                            </div>
                        </div>

                        {selectedHistory.errorMessage && (
                            <div className="col-12">
                                <Message severity="error" text={selectedHistory.errorMessage} className="w-full" />
                            </div>
                        )}

                        <div className="col-12">
                            <div className="field">
                                <label className="font-semibold">Journal d'Exécution</label>
                                <InputTextarea
                                    value={selectedHistory.executionLog || 'Aucun log disponible'}
                                    readOnly
                                    className="w-full"
                                    rows={15}
                                    style={{ fontFamily: 'monospace' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
