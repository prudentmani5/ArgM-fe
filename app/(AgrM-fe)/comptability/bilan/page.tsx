'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptExercice } from '../types';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';

interface BilanLine {
    type: 'classe' | 'groupe' | 'detail';
    compte: string;
    libelle: string;
    italic?: boolean;
}

const ACTIF_LINES: BilanLine[] = [
    { type: 'classe', compte: '1', libelle: 'TRESORERIE ET OPERATIONS FINANCIERES AVEC INST. FIN. ET AUTRES PARTENAIRES' },
    { type: 'groupe', compte: '10', libelle: 'ENCAISSE', italic: true },
    { type: 'detail', compte: '101', libelle: 'Caisse' },
    { type: 'groupe', compte: '11', libelle: 'DEPOTS', italic: true },
    { type: 'detail', compte: '111', libelle: 'Dépôts à vue' },
    { type: 'detail', compte: '112', libelle: 'Dépôts à terme' },
    { type: 'detail', compte: '113', libelle: 'Intérêts courus sur les dépôts', italic: true },
    { type: 'groupe', compte: '12', libelle: 'VALEURS A ENCAISSER', italic: true },
    { type: 'groupe', compte: '14', libelle: 'PRETS AUX INSTITUTIONS FINANCIERES', italic: true },
    { type: 'detail', compte: '141', libelle: 'Prêts à court terme' },
    { type: 'detail', compte: '142', libelle: 'Prêts à moyen terme' },
    { type: 'detail', compte: '143', libelle: 'Prêts à long terme' },
    { type: 'detail', compte: '146', libelle: 'Intérêt courus sur prêts', italic: true },
    { type: 'classe', compte: '2', libelle: 'OPERATIONS AVEC LES MEMBRES, CLIENTS ET BENEFICIAIRES' },
    { type: 'groupe', compte: '21', libelle: "CREDITS A L'ECONOMIE", italic: true },
    { type: 'detail', compte: '211', libelle: 'Crédits sains sur ressources non affectées' },
    { type: 'detail', compte: '212', libelle: 'Crédits sains sur ressources affectées' },
    { type: 'detail', compte: '213', libelle: 'Crédits restructurés ou rééchelonnés' },
    { type: 'detail', compte: '214', libelle: 'Crédits en souffrance' },
    { type: 'groupe', compte: '26', libelle: 'INTERETS COURUS SUR CREDITS', italic: true },
    { type: 'detail', compte: '261', libelle: 'Intérêts courus sur crédits sains sur ressources non affectées' },
    { type: 'detail', compte: '262', libelle: 'Intérêts courus sur crédits sains sur ressources affectées' },
    { type: 'detail', compte: '263', libelle: 'Intérêts courus sur crédits restructurés ou rééchelonnés' },
    { type: 'classe', compte: '3', libelle: 'OPERATIONS DIVERSES' },
    { type: 'groupe', compte: '30', libelle: 'STOCKS', italic: true },
    { type: 'groupe', compte: '31', libelle: 'DEBITEURS DIVERS', italic: true },
    { type: 'groupe', compte: '32', libelle: 'COMPTE DE LIAISON', italic: true },
    { type: 'groupe', compte: '35', libelle: 'AVANCES ET PRETS AU PERSONNEL ET AUX DIRIGEANTS', italic: true },
    { type: 'detail', compte: '351', libelle: 'Personnel - avances sur salaires', italic: true },
    { type: 'detail', compte: '352', libelle: 'Dirigeants - Découvert', italic: true },
    { type: 'detail', compte: '353', libelle: 'Personnel – prêts', italic: true },
    { type: 'detail', compte: '354', libelle: 'Dirigeants – Prêts', italic: true },
    { type: 'detail', compte: '356', libelle: 'Intérêts courus sur prêts au personnel et aux dirigeants', italic: true },
    { type: 'groupe', compte: '36', libelle: "COMPTES DE REGULARISATION DE L'ACTIF", italic: true },
    { type: 'detail', compte: '361', libelle: "Charges payées d'avance", italic: true },
    { type: 'detail', compte: '362', libelle: 'Produits à recevoir', italic: true },
    { type: 'detail', compte: '363', libelle: "Autres comptes de régularisation d'actif", italic: true },
    { type: 'classe', compte: '4', libelle: 'IMMOBILISATIONS' },
    { type: 'groupe', compte: '40', libelle: 'IMMOBILISATIONS FINANCIERES', italic: true },
    { type: 'detail', compte: '401', libelle: 'Dépôts et cautionnements versés', italic: true },
    { type: 'detail', compte: '408', libelle: 'Autres immobilisations financières', italic: true },
    { type: 'groupe', compte: '41', libelle: 'IMMOBILISATIONS EN COURS', italic: true },
    { type: 'detail', compte: '411', libelle: 'Avances versées sur immobilisations incorporelles', italic: true },
    { type: 'detail', compte: '412', libelle: 'Avances versées sur immobilisations corporelles', italic: true },
];

