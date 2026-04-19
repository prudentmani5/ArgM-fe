'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Divider } from 'primereact/divider';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { shouldFilterByBranch } from '@/utils/branchFilter';
import { printReport } from '@/utils/pdfExport';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(v || 0) + ' FBU';

const fmtDate = (s: string) => {
    if (!s) return '-';
    const [y, m, d] = s.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR');
};

const pct = (part: number, total: number) =>
    total > 0 ? ((part / total) * 100).toFixed(1) + ' %' : '0 %';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
    REGULAR: 'Compte Régulier',
    TERM_DEPOSIT: 'Dépôt à Terme',
    COMPULSORY: 'Épargne Obligatoire',
};

const ACCOUNT_TYPE_SEVERITY: Record<string, any> = {
    REGULAR: 'info',
    TERM_DEPOSIT: 'warning',
    COMPULSORY: 'success',
};

// ─── Default amount ranges ────────────────────────────────────────────────────

const DEFAULT_RANGES = [
    { label: '0 – 100 000', min: 0, max: 100_000 },
    { label: '100 001 – 500 000', min: 100_001, max: 500_000 },
    { label: '500 001 – 1 000 000', min: 500_001, max: 1_000_000 },
    { label: '1 000 001 – 5 000 000', min: 1_000_001, max: 5_000_000 },
    { label: '5 000 001 – 10 000 000', min: 5_000_001, max: 10_000_000 },
    { label: '> 10 000 000', min: 10_000_001, max: Infinity },
];

// ─── Grouping helper ──────────────────────────────────────────────────────────

