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
import {
    BILAN_ACTIF, BILAN_PASSIF, BrbLine, BrbLines,
    fmt, fmtN, toIso, formatDate, sumDetail, tdBase, tdNum, tdCode, thStyle,
} from '../_shared';

const BrbBilanReport: React.FC = () => {
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
        if (callType === 'brbBilan' && data) setReport(data);
        if (callType === 'brbBilan' && error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 4000 });
        }
    }, [data, error, callType]);

    const lines: BrbLines = report?.lines ?? {};

    const loadData = async (): Promise<any> => {
        if (!currentExercice) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucun exercice sélectionné', life: 3000 });
            return null;
        }
        if (!dateFin) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner la date de fin de période', life: 3000 });
            return null;
        }
        const params = new URLSearchParams();
        params.append('exerciceId', currentExercice.exerciceId);
        if (dateDebut) params.append('dateDebut', toIso(dateDebut));
        params.append('dateFin', toIso(dateFin));
        return await fetchData(null, 'GET', buildApiUrl(`/api/comptability/reports/brb/bilan-json?${params.toString()}`), 'brbBilan');
    };

    const handleApercu = async () => { await loadData(); };

    const mkTot = (arr: BrbLine[]) => ({
        bifRes: sumDetail(arr, lines, 'bifRes'), bifNonRes: sumDetail(arr, lines, 'bifNonRes'),
        devRes: sumDetail(arr, lines, 'devRes'), devNonRes: sumDetail(arr, lines, 'devNonRes'),
        net: sumDetail(arr, lines, 'net'), netN1: sumDetail(arr, lines, 'netN1'),
    });
    const totActif = mkTot(BILAN_ACTIF);
    const totPassif = mkTot(BILAN_PASSIF);
    const equilibre = Math.round(totActif.net) === Math.round(totPassif.net);

    // ── Rendu ligne ──────────────────────────────────────────────────────────
    const renderRow = (line: BrbLine, idx: number, ld: BrbLines) => {
        if (line.type === 'classe') return (
            <tr key={idx} style={{ backgroundColor: '#dce8f8' }}>
                <td style={{ ...tdCode, fontWeight: 'bold' }}>{line.compte}</td>
                <td colSpan={7} style={{ ...tdBase, fontWeight: 'bold' }}>{line.libelle}</td>
            </tr>
        );
        if (line.type === 'groupe' || line.type === 'sous') return (
            <tr key={idx} style={{ backgroundColor: line.type === 'groupe' ? '#eef3fa' : '#f6f9fc' }}>
                <td style={{ ...tdCode, fontWeight: 'bold' }}>{line.compte}</td>
                <td colSpan={7} style={{ ...tdBase, fontStyle: 'italic', fontWeight: 'bold', paddingLeft: line.type === 'sous' ? '14px' : '6px' }}>{line.libelle}</td>
            </tr>
        );
        const c = ld[line.compte];
        return (
            <tr key={idx}>
                <td style={tdCode}>{line.compte}</td>
                <td style={{ ...tdBase, paddingLeft: '20px' }}>{line.libelle}</td>
                <td style={tdNum}>{fmt(c?.bifRes ?? 0)}</td>
                <td style={tdNum}>{fmt(c?.bifNonRes ?? 0)}</td>
                <td style={tdNum}>{fmt(c?.devRes ?? 0)}</td>
                <td style={tdNum}>{fmt(c?.devNonRes ?? 0)}</td>
                <td style={{ ...tdNum, fontWeight: 600 }}>{fmt(c?.net ?? 0)}</td>
                <td style={tdNum}>{fmt(c?.netN1 ?? 0)}</td>
            </tr>
        );
    };

    const renderHead = (label: string) => (
        <thead>
            <tr>
                <th style={thStyle} rowSpan={2}>Compte</th>
                <th style={{ ...thStyle, textAlign: 'left' }} rowSpan={2}>{label}</th>
                <th style={thStyle} colSpan={2}>BIF</th>
                <th style={thStyle} colSpan={2}>Devises (Contre-valeur BIF)</th>
                <th style={thStyle} rowSpan={2}>Montant net N</th>
                <th style={thStyle} rowSpan={2}>Montant net N-1</th>
            </tr>
            <tr>
                <th style={thStyle}>Résident</th>
                <th style={thStyle}>Non résident</th>
                <th style={thStyle}>Résident</th>
                <th style={thStyle}>Non résident</th>
            </tr>
        </thead>
    );

    const renderTotalRow = (label: string, t: { bifRes: number; bifNonRes: number; devRes: number; devNonRes: number; net: number; netN1: number }) => (
        <tr style={{ backgroundColor: '#1a3a5c', color: 'white', fontWeight: 'bold' }}>
            <td colSpan={2} style={{ ...tdBase, color: 'white', textAlign: 'right', backgroundColor: '#1a3a5c' }}>{label}</td>
            <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(t.bifRes)}</td>
            <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(t.bifNonRes)}</td>
            <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(t.devRes)}</td>
            <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(t.devNonRes)}</td>
            <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(t.net)}</td>
            <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(t.netN1)}</td>
        </tr>
    );

    // ── PDF (fenêtre d'impression) ─────────────────────────────────────────────
    const buildPrintHtml = (rp: any): string => {
        const ld: BrbLines = rp.lines ?? {};
        const rowsHtml = (arr: BrbLine[]) => arr.map(l => {
            if (l.type === 'classe') return `<tr class="cls"><td class="ctr">${l.compte}</td><td colspan="7" class="lbl">${l.libelle}</td></tr>`;
            if (l.type === 'groupe' || l.type === 'sous') return `<tr class="grp"><td class="ctr">${l.compte}</td><td colspan="7" class="lbl ${l.type === 'sous' ? 'ind' : ''}">${l.libelle}</td></tr>`;
            const c = ld[l.compte];
            return `<tr><td class="ctr">${l.compte}</td><td class="lbl ind2">${l.libelle}</td><td class="num">${fmtN(c?.bifRes ?? 0)}</td><td class="num">${fmtN(c?.bifNonRes ?? 0)}</td><td class="num">${fmtN(c?.devRes ?? 0)}</td><td class="num">${fmtN(c?.devNonRes ?? 0)}</td><td class="num b">${fmtN(c?.net ?? 0)}</td><td class="num">${fmtN(c?.netN1 ?? 0)}</td></tr>`;
        }).join('');
        const head = (label: string) => `<thead>
          <tr><th rowspan="2">Cpte</th><th rowspan="2" class="left">${label}</th>
              <th colspan="2">BIF</th><th colspan="2">Devises (C-V BIF)</th>
              <th rowspan="2">Net N</th><th rowspan="2">Net N-1</th></tr>
          <tr><th>Résident</th><th>Non rés.</th><th>Résident</th><th>Non rés.</th></tr></thead>`;
        const totRow = (label: string, t: any) => `<tr class="tot"><td colspan="2" style="text-align:right;padding-right:6pt">${label}</td>
            <td class="num">${fmtN(t.bifRes)}</td><td class="num">${fmtN(t.bifNonRes)}</td><td class="num">${fmtN(t.devRes)}</td><td class="num">${fmtN(t.devNonRes)}</td>
            <td class="num">${fmtN(t.net)}</td><td class="num">${fmtN(t.netN1)}</td></tr>`;
        return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Bilan BRB ${rp.dateFin}</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 7pt; color: #222; }
  .hdr { display:flex; justify-content:space-between; background:#1a3a5c; color:#fff; padding:5pt 10pt; font-size:9pt; font-weight:700; margin-bottom:5pt; }
  .hdr .date { color:#90caf9; }
  table { width:100%; border-collapse:collapse; margin-bottom:8pt; }
  th { background:#1a3a5c; color:#fff; border:.5pt solid #555; padding:2pt 3pt; font-size:6.4pt; font-weight:700; text-align:center; }
  th.left { text-align:left; }
  td { border:.5pt solid #c0c0c0; padding:1.6pt 3pt; font-size:6.4pt; }
  tr.cls td { background:#d4e6f6; font-weight:700; }
  tr.grp td { background:#eef3fa; font-style:italic; font-weight:700; }
  .ctr { text-align:center; width:26pt; } .lbl { text-align:left; } .ind { padding-left:8pt; } .ind2 { padding-left:14pt; }
  .num { text-align:right; white-space:nowrap; width:46pt; } .num.b { font-weight:700; }
  tr.tot td { background:#1a3a5c; color:#fff; font-weight:700; }
  h4 { font-size:8pt; margin:6pt 0 2pt; color:#1a3a5c; }
  .foot { margin-top:4pt; text-align:center; font-size:6pt; color:#888; }
</style></head><body>
<div class="hdr"><span>BILAN BRB — Période : <span class="date">${rp.dateDebut || '...'} au ${rp.dateFin}</span></span><span>Exercice : ${rp.exerciceCode || ''}</span></div>
<h4>ACTIF</h4>
<table>${head('ACTIF')}<tbody>${rowsHtml(BILAN_ACTIF)}${totRow('TOTAL ACTIF', totActif)}</tbody></table>
<h4>PASSIF</h4>
<table>${head('PASSIF')}<tbody>${rowsHtml(BILAN_PASSIF)}${totRow('TOTAL PASSIF', totPassif)}</tbody></table>
<div class="foot">Généré le ${new Date().toLocaleDateString('fr-FR')} — AgrM MicroCore ProFinance — Rapport réglementaire BRB</div>
</body></html>`;
    };

    const handlePdf = async () => {
        setLoadingPdf(true);
        try {
            const rp = report ?? await loadData();
            if (!rp) return;
            const win = window.open('', '_blank', 'width=1300,height=900');
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
            const ld: BrbLines = rp.lines ?? {};
            const XLSX = await import('xlsx');
            const header = ['Compte', 'Libellé', 'BIF Résident', 'BIF Non résident', 'Devises Résident', 'Devises Non résident', 'Montant net N', 'Montant net N-1'];
            const rows: any[][] = [];
            rows.push([`BILAN BRB — Période : ${rp.dateDebut || '...'} au ${rp.dateFin}`, '', '', '', '', '', `Exercice : ${rp.exerciceCode || ''}`]);
            rows.push([]);
            const pushSection = (title: string, arr: BrbLine[], tot: any) => {
                rows.push([title]);
                rows.push(header);
                arr.forEach(l => {
                    if (l.type === 'detail') {
                        const c = ld[l.compte];
                        rows.push([l.compte, l.libelle, c?.bifRes || null, c?.bifNonRes || null, c?.devRes || null, c?.devNonRes || null, c?.net || null, c?.netN1 || null]);
                    } else {
                        rows.push([l.compte, l.libelle]);
                    }
                });
                rows.push(['', `TOTAL ${title}`, tot.bifRes || null, tot.bifNonRes || null, tot.devRes || null, tot.devNonRes || null, tot.net || null, tot.netN1 || null]);
                rows.push([]);
            };
            pushSection('ACTIF', BILAN_ACTIF, totActif);
            pushSection('PASSIF', BILAN_PASSIF, totPassif);

            const ws = XLSX.utils.aoa_to_sheet(rows);
            ws['!cols'] = [{ wch: 9 }, { wch: 52 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 16 }, { wch: 16 }];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Bilan BRB');
            XLSX.writeFile(wb, `bilan_brb_${(rp.dateFin || '').replace(/\//g, '-')}.xlsx`);
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Excel généré', life: 3000 });
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.message, life: 3000 });
        } finally { setLoadingExcel(false); }
    };

    return (
        <div className="card p-3 mt-2">
            <Toast ref={toast} />

            {/* Bannière exercice */}
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

            {/* Contrôles */}
            <div className="card p-fluid mb-3">
                <h5><i className="pi pi-building-columns mr-2"></i>Rapport BRB — Bilan (Tableau 3)</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="dd">Date début (par défaut : début exercice)</label>
                        <Calendar id="dd" value={dateDebut} onChange={(e) => setDateDebut(e.value as Date | null)}
                            dateFormat="dd/mm/yy" showIcon placeholder="Début d'exercice" className="w-full" />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="df">Date fin de période *</label>
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

            {/* Aperçu */}
            {report && (
                <div className="card p-3">
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                        <tbody>
                            <tr style={{ backgroundColor: '#1a3a5c', color: 'white' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 'bold', fontSize: '0.95rem', width: '60%' }}>
                                    BILAN BRB — Période : <span style={{ color: '#90caf9' }}>{report.dateDebut || '...'} au {report.dateFin}</span>
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: 'bold', fontSize: '0.95rem', textAlign: 'right' }}>
                                    Exercice : {report.exerciceCode}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ overflowX: 'auto' }}>
                        <h6 style={{ margin: '6px 0', color: '#1a3a5c' }}>ACTIF</h6>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                            {renderHead('ACTIF')}
                            <tbody>
                                {BILAN_ACTIF.map((l, i) => renderRow(l, i, lines))}
                                {renderTotalRow('TOTAL ACTIF', totActif)}
                            </tbody>
                        </table>

                        <h6 style={{ margin: '6px 0', color: '#1a3a5c' }}>PASSIF</h6>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            {renderHead('PASSIF')}
                            <tbody>
                                {BILAN_PASSIF.map((l, i) => renderRow(l, i, lines))}
                                {renderTotalRow('TOTAL PASSIF', totPassif)}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-content-end mt-2">
                        <span style={{
                            fontSize: '0.8rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px',
                            color: equilibre ? '#2e7d32' : '#c62828',
                            backgroundColor: equilibre ? '#e8f5e9' : '#ffebee'
                        }}>
                            {equilibre ? '✓ Bilan équilibré' : `⚠ Écart : ${fmt(Math.abs(totActif.net - totPassif.net))}`}
                        </span>
                    </div>

                    <p className="text-xs text-500 mt-2">
                        <i className="pi pi-info-circle mr-1"></i>
                        Ventilation BIF / Devises via la devise des écritures ; Résident / Non résident via l'indicateur de résidence de la contrepartie (les écritures antérieures sont considérées comme résidentes par défaut).
                    </p>
                </div>
            )}
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_REPORT_VIEW']}>
            <BrbBilanReport />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
