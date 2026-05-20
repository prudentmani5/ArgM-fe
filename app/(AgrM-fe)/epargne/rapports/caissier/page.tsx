'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';
import { formatLocalDate } from '@/utils/dateUtils';

const REPORTS_URL  = `${API_BASE_URL}/api/epargne/reports`;
const USERS_URL    = `${API_BASE_URL}/api/users`;
const CAISSES_URL  = `${API_BASE_URL}/api/comptability/caisses/findall`;
const VIRT_URL     = `${API_BASE_URL}/api/epargne/virements`;
const CARNET_URL   = `${API_BASE_URL}/api/epargne/checkbook-orders`;
const STMT_URL     = `${API_BASE_URL}/api/epargne/statement-requests`;

const fmt = (v: number) =>
    new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(v || 0) + ' FBU';

const statusSeverity = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
    const u = (s || '').toUpperCase();
    if (['COMPLETED', 'VALIDATED', 'DISBURSED', 'DELIVERED', 'RECEIVED'].includes(u)) return 'success';
    if (['PENDING', 'PROCESSING'].includes(u)) return 'warning';
    if (['CANCELLED', 'REJECTED'].includes(u)) return 'danger';
    return 'info';
};

const statusLabel: Record<string, string> = {
    PENDING: 'En attente', PROCESSING: 'En cours', COMPLETED: 'Validé',
    VALIDATED: 'Validé', DISBURSED: 'Décaissé', DELIVERED: 'Livré',
    RECEIVED: 'Reçu', CANCELLED: 'Annulé', REJECTED: 'Rejeté'
};

