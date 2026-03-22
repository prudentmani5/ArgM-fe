'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

function RapprochementCaissePage() {
    const [caisses, setCaisses] = useState<any[]>([]);
    const [selectedCaisseId, setSelectedCaisseId] = useState<string | null>(null);
    const [selectedCaisse, setSelectedCaisse] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [dailySummary, setDailySummary] = useState<any>(null);
    const [movements, setMovements] = useState<any[]>([]);
    const [closingComparison, setClosingComparison] = useState<any>(null);
    const [latestBilletage, setLatestBilletage] = useState<any>(null);

    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const { data: caissesData, error: caissesError, fetchData: fetchCaisses } = useConsumApi('');
    const { data: summaryData, error: summaryError, fetchData: fetchSummary } = useConsumApi('');
    const { data: movementsData, error: movementsError, fetchData: fetchMovements } = useConsumApi('');
    const { data: comparisonData, error: comparisonError, fetchData: fetchComparison } = useConsumApi('');
    const { data: billetageData, error: billetageError, fetchData: fetchBilletage } = useConsumApi('');

    const CAISSE_URL = buildApiUrl('/api/comptability/caisses');

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        fetchCaisses(null, 'GET', `${CAISSE_URL}/findall`, 'loadCaisses');
    }, []);

    useEffect(() => {
        if (caissesData) {
            const arr = Array.isArray(caissesData) ? caissesData : caissesData.content || [];
            setCaisses(arr);
        }
        if (caissesError) {
            showToast('error', 'Erreur', caissesError.message || 'Erreur de chargement des caisses');
        }
    }, [caissesData, caissesError]);

    useEffect(() => {
        if (summaryData) setDailySummary(summaryData);
        if (summaryError) showToast('error', 'Erreur', summaryError.message || 'Erreur de chargement du résumé');
    }, [summaryData, summaryError]);

    useEffect(() => {
        if (movementsData) {
            const arr = Array.isArray(movementsData) ? movementsData : movementsData.content || [];
            setMovements(arr);
        }
    }, [movementsData, movementsError]);

    useEffect(() => {
        if (comparisonData) setClosingComparison(comparisonData);
    }, [comparisonData, comparisonError]);

    useEffect(() => {
        if (billetageData) setLatestBilletage(billetageData);
    }, [billetageData, billetageError]);

    const handleCaisseChange = (caisseId: string) => {
        setSelectedCaisseId(caisseId);
        const caisse = caisses.find((c: any) => c.caisseId === caisseId) || null;
        setSelectedCaisse(caisse);
        if (caisseId) {
            loadCaisseData(caisseId);
        } else {
            setDailySummary(null);
            setMovements([]);
            setClosingComparison(null);
            setLatestBilletage(null);
        }
    };

    const loadCaisseData = (caisseId: string) => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        fetchSummary(null, 'GET', `${CAISSE_URL}/daily-summary/${caisseId}?date=${dateStr}`, 'loadSummary');
        fetchMovements(null, 'GET', `${CAISSE_URL}/movements/${caisseId}?date=${dateStr}`, 'loadMovements');
        fetchComparison(null, 'GET', `${CAISSE_URL}/closing-comparison/${caisseId}?date=${dateStr}`, 'loadComparison');
        fetchBilletage(null, 'GET', `${CAISSE_URL}/billetage/latest/${caisseId}`, 'loadBilletage');
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setSelectedDate(date);
            if (selectedCaisseId) {
                const dateStr = date.toISOString().split('T')[0];
                fetchSummary(null, 'GET', `${CAISSE_URL}/daily-summary/${selectedCaisseId}?date=${dateStr}`, 'loadSummary');
                fetchMovements(null, 'GET', `${CAISSE_URL}/movements/${selectedCaisseId}?date=${dateStr}`, 'loadMovements');
                fetchComparison(null, 'GET', `${CAISSE_URL}/closing-comparison/${selectedCaisseId}?date=${dateStr}`, 'loadComparison');
            }
        }
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContents = printRef.current.innerHTML;
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html><head><title>Rapprochement de Caisse - ${selectedCaisse?.codeCaisse}</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px 30px; font-size: 11px; }
                        h1 { text-align: center; font-size: 16px; text-transform: uppercase; }
                        h2 { font-size: 13px; border-bottom: 2px solid #2196F3; padding-bottom: 4px; color: #1565C0; }
                        h3 { text-align: center; color: #666; font-size: 11px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                        th, td { border: 1px solid #ddd; padding: 5px 8px; text-align: left; }
                        th { background-color: #E3F2FD; font-weight: 600; color: #1565C0; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .summary-box { border: 2px solid #1565C0; padding: 10px; margin: 10px 0; border-radius: 4px; }
                        .summary-box td { border: none; padding: 4px 8px; }
                        .ecart-ok { color: #2E7D32; font-weight: bold; }
                        .ecart-nok { color: #C62828; font-weight: bold; }
                        .signature-area { margin-top: 40px; display: flex; justify-content: space-between; }
                        .signature-block { width: 30%; text-align: center; }
                        .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
                        @media print { body { margin: 10px; } }
                    </style></head><body>${printContents}</body></html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    const formatCurrency = (value: number | undefined | null) => {
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value || 0);
    };

    const formatDate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const formatTime = (time: string | undefined) => {
        return time || '-';
    };

    const caisseOptionTemplate = (option: any) => (
        <div className="flex align-items-center justify-content-between w-full">
            <span>{option.codeCaisse} - {option.libelle}</span>
            <Tag value={option.status === 'OPEN' ? 'Ouverte' : 'Fermée'} severity={option.status === 'OPEN' ? 'success' : 'danger'} className="ml-2" />
        </div>
    );

    // Calculated values
    const soldeTheorique = selectedCaisse?.soldeActuel || 0;
    const soldePhysique = latestBilletage?.totalPhysique || 0;
    const ecartCaisse = soldeTheorique - soldePhysique;

    const totalEntrees = movements.filter((m: any) => m.sens === 'CREDIT').reduce((sum: number, m: any) => sum + (m.montant || 0), 0);
    const totalSorties = movements.filter((m: any) => m.sens === 'DEBIT').reduce((sum: number, m: any) => sum + (m.montant || 0), 0);

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2><i className="pi pi-wallet mr-2"></i>Rapprochement de Caisse</h2>
            <p className="text-500 mb-4">Comparaison du solde théorique (livres comptables) avec le solde physique (comptage de caisse)</p>

            {/* Filters */}
            <div className="p-fluid formgrid grid mb-4">
                <div className="field col-12 md:col-5">
                    <label className="font-semibold">Sélectionner une caisse</label>
                    <Dropdown
                        value={selectedCaisseId}
                        options={caisses}
                        onChange={(e) => handleCaisseChange(e.value)}
                        optionLabel="codeCaisse"
                        optionValue="caisseId"
                        itemTemplate={caisseOptionTemplate}
                        placeholder="Sélectionner une caisse"
                        filter
                        showClear
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label className="font-semibold">Date</label>
                    <Calendar
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        maxDate={new Date()}
                    />
                </div>
                <div className="field col-12 md:col-4 flex align-items-end gap-2">
                    {selectedCaisseId && (
                        <>
                            <Button label="Rafraîchir" icon="pi pi-refresh" severity="info" outlined onClick={() => loadCaisseData(selectedCaisseId)} />
                            <Button label="Imprimer" icon="pi pi-print" onClick={handlePrint} />
                        </>
                    )}
                </div>
            </div>

            {!selectedCaisseId && (
                <div className="text-center text-500 p-5">
                    <i className="pi pi-wallet text-4xl mb-3 block"></i>
                    <p>Sélectionnez une caisse pour effectuer le rapprochement</p>
                </div>
            )}

            {selectedCaisse && (
                <>
                    {/* Summary Cards */}
                    <div className="grid mb-4">
                        <div className="col-12 md:col-3">
                            <Card className="shadow-1">
                                <div className="text-center">
                                    <span className="block text-500 font-medium mb-1">Solde Théorique</span>
                                    <div className="text-blue-500 font-bold text-2xl">{formatCurrency(soldeTheorique)}</div>
                                    <span className="text-xs text-500">Selon les livres comptables</span>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="shadow-1">
                                <div className="text-center">
                                    <span className="block text-500 font-medium mb-1">Solde Physique</span>
                                    <div className="text-green-500 font-bold text-2xl">{formatCurrency(soldePhysique)}</div>
                                    <span className="text-xs text-500">Dernier comptage</span>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="shadow-1">
                                <div className="text-center">
                                    <span className="block text-500 font-medium mb-1">Écart</span>
                                    <div className={`font-bold text-2xl ${ecartCaisse !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {formatCurrency(ecartCaisse)}
                                    </div>
                                    <span className="text-xs text-500">{ecartCaisse === 0 ? 'Concordance parfaite' : 'Écart détecté'}</span>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="shadow-1">
                                <div className="text-center">
                                    <span className="block text-500 font-medium mb-1">Mouvements</span>
                                    <div className="font-bold text-2xl">{movements.length}</div>
                                    <span className="text-xs text-500">du {formatDate(selectedDate.toISOString())}</span>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Printable content */}
                    <div className="surface-card p-4 border-round shadow-2" ref={printRef}>
                        <h1>RAPPROCHEMENT DE CAISSE</h1>
                        <h3>{selectedCaisse.codeCaisse} - {selectedCaisse.libelle}</h3>
                        <h3>Date: {formatDate(selectedDate.toISOString())} | Agent: {selectedCaisse.agentName || '-'}</h3>

                        {/* Reconciliation Table */}
                        <h2>Tableau de Rapprochement</h2>
                        <div className="summary-box">
                            <table>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '60%' }}>Solde théorique (selon les livres)</td>
                                        <td className="text-right"><strong>{formatCurrency(soldeTheorique)}</strong></td>
                                    </tr>
                                    <tr>
                                        <td>Solde physique (comptage de caisse)</td>
                                        <td className="text-right"><strong>{formatCurrency(soldePhysique)}</strong></td>
                                    </tr>
                                    <tr style={{ borderTop: '2px solid #1565C0' }}>
                                        <td><strong>Écart (Théorique - Physique)</strong></td>
                                        <td className={`text-right ${ecartCaisse !== 0 ? 'ecart-nok' : 'ecart-ok'}`}>
                                            <strong>{formatCurrency(ecartCaisse)}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Closing comparison */}
                        {closingComparison && (
                            <>
                                <h2>Comparaison Ouverture / Fermeture</h2>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Solde d'ouverture</td>
                                            <td className="text-right">{formatCurrency(closingComparison.soldeOuverture)}</td>
                                        </tr>
                                        <tr>
                                            <td>(+) Total entrées du jour</td>
                                            <td className="text-right">{formatCurrency(totalEntrees)}</td>
                                        </tr>
                                        <tr>
                                            <td>(-) Total sorties du jour</td>
                                            <td className="text-right">{formatCurrency(totalSorties)}</td>
                                        </tr>
                                        <tr style={{ borderTop: '2px solid #333' }}>
                                            <td><strong>Solde théorique de fermeture</strong></td>
                                            <td className="text-right"><strong>{formatCurrency(closingComparison.soldeFermetureTheorique)}</strong></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Solde physique de fermeture</strong></td>
                                            <td className="text-right"><strong>{formatCurrency(closingComparison.soldeFermeturePhysique)}</strong></td>
                                        </tr>
                                        <tr style={{ borderTop: '2px solid #333' }}>
                                            <td><strong>Écart</strong></td>
                                            <td className={`text-right ${closingComparison.ecart !== 0 ? 'ecart-nok' : 'ecart-ok'}`}>
                                                <strong>{formatCurrency(closingComparison.ecart)}</strong>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* Billetage detail */}
                        {latestBilletage && (
                            <>
                                <h2>Détail du Billetage (Comptage Physique)</h2>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Coupure</th>
                                            <th className="text-center">Quantité</th>
                                            <th className="text-right">Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: 'Billets 10 000 FBu', qty: latestBilletage.bill10000, val: 10000 },
                                            { label: 'Billets 5 000 FBu', qty: latestBilletage.bill5000, val: 5000 },
                                            { label: 'Billets 2 000 FBu', qty: latestBilletage.bill2000, val: 2000 },
                                            { label: 'Billets 1 000 FBu', qty: latestBilletage.bill1000, val: 1000 },
                                            { label: 'Billets 500 FBu', qty: latestBilletage.bill500, val: 500 },
                                            { label: 'Pièces 100 FBu', qty: latestBilletage.coin100, val: 100 },
                                            { label: 'Pièces 50 FBu', qty: latestBilletage.coin50, val: 50 },
                                            { label: 'Pièces 10 FBu', qty: latestBilletage.coin10, val: 10 },
                                            { label: 'Pièces 5 FBu', qty: latestBilletage.coin5, val: 5 },
                                            { label: 'Pièces 1 FBu', qty: latestBilletage.coin1, val: 1 },
                                        ].filter(d => (d.qty || 0) > 0).map((d, i) => (
                                            <tr key={i}>
                                                <td>{d.label}</td>
                                                <td className="text-center">{d.qty}</td>
                                                <td className="text-right">{formatCurrency((d.qty || 0) * d.val)}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ borderTop: '2px solid #333', fontWeight: 'bold' }}>
                                            <td colSpan={2}>Total physique</td>
                                            <td className="text-right">{formatCurrency(latestBilletage.totalPhysique)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* Movements */}
                        <h2>Mouvements du jour ({movements.length})</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>N°</th>
                                    <th>Heure</th>
                                    <th>Type</th>
                                    <th>Sens</th>
                                    <th>Référence</th>
                                    <th>Libellé</th>
                                    <th className="text-right">Montant</th>
                                    <th className="text-right">Solde</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.map((m: any, i: number) => (
                                    <tr key={i}>
                                        <td className="text-center">{i + 1}</td>
                                        <td>{formatTime(m.heureOperation)}</td>
                                        <td>{m.operationType || '-'}</td>
                                        <td className={m.sens === 'CREDIT' ? 'ecart-ok' : 'ecart-nok'}>
                                            {m.sens === 'CREDIT' ? 'Entrée' : 'Sortie'}
                                        </td>
                                        <td>{m.reference || '-'}</td>
                                        <td>{m.libelle || '-'}</td>
                                        <td className="text-right">{formatCurrency(m.montant)}</td>
                                        <td className="text-right">{formatCurrency(m.soldeApres)}</td>
                                    </tr>
                                ))}
                                {movements.length === 0 && (
                                    <tr><td colSpan={8} className="text-center">Aucun mouvement pour cette date</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* Signatures */}
                        <div className="signature-area">
                            <div className="signature-block">
                                <strong>Le Caissier</strong>
                                <div className="signature-line">{selectedCaisse.agentName || ''}</div>
                            </div>
                            <div className="signature-block">
                                <strong>Le Chef d'Agence</strong>
                                <div className="signature-line"></div>
                            </div>
                            <div className="signature-block">
                                <strong>Le Contrôleur</strong>
                                <div className="signature-line"></div>
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* Interactive movements table */}
                    <h4><i className="pi pi-list mr-2"></i>Mouvements détaillés</h4>
                    <DataTable
                        value={movements}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="p-datatable-sm"
                        emptyMessage="Aucun mouvement trouvé"
                        stripedRows
                        showGridlines
                        sortField="heureOperation"
                        sortOrder={1}
                    >
                        <Column field="heureOperation" header="Heure" sortable style={{ width: '8%' }} />
                        <Column field="operationType" header="Type opération" sortable />
                        <Column field="sens" header="Sens" body={(row) => (
                            <Tag value={row.sens === 'CREDIT' ? 'Entrée' : 'Sortie'} severity={row.sens === 'CREDIT' ? 'success' : 'danger'} />
                        )} sortable style={{ width: '10%' }} />
                        <Column field="reference" header="Référence" sortable />
                        <Column field="libelle" header="Libellé" />
                        <Column field="montant" header="Montant" body={(row) => (
                            <span className={row.sens === 'CREDIT' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                {row.sens === 'CREDIT' ? '+' : '-'}{formatCurrency(row.montant)}
                            </span>
                        )} sortable style={{ width: '12%' }} />
                        <Column field="soldeApres" header="Solde après" body={(row) => formatCurrency(row.soldeApres)} style={{ width: '12%' }} />
                    </DataTable>
                </>
            )}
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_VIEW']}>
            <RapprochementCaissePage />
        </ProtectedPage>
    );
}
