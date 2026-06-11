'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptExercice } from '../types';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';

const typeOptions = [
    { label: 'Détaillé', value: 'D' },
    { label: 'Synthétique', value: 'S' }
];

interface CRLine {
    type: 'classe' | 'groupe' | 'detail';
    compte: string;
    libelle: string;
    italic?: boolean;
}

const CHARGES_LINES: CRLine[] = [
    { type: 'classe', compte: '60', libelle: 'CHARGES FINANCIERES' },
    { type: 'detail', compte: '601', libelle: 'Intérêts sur dépôts des membres' },
    { type: 'detail', compte: '604', libelle: 'Intérêts sur emprunts' },
    { type: 'detail', compte: '608', libelle: 'Autres charges financières' },
    { type: 'classe', compte: '61', libelle: 'COMMISSIONS ET FRAIS SUR OPERATIONS' },
    { type: 'detail', compte: '618', libelle: 'Autres commissions et frais sur opérations' },
    { type: 'classe', compte: '62', libelle: 'PERTES SUR OPERATIONS DE CHANGE' },
    { type: 'classe', compte: '63', libelle: "AUTRES CHARGES D'EXPLOITATION" },
    { type: 'detail', compte: '633', libelle: 'Location' },
    { type: 'detail', compte: '634', libelle: 'Entretien et réparations' },
    { type: 'detail', compte: '635', libelle: "Primes d'assurance" },
    { type: 'detail', compte: '636', libelle: 'Publicité et relations publiques' },
    { type: 'detail', compte: '637', libelle: 'Frais de communication' },
    { type: 'detail', compte: '638', libelle: 'Honoraires et prestations externes' },
    { type: 'detail', compte: '639', libelle: "Charges générales d'exploitation diverses" },
    { type: 'groupe', compte: '64', libelle: 'IMPÔTS ET TAXES', italic: true },
    { type: 'detail', compte: '641', libelle: 'Impôts et taxes' },
    { type: 'detail', compte: '642', libelle: 'Pénalités et amendes fiscales' },
    { type: 'groupe', compte: '65', libelle: 'PERSONNEL', italic: true },
    { type: 'detail', compte: '651', libelle: 'Rémunérations au personnel' },
    { type: 'detail', compte: '652', libelle: 'Charges sociales' },
    { type: 'groupe', compte: '66', libelle: 'AUTRES CHARGES', italic: true },
    { type: 'detail', compte: '661', libelle: 'Pertes sur crédits et sur autres créances' },
    { type: 'detail', compte: '662', libelle: "Pertes nettes sur cession d'actif immobilisé" },
    { type: 'detail', compte: '663', libelle: 'Charges diverses' },
    { type: 'groupe', compte: '68', libelle: 'DOTATIONS AUX AMORTISSEMENTS ET AUX PROVISIONS', italic: true },
    { type: 'detail', compte: '681', libelle: 'Dotations aux amortissements' },
    { type: 'detail', compte: '682', libelle: 'Dotations aux provisions' },
    { type: 'detail', compte: '69', libelle: 'IMPOTS SUR LE RESULTAT', italic: true },
    { type: 'detail', compte: '841', libelle: "BENEFICE DE L'EXERCICE", italic: true },
];

