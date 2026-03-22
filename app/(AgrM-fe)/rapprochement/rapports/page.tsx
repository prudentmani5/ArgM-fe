'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import {
    RapprochementBancaire, LigneRapprochement, EcartRapprochement,
    LigneReleve, MOIS_OPTIONS
} from '../types';
import { ProtectedPage } from '@/components/ProtectedPage';

function RapportsPage() {
    const [rapprochements, setRapprochements] = useState<RapprochementBancaire[]>([]);
    const [selectedRapprochementId, setSelectedRapprochementId] = useState<number | null>(null);
    const [selectedRapprochement, setSelectedRapprochement] = useState<RapprochementBancaire | null>(null);
    const [matchedLines, setMatchedLines] = useState<LigneRapprochement[]>([]);
    const [ecarts, setEcarts] = useState<EcartRapprochement[]>([]);
    const [lignesBanque, setLignesBanque] = useState<LigneReleve[]>([]);

    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const { data: rapprochementsData, error: rapprochementsError, fetchData: fetchRapprochements } = useConsumApi('');
    const { data: detailData, error: detailError, fetchData: fetchDetail, callType: detailCallType } = useConsumApi('');
    const { data: matchesData, error: matchesError, fetchData: fetchMatches } = useConsumApi('');
    const { data: ecartsData, error: ecartsError, fetchData: fetchEcarts } = useConsumApi('');
    const { data: lignesData, error: lignesError, fetchData: fetchLignes } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/rapprochement/rapprochements');
    const RELEVES_URL = buildApiUrl('/api/rapprochement/releves');

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadRapprochements();
    }, []);

    useEffect(() => {
        if (rapprochementsData) {
            const arr = Array.isArray(rapprochementsData) ? rapprochementsData : rapprochementsData.content || [];
            setRapprochements(arr);
        }
        if (rapprochementsError) {
            showToast('error', 'Erreur', rapprochementsError.message || 'Erreur de chargement');
        }
    }, [rapprochementsData, rapprochementsError]);

    useEffect(() => {
        if (detailData && detailCallType === 'loadDetail') {
            setSelectedRapprochement(detailData as RapprochementBancaire);
        }
    }, [detailData, detailCallType]);

    useEffect(() => {
        if (matchesData) setMatchedLines(Array.isArray(matchesData) ? matchesData : []);
    }, [matchesData]);

    useEffect(() => {
        if (ecartsData) setEcarts(Array.isArray(ecartsData) ? ecartsData : []);
    }, [ecartsData]);

    useEffect(() => {
        if (lignesData) setLignesBanque(Array.isArray(lignesData) ? lignesData : []);
    }, [lignesData]);

    const loadRapprochements = () => {
        fetchRapprochements(null, 'GET', `${BASE_URL}/findall`, 'loadRapprochements');
    };

    const handleRapprochementChange = (rapprochementId: number) => {
        setSelectedRapprochementId(rapprochementId);
        if (rapprochementId) {
            fetchDetail(null, 'GET', `${BASE_URL}/findbyid/${rapprochementId}`, 'loadDetail');
            fetchMatches(null, 'GET', `${BASE_URL}/matches/${rapprochementId}`, 'loadMatches');
            fetchEcarts(null, 'GET', `${BASE_URL}/ecarts/${rapprochementId}`, 'loadEcarts');
            const rap = rapprochements.find(r => r.id === rapprochementId);
            if (rap?.releveBancaire?.id) {
                fetchLignes(null, 'GET', `${RELEVES_URL}/lignes/${rap.releveBancaire.id}`, 'loadLignes');
            }
        } else {
            setSelectedRapprochement(null);
            setMatchedLines([]);
            setEcarts([]);
            setLignesBanque([]);
        }
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContents = printRef.current.innerHTML;
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>État de rapprochement bancaire - ${selectedRapprochement?.reference}</title>
                        <style>
                            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px 30px; font-size: 11px; color: #333; }
                            h1 { text-align: center; font-size: 16px; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 1px; }
                            h2 { font-size: 13px; margin-top: 20px; border-bottom: 2px solid #2196F3; padding-bottom: 4px; color: #1565C0; }
                            h3 { font-size: 11px; text-align: center; color: #666; margin-top: 2px; margin-bottom: 15px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                            th, td { border: 1px solid #ddd; padding: 5px 8px; text-align: left; }
                            th { background-color: #E3F2FD; font-weight: 600; color: #1565C0; font-size: 10px; text-transform: uppercase; }
                            .text-right { text-align: right; }
                            .text-center { text-align: center; }
                            .summary-box { border: 2px solid #1565C0; padding: 10px; margin: 10px 0; border-radius: 4px; }
                            .summary-box td { border: none; padding: 4px 8px; }
                            .summary-box tr:last-child { border-top: 2px solid #1565C0; }
                            .signature-area { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
                            .signature-block { width: 42%; text-align: center; }
                            .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 5px; }
                            .tag-resolved { color: #2E7D32; font-weight: bold; }
                            .tag-unresolved { color: #C62828; font-weight: bold; }
                            .header-info { background-color: #FAFAFA; border: 1px solid #ddd; border-radius: 4px; padding: 8px; margin-bottom: 15px; }
                            .header-info td { border: none; padding: 3px 8px; }
                            .header-info td:first-child { font-weight: 600; width: 30%; color: #555; }
                            .stat-highlight { font-size: 14px; font-weight: bold; color: #1565C0; }
                            .footer-note { text-align: center; margin-top: 30px; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
                            @media print {
                                body { margin: 10px 15px; }
                                .page-break { page-break-before: always; }
                            }
                        </style>
                    </head>
                    <body>${printContents}</body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    const formatCurrency = (value: number | undefined) => {
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value || 0);
    };

    const formatDate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const formatDateTime = (date: string | undefined) => {
        return date ? new Date(date).toLocaleString('fr-FR') : '-';
    };

    const getMoisLabel = (mois: number) => {
        return MOIS_OPTIONS.find(m => m.value === mois)?.label || '';
    };

    const rapprochementOptionTemplate = (option: RapprochementBancaire) => (
        <div className="flex align-items-center justify-content-between w-full">
            <span>{option.reference} - {option.releveBancaire?.nomBanque} ({getMoisLabel(option.mois)} {option.annee})</span>
            <Tag value={getStatutLabel(option.statut)} severity={getStatutSeverity(option.statut)} className="ml-2" />
        </div>
    );

    const getStatutLabel = (statut: string) => {
        const map: Record<string, string> = { 'BROUILLON': 'Brouillon', 'EN_COURS': 'En cours', 'TERMINE': 'Terminé', 'VALIDE': 'Validé' };
        return map[statut] || statut;
    };

    const getStatutSeverity = (statut: string): 'info' | 'warning' | 'success' | 'danger' | null => {
        const map: Record<string, 'info' | 'warning' | 'success' | 'danger' | null> = {
            'BROUILLON': null, 'EN_COURS': 'warning', 'TERMINE': 'info', 'VALIDE': 'success'
        };
        return map[statut] || 'info';
    };

    const ecartsResolus = ecarts.filter(e => e.resolu).length;
    const ecartsNonResolus = ecarts.filter(e => !e.resolu).length;
    const lignesRapprochees = lignesBanque.filter(l => l.rapprochee).length;
    const lignesNonRapprochees = lignesBanque.filter(l => !l.rapprochee).length;
    const tauxRapprochement = lignesBanque.length > 0 ? Math.round((lignesRapprochees / lignesBanque.length) * 100) : 0;

    const typeEcartLabels: Record<string, string> = {
        'CHEQUE_NON_DEBITE': 'Chèque non débité',
        'VIREMENT_EN_COURS': 'Virement en cours',
        'FRAIS_BANCAIRES': 'Frais bancaires',
        'ERREUR_SAISIE': 'Erreur de saisie',
        'AUTRE': 'Autre'
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2><i className="pi pi-print mr-2"></i>Rapports de Rapprochement</h2>

            {/* Rapprochement Selector */}
            <div className="p-fluid formgrid grid mb-4">
                <div className="field col-12 md:col-6">
                    <label htmlFor="rapprochement" className="font-semibold">Sélectionner un rapprochement</label>
                    <Dropdown
                        id="rapprochement"
                        value={selectedRapprochementId}
                        options={rapprochements}
                        onChange={(e) => handleRapprochementChange(e.value)}
                        optionLabel="reference"
                        optionValue="id"
                        itemTemplate={rapprochementOptionTemplate}
                        placeholder="Sélectionner un rapprochement"
                        filter
                        showClear
                    />
                </div>
                <div className="field col-12 md:col-6 flex align-items-end gap-2">
                    {selectedRapprochement && (
                        <>
                            <Button label="Imprimer" icon="pi pi-print" onClick={handlePrint} />
                            <Tag value={getStatutLabel(selectedRapprochement.statut)} severity={getStatutSeverity(selectedRapprochement.statut)} className="text-base p-2" />
                        </>
                    )}
                </div>
            </div>

            {!selectedRapprochement && (
                <div className="text-center text-500 p-5">
                    <i className="pi pi-file text-4xl mb-3 block"></i>
                    <p>Sélectionnez un rapprochement pour générer le rapport</p>
                </div>
            )}

            {/* Summary Cards (screen only) */}
            {selectedRapprochement && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-3">
                        <Card className="shadow-1">
                            <div className="text-center">
                                <span className="block text-500 font-medium mb-1">Taux de Rapprochement</span>
                                <div className={`font-bold text-3xl ${tauxRapprochement === 100 ? 'text-green-500' : 'text-blue-500'}`}>{tauxRapprochement}%</div>
                                <span className="text-sm text-500">{lignesRapprochees}/{lignesBanque.length} lignes</span>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="shadow-1">
                            <div className="text-center">
                                <span className="block text-500 font-medium mb-1">Correspondances</span>
                                <div className="text-green-500 font-bold text-3xl">{matchedLines.length}</div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="shadow-1">
                            <div className="text-center">
                                <span className="block text-500 font-medium mb-1">Écarts</span>
                                <div className={`font-bold text-3xl ${ecartsNonResolus > 0 ? 'text-orange-500' : 'text-green-500'}`}>{ecarts.length}</div>
                                <span className="text-sm text-500">{ecartsNonResolus} non résolu(s)</span>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="shadow-1">
                            <div className="text-center">
                                <span className="block text-500 font-medium mb-1">Écart Solde</span>
                                <div className={`font-bold text-2xl ${selectedRapprochement.ecart !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {formatCurrency(selectedRapprochement.ecart)}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Printable Report */}
            {selectedRapprochement && (
                <div className="surface-card p-4 border-round shadow-2">
                    <div ref={printRef}>
                        <h1>ÉTAT DE RAPPROCHEMENT BANCAIRE</h1>
                        <h3>{selectedRapprochement.releveBancaire?.nomBanque} - Compte N° {selectedRapprochement.releveBancaire?.numeroCompte}</h3>
                        <h3>Période: {getMoisLabel(selectedRapprochement.mois)} {selectedRapprochement.annee}</h3>

                        {/* Info summary */}
                        <div className="header-info">
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Référence</td>
                                        <td>{selectedRapprochement.reference}</td>
                                        <td>Date du rapprochement</td>
                                        <td>{formatDate(selectedRapprochement.dateRapprochement)}</td>
                                    </tr>
                                    <tr>
                                        <td>Statut</td>
                                        <td>{getStatutLabel(selectedRapprochement.statut)}</td>
                                        <td>Taux de rapprochement</td>
                                        <td><span className="stat-highlight">{tauxRapprochement}%</span> ({lignesRapprochees}/{lignesBanque.length} lignes)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Balances */}
                        <h2>Soldes</h2>
                        <div className="summary-box">
                            <table>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '60%' }}>Solde du relevé bancaire (fin de période)</td>
                                        <td className="text-right stat-highlight">{formatCurrency(selectedRapprochement.soldeBanque)}</td>
                                    </tr>
                                    <tr>
                                        <td>Solde comptable</td>
                                        <td className="text-right stat-highlight">{formatCurrency(selectedRapprochement.soldeComptable)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Écart</strong></td>
                                        <td className="text-right"><strong style={{ fontSize: '14px', color: selectedRapprochement.ecart !== 0 ? '#C62828' : '#2E7D32' }}>{formatCurrency(selectedRapprochement.ecart)}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Matched Items */}
                        <h2>Éléments rapprochés ({matchedLines.length})</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>N°</th>
                                    <th>Ligne Bancaire ID</th>
                                    <th>Écriture ID</th>
                                    <th>Type</th>
                                    <th style={{ width: '12%' }}>Confiance</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchedLines.map((match, i) => (
                                    <tr key={i}>
                                        <td className="text-center">{i + 1}</td>
                                        <td>{match.ligneReleveId}</td>
                                        <td>{match.ecritureId}</td>
                                        <td>{match.typeMatch === 'AUTO' ? 'Automatique' : 'Manuel'}</td>
                                        <td className="text-center">{match.confiance}%</td>
                                        <td>{match.notes || '-'}</td>
                                    </tr>
                                ))}
                                {matchedLines.length === 0 && (
                                    <tr><td colSpan={6} className="text-center">Aucun élément rapproché</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* Discrepancies */}
                        <h2>Écarts identifiés ({ecarts.length}) - {ecartsResolus} résolu(s), {ecartsNonResolus} non résolu(s)</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>N°</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th style={{ width: '12%' }}>Montant</th>
                                    <th>Justification</th>
                                    <th style={{ width: '10%' }}>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ecarts.map((ecart, i) => (
                                    <tr key={i}>
                                        <td className="text-center">{i + 1}</td>
                                        <td>{typeEcartLabels[ecart.typeEcart] || ecart.typeEcart}</td>
                                        <td>{ecart.description}</td>
                                        <td className="text-right">{formatCurrency(ecart.montant)}</td>
                                        <td>{ecart.justification || '-'}</td>
                                        <td className={ecart.resolu ? 'tag-resolved text-center' : 'tag-unresolved text-center'}>
                                            {ecart.resolu ? 'Résolu' : 'Non résolu'}
                                        </td>
                                    </tr>
                                ))}
                                {ecarts.length === 0 && (
                                    <tr><td colSpan={6} className="text-center">Aucun écart identifié</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* Unreconciled bank lines */}
                        {lignesNonRapprochees > 0 && (
                            <>
                                <h2>Lignes bancaires non rapprochées ({lignesNonRapprochees})</h2>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '5%' }}>N°</th>
                                            <th>Date</th>
                                            <th>Référence</th>
                                            <th>Description</th>
                                            <th style={{ width: '12%' }}>Débit</th>
                                            <th style={{ width: '12%' }}>Crédit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lignesBanque.filter(l => !l.rapprochee).map((ligne, i) => (
                                            <tr key={i}>
                                                <td className="text-center">{i + 1}</td>
                                                <td>{formatDate(ligne.dateOperation)}</td>
                                                <td>{ligne.reference}</td>
                                                <td>{ligne.description}</td>
                                                <td className="text-right">{ligne.montantDebit > 0 ? formatCurrency(ligne.montantDebit) : '-'}</td>
                                                <td className="text-right">{ligne.montantCredit > 0 ? formatCurrency(ligne.montantCredit) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* All bank lines summary */}
                        <h2>Détail du relevé bancaire ({lignesBanque.length} lignes)</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>N°</th>
                                    <th>Date</th>
                                    <th>Référence</th>
                                    <th>Description</th>
                                    <th style={{ width: '10%' }}>Débit</th>
                                    <th style={{ width: '10%' }}>Crédit</th>
                                    <th style={{ width: '10%' }}>Solde</th>
                                    <th style={{ width: '10%' }}>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lignesBanque.map((ligne, i) => (
                                    <tr key={i}>
                                        <td className="text-center">{i + 1}</td>
                                        <td>{formatDate(ligne.dateOperation)}</td>
                                        <td>{ligne.reference}</td>
                                        <td>{ligne.description}</td>
                                        <td className="text-right">{ligne.montantDebit > 0 ? formatCurrency(ligne.montantDebit) : '-'}</td>
                                        <td className="text-right">{ligne.montantCredit > 0 ? formatCurrency(ligne.montantCredit) : '-'}</td>
                                        <td className="text-right">{formatCurrency(ligne.solde)}</td>
                                        <td className={`text-center ${ligne.rapprochee ? 'tag-resolved' : 'tag-unresolved'}`}>
                                            {ligne.rapprochee ? 'Rapprochée' : 'Non rapprochée'}
                                        </td>
                                    </tr>
                                ))}
                                {lignesBanque.length === 0 && (
                                    <tr><td colSpan={8} className="text-center">Aucune ligne</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* Signatures */}
                        <div className="signature-area">
                            <div className="signature-block">
                                <strong>Le Comptable</strong>
                                <div className="signature-line">
                                    {selectedRapprochement.comptableSignature && (
                                        <div>
                                            <div>{selectedRapprochement.comptableSignature}</div>
                                            <div style={{ fontSize: '10px', color: '#666' }}>{formatDateTime(selectedRapprochement.comptableSignatureDate)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="signature-block">
                                <strong>Le Directeur Financier</strong>
                                <div className="signature-line">
                                    {selectedRapprochement.directeurSignature && (
                                        <div>
                                            <div>{selectedRapprochement.directeurSignature}</div>
                                            <div style={{ fontSize: '10px', color: '#666' }}>{formatDateTime(selectedRapprochement.directeurSignatureDate)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="footer-note">
                            Document généré le {new Date().toLocaleString('fr-FR')} — Rapprochement bancaire {selectedRapprochement.reference}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_REPORT']}>
            <RapportsPage />
        </ProtectedPage>
    );
}
