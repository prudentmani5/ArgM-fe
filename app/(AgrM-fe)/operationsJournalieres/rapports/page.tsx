'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';

import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

const OJ_URL = buildApiUrl('/api/operations-journalieres');
const BRANCHES_URL = buildApiUrl('/api/reference-data/branches');

interface RapportJournalier {
    rapportId: number;
    dateJour: string;
    agenceCode: string;
    agenceNom: string;
    totalDeposits: number;
    totalWithdrawals: number;
    totalTransfers: number;
    totalLoansDisburse: number;
    totalReimbursements: number;
    totalTransactions: number;
    soldeOuverture: number;
    soldeFermeture: number;
    variation: number;
    statutEod: string;
    heureOuverture?: string;
    heureFermeture?: string;
}

interface ExceptionReport {
    exceptionId: number;
    dateJour: string;
    typeException: string;
    description: string;
    montantEcart?: number;
    agenceNom: string;
    statut: string;
    escaladePar?: string;
}

const toApiDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('fr-FR');
};

const formatDateTime = (v?: string) => {
    if (!v) return '-';
    try { return new Date(v).toLocaleString('fr-FR'); } catch { return v; }
};

const RapportsPage = () => {
    const [rapports, setRapports] = useState<RapportJournalier[]>([]);
    const [exceptions, setExceptions] = useState<ExceptionReport[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [filterDateDebut, setFilterDateDebut] = useState<Date>(new Date());
    const [filterDateFin, setFilterDateFin] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState(0);

    const toast = useRef<Toast>(null);
    const rapportsApi = useConsumApi('');
    const exceptionsApi = useConsumApi('');
    const branchesApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    useEffect(() => {
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        loadData();
    }, []);

    useEffect(() => {
        if (branchesApi.data && branchesApi.callType === 'loadBranches') {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
        }
    }, [branchesApi.data, branchesApi.callType]);

    const buildParams = () => {
        const params = new URLSearchParams();
        if (filterDateDebut) params.append('dateDebut', toApiDate(filterDateDebut));
        if (filterDateFin) params.append('dateFin', toApiDate(filterDateFin));
        if (selectedBranch) params.append('agenceId', String(selectedBranch));
        return params.toString();
    };

    const loadData = () => {
        const query = buildParams();
        rapportsApi.fetchData(null, 'GET', `${OJ_URL}/rapports/journalier?${query}`, 'loadRapports');
        exceptionsApi.fetchData(null, 'GET', `${OJ_URL}/rapports/exceptions?${query}`, 'loadExceptions');
    };

    useEffect(() => {
        if (rapportsApi.data && rapportsApi.callType === 'loadRapports') {
            setRapports(Array.isArray(rapportsApi.data) ? rapportsApi.data : []);
        }
        if (rapportsApi.error && rapportsApi.callType === 'loadRapports') {
            showToast('error', 'Erreur', rapportsApi.error.message || 'Erreur de chargement');
        }
    }, [rapportsApi.data, rapportsApi.error, rapportsApi.callType]);

    useEffect(() => {
        if (exceptionsApi.data && exceptionsApi.callType === 'loadExceptions') {
            setExceptions(Array.isArray(exceptionsApi.data) ? exceptionsApi.data : []);
        }
    }, [exceptionsApi.data, exceptionsApi.callType]);

    const totalRow = rapports.length > 0 ? {
        agenceNom: 'TOTAL',
        totalDeposits: rapports.reduce((s, r) => s + (r.totalDeposits || 0), 0),
        totalWithdrawals: rapports.reduce((s, r) => s + (r.totalWithdrawals || 0), 0),
        totalTransfers: rapports.reduce((s, r) => s + (r.totalTransfers || 0), 0),
        totalLoansDisburse: rapports.reduce((s, r) => s + (r.totalLoansDisburse || 0), 0),
        totalReimbursements: rapports.reduce((s, r) => s + (r.totalReimbursements || 0), 0),
        totalTransactions: rapports.reduce((s, r) => s + (r.totalTransactions || 0), 0),
        soldeOuverture: rapports.reduce((s, r) => s + (r.soldeOuverture || 0), 0),
        soldeFermeture: rapports.reduce((s, r) => s + (r.soldeFermeture || 0), 0),
        variation: rapports.reduce((s, r) => s + (r.variation || 0), 0),
    } : null;

    const getStatutEodTag = (statut: string) => {
        const map: Record<string, { label: string; severity: 'success' | 'danger' | 'warning' | 'info' | 'secondary' }> = {
            NON_DEMARRE: { label: 'Non Démarré', severity: 'secondary' },
            EN_COURS: { label: 'En Cours', severity: 'warning' },
            TERMINE: { label: 'Terminé', severity: 'success' },
            ERREUR: { label: 'Erreur', severity: 'danger' },
        };
        const s = map[statut] || { label: statut || '-', severity: 'info' as const };
        return <Tag value={s.label} severity={s.severity} />;
    };

    const variationTemplate = (rowData: any) => {
        const val = rowData.variation || 0;
        return <span className={`font-bold ${val >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatNumber(val)}</span>;
    };

    const exceptionTypeTag = (type: string) => {
        const colorMap: Record<string, string> = {
            ECART_SOLDE: '#F44336',
            TENTATIVE_CONNEXION: '#FF9800',
            ACCES_HORS_HORAIRE: '#9C27B0',
            TRANSACTION_SUSPECTE: '#795548',
        };
        return <Tag value={type?.replace(/_/g, ' ')} style={{ background: colorMap[type] || '#2196F3' }} />;
    };

    const exceptionStatutTag = (statut: string) => {
        const map: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
            RESOLU: 'success',
            EN_ATTENTE: 'warning',
            ESCALADE: 'danger',
            SIGNALE: 'info',
        };
        return <Tag value={statut} severity={map[statut] || 'info'} />;
    };

    const filterHeader = (
        <div className="flex flex-wrap gap-2 align-items-end">
            <div className="flex flex-column gap-1">
                <label className="text-xs text-500">Du</label>
                <Calendar value={filterDateDebut} onChange={e => setFilterDateDebut(e.value as Date)} dateFormat="dd/mm/yy" style={{ width: '150px' }} />
            </div>
            <div className="flex flex-column gap-1">
                <label className="text-xs text-500">Au</label>
                <Calendar value={filterDateFin} onChange={e => setFilterDateFin(e.value as Date)} dateFormat="dd/mm/yy" style={{ width: '150px' }} />
            </div>
            <div className="flex flex-column gap-1">
                <label className="text-xs text-500">Agence</label>
                <Dropdown
                    value={selectedBranch}
                    options={branches.map(b => ({ label: b.agenceName || b.name, value: b.agenceId || b.id }))}
                    onChange={e => setSelectedBranch(e.value)}
                    placeholder="Toutes agences"
                    showClear
                    style={{ width: '200px' }}
                />
            </div>
            <Button label="Générer" icon="pi pi-chart-bar" onClick={loadData} />
        </div>
    );

    const summaryCards = [
        { label: 'Total Dépôts', val: rapports.reduce((s, r) => s + (r.totalDeposits || 0), 0), icon: 'pi-arrow-down', color: '#4CAF50', bg: 'bg-green-50' },
        { label: 'Total Retraits', val: rapports.reduce((s, r) => s + (r.totalWithdrawals || 0), 0), icon: 'pi-arrow-up', color: '#F44336', bg: 'bg-red-50' },
        { label: 'Total Transactions', val: rapports.reduce((s, r) => s + (r.totalTransactions || 0), 0), icon: 'pi-list', color: '#2196F3', bg: 'bg-blue-50' },
        { label: 'Exceptions', val: exceptions.length, icon: 'pi-exclamation-triangle', color: '#FF9800', bg: 'bg-orange-50' },
    ];

    return (
        <ProtectedPage requiredAuthorities={['OJ_RAPPORTS_VIEW', 'ADMIN']}>
            <Toast ref={toast} />

            <div className="card">
                <div className="flex align-items-center gap-3 mb-4">
                    <i className="pi pi-chart-bar text-4xl" style={{ color: '#3F51B5' }} />
                    <div>
                        <h2 className="m-0 text-900">Rapports Journaliers</h2>
                        <p className="m-0 text-500 text-sm">États financiers journaliers, balance de vérification et rapports d'exceptions</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-4">{filterHeader}</div>

                {/* Summary Cards */}
                {rapports.length > 0 && (
                    <div className="grid mb-4">
                        {summaryCards.map(item => (
                            <div key={item.label} className="col-12 md:col-6 lg:col-3">
                                <Card className={`text-center ${item.bg}`}>
                                    <i className={`pi ${item.icon} text-2xl mb-1`} style={{ color: item.color }} />
                                    <div className="text-xl font-bold" style={{ color: item.color }}>{formatNumber(item.val)}</div>
                                    <div className="text-500 text-sm">{item.label}</div>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}

                <TabView activeIndex={activeTab} onTabChange={e => setActiveTab(e.index)}>
                    {/* Rapport Financier Journalier */}
                    <TabPanel header="Résumés Financiers" leftIcon="pi pi-chart-line mr-2">
                        <DataTable
                            value={totalRow ? [...rapports, { ...totalRow, isTotal: true }] : rapports}
                            loading={rapportsApi.loading}
                            stripedRows showGridlines paginator rows={15}
                            emptyMessage="Aucun rapport trouvé — générez les rapports en cliquant sur 'Générer'"
                            rowClassName={(r: any) => r.isTotal ? 'font-bold bg-blue-50' : ''}
                        >
                            <Column field="dateJour" header="Date" sortable style={{ minWidth: '110px' }} />
                            <Column field="agenceNom" header="Agence" sortable style={{ minWidth: '140px' }} />
                            <Column field="heureOuverture" header="Ouverture" body={(r) => formatDateTime(r.heureOuverture)} style={{ minWidth: '130px' }} />
                            <Column field="heureFermeture" header="Fermeture" body={(r) => formatDateTime(r.heureFermeture)} style={{ minWidth: '130px' }} />
                            <Column field="totalDeposits" header="Dépôts" sortable body={(r) => formatNumber(r.totalDeposits)} style={{ minWidth: '120px' }} bodyClassName="text-green-700" />
                            <Column field="totalWithdrawals" header="Retraits" sortable body={(r) => formatNumber(r.totalWithdrawals)} style={{ minWidth: '120px' }} bodyClassName="text-red-700" />
                            <Column field="totalTransfers" header="Virements" sortable body={(r) => formatNumber(r.totalTransfers)} style={{ minWidth: '120px' }} />
                            <Column field="totalLoansDisburse" header="Décaissements" sortable body={(r) => formatNumber(r.totalLoansDisburse)} style={{ minWidth: '130px' }} />
                            <Column field="totalReimbursements" header="Remboursements" sortable body={(r) => formatNumber(r.totalReimbursements)} style={{ minWidth: '140px' }} />
                            <Column field="totalTransactions" header="Nb. Txn" sortable body={(r) => formatNumber(r.totalTransactions)} style={{ minWidth: '90px' }} />
                            <Column field="soldeOuverture" header="Solde Ouvert." sortable body={(r) => formatNumber(r.soldeOuverture)} style={{ minWidth: '130px' }} />
                            <Column field="soldeFermeture" header="Solde Fermet." sortable body={(r) => formatNumber(r.soldeFermeture)} style={{ minWidth: '130px' }} />
                            <Column field="variation" header="Variation" sortable body={variationTemplate} style={{ minWidth: '110px' }} />
                            <Column field="statutEod" header="EOD" body={(r) => !r.isTotal && r.statutEod ? getStatutEodTag(r.statutEod) : ''} style={{ minWidth: '110px' }} />
                        </DataTable>
                    </TabPanel>

                    {/* Rapport d'Exceptions */}
                    <TabPanel header={`Rapport d'Exceptions (${exceptions.length})`} leftIcon="pi pi-exclamation-triangle mr-2">
                        {exceptions.filter(e => e.statut !== 'RESOLU').length > 0 && (
                            <div className="mb-3">
                                <Tag severity="danger" value={`${exceptions.filter(e => e.statut !== 'RESOLU').length} exception(s) non résolue(s) — escalade au Responsable Financier requise`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }} />
                            </div>
                        )}
                        <DataTable
                            value={exceptions}
                            loading={exceptionsApi.loading}
                            stripedRows showGridlines paginator rows={15}
                            emptyMessage="Aucune exception détectée"
                            sortField="dateJour" sortOrder={-1}
                        >
                            <Column field="dateJour" header="Date" sortable style={{ minWidth: '110px' }} />
                            <Column field="agenceNom" header="Agence" sortable style={{ minWidth: '140px' }} />
                            <Column field="typeException" header="Type" sortable body={(r) => exceptionTypeTag(r.typeException)} style={{ minWidth: '160px' }} />
                            <Column field="description" header="Description" style={{ minWidth: '250px' }} />
                            <Column field="montantEcart" header="Montant Écart" sortable body={(r) => r.montantEcart ? formatNumber(r.montantEcart) : '-'} style={{ minWidth: '130px' }} />
                            <Column field="escaladePar" header="Escaladé à" style={{ minWidth: '150px' }} />
                            <Column field="statut" header="Statut" sortable body={(r) => exceptionStatutTag(r.statut)} style={{ minWidth: '110px' }} />
                        </DataTable>
                    </TabPanel>
                </TabView>
            </div>
        </ProtectedPage>
    );
};

export default RapportsPage;