const PASSIF_LINES: BilanLine[] = [
    { type: 'classe', compte: '1', libelle: 'TRESORERIE ET OPERATIONS FINANCIERES AVEC INST. FIN. ET AUTRES PARTENAIRES' },
    { type: 'groupe', compte: '13', libelle: 'EMPRUNTS', italic: true },
    { type: 'detail', compte: '131', libelle: 'Emprunts court terme, découvert banque' },
    { type: 'detail', compte: '132', libelle: 'Emprunts à moyen terme' },
    { type: 'detail', compte: '133', libelle: 'Emprunts à long terme' },
    { type: 'detail', compte: '136', libelle: 'Intérêts courus sur emprunts' },
    { type: 'groupe', compte: '15', libelle: 'RESSOURCES AFFECTEES', italic: true },
    { type: 'groupe', compte: '16', libelle: 'SUBVENTIONS REÇUES NON ENCORE UTILISEES', italic: true },
    { type: 'detail', compte: '161', libelle: "Subventions d'exploitation reçues non encore utilisées" },
    { type: 'detail', compte: '162', libelle: "Subventions d'investissement reçues non encore utilisées" },
    { type: 'classe', compte: '2', libelle: 'OPERATIONS AVEC LES MEMBRES, CLIENTS ET BENEFICIAIRES' },
    { type: 'groupe', compte: '22', libelle: 'DEPOTS DES MEMBRES CLIENTS ET BÉNÉFICIAIRES', italic: true },
    { type: 'detail', compte: '221', libelle: 'Dépôts à vue' },
    { type: 'detail', compte: '222', libelle: 'Dépôts à terme' },
    { type: 'detail', compte: '223', libelle: "Comptes d'épargne" },
    { type: 'detail', compte: '224', libelle: 'Dépôts de garantie sur crédit accordé' },
    { type: 'detail', compte: '225', libelle: 'Autres dépôts' },
    { type: 'detail', compte: '226', libelle: 'Intérêt courus sur dépôts des membres, clients et bénéficiaires' },
    { type: 'classe', compte: '3', libelle: 'OPERATIONS DIVERSES' },
    { type: 'groupe', compte: '32', libelle: 'COMPTE DE LIAISON', italic: true },
    { type: 'groupe', compte: '33', libelle: 'CRÉDITEURS DIVERS', italic: true },
    { type: 'detail', compte: '331', libelle: 'Sécurité sociale, INSS', italic: true },
    { type: 'detail', compte: '332', libelle: 'Impôt', italic: true },
    { type: 'detail', compte: '333', libelle: "Mutuelle d'assurance maladie", italic: true },
    { type: 'detail', compte: '334', libelle: 'Rémunérations dues', italic: true },
    { type: 'detail', compte: '335', libelle: 'Dividendes à distribuer', italic: true },
    { type: 'detail', compte: '338', libelle: 'Autres créditeurs divers', italic: true },
    { type: 'groupe', compte: '37', libelle: 'COMPTES DE REGULARISATION DU PASSIF', italic: true },
    { type: 'detail', compte: '371', libelle: 'Charges à payer', italic: true },
    { type: 'detail', compte: '372', libelle: "Produits perçus d'avance", italic: true },
    { type: 'detail', compte: '373', libelle: 'Autres comptes de régularisations de passif', italic: true },
    { type: 'classe', compte: '5', libelle: 'FONDS PROPRES ET ASSIMILES' },
    { type: 'groupe', compte: '50', libelle: 'PROVISIONS POUR RISQUES OU A CARACTERE DE RESERVE', italic: true },
    { type: 'groupe', compte: '51', libelle: 'FONDS AFFECTES', italic: true },
    { type: 'detail', compte: '511', libelle: 'Fonds de sécurité', italic: true },
    { type: 'detail', compte: '512', libelle: "Fonds d'auto assurance", italic: true },
    { type: 'detail', compte: '518', libelle: 'Autres fonds affectés', italic: true },
    { type: 'groupe', compte: '52', libelle: "SUBVENTIONS D'INVESTISSEMENT", italic: true },
    { type: 'detail', compte: '521', libelle: 'Subventions pour immobilisations', italic: true },
    { type: 'detail', compte: '522', libelle: 'Subventions pour fonds de crédit', italic: true },
];

