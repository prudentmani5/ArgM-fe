'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { shouldFilterByBranch } from '../../../../utils/branchFilter';
import {
    DemandeDepense,
    BudgetDepense,
    STATUTS_DEMANDE_DEPENSE,
    CATEGORIES_DEPENSE
} from '../types/DepenseTypes';

const RapportsPage = () => {
    const [demandes, setDemandes] = useState<DemandeDepense[]>([]);
    const [budgets, setBudgets] = useState<BudgetDepense[]>([]);
    const [dateDebut, setDateDebut] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFin, setDateFin] = useState<Date | null>(new Date());
    const [filterCategorie, setFilterCategorie] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const toast = useRef<Toast>(null);
    const { data: demandesData, loading: loadingDemandes, fetchData: fetchDemandes } = useConsumApi('');
    const { data: budgetsData, loading: loadingBudgets, fetchData: fetchBudgets } = useConsumApi('');

    const DEMANDES_URL = buildApiUrl('/api/depenses/demandes');
    const BUDGETS_URL = buildApiUrl('/api/depenses/budgets');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (demandesData) setDemandes(Array.isArray(demandesData) ? demandesData : demandesData.content || []);
    }, [demandesData]);

    useEffect(() => {
        if (budgetsData) setBudgets(Array.isArray(budgetsData) ? budgetsData : budgetsData.content || []);
    }, [budgetsData]);

    const loadData = () => {
        const { filter, branchId } = shouldFilterByBranch();
        const demandesUrl = filter ? `${DEMANDES_URL}/findbybranch/${branchId}` : `${DEMANDES_URL}/findall`;
        const budgetsUrl = filter ? `${BUDGETS_URL}/findbybranch/${branchId}` : `${BUDGETS_URL}/findall`;
        fetchDemandes(null, 'GET', demandesUrl, 'loadDemandes');
        fetchBudgets(null, 'GET', budgetsUrl, 'loadBudgets');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Filtered data
    const filteredDemandes = demandes.filter(d => {
        let match = true;
        if (dateDebut && d.dateDemande) match = match && new Date(d.dateDemande) >= dateDebut;
        if (dateFin && d.dateDemande) match = match && new Date(d.dateDemande) <= dateFin;
        if (filterCategorie) match = match && d.categorieDepenseCode === filterCategorie;
        return match;
    });

    const payedDemandes = filteredDemandes.filter(d => ['PAYEE', 'JUSTIFIEE', 'CLOTUREE'].includes(d.status || ''));

    // KPIs
    const totalDepenses = payedDemandes.reduce((sum, d) => sum + (d.montantPaye || d.montantEstimeFBU || 0), 0);
    const totalDemandes = filteredDemandes.length;
    const enAttente = filteredDemandes.filter(d => ['SOUMISE', 'ENGAGEE', 'VALIDEE_N1', 'VALIDEE_N2'].includes(d.status || '')).length;
    const rejetees = filteredDemandes.filter(d => d.status === 'REJETEE').length;

    // Chart data - Dépenses par catégorie
    const categorieMap = new Map<string, number>();
    payedDemandes.forEach(d => {
        const cat = d.categorieDepenseName || 'Autre';
        categorieMap.set(cat, (categorieMap.get(cat) || 0) + (d.montantPaye || d.montantEstimeFBU || 0));
    });

    const chartCategorieData = {
        labels: Array.from(categorieMap.keys()),
        datasets: [{
            data: Array.from(categorieMap.values()),
            backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6']
        }]
    };

    // Chart data - Budget vs Dépenses
    const chartBudgetData = {
        labels: budgets.map(b => b.libelle || b.code || ''),
        datasets: [
            {
                label: 'Budget Alloué',
                backgroundColor: '#3B82F6',
                data: budgets.map(b => b.montantAlloue || 0)
            },
            {
                label: 'Montant Dépensé',
                backgroundColor: '#EF4444',
                data: budgets.map(b => b.montantDepense || 0)
            },
            {
                label: 'Disponible',
                backgroundColor: '#10B981',
                data: budgets.map(b => b.montantDisponible || 0)
            }
        ]
    };

    // Chart data - Evolution mensuelle
    const monthlyMap = new Map<string, number>();
    payedDemandes.forEach(d => {
        const date = d.datePaiement || d.dateDemande || '';
        if (date) {
            const month = date.substring(0, 7);
            monthlyMap.set(month, (monthlyMap.get(month) || 0) + (d.montantPaye || d.montantEstimeFBU || 0));
        }
    });
    const sortedMonths = Array.from(monthlyMap.keys()).sort();

    const chartEvolutionData = {
        labels: sortedMonths,
        datasets: [{
            label: 'Dépenses Mensuelles',
            data: sortedMonths.map(m => monthlyMap.get(m) || 0),
            fill: true,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
        }]
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const formatCurrencyPlain = (value: number | undefined) => {
        return (value || 0).toLocaleString('fr-BI') + ' FBu';
    };

    const exportExcel = () => {
        if (payedDemandes.length === 0) {
            showToast('warn', 'Attention', 'Aucune donnée à exporter');
            return;
        }
        const headers = ['N° Demande', 'Date Paiement', 'Catégorie', 'Nature', 'Bénéficiaire', 'Montant Payé', 'Mode', 'Statut'];
        const rows = payedDemandes.map(d => [
            d.numeroDemande || '',
            d.datePaiement ? new Date(d.datePaiement).toLocaleDateString('fr-FR') : '',
            d.categorieDepenseName || '',
            d.natureLibelle || '',
            d.beneficiaireFournisseur || '',
            String(d.montantPaye || d.montantEstimeFBU || 0),
            d.modePaiementName || '',
            STATUTS_DEMANDE_DEPENSE.find(s => s.value === d.status)?.label || d.status || ''
        ]);

        let csvContent = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
        });
        csvContent += '\n';
        csvContent += `"Total Dépenses";"${payedDemandes.length} demandes";;;;"${totalDepenses}";"";"";\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport_depenses_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('success', 'Export Excel', 'Le fichier CSV a été téléchargé');
    };

    const exportPDF = () => {
        if (payedDemandes.length === 0) {
            showToast('warn', 'Attention', 'Aucune donnée à exporter');
            return;
        }
        const dateRange = dateDebut && dateFin
            ? `${dateDebut.toLocaleDateString('fr-FR')} au ${dateFin.toLocaleDateString('fr-FR')}`
            : 'Toutes les dates';

        const tableRows = payedDemandes.map(d => `
            <tr>
                <td>${d.numeroDemande || ''}</td>
                <td>${d.datePaiement ? new Date(d.datePaiement).toLocaleDateString('fr-FR') : '-'}</td>
                <td>${d.categorieDepenseName || ''}</td>
                <td>${d.natureLibelle || ''}</td>
                <td>${d.beneficiaireFournisseur || ''}</td>
                <td style="text-align:right;font-weight:bold">${formatCurrencyPlain(d.montantPaye || d.montantEstimeFBU)}</td>
                <td>${d.modePaiementName || ''}</td>
                <td>${STATUTS_DEMANDE_DEPENSE.find(s => s.value === d.status)?.label || d.status || ''}</td>
            </tr>
        `).join('');

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Rapport des Dépenses</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
                    .header h1 { color: #3B82F6; margin: 0; font-size: 20px; }
                    .header p { margin: 5px 0; color: #666; }
                    .summary { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
                    .summary div { text-align: center; }
                    .summary .value { font-size: 16px; font-weight: bold; color: #3B82F6; }
                    .summary .label { font-size: 11px; color: #888; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background-color: #3B82F6; color: white; padding: 8px 6px; text-align: left; font-size: 11px; }
                    td { padding: 6px; border-bottom: 1px solid #ddd; font-size: 11px; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .total-row { background-color: #e8f0fe !important; font-weight: bold; }
                    .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #999; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="${window.location.origin}/layout/images/logo/logoAgrinova.PNG" alt="Logo" style="height:50px;margin-bottom:8px;" />
                    <h1>Rapport des Dépenses</h1>
                    <p>Période: ${dateRange}</p>
                    <p>Imprimé le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
                </div>
                <div class="summary">
                    <div><div class="value">${formatCurrencyPlain(totalDepenses)}</div><div class="label">Total Dépenses</div></div>
                    <div><div class="value">${payedDemandes.length}</div><div class="label">Demandes Payées</div></div>
                    <div><div class="value">${enAttente}</div><div class="label">En Attente</div></div>
                    <div><div class="value">${rejetees}</div><div class="label">Rejetées</div></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>N° Demande</th>
                            <th>Date Paiement</th>
                            <th>Catégorie</th>
                            <th>Nature</th>
                            <th>Bénéficiaire</th>
                            <th style="text-align:right">Montant Payé</th>
                            <th>Mode</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        <tr class="total-row">
                            <td colspan="5" style="text-align:right">TOTAL</td>
                            <td style="text-align:right">${formatCurrencyPlain(totalDepenses)}</td>
                            <td colspan="2"></td>
                        </tr>
                    </tbody>
                </table>
                <div class="footer">
                    <p>AGRINOVA MICROFINANCE - Rapport généré automatiquement</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); }, 250);
        }
        showToast('success', 'Export PDF', 'Le document est prêt pour impression/enregistrement en PDF');
    };

    const dateBodyTemplate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const statusBodyTemplate = (rowData: DemandeDepense) => {
        const severityMap: Record<string, any> = {
            'PAYEE': 'success', 'JUSTIFIEE': 'success', 'CLOTUREE': 'secondary',
            'APPROUVEE': 'success', 'REJETEE': 'danger', 'SOUMISE': 'info'
        };
        const label = STATUTS_DEMANDE_DEPENSE.find(s => s.value === rowData.status)?.label || rowData.status;
        return <Tag value={label} severity={severityMap[rowData.status || ''] || 'info'} />;
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Filters */}
            <div className="mb-3 p-3 surface-100 border-round">
                <div className="flex flex-wrap gap-3 align-items-end">
                    <div className="field mb-0">
                        <label className="block text-sm mb-1">Date Début</label>
                        <Calendar value={dateDebut} onChange={(e) => setDateDebut(e.value as Date)} dateFormat="dd/mm/yy" />
                    </div>
                    <div className="field mb-0">
                        <label className="block text-sm mb-1">Date Fin</label>
                        <Calendar value={dateFin} onChange={(e) => setDateFin(e.value as Date)} dateFormat="dd/mm/yy" />
                    </div>
                    <div className="field mb-0">
                        <label className="block text-sm mb-1">Catégorie</label>
                        <Dropdown value={filterCategorie} options={[{ label: 'Toutes', value: null }, ...CATEGORIES_DEPENSE]}
                            onChange={(e) => setFilterCategorie(e.value)} placeholder="Toutes" />
                    </div>
                    <Button label="Actualiser" icon="pi pi-refresh" onClick={loadData} />
                </div>
            </div>

            {/* KPIs */}
            <div className="grid mb-3">
                <div className="col-12 md:col-3">
                    <div className="surface-card shadow-1 p-3 border-round text-center">
                        <i className="pi pi-money-bill text-4xl text-blue-500 mb-2"></i>
                        <div className="text-2xl font-bold text-blue-600">{currencyBodyTemplate(totalDepenses)}</div>
                        <div className="text-sm text-500">Total Dépenses</div>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-card shadow-1 p-3 border-round text-center">
                        <i className="pi pi-file text-4xl text-green-500 mb-2"></i>
                        <div className="text-2xl font-bold">{totalDemandes}</div>
                        <div className="text-sm text-500">Total Demandes</div>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-card shadow-1 p-3 border-round text-center">
                        <i className="pi pi-clock text-4xl text-orange-500 mb-2"></i>
                        <div className="text-2xl font-bold">{enAttente}</div>
                        <div className="text-sm text-500">En Attente</div>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-card shadow-1 p-3 border-round text-center">
                        <i className="pi pi-times-circle text-4xl text-red-500 mb-2"></i>
                        <div className="text-2xl font-bold">{rejetees}</div>
                        <div className="text-sm text-500">Rejetées</div>
                    </div>
                </div>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Tableaux de Bord" leftIcon="pi pi-chart-bar mr-2">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="surface-card shadow-1 p-3 border-round">
                                <h5><i className="pi pi-chart-pie mr-2"></i>Répartition par Catégorie</h5>
                                {categorieMap.size > 0 ? (
                                    <Chart type="doughnut" data={chartCategorieData} options={{ responsive: true, maintainAspectRatio: true }} />
                                ) : (
                                    <p className="text-500 text-center py-5">Aucune donnée disponible</p>
                                )}
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="surface-card shadow-1 p-3 border-round">
                                <h5><i className="pi pi-chart-line mr-2"></i>Évolution Mensuelle</h5>
                                {sortedMonths.length > 0 ? (
                                    <Chart type="line" data={chartEvolutionData} options={{ responsive: true, maintainAspectRatio: true }} />
                                ) : (
                                    <p className="text-500 text-center py-5">Aucune donnée disponible</p>
                                )}
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="surface-card shadow-1 p-3 border-round">
                                <h5><i className="pi pi-chart-bar mr-2"></i>Budget vs Dépenses</h5>
                                {budgets.length > 0 ? (
                                    <Chart type="bar" data={chartBudgetData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top' } } }} />
                                ) : (
                                    <p className="text-500 text-center py-5">Aucune donnée disponible</p>
                                )}
                            </div>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Rapport Dépenses" leftIcon="pi pi-file mr-2">
                    <div className="flex justify-content-end gap-2 mb-3">
                        <Button label="PDF" icon="pi pi-file-pdf" severity="danger" size="small" onClick={() => exportPDF()} />
                        <Button label="Excel" icon="pi pi-file-excel" severity="success" size="small" onClick={() => exportExcel()} />
                    </div>
                    <DataTable value={payedDemandes} paginator rows={15} rowsPerPageOptions={[10, 15, 25, 50]}
                        loading={loadingDemandes} emptyMessage="Aucune dépense trouvée" className="p-datatable-sm"
                        sortField="datePaiement" sortOrder={-1}>
                        <Column field="numeroDemande" header="N° Demande" sortable filter style={{ width: '10%' }} />
                        <Column field="datePaiement" header="Date Paiement" body={(row) => dateBodyTemplate(row.datePaiement)} sortable style={{ width: '10%' }} />
                        <Column field="categorieDepenseName" header="Catégorie" sortable filter style={{ width: '12%' }} />
                        <Column field="natureLibelle" header="Nature" sortable filter style={{ width: '18%' }} />
                        <Column field="beneficiaireFournisseur" header="Bénéficiaire" sortable style={{ width: '15%' }} />
                        <Column header="Montant Payé" body={(row) => currencyBodyTemplate(row.montantPaye || row.montantEstimeFBU)} sortable style={{ width: '12%' }} />
                        <Column field="modePaiementName" header="Mode" sortable style={{ width: '10%' }} />
                        <Column header="Statut" body={statusBodyTemplate} style={{ width: '8%' }} />
                    </DataTable>
                </TabPanel>

                <TabPanel header="Suivi Budgétaire" leftIcon="pi pi-chart-bar mr-2">
                    <DataTable value={budgets} paginator rows={10} loading={loadingBudgets}
                        emptyMessage="Aucun budget trouvé" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable style={{ width: '8%' }} />
                        <Column field="libelle" header="Libellé" sortable filter style={{ width: '18%' }} />
                        <Column field="exercice" header="Exercice" sortable style={{ width: '8%' }} />
                        <Column header="Alloué" body={(row) => currencyBodyTemplate(row.montantAlloue)} sortable style={{ width: '14%' }} />
                        <Column header="Dépensé" body={(row) => <span className="text-orange-600 font-semibold">{currencyBodyTemplate(row.montantDepense)}</span>} style={{ width: '14%' }} />
                        <Column header="Engagé" body={(row) => <span className="text-blue-600">{currencyBodyTemplate(row.montantEngage)}</span>} style={{ width: '14%' }} />
                        <Column header="Disponible" body={(row) => <span className={`font-semibold ${(row.montantDisponible || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>{currencyBodyTemplate(row.montantDisponible)}</span>} style={{ width: '14%' }} />
                        <Column header="Taux" body={(row) => {
                            const taux = row.tauxConsommation ?? 0;
                            return <Tag value={`${taux.toFixed(1)}%`} severity={taux >= 80 ? 'danger' : taux >= 50 ? 'warning' : 'success'} />;
                        }} style={{ width: '10%' }} />
                    </DataTable>
                </TabPanel>

                <TabPanel header="Justificatifs Manquants" leftIcon="pi pi-exclamation-triangle mr-2">
                    <DataTable value={filteredDemandes.filter(d => d.status === 'PAYEE' && !d.justificatifFourni)}
                        paginator rows={10} emptyMessage="Aucun justificatif manquant" className="p-datatable-sm">
                        <Column field="numeroDemande" header="N° Demande" sortable filter style={{ width: '12%' }} />
                        <Column field="datePaiement" header="Date Paiement" body={(row) => dateBodyTemplate(row.datePaiement)} sortable style={{ width: '10%' }} />
                        <Column field="natureLibelle" header="Nature" sortable style={{ width: '20%' }} />
                        <Column field="beneficiaireFournisseur" header="Bénéficiaire" sortable style={{ width: '15%' }} />
                        <Column header="Montant" body={(row) => currencyBodyTemplate(row.montantPaye)} style={{ width: '12%' }} />
                        <Column field="agentDemandeurName" header="Demandeur" sortable style={{ width: '15%' }} />
                        <Column header="Jours écoulés" body={(row) => {
                            if (!row.datePaiement) return '-';
                            const days = Math.floor((new Date().getTime() - new Date(row.datePaiement).getTime()) / (1000 * 60 * 60 * 24));
                            return <Tag value={`${days} jours`} severity={days > 5 ? 'danger' : days > 3 ? 'warning' : 'info'} />;
                        }} style={{ width: '10%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default RapportsPage;
