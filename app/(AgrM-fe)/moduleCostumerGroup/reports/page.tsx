'use client';

import { useEffect, useRef, useState } from 'react';
import { ProtectedPage } from '@/components/ProtectedPage';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
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
    zoneId?: number;
    collineId?: number;
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
    const [zones, setZones] = useState<any[]>([]);
    const [collines, setCollines] = useState<any[]>([]);

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

    // Handle reference data (provinces, communes, zones, collines)
    useEffect(() => {
        if (refData) {
            if (refCallType === 'loadProvinces') {
                setProvinces(Array.isArray(refData) ? refData : []);
            } else if (refCallType === 'loadCommunes') {
                setCommunes(Array.isArray(refData) ? refData : []);
            } else if (refCallType === 'loadZones') {
                setZones(Array.isArray(refData) ? refData : []);
            } else if (refCallType === 'loadCollines') {
                setCollines(Array.isArray(refData) ? refData : []);
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
        setTimeout(() => {
            fetchRefData(null, 'GET', buildApiUrl('/api/reference-data/communes/findall'), 'loadCommunes');
        }, 300);
        setTimeout(() => {
            fetchRefData(null, 'GET', buildApiUrl('/api/reference-data/zones/findall'), 'loadZones');
        }, 600);
        setTimeout(() => {
            fetchRefData(null, 'GET', buildApiUrl('/api/reference-data/collines/findall'), 'loadCollines');
        }, 900);
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

        const isClientReport = activeIndex === 0;
        const reportTitle = isClientReport ? 'Rapport des Clients' : 'Rapport des Groupes';
        const dateRange = filter.startDate && filter.endDate
            ? `Du ${filter.startDate.toLocaleDateString('fr-FR')} au ${filter.endDate.toLocaleDateString('fr-FR')}`
            : 'Toutes les dates';

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
                <th>Zone</th>
                <th>Quartier/Colline</th>
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
                    <td>${row.zoneName || '-'}</td>
                    <td>${row.collineName || '-'}</td>
                    <td>${row.status || '-'}</td>
                </tr>
            `).join('');
        } else {
            tableHeaders = `
                <th>Code Groupe</th>
                <th>Nom du Groupe</th>
                <th>Membres</th>
                <th>Province</th>
                <th>Commune</th>
                <th>Zone</th>
                <th>Date Formation</th>
                <th>Statut</th>
            `;
            tableRows = reportData.map(row => `
                <tr>
                    <td>${row.groupCode || '-'}</td>
                    <td>${row.groupName || '-'}</td>
                    <td>${row.currentMemberCount || 0}</td>
                    <td>${row.provinceName || '-'}</td>
                    <td>${row.communeName || '-'}</td>
                    <td>${row.zoneName || '-'}</td>
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
                    .header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #4a90a4; padding-bottom:10px; margin-bottom:20px; }
                    .logo-section { display:flex; align-items:center; gap:10px; }
                    .company-name { font-size:16px; font-weight:bold; color:#1e3a5f; margin:0; }
                    .company-info { font-size:10px; color:#64748b; margin:2px 0 0 0; }
                    .doc-title { font-size:14px; font-weight:bold; color:#1e3a5f; }
                    .stats { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                    .stat-box { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
                    th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
                    th { background-color: #4a90a4; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-section">
                        <img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style="height:60px;width:60px;object-fit:contain" />
                        <div>
                            <h1 class="company-name">AgrM MICROFINANCE</h1>
                            <p class="company-info">Bujumbura, Burundi</p>
                        </div>
                    </div>
                    <div style="text-align:right">
                        <div class="doc-title">${reportTitle}</div>
                        <p style="font-size:9px;color:#64748b;margin-top:4px">${dateRange}</p>
                    </div>
                </div>
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
            headers = ['N° Client', 'Prénom', 'Nom', 'Téléphone', 'Province', 'Commune', 'Zone', 'Quartier/Colline', 'Statut'];
            rows = reportData.map(row => [
                row.clientNumber || '',
                row.firstName || '',
                row.lastName || '',
                row.phonePrimary || '',
                row.provinceName || '',
                row.communeName || '',
                row.zoneName || '',
                row.collineName || '',
                row.status || ''
            ]);
        } else {
            headers = ['Code Groupe', 'Nom du Groupe', 'Membres', 'Province', 'Commune', 'Zone', 'Date Formation', 'Statut'];
            rows = reportData.map(row => [
                row.groupCode || '',
                row.groupName || '',
                String(row.currentMemberCount || 0),
                row.provinceName || '',
                row.communeName || '',
                row.zoneName || '',
                row.formationDate || '',
                row.status || ''
            ]);
        }

        // Create CSV content with BOM for Excel UTF-8 support
        csvContent = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
        });

        // Add totals row
        if (statistics) {
            csvContent += '\n';
            csvContent += `"Total";"${statistics.total || 0}";;"Actifs";"${statistics.active || 0}";;"En Attente";"${statistics.pending || 0}";;;\n`;
        }

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

    const renderLocationFilters = () => (
        <>
            <div className="field col-12 md:col-3">
                <label htmlFor="province">Province</label>
                <Dropdown
                    id="province"
                    value={filter.provinceId}
                    options={provinces}
                    onChange={(e) => setFilter({ ...filter, provinceId: e.value, communeId: undefined, zoneId: undefined, collineId: undefined })}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Toutes les provinces"
                    showClear
                    filter
                    className="w-full"
                />
            </div>
            <div className="field col-12 md:col-3">
                <label htmlFor="commune">Commune</label>
                <Dropdown
                    id="commune"
                    value={filter.communeId}
                    options={communes.filter(c => !filter.provinceId || c.province?.id === filter.provinceId)}
                    onChange={(e) => setFilter({ ...filter, communeId: e.value, zoneId: undefined, collineId: undefined })}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Toutes les communes"
                    showClear
                    filter
                    className="w-full"
                />
            </div>
            <div className="field col-12 md:col-3">
                <label htmlFor="zone">Zone</label>
                <Dropdown
                    id="zone"
                    value={filter.zoneId}
                    options={zones.filter(z => !filter.communeId || z.commune?.id === filter.communeId)}
                    onChange={(e) => setFilter({ ...filter, zoneId: e.value, collineId: undefined })}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Toutes les zones"
                    showClear
                    filter
                    className="w-full"
                />
            </div>
            <div className="field col-12 md:col-3">
                <label htmlFor="colline">Quartier / Colline</label>
                <Dropdown
                    id="colline"
                    value={filter.collineId}
                    options={collines.filter(cl => !filter.zoneId || cl.zone?.id === filter.zoneId)}
                    onChange={(e) => setFilter({ ...filter, collineId: e.value })}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Tous les quartiers"
                    showClear
                    filter
                    className="w-full"
                />
            </div>
        </>
    );

    const renderClientFilters = () => (
        <div className="formgrid grid">
            <div className="field col-12 md:col-6">
                <label htmlFor="reportType">Type de Rapport</label>
                <Dropdown
                    id="reportType"
                    value={filter.reportType}
                    options={clientReportTypes}
                    onChange={(e) => setFilter({ ...filter, reportType: e.value })}
                    placeholder="Sélectionner un type de rapport"
                    className="w-full"
                />
            </div>
            <div className="field col-12 md:col-3">
                <label htmlFor="startDate">Date Début</label>
                <Calendar
                    id="startDate"
                    value={filter.startDate}
                    onChange={(e) => setFilter({ ...filter, startDate: e.value as Date })}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="w-full"
                />
            </div>
            <div className="field col-12 md:col-3">
                <label htmlFor="endDate">Date Fin</label>
                <Calendar
                    id="endDate"
                    value={filter.endDate}
                    onChange={(e) => setFilter({ ...filter, endDate: e.value as Date })}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="w-full"
                />
            </div>
            {renderLocationFilters()}
            <div className="field col-12 md:col-3">
                <label htmlFor="status">Statut</label>
                <Dropdown
                    id="status"
                    value={filter.status}
                    options={clientStatusOptions}
                    onChange={(e) => setFilter({ ...filter, status: e.value })}
                    placeholder="Tous les statuts"
                    showClear
                    className="w-full"
                />
            </div>
        </div>
    );

    const renderGroupFilters = () => (
        <div className="formgrid grid">
            <div className="field col-12 md:col-6">
                <label htmlFor="reportType">Type de Rapport</label>
                <Dropdown
                    id="reportType"
                    value={filter.reportType}
                    options={groupReportTypes}
                    onChange={(e) => setFilter({ ...filter, reportType: e.value })}
                    placeholder="Sélectionner un type de rapport"
                    className="w-full"
                />
            </div>
            <div className="field col-12 md:col-3">
                <label htmlFor="startDate">Date Début</label>
                <Calendar
                    id="startDate"
                    value={filter.startDate}
                    onChange={(e) => setFilter({ ...filter, startDate: e.value as Date })}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="w-full"
                />
            </div>
            <div className="field col-12 md:col-3">
                <label htmlFor="endDate">Date Fin</label>
                <Calendar
                    id="endDate"
                    value={filter.endDate}
                    onChange={(e) => setFilter({ ...filter, endDate: e.value as Date })}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="w-full"
                />
            </div>
            {renderLocationFilters()}
            <div className="field col-12 md:col-3">
                <label htmlFor="status">Statut du Groupe</label>
                <Dropdown
                    id="status"
                    value={filter.status}
                    options={groupStatusOptions}
                    onChange={(e) => setFilter({ ...filter, status: e.value })}
                    placeholder="Tous les statuts"
                    showClear
                    className="w-full"
                />
            </div>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-chart-bar text-4xl text-primary"></i>
                    <div>
                        <h2 className="m-0">Rapports et Statistiques</h2>
                        <p className="m-0 text-500">Rapports détaillés sur les clients et groupes solidaires</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportToPDF} disabled={reportData.length === 0} />
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={exportToExcel} disabled={reportData.length === 0} />
                </div>
            </div>

            <Divider />

            <TabView activeIndex={activeIndex} onTabChange={(e) => { setActiveIndex(e.index); setReportData([]); setStatistics(null); }}>
                <TabPanel header="Rapports Clients" leftIcon="pi pi-user mr-2">
                    <Card className="mb-4">
                        <h5 className="m-0 mb-3">
                            <i className="pi pi-filter mr-2"></i>
                            Critères de Recherche
                        </h5>
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
                                icon="pi pi-search"
                                loading={loading}
                                onClick={generateReport}
                            />
                        </div>
                    </Card>

                    {/* Statistiques */}
                    {statistics && (
                        <div className="grid mb-4">
                            <div className="col-12 md:col-3">
                                <Card className="bg-blue-50">
                                    <div className="flex align-items-center gap-3">
                                        <i className="pi pi-users text-4xl text-blue-500"></i>
                                        <div>
                                            <p className="text-500 m-0">Total</p>
                                            <p className="text-2xl font-bold m-0">{statistics.total || 0}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="bg-green-50">
                                    <div className="flex align-items-center gap-3">
                                        <i className="pi pi-check-circle text-4xl text-green-500"></i>
                                        <div>
                                            <p className="text-500 m-0">Actifs</p>
                                            <p className="text-2xl font-bold m-0">{statistics.active || 0}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="bg-orange-50">
                                    <div className="flex align-items-center gap-3">
                                        <i className="pi pi-clock text-4xl text-orange-500"></i>
                                        <div>
                                            <p className="text-500 m-0">En Attente</p>
                                            <p className="text-2xl font-bold m-0">{statistics.pending || 0}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="bg-red-50">
                                    <div className="flex align-items-center gap-3">
                                        <i className="pi pi-times-circle text-4xl text-red-500"></i>
                                        <div>
                                            <p className="text-500 m-0">Inactifs</p>
                                            <p className="text-2xl font-bold m-0">{statistics.inactive || 0}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Tableau des résultats */}
                    {loading ? (
                        <div className="flex justify-content-center p-5">
                            <ProgressSpinner />
                        </div>
                    ) : (
                        <DataTable
                            value={reportData}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            emptyMessage="Aucune donnée. Veuillez générer un rapport."
                            className="p-datatable-sm"
                            stripedRows
                        >
                            <Column field="clientNumber" header="N° Client" sortable />
                            <Column field="firstName" header="Prénom" sortable />
                            <Column field="lastName" header="Nom" sortable />
                            <Column field="phonePrimary" header="Téléphone" />
                            <Column field="provinceName" header="Province" sortable body={(rowData) => rowData.provinceName || '-'} />
                            <Column field="communeName" header="Commune" sortable body={(rowData) => rowData.communeName || '-'} />
                            <Column field="zoneName" header="Zone" sortable body={(rowData) => rowData.zoneName || '-'} />
                            <Column field="collineName" header="Quartier/Colline" sortable body={(rowData) => rowData.collineName || '-'} />
                            <Column header="Statut" body={statusBodyTemplate} sortable />
                        </DataTable>
                    )}
                </TabPanel>

                <TabPanel header="Rapports Groupes" leftIcon="pi pi-users mr-2">
                    <Card className="mb-4">
                        <h5 className="m-0 mb-3">
                            <i className="pi pi-filter mr-2"></i>
                            Critères de Recherche
                        </h5>
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
                                icon="pi pi-search"
                                loading={loading}
                                onClick={generateReport}
                            />
                        </div>
                    </Card>

                    {/* Statistiques */}
                    {statistics && (
                        <div className="grid mb-4">
                            <div className="col-12 md:col-3">
                                <Card className="bg-blue-50">
                                    <div className="flex align-items-center gap-3">
                                        <i className="pi pi-users text-4xl text-blue-500"></i>
                                        <div>
                                            <p className="text-500 m-0">Total</p>
                                            <p className="text-2xl font-bold m-0">{statistics.total || 0}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="bg-green-50">
                                    <div className="flex align-items-center gap-3">
                                        <i className="pi pi-check-circle text-4xl text-green-500"></i>
                                        <div>
                                            <p className="text-500 m-0">Actifs</p>
                                            <p className="text-2xl font-bold m-0">{statistics.active || 0}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="bg-orange-50">
                                    <div className="flex align-items-center gap-3">
                                        <i className="pi pi-clock text-4xl text-orange-500"></i>
                                        <div>
                                            <p className="text-500 m-0">En Attente</p>
                                            <p className="text-2xl font-bold m-0">{statistics.pending || 0}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="bg-red-50">
                                    <div className="flex align-items-center gap-3">
                                        <i className="pi pi-times-circle text-4xl text-red-500"></i>
                                        <div>
                                            <p className="text-500 m-0">Inactifs</p>
                                            <p className="text-2xl font-bold m-0">{statistics.inactive || 0}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Tableau des résultats */}
                    {loading ? (
                        <div className="flex justify-content-center p-5">
                            <ProgressSpinner />
                        </div>
                    ) : (
                        <DataTable
                            value={reportData}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            emptyMessage="Aucune donnée. Veuillez générer un rapport."
                            className="p-datatable-sm"
                            stripedRows
                        >
                            <Column field="groupCode" header="Code Groupe" sortable />
                            <Column field="groupName" header="Nom du Groupe" sortable />
                            <Column field="currentMemberCount" header="Membres" sortable />
                            <Column field="provinceName" header="Province" sortable body={(rowData) => rowData.provinceName || '-'} />
                            <Column field="communeName" header="Commune" sortable body={(rowData) => rowData.communeName || '-'} />
                            <Column field="zoneName" header="Zone" sortable body={(rowData) => rowData.zoneName || '-'} />
                            <Column field="formationDate" header="Date Formation" sortable />
                            <Column header="Statut" body={statusBodyTemplate} sortable />
                        </DataTable>
                    )}
                </TabPanel>
            </TabView>
        </div>
    );
}

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['CUSTOMER_GROUP_REPORT']}>
            <ReportsPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