const RapportCaissierPage = () => {
    const toast = useRef<Toast>(null);

    // ── filters ──
    const [dateFrom, setDateFrom]       = useState<Date | null>(null);
    const [dateTo,   setDateTo]         = useState<Date | null>(null);
    const [caissiers, setCaissiers]     = useState<any[]>([]);
    const [allUsers,  setAllUsers]      = useState<any[]>([]);
    const [loadedCaisses, setLoadedCaisses] = useState<any[]>([]);
    const [selectedCaissier, setSelectedCaissier] = useState<any | null>(null);

    // ── results ──
    const [depots,    setDepots]    = useState<any[]>([]);
    const [retraits,  setRetraits]  = useState<any[]>([]);
    const [virements, setVirements] = useState<any[]>([]);
    const [carnets,   setCarnets]   = useState<any[]>([]);
    const [statements,setStatements]= useState<any[]>([]);
    const [generated, setGenerated] = useState(false);
    const [loading,   setLoading]   = useState(false);

    // ── hooks ──
    const usersApi    = useConsumApi('');
    const caissesApi  = useConsumApi('');
    const depositApi  = useConsumApi('');
    const withdrawApi = useConsumApi('');
    const vireApi     = useConsumApi('');
    const carnetApi   = useConsumApi('');
    const stmtApi     = useConsumApi('');

    // ── load caissiers and caisses on mount ──
    useEffect(() => {
        usersApi.fetchData(null, 'GET', USERS_URL, 'loadUsers');
        caissesApi.fetchData(null, 'GET', CAISSES_URL, 'loadCaisses');
    }, []);

    useEffect(() => {
        if (usersApi.data) {
            const all = Array.isArray(usersApi.data) ? usersApi.data : [];
            setAllUsers(all);
            setCaissiers(all.filter((u: any) => u.roleName?.toLowerCase().includes('caissier') && u.enabled));
        }
    }, [usersApi.data]);

    useEffect(() => {
        if (caissesApi.data) {
            const list = Array.isArray(caissesApi.data) ? caissesApi.data : [];
            setLoadedCaisses(list);
        }
    }, [caissesApi.data]);

    // ── pending counter to detect when all 5 loads finished ──
    const pendingRef = useRef(0);
    const finishOne = () => {
        pendingRef.current -= 1;
        if (pendingRef.current <= 0) setLoading(false);
    };

    // ── handle responses ──
    useEffect(() => {
        if (!depositApi.data && !depositApi.error) return;
        if (depositApi.data) {
            const raw = Array.isArray(depositApi.data) ? depositApi.data : (depositApi.data.data || []);
            const all = Array.isArray(raw) ? raw : [];
            setDepots(all.filter((r: any) => matchesCaissier(r.userAction, selectedCaissier)));
        }
        finishOne();
    }, [depositApi.data, depositApi.error]);

    useEffect(() => {
        if (!withdrawApi.data && !withdrawApi.error) return;
        if (withdrawApi.data) {
            const raw = Array.isArray(withdrawApi.data) ? withdrawApi.data : (withdrawApi.data.data || []);
            const all = Array.isArray(raw) ? raw : [];
            setRetraits(all.filter((r: any) => matchesCaissier(r.userAction, selectedCaissier)));
        }
        finishOne();
    }, [withdrawApi.data, withdrawApi.error]);

    useEffect(() => {
        if (!vireApi.data && !vireApi.error) return;
        if (vireApi.data) {
            const raw = Array.isArray(vireApi.data) ? vireApi.data : (vireApi.data.data || vireApi.data.content || []);
            setVirements(filterByDate(raw, dateFrom, dateTo, 'dateVirement').filter((r: any) => ['userAction', 'validatedBy', 'createdBy'].some(f => matchesCaissier(r[f], selectedCaissier))));
        }
        finishOne();
    }, [vireApi.data, vireApi.error]);

    useEffect(() => {
        if (!carnetApi.data && !carnetApi.error) return;
        if (carnetApi.data) {
            const raw = Array.isArray(carnetApi.data) ? carnetApi.data : (carnetApi.data.content || carnetApi.data.data || []);
            setCarnets(filterByDate(raw, dateFrom, dateTo, 'orderDate').filter((r: any) => ['userAction', 'validatedBy'].some(f => matchesCaissier(r[f], selectedCaissier))));
        }
        finishOne();
    }, [carnetApi.data, carnetApi.error]);

    useEffect(() => {
        if (!stmtApi.data && !stmtApi.error) return;
        if (stmtApi.data) {
            const raw = Array.isArray(stmtApi.data) ? stmtApi.data : (stmtApi.data.content || stmtApi.data.data || []);
            setStatements(filterByDate(raw, dateFrom, dateTo, 'requestDate').filter((r: any) => ['userAction', 'validatedBy'].some(f => matchesCaissier(r[f], selectedCaissier))));
        }
        finishOne();
    }, [stmtApi.data, stmtApi.error]);

    // ── helpers ──
    const filterByCaissier = (items: any[], email: string | undefined, fields: string[]) => {
        if (!email) return items;
        return items.filter(item => fields.some(f => item[f] && item[f].toLowerCase() === email.toLowerCase()));
    };

    const filterByDate = (items: any[], from: Date | null, to: Date | null, dateField: string) => {
        if (!from && !to) return items;
        return items.filter(item => {
            const d = item[dateField] ? new Date(item[dateField]) : null;
            if (!d) return false;
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
        });
    };

    const toISO = (d: Date | null) => d ? formatLocalDate(d) : '';

    const getCaisseForRow = (row: any) =>
        row.compteComptable ? `${row.compteComptable}${row.codeCaisse ? ' - ' + row.codeCaisse : ''}` : '-';

    // Match userAction against selected caissier — handles email, full name, and email-as-name formats
    const matchesCaissier = (userAction: string, caissier: any) => {
        if (!caissier || !userAction) return false;
        const ua = userAction.toLowerCase().trim();
        const email = (caissier.email || '').toLowerCase().trim();
        const fullName = `${caissier.firstname || ''} ${caissier.lastname || ''}`.toLowerCase().trim();
        const emailAsName = email.replace(/\./g, ' ');
        return ua === email || ua === fullName || ua === emailAsName;
    };

    // ── generate ──
    const generate = () => {
        if (!selectedCaissier) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner un caissier', life: 3000 });
            return;
        }
        setLoading(true);
        setGenerated(false);
        pendingRef.current = 5;

        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', toISO(dateFrom));
        if (dateTo)   params.append('dateTo',   toISO(dateTo));
        const qs = params.toString() ? `?${params}` : '';

        depositApi.fetchData(null,  'GET', `${REPORTS_URL}/deposits${qs}`,    'dep');
        withdrawApi.fetchData(null, 'GET', `${REPORTS_URL}/withdrawals${qs}`, 'wit');
        vireApi.fetchData(null,     'GET', `${VIRT_URL}/findall`,             'vir');
        carnetApi.fetchData(null,   'GET', `${CARNET_URL}/findall`,           'car');
        stmtApi.fetchData(null,     'GET', `${STMT_URL}/findall`,             'stm');

        setGenerated(true);
    };

    // ── totals ──
    const sumField = (arr: any[], ...fields: string[]) =>
        arr.reduce((s, r) => {
            const v = fields.map(f => Number(r[f] || 0)).find(n => n > 0) ?? 0;
            return s + v;
        }, 0);

    const totalDepots    = sumField(depots,    'totalAmount', 'amount');
    const totalRetraits  = sumField(retraits,  'disbursedAmount', 'requestedAmount');
    const totalVirements = sumField(virements, 'montant', 'amount');
    const totalCarnets   = sumField(carnets,   'totalAmount', 'feeAmount');
    const totalStatements= sumField(statements,'feeAmount');

    // ── print ──
    const printReport = () => {
        const caissierName = selectedCaissier ? `${selectedCaissier.firstname} ${selectedCaissier.lastname}` : '';
        const dateRange = dateFrom && dateTo
            ? `Du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}`
            : 'Toutes les dates';

        const buildTable = (headers: string[], rows: string[][]) => `
            <table>
                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>`;

        const depRows = depots.map(r => [r.slipNumber || '-', r.depositDate || '-', r.clientName || '-', r.accountNumber || '-', fmt(r.totalAmount || r.amount || 0), statusLabel[r.status] || r.status || '-']);
        const witRows = retraits.map(r => [r.requestNumber || '-', r.requestDate || '-', r.clientName || '-', r.accountNumber || '-', fmt(r.disbursedAmount || r.requestedAmount || 0), statusLabel[r.status] || r.status || '-']);
        const virRows = virements.map(r => [r.reference || '-', r.dateVirement || '-', r.sourceClientName || '-', r.destinationClientName || '-', fmt(r.montant || 0), statusLabel[r.status] || r.status || '-']);
        const carRows = carnets.map(r => [r.orderNumber || '-', r.orderDate || '-', r.clientName || '-', String(r.numberOfLeaves || '-'), fmt(r.totalAmount || 0), statusLabel[r.status] || r.status || '-']);
        const stmRows = statements.map(r => [r.requestNumber || '-', r.requestDate || '-', r.requestType || '-', r.clientName || '-', fmt(r.feeAmount || 0), statusLabel[r.status] || r.status || '-']);

        const html = `<!DOCTYPE html><html><head><title>Rapport Caissier</title>
        <style>
            body{font-family:Arial,sans-serif;margin:20px;font-size:11px}
            .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1e3a8a;padding-bottom:10px;margin-bottom:20px}
            .company{font-size:16px;font-weight:bold;color:#1e3a8a}
            .section{margin-bottom:25px}
            .section-title{background:#1e3a8a;color:#fff;padding:6px 12px;font-weight:bold;font-size:12px;margin-bottom:8px;border-radius:4px}
            .stats{display:flex;gap:15px;margin-bottom:20px;flex-wrap:wrap}
            .stat{background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 15px;text-align:center;flex:1;min-width:120px}
            .stat-val{font-size:14px;font-weight:bold;color:#1e3a8a}
            table{width:100%;border-collapse:collapse;font-size:10px;margin-bottom:5px}
            th{background:#1e3a8a;color:#fff;padding:5px 6px;text-align:left}
            td{border:1px solid #ddd;padding:4px 6px}
            tr:nth-child(even){background:#f9fafb}
            .footer{margin-top:20px;text-align:center;font-size:9px;color:#999;border-top:1px solid #eee;padding-top:8px}
            @media print{body{margin:0}}
        </style></head><body>
        <div class="header">
            <div>
                <img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style="height:55px;width:55px;object-fit:contain;vertical-align:middle;margin-right:10px"/>
                <span class="company">AGRINOVA MICROFINANCE</span>
                <p style="margin:2px 0 0 65px;font-size:9px;color:#666">Bujumbura, Burundi | Tél: +257 22 69 21 01 93</p>
            </div>
            <div style="text-align:right">
                <div style="font-size:14px;font-weight:bold;color:#1e3a8a">RAPPORT CAISSIER</div>
                <div style="font-size:11px;margin-top:4px">Caissier: <strong>${caissierName}</strong></div>
                <div style="font-size:10px;color:#666">${dateRange}</div>
            </div>
        </div>
        <div class="stats">
            <div class="stat"><div style="font-size:9px;color:#666">Dépôts</div><div class="stat-val">${depots.length}</div><div style="font-size:9px">${fmt(totalDepots)}</div></div>
            <div class="stat"><div style="font-size:9px;color:#666">Retraits</div><div class="stat-val">${retraits.length}</div><div style="font-size:9px">${fmt(totalRetraits)}</div></div>
            <div class="stat"><div style="font-size:9px;color:#666">Virements</div><div class="stat-val">${virements.length}</div><div style="font-size:9px">${fmt(totalVirements)}</div></div>
            <div class="stat"><div style="font-size:9px;color:#666">Carnets</div><div class="stat-val">${carnets.length}</div><div style="font-size:9px">${fmt(totalCarnets)}</div></div>
            <div class="stat"><div style="font-size:9px;color:#666">Situation/Hist.</div><div class="stat-val">${statements.length}</div><div style="font-size:9px">${fmt(totalStatements)}</div></div>
        </div>
        ${depots.length > 0 ? `<div class="section"><div class="section-title">DÉPÔTS (${depots.length})</div>${buildTable(['N°Bordereau','Date','Client','N°Compte','Montant','Statut'],depRows)}</div>` : ''}
        ${retraits.length > 0 ? `<div class="section"><div class="section-title">RETRAITS (${retraits.length})</div>${buildTable(['N°Demande','Date','Client','N°Compte','Montant','Statut'],witRows)}</div>` : ''}
        ${virements.length > 0 ? `<div class="section"><div class="section-title">VIREMENTS (${virements.length})</div>${buildTable(['Référence','Date','Source','Destination','Montant','Statut'],virRows)}</div>` : ''}
        ${carnets.length > 0 ? `<div class="section"><div class="section-title">CARNETS DE CHÈQUES (${carnets.length})</div>${buildTable(['N°Commande','Date','Client','Nbre Feuillets','Montant','Statut'],carRows)}</div>` : ''}
        ${statements.length > 0 ? `<div class="section"><div class="section-title">SITUATION / HISTORIQUE (${statements.length})</div>${buildTable(['N°Demande','Date','Type','Client','Frais','Statut'],stmRows)}</div>` : ''}
        <div class="footer">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} — AGRINOVA MICROFINANCE</div>
        </body></html>`;

        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 300); }
    };

    // ── templates ──
    const statusTpl = (row: any, field: string = 'status') => (
        <Tag value={statusLabel[row[field]] || row[field] || '-'} severity={statusSeverity(row[field])} />
    );
    const amountTpl = (v: number) => <span className="font-bold text-primary">{fmt(v)}</span>;

    const tabHeader = (label: string, count: number, icon: string) => (
        <span className="flex align-items-center gap-2">
            <i className={icon}></i>{label}
            {generated && <Badge value={count} severity={count > 0 ? 'info' : 'secondary'} />}
        </span>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-3">
                    <div className="bg-primary border-circle flex align-items-center justify-content-center" style={{ width: '3rem', height: '3rem' }}>
                        <i className="pi pi-user text-white text-xl"></i>
                    </div>
                    <div>
                        <h2 className="m-0">Rapport par Caissier</h2>
                        <p className="m-0 text-500">Toutes les opérations effectuées par un caissier</p>
                    </div>
                </div>
                {generated && (
                    <Button label="Imprimer / PDF" icon="pi pi-print" severity="danger" onClick={printReport} disabled={loading} />
                )}
            </div>

            <Divider />

            {/* Filtres */}
            <Card className="mb-4">
                <h5 className="m-0 mb-3"><i className="pi pi-filter mr-2"></i>Critères de Recherche</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label>Caissier <span className="text-red-500">*</span></label>
                        <Dropdown
                            value={selectedCaissier}
                            options={caissiers}
                            onChange={e => setSelectedCaissier(e.value)}
                            optionLabel={(u) => `${u.firstname} ${u.lastname} (${u.email})`}
                            placeholder="Sélectionner un caissier"
                            className="w-full"
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label>Date Début</label>
                        <Calendar value={dateFrom} onChange={e => setDateFrom(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label>Date Fin</label>
                        <Calendar value={dateTo} onChange={e => setDateTo(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                    </div>
                    <div className="field col-12 md:col-3 flex align-items-end">
                        <Button
                            label="Générer le Rapport"
                            icon="pi pi-search"
                            onClick={generate}
                            loading={loading}
                            disabled={!selectedCaissier}
                            className="w-full"
                        />
                    </div>
                </div>
            </Card>

            {/* Résumé stats */}
            {generated && !loading && (
                <div className="grid mb-4">
                    {[
                        { label: 'Dépôts',            count: depots.length,     total: totalDepots,     icon: 'pi pi-arrow-down', color: 'green' },
                        { label: 'Retraits',          count: retraits.length,   total: totalRetraits,   icon: 'pi pi-arrow-up',   color: 'red'   },
                        { label: 'Virements',         count: virements.length,  total: totalVirements,  icon: 'pi pi-arrows-h',   color: 'blue'  },
                        { label: 'Carnets',           count: carnets.length,    total: totalCarnets,    icon: 'pi pi-book',       color: 'orange'},
                        { label: 'Situation/Hist.',   count: statements.length, total: totalStatements, icon: 'pi pi-file',       color: 'purple'},
                    ].map(s => (
                        <div key={s.label} className="col-12 md:col-2" style={{ flex: '1 1 0' }}>
                            <Card>
                                <div className="flex align-items-center gap-2 mb-1">
                                    <i className={`${s.icon} text-${s.color}-500`}></i>
                                    <span className="text-500 text-sm">{s.label}</span>
                                </div>
                                <div className={`text-2xl font-bold text-${s.color}-600`}>{s.count}</div>
                                <div className="text-xs text-500 mt-1">{fmt(s.total)}</div>
                            </Card>
                        </div>
                    ))}
                </div>
            )}

            {/* Résultats */}
            {loading ? (
                <div className="flex justify-content-center p-5"><ProgressSpinner /></div>
            ) : generated && (
                <TabView>
                    {/* ─── Dépôts ─── */}
                    <TabPanel header={tabHeader('Dépôts', depots.length, 'pi pi-arrow-down mr-1')}>
                        <DataTable value={depots} paginator rows={15} rowsPerPageOptions={[15, 30, 50]}
                            emptyMessage="Aucun dépôt pour ce caissier" stripedRows className="p-datatable-sm">
                            <Column field="slipNumber"  header="N° Bordereau" sortable />
                            <Column field="depositDate" header="Date"          sortable />
                            <Column field="clientName"  header="Client"        sortable />
                            <Column field="accountNumber" header="N° Compte"   sortable />
                            <Column header="Montant" sortable sortField="totalAmount"
                                body={(r: any) => amountTpl(r.totalAmount || r.amount || 0)} />
                            <Column header="Statut" body={(r: any) => statusTpl(r)} />
                            <Column header="Compte Caisse" body={(r: any) => <span className="font-semibold text-primary">{getCaisseForRow(r)}</span>} />
                            <Column field="userAction" header="Fait par" sortable />
                        </DataTable>
                        {depots.length > 0 && (
                            <div className="flex justify-content-end mt-2 text-sm font-bold text-green-700">
                                Total: {fmt(totalDepots)} — {depots.length} opération(s)
                            </div>
                        )}
                    </TabPanel>

                    {/* ─── Retraits ─── */}
                    <TabPanel header={tabHeader('Retraits', retraits.length, 'pi pi-arrow-up mr-1')}>
                        <DataTable value={retraits} paginator rows={15} rowsPerPageOptions={[15, 30, 50]}
                            emptyMessage="Aucun retrait pour ce caissier" stripedRows className="p-datatable-sm">
                            <Column field="requestNumber" header="N° Demande"  sortable />
                            <Column field="requestDate"   header="Date"        sortable />
                            <Column field="clientName"    header="Client"      sortable />
                            <Column field="accountNumber" header="N° Compte"   sortable />
                            <Column header="Montant" sortable sortField="disbursedAmount"
                                body={(r: any) => amountTpl(r.disbursedAmount || r.requestedAmount || 0)} />
                            <Column header="Statut" body={(r: any) => statusTpl(r)} />
                            <Column header="Compte Caisse" body={(r: any) => <span className="font-semibold text-primary">{getCaisseForRow(r)}</span>} />
                            <Column field="userAction" header="Fait par" sortable />
                        </DataTable>
                        {retraits.length > 0 && (
                            <div className="flex justify-content-end mt-2 text-sm font-bold text-red-700">
                                Total: {fmt(totalRetraits)} — {retraits.length} opération(s)
                            </div>
                        )}
                    </TabPanel>

                    {/* ─── Virements ─── */}
                    <TabPanel header={tabHeader('Virements', virements.length, 'pi pi-arrows-h mr-1')}>
                        <DataTable value={virements} paginator rows={15} rowsPerPageOptions={[15, 30, 50]}
                            emptyMessage="Aucun virement pour ce caissier" stripedRows className="p-datatable-sm">
                            <Column field="reference"             header="Référence"    sortable />
                            <Column field="dateVirement"          header="Date"         sortable />
                            <Column field="sourceClientName"      header="Source"       sortable />
                            <Column field="destinationClientName" header="Destination"  sortable />
                            <Column header="Montant" sortable sortField="montant"
                                body={(r: any) => amountTpl(r.montant || r.amount || 0)} />
                            <Column header="Statut" body={(r: any) => statusTpl(r)} />
                            <Column field="userAction" header="Fait par" sortable />
                        </DataTable>
                        {virements.length > 0 && (
                            <div className="flex justify-content-end mt-2 text-sm font-bold text-blue-700">
                                Total: {fmt(totalVirements)} — {virements.length} opération(s)
                            </div>
                        )}
                    </TabPanel>

                    {/* ─── Carnets de chèques ─── */}
                    <TabPanel header={tabHeader('Carnets de Chèques', carnets.length, 'pi pi-book mr-1')}>
                        <DataTable value={carnets} paginator rows={15} rowsPerPageOptions={[15, 30, 50]}
                            emptyMessage="Aucune demande carnet pour ce caissier" stripedRows className="p-datatable-sm">
                            <Column field="orderNumber"    header="N° Commande"  sortable />
                            <Column field="orderDate"      header="Date"         sortable />
                            <Column field="clientName"     header="Client"       sortable />
                            <Column field="accountNumber"  header="N° Compte"    sortable />
                            <Column field="numberOfLeaves" header="Nb Feuillets" sortable />
                            <Column header="Montant" sortable sortField="totalAmount"
                                body={(r: any) => amountTpl(r.totalAmount || r.feeAmount || 0)} />
                            <Column header="Statut" body={(r: any) => statusTpl(r)} />
                            <Column field="userAction" header="Fait par" sortable />
                        </DataTable>
                        {carnets.length > 0 && (
                            <div className="flex justify-content-end mt-2 text-sm font-bold text-orange-700">
                                Total Frais: {fmt(totalCarnets)} — {carnets.length} demande(s)
                            </div>
                        )}
                    </TabPanel>

                    {/* ─── Situation / Historique ─── */}
                    <TabPanel header={tabHeader('Situation / Historique', statements.length, 'pi pi-file mr-1')}>
                        <DataTable value={statements} paginator rows={15} rowsPerPageOptions={[15, 30, 50]}
                            emptyMessage="Aucune demande situation/historique pour ce caissier" stripedRows className="p-datatable-sm">
                            <Column field="requestNumber" header="N° Demande" sortable />
                            <Column field="requestDate"   header="Date"       sortable />
                            <Column field="requestType"   header="Type"       sortable
                                body={(r: any) => {
                                    const types: Record<string, string> = { SITUATION: 'Situation', HISTORIQUE: 'Historique', ATTESTATION: 'Attestation', ENGAGEMENT: 'Engagement' };
                                    return <Tag value={types[r.requestType] || r.requestType || '-'} severity="info" />;
                                }}
                            />
                            <Column field="clientName"    header="Client"     sortable />
                            <Column field="accountNumber" header="N° Compte"  sortable />
                            <Column header="Frais" sortable sortField="feeAmount"
                                body={(r: any) => amountTpl(r.feeAmount || 0)} />
                            <Column header="Statut" body={(r: any) => statusTpl(r)} />
                            <Column field="userAction" header="Fait par" sortable />
                        </DataTable>
                        {statements.length > 0 && (
                            <div className="flex justify-content-end mt-2 text-sm font-bold text-purple-700">
                                Total Frais: {fmt(totalStatements)} — {statements.length} demande(s)
                            </div>
                        )}
                    </TabPanel>
                </TabView>
            )}
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_RAPPORT_CAISSIER_VIEW']}>
            <RapportCaissierPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
