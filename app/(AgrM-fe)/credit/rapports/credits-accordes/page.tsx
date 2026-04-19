'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { shouldFilterByBranch } from '@/utils/branchFilter';
import { parseLocalDate } from '@/utils/dateUtils';
import { printReport } from '@/utils/pdfExport';

// ─── helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF', minimumFractionDigits: 0 }).format(v || 0);

const formatDate = (s: string) => {
    if (!s) return '-';
    const [y, m, d] = s.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR');
};

const pct = (part: number, total: number) =>
    total > 0 ? ((part / total) * 100).toFixed(1) + ' %' : '0 %';

// Labels
const GENDER_LABELS: Record<string, string> = { M: 'Masculin', F: 'Féminin' };
const CLIENT_TYPE_LABELS: Record<string, string> = {
    INDIVIDUAL: 'Particulier',
    BUSINESS: 'Entreprise',
    JOINT_ACCOUNT: 'Compte Joint',
    SOLIDARITY_GROUP: 'Groupe Solidaire',
};
const GENDER_COLORS: Record<string, 'info' | 'success'> = { M: 'info', F: 'success' };
const CLIENT_TYPE_COLORS: Record<string, any> = {
    INDIVIDUAL: 'info',
    BUSINESS: 'warning',
    JOINT_ACCOUNT: 'success',
    SOLIDARITY_GROUP: 'help',
};

// ─── grouping ────────────────────────────────────────────────────────────────

function groupBy<T>(
    items: T[],
    keyFn: (item: T) => string,
    labelFn: (item: T) => string,
    amountFn: (item: T) => number
): { key: string; label: string; count: number; amount: number }[] {
    const map = new Map<string, { label: string; count: number; amount: number }>();
    for (const item of items) {
        const key = keyFn(item) || 'N/A';
        const label = labelFn(item) || 'Non défini';
        const existing = map.get(key) || { label, count: 0, amount: 0 };
        map.set(key, { label, count: existing.count + 1, amount: existing.amount + amountFn(item) });
    }
    return Array.from(map.entries())
        .map(([key, v]) => ({ key, ...v }))
        .sort((a, b) => b.amount - a.amount);
}

// ─── component ───────────────────────────────────────────────────────────────

