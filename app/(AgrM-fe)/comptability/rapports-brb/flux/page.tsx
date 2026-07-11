'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { CptExercice } from '../../types';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { fmt, fmtN, toIso, formatDate, tdBase, tdNum, thStyle } from '../_shared';

// Rubriques du Tableau 6 (BRB) — structure réglementaire.
// code : clé de la valeur dans report.flux (N) et report.fluxN1 (N-1).
interface FluxRow {
    kind: 'section' | 'detail' | 'total' | 'grand';
    code: string;
    label: string;
}

const FLUX_ROWS: FluxRow[] = [
    { kind: 'section', code: '1', label: "1 - Flux de trésorerie net provenant des activités opérationnelles" },
    { kind: 'detail', code: '1.1', label: "1.1 - Produits d'opération bancaire encaissés (hors revenus du portefeuille d'investissement)" },
    { kind: 'detail', code: '1.2', label: "1.2 - Charges d'opération bancaire décaissée" },
    { kind: 'detail', code: '1.3', label: "1.3 - Dépôts \\ Retraits sur dépôts auprès d'autres institutions bancaires et financières" },
    { kind: 'detail', code: '1.4', label: "1.4 - Prêts et avances \\ Remboursement prêts et avances accordés à la clientèle, au personnel et aux dirigeants" },
    { kind: 'detail', code: '1.5', label: "1.5 - Dépôts \\ Retraits sur dépôts de la clientèle" },
    { kind: 'detail', code: '1.6', label: "1.6 - Titres de placement" },
    { kind: 'detail', code: '1.7', label: "1.7 - Sommes versés au personnel et créditeurs divers" },
    { kind: 'detail', code: '1.8', label: "1.8 - Autres flux de trésorerie provenant des opérations" },
    { kind: 'detail', code: '1.9', label: "1.9 - Impôts sur les résultats" },
    { kind: 'section', code: '2', label: "2 - Flux de trésorerie net provenant des activités d'investissements" },
    { kind: 'detail', code: '2.1', label: "2.1 - Intérêts et dividendes encaissés sur les investissements" },
    { kind: 'detail', code: '2.2', label: "2.2 - Acquisitions \\ Cessions sur portefeuille d'investissement" },
    { kind: 'detail', code: '2.3', label: "2.3 - Acquisitions \\ Cessions d'immobilisations" },
    { kind: 'section', code: '3', label: "3 - Flux de trésorerie net provenant des activités de financement" },
    { kind: 'detail', code: '3.1', label: "3.1 - Emission de capital" },
    { kind: 'detail', code: '3.2', label: "3.2 - Emission d'emprunts" },
    { kind: 'detail', code: '3.3', label: "3.3 - Remboursement d'emprunts" },
    { kind: 'detail', code: '3.4', label: "3.4 - Augmentation \\ Diminution ressources spéciales" },
    { kind: 'detail', code: '3.5', label: "3.5 - Dividendes versés" },
    { kind: 'total', code: '4', label: "4 - Variation nette des liquidités et équivalents de liquidités au cours de la période (1+2+3)" },
    { kind: 'total', code: '5', label: "5 - Liquidités et équivalents de liquidités en début de la période" },
    { kind: 'grand', code: 'final', label: "Liquidités et équivalents de liquidités en fin de la période (4+5)" },
];

