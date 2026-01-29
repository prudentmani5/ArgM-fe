'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Divider } from 'primereact/divider';
import { buildApiUrl } from '../../../utils/apiConfig';
import useConsumApi from '../../../hooks/fetchData/useConsumApi';
import {
    TrackAuditTrail,
    TrackAuditTrailSearchCriteria,
    PaginatedResponse,
    AuditTrailStats,
    ActionTypeOptions,
    ModuleOptions,
    StatusOptions,
    getActionTypeName,
    getModuleName,
    getStatusSeverity,
    getStatusLabel
} from './types';

function TrackingPage() {
    // State
    const [auditTrails, setAuditTrails] = useState<TrackAuditTrail[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<AuditTrailStats | null>(null);
    const [selectedAudit, setSelectedAudit] = useState<TrackAuditTrail | null>(null);
    const [detailDialogVisible, setDetailDialogVisible] = useState(false);

    // Filters
    const [filters, setFilters] = useState<TrackAuditTrailSearchCriteria>({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        page: 0,
        size: 20,
        sortBy: 'actionTimestamp',
        sortDirection: 'DESC'
    });

    const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [usernameFilter, setUsernameFilter] = useState('');
    const [entityTableFilter, setEntityTableFilter] = useState('');

    // API hooks
    const { data, error, fetchData, callType } = useConsumApi('');
    const { data: statsData, fetchData: fetchStats, callType: statsCallType } = useConsumApi('');
    const toast = useRef<Toast>(null);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Load data on mount
    useEffect(() => {
        loadAuditTrails();
        loadStats();
    }, []);

    // Handle API responses
    useEffect(() => {
        if (data && callType === 'loadAuditTrails') {
            if (data.content) {
                setAuditTrails(data.content);
                setTotalRecords(data.totalElements || 0);
            } else if (Array.isArray(data)) {
                setAuditTrails(data);
                setTotalRecords(data.length);
            }
            setLoading(false);
        }
        if (error && callType === 'loadAuditTrails') {
            setLoading(false);
            showToast('error', 'Erreur', 'Erreur lors du chargement des données');
        }
    }, [data, error, callType]);

    useEffect(() => {
        if (statsData && statsCallType === 'loadStats') {
            setStats(statsData);
        }
    }, [statsData, statsCallType]);

    const loadAuditTrails = () => {
        setLoading(true);
        const searchCriteria = {
            ...filters,
            username: usernameFilter || null,
            entityTable: entityTableFilter || null,
            startDate: startDate ? startDate.toISOString().split('T')[0] : null,
            endDate: endDate ? endDate.toISOString().split('T')[0] : null
        };
        fetchData(searchCriteria, 'POST', buildApiUrl('/api/audit-trail/search'), 'loadAuditTrails');
    };

    const loadStats = () => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
        if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
        fetchStats(null, 'GET', buildApiUrl(`/api/audit-trail/stats?${params.toString()}`), 'loadStats');
    };

    const handleSearch = () => {
        setFilters({ ...filters, page: 0 });
        loadAuditTrails();
        loadStats();
    };

    const handleReset = () => {
        setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
        setEndDate(new Date());
        setUsernameFilter('');
        setEntityTableFilter('');
        setFilters({
            startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            actionTypeId: null,
            moduleId: null,
            status: null,
            page: 0,
            size: 20,
            sortBy: 'actionTimestamp',
            sortDirection: 'DESC'
        });
        setTimeout(() => {
            loadAuditTrails();
            loadStats();
        }, 100);
    };

    const onPage = (event: DataTablePageEvent) => {
        setFilters({
            ...filters,
            page: event.page || 0,
            size: event.rows || 20
        });
        setTimeout(() => loadAuditTrails(), 100);
    };

    const onSort = (event: DataTableSortEvent) => {
        setFilters({
            ...filters,
            sortBy: event.sortField as string || 'actionTimestamp',
            sortDirection: event.sortOrder === 1 ? 'ASC' : 'DESC'
        });
        setTimeout(() => loadAuditTrails(), 100);
    };

    const viewDetails = (audit: TrackAuditTrail) => {
        setSelectedAudit(audit);
        setDetailDialogVisible(true);
    };

    const exportToExcel = () => {
        if (auditTrails.length === 0) {
            showToast('warn', 'Attention', 'Aucune donnée à exporter');
            return;
        }

        const headers = ['Date', 'Heure', 'Utilisateur', 'Action', 'Module', 'Entité', 'Description', 'Statut', 'IP'];
        const rows = auditTrails.map(audit => [
            audit.actionDate || '',
            audit.actionTime || '',
            audit.userFullName || audit.username || '',
            getActionTypeName(audit.actionTypeId),
            getModuleName(audit.moduleId),
            audit.entityTable || '',
            audit.actionDescription || '',
            getStatusLabel(audit.status),
            audit.ipAddress || ''
        ]);

        let csvContent = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('success', 'Export', 'Fichier CSV téléchargé avec succès');
    };

    // Column templates
    const dateTimeTemplate = (rowData: TrackAuditTrail) => (
        <div>
            <div className="font-semibold">{rowData.actionDate}</div>
            <div className="text-sm text-500">{rowData.actionTime}</div>
        </div>
    );

    const userTemplate = (rowData: TrackAuditTrail) => (
        <div className="flex align-items-center gap-2">
            <Avatar
                icon="pi pi-user"
                size="normal"
                shape="circle"
                className="bg-primary-100 text-primary-700"
            />
            <div>
                <div className="font-semibold">{rowData.userFullName || rowData.username || 'Système'}</div>
                <div className="text-sm text-500">{rowData.userRole || '-'}</div>
            </div>
        </div>
    );

    const actionTemplate = (rowData: TrackAuditTrail) => {
        const actionName = getActionTypeName(rowData.actionTypeId);
        const iconMap: Record<number, string> = {
            1: 'pi pi-plus',
            2: 'pi pi-eye',
            3: 'pi pi-pencil',
            4: 'pi pi-trash',
            10: 'pi pi-sign-in',
            11: 'pi pi-sign-out',
            12: 'pi pi-times',
            40: 'pi pi-check',
            41: 'pi pi-check-circle',
            42: 'pi pi-times-circle'
        };
        const icon = iconMap[rowData.actionTypeId] || 'pi pi-cog';

        return (
            <div className="flex align-items-center gap-2">
                <i className={`${icon} text-primary`}></i>
                <span>{actionName}</span>
            </div>
        );
    };

    const moduleTemplate = (rowData: TrackAuditTrail) => (
        <Tag value={getModuleName(rowData.moduleId)} severity="info" />
    );

    const entityTemplate = (rowData: TrackAuditTrail) => (
        <div>
            <div className="font-semibold">{rowData.entityTable}</div>
            {rowData.entityId && <div className="text-sm text-500">ID: {rowData.entityId}</div>}
        </div>
    );

    const statusTemplate = (rowData: TrackAuditTrail) => (
        <Tag value={getStatusLabel(rowData.status)} severity={getStatusSeverity(rowData.status)} />
    );

    const actionsTemplate = (rowData: TrackAuditTrail) => (
        <Button
            icon="pi pi-eye"
            rounded
            text
            severity="info"
            onClick={() => viewDetails(rowData)}
            tooltip="Voir détails"
            tooltipOptions={{ position: 'top' }}
        />
    );

    // Statistics cards
    const renderStatsCards = () => {
        if (!stats) return null;

        return (
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="bg-green-50 border-left-3 border-green-500">
                        <div className="flex align-items-center gap-3">
                            <Avatar icon="pi pi-check-circle" size="large" className="bg-green-500 text-white" />
                            <div>
                                <div className="text-500 text-sm mb-1">Succès</div>
                                <div className="text-2xl font-bold text-green-700">{stats.totalSuccess || 0}</div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-red-50 border-left-3 border-red-500">
                        <div className="flex align-items-center gap-3">
                            <Avatar icon="pi pi-times-circle" size="large" className="bg-red-500 text-white" />
                            <div>
                                <div className="text-500 text-sm mb-1">Échecs</div>
                                <div className="text-2xl font-bold text-red-700">{stats.totalFailed || 0}</div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-orange-50 border-left-3 border-orange-500">
                        <div className="flex align-items-center gap-3">
                            <Avatar icon="pi pi-clock" size="large" className="bg-orange-500 text-white" />
                            <div>
                                <div className="text-500 text-sm mb-1">En attente</div>
                                <div className="text-2xl font-bold text-orange-700">{stats.totalPending || 0}</div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-blue-50 border-left-3 border-blue-500">
                        <div className="flex align-items-center gap-3">
                            <Avatar icon="pi pi-list" size="large" className="bg-blue-500 text-white" />
                            <div>
                                <div className="text-500 text-sm mb-1">Total</div>
                                <div className="text-2xl font-bold text-blue-700">{totalRecords}</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    // Detail dialog
    const renderDetailDialog = () => {
        if (!selectedAudit) return null;

        const parseJson = (jsonString: string | null) => {
            if (!jsonString) return null;
            try {
                return JSON.parse(jsonString);
            } catch {
                return jsonString;
            }
        };

        const oldValues = parseJson(selectedAudit.oldValues);
        const newValues = parseJson(selectedAudit.newValues);

        return (
            <Dialog
                header="Détails de l'Action"
                visible={detailDialogVisible}
                style={{ width: '800px' }}
                onHide={() => setDetailDialogVisible(false)}
                maximizable
            >
                <TabView>
                    <TabPanel header="Informations Générales" leftIcon="pi pi-info-circle mr-2">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Date et Heure</label>
                                    <p className="m-0">{selectedAudit.actionDate} à {selectedAudit.actionTime}</p>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Statut</label>
                                    <p className="m-0">
                                        <Tag value={getStatusLabel(selectedAudit.status)} severity={getStatusSeverity(selectedAudit.status)} />
                                    </p>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Type d'Action</label>
                                    <p className="m-0">{getActionTypeName(selectedAudit.actionTypeId)}</p>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Module</label>
                                    <p className="m-0">{getModuleName(selectedAudit.moduleId)}</p>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="field">
                                    <label className="font-bold text-500">Description</label>
                                    <p className="m-0">{selectedAudit.actionDescription || '-'}</p>
                                </div>
                            </div>
                            {selectedAudit.reason && (
                                <div className="col-12">
                                    <div className="field">
                                        <label className="font-bold text-500">Raison</label>
                                        <p className="m-0">{selectedAudit.reason}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabPanel>

                    <TabPanel header="Utilisateur" leftIcon="pi pi-user mr-2">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Nom Complet</label>
                                    <p className="m-0">{selectedAudit.userFullName || '-'}</p>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Nom d'utilisateur</label>
                                    <p className="m-0">{selectedAudit.username || '-'}</p>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Rôle</label>
                                    <p className="m-0">{selectedAudit.userRole || '-'}</p>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Agence</label>
                                    <p className="m-0">{selectedAudit.branchName || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Entité Affectée" leftIcon="pi pi-database mr-2">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Table</label>
                                    <p className="m-0">{selectedAudit.entityTable}</p>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">ID de l'enregistrement</label>
                                    <p className="m-0">{selectedAudit.entityId || '-'}</p>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="field">
                                    <label className="font-bold text-500">Description de l'entité</label>
                                    <p className="m-0">{selectedAudit.entityDescription || '-'}</p>
                                </div>
                            </div>
                            {selectedAudit.changedFields && (
                                <div className="col-12">
                                    <div className="field">
                                        <label className="font-bold text-500">Champs Modifiés</label>
                                        <p className="m-0">{selectedAudit.changedFields}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabPanel>

                    <TabPanel header="Valeurs" leftIcon="pi pi-code mr-2">
                        <div className="grid">
                            {oldValues && (
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-bold text-500">Anciennes Valeurs</label>
                                        <pre className="surface-100 p-3 border-round text-sm overflow-auto" style={{ maxHeight: '300px' }}>
                                            {typeof oldValues === 'object' ? JSON.stringify(oldValues, null, 2) : oldValues}
                                        </pre>
                                    </div>
                                </div>
                            )}
                            {newValues && (
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-bold text-500">Nouvelles Valeurs</label>
                                        <pre className="surface-100 p-3 border-round text-sm overflow-auto" style={{ maxHeight: '300px' }}>
                                            {typeof newValues === 'object' ? JSON.stringify(newValues, null, 2) : newValues}
                                        </pre>
                                    </div>
                                </div>
                            )}
                            {!oldValues && !newValues && (
                                <div className="col-12">
                                    <p className="text-500 text-center">Aucune donnée de changement disponible</p>
                                </div>
                            )}
                        </div>
                    </TabPanel>

                    <TabPanel header="Informations Techniques" leftIcon="pi pi-cog mr-2">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Adresse IP</label>
                                    <p className="m-0">{selectedAudit.ipAddress || '-'}</p>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label className="font-bold text-500">Méthode HTTP</label>
                                    <p className="m-0">{selectedAudit.requestMethod || '-'}</p>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="field">
                                    <label className="font-bold text-500">URL de la requête</label>
                                    <p className="m-0 text-sm">{selectedAudit.requestUrl || '-'}</p>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="field">
                                    <label className="font-bold text-500">User Agent</label>
                                    <p className="m-0 text-sm" style={{ wordBreak: 'break-all' }}>{selectedAudit.userAgent || '-'}</p>
                                </div>
                            </div>
                            {selectedAudit.errorMessage && (
                                <div className="col-12">
                                    <div className="field">
                                        <label className="font-bold text-red-500">Message d'erreur</label>
                                        <p className="m-0 text-red-600">{selectedAudit.errorMessage}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabPanel>
                </TabView>
            </Dialog>
        );
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                {/* Header */}
                <div className="flex align-items-center justify-content-between mb-4">
                    <div className="flex align-items-center gap-3">
                        <Avatar icon="pi pi-history" size="xlarge" shape="circle" className="bg-indigo-500 text-white" />
                        <div>
                            <h4 className="m-0 mb-1">Journal d'Audit</h4>
                            <p className="text-500 m-0 text-sm">Traçabilité de toutes les actions dans l'application</p>
                        </div>
                    </div>
                    <Button
                        label="Exporter Excel"
                        icon="pi pi-file-excel"
                        severity="success"
                        outlined
                        onClick={exportToExcel}
                    />
                </div>

                {/* Statistics Cards */}
                {renderStatsCards()}

                {/* Filters */}
                <Card title="Filtres de Recherche" className="mb-4">
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label htmlFor="startDate" className="font-bold">Date Début</label>
                                <Calendar
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.value as Date)}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label htmlFor="endDate" className="font-bold">Date Fin</label>
                                <Calendar
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.value as Date)}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label htmlFor="username" className="font-bold">Utilisateur</label>
                                <InputText
                                    id="username"
                                    value={usernameFilter}
                                    onChange={(e) => setUsernameFilter(e.target.value)}
                                    placeholder="Rechercher par utilisateur"
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label htmlFor="entityTable" className="font-bold">Table/Entité</label>
                                <InputText
                                    id="entityTable"
                                    value={entityTableFilter}
                                    onChange={(e) => setEntityTableFilter(e.target.value)}
                                    placeholder="Rechercher par table"
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label htmlFor="actionType" className="font-bold">Type d'Action</label>
                                <Dropdown
                                    id="actionType"
                                    value={filters.actionTypeId}
                                    options={ActionTypeOptions}
                                    onChange={(e) => setFilters({ ...filters, actionTypeId: e.value })}
                                    placeholder="Tous les types"
                                    className="w-full"
                                    showClear
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label htmlFor="module" className="font-bold">Module</label>
                                <Dropdown
                                    id="module"
                                    value={filters.moduleId}
                                    options={ModuleOptions}
                                    onChange={(e) => setFilters({ ...filters, moduleId: e.value })}
                                    placeholder="Tous les modules"
                                    className="w-full"
                                    showClear
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label htmlFor="status" className="font-bold">Statut</label>
                                <Dropdown
                                    id="status"
                                    value={filters.status}
                                    options={StatusOptions}
                                    onChange={(e) => setFilters({ ...filters, status: e.value || null })}
                                    placeholder="Tous les statuts"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            severity="secondary"
                            outlined
                            onClick={handleReset}
                        />
                        <Button
                            label="Rechercher"
                            icon="pi pi-search"
                            onClick={handleSearch}
                        />
                    </div>
                </Card>

                {/* Data Table */}
                <Card title="Historique des Actions">
                    <DataTable
                        value={auditTrails}
                        paginator
                        rows={filters.size}
                        totalRecords={totalRecords}
                        lazy
                        first={filters.page * filters.size}
                        onPage={onPage}
                        onSort={onSort}
                        sortField={filters.sortBy}
                        sortOrder={filters.sortDirection === 'ASC' ? 1 : -1}
                        loading={loading}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        stripedRows
                        showGridlines
                        emptyMessage="Aucun enregistrement trouvé"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} enregistrements"
                    >
                        <Column header="Date/Heure" body={dateTimeTemplate} sortable sortField="actionTimestamp" style={{ width: '120px' }} />
                        <Column header="Utilisateur" body={userTemplate} sortable sortField="username" style={{ width: '200px' }} />
                        <Column header="Action" body={actionTemplate} sortable sortField="actionTypeId" style={{ width: '150px' }} />
                        <Column header="Module" body={moduleTemplate} sortable sortField="moduleId" style={{ width: '130px' }} />
                        <Column header="Entité" body={entityTemplate} sortable sortField="entityTable" style={{ width: '150px' }} />
                        <Column field="actionDescription" header="Description" style={{ minWidth: '200px' }} />
                        <Column header="Statut" body={statusTemplate} sortable sortField="status" style={{ width: '100px' }} />
                        <Column field="ipAddress" header="IP" style={{ width: '120px' }} />
                        <Column header="Actions" body={actionsTemplate} style={{ width: '80px' }} />
                    </DataTable>
                </Card>
            </div>

            {/* Detail Dialog */}
            {renderDetailDialog()}
        </>
    );
}

export default TrackingPage;