export default function RapportCreditsAccordesPage() {
    const [disbursements, setDisbursements] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [filters, setFilters] = useState<{ dateFrom: Date | null; dateTo: Date | null; branchId: number | null }>({
        dateFrom: null,
        dateTo: null,
        branchId: null,
    });

    const toast = useRef<Toast>(null);
    const disbApi = useConsumApi('');
    const branchApi = useConsumApi('');

    useEffect(() => {
        const { filter, branchId } = shouldFilterByBranch();
        const url = filter
            ? buildApiUrl(`/api/credit/disbursements/findbybranch/${branchId}`)
            : buildApiUrl('/api/credit/disbursements/findall');
        disbApi.fetchData(null, 'GET', url, 'load');
        branchApi.fetchData(null, 'GET', buildApiUrl('/api/reference-data/branches/findall'), 'branches');
    }, []);

    useEffect(() => {
        if (disbApi.data) {
            const raw = Array.isArray(disbApi.data) ? disbApi.data : disbApi.data.content || [];
            // Only COMPLETED disbursements = actually granted loans
            setDisbursements(raw.filter((d: any) => d.status === 'COMPLETED'));
        }
        if (disbApi.error)
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: disbApi.error.message, life: 3000 });
    }, [disbApi.data, disbApi.error]);

    useEffect(() => {
        if (branchApi.data)
            setBranches(Array.isArray(branchApi.data) ? branchApi.data : branchApi.data.content || []);
    }, [branchApi.data]);

    // ── filtered dataset ──────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return disbursements.filter((d: any) => {
            if (filters.branchId && d.branchId !== filters.branchId && d.branch?.id !== filters.branchId)
                return false;
            if (filters.dateFrom || filters.dateTo) {
                const dt = parseLocalDate(d.disbursementDate?.split('T')[0]);
                if (filters.dateFrom && dt < filters.dateFrom) return false;
                if (filters.dateTo && dt > filters.dateTo) return false;
            }
            return true;
        });
    }, [disbursements, filters]);

    const totalAmount = filtered.reduce((s: number, d: any) => s + (d.amount || 0), 0);
    const totalCount = filtered.length;

    // ── groupings ─────────────────────────────────────────────────────────────
    const byLoanType = useMemo(() =>
        groupBy(
            filtered,
            (d) => d.loanProductName || String(d.loanProductId || 'N/A'),
            (d) => d.loanProductName || 'Non défini',
            (d) => d.amount || 0
        ), [filtered]);

    const bySector = useMemo(() =>
        groupBy(
            filtered,
            (d) => d.activitySectorCode || d.application?.client?.activitySector?.code || 'N/A',
            (d) => d.activitySectorName || d.application?.client?.activitySector?.nameFr || 'Non défini',
            (d) => d.amount || 0
        ), [filtered]);

    const byGender = useMemo(() =>
        groupBy(
            filtered,
            (d) => d.clientGender || d.application?.client?.gender || 'N/A',
            (d) => GENDER_LABELS[d.clientGender || d.application?.client?.gender] || 'Non défini',
            (d) => d.amount || 0
        ), [filtered]);

    const byClientType = useMemo(() =>
        groupBy(
            filtered,
            (d) => d.clientType || d.application?.client?.clientType || 'N/A',
            (d) => CLIENT_TYPE_LABELS[d.clientType || d.application?.client?.clientType] || 'Non défini',
            (d) => d.amount || 0
        ), [filtered]);

    // ── Excel export ──────────────────────────────────────────────────────────
    const exportExcel = () => {
        const fmtAmt = (v: number) => v ? new Intl.NumberFormat('fr-FR').format(v) : '0';
        const fmtDate = (v: string) => {
            if (!v) return '-';
            const [y, m, d] = v.split('T')[0].split('-').map(Number);
            return new Date(y, m - 1, d).toLocaleDateString('fr-FR');
        };

        const headers = ['N° Dossier', 'Client', 'Type de Crédit', 'Montant (FBU)', 'Date Décaissement',
            'Genre', 'Type Client', "Secteur d'Activité", 'Agence'];
        const rows = filtered.map(d => [
            d.applicationNumber || '',
            d.clientName || '',
            d.loanProductName || '-',
            fmtAmt(d.amount || 0),
            fmtDate(d.disbursementDate),
            d.clientGender ? (d.clientGender === 'M' ? 'Masculin' : 'Féminin') : '-',
            d.clientType ? (CLIENT_TYPE_LABELS[d.clientType] || d.clientType) : '-',
            d.activitySectorName || '-',
            d.branch?.name || d.branchName || '-',
        ]);

        let csv = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(r => { csv += r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';') + '\n'; });
        csv += '\n';
        csv += `"Total Crédits";"${totalCount}";;;` +
               `"Montant Total";"${fmtAmt(totalAmount)} FBU";;;\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credits_accordes_${new Date().toISOString().split('T')[0]}.csv`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.current?.show({ severity: 'success', summary: 'Export Excel', detail: 'Fichier CSV téléchargé avec succès', life: 3000 });
    };

    // ── export helpers ────────────────────────────────────────────────────────
    const buildDateStr = () =>
        filters.dateFrom || filters.dateTo
            ? `Du ${filters.dateFrom ? filters.dateFrom.toLocaleDateString('fr-FR') : '...'}` +
              ` au ${filters.dateTo ? filters.dateTo.toLocaleDateString('fr-FR') : '...'}`
            : 'Toutes les dates';

    const exportGroupPdf = (title: string, rows: ReturnType<typeof groupBy>) => {
        const dateStr = buildDateStr();
        printReport({
            title,
            dateRange: dateStr,
            columns: [
                { header: 'Catégorie', dataKey: 'label' },
                { header: 'Nombre', dataKey: 'count', align: 'center' },
                { header: '% Crédits', dataKey: 'pctCount', align: 'center' },
                { header: 'Montant Total (FBU)', dataKey: 'amount', formatter: (v) => new Intl.NumberFormat('fr-FR').format(v || 0) + ' FBU', align: 'right' },
                { header: '% Montant', dataKey: 'pctAmt', align: 'center' },
            ],
            data: rows.map(r => ({ ...r, pctAmt: pct(r.amount, totalAmount), pctCount: pct(r.count, totalCount) })),
            statistics: [
                { label: 'Total Crédits', value: totalCount },
                { label: 'Montant Total', value: new Intl.NumberFormat('fr-FR').format(totalAmount) + ' FBU' },
            ],
        });
    };

    // ── summary cards ─────────────────────────────────────────────────────────
    const summaryCards = [
        { label: 'Crédits Accordés', value: totalCount, icon: 'pi-file-check', color: '#3b82f6' },
        { label: 'Montant Total', value: formatCurrency(totalAmount), icon: 'pi-money-bill', color: '#10b981' },
        { label: 'Montant Moyen', value: formatCurrency(totalCount > 0 ? totalAmount / totalCount : 0), icon: 'pi-chart-bar', color: '#f59e0b' },
        { label: 'Secteurs Actifs', value: bySector.filter(s => s.key !== 'N/A').length, icon: 'pi-briefcase', color: '#8b5cf6' },
    ];

    // ── reusable breakdown table ──────────────────────────────────────────────
    const BreakdownTable = ({
        rows,
        title,
        pdfTitle,
        renderKey,
    }: {
        rows: ReturnType<typeof groupBy>;
        title: string;
        pdfTitle: string;
        renderKey?: (key: string, label: string) => React.ReactNode;
    }) => (
        <div>
            <div className="flex align-items-center justify-content-between mb-3">
                <h6 className="m-0 font-semibold text-700">{title}</h6>
                <Button
                    label="PDF"
                    icon="pi pi-file-pdf"
                    severity="danger"
                    size="small"
                    text
                    onClick={() => exportGroupPdf(pdfTitle, rows)}
                />
            </div>
            <DataTable
                value={rows}
                size="small"
                showGridlines
                className="p-datatable-sm"
                emptyMessage="Aucune donnée"
            >
                <Column
                    header="Catégorie"
                    body={(r) => renderKey ? renderKey(r.key, r.label) : <span className="font-semibold">{r.label}</span>}
                    style={{ width: '35%' }}
                />
                <Column
                    header="Nombre"
                    field="count"
                    body={(r) => (
                        <span className="font-bold text-primary">{r.count}</span>
                    )}
                    style={{ width: '12%', textAlign: 'right' }}
                />
                <Column
                    header="% Crédits"
                    body={(r) => pct(r.count, totalCount)}
                    style={{ width: '13%', textAlign: 'right' }}
                />
                <Column
                    header="Montant Total (FBU)"
                    body={(r) => <span className="font-semibold">{formatCurrency(r.amount)}</span>}
                    style={{ width: '25%', textAlign: 'right' }}
                />
                <Column
                    header="% Montant"
                    body={(r) => (
                        <div className="flex align-items-center gap-2">
                            <div
                                className="border-round"
                                style={{
                                    height: '6px',
                                    width: `${totalAmount > 0 ? (r.amount / totalAmount) * 80 : 0}px`,
                                    background: '#3b82f6',
                                    minWidth: '2px',
                                }}
                            />
                            <span className="text-sm">{pct(r.amount, totalAmount)}</span>
                        </div>
                    )}
                    style={{ width: '15%' }}
                />
            </DataTable>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex align-items-center justify-content-between mb-4">
                <div>
                    <h4 className="m-0 text-primary">
                        <i className="pi pi-chart-pie mr-2"></i>
                        Rapport des Crédits Accordés
                    </h4>
                    <small className="text-500">
                        Répartition par type de crédit, secteur d'activité, genre et type de client
                    </small>
                </div>
                <Button
                    label="Exporter Excel"
                    icon="pi pi-file-excel"
                    severity="success"
                    outlined
                    onClick={exportExcel}
                    disabled={filtered.length === 0}
                />
            </div>

            {/* Filters */}
            <div className="surface-50 border-round border-1 border-300 p-3 mb-4">
                <div className="grid align-items-end">
                    <div className="col-12 md:col-3">
                        <label className="font-semibold block mb-2">
                            <i className="pi pi-calendar mr-1"></i>Date Début
                        </label>
                        <Calendar
                            value={filters.dateFrom}
                            onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.value as Date | null }))}
                            showIcon
                            placeholder="Date début"
                            className="w-full"
                            dateFormat="dd/mm/yy"
                            maxDate={filters.dateTo || undefined}
                        />
                    </div>
                    <div className="col-12 md:col-3">
                        <label className="font-semibold block mb-2">
                            <i className="pi pi-calendar mr-1"></i>Date Fin
                        </label>
                        <Calendar
                            value={filters.dateTo}
                            onChange={(e) => setFilters(f => ({ ...f, dateTo: e.value as Date | null }))}
                            showIcon
                            placeholder="Date fin"
                            className="w-full"
                            dateFormat="dd/mm/yy"
                            minDate={filters.dateFrom || undefined}
                        />
                    </div>
                    <div className="col-12 md:col-3">
                        <label className="font-semibold block mb-2">
                            <i className="pi pi-building mr-1"></i>Agence
                        </label>
                        <Dropdown
                            value={filters.branchId}
                            options={[{ id: null, name: 'Toutes les agences' }, ...branches]}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => setFilters(f => ({ ...f, branchId: e.value }))}
                            placeholder="Toutes les agences"
                            className="w-full"
                        />
                    </div>
                    <div className="col-12 md:col-3 flex gap-2">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-filter-slash"
                            severity="secondary"
                            outlined
                            onClick={() => setFilters({ dateFrom: null, dateTo: null, branchId: null })}
                        />
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid mb-4">
                {summaryCards.map((card, i) => (
                    <div key={i} className="col-12 md:col-3">
                        <div className="surface-card border-round border-1 border-200 p-3 flex align-items-center gap-3 shadow-1">
                            <div
                                className="border-round flex align-items-center justify-content-center"
                                style={{ background: card.color + '20', width: '48px', height: '48px', flexShrink: 0 }}
                            >
                                <i className={`pi ${card.icon}`} style={{ fontSize: '1.4rem', color: card.color }}></i>
                            </div>
                            <div>
                                <div className="text-500 text-sm">{card.label}</div>
                                <div className="font-bold text-900 text-xl">{card.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Breakdown tables */}
            {disbApi.loading ? (
                <div className="flex justify-content-center py-6">
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                </div>
            ) : (
                <TabView>
                    {/* Tab 1: By loan type */}
                    <TabPanel header="Type de Crédit" leftIcon="pi pi-tag mr-2">
                        <BreakdownTable
                            rows={byLoanType}
                            title="Répartition par Type de Crédit"
                            pdfTitle="Crédits Accordés par Type de Crédit"
                            renderKey={(key, label) => (
                                <Tag value={label} severity="info" />
                            )}
                        />
                    </TabPanel>

                    {/* Tab 2: By activity sector */}
                    <TabPanel header="Secteur d'Activité" leftIcon="pi pi-briefcase mr-2">
                        <BreakdownTable
                            rows={bySector}
                            title="Répartition par Secteur d'Activité"
                            pdfTitle="Crédits Accordés par Secteur d'Activité"
                            renderKey={(key, label) => (
                                <span>
                                    <i className="pi pi-briefcase mr-2 text-500"></i>
                                    {label}
                                </span>
                            )}
                        />
                    </TabPanel>

                    {/* Tab 3: By gender */}
                    <TabPanel header="Genre" leftIcon="pi pi-users mr-2">
                        <div className="grid mb-4">
                            {byGender.map(r => (
                                <div key={r.key} className="col-12 md:col-6">
                                    <div className={`border-round border-1 p-4 text-center ${r.key === 'M' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`}>
                                        <i className={`pi pi-user text-4xl mb-2 ${r.key === 'M' ? 'text-blue-500' : 'text-green-500'}`}></i>
                                        <div className="text-xl font-bold">{r.label}</div>
                                        <div className="text-3xl font-bold mt-2">{r.count}</div>
                                        <div className="text-500 text-sm">{pct(r.count, totalCount)} des crédits</div>
                                        <div className="font-semibold mt-1 text-primary">{formatCurrency(r.amount)}</div>
                                        <div className="text-500 text-sm">{pct(r.amount, totalAmount)} du montant</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <BreakdownTable
                            rows={byGender}
                            title="Tableau de Répartition par Genre"
                            pdfTitle="Crédits Accordés par Genre"
                            renderKey={(key, label) => (
                                <Tag value={label} severity={GENDER_COLORS[key] || 'info'} />
                            )}
                        />
                    </TabPanel>

                    {/* Tab 4: By client type */}
                    <TabPanel header="Type de Client" leftIcon="pi pi-id-card mr-2">
                        <BreakdownTable
                            rows={byClientType}
                            title="Répartition par Type de Client"
                            pdfTitle="Crédits Accordés par Type de Client"
                            renderKey={(key, label) => (
                                <Tag value={label} severity={CLIENT_TYPE_COLORS[key] || 'info'} />
                            )}
                        />
                    </TabPanel>

                    {/* Tab 5: Full detail list */}
                    <TabPanel header="Détail" leftIcon="pi pi-list mr-2">
                        <div className="flex justify-content-end gap-2 mb-3">
                            <Button
                                label="Exporter Excel"
                                icon="pi pi-file-excel"
                                severity="success"
                                size="small"
                                outlined
                                onClick={exportExcel}
                                disabled={filtered.length === 0}
                            />
                            <Button
                                label="Exporter PDF"
                                icon="pi pi-file-pdf"
                                severity="danger"
                                size="small"
                                onClick={() => {
                                    printReport({
                                        title: 'Détail des Crédits Accordés',
                                        dateRange: buildDateStr(),
                                        columns: [
                                            { header: 'N° Dossier', dataKey: 'applicationNumber' },
                                            { header: 'Client', dataKey: 'clientName' },
                                            { header: 'Type Crédit', dataKey: 'loanProductName' },
                                            { header: 'Montant (FBU)', dataKey: 'amount', formatter: (v) => new Intl.NumberFormat('fr-FR').format(v || 0) + ' FBU', align: 'right' },
                                            { header: 'Date', dataKey: 'disbursementDate', formatter: (v) => v ? new Date(v).toLocaleDateString('fr-FR') : '-' },
                                            { header: 'Genre', dataKey: 'gender' },
                                            { header: 'Type Client', dataKey: 'clientType' },
                                            { header: 'Secteur', dataKey: 'sector' },
                                        ],
                                        data: filtered.map(d => ({
                                            applicationNumber: d.applicationNumber,
                                            clientName: d.clientName,
                                            loanProductName: d.loanProductName || '-',
                                            amount: d.amount,
                                            disbursementDate: d.disbursementDate,
                                            gender: GENDER_LABELS[d.clientGender || d.application?.client?.gender] || '-',
                                            clientType: CLIENT_TYPE_LABELS[d.clientType || d.application?.client?.clientType] || '-',
                                            sector: d.activitySectorName || d.application?.client?.activitySector?.nameFr || '-',
                                        })),
                                        statistics: [
                                            { label: 'Total Crédits', value: totalCount },
                                            { label: 'Montant Total', value: new Intl.NumberFormat('fr-FR').format(totalAmount) + ' FBU' },
                                        ],
                                    });
                                }}
                            />
                        </div>
                        <DataTable
                            value={filtered}
                            paginator
                            rows={15}
                            rowsPerPageOptions={[10, 15, 25, 50]}
                            size="small"
                            showGridlines
                            className="p-datatable-sm"
                            emptyMessage="Aucun crédit trouvé"
                            loading={disbApi.loading}
                        >
                            <Column field="applicationNumber" header="N° Dossier" sortable style={{ width: '12%' }} />
                            <Column field="clientName" header="Client" sortable style={{ width: '18%' }} />
                            <Column
                                header="Type de Crédit"
                                body={(d) => {
                                    const name = d.loanProductName || '-';
                                    return <Tag value={name} severity="info" />;
                                }}
                                style={{ width: '14%' }}
                            />
                            <Column
                                header="Montant (FBU)"
                                body={(d) => <span className="font-semibold">{formatCurrency(d.amount)}</span>}
                                sortable
                                field="amount"
                                style={{ width: '13%' }}
                            />
                            <Column
                                header="Date"
                                body={(d) => formatDate(d.disbursementDate)}
                                sortable
                                field="disbursementDate"
                                style={{ width: '9%' }}
                            />
                            <Column
                                header="Genre"
                                body={(d) => {
                                    const g = d.clientGender || d.application?.client?.gender;
                                    return g ? <Tag value={GENDER_LABELS[g] || g} severity={GENDER_COLORS[g] || 'info'} /> : '-';
                                }}
                                style={{ width: '9%' }}
                            />
                            <Column
                                header="Type Client"
                                body={(d) => {
                                    const ct = d.clientType || d.application?.client?.clientType;
                                    return ct ? <Tag value={CLIENT_TYPE_LABELS[ct] || ct} severity={CLIENT_TYPE_COLORS[ct] || 'info'} /> : '-';
                                }}
                                style={{ width: '11%' }}
                            />
                            <Column
                                header="Secteur d'Activité"
                                body={(d) =>
                                    d.activitySectorName ||
                                    d.application?.client?.activitySector?.nameFr || '-'
                                }
                                style={{ width: '14%' }}
                            />
                        </DataTable>
                    </TabPanel>
                </TabView>
            )}
        </div>
    );
}