const BrbFluxReport: React.FC = () => {
    const toast = useRef<Toast>(null);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateFin, setDateFin] = useState<Date | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);
    const [report, setReport] = useState<any>(null);

    const { data, loading: jsonLoading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        const saved = Cookies.get('currentExercice');
        if (saved) { try { setCurrentExercice(JSON.parse(saved)); } catch {} }
    }, []);

    useEffect(() => {
        if (callType === 'brbFlux' && data) setReport(data);
        if (callType === 'brbFlux' && error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 4000 });
        }
    }, [data, error, callType]);

    const loadData = async (): Promise<any> => {
        if (!currentExercice) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucun exercice sélectionné', life: 3000 });
            return null;
        }
        if (!dateDebut || !dateFin) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner la période (début et fin)', life: 3000 });
            return null;
        }
        const params = new URLSearchParams();
        params.append('exerciceId', currentExercice.exerciceId);
        params.append('dateDebut', toIso(dateDebut));
        params.append('dateFin', toIso(dateFin));
        return await fetchData(null, 'GET', buildApiUrl(`/api/comptability/reports/brb/flux-json?${params.toString()}`), 'brbFlux');
    };

    const handleApercu = async () => { await loadData(); };

    const valN = (row: FluxRow, rp: any): number => rp?.flux?.[row.code] ?? 0;
    const valN1 = (row: FluxRow, rp: any): number => rp?.fluxN1?.[row.code] ?? 0;

    // ── PDF ────────────────────────────────────────────────────────────────────
    const buildPrintHtml = (rp: any): string => {
        const rowsHtml = FLUX_ROWS.map(r => {
            const cls = r.kind === 'section' ? 'sec' : r.kind === 'total' ? 'tot' : r.kind === 'grand' ? 'grand' : 'det';
            const n = valN(r, rp), n1 = valN1(r, rp);
            return `<tr class="${cls}"><td class="lbl">${r.label}</td><td class="num">${n != null ? fmtN(n) : ''}</td><td class="num">${n1 != null ? fmtN(n1) : ''}</td></tr>`;
        }).join('');
        return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Flux de trésorerie BRB ${rp.dateFin}</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 8pt; color:#222; }
  .hdr { display:flex; justify-content:space-between; background:#1a3a5c; color:#fff; padding:6pt 10pt; font-size:9.5pt; font-weight:700; margin-bottom:6pt; }
  .hdr .date { color:#90caf9; }
  table { width:100%; border-collapse:collapse; }
  th { background:#1a3a5c; color:#fff; border:.5pt solid #555; padding:4pt 6pt; font-size:7.5pt; font-weight:700; text-align:center; }
  th.left { text-align:left; }
  td { border:.5pt solid #c0c0c0; padding:3pt 6pt; font-size:7.2pt; }
  .lbl { text-align:left; } .num { text-align:right; white-space:nowrap; width:80pt; }
  tr.sec td { background:#dce8f8; font-weight:700; }
  tr.det .lbl { padding-left:16pt; }
  tr.tot td { background:#eef3fa; font-weight:700; }
  tr.grand td { background:#1a3a5c; color:#fff; font-weight:700; }
  .foot { margin-top:6pt; text-align:center; font-size:6.5pt; color:#888; }
</style></head><body>
<div class="hdr"><span>FLUX DE TRÉSORERIE BRB — Période : <span class="date">${rp.dateDebut} au ${rp.dateFin}</span></span><span>Exercice : ${rp.exerciceCode || ''}</span></div>
<table><thead><tr><th class="left">Rubriques</th><th>Montants N</th><th>Montants N-1</th></tr></thead><tbody>${rowsHtml}</tbody></table>
<div class="foot">Généré le ${new Date().toLocaleDateString('fr-FR')} — AgrM MicroCore ProFinance — Rapport réglementaire BRB</div>
</body></html>`;
    };

    const handlePdf = async () => {
        setLoadingPdf(true);
        try {
            const rp = report ?? await loadData();
            if (!rp) return;
            const win = window.open('', '_blank', 'width=1000,height=1100');
            if (!win) {
                toast.current?.show({ severity: 'warn', summary: 'Popups bloqués', detail: 'Autorisez les popups pour générer le PDF', life: 5000 });
                return;
            }
            win.document.write(buildPrintHtml(rp));
            win.document.close();
            win.focus();
            setTimeout(() => win.print(), 600);
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.message, life: 3000 });
        } finally { setLoadingPdf(false); }
    };

    // ── Excel ──────────────────────────────────────────────────────────────────
    const handleExcel = async () => {
        setLoadingExcel(true);
        try {
            const rp = report ?? await loadData();
            if (!rp) return;
            const XLSX = await import('xlsx');
            const rows: any[][] = [];
            rows.push([`FLUX DE TRÉSORERIE BRB — Période : ${rp.dateDebut} au ${rp.dateFin}`, '', `Exercice : ${rp.exerciceCode || ''}`]);
            rows.push([]);
            rows.push(['Rubriques', 'Montants N', 'Montants N-1']);
            FLUX_ROWS.forEach(r => {
                const n = valN(r, rp), n1 = valN1(r, rp);
                rows.push([r.label, n != null ? (n || null) : '', n1 != null ? (n1 || null) : '']);
            });
            const ws = XLSX.utils.aoa_to_sheet(rows);
            ws['!cols'] = [{ wch: 80 }, { wch: 18 }, { wch: 18 }];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Flux BRB');
            XLSX.writeFile(wb, `flux_tresorerie_brb_${(rp.dateFin || '').replace(/\//g, '-')}.xlsx`);
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Excel généré', life: 3000 });
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.message, life: 3000 });
        } finally { setLoadingExcel(false); }
    };

    const rowStyle = (kind: FluxRow['kind']): React.CSSProperties => {
        if (kind === 'section') return { backgroundColor: '#dce8f8', fontWeight: 'bold' };
        if (kind === 'total') return { backgroundColor: '#eef3fa', fontWeight: 'bold' };
        if (kind === 'grand') return { backgroundColor: '#1a3a5c', color: 'white', fontWeight: 'bold' };
        return {};
    };

    return (
        <div className="card p-3 mt-2">
            <Toast ref={toast} />

            <div className="card mb-3" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #2196F3' }}>
                <div className="flex align-items-center justify-content-between p-3">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-calendar text-2xl text-primary"></i>
                        <div>
                            <div className="font-bold text-lg">
                                {currentExercice
                                    ? <>Exercice: <span className="text-primary">{currentExercice.codeExercice}</span></>
                                    : <span className="text-orange-500">Aucun exercice sélectionné</span>}
                            </div>
                            {currentExercice && (
                                <div className="text-sm text-600">
                                    {currentExercice.description} — Du {formatDate(currentExercice.dateDebut)} au {formatDate(currentExercice.dateFin)}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button icon="pi pi-refresh" label="Actualiser" size="small" outlined onClick={() => {
                        const saved = Cookies.get('currentExercice');
                        if (saved) { try { setCurrentExercice(JSON.parse(saved)); } catch {} }
                    }} />
                </div>
            </div>

            <div className="card p-fluid mb-3">
                <h5><i className="pi pi-money-bill mr-2"></i>Rapport BRB — Flux de trésorerie (Tableau 6)</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="dd">Date début *</label>
                        <Calendar id="dd" value={dateDebut} onChange={(e) => setDateDebut(e.value as Date | null)}
                            dateFormat="dd/mm/yy" showIcon placeholder="Début de période" className="w-full" />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="df">Date fin *</label>
                        <Calendar id="df" value={dateFin} onChange={(e) => setDateFin(e.value as Date | null)}
                            dateFormat="dd/mm/yy" showIcon placeholder="Fin de période" className="w-full" />
                    </div>
                </div>
                <div className="flex gap-2 justify-content-end mt-2">
                    <Button icon="pi pi-eye" label="Aperçu" onClick={handleApercu} loading={jsonLoading} severity="info" outlined />
                    <Button icon="pi pi-print" label="Imprimer / PDF" onClick={handlePdf} loading={loadingPdf} severity="danger" />
                    <Button icon="pi pi-file-excel" label="Exporter Excel" onClick={handleExcel} loading={loadingExcel} severity="success" />
                </div>
            </div>

            {report && (
                <div className="card p-3">
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                        <tbody>
                            <tr style={{ backgroundColor: '#1a3a5c', color: 'white' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 'bold', fontSize: '0.95rem', width: '60%' }}>
                                    FLUX DE TRÉSORERIE BRB — Période : <span style={{ color: '#90caf9' }}>{report.dateDebut} au {report.dateFin}</span>
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: 'bold', fontSize: '0.95rem', textAlign: 'right' }}>
                                    Exercice : {report.exerciceCode}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>Rubriques</th>
                                    <th style={{ ...thStyle, width: '130px' }}>Montants N</th>
                                    <th style={{ ...thStyle, width: '130px' }}>Montants N-1</th>
                                </tr>
                            </thead>
                            <tbody>
                                {FLUX_ROWS.map((r, i) => {
                                    const n = valN(r, report), n1 = valN1(r, report);
                                    const st = rowStyle(r.kind);
                                    return (
                                        <tr key={i} style={st}>
                                            <td style={{ ...tdBase, ...st, paddingLeft: r.kind === 'detail' ? '22px' : '6px' }}>{r.label}</td>
                                            <td style={{ ...tdNum, ...st }}>{n != null ? fmt(n) : ''}</td>
                                            <td style={{ ...tdNum, ...st }}>{n1 != null ? fmt(n1) : ''}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-xs text-500 mt-2">
                        <i className="pi pi-info-circle mr-1"></i>
                        Méthode directe : chaque sous-rubrique correspond au mouvement (crédit − débit) des comptes rattachés sur la période.
                        La rubrique 1.8 « Autres flux » absorbe le résidu, de sorte que 1 + 2 + 3 = variation nette de trésorerie (Encaisse 10 + Dépôts à vue 111) et que le solde de clôture (4 + 5) est réconcilié.
                    </p>
                </div>
            )}
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_REPORT_VIEW']}>
            <BrbFluxReport />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