function groupBy<T>(
    items: T[],
    keyFn: (item: T) => string,
    labelFn: (item: T) => string,
    balanceFn: (item: T) => number
): { key: string; label: string; count: number; balance: number }[] {
    const map = new Map<string, { label: string; count: number; balance: number }>();
    for (const item of items) {
        const key = keyFn(item) || 'N/A';
        const label = labelFn(item) || 'Non défini';
        const existing = map.get(key) || { label, count: 0, balance: 0 };
        map.set(key, { label, count: existing.count + 1, balance: existing.balance + balanceFn(item) });
    }
    return Array.from(map.entries())
        .map(([key, v]) => ({ key, ...v }))
        .sort((a, b) => b.balance - a.balance);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SituationComptesPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [filters, setFilters] = useState<{
        branchId: number | null;
        accountType: string | null;
        statusCode: string | null;
        minBalance: number | null;
        maxBalance: number | null;
    }>({ branchId: null, accountType: null, statusCode: null, minBalance: null, maxBalance: null });
    const [ranges, setRanges] = useState(DEFAULT_RANGES);

    const toast = useRef<Toast>(null);
    const accApi = useConsumApi('');
    const branchApi = useConsumApi('');

    useEffect(() => {
        const { filter, branchId } = shouldFilterByBranch();
        const url = filter
            ? buildApiUrl(`/api/savings-accounts/findbybranch/${branchId}`)
            : buildApiUrl('/api/savings-accounts/findall');
        accApi.fetchData(null, 'GET', url, 'load');
        branchApi.fetchData(null, 'GET', buildApiUrl('/api/reference-data/branches/findall'), 'branches');
    }, []);

    useEffect(() => {
        if (accApi.data) {
            const raw = Array.isArray(accApi.data) ? accApi.data : accApi.data.content || [];
            setAccounts(raw);
        }
        if (accApi.error)
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: accApi.error.message, life: 3000 });
    }, [accApi.data, accApi.error]);

    useEffect(() => {
        if (branchApi.data)
            setBranches(Array.isArray(branchApi.data) ? branchApi.data : branchApi.data.content || []);
    }, [branchApi.data]);

    // ── filtered dataset ──────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return accounts.filter((a: any) => {
            if (filters.branchId && a.branch?.id !== filters.branchId) return false;
            if (filters.accountType && a.accountType !== filters.accountType) return false;
            if (filters.statusCode) {
                const sc = a.status?.code || a.status?.name || '';
                if (sc !== filters.statusCode) return false;
            }
            const bal = a.currentBalance || 0;
            if (filters.minBalance !== null && bal < filters.minBalance) return false;
            if (filters.maxBalance !== null && bal > filters.maxBalance) return false;
            return true;
        });
    }, [accounts, filters]);

    const totalBalance = filtered.reduce((s: number, a: any) => s + (a.currentBalance || 0), 0);
    const totalAvailable = filtered.reduce((s: number, a: any) => s + (a.availableBalance || 0), 0);
    const totalBlocked = filtered.reduce((s: number, a: any) => s + (a.blockedAmount || 0), 0);
    const avgBalance = filtered.length > 0 ? totalBalance / filtered.length : 0;

    // ── range breakdown ───────────────────────────────────────────────────────
    const byRange = useMemo(() =>
        ranges.map(r => {
            const items = filtered.filter((a: any) => {
                const b = a.currentBalance || 0;
                return b >= r.min && b <= r.max;
            });
            return {
                label: r.label,
                count: items.length,
                balance: items.reduce((s: number, a: any) => s + (a.currentBalance || 0), 0),
                available: items.reduce((s: number, a: any) => s + (a.availableBalance || 0), 0),
            };
        }).filter(r => r.count > 0),
    [filtered, ranges]);

    // ── other groupings ───────────────────────────────────────────────────────
    const byType = useMemo(() =>
        groupBy(filtered, (a) => a.accountType || 'N/A',
            (a) => ACCOUNT_TYPE_LABELS[a.accountType] || a.accountType || 'Non défini',
            (a) => a.currentBalance || 0), [filtered]);

    const byStatus = useMemo(() =>
        groupBy(filtered,
            (a) => a.status?.code || a.status?.name || 'N/A',
            (a) => a.status?.nameFr || a.status?.name || 'Non défini',
            (a) => a.currentBalance || 0), [filtered]);

    const byBranch = useMemo(() =>
        groupBy(filtered, (a) => String(a.branch?.id || 'N/A'),
            (a) => a.branch?.name || 'Non défini',
            (a) => a.currentBalance || 0), [filtered]);

    // ── status options (derived from data) ────────────────────────────────────
    const statusOptions = useMemo(() => {
        const seen = new Map<string, string>();
        accounts.forEach((a: any) => {
            const code = a.status?.code || a.status?.name;
            const label = a.status?.nameFr || a.status?.name;
            if (code) seen.set(code, label);
        });
        return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
    }, [accounts]);

    // ── export helpers ────────────────────────────────────────────────────────
    const buildDesc = () => {
        const parts: string[] = [];
        if (filters.accountType) parts.push(ACCOUNT_TYPE_LABELS[filters.accountType] || filters.accountType);
        if (filters.statusCode) parts.push(filters.statusCode);
        if (filters.minBalance !== null || filters.maxBalance !== null)
            parts.push(`Solde: ${filters.minBalance ?? 0} – ${filters.maxBalance ?? '∞'} FBU`);
        return parts.length > 0 ? parts.join(' | ') : 'Tous les comptes';
    };

    const exportExcel = () => {
        const headers = ['N° Compte', 'Client', 'Agence', 'Type Compte', 'Statut',
            'Solde Actuel (FBU)', 'Solde Disponible (FBU)', 'Montant Bloqué (FBU)',
            'Taux Intérêt (%)', 'Date Ouverture'];
        const rows = filtered.map((a: any) => [
            a.accountNumber || '',
            a.client ? `${a.client.firstName || ''} ${a.client.lastName || ''}`.trim() : '-',
            a.branch?.name || '-',
            ACCOUNT_TYPE_LABELS[a.accountType] || a.accountType || '-',
            a.status?.nameFr || a.status?.name || '-',
            String(a.currentBalance || 0),
            String(a.availableBalance || 0),
            String(a.blockedAmount || 0),
            String(a.interestRate || 0),
            fmtDate(a.openingDate),
        ]);

        let csv = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(r => { csv += r.map((c: string) => `"${c.replace(/"/g, '""')}"`).join(';') + '\n'; });
        csv += '\n';
        csv += `"Total Comptes";"${filtered.length}";;;"Solde Total";"${totalBalance}";;;\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `situation_comptes_${new Date().toISOString().split('T')[0]}.csv`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.current?.show({ severity: 'success', summary: 'Export Excel', detail: 'Fichier CSV téléchargé', life: 3000 });
    };

    const exportPdf = () => {
        printReport({
            title: 'Situation des Comptes Courants',
            dateRange: buildDesc(),
            columns: [
                { header: 'N° Compte', dataKey: 'accountNumber' },
                { header: 'Client', dataKey: 'clientName' },
                { header: 'Agence', dataKey: 'branchName' },
                { header: 'Type', dataKey: 'accountType' },
                { header: 'Statut', dataKey: 'statusName' },
                { header: 'Solde Actuel (FBU)', dataKey: 'currentBalance', formatter: (v) => new Intl.NumberFormat('fr-FR').format(v || 0), align: 'right' },
                { header: 'Disponible (FBU)', dataKey: 'availableBalance', formatter: (v) => new Intl.NumberFormat('fr-FR').format(v || 0), align: 'right' },
                { header: 'Bloqué (FBU)', dataKey: 'blockedAmount', formatter: (v) => new Intl.NumberFormat('fr-FR').format(v || 0), align: 'right' },
                { header: 'Ouverture', dataKey: 'openingDate', formatter: fmtDate },
            ],
            data: filtered.map((a: any) => ({
                accountNumber: a.accountNumber,
                clientName: a.client ? `${a.client.firstName || ''} ${a.client.lastName || ''}`.trim() : '-',
                branchName: a.branch?.name || '-',
                accountType: ACCOUNT_TYPE_LABELS[a.accountType] || a.accountType || '-',
                statusName: a.status?.nameFr || a.status?.name || '-',
                currentBalance: a.currentBalance || 0,
                availableBalance: a.availableBalance || 0,
                blockedAmount: a.blockedAmount || 0,
                openingDate: a.openingDate,
            })),
            statistics: [
                { label: 'Total Comptes', value: filtered.length },
                { label: 'Solde Total', value: fmtCurrency(totalBalance) },
                { label: 'Disponible Total', value: fmtCurrency(totalAvailable) },
                { label: 'Bloqué Total', value: fmtCurrency(totalBlocked) },
            ],
        });
    };

    // ── reusable breakdown table ──────────────────────────────────────────────
    const GroupTable = ({
        rows,
        title,
        renderKey,
    }: {
        rows: { key: string; label: string; count: number; balance: number }[];
        title: string;
        renderKey?: (key: string, label: string) => React.ReactNode;
    }) => (
        <div>
            <h6 className="font-semibold text-700 mb-3">{title}</h6>
            <DataTable value={rows} size="small" showGridlines emptyMessage="Aucune donnée">
                <Column
                    header="Catégorie"
                    body={(r) => renderKey ? renderKey(r.key, r.label) : <span className="font-semibold">{r.label}</span>}
                    style={{ width: '30%' }}
                />
                <Column header="Nombre" body={(r) => <span className="font-bold text-primary">{r.count}</span>} style={{ width: '10%', textAlign: 'right' }} />
                <Column header="% Comptes" body={(r) => pct(r.count, filtered.length)} style={{ width: '12%', textAlign: 'right' }} />
                <Column header="Solde Total (FBU)" body={(r) => <span className="font-semibold">{fmtCurrency(r.balance)}</span>} style={{ width: '22%', textAlign: 'right' }} />
                <Column
                    header="% Solde"
                    body={(r) => (
                        <div className="flex align-items-center gap-2">
                            <div className="border-round" style={{ height: 6, width: `${totalBalance > 0 ? (r.balance / totalBalance) * 80 : 0}px`, background: '#4a90a4', minWidth: 2 }} />
                            <span className="text-sm">{pct(r.balance, totalBalance)}</span>
                        </div>
                    )}
                    style={{ width: '26%' }}
                />
            </DataTable>
        </div>
    );

    // ── summary cards ─────────────────────────────────────────────────────────
    const cards = [
        { label: 'Comptes', value: filtered.length, icon: 'pi-credit-card', color: '#3b82f6' },
        { label: 'Solde Total', value: fmtCurrency(totalBalance), icon: 'pi-wallet', color: '#10b981' },
        { label: 'Disponible Total', value: fmtCurrency(totalAvailable), icon: 'pi-check-circle', color: '#8b5cf6' },
        { label: 'Solde Moyen', value: fmtCurrency(avgBalance), icon: 'pi-chart-bar', color: '#f59e0b' },
        { label: 'Montant Bloqué', value: fmtCurrency(totalBlocked), icon: 'pi-lock', color: '#ef4444' },
    ];

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex align-items-center justify-content-between mb-4">
                <div>
                    <h4 className="m-0 text-primary">
                        <i className="pi pi-list mr-2"></i>
                        Situation des Comptes Courants
                    </h4>
                    <small className="text-500">
                        Répartition par tranches de montant et critères
                    </small>
                </div>
                <div className="flex gap-2">
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" outlined onClick={exportExcel} disabled={filtered.length === 0} />
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportPdf} disabled={filtered.length === 0} />
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-4">
                <h5 className="m-0 mb-3"><i className="pi pi-filter mr-2"></i>Critères de Filtrage</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label className="font-semibold block mb-1">Agence</label>
                        <Dropdown
                            value={filters.branchId}
                            options={[{ id: null, name: 'Toutes les agences' }, ...branches]}
                            optionLabel="name" optionValue="id"
                            onChange={(e) => setFilters(f => ({ ...f, branchId: e.value }))}
                            placeholder="Toutes les agences" showClear className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label className="font-semibold block mb-1">Type de Compte</label>
                        <Dropdown
                            value={filters.accountType}
                            options={[
                                { value: 'REGULAR', label: 'Compte Régulier' },
                                { value: 'TERM_DEPOSIT', label: 'Dépôt à Terme' },
                                { value: 'COMPULSORY', label: 'Épargne Obligatoire' },
                            ]}
                            optionLabel="label" optionValue="value"
                            onChange={(e) => setFilters(f => ({ ...f, accountType: e.value }))}
                            placeholder="Tous les types" showClear className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label className="font-semibold block mb-1">Statut</label>
                        <Dropdown
                            value={filters.statusCode}
                            options={statusOptions}
                            optionLabel="label" optionValue="value"
                            onChange={(e) => setFilters(f => ({ ...f, statusCode: e.value }))}
                            placeholder="Tous les statuts" showClear className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3 flex gap-2 align-items-end">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-filter-slash"
                            severity="secondary" outlined
                            onClick={() => setFilters({ branchId: null, accountType: null, statusCode: null, minBalance: null, maxBalance: null })}
                        />
                    </div>

                    {/* Amount range filter */}
                    <div className="field col-12 md:col-3">
                        <label className="font-semibold block mb-1">Solde Minimum (FBU)</label>
                        <InputNumber
                            value={filters.minBalance}
                            onValueChange={(e) => setFilters(f => ({ ...f, minBalance: e.value ?? null }))}
                            placeholder="0" className="w-full" locale="fr-FR"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label className="font-semibold block mb-1">Solde Maximum (FBU)</label>
                        <InputNumber
                            value={filters.maxBalance}
                            onValueChange={(e) => setFilters(f => ({ ...f, maxBalance: e.value ?? null }))}
                            placeholder="Illimité" className="w-full" locale="fr-FR"
                        />
                    </div>
                </div>
            </Card>

            {/* Summary cards */}
            <div className="grid mb-4">
                {cards.map((card, i) => (
                    <div key={i} className="col-12 md:col" style={{ minWidth: 180 }}>
                        <div className="surface-card border-round border-1 border-200 p-3 flex align-items-center gap-3 shadow-1">
                            <div className="border-round flex align-items-center justify-content-center"
                                style={{ background: card.color + '20', width: 44, height: 44, flexShrink: 0 }}>
                                <i className={`pi ${card.icon}`} style={{ fontSize: '1.3rem', color: card.color }}></i>
                            </div>
                            <div>
                                <div className="text-500 text-sm">{card.label}</div>
                                <div className="font-bold text-900" style={{ fontSize: '1rem' }}>{card.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading */}
            {accApi.loading && (
                <div className="flex justify-content-center py-6">
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                </div>
            )}

            {!accApi.loading && (
                <TabView>

                    {/* Tab 1: Tranches de Montant */}
                    <TabPanel header="Tranches de Montant" leftIcon="pi pi-chart-bar mr-2">
                        <div className="mb-3">
                            <small className="text-500">
                                <i className="pi pi-info-circle mr-1"></i>
                                Répartition des comptes selon leur solde actuel par tranches prédéfinies.
                                Personnalisez les critères de filtrage ci-dessus pour affiner l'analyse.
                            </small>
                        </div>
                        <DataTable value={byRange} size="small" showGridlines emptyMessage="Aucune donnée">
                            <Column header="Tranche de Solde (FBU)" field="label" body={(r) => (
                                <span className="font-semibold text-primary">{r.label}</span>
                            )} style={{ width: '28%' }} />
                            <Column header="Nb Comptes" body={(r) => <span className="font-bold">{r.count}</span>} style={{ width: '11%', textAlign: 'right' }} />
                            <Column header="% Comptes" body={(r) => pct(r.count, filtered.length)} style={{ width: '11%', textAlign: 'right' }} />
                            <Column header="Solde Total (FBU)" body={(r) => <span className="font-semibold">{fmtCurrency(r.balance)}</span>} style={{ width: '22%', textAlign: 'right' }} />
                            <Column header="Disponible Total (FBU)" body={(r) => fmtCurrency(r.available)} style={{ width: '16%', textAlign: 'right' }} />
                            <Column
                                header="% Solde"
                                body={(r) => (
                                    <div className="flex align-items-center gap-2">
                                        <div className="border-round" style={{ height: 8, width: `${totalBalance > 0 ? (r.balance / totalBalance) * 100 : 0}px`, background: '#4a90a4', minWidth: 2, maxWidth: 80 }} />
                                        <span className="text-sm font-semibold">{pct(r.balance, totalBalance)}</span>
                                    </div>
                                )}
                                style={{ width: '12%' }}
                            />
                        </DataTable>
                    </TabPanel>

                    {/* Tab 2: Par Type de Compte */}
                    <TabPanel header="Type de Compte" leftIcon="pi pi-tag mr-2">
                        <GroupTable
                            rows={byType}
                            title="Répartition par Type de Compte"
                            renderKey={(key) => (
                                <Tag value={ACCOUNT_TYPE_LABELS[key] || key} severity={ACCOUNT_TYPE_SEVERITY[key] || 'info'} />
                            )}
                        />
                    </TabPanel>

                    {/* Tab 3: Par Statut */}
                    <TabPanel header="Statut" leftIcon="pi pi-info-circle mr-2">
                        <GroupTable
                            rows={byStatus}
                            title="Répartition par Statut de Compte"
                            renderKey={(_key, label) => (
                                <span className="font-semibold">{label}</span>
                            )}
                        />
                    </TabPanel>

                    {/* Tab 4: Par Agence */}
                    <TabPanel header="Agence" leftIcon="pi pi-building mr-2">
                        <GroupTable
                            rows={byBranch}
                            title="Répartition par Agence"
                            renderKey={(_key, label) => (
                                <span><i className="pi pi-building mr-2 text-500"></i>{label}</span>
                            )}
                        />
                    </TabPanel>

                    {/* Tab 5: Détail */}
                    <TabPanel header="Détail" leftIcon="pi pi-list mr-2">
                        <div className="flex justify-content-end gap-2 mb-3">
                            <Button label="Excel" icon="pi pi-file-excel" severity="success" size="small" outlined onClick={exportExcel} disabled={filtered.length === 0} />
                            <Button label="PDF" icon="pi pi-file-pdf" severity="danger" size="small" onClick={exportPdf} disabled={filtered.length === 0} />
                        </div>
                        <DataTable
                            value={filtered}
                            paginator rows={15}
                            rowsPerPageOptions={[10, 15, 25, 50]}
                            size="small" showGridlines
                            emptyMessage="Aucun compte trouvé"
                            loading={accApi.loading}
                            sortField="currentBalance" sortOrder={-1}
                        >
                            <Column field="accountNumber" header="N° Compte" sortable style={{ width: '13%' }} />
                            <Column
                                header="Client"
                                body={(a) => a.client ? `${a.client.firstName || ''} ${a.client.lastName || ''}`.trim() : '-'}
                                sortable field="client.lastName"
                                style={{ width: '18%' }}
                            />
                            <Column header="Agence" body={(a) => a.branch?.name || '-'} style={{ width: '10%' }} />
                            <Column
                                header="Type"
                                body={(a) => (
                                    <Tag value={ACCOUNT_TYPE_LABELS[a.accountType] || a.accountType || '-'}
                                        severity={ACCOUNT_TYPE_SEVERITY[a.accountType] || 'info'} />
                                )}
                                style={{ width: '14%' }}
                            />
                            <Column
                                header="Statut"
                                body={(a) => <span className="font-semibold">{a.status?.nameFr || a.status?.name || '-'}</span>}
                                style={{ width: '10%' }}
                            />
                            <Column
                                header="Solde Actuel (FBU)"
                                body={(a) => <span className="font-bold text-primary">{fmtCurrency(a.currentBalance || 0)}</span>}
                                sortable field="currentBalance"
                                style={{ width: '15%', textAlign: 'right' }}
                            />
                            <Column
                                header="Disponible (FBU)"
                                body={(a) => fmtCurrency(a.availableBalance || 0)}
                                sortable field="availableBalance"
                                style={{ width: '13%', textAlign: 'right' }}
                            />
                            <Column
                                header="Bloqué (FBU)"
                                body={(a) => (a.blockedAmount || 0) > 0
                                    ? <span className="text-red-500 font-semibold">{fmtCurrency(a.blockedAmount)}</span>
                                    : <span className="text-500">-</span>
                                }
                                style={{ width: '10%', textAlign: 'right' }}
                            />
                            <Column
                                header="Ouverture"
                                body={(a) => fmtDate(a.openingDate)}
                                sortable field="openingDate"
                                style={{ width: '9%' }}
                            />
                        </DataTable>
                    </TabPanel>
                </TabView>
            )}
        </div>
    );
}
