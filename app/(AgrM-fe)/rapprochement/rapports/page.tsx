'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';

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
            // Load lignes from the rapprochement's releve
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
                            body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                            h1 { text-align: center; font-size: 18px; margin-bottom: 5px; }
                            h2 { font-size: 14px; margin-top: 20px; border-bottom: 1px solid #333; padding-bottom: 5px; }
                            h3 { font-size: 12px; text-align: center; color: #666; margin-top: 0; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
                            th { background-color: #f5f5f5; font-weight: bold; }
                            .text-right { text-align: right; }
                            .text-center { text-align: center; }
                            .summary-box { border: 2px solid #333; padding: 10px; margin: 10px 0; }
                            .signature-area { margin-top: 40px; display: flex; justify-content: space-between; }
                            .signature-block { width: 45%; text-align: center; }
                            .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
                            .tag-resolved { color: green; font-weight: bold; }
                            .tag-unresolved { color: red; font-weight: bold; }
                            @media print { body { margin: 0; } }
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
        <span>{option.reference} - {option.releveBancaire?.nomBanque} ({getMoisLabel(option.mois)} {option.annee})</span>
    );

    const getStatutLabel = (statut: string) => {
        const map: Record<string, string> = { 'BROUILLON': 'Brouillon', 'EN_COURS': 'En cours', 'TERMINE': 'Terminé', 'VALIDE': 'Validé' };
        return map[statut] || statut;
    };

    const ecartsResolus = ecarts.filter(e => e.resolu).length;
    const ecartsNonResolus = ecarts.filter(e => !e.resolu).length;
    const lignesRapprochees = lignesBanque.filter(l => l.rapprochee).length;
    const lignesNonRapprochees = lignesBanque.filter(l => !l.rapprochee).length;

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2><i className="pi pi-print mr-2"></i>Rapports de Rapprochement</h2>

            {/* Rapprochement Selector */}
            <div className="p-fluid formgrid grid mb-4">
                <div className="field col-12 md:col-6">
                    <label htmlFor="rapprochement">Sélectionner un rapprochement</label>
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
                <div className="field col-12 md:col-6 flex align-items-end">
                    {selectedRapprochement && (
                        <Button label="Imprimer" icon="pi pi-print" onClick={handlePrint} />
                    )}
                </div>
            </div>

            {!selectedRapprochement && (
                <div className="text-center text-500 p-5">
                    <i className="pi pi-file text-4xl mb-3 block"></i>
                    <p>Sélectionnez un rapprochement pour générer le rapport</p>
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
                        <table>
                            <tbody>
                                <tr>
                                    <td><strong>Référence</strong></td>
                                    <td>{selectedRapprochement.reference}</td>
                                    <td><strong>Date du rapprochement</strong></td>
                                    <td>{formatDate(selectedRapprochement.dateRapprochement)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Statut</strong></td>
                                    <td>{getStatutLabel(selectedRapprochement.statut)}</td>
                                    <td><strong>Lignes rapprochées</strong></td>
                                    <td>{lignesRapprochees} / {lignesBanque.length}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Balances */}
                        <h2>Soldes</h2>
                        <div className="summary-box">
                            <table>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '60%' }}><strong>Solde du relevé bancaire (fin de période)</strong></td>
                                        <td className="text-right"><strong>{formatCurrency(selectedRapprochement.soldeBanque)}</strong></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Solde comptable</strong></td>
                                        <td className="text-right"><strong>{formatCurrency(selectedRapprochement.soldeComptable)}</strong></td>
                                    </tr>
                                    <tr style={{ borderTop: '2px solid #333' }}>
                                        <td><strong>Écart</strong></td>
                                        <td className="text-right"><strong>{formatCurrency(selectedRapprochement.ecart)}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Matched Items */}
                        <h2>Éléments rapprochés ({matchedLines.length})</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Ligne Bancaire ID</th>
                                    <th>Écriture ID</th>
                                    <th>Type</th>
                                    <th>Confiance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchedLines.map((match, i) => (
                                    <tr key={i}>
                                        <td>{match.ligneReleveId}</td>
                                        <td>{match.ecritureId}</td>
                                        <td>{match.typeMatch === 'AUTO' ? 'Automatique' : 'Manuel'}</td>
                                        <td className="text-center">{match.confiance}%</td>
                                    </tr>
                                ))}
                                {matchedLines.length === 0 && (
                                    <tr><td colSpan={4} className="text-center">Aucun élément rapproché</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* Discrepancies */}
                        <h2>Écarts identifiés ({ecarts.length}) - {ecartsResolus} résolu(s), {ecartsNonResolus} non résolu(s)</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Montant</th>
                                    <th>Justification</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ecarts.map((ecart, i) => {
                                    const typeLabels: Record<string, string> = {
                                        'CHEQUE_NON_DEBITE': 'Chèque non débité',
                                        'VIREMENT_EN_COURS': 'Virement en cours',
                                        'FRAIS_BANCAIRES': 'Frais bancaires',
                                        'ERREUR_SAISIE': 'Erreur de saisie',
                                        'AUTRE': 'Autre'
                                    };
                                    return (
                                        <tr key={i}>
                                            <td>{typeLabels[ecart.typeEcart] || ecart.typeEcart}</td>
                                            <td>{ecart.description}</td>
                                            <td className="text-right">{formatCurrency(ecart.montant)}</td>
                                            <td>{ecart.justification || '-'}</td>
                                            <td className={ecart.resolu ? 'tag-resolved' : 'tag-unresolved'}>
                                                {ecart.resolu ? 'Résolu' : 'Non résolu'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {ecarts.length === 0 && (
                                    <tr><td colSpan={5} className="text-center">Aucun écart identifié</td></tr>
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
                                            <th>Date</th>
                                            <th>Référence</th>
                                            <th>Description</th>
                                            <th>Débit</th>
                                            <th>Crédit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lignesBanque.filter(l => !l.rapprochee).map((ligne, i) => (
                                            <tr key={i}>
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
