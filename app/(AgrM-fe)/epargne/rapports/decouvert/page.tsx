'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { formatLocalDate } from '@/utils/dateUtils';

const BASE_URL     = `${API_BASE_URL}/api/epargne/decouvert`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;

const STATUS_OPTIONS = [
    { label: 'En attente',  value: 'PENDING'   },
    { label: 'Vérifié',     value: 'VERIFIED'  },
    { label: 'Approuvé',    value: 'APPROVED'  },
    { label: 'Décaissé',    value: 'DISBURSED' },
    { label: 'Rejeté',      value: 'REJECTED'  },
    { label: 'Annulé',      value: 'CANCELLED' },
];

const STATUS_LABELS: Record<string, string> = {
    PENDING:   'En attente',
    VERIFIED:  'Vérifié',
    APPROVED:  'Approuvé',
    DISBURSED: 'Décaissé',
    REJECTED:  'Rejeté',
    CANCELLED: 'Annulé',
};

const STATUS_SEVERITY: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
    PENDING:   'warning',
    VERIFIED:  'info',
    APPROVED:  'info',
    DISBURSED: 'success',
    REJECTED:  'danger',
    CANCELLED: 'warning',
};

const fmt = (v: number | null | undefined) =>
    v != null ? new Intl.NumberFormat('fr-BI').format(v) + ' FBU' : '–';

const fmtDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString('fr-FR') : '–';