const PRODUITS_LINES: CRLine[] = [
    { type: 'classe', compte: '70', libelle: 'PRODUITS FINANCIERS' },
    { type: 'detail', compte: '701', libelle: "Intérêts et produits sur crédits à l'économie" },
    { type: 'detail', compte: '704', libelle: 'Intérêts sur prêts aux institutions financières' },
    { type: 'detail', compte: '708', libelle: 'Autres produits financiers' },
    { type: 'classe', compte: '71', libelle: 'COMMISSIONS ET FRAIS PERCUS' },
    { type: 'detail', compte: '711', libelle: 'Commissions perçues' },
    { type: 'detail', compte: '718', libelle: 'Autres frais perçus' },
    { type: 'classe', compte: '72', libelle: 'GAINS SUR OPERATIONS DE CHANGE' },
    { type: 'groupe', compte: '73', libelle: 'SUBVENTIONS', italic: true },
    { type: 'detail', compte: '731', libelle: "Subventions d'exploitation" },
    { type: 'detail', compte: '732', libelle: "Subventions d'équilibre" },
    { type: 'detail', compte: '733', libelle: "Quote-part subvention d'investissement reprise et affectée au résultat" },
    { type: 'groupe', compte: '74', libelle: 'PRODUITS EXCEPTIONNELS', italic: true },
    { type: 'detail', compte: '741', libelle: 'Encaissement de crédits radiés des livres' },
    { type: 'detail', compte: '748', libelle: 'Autres produits exceptionnels' },
    { type: 'groupe', compte: '79', libelle: "REPRISES D'AMORTISSEMENTS ET DE PROVISIONS", italic: true },
    { type: 'detail', compte: '791', libelle: 'Reprise sur amortissements' },
    { type: 'detail', compte: '792', libelle: 'Reprise sur provisions' },
    { type: 'detail', compte: '842', libelle: "DEFICIT DE L'EXERCICE", italic: true },
];

const tdBase: React.CSSProperties = { border: '1px solid #aaa', padding: '3px 6px', fontSize: '0.72rem' };
const tdNum: React.CSSProperties = { ...tdBase, textAlign: 'right', whiteSpace: 'nowrap', minWidth: '70px' };
const tdCode: React.CSSProperties = { ...tdBase, textAlign: 'center', width: '38px', whiteSpace: 'nowrap' };

