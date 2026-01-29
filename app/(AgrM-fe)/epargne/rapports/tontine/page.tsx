'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../../utils/apiConfig';

const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const REPORTS_URL = `${API_BASE_URL}/api/epargne/reports`;

interface TontineGroupReport {
    id: number;
    groupCode: string;
    groupName: string;
    branchName: string;
    contributionAmount: number;
    frequency: string;
    maxMembers: number;
    currentMembers: number;
    currentCycle: number;
    totalCycles: number;
    totalCollected: number;
    totalPenalties: number;
    status: string;
}

interface TontineContributionReport {
    id: number;
    groupName: string;
    cycleNumber: number;
    memberName: string;
    dueDate: string;
    paidDate?: string;
    expectedAmount: number;
    paidAmount: number;
    penaltyAmount: number;
    status: string;
}

const RapportTontinePage = () => {
    const toast = useRef<Toast>(null);

    // Separate hook instances for each data type to avoid race conditions
    const branchesApi = useConsumApi('');
    const groupsApi = useConsumApi('');
    const contributionsApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [groupsData, setGroupsData] = useState<TontineGroupReport[]>([]);
    const [contributionsData, setContributionsData] = useState<TontineContributionReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({
        totalGroups: 0,
        totalMembers: 0,
        totalCollected: 0,
        totalPenalties: 0,
        collectionRate: 0
    });

    const statusOptions = [
        { label: 'En Formation', value: 'FORMING' },
        { label: 'Actif', value: 'ACTIVE' },
        { label: 'Cycle Complet', value: 'CYCLE_COMPLETE' },
        { label: 'Suspendu', value: 'SUSPENDED' },
        { label: 'Dissous', value: 'DISSOLVED' }
    ];

    useEffect(() => {
        loadReferenceData();
    }, []);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            const data = branchesApi.data;
            setBranches(Array.isArray(data) ? data : []);
        }
        if (branchesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: branchesApi.error.message || 'Erreur lors du chargement des agences' });
        }
    }, [branchesApi.data, branchesApi.error]);

    // Handle groups data
    useEffect(() => {
        if (groupsApi.data) {
            const response = groupsApi.data;
            setGroupsData(response.data || []);
            setTotals({
                totalGroups: response.totalGroups || 0,
                totalMembers: response.totalMembers || 0,
                totalCollected: response.totalCollected || 0,
                totalPenalties: response.totalPenalties || 0,
                collectionRate: response.collectionRate || 0
            });
        }
        if (groupsApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des groupes' });
        }
    }, [groupsApi.data, groupsApi.error]);

    // Handle contributions data
    useEffect(() => {
        if (contributionsApi.data) {
            const response = contributionsApi.data;
            setContributionsData(response.data || []);
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rapport généré avec succès' });
            setLoading(false);
        }
        if (contributionsApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des cotisations' });
            setLoading(false);
        }
    }, [contributionsApi.data, contributionsApi.error]);

    const loadReferenceData = () => {
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
    };

    const generateReport = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
        if (dateTo) params.append('dateTo', dateTo.toISOString().split('T')[0]);
        if (branchId) params.append('branchId', branchId.toString());
        if (status) params.append('status', status);

        // Fetch both reports
        groupsApi.fetchData(null, 'GET', `${REPORTS_URL}/tontine-groups?${params.toString()}`, 'loadGroups');
        contributionsApi.fetchData(null, 'GET', `${REPORTS_URL}/tontine-contributions?${params.toString()}`, 'loadContributions');
    };

    const exportToPdf = () => {
        if (groupsData.length === 0 && contributionsData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        const reportTitle = 'Rapport Tontine';
        const dateRange = dateFrom && dateTo
            ? `Période du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}`
            : 'Toutes les périodes';

        const statusLabels: { [key: string]: string } = {
            'ACTIVE': 'Actif',
            'FORMING': 'En Formation',
            'CYCLE_COMPLETE': 'Cycle Complet',
            'SUSPENDED': 'Suspendu',
            'DISSOLVED': 'Dissous',
            'PAID': 'Payé',
            'PENDING': 'En Attente',
            'LATE': 'En Retard'
        };

        const frequencyLabels: { [key: string]: string } = {
            'WEEKLY': 'Hebdomadaire',
            'BI_WEEKLY': 'Bimensuel',
            'MONTHLY': 'Mensuel'
        };

        // Groups table
        const groupsTableHeaders = `
            <th>Code</th>
            <th>Nom du Groupe</th>
            <th>Agence</th>
            <th>Cotisation</th>
            <th>Fréquence</th>
            <th>Membres</th>
            <th>Cycle</th>
            <th>Total Collecté</th>
            <th>Statut</th>
        `;

        const groupsTableRows = groupsData.map(row => `
            <tr>
                <td>${row.groupCode || '-'}</td>
                <td>${row.groupName || '-'}</td>
                <td>${row.branchName || '-'}</td>
                <td style="text-align: right;">${formatCurrency(row.contributionAmount || 0)}</td>
                <td>${frequencyLabels[row.frequency] || row.frequency || '-'}</td>
                <td>${row.currentMembers || 0}/${row.maxMembers || 0}</td>
                <td>${row.currentCycle || 0}/${row.totalCycles || 0}</td>
                <td style="text-align: right;">${formatCurrency(row.totalCollected || 0)}</td>
                <td>${statusLabels[row.status] || row.status || '-'}</td>
            </tr>
        `).join('');

        // Contributions table
        const contributionsTableHeaders = `
            <th>Groupe</th>
            <th>Cycle</th>
            <th>Membre</th>
            <th>Date Échéance</th>
            <th>Date Paiement</th>
            <th>Montant Dû</th>
            <th>Montant Payé</th>
            <th>Pénalité</th>
            <th>Statut</th>
        `;

        const contributionsTableRows = contributionsData.map(row => `
            <tr>
                <td>${row.groupName || '-'}</td>
                <td>${row.cycleNumber || '-'}</td>
                <td>${row.memberName || '-'}</td>
                <td>${row.dueDate || '-'}</td>
                <td>${row.paidDate || '-'}</td>
                <td style="text-align: right;">${formatCurrency(row.expectedAmount || 0)}</td>
                <td style="text-align: right;">${formatCurrency(row.paidAmount || 0)}</td>
                <td style="text-align: right;">${formatCurrency(row.penaltyAmount || 0)}</td>
                <td>${statusLabels[row.status] || row.status || '-'}</td>
            </tr>
        `).join('');

        const statsSection = `
            <div class="stats">
                <div class="stat-box"><strong>Groupes:</strong> ${totals.totalGroups}</div>
                <div class="stat-box"><strong>Membres:</strong> ${totals.totalMembers}</div>
                <div class="stat-box"><strong>Total Collecté:</strong> ${formatCurrency(totals.totalCollected)}</div>
                <div class="stat-box"><strong>Pénalités:</strong> ${formatCurrency(totals.totalPenalties)}</div>
                <div class="stat-box"><strong>Taux Recouvrement:</strong> ${totals.collectionRate.toFixed(1)}%</div>
            </div>
        `;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    h2 { color: #666; font-size: 16px; margin-top: 30px; border-bottom: 2px solid #4a90a4; padding-bottom: 5px; }
                    .date-range { text-align: center; color: #666; margin-bottom: 20px; }
                    .stats { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; flex-wrap: wrap; }
                    .stat-box { text-align: center; margin: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 9px; }
                    th, td { border: 1px solid #ddd; padding: 5px; text-align: left; }
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

                ${groupsData.length > 0 ? `
                    <h2>Groupes de Tontine</h2>
                    <table>
                        <thead><tr>${groupsTableHeaders}</tr></thead>
                        <tbody>${groupsTableRows}</tbody>
                    </table>
                ` : ''}

                ${contributionsData.length > 0 ? `
                    <h2>Cotisations</h2>
                    <table>
                        <thead><tr>${contributionsTableHeaders}</tr></thead>
                        <tbody>${contributionsTableRows}</tbody>
                    </table>
                ` : ''}

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

        toast.current?.show({ severity: 'success', summary: 'Export PDF', detail: 'Le document est prêt pour impression/enregistrement en PDF' });
    };

    const exportToExcel = () => {
        if (groupsData.length === 0 && contributionsData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        const frequencyLabels: { [key: string]: string } = {
            'WEEKLY': 'Hebdomadaire',
            'BI_WEEKLY': 'Bimensuel',
            'MONTHLY': 'Mensuel'
        };

        // Create CSV content with BOM for Excel UTF-8 support
        let csvContent = '\uFEFF';

        // Statistics section
        csvContent += 'STATISTIQUES\n';
        csvContent += 'Indicateur;Valeur\n';
        csvContent += `"Groupes";"${totals.totalGroups}"\n`;
        csvContent += `"Membres";"${totals.totalMembers}"\n`;
        csvContent += `"Total Collecté";"${totals.totalCollected}"\n`;
        csvContent += `"Pénalités";"${totals.totalPenalties}"\n`;
        csvContent += `"Taux Recouvrement";"${totals.collectionRate.toFixed(1)}%"\n`;
        csvContent += '\n';

        // Groups section
        if (groupsData.length > 0) {
            csvContent += 'GROUPES DE TONTINE\n';
            csvContent += 'Code;Nom du Groupe;Agence;Cotisation;Fréquence;Membres Actuels;Max Membres;Cycle Actuel;Total Cycles;Total Collecté;Pénalités;Statut\n';
            groupsData.forEach(row => {
                csvContent += `"${row.groupCode || ''}";"${row.groupName || ''}";"${row.branchName || ''}";"${row.contributionAmount || 0}";"${frequencyLabels[row.frequency] || row.frequency || ''}";"${row.currentMembers || 0}";"${row.maxMembers || 0}";"${row.currentCycle || 0}";"${row.totalCycles || 0}";"${row.totalCollected || 0}";"${row.totalPenalties || 0}";"${row.status || ''}"\n`;
            });
            csvContent += '\n';
        }

        // Contributions section
        if (contributionsData.length > 0) {
            csvContent += 'COTISATIONS\n';
            csvContent += 'Groupe;Cycle;Membre;Date Échéance;Date Paiement;Montant Dû;Montant Payé;Pénalité;Statut\n';
            contributionsData.forEach(row => {
                csvContent += `"${row.groupName || ''}";"${row.cycleNumber || ''}";"${row.memberName || ''}";"${row.dueDate || ''}";"${row.paidDate || ''}";"${row.expectedAmount || 0}";"${row.paidAmount || 0}";"${row.penaltyAmount || 0}";"${row.status || ''}"\n`;
            });
        }

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport_tontine_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.current?.show({ severity: 'success', summary: 'Export Excel', detail: 'Le fichier CSV a été téléchargé avec succès' });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const amountTemplate = (rowData: any, field: string) => {
        return <span className="font-bold">{formatCurrency(rowData[field])}</span>;
    };

    const membersTemplate = (rowData: TontineGroupReport) => {
        const percentage = (rowData.currentMembers / rowData.maxMembers) * 100;
        return (
            <div>
                <span className="font-bold">{rowData.currentMembers}/{rowData.maxMembers}</span>
                <div className="surface-300 border-round overflow-hidden h-0.5rem mt-1">
                    <div className="bg-primary h-full" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        );
    };

    const cycleTemplate = (rowData: TontineGroupReport) => {
        return <span>Cycle {rowData.currentCycle}/{rowData.totalCycles}</span>;
    };

    const statusTemplate = (rowData: any) => {
        const getSeverity = (status: string) => {
            switch (status?.toUpperCase()) {
                case 'ACTIVE': return 'success';
                case 'FORMING': return 'info';
                case 'CYCLE_COMPLETE': return 'warning';
                case 'SUSPENDED': return 'warning';
                case 'DISSOLVED': return 'danger';
                case 'PAID': return 'success';
                case 'PENDING': return 'warning';
                case 'LATE': return 'danger';
                default: return 'info';
            }
        };
        const labels: { [key: string]: string } = {
            'ACTIVE': 'Actif',
            'FORMING': 'En Formation',
            'CYCLE_COMPLETE': 'Cycle Complet',
            'SUSPENDED': 'Suspendu',
            'DISSOLVED': 'Dissous',
            'PAID': 'Payé',
            'PENDING': 'En Attente',
            'LATE': 'En Retard'
        };
        return <Tag value={labels[rowData.status] || rowData.status} severity={getSeverity(rowData.status)} />;
    };

    const frequencyTemplate = (rowData: TontineGroupReport) => {
        const labels: { [key: string]: string } = {
            'WEEKLY': 'Hebdomadaire',
            'BI_WEEKLY': 'Bimensuel',
            'MONTHLY': 'Mensuel'
        };
        return labels[rowData.frequency] || rowData.frequency;
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-users text-4xl text-primary"></i>
                    <div>
                        <h2 className="m-0">Rapport Tontine</h2>
                        <p className="m-0 text-500">État des groupes de tontine et cotisations</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportToPdf} disabled={groupsData.length === 0} />
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={exportToExcel} disabled={groupsData.length === 0} />
                </div>
            </div>

            <Divider />

            {/* Filtres */}
            <Card className="mb-4">
                <h5 className="m-0 mb-3">
                    <i className="pi pi-filter mr-2"></i>
                    Critères de Recherche
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateFrom">Période Du</label>
                        <Calendar
                            id="dateFrom"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateTo">Période Au</label>
                        <Calendar
                            id="dateTo"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="branch">Agence</label>
                        <Dropdown
                            id="branch"
                            value={branchId}
                            options={branches}
                            onChange={(e) => setBranchId(e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Toutes les agences"
                            showClear
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="status">Statut</label>
                        <Dropdown
                            id="status"
                            value={status}
                            options={statusOptions}
                            onChange={(e) => setStatus(e.value)}
                            placeholder="Tous les statuts"
                            showClear
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="flex justify-content-end mt-3">
                    <Button
                        label="Générer le Rapport"
                        icon="pi pi-search"
                        onClick={generateReport}
                        loading={loading}
                    />
                </div>
            </Card>

            {/* Statistiques */}
            {groupsData.length > 0 && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-2">
                        <Card className="bg-blue-50">
                            <div className="text-center">
                                <i className="pi pi-sitemap text-3xl text-blue-500"></i>
                                <p className="text-500 m-0 mt-2">Groupes</p>
                                <p className="text-2xl font-bold m-0">{totals.totalGroups}</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-2">
                        <Card className="bg-green-50">
                            <div className="text-center">
                                <i className="pi pi-users text-3xl text-green-500"></i>
                                <p className="text-500 m-0 mt-2">Membres</p>
                                <p className="text-2xl font-bold m-0">{totals.totalMembers}</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-purple-50">
                            <div className="text-center">
                                <i className="pi pi-wallet text-3xl text-purple-500"></i>
                                <p className="text-500 m-0 mt-2">Total Collecté</p>
                                <p className="text-xl font-bold m-0">{formatCurrency(totals.totalCollected)}</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-2">
                        <Card className="bg-orange-50">
                            <div className="text-center">
                                <i className="pi pi-exclamation-triangle text-3xl text-orange-500"></i>
                                <p className="text-500 m-0 mt-2">Pénalités</p>
                                <p className="text-xl font-bold m-0">{formatCurrency(totals.totalPenalties)}</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-cyan-50">
                            <div className="text-center">
                                <i className="pi pi-percentage text-3xl text-cyan-500"></i>
                                <p className="text-500 m-0 mt-2">Taux Recouvrement</p>
                                <p className="text-2xl font-bold m-0">{totals.collectionRate.toFixed(1)}%</p>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Tableaux */}
            {loading ? (
                <div className="flex justify-content-center p-5">
                    <ProgressSpinner />
                </div>
            ) : (
                <TabView>
                    <TabPanel header="Groupes de Tontine" leftIcon="pi pi-sitemap mr-2">
                        <DataTable
                            value={groupsData}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            emptyMessage="Aucune donnée. Veuillez générer un rapport."
                            className="p-datatable-sm"
                            stripedRows
                        >
                            <Column field="groupCode" header="Code" sortable />
                            <Column field="groupName" header="Nom du Groupe" sortable />
                            <Column field="branchName" header="Agence" sortable />
                            <Column field="contributionAmount" header="Cotisation" body={(row) => amountTemplate(row, 'contributionAmount')} sortable />
                            <Column field="frequency" header="Fréquence" body={frequencyTemplate} sortable />
                            <Column header="Membres" body={membersTemplate} />
                            <Column header="Cycle" body={cycleTemplate} />
                            <Column field="totalCollected" header="Total Collecté" body={(row) => amountTemplate(row, 'totalCollected')} sortable />
                            <Column field="status" header="Statut" body={statusTemplate} sortable />
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Cotisations" leftIcon="pi pi-money-bill mr-2">
                        <DataTable
                            value={contributionsData}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            emptyMessage="Aucune donnée."
                            className="p-datatable-sm"
                            stripedRows
                        >
                            <Column field="groupName" header="Groupe" sortable />
                            <Column field="cycleNumber" header="Cycle" sortable />
                            <Column field="memberName" header="Membre" sortable />
                            <Column field="dueDate" header="Date Échéance" sortable />
                            <Column field="paidDate" header="Date Paiement" sortable />
                            <Column field="expectedAmount" header="Montant Dû" body={(row) => amountTemplate(row, 'expectedAmount')} sortable />
                            <Column field="paidAmount" header="Montant Payé" body={(row) => amountTemplate(row, 'paidAmount')} sortable />
                            <Column field="penaltyAmount" header="Pénalité" body={(row) => amountTemplate(row, 'penaltyAmount')} sortable />
                            <Column field="status" header="Statut" body={statusTemplate} sortable />
                        </DataTable>
                    </TabPanel>
                </TabView>
            )}
        </div>
    );
};

export default RapportTontinePage;