export default function RapportDecouvertPage() {
    const toast     = useRef<Toast>(null);
    const branchApi = useConsumApi('');
    const listApi   = useConsumApi('');

    const [dateFrom,  setDateFrom]  = useState<Date | null>(null);
    const [dateTo,    setDateTo]    = useState<Date | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [branchId,  setBranchId]  = useState<number | null>(null);
    const [branches,  setBranches]  = useState<any[]>([]);
    const [allData,   setAllData]   = useState<any[]>([]);
    const [filtered,  setFiltered]  = useState<any[]>([]);
    const [loading,   setLoading]   = useState(false);
    const [generated, setGenerated] = useState(false);

    useEffect(() => {
        branchApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
    }, []);

    useEffect(() => {
        if (branchApi.data) setBranches(Array.isArray(branchApi.data) ? branchApi.data : []);
    }, [branchApi.data]);

    useEffect(() => {
        if (listApi.data) {
            const data: any[] = Array.isArray(listApi.data) ? listApi.data : [];
            setAllData(data);
            applyFilters(data);
            setLoading(false);
            setGenerated(true);
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: `${data.length} enregistrement(s) chargé(s)`, life: 3000 });
        }
        if (listApi.error) {
            setLoading(false);
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des données', life: 4000 });
        }
    }, [listApi.data, listApi.error]);

    const applyFilters = (source: any[]) => {
        let result = [...source];

        if (dateFrom) {
            const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
            result = result.filter(r => r.requestDate && new Date(r.requestDate) >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
            result = result.filter(r => r.requestDate && new Date(r.requestDate) <= to);
        }
        if (statusFilter) {
            result = result.filter(r => r.status === statusFilter);
        }
        if (branchId) {
            result = result.filter(r => r.branch?.id === branchId);
        }

        setFiltered(result);
    };

    const generateReport = () => {
        setLoading(true);
        setGenerated(false);
        listApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadAll');
    };

    // Re-apply filters whenever filter values change after first generation
    useEffect(() => {
        if (allData.length > 0) applyFilters(allData);
    }, [dateFrom, dateTo, statusFilter, branchId]);

    // ── Computed stats ──────────────────────────────────────────────────────
    const totalDemandes  = filtered.length;
    const totalDisbursed = filtered.filter(r => r.status === 'DISBURSED').length;
    const totalPending   = filtered.filter(r => ['PENDING', 'VERIFIED', 'APPROVED'].includes(r.status)).length;
    const totalRejected  = filtered.filter(r => ['REJECTED', 'CANCELLED'].includes(r.status)).length;
    const totalPrincipal = filtered.filter(r => r.status === 'DISBURSED')
        .reduce((s: number, r: any) => s + (r.requestedAmount || 0), 0);
    const totalInteret   = filtered.filter(r => r.status === 'DISBURSED')
        .reduce((s: number, r: any) => s + (r.interestAmount || 0), 0);
    const totalDebite    = filtered.filter(r => r.status === 'DISBURSED')
        .reduce((s: number, r: any) => s + (r.totalAmount || 0), 0);

    // ── Export helpers ──────────────────────────────────────────────────────
    const exportToPdf = () => {
        if (!generated || filtered.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter', life: 3000 });
            return;
        }

        const dateRange = dateFrom && dateTo
            ? `Du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}`
            : dateFrom ? `À partir du ${dateFrom.toLocaleDateString('fr-FR')}`
            : dateTo   ? `Jusqu\'au ${dateTo.toLocaleDateString('fr-FR')}`
            : 'Toutes les dates';

        const rows = filtered.map(r => {
            const client = r.client
                ? `${r.client.firstName || ''} ${r.client.lastName || ''}`.trim()
                : r.solidarityGroup?.groupName ?? `Cpte #${r.savingsAccountId}`;
            return `
                <tr>
                    <td>${r.requestNumber || '–'}</td>
                    <td>${fmtDate(r.requestDate)}</td>
                    <td>${client}</td>
                    <td>${r.branch?.name || '–'}</td>
                    <td style="text-align:right">${fmt(r.requestedAmount)}</td>
                    <td style="text-align:right;color:#e74c3c">${fmt(r.interestAmount)}</td>
                    <td style="text-align:right;font-weight:bold">${fmt(r.totalAmount)}</td>
                    <td style="text-align:right;color:${(r.balanceAfterDisbursement ?? 0) < 0 ? '#e74c3c' : '#27ae60'}">${fmt(r.balanceAfterDisbursement)}</td>
                    <td>${STATUS_LABELS[r.status] || r.status}</td>
                    <td>${r.disbursedBy || '–'}</td>
                    <td>${fmtDate(r.disbursedAt)}</td>
                    <td>${r.motif || '–'}</td>
                </tr>`;
        }).join('');

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
        <title>Rapport Découverts</title>
        <style>
            body{font-family:Arial,sans-serif;margin:20px;font-size:10px}
            .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1e3a5f;padding-bottom:12px;margin-bottom:16px}
            .logo-area{display:flex;align-items:center;gap:10px}
            .co-name{font-size:15px;font-weight:bold;color:#1e3a5f;margin:0}
            .co-sub{font-size:9px;color:#64748b;margin:2px 0 0}
            .doc-title{font-size:13px;font-weight:bold;color:#1e3a5f}
            .stats{display:flex;gap:12px;margin-bottom:16px}
            .stat{flex:1;padding:10px;border-radius:6px;text-align:center}
            .stat-blue{background:#dbeafe;border:1px solid #93c5fd}
            .stat-green{background:#dcfce7;border:1px solid #86efac}
            .stat-orange{background:#ffedd5;border:1px solid #fdba74}
            .stat-red{background:#fee2e2;border:1px solid #fca5a5}
            .stat-purple{background:#ede9fe;border:1px solid #c4b5fd}
            .stat-indigo{background:#e0e7ff;border:1px solid #a5b4fc}
            .stat label{display:block;font-size:8px;color:#64748b;margin-bottom:3px}
            .stat strong{font-size:12px;color:#1e3a5f}
            table{width:100%;border-collapse:collapse;margin-top:8px}
            th{background:#1e3a5f;color:#fff;padding:5px 4px;text-align:left;font-size:9px}
            td{border-bottom:1px solid #e2e8f0;padding:4px;font-size:9px}
            tr:nth-child(even){background:#f8fafc}
            .footer{margin-top:24px;text-align:center;font-size:9px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px}
            @media print{body{margin:0}}
        </style></head><body>
        <div class="header">
            <div class="logo-area">
                <img src="/layout/images/logo/logoAgrinova.PNG" alt="" style="height:55px;object-fit:contain"/>
                <div><p class="co-name">AgrM MICROFINANCE</p><p class="co-sub">Bujumbura, Burundi</p></div>
            </div>
            <div style="text-align:right">
                <div class="doc-title">Rapport des Découverts – Avances sur Épargne</div>
                <p style="font-size:9px;color:#64748b;margin-top:4px">${dateRange}</p>
                ${statusFilter ? `<p style="font-size:9px;color:#64748b;margin:0">Statut : ${STATUS_LABELS[statusFilter] || statusFilter}</p>` : ''}
            </div>
        </div>
        <div class="stats">
            <div class="stat stat-blue"><label>Total Demandes</label><strong>${totalDemandes}</strong></div>
            <div class="stat stat-green"><label>Décaissés</label><strong>${totalDisbursed}</strong></div>
            <div class="stat stat-orange"><label>En Cours</label><strong>${totalPending}</strong></div>
            <div class="stat stat-red"><label>Rejetés/Annulés</label><strong>${totalRejected}</strong></div>
            <div class="stat stat-purple"><label>Principal Décaissé</label><strong>${fmt(totalPrincipal)}</strong></div>
            <div class="stat stat-indigo"><label>Intérêts Perçus</label><strong>${fmt(totalInteret)}</strong></div>
        </div>
        <table>
            <thead><tr>
                <th>N° Demande</th><th>Date</th><th>Client/Groupe</th><th>Agence</th>
                <th>Principal</th><th>Intérêts</th><th>Total Débité</th><th>Solde Après</th>
                <th>Statut</th><th>Décaissé par</th><th>Date Décaissement</th><th>Motif</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <p class="footer">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} · Total débité (décaissés) : ${fmt(totalDebite)}</p>
        </body></html>`;

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(html);
            win.document.close();
            win.focus();
            setTimeout(() => { win.print(); }, 300);
        }
        toast.current?.show({ severity: 'success', summary: 'PDF', detail: 'Document prêt pour impression / enregistrement PDF', life: 3000 });
    };

    const exportToExcel = () => {
        if (!generated || filtered.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter', life: 3000 });
            return;
        }

        const headers = [
            'N° Demande', 'Date Demande', 'Client / Groupe', 'Agence', 'Compte Épargne',
            'Principal (FBU)', 'Intérêts (FBU)', 'Total Débité (FBU)', 'Solde Après (FBU)',
            'Statut', 'Vérifié par', 'Approuvé par', 'Décaissé par', 'Date Décaissement', 'Motif',
        ];

        const rows = filtered.map(r => {
            const client = r.client
                ? `${r.client.firstName || ''} ${r.client.lastName || ''}`.trim()
                : r.solidarityGroup?.groupName ?? `Cpte #${r.savingsAccountId}`;
            return [
                r.requestNumber || '',
                r.requestDate   || '',
                client,
                r.branch?.name  || '',
                r.savingsAccountId || '',
                String(r.requestedAmount || 0),
                String(r.interestAmount  || 0),
                String(r.totalAmount     || 0),
                String(r.balanceAfterDisbursement ?? ''),
                STATUS_LABELS[r.status] || r.status || '',
                r.verifiedBy   || '',
                r.approvedBy   || '',
                r.disbursedBy  || '',
                r.disbursedAt  ? new Date(r.disbursedAt).toLocaleDateString('fr-FR') : '',
                r.motif || '',
            ];
        });

        let csv = '﻿' + headers.join(';') + '\n';
        rows.forEach(row => { csv += row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';') + '\n'; });
        csv += `\n"Total décaissés";"${totalDisbursed}";;;;"${totalPrincipal}";"${totalInteret}";"${totalDebite}";;;;;;;\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport_decouvert_${formatLocalDate(new Date())}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        toast.current?.show({ severity: 'success', summary: 'Excel', detail: 'Fichier CSV téléchargé', life: 3000 });
    };

    // ── Column templates ────────────────────────────────────────────────────
    const clientBody = (r: any) => {
        if (r.client) return `${r.client.firstName || ''} ${r.client.lastName || ''}`.trim();
        if (r.solidarityGroup) return r.solidarityGroup.groupName;
        return `Cpte #${r.savingsAccountId}`;
    };

    const statusBody = (r: any) => (
        <Tag value={STATUS_LABELS[r.status] || r.status} severity={STATUS_SEVERITY[r.status] ?? 'info'} />
    );

    const amountBody = (r: any) => (
        <span className="font-semibold" style={{ color: '#2980b9' }}>{fmt(r.requestedAmount)}</span>
    );

    const interetBody = (r: any) => (
        <span style={{ color: '#e74c3c' }}>{fmt(r.interestAmount)}</span>
    );

    const totalBody = (r: any) => (
        <span className="font-bold" style={{ color: '#1e3a5f' }}>{fmt(r.totalAmount)}</span>
    );

    const balanceBody = (r: any) => r.balanceAfterDisbursement != null ? (
        <span className="font-semibold"
            style={{ color: r.balanceAfterDisbursement < 0 ? '#e74c3c' : '#27ae60' }}>
            {fmt(r.balanceAfterDisbursement)}
        </span>
    ) : <span className="text-400">–</span>;

    const hasData = generated && filtered.length > 0;

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-3">
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'linear-gradient(135deg,#1e3a5f 0%,#2980b9 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <i className="pi pi-arrow-circle-down" style={{ color: '#fff', fontSize: '1.4rem' }} />
                    </div>
                    <div>
                        <h2 className="m-0 text-xl font-bold" style={{ color: '#1e3a5f' }}>
                            Rapport des Découverts
                        </h2>
                        <p className="m-0 text-500 text-sm">Avances sur épargne · Intérêts 5% prélevés immédiatement</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" size="small"
                        onClick={exportToPdf} disabled={!hasData} />
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" size="small"
                        onClick={exportToExcel} disabled={!hasData} />
                </div>
            </div>

            <Divider />

            {/* ── Filters ─────────────────────────────────────────────────── */}
            <Card className="mb-4" style={{ border: '1px solid #e2e8f0' }}>
                <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-filter text-primary" />
                    <span className="font-semibold text-primary">Critères de Filtrage</span>
                </div>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label className="font-medium block mb-1">Date début</label>
                        <Calendar value={dateFrom} onChange={e => setDateFrom(e.value as Date)}
                            dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                            placeholder="Toutes dates" />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label className="font-medium block mb-1">Date fin</label>
                        <Calendar value={dateTo} onChange={e => setDateTo(e.value as Date)}
                            dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                            placeholder="Toutes dates" />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label className="font-medium block mb-1">Statut</label>
                        <Dropdown value={statusFilter} options={STATUS_OPTIONS}
                            onChange={e => setStatusFilter(e.value)}
                            placeholder="Tous les statuts" showClear className="w-full" />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label className="font-medium block mb-1">Agence</label>
                        <Dropdown value={branchId} options={branches}
                            onChange={e => setBranchId(e.value)}
                            optionLabel="name" optionValue="id"
                            placeholder="Toutes les agences" showClear className="w-full" />
                    </div>
                </div>
                <div className="flex justify-content-end mt-2">
                    <Button label="Générer le Rapport" icon="pi pi-search"
                        onClick={generateReport} loading={loading}
                        style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#2980b9 100%)', border: 'none' }} />
                </div>
            </Card>

            {/* ── Stats cards ─────────────────────────────────────────────── */}
            {hasData && (
                <div className="grid mb-4">
                    {[
                        { icon: 'pi-hashtag',     bg: '#dbeafe', ic: '#2563eb', label: 'Total Demandes',     val: totalDemandes,  isNum: true },
                        { icon: 'pi-check-circle', bg: '#dcfce7', ic: '#16a34a', label: 'Décaissés',         val: totalDisbursed, isNum: true },
                        { icon: 'pi-clock',        bg: '#ffedd5', ic: '#ea580c', label: 'En Cours',           val: totalPending,   isNum: true },
                        { icon: 'pi-times-circle', bg: '#fee2e2', ic: '#dc2626', label: 'Rejetés / Annulés', val: totalRejected,  isNum: true },
                        { icon: 'pi-money-bill',   bg: '#ede9fe', ic: '#7c3aed', label: 'Principal Décaissé',val: totalPrincipal, isNum: false },
                        { icon: 'pi-percentage',   bg: '#fef9c3', ic: '#ca8a04', label: 'Intérêts Perçus',   val: totalInteret,   isNum: false },
                    ].map((s, i) => (
                        <div key={i} className="col-12 md:col-2">
                            <div className="p-3 border-round-lg shadow-1"
                                style={{ background: s.bg, border: `1px solid ${s.ic}30` }}>
                                <div className="flex align-items-center gap-2 mb-2">
                                    <i className={`pi ${s.icon}`} style={{ color: s.ic, fontSize: '1.2rem' }} />
                                    <span className="text-xs font-medium" style={{ color: '#475569' }}>{s.label}</span>
                                </div>
                                <div className="font-bold" style={{ color: s.ic, fontSize: s.isNum ? '1.6rem' : '1rem' }}>
                                    {s.isNum ? s.val : fmt(s.val as number)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Table ───────────────────────────────────────────────────── */}
            {!generated ? (
                <div className="flex flex-column align-items-center justify-content-center p-6"
                    style={{ background: '#f8fafc', borderRadius: 12, border: '2px dashed #cbd5e1' }}>
                    <i className="pi pi-chart-bar text-4xl text-300 mb-3" />
                    <p className="text-500 m-0">Sélectionnez vos critères et cliquez sur <strong>Générer le Rapport</strong></p>
                </div>
            ) : (
                <DataTable
                    value={filtered}
                    paginator rows={15}
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    loading={loading}
                    emptyMessage="Aucun découvert ne correspond aux critères sélectionnés."
                    className="p-datatable-sm"
                    stripedRows
                    showGridlines
                    style={{ fontSize: '0.875rem' }}
                    footer={hasData ? (
                        <div className="flex gap-4 flex-wrap">
                            <span>Total lignes : <strong>{filtered.length}</strong></span>
                            <span>Principal décaissé : <strong style={{ color: '#2980b9' }}>{fmt(totalPrincipal)}</strong></span>
                            <span>Intérêts : <strong style={{ color: '#e74c3c' }}>{fmt(totalInteret)}</strong></span>
                            <span>Total débité : <strong style={{ color: '#1e3a5f' }}>{fmt(totalDebite)}</strong></span>
                        </div>
                    ) : undefined}
                >
                    <Column field="requestNumber" header="N° Demande" sortable style={{ minWidth: '130px' }} />
                    <Column field="requestDate"   header="Date"       sortable style={{ minWidth: '100px' }}
                        body={(r: any) => fmtDate(r.requestDate)} />
                    <Column header="Client / Groupe" body={clientBody} style={{ minWidth: '160px' }} />
                    <Column header="Agence" body={(r: any) => r.branch?.name ?? '–'} style={{ minWidth: '100px' }} />
                    <Column header="Principal"     body={amountBody} sortable field="requestedAmount" style={{ minWidth: '120px' }} />
                    <Column header="Intérêts (5%)" body={interetBody} sortable field="interestAmount" style={{ minWidth: '110px' }} />
                    <Column header="Total Débité"  body={totalBody}  sortable field="totalAmount"     style={{ minWidth: '120px' }} />
                    <Column header="Solde Après"   body={balanceBody} sortable field="balanceAfterDisbursement" style={{ minWidth: '120px' }} />
                    <Column header="Statut"        body={statusBody} sortable field="status"          style={{ minWidth: '110px' }} />
                    <Column field="userAction"  header="Créé par"     sortable style={{ minWidth: '130px' }} />
                    <Column field="disbursedBy" header="Décaissé par" sortable style={{ minWidth: '130px' }}
                        body={(r: any) => r.disbursedBy ?? '–'} />
                    <Column header="Date Décaissement" sortable field="disbursedAt" style={{ minWidth: '130px' }}
                        body={(r: any) => fmtDate(r.disbursedAt)} />
                    <Column field="motif" header="Motif" style={{ minWidth: '150px' }}
                        body={(r: any) => <span className="text-500 text-sm">{r.motif || '–'}</span>} />
                </DataTable>
            )}
        </div>
    );
}