const tdBase: React.CSSProperties = { border: '1px solid #aaa', padding: '3px 6px', fontSize: '0.72rem' };
const tdNum: React.CSSProperties = { ...tdBase, textAlign: 'right', whiteSpace: 'nowrap', minWidth: '70px' };
const tdCode: React.CSSProperties = { ...tdBase, textAlign: 'center', width: '38px', whiteSpace: 'nowrap' };

const BilanReport: React.FC = () => {
    const toast = useRef<Toast>(null);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);
    const [date, setDate] = useState<Date | null>(null);
    const [bilanData, setBilanData] = useState<any>(null);

    const { data, loading: jsonLoading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        const saved = Cookies.get('currentExercice');
        if (saved) { try { setCurrentExercice(JSON.parse(saved)); } catch {} }
    }, []);

    useEffect(() => {
        if (callType === 'bilanJson' && data) setBilanData(data);
        if (callType === 'bilanJson' && error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 4000 });
        }
    }, [data, error, callType]);

    const formatDate = (value: string) => {
        if (!value) return '';
        return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
    };

    const toIso = (d: Date | null) => {
        if (!d) return '';
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const loadBilanData = async (): Promise<any> => {
        if (!currentExercice) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucun exercice sélectionné', life: 3000 });
            return null;
        }
        const params = new URLSearchParams();
        params.append('exerciceId', currentExercice.exerciceId);
        if (date) params.append('date', toIso(date));
        return await fetchData(null, 'GET', buildApiUrl(`/api/comptability/reports/bilan-json?${params.toString()}`), 'bilanJson');
    };

    const handleApercu = async () => { await loadBilanData(); };

    const fmt = (val: number) => {
        if (!val) return '';
        return new Intl.NumberFormat('fr-FR').format(Math.round(val));
    };

    const getBalance = (compte: string, bd?: any): number => (bd ?? bilanData)?.balances?.[compte] ?? 0;

    const calcTotals = (bd: any) => ({
        actif: ACTIF_LINES.filter(l => l.type === 'detail').reduce((s, l) => s + getBalance(l.compte, bd), 0),
        passif: PASSIF_LINES.filter(l => l.type === 'detail').reduce((s, l) => s + getBalance(l.compte, bd), 0),
    });

    // ── PDF (print-to-window — exact same design as aperçu) ─────────────────
    const buildPrintHtml = (bd: any): string => {
        const yr = bd.exerciceCode || '200X';
        const fmtN = (v: number) => v ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
        const { actif: totA, passif: totP } = calcTotals(bd);

        const actifRows = ACTIF_LINES.map(l => {
            if (l.type === 'classe') return `<tr class="cls"><td class="ctr">${l.compte}</td><td colspan="5" class="lbl">${l.libelle}</td></tr>`;
            if (l.type === 'groupe') return `<tr class="grp"><td class="ctr">${l.compte}</td><td colspan="5" class="lbl">${l.libelle}</td></tr>`;
            const b = getBalance(l.compte, bd);
            return `<tr><td class="ctr">${l.compte}</td><td class="lbl ind">${l.libelle}</td><td class="num">${fmtN(b)}</td><td class="num"></td><td class="num">${fmtN(b)}</td><td class="num"></td></tr>`;
        }).join('');

        const passifRows = PASSIF_LINES.map(l => {
            if (l.type === 'classe') return `<tr class="cls"><td class="ctr">${l.compte}</td><td colspan="3" class="lbl">${l.libelle}</td></tr>`;
            if (l.type === 'groupe') return `<tr class="grp"><td class="ctr">${l.compte}</td><td colspan="3" class="lbl">${l.libelle}</td></tr>`;
            const b = getBalance(l.compte, bd);
            return `<tr><td class="ctr">${l.compte}</td><td class="lbl ind">${l.libelle}</td><td class="num">${fmtN(b)}</td><td class="num"></td></tr>`;
        }).join('');

        return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Bilan ${bd.dateStr}</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  *    { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 7.2pt; color: #222; background: #fff; }

  /* ─── header ─── */
  .hdr { display: flex; justify-content: space-between; align-items: center;
         background: #1a3a5c; color: #fff; padding: 5pt 10pt;
         font-size: 9.5pt; font-weight: 700; margin-bottom: 5pt; border-radius: 2pt; }
  .hdr .date { color: #90caf9; }

  /* ─── two-column grid ─── */
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5pt; }

  /* ─── tables ─── */
  table { width: 100%; border-collapse: collapse; }
  th   { background: #1a3a5c; color: #fff; border: 0.5pt solid #555;
         padding: 3pt 4pt; font-size: 6.8pt; font-weight: 700;
         text-align: center; vertical-align: middle; line-height: 1.25; }
  th.left { text-align: left; }
  td   { border: 0.5pt solid #c0c0c0; padding: 2pt 4pt;
         font-size: 6.8pt; vertical-align: middle; }

  /* row types */
  tr.cls td { background: #d4e6f6; font-weight: 700; }
  tr.grp td { background: #eaf0f8; font-style: italic; font-weight: 700; }

  /* cell helpers */
  .ctr  { text-align: center; width: 24pt; white-space: nowrap; }
  .lbl  { text-align: left; }
  .ind  { padding-left: 10pt; }
  .num  { text-align: right; white-space: nowrap; width: 52pt; }

  /* total row */
  tr.tot td { background: #1a3a5c; color: #fff; font-weight: 700;
              border: 0.5pt solid #3a5a7c; }
  tr.tot .num { text-align: right; }

  /* footer */
  .foot { margin-top: 4pt; text-align: center; font-size: 6pt; color: #888; }
</style>
</head>
<body>
<div class="hdr">
  <span>BILAN AU&nbsp;: <span class="date">${bd.dateStr}</span></span>
  <span>NOM DE L'EMF&nbsp;:</span>
</div>
<div class="grid">
  <!-- ACTIF -->
  <table>
    <thead><tr>
      <th>Cpte</th><th class="left">ACTIF</th>
      <th>Mont.Brut<br>${yr}</th><th>Amort/<br>Prov</th>
      <th>Mont Net<br>${yr}</th><th>Mont Net<br>${yr}-1</th>
    </tr></thead>
    <tbody>
      ${actifRows}
      <tr class="tot">
        <td colspan="2" style="text-align:right;padding-right:6pt">TOTAL ACTIF</td>
        <td class="num">${fmtN(totA)}</td><td class="num"></td>
        <td class="num">${fmtN(totA)}</td><td class="num"></td>
      </tr>
    </tbody>
  </table>
  <!-- PASSIF -->
  <table>
    <thead><tr>
      <th>Cpte</th><th class="left">PASSIF ET FONDS PROPRES</th>
      <th>Mont. Net<br>${yr}</th><th>Mont. Net<br>${yr}-1</th>
    </tr></thead>
    <tbody>
      ${passifRows}
      <tr class="tot">
        <td colspan="2" style="text-align:right;padding-right:6pt">TOTAL PASSIF ET FONDS PROPRES</td>
        <td class="num">${fmtN(totP)}</td><td class="num"></td>
      </tr>
    </tbody>
  </table>
</div>
<div class="foot">Généré le ${new Date().toLocaleDateString('fr-FR')} — AgrM MicroCore ProFinance</div>
</body></html>`;
    };

    const handlePdf = async () => {
        if (!currentExercice) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucun exercice sélectionné', life: 3000 });
            return;
        }
        setLoadingPdf(true);
        try {
            const bd = bilanData ?? await loadBilanData();
            if (!bd) return;

            const win = window.open('', '_blank', 'width=1300,height=900');
            if (!win) {
                toast.current?.show({ severity: 'warn', summary: 'Popups bloqués', detail: 'Autorisez les popups pour générer le PDF', life: 5000 });
                return;
            }
            win.document.write(buildPrintHtml(bd));
            win.document.close();
            win.focus();
            setTimeout(() => win.print(), 600);
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.message, life: 3000 });
        } finally {
            setLoadingPdf(false);
        }
    };

    // ── EXCEL ─────────────────────────────────────────────────────────────────
    const handleExcel = async () => {
        if (!currentExercice) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucun exercice sélectionné', life: 3000 });
            return;
        }
        setLoadingExcel(true);
        try {
            const bd = bilanData ?? await loadBilanData();
            if (!bd) return;

            const XLSX = await import('xlsx');
            const yr = bd.exerciceCode || '200X';
            const { actif: totA, passif: totP } = calcTotals(bd);

            const rows: any[][] = [];
            rows.push([`BILAN AU : ${bd.dateStr}`, '', '', '', '', '', `NOM DE L'EMF :`, '', '', '']);
            rows.push([]);
            rows.push([
                'Compte', 'ACTIF', `Mont.Brut ${yr}`, 'Amort/Prov', `Mont Net ${yr}`, `Mont Net ${yr}-1`,
                'Compte', 'PASSIF ET FONDS PROPRES', `Mont. Net ${yr}`, `Mont. Net ${yr}-1`
            ]);

            const maxLen = Math.max(ACTIF_LINES.length, PASSIF_LINES.length);
            for (let i = 0; i < maxLen; i++) {
                const al = ACTIF_LINES[i];
                const pl = PASSIF_LINES[i];
                const aBal = al?.type === 'detail' ? (getBalance(al.compte, bd) || null) : null;
                const pBal = pl?.type === 'detail' ? (getBalance(pl.compte, bd) || null) : null;
                rows.push([
                    al?.compte ?? '', al?.libelle ?? '', aBal, null, aBal, null,
                    pl?.compte ?? '', pl?.libelle ?? '', pBal, null
                ]);
            }
            rows.push(['', 'TOTAL ACTIF', totA, null, totA, null, '', 'TOTAL PASSIF ET FONDS PROPRES', totP, null]);

            const ws = XLSX.utils.aoa_to_sheet(rows);
            ws['!cols'] = [
                { wch: 8 }, { wch: 42 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
                { wch: 8 }, { wch: 42 }, { wch: 15 }, { wch: 15 }
            ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Bilan');
            XLSX.writeFile(wb, `bilan_${bd.dateStr.replace(/\//g, '-')}.xlsx`);
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Excel généré', life: 3000 });
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.message, life: 3000 });
        } finally {
            setLoadingExcel(false);
        }
    };

    // ── RENDER ────────────────────────────────────────────────────────────────
    const renderActifRow = (line: BilanLine, idx: number) => {
        if (line.type === 'classe') return (
            <tr key={idx} style={{ backgroundColor: '#dce8f8' }}>
                <td style={{ ...tdCode, fontWeight: 'bold' }}>{line.compte}</td>
                <td colSpan={5} style={{ ...tdBase, fontWeight: 'bold' }}>{line.libelle}</td>
            </tr>
        );
        if (line.type === 'groupe') return (
            <tr key={idx} style={{ backgroundColor: '#f0f4f8' }}>
                <td style={{ ...tdCode, fontWeight: 'bold' }}>{line.compte}</td>
                <td colSpan={5} style={{ ...tdBase, fontStyle: 'italic', fontWeight: 'bold' }}>{line.libelle}</td>
            </tr>
        );
        const bal = getBalance(line.compte);
        return (
            <tr key={idx}>
                <td style={tdCode}>{line.compte}</td>
                <td style={{ ...tdBase, paddingLeft: '14px', fontStyle: line.italic ? 'italic' : 'normal' }}>{line.libelle}</td>
                <td style={tdNum}>{fmt(bal)}</td>
                <td style={tdNum}></td>
                <td style={tdNum}>{fmt(bal)}</td>
                <td style={tdNum}></td>
            </tr>
        );
    };

    const renderPassifRow = (line: BilanLine, idx: number) => {
        if (line.type === 'classe') return (
            <tr key={idx} style={{ backgroundColor: '#dce8f8' }}>
                <td style={{ ...tdCode, fontWeight: 'bold' }}>{line.compte}</td>
                <td colSpan={3} style={{ ...tdBase, fontWeight: 'bold' }}>{line.libelle}</td>
            </tr>
        );
        if (line.type === 'groupe') return (
            <tr key={idx} style={{ backgroundColor: '#f0f4f8' }}>
                <td style={{ ...tdCode, fontWeight: 'bold' }}>{line.compte}</td>
                <td colSpan={3} style={{ ...tdBase, fontStyle: 'italic', fontWeight: 'bold' }}>{line.libelle}</td>
            </tr>
        );
        const bal = getBalance(line.compte);
        return (
            <tr key={idx}>
                <td style={tdCode}>{line.compte}</td>
                <td style={{ ...tdBase, paddingLeft: '14px', fontStyle: line.italic ? 'italic' : 'normal' }}>{line.libelle}</td>
                <td style={tdNum}>{fmt(bal)}</td>
                <td style={tdNum}></td>
            </tr>
        );
    };

    const totals = bilanData ? calcTotals(bilanData) : { actif: 0, passif: 0 };
    const yr = bilanData?.exerciceCode || currentExercice?.codeExercice || '200X';

    const thStyle: React.CSSProperties = {
        border: '1px solid #555', padding: '5px 6px', fontSize: '0.72rem',
        textAlign: 'center', color: 'white', backgroundColor: '#1a3a5c', whiteSpace: 'nowrap',
    };

    return (
        <div className="card p-3 mt-2">
            <Toast ref={toast} />

            {/* Exercice banner */}
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

            {/* Controls */}
            <div className="card p-fluid mb-3">
                <h5><i className="pi pi-chart-pie mr-2"></i>Bilan</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="date">Date au (laisser vide = fin exercice)</label>
                        <Calendar id="date" value={date} onChange={(e) => setDate(e.value as Date | null)}
                            dateFormat="dd/mm/yy" showIcon placeholder="Fin d'exercice par défaut" className="w-full" />
                    </div>
                </div>
                <div className="flex gap-2 justify-content-end mt-2">
                    <Button icon="pi pi-eye" label="Aperçu" onClick={handleApercu}
                        loading={jsonLoading} severity="info" outlined />
                    <Button icon="pi pi-print" label="Imprimer / PDF" onClick={handlePdf}
                        loading={loadingPdf} severity="danger" />
                    <Button icon="pi pi-file-excel" label="Exporter Excel" onClick={handleExcel}
                        loading={loadingExcel} severity="success" />
                </div>
            </div>

            {/* Bilan preview table */}
            {bilanData && (
                <div className="card p-3">
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                        <tbody>
                            <tr style={{ backgroundColor: '#1a3a5c', color: 'white' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 'bold', fontSize: '1rem', width: '50%' }}>
                                    BILAN AU : <span style={{ color: '#90caf9' }}>{bilanData.dateStr}</span>
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: 'bold', fontSize: '1rem', textAlign: 'right' }}>
                                    NOM DE L&apos;EMF :
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', overflowX: 'auto' }}>
                        {/* ACTIF */}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Compte</th>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>ACTIF</th>
                                    <th style={thStyle}>Mont.Brut<br />{yr}</th>
                                    <th style={thStyle}>Amort/<br />Prov</th>
                                    <th style={thStyle}>Mont Net<br />{yr}</th>
                                    <th style={thStyle}>Mont Net<br />{yr}-1</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ACTIF_LINES.map((line, i) => renderActifRow(line, i))}
                                <tr style={{ backgroundColor: '#1a3a5c', color: 'white', fontWeight: 'bold' }}>
                                    <td colSpan={2} style={{ ...tdBase, color: 'white', textAlign: 'right', backgroundColor: '#1a3a5c' }}>TOTAL ACTIF</td>
                                    <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(totals.actif)}</td>
                                    <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}></td>
                                    <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(totals.actif)}</td>
                                    <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}></td>
                                </tr>
                            </tbody>
                        </table>

                        {/* PASSIF */}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Compte</th>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>PASSIF ET FONDS PROPRES</th>
                                    <th style={thStyle}>Mont.<br />Net {yr}</th>
                                    <th style={thStyle}>Mont.<br />Net {yr}-1</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PASSIF_LINES.map((line, i) => renderPassifRow(line, i))}
                                <tr style={{ backgroundColor: '#1a3a5c', color: 'white', fontWeight: 'bold' }}>
                                    <td colSpan={2} style={{ ...tdBase, color: 'white', textAlign: 'right', backgroundColor: '#1a3a5c' }}>TOTAL PASSIF ET FONDS PROPRES</td>
                                    <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(totals.passif)}</td>
                                    <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-content-end mt-2">
                        <span style={{
                            fontSize: '0.8rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px',
                            color: totals.actif === totals.passif ? '#2e7d32' : '#c62828',
                            backgroundColor: totals.actif === totals.passif ? '#e8f5e9' : '#ffebee'
                        }}>
                            {totals.actif === totals.passif ? '✓ Bilan équilibré' : `⚠ Écart : ${fmt(Math.abs(totals.actif - totals.passif))}`}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_REPORT_VIEW']}>
            <BilanReport />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
