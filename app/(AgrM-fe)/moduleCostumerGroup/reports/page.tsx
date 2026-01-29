'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { buildApiUrl } from '../../../../utils/apiConfig';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';

// Report Types
enum ReportType {
    CLIENT_LIST = 'CLIENT_LIST',
    CLIENT_BY_CATEGORY = 'CLIENT_BY_CATEGORY',
    CLIENT_BY_STATUS = 'CLIENT_BY_STATUS',
    CLIENT_BY_LOCATION = 'CLIENT_BY_LOCATION',
    GROUP_LIST = 'GROUP_LIST',
    GROUP_BY_STATUS = 'GROUP_BY_STATUS',
    GROUP_PERFORMANCE = 'GROUP_PERFORMANCE',
    MEMBER_MOVEMENTS = 'MEMBER_MOVEMENTS',
    KYC_COMPLIANCE = 'KYC_COMPLIANCE'
}

interface ReportFilter {
    reportType: ReportType;
    startDate?: Date;
    endDate?: Date;
    provinceId?: number;
    communeId?: number;
    status?: string;
    category?: string;
}

function ReportsPage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [filter, setFilter] = useState<ReportFilter>({
        reportType: ReportType.CLIENT_LIST,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date()
    });
    const [reportData, setReportData] = useState<any[]>([]);
    const [statistics, setStatistics] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState<any[]>([]);
    const [communes, setCommunes] = useState<any[]>([]);

    const { data, error, fetchData, callType } = useConsumApi('');
    const { data: refData, fetchData: fetchRefData, callType: refCallType } = useConsumApi('');
    const toast = useRef<Toast>(null);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Report type options
    const clientReportTypes = [
        { label: 'Liste Complète des Clients', value: ReportType.CLIENT_LIST },
        { label: 'Clients par Catégorie', value: ReportType.CLIENT_BY_CATEGORY },
        { label: 'Clients par Statut', value: ReportType.CLIENT_BY_STATUS },
        { label: 'Clients par Localisation', value: ReportType.CLIENT_BY_LOCATION },
        { label: 'Conformité KYC', value: ReportType.KYC_COMPLIANCE }
    ];

    const groupReportTypes = [
        { label: 'Liste des Groupes Solidaires', value: ReportType.GROUP_LIST },
        { label: 'Groupes par Statut', value: ReportType.GROUP_BY_STATUS },
        { label: 'Performance des Groupes', value: ReportType.GROUP_PERFORMANCE },
        { label: 'Mouvements de Membres', value: ReportType.MEMBER_MOVEMENTS }
    ];

    const clientStatusOptions = [
        { label: 'Tous', value: '' },
        { label: 'Prospect', value: 'PROSPECT' },
        { label: 'En Attente d\'Approbation', value: 'PENDING_APPROVAL' },
        { label: 'Actif', value: 'ACTIVE' },
        { label: 'Inactif', value: 'INACTIVE' },
        { label: 'Blacklisté', value: 'BLACKLISTED' }
    ];

    const groupStatusOptions = [
        { label: 'Tous', value: '' },
        { label: 'En Formation', value: 'FORMATION' },
        { label: 'En Attente', value: 'PENDING_APPROVAL' },
        { label: 'Actif', value: 'ACTIVE' },
        { label: 'Suspendu', value: 'SUSPENDED' },
        { label: 'Dissous', value: 'DISSOLVED' }
    ];

    useEffect(() => {
        loadReferenceData();
    }, []);

    // Handle reference data (provinces, communes)
    useEffect(() => {
        if (refData) {
            if (refCallType === 'loadProvinces') {
                setProvinces(Array.isArray(refData) ? refData : []);
            } else if (refCallType === 'loadCommunes') {
                setCommunes(Array.isArray(refData) ? refData : []);
            }
        }
    }, [refData, refCallType]);

    // Handle report generation
    useEffect(() => {
        if (data && callType === 'generateReport') {
            setReportData(data.data || []);
            setStatistics(data.statistics || null);
            setLoading(false);
            showToast('success', 'Succès', 'Rapport généré avec succès');
        }
        if (error && callType === 'generateReport') {
            setLoading(false);
            showToast('error', 'Erreur', 'Erreur lors de la génération du rapport');
        }
    }, [data, error, callType]);

    const loadReferenceData = () => {
        fetchRefData(null, 'GET', buildApiUrl('/api/reference-data/provinces/findall'), 'loadProvinces');
        // Load communes after a short delay to avoid race condition
        setTimeout(() => {
            fetchRefData(null, 'GET', buildApiUrl('/api/reference-data/communes/findall'), 'loadCommunes');
        }, 300);
    };

    const generateReport = () => {
        setLoading(true);
        const endpoint = activeIndex === 0 ? '/api/reports/clients' : '/api/reports/groups';
        fetchData(filter, 'POST', buildApiUrl(endpoint), 'generateReport');
    };

    const exportToPDF = () => {
        if (reportData.length === 0) {
            showToast('warn', 'Attention', 'Aucune donnée à exporter');
            return;
        }

        // Create printable content
        const isClientReport = activeIndex === 0;
        const reportTitle = isClientReport ? 'Rapport des Clients' : 'Rapport des Groupes';
        const dateRange = `Du ${filter.startDate?.toLocaleDateString('fr-FR')} au ${filter.endDate?.toLocaleDateString('fr-FR')}`;

        let tableHeaders = '';
        let tableRows = '';

        if (isClientReport) {
            tableHeaders = `
                <th>N° Client</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Province</th>
                <th>Commune</th>
                <th>Statut</th>
            `;
            tableRows = reportData.map(row => `
                <tr>
                    <td>${row.clientNumber || '-'}</td>
                    <td>${row.firstName || '-'}</td>
                    <td>${row.lastName || '-'}</td>
                    <td>${row.phonePrimary || '-'}</td>
                    <td>${row.provinceName || '-'}</td>
                    <td>${row.communeName || '-'}</td>
                    <td>${row.status || '-'}</td>
                </tr>
            `).join('');
        } else {
            tableHeaders = `
                <th>Code Groupe</th>
                <th>Nom du Groupe</th>
                <th>Membres</th>
                <th>Province</th>
                <th>Date Formation</th>
                <th>Statut</th>
            `;
            tableRows = reportData.map(row => `
                <tr>
                    <td>${row.groupCode || '-'}</td>
                    <td>${row.groupName || '-'}</td>
                    <td>${row.currentMemberCount || 0}</td>
                    <td>${row.provinceName || '-'}</td>
                    <td>${row.formationDate || '-'}</td>
                    <td>${row.status || '-'}</td>
                </tr>
            `).join('');
        }

        const statsSection = statistics ? `
            <div class="stats">
                <div class="stat-box"><strong>Total:</strong> ${statistics.total || 0}</div>
                <div class="stat-box"><strong>Actifs:</strong> ${statistics.active || 0}</div>
                <div class="stat-box"><strong>En Attente:</strong> ${statistics.pending || 0}</div>
                <div class="stat-box"><strong>Inactifs:</strong> ${statistics.inactive || 0}</div>
            </div>
        ` : '';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    .date-range { text-align: center; color: #666; margin-bottom: 20px; }
                    .stats { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                    .stat-box { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #4a90a4; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>${reportTitle}</h1>
                <p class="date-range">${dateRange}</p>
                ${statsSection}
                <table>
                    <thead><tr>${tableHeaders}</tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <p class="footer">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }

        showToast('success', 'Export PDF', 'Le document est prêt pour impression/enregistrement en PDF');
    };

    const exportToExcel = () => {
        if (reportData.length === 0) {
            showToast('warn', 'Attention', 'Aucune donnée à exporter');
            return;
        }

        const isClientReport = activeIndex === 0;
        let csvContent = '';
        let headers: string[] = [];
        let rows: string[][] = [];

        if (isClientReport) {
            headers = ['N° Client', 'Prénom', 'Nom', 'Téléphone', 'Province', 'Commune', 'Statut'];
            rows = reportData.map(row => [
                row.clientNumber || '',
                row.firstName || '',
                row.lastName || '',
                row.phonePrimary || '',
                row.provinceName || '',
                row.communeName || '',
                row.status || ''
            ]);
        } else {
            headers = ['Code Groupe', 'Nom du Groupe', 'Membres', 'Province', 'Date Formation', 'Statut'];
            rows = reportData.map(row => [
                row.groupCode || '',
                row.groupName || '',
                String(row.currentMemberCount || 0),
                row.provinceName || '',
                row.formationDate || '',
                row.status || ''
            ]);
        }

        // Create CSV content with BOM for Excel UTF-8 support
        csvContent = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
        });

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport_${isClientReport ? 'clients' : 'groupes'}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('success', 'Export Excel', 'Le fichier CSV a été téléchargé avec succès');
    };

    const renderStatisticsCards = () => {
        if (!statistics) return null;

        return (
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="bg-blue-50">
                        <div className="flex align-items-center gap-3">
                            <Avatar icon="pi pi-users" size="large" className="bg-blue-500 text-white" />
                            <div>
                                <div className="text-500 text-sm mb-1">Total</div>
                                <div className="text-2xl font-bold text-900">{statistics.total || 0}</div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-green-50">
                        <div className="flex align-items-center gap-3">
                            <Avatar icon="pi pi-check-circle" size="large" className="bg-green-500 text-white" />
                            <div>
                                <div className="text-500 text-sm mb-1">Actifs</div>
                                <div className="text-2xl font-bold text-900">{statistics.active || 0}</div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-orange-50">
                        <div className="flex align-items-center gap-3">
                            <Avatar icon="pi pi-clock" size="large" className="bg-orange-500 text-white" />
                            <div>
                                <div className="text-500 text-sm mb-1">En Attente</div>
                                <div className="text-2xl font-bold text-900">{statistics.pending || 0}</div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-red-50">
                        <div className="flex align-items-center gap-3">
                            <Avatar icon="pi pi-times-circle" size="large" className="bg-red-500 text-white" />
                            <div>
                                <div className="text-500 text-sm mb-1">Inactifs</div>
                                <div className="text-2xl font-bold text-900">{statistics.inactive || 0}</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    const renderClientFilters = () => (
        <div className="grid">
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="reportType" className="font-bold">Type de Rapport</label>
                    <Dropdown
                        id="reportType"
                        value={filter.reportType}
                        options={clientReportTypes}
                        onChange={(e) => setFilter({ ...filter, reportType: e.value })}
                        placeholder="Sélectionner un type de rapport"
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-3">
                <div className="field">
                    <label htmlFor="startDate" className="font-bold">Date Début</label>
                    <Calendar
                        id="startDate"
                        value={filter.startDate}
                        onChange={(e) => setFilter({ ...filter, startDate: e.value as Date })}
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
                        value={filter.endDate}
                        onChange={(e) => setFilter({ ...filter, endDate: e.value as Date })}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-4">
                <div className="field">
                    <label htmlFor="province" className="font-bold">Province</label>
                    <Dropdown
                        id="province"
                        value={filter.provinceId}
                        options={provinces}
                        onChange={(e) => setFilter({ ...filter, provinceId: e.value })}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Toutes les provinces"
                        showClear
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-4">
                <div className="field">
                    <label htmlFor="commune" className="font-bold">Commune</label>
                    <Dropdown
                        id="commune"
                        value={filter.communeId}
                        options={communes.filter(c => !filter.provinceId || c.province?.id === filter.provinceId)}
                        onChange={(e) => setFilter({ ...filter, communeId: e.value })}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Toutes les communes"
                        showClear
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-4">
                <div className="field">
                    <label htmlFor="status" className="font-bold">Statut</label>
                    <Dropdown
                        id="status"
                        value={filter.status}
                        options={clientStatusOptions}
                        onChange={(e) => setFilter({ ...filter, status: e.value })}
                        placeholder="Tous les statuts"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );

    const renderGroupFilters = () => (
        <div className="grid">
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="reportType" className="font-bold">Type de Rapport</label>
                    <Dropdown
                        id="reportType"
                        value={filter.reportType}
                        options={groupReportTypes}
                        onChange={(e) => setFilter({ ...filter, reportType: e.value })}
                        placeholder="Sélectionner un type de rapport"
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-3">
                <div className="field">
                    <label htmlFor="startDate" className="font-bold">Date Début</label>
                    <Calendar
                        id="startDate"
                        value={filter.startDate}
                        onChange={(e) => setFilter({ ...filter, startDate: e.value as Date })}
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
                        value={filter.endDate}
                        onChange={(e) => setFilter({ ...filter, endDate: e.value as Date })}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="province" className="font-bold">Province</label>
                    <Dropdown
                        id="province"
                        value={filter.provinceId}
                        options={provinces}
                        onChange={(e) => setFilter({ ...filter, provinceId: e.value })}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Toutes les provinces"
                        showClear
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="status" className="font-bold">Statut du Groupe</label>
                    <Dropdown
                        id="status"
                        value={filter.status}
                        options={groupStatusOptions}
                        onChange={(e) => setFilter({ ...filter, status: e.value })}
                        placeholder="Tous les statuts"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );

    const statusBodyTemplate = (rowData: any) => {
        const statusMap: Record<string, { label: string; severity: any }> = {
            PROSPECT: { label: 'Prospect', severity: 'info' },
            PENDING_APPROVAL: { label: 'En Attente', severity: 'warning' },
            ACTIVE: { label: 'Actif', severity: 'success' },
            INACTIVE: { label: 'Inactif', severity: 'secondary' },
            BLACKLISTED: { label: 'Blacklisté', severity: 'danger' },
            FORMATION: { label: 'En Formation', severity: 'info' },
            SUSPENDED: { label: 'Suspendu', severity: 'warning' },
            DISSOLVED: { label: 'Dissous', severity: 'danger' }
        };
        const status = statusMap[rowData.status] || { label: rowData.status, severity: null };
        return <Tag value={status.label} severity={status.severity} />;
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <div className="flex align-items-center justify-content-between mb-4">
                    <div className="flex align-items-center gap-3">
                        <Avatar icon="pi pi-chart-bar" size="xlarge" shape="circle" className="bg-indigo-500 text-white" />
                        <div>
                            <h4 className="m-0 mb-1">Rapports et Statistiques</h4>
                            <p className="text-500 m-0 text-sm">Générez des rapports détaillés sur les clients et groupes solidaires</p>
                        </div>
                    </div>
                </div>

                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                    <TabPanel header="Rapports Clients" leftIcon="pi pi-user mr-2">
                        <Card title="Critères de Filtrage" className="mb-4">
                            {renderClientFilters()}
                            <div className="flex justify-content-end gap-2 mt-3">
                                <Button
                                    label="Réinitialiser"
                                    icon="pi pi-refresh"
                                    severity="secondary"
                                    outlined
                                    onClick={() => setFilter({
                                        reportType: ReportType.CLIENT_LIST,
                                        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                        endDate: new Date()
                                    })}
                                />
                                <Button
                                    label="Générer le Rapport"
                                    icon="pi pi-chart-line"
                                    loading={loading}
                                    onClick={generateReport}
                                />
                            </div>
                        </Card>

                        {renderStatisticsCards()}

                        {reportData.length > 0 && (
                            <Card title="Résultats du Rapport">
                                <div className="flex justify-content-end gap-2 mb-3">
                                    <Button
                                        label="Exporter PDF"
                                        icon="pi pi-file-pdf"
                                        severity="danger"
                                        outlined
                                        onClick={exportToPDF}
                                    />
                                    <Button
                                        label="Exporter Excel"
                                        icon="pi pi-file-excel"
                                        severity="success"
                                        outlined
                                        onClick={exportToExcel}
                                    />
                                </div>
                                <DataTable
                                    value={reportData}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    stripedRows
                                    showGridlines
                                >
                                    <Column field="clientNumber" header="N° Client" sortable />
                                    <Column field="firstName" header="Prénom" sortable />
                                    <Column field="lastName" header="Nom" sortable />
                                    <Column field="phonePrimary" header="Téléphone" />
                                    <Column field="provinceName" header="Province" sortable body={(rowData) => rowData.provinceName || rowData.province?.name || '-'} />
                                    <Column field="communeName" header="Commune" sortable body={(rowData) => rowData.communeName || rowData.commune?.name || '-'} />
                                    <Column header="Statut" body={statusBodyTemplate} sortable />
                                </DataTable>
                            </Card>
                        )}
                    </TabPanel>

                    <TabPanel header="Rapports Groupes" leftIcon="pi pi-users mr-2">
                        <Card title="Critères de Filtrage" className="mb-4">
                            {renderGroupFilters()}
                            <div className="flex justify-content-end gap-2 mt-3">
                                <Button
                                    label="Réinitialiser"
                                    icon="pi pi-refresh"
                                    severity="secondary"
                                    outlined
                                    onClick={() => setFilter({
                                        reportType: ReportType.GROUP_LIST,
                                        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                        endDate: new Date()
                                    })}
                                />
                                <Button
                                    label="Générer le Rapport"
                                    icon="pi pi-chart-line"
                                    loading={loading}
                                    onClick={generateReport}
                                />
                            </div>
                        </Card>

                        {renderStatisticsCards()}

                        {reportData.length > 0 && (
                            <Card title="Résultats du Rapport">
                                <div className="flex justify-content-end gap-2 mb-3">
                                    <Button
                                        label="Exporter PDF"
                                        icon="pi pi-file-pdf"
                                        severity="danger"
                                        outlined
                                        onClick={exportToPDF}
                                    />
                                    <Button
                                        label="Exporter Excel"
                                        icon="pi pi-file-excel"
                                        severity="success"
                                        outlined
                                        onClick={exportToExcel}
                                    />
                                </div>
                                <DataTable
                                    value={reportData}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    stripedRows
                                    showGridlines
                                >
                                    <Column field="groupCode" header="Code Groupe" sortable />
                                    <Column field="groupName" header="Nom du Groupe" sortable />
                                    <Column field="currentMemberCount" header="Membres" sortable />
                                    <Column field="provinceName" header="Province" sortable />
                                    <Column field="formationDate" header="Date Formation" sortable />
                                    <Column header="Statut" body={statusBodyTemplate} sortable />
                                </DataTable>
                            </Card>
                        )}
                    </TabPanel>
                </TabView>
            </div>
        </>
    );
}

export default ReportsPage;