const CompteResultatReport: React.FC = () => {
    const toast = useRef<Toast>(null);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingXls, setLoadingXls] = useState(false);
    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateFin, setDateFin] = useState<Date | null>(null);
    const [type, setType] = useState('D');
    const [crData, setCrData] = useState<any>(null);

    const { data, loading: jsonLoading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        const saved = Cookies.get('currentExercice');
        if (saved) { try { setCurrentExercice(JSON.parse(saved)); } catch {} }
    }, []);

    useEffect(() => {
        if (callType === 'crJson' && data) setCrData(data);
        if (callType === 'crJson' && error) {
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

    const handleApercu = async () => {
        if (!currentExercice) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucun exercice sélectionné', life: 3000 });
            return;
        }
        if (!dateDebut || !dateFin) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner la période', life: 3000 });
            return;
        }
        const params = new URLSearchParams();
        params.append('exerciceId', currentExercice.exerciceId);
        params.append('dateDebut', toIso(dateDebut));
        params.append('dateFin', toIso(dateFin));
        params.append('type', type);
        await fetchData(null, 'GET', buildApiUrl(`/api/comptability/reports/compte_resultat-json?${params.toString()}`), 'crJson');
    };

    const fmt = (val: number) => {
        if (!val) return '';
        return new Intl.NumberFormat('fr-FR').format(Math.round(val));
    };

    const getBalance = (compte: string): number => crData?.balances?.[compte] ?? 0;

    const computeTotals = () => {
        const tc = CHARGES_LINES.filter(l => l.type === 'detail').reduce((s, l) => s + (crData?.balances?.[l.compte] ?? 0), 0);
        const tp = PRODUITS_LINES.filter(l => l.type === 'detail').reduce((s, l) => s + (crData?.balances?.[l.compte] ?? 0), 0);
        return { tc, tp };
    };

    // ── PDF generation from aperçu data ──────────────────────────────────────
    const handleGenerate = async () => {
        if (!crData) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: "Cliquez d'abord sur Aperçu pour charger les données", life: 3000 });
            return;
        }
        setLoadingPdf(true);
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageW = doc.internal.pageSize.getWidth(); // 297mm
            const ml = 7, mr = 7;
            const exerciceYear = crData.exerciceCode || currentExercice?.codeExercice || '200X';

            // safe number formatter — avoids non-breaking spaces that jsPDF can't render
            const nf = (v: number): string => {
                if (!v) return '';
                return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            };

            const { tc: totalChargesVal, tp: totalProduitsVal } = computeTotals();
            const beneficeVal = crData?.balances?.['841'] ?? 0;
            const deficitVal  = crData?.balances?.['842'] ?? 0;

            // ── full-width header bar ──
            doc.setFillColor(26, 58, 92);
            doc.rect(ml, 7, pageW - ml - mr, 11, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('COMPTE DE RESULTATS AU : ' + (crData.dateStr || ''), ml + 4, 14);
            doc.text("NOM DE L'EMF : AGRINOVA", pageW - mr - 4, 14, { align: 'right' });
            doc.setTextColor(0, 0, 0);

            // ── helper: cell style per line type ──
            const cellBg = (type: string) =>
                type === 'classe' ? [220, 232, 248] : type === 'groupe' ? [240, 244, 248] : [255, 255, 255];
            const cellFs = (line: CRLine) =>
                line.type === 'classe' ? 'bold' : line.type === 'groupe' ? 'italic' : line.italic ? 'italic' : 'normal';

            // ── build paired body rows (zip CHARGES + PRODUITS) ──
            const body: any[][] = [];
            const maxLen = Math.max(CHARGES_LINES.length, PRODUITS_LINES.length);

            for (let i = 0; i < maxLen; i++) {
                const ch = CHARGES_LINES[i];
                const pr = PRODUITS_LINES[i];
                const row: any[] = [];

                // left side (charges)
                if (ch) {
                    const bg  = cellBg(ch.type);
                    const fs  = cellFs(ch);
                    const bal = crData?.balances?.[ch.compte] ?? 0;
                    row.push(
                        { content: ch.compte, styles: { fillColor: bg, fontStyle: ch.type !== 'detail' ? 'bold' : 'normal', halign: 'center' } },
                        { content: ch.libelle,  styles: { fillColor: bg, fontStyle: fs } },
                        { content: ch.type === 'detail' ? nf(bal) : '', styles: { fillColor: bg, halign: 'right' } },
                        { content: '', styles: { fillColor: bg } }
                    );
                } else {
                    row.push({ content: '' }, { content: '' }, { content: '' }, { content: '' });
                }

                // right side (produits)
                if (pr) {
                    const bg  = cellBg(pr.type);
                    const fs  = cellFs(pr);
                    const bal = crData?.balances?.[pr.compte] ?? 0;
                    row.push(
                        { content: pr.compte, styles: { fillColor: bg, fontStyle: pr.type !== 'detail' ? 'bold' : 'normal', halign: 'center' } },
                        { content: pr.libelle,  styles: { fillColor: bg, fontStyle: fs } },
                        { content: pr.type === 'detail' ? nf(bal) : '', styles: { fillColor: bg, halign: 'right' } },
                        { content: '', styles: { fillColor: bg } }
                    );
                } else {
                    row.push({ content: '' }, { content: '' }, { content: '' }, { content: '' });
                }

                body.push(row);
            }

            // total row — spans both halves
            const darkBg  = [26, 58, 92];
            const whiteT  = [255, 255, 255];
            body.push([
                { content: 'TOTAL', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: darkBg, textColor: whiteT } },
                { content: nf(totalChargesVal), styles: { halign: 'right', fontStyle: 'bold', fillColor: darkBg, textColor: whiteT } },
                { content: '', styles: { fillColor: darkBg } },
                { content: 'TOTAL', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: darkBg, textColor: whiteT } },
                { content: nf(totalProduitsVal), styles: { halign: 'right', fontStyle: 'bold', fillColor: darkBg, textColor: whiteT } },
                { content: '', styles: { fillColor: darkBg } },
            ]);

            autoTable(doc, {
                startY: 22,
                margin: { left: ml, right: mr },
                head: [
                    [
                        { content: '6   CHARGES', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fontSize: 8 } },
                        { content: '7   PRODUITS', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fontSize: 8 } },
                    ],
                    [
                        { content: 'Cpt', styles: { halign: 'center' } },
                        { content: 'Libellé', styles: { halign: 'left' } },
                        exerciceYear, exerciceYear + '-1',
                        { content: 'Cpt', styles: { halign: 'center' } },
                        { content: 'Libellé', styles: { halign: 'left' } },
                        exerciceYear, exerciceYear + '-1',
                    ]
                ],
                body,
                columnStyles: {
                    0: { cellWidth: 11, halign: 'center' as const },
                    1: { cellWidth: 79 },
                    2: { cellWidth: 21, halign: 'right' as const },
                    3: { cellWidth: 21, halign: 'right' as const },
                    4: { cellWidth: 11, halign: 'center' as const },
                    5: { cellWidth: 79 },
                    6: { cellWidth: 21, halign: 'right' as const },
                    7: { cellWidth: 21, halign: 'right' as const },
                },
                headStyles: { fillColor: [26, 58, 92], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
                bodyStyles: { fontSize: 7, cellPadding: 1.2 },
                styles: { lineColor: [200, 200, 200], lineWidth: 0.1 },
                theme: 'plain',
                // draw thick separator line between col 3 and col 4
                didDrawCell: (data: any) => {
                    if (data.column.index === 3) {
                        doc.setDrawColor(26, 58, 92);
                        doc.setLineWidth(0.6);
                        doc.line(
                            data.cell.x + data.cell.width,
                            data.cell.y,
                            data.cell.x + data.cell.width,
                            data.cell.y + data.cell.height
                        );
                    }
                },
            });

            // ── result indicator ──
            const finalY = (doc as any).lastAutoTable.finalY + 6;
            const resultLabel = beneficeVal > 0
                ? `Benefice de l'exercice : ${nf(beneficeVal)}`
                : deficitVal > 0
                    ? `Deficit de l'exercice : ${nf(deficitVal)}`
                    : 'Resultat nul';
            const [rr, rg, rb] = beneficeVal > 0 ? [46, 125, 50] : deficitVal > 0 ? [198, 40, 40] : [85, 85, 85];
            doc.setFillColor(beneficeVal > 0 ? 232 : deficitVal > 0 ? 255 : 245,
                             beneficeVal > 0 ? 245 : deficitVal > 0 ? 235 : 245,
                             beneficeVal > 0 ? 233 : deficitVal > 0 ? 238 : 245);
            const labelW = 100;
            doc.rect(pageW - mr - labelW, finalY - 4, labelW, 7, 'F');
            doc.setTextColor(rr, rg, rb);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(resultLabel, pageW - mr - 3, finalY, { align: 'right' });
            doc.setTextColor(0, 0, 0);

            doc.save('compte_resultat.pdf');
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'PDF généré avec succès', life: 3000 });
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.message, life: 3000 });
        } finally {
            setLoadingPdf(false);
        }
    };

    // ── Excel generation from aperçu data ────────────────────────────────────
    const handleExcel = async () => {
        if (!crData) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: "Cliquez d'abord sur Aperçu pour charger les données", life: 3000 });
            return;
        }
        setLoadingXls(true);
        try {
            const XLSX = await import('xlsx');
            const exerciceYear = crData.exerciceCode || currentExercice?.codeExercice || '200X';
            const nf = (v: number): string => v ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
            const { tc: totalChargesVal, tp: totalProduitsVal } = computeTotals();

            const wsData: any[][] = [
                ['COMPTE DE RESULTATS AU : ' + (crData.dateStr || ''), '', '', '', '', 'NOM DE L\'EMF : AGRINOVA'],
                [],
                ['Compte', '6  CHARGES', exerciceYear, exerciceYear + '-1', '', 'Compte', '7  PRODUITS', exerciceYear, exerciceYear + '-1'],
            ];

            const maxLen = Math.max(CHARGES_LINES.length, PRODUITS_LINES.length);
            for (let i = 0; i < maxLen; i++) {
                const ch = CHARGES_LINES[i];
                const pr = PRODUITS_LINES[i];
                const row: any[] = [];

                if (ch) {
                    row.push(ch.compte, ch.libelle);
                    row.push(ch.type === 'detail' ? (crData?.balances?.[ch.compte] ?? '') : '', '');
                } else {
                    row.push('', '', '', '');
                }

                row.push(''); // separator column E

                if (pr) {
                    row.push(pr.compte, pr.libelle);
                    row.push(pr.type === 'detail' ? (crData?.balances?.[pr.compte] ?? '') : '', '');
                } else {
                    row.push('', '', '', '');
                }

                wsData.push(row);
            }

            wsData.push(['', 'TOTAL', totalChargesVal || '', '', '', '', 'TOTAL', totalProduitsVal || '', '']);

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = [
                { wch: 10 }, { wch: 45 }, { wch: 16 }, { wch: 16 },
                { wch: 3 },
                { wch: 10 }, { wch: 45 }, { wch: 16 }, { wch: 16 },
            ];
            XLSX.utils.book_append_sheet(wb, ws, 'Compte de Résultats');
            XLSX.writeFile(wb, 'compte_resultat.xlsx');
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Excel généré avec succès', life: 3000 });
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.message, life: 3000 });
        } finally {
            setLoadingXls(false);
        }
    };

    const totalCharges = CHARGES_LINES.filter(l => l.type === 'detail').reduce((s, l) => s + getBalance(l.compte), 0);
    const totalProduits = PRODUITS_LINES.filter(l => l.type === 'detail').reduce((s, l) => s + getBalance(l.compte), 0);
    const benefice = getBalance('841');
    const deficit = getBalance('842');
    const yr = crData?.exerciceCode || currentExercice?.codeExercice || '200X';

    const thStyle: React.CSSProperties = {
        border: '1px solid #555',
        padding: '5px 6px',
        fontSize: '0.72rem',
        textAlign: 'center',
        color: 'white',
        backgroundColor: '#1a3a5c',
        whiteSpace: 'nowrap',
    };

    const renderChargesRow = (line: CRLine, idx: number) => {
        if (line.type === 'classe') {
            return (
                <tr key={idx} style={{ backgroundColor: '#dce8f8' }}>
                    <td style={{ ...tdCode, fontWeight: 'bold' }}>{line.compte}</td>
                    <td colSpan={3} style={{ ...tdBase, fontWeight: 'bold' }}>{line.libelle}</td>
                </tr>
            );
        }
        if (line.type === 'groupe') {
            return (
                <tr key={idx} style={{ backgroundColor: '#f0f4f8' }}>
                    <td style={{ ...tdCode, fontWeight: 'bold' }}>{line.compte}</td>
                    <td colSpan={3} style={{ ...tdBase, fontStyle: 'italic', fontWeight: 'bold' }}>{line.libelle}</td>
                </tr>
            );
        }
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

    const renderProduitsRow = (line: CRLine, idx: number) => {
        if (line.type === 'classe') {
            return (
                <tr key={idx} style={{ backgroundColor: '#dce8f8' }}>
                    <td style={{ ...tdCode, fontWeight: 'bold' }}>{line.compte}</td>
                    <td colSpan={3} style={{ ...tdBase, fontWeight: 'bold' }}>{line.libelle}</td>
                </tr>
            );
        }
        if (line.type === 'groupe') {
            return (
                <tr key={idx} style={{ backgroundColor: '#f0f4f8' }}>
                    <td style={{ ...tdCode, fontWeight: 'bold' }}>{line.compte}</td>
                    <td colSpan={3} style={{ ...tdBase, fontStyle: 'italic', fontWeight: 'bold' }}>{line.libelle}</td>
                </tr>
            );
        }
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
                                {currentExercice ? (
                                    <>Exercice: <span className="text-primary">{currentExercice.codeExercice}</span></>
                                ) : (
                                    <span className="text-orange-500">Aucun exercice sélectionné</span>
                                )}
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
                <h5><i className="pi pi-chart-line mr-2"></i>Compte de Résultat</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="dateDebut">Date Début</label>
                        <Calendar id="dateDebut" value={dateDebut} onChange={(e) => setDateDebut(e.value as Date | null)}
                            dateFormat="dd/mm/yy" showIcon placeholder="Sélectionner une date" className="w-full" />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="dateFin">Date Fin</label>
                        <Calendar id="dateFin" value={dateFin} onChange={(e) => setDateFin(e.value as Date | null)}
                            dateFormat="dd/mm/yy" showIcon placeholder="Sélectionner une date" className="w-full" />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="type">Type</label>
                        <Dropdown id="type" value={type} options={typeOptions} onChange={(e) => setType(e.value)}
                            placeholder="Sélectionner" className="w-full" />
                    </div>
                </div>
                <div className="flex gap-2 justify-content-end mt-2">
                    <Button icon="pi pi-eye" label="Aperçu" onClick={handleApercu}
                        loading={jsonLoading} severity="info" outlined />
                    <Button icon="pi pi-file-excel" label="Excel" onClick={handleExcel}
                        loading={loadingXls} severity="warning" outlined disabled={!crData} />
                    <Button icon="pi pi-file-pdf" label="Générer PDF" onClick={handleGenerate}
                        loading={loadingPdf} severity="success" disabled={!crData} />
                </div>
            </div>

            {/* Compte de Résultats preview */}
            {crData && (
                <div className="card p-3">
                    {/* Report header */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                        <tbody>
                            <tr style={{ backgroundColor: '#1a3a5c', color: 'white' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 'bold', fontSize: '1rem', width: '50%' }}>
                                    COMPTE DE RESULTATS AU : <span style={{ color: '#90caf9' }}>{crData.dateStr}</span>
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: 'bold', fontSize: '1rem', textAlign: 'right' }}>
                                    NOM DE L&apos;EMF : <span style={{ color: '#90caf9' }}>AGRINOVA</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Two-column layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', overflowX: 'auto' }}>

                        {/* CHARGES */}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Compte</th>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>6&nbsp;&nbsp;CHARGES</th>
                                    <th style={thStyle}>{yr}</th>
                                    <th style={thStyle}>{yr}-1</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CHARGES_LINES.map((line, i) => renderChargesRow(line, i))}
                                <tr style={{ backgroundColor: '#1a3a5c', color: 'white', fontWeight: 'bold' }}>
                                    <td colSpan={2} style={{ ...tdBase, color: 'white', textAlign: 'right', backgroundColor: '#1a3a5c' }}>TOTAL</td>
                                    <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(totalCharges)}</td>
                                    <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}></td>
                                </tr>
                            </tbody>
                        </table>

                        {/* PRODUITS */}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Compte</th>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>7&nbsp;&nbsp;PRODUITS</th>
                                    <th style={thStyle}>{yr}</th>
                                    <th style={thStyle}>{yr}-1</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PRODUITS_LINES.map((line, i) => renderProduitsRow(line, i))}
                                <tr style={{ backgroundColor: '#1a3a5c', color: 'white', fontWeight: 'bold' }}>
                                    <td colSpan={2} style={{ ...tdBase, color: 'white', textAlign: 'right', backgroundColor: '#1a3a5c' }}>TOTAL</td>
                                    <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}>{fmt(totalProduits)}</td>
                                    <td style={{ ...tdNum, color: 'white', backgroundColor: '#1a3a5c' }}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Résultat indicator */}
                    <div className="flex justify-content-end mt-2">
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            color: benefice > 0 ? '#2e7d32' : deficit > 0 ? '#c62828' : '#555',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            backgroundColor: benefice > 0 ? '#e8f5e9' : deficit > 0 ? '#ffebee' : '#f5f5f5'
                        }}>
                            {benefice > 0
                                ? `✓ Bénéfice de l'exercice : ${fmt(benefice)}`
                                : deficit > 0
                                    ? `⚠ Déficit de l'exercice : ${fmt(deficit)}`
                                    : '✓ Résultat nul'}
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
            <CompteResultatReport />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
