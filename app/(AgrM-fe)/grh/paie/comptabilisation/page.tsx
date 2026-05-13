'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../../utils/apiConfig';
import { CptExercice } from '../../../comptabilite/exercice/CptExercice';
import { CptBrouillard } from '../../../comptabilite/brouillard/CptBrouillard';
import { PeriodePaie } from '../periodePaie/PeriodePaie';
import { PaieCptEcriture } from './PaieCptEcriture';

const ComptabilisationPaiePage = () => {
    const baseUrl = `${API_BASE_URL}`;

    // State for dropdowns
    const [exercices, setExercices] = useState<CptExercice[]>([]);
    const [brouillards, setBrouillards] = useState<CptBrouillard[]>([]);
    const [periodePaies, setPeriodePaies] = useState<PeriodePaie[]>([]);

    // Selected values
    const [selectedExercice, setSelectedExercice] = useState<CptExercice | null>(null);
    const [selectedBrouillard, setSelectedBrouillard] = useState<CptBrouillard | null>(null);
    const [selectedPeriode, setSelectedPeriode] = useState<PeriodePaie | null>(null);

    // Data state
    const [mouvements, setMouvements] = useState<PaieCptEcriture[]>([]);
    const [totalDebit, setTotalDebit] = useState<number>(0);
    const [totalCredit, setTotalCredit] = useState<number>(0);
    const [periodLabel, setPeriodLabel] = useState<string>('');

    // Loading states
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [loadingSave, setLoadingSave] = useState<boolean>(false);

    // API hooks
    const { data: exerciceData, fetchData: fetchExercices, callType: exerciceCallType } = useConsumApi('');
    const { data: brouillardData, fetchData: fetchBrouillards, callType: brouillardCallType } = useConsumApi('');
    const { data: periodeData, fetchData: fetchPeriodes, callType: periodeCallType } = useConsumApi('');
    const { data: comptaData, error: comptaError, fetchData: fetchComptaData, callType: comptaCallType } = useConsumApi('');
    const { data: saveData, error: saveError, fetchData: fetchSaveData, callType: saveCallType } = useConsumApi('');

    const toast = useRef<Toast>(null);

    const monthNames = [
        '', 'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
    ];

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Load periodes function
    const loadPeriodes = (year: number) => {
        fetchPeriodes(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${year}`, 'loadPeriodes');
    };

    // Load exercices on mount
    useEffect(() => {
        fetchExercices(null, 'Get', `${baseUrl}/exercices/findall`, 'loadExercices');
    }, []);

    // Handle exercice data
    useEffect(() => {
        if (exerciceData && exerciceCallType === 'loadExercices') {
            setExercices(Array.isArray(exerciceData) ? exerciceData : [exerciceData]);
        }
    }, [exerciceData, exerciceCallType]);

    // Handle brouillard data - filter to only show salary brouillards (starting with "Sal")
    useEffect(() => {
        if (brouillardData && brouillardCallType === 'loadBrouillards') {
            const allBrouillards = Array.isArray(brouillardData) ? brouillardData : [brouillardData];
            const salBrouillards = allBrouillards.filter(
                (b: CptBrouillard) => b.codeBrouillard && b.codeBrouillard.toLowerCase().startsWith('sal')
            );
            setBrouillards(salBrouillards);
            // Auto-select brouillard if a period is already selected
            if (selectedPeriode) {
                const matched = findMatchingBrouillard(selectedPeriode.mois, salBrouillards);
                if (matched) {
                    setSelectedBrouillard(matched);
                }
            }
        }
    }, [brouillardData, brouillardCallType]);

    // Handle periode data
    useEffect(() => {
        if (periodeData && periodeCallType === 'loadPeriodes') {
            const periodes = Array.isArray(periodeData) ? periodeData : [periodeData];
            // Sort by month descending (most recent first)
            const sortedPeriodes = periodes.sort((a: PeriodePaie, b: PeriodePaie) => {
                if (b.annee !== a.annee) return b.annee - a.annee;
                return b.mois - a.mois;
            });
            setPeriodePaies(sortedPeriodes);
        }
    }, [periodeData, periodeCallType]);

    // Handle comptabilisation data
    useEffect(() => {
        if (comptaData && comptaCallType === 'loadComptaData') {
            const data = comptaData as any;
            const ecritures = data.ecritures || [];
            const mappedEcritures: PaieCptEcriture[] = ecritures.map((e: any) => {
                const ecriture = new PaieCptEcriture();
                ecriture.ecritureId = e.ecritureId || null;
                ecriture.pieceId = e.pieceId || '';
                ecriture.exerciceId = e.exerciceId || '';
                ecriture.compteId = e.compteId || '';
                ecriture.numeroPiece = e.numeroPiece || '';
                ecriture.journalId = e.journalId || '';
                ecriture.brouillardId = e.brouillardId || '';
                ecriture.reference = e.reference || '';
                ecriture.dateEcriture = e.dateEcriture || '';
                ecriture.debit = e.debit || 0;
                ecriture.credit = e.credit || 0;
                ecriture.valide = e.valide || false;
                ecriture.rapproche = e.rapproche || false;
                ecriture.userCreation = e.userCreation || '';
                return ecriture;
            });
            setMouvements(mappedEcritures);
            setTotalDebit(data.totalDebit || 0);
            setTotalCredit(data.totalCredit || 0);
            setPeriodLabel(selectedPeriode ? `${monthNames[selectedPeriode.mois]} ${selectedPeriode.annee}` : '');
            setLoadingData(false);
            accept('success', 'Donnees chargees', `${mappedEcritures.length} mouvements comptables charges avec succes.`);
        }
        if (comptaError && comptaCallType === 'loadComptaData') {
            setLoadingData(false);
            accept('error', 'Erreur', 'Impossible de charger les donnees de comptabilisation.');
        }
    }, [comptaData, comptaError, comptaCallType]);

    // Handle save/update response
    useEffect(() => {
        if (saveData && (saveCallType === 'transferer' || saveCallType === 'mettreAJour')) {
            setLoadingSave(false);
            const result = saveData as any;
            if (result.success) {
                accept('success', 'Succès', result.message || 'Opération réussie.');
                setMouvements([]);
                setTotalDebit(0);
                setTotalCredit(0);
                // Mark the period as transferred
                if (saveCallType === 'transferer' && selectedPeriode) {
                    setSelectedPeriode({ ...selectedPeriode, transfertCompta: true });
                }
            } else {
                accept('error', 'Erreur', result.error || 'Erreur inconnue.');
            }
        }
        if (saveError && (saveCallType === 'transferer' || saveCallType === 'mettreAJour')) {
            setLoadingSave(false);
            accept('error', 'Erreur', 'Impossible de sauvegarder les écritures comptables.');
        }
    }, [saveData, saveError, saveCallType]);

    // Check if selected period is closed
    const isPeriodeClosed = (periode: PeriodePaie | null): boolean => {
        if (!periode) return false;
        return !!periode.dateCloture && periode.dateCloture.trim() !== '';
    };

    // Find matching brouillard by month number
    const findMatchingBrouillard = (mois: number, brouillardsList: CptBrouillard[]): CptBrouillard | null => {
        return brouillardsList.find(b => {
            const code = b.codeBrouillard.toLowerCase();
            if (!code.startsWith('sal')) return false;
            const num = parseInt(code.substring(3), 10);
            return num === mois;
        }) || null;
    };

    // Load brouillards and periods when exercice changes
    const handleExerciceChange = (e: DropdownChangeEvent) => {
        const exercice = e.value as CptExercice;
        setSelectedExercice(exercice);
        setSelectedBrouillard(null);
        setSelectedPeriode(null);
        setBrouillards([]);
        setPeriodePaies([]);

        if (exercice && exercice.exerciceId) {
            fetchBrouillards(null, 'Get', `${baseUrl}/brouillards/findbyexercice/${exercice.exerciceId}`, 'loadBrouillards');
            // Extract year from exercice dateDebut and load periods
            if (exercice.dateDebut) {
                const year = new Date(exercice.dateDebut).getFullYear();
                loadPeriodes(year);
            }
        }
    };

    const handlePeriodeChange = (e: DropdownChangeEvent) => {
        const periode = e.value as PeriodePaie;
        setSelectedPeriode(periode);
        // Auto-select matching brouillard based on month
        if (periode) {
            const matched = findMatchingBrouillard(periode.mois, brouillards);
            if (matched) {
                setSelectedBrouillard(matched);
            }
        }
    };

    // Transfer entries to accounting (for open periods)
    const handleTransferer = () => {
        if (mouvements.length === 0 || !selectedPeriode) return;

        setLoadingSave(true);
        const ecrituresPayload = mouvements.map(m => m.toCptEcriture());

        fetchSaveData(
            { ecritures: ecrituresPayload, periodeId: selectedPeriode.periodeId },
            'POST',
            `${baseUrl}/api/grh/paie/saisie-paie/comptabilisation/transferer`,
            'transferer'
        );
    };

    // Update existing entries (for closed periods: delete + save)
    const handleMettreAJour = () => {
        if (mouvements.length === 0 || !selectedExercice || !selectedBrouillard) return;

        setLoadingSave(true);
        const ecrituresPayload = mouvements.map(m => m.toCptEcriture());

        fetchSaveData(
            {
                exerciceId: selectedExercice.exerciceId,
                brouillardId: selectedBrouillard.brouillardId,
                ecritures: ecrituresPayload
            },
            'POST',
            `${baseUrl}/api/grh/paie/saisie-paie/comptabilisation/mettre-a-jour`,
            'mettreAJour'
        );
    };

    const handleChargerDonnees = () => {
        if (!selectedPeriode || !selectedExercice || !selectedBrouillard) {
            accept('warn', 'Validation', 'Veuillez selectionner la periode, l\'exercice et le brouillard.');
            return;
        }

        setLoadingData(true);
        setMouvements([]);
        setTotalDebit(0);
        setTotalCredit(0);

        fetchComptaData(null, 'Get',
            `${baseUrl}/api/grh/paie/saisie-paie/comptabilisation/mouvements?month=${selectedPeriode.mois}&year=${selectedPeriode.annee}&exerciceId=${selectedExercice.exerciceId}&brouillardId=${selectedBrouillard.brouillardId}`,
            'loadComptaData');
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        if (amount === 0) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format period label for dropdown
    const formatPeriodLabel = (periode: PeriodePaie) => {
        return `${monthNames[periode.mois]} ${periode.annee}`;
    };

    // Format exercice label for dropdown
    const formatExerciceLabel = (exercice: CptExercice) => {
        return `${exercice.codeExercice} - ${exercice.description}`;
    };

    // Format brouillard label for dropdown
    const formatBrouillardLabel = (brouillard: CptBrouillard) => {
        return `${brouillard.codeBrouillard} - ${brouillard.description}`;
    };

    // Column body templates
    const compteBodyTemplate = (rowData: PaieCptEcriture) => {
        return rowData.getCodeCompte();
    };

    const debitBodyTemplate = (rowData: PaieCptEcriture) => {
        return formatCurrency(rowData.debit);
    };

    const creditBodyTemplate = (rowData: PaieCptEcriture) => {
        return formatCurrency(rowData.credit);
    };

    // Footer group for totals
    const footerGroup = (
        <ColumnGroup>
            <Row>
                <Column footer="Totaux:" colSpan={2} footerStyle={{ textAlign: 'right', fontWeight: 'bold' }} />
                <Column footer={formatCurrency(totalDebit)} footerStyle={{ textAlign: 'right', fontWeight: 'bold' }} />
                <Column footer={formatCurrency(totalCredit)} footerStyle={{ textAlign: 'right', fontWeight: 'bold' }} />
            </Row>
        </ColumnGroup>
    );

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h3>Comptabilisation de la Paie</h3>

                {/* Selection Form */}
                <Card className="mb-4">
                    <div className="formgrid grid">
                        {/* Exercice selection */}
                        <div className="field col-12 md:col-4">
                            <label htmlFor="exercice" className="font-bold">Exercice Comptable *</label>
                            <Dropdown
                                id="exercice"
                                value={selectedExercice}
                                options={exercices}
                                onChange={handleExerciceChange}
                                optionLabel={(e) => formatExerciceLabel(e)}
                                placeholder="Selectionner un exercice"
                                className="w-full"
                                filter
                                emptyMessage="Aucun exercice disponible"
                            />
                        </div>

                        {/* Periode selection */}
                        <div className="field col-12 md:col-4">
                            <label htmlFor="periode" className="font-bold">Periode de Paie *</label>
                            <Dropdown
                                id="periode"
                                value={selectedPeriode}
                                options={periodePaies}
                                onChange={handlePeriodeChange}
                                optionLabel={(p) => formatPeriodLabel(p)}
                                placeholder="Selectionner une periode"
                                className="w-full"
                                filter
                                disabled={!selectedExercice}
                                emptyMessage="Aucune periode disponible"
                            />
                        </div>

                        {/* Brouillard (auto-selected) */}
                        <div className="field col-12 md:col-4">
                            <label htmlFor="brouillard" className="font-bold">Brouillard</label>
                            <Dropdown
                                id="brouillard"
                                value={selectedBrouillard}
                                options={brouillards}
                                onChange={(e: DropdownChangeEvent) => setSelectedBrouillard(e.value as CptBrouillard)}
                                optionLabel={(b) => formatBrouillardLabel(b)}
                                placeholder="Selection automatique"
                                className="w-full"
                                disabled={!selectedExercice}
                                emptyMessage="Aucun brouillard disponible"
                            />
                        </div>
                    </div>

                    <div className="flex justify-content-center mt-3">
                        <Button
                            icon="pi pi-download"
                            label="Charger les donnees"
                            onClick={handleChargerDonnees}
                            loading={loadingData}
                            disabled={!selectedPeriode || !selectedExercice || !selectedBrouillard}
                            severity="info"
                        />
                    </div>
                </Card>

                {/* Period Label */}
                {periodLabel && (
                    <div className="text-center mb-3">
                        <h4 className="text-primary">
                            <u>Mouvements Comptables: {periodLabel}</u>
                        </h4>
                    </div>
                )}

                {/* Data Table */}
                <DataTable
                    value={mouvements}
                    emptyMessage="Aucune donnee a afficher. Veuillez charger les donnees."
                    tableStyle={{ minWidth: '50rem' }}
                    stripedRows
                    showGridlines
                    footerColumnGroup={mouvements.length > 0 ? footerGroup : undefined}
                >
                    <Column
                        field="compteId"
                        header="Compte"
                        body={compteBodyTemplate}
                        sortable
                        style={{ width: '15%' }}
                    />
                    <Column
                        field="reference"
                        header="Reference"
                        sortable
                        style={{ width: '45%' }}
                    />
                    <Column
                        field="debit"
                        header="Debit"
                        body={debitBodyTemplate}
                        sortable
                        style={{ width: '20%', textAlign: 'right' }}
                        bodyStyle={{ textAlign: 'right' }}
                        headerStyle={{ textAlign: 'right' }}
                    />
                    <Column
                        field="credit"
                        header="Credit"
                        body={creditBodyTemplate}
                        sortable
                        style={{ width: '20%', textAlign: 'right' }}
                        bodyStyle={{ textAlign: 'right' }}
                        headerStyle={{ textAlign: 'right' }}
                    />
                </DataTable>

                {/* Balance check */}
                {mouvements.length > 0 && (
                    <div className="mt-3">
                        {totalDebit === totalCredit ? (
                            <div className="p-message p-message-success">
                                <div className="p-message-wrapper">
                                    <span className="p-message-icon pi pi-check-circle"></span>
                                    <div className="p-message-text">
                                        Les ecritures sont equilibrees (Debit = Credit = {formatCurrency(totalDebit)} BIF)
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-message p-message-error">
                                <div className="p-message-wrapper">
                                    <span className="p-message-icon pi pi-times-circle"></span>
                                    <div className="p-message-text">
                                        Attention: Les ecritures ne sont pas equilibrees!
                                        Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))} BIF
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Transfer / Update button */}
                {mouvements.length > 0 && selectedExercice && selectedBrouillard && totalDebit === totalCredit && (
                    <div className="flex justify-content-center mt-3">
                        {selectedPeriode?.transfertCompta ? (
                            <Button
                                icon="pi pi-refresh"
                                label="Mettre à jour les ecritures comptables"
                                onClick={handleMettreAJour}
                                loading={loadingSave}
                                severity="warning"
                                className="p-button-lg"
                            />
                        ) : (
                            <Button
                                icon="pi pi-send"
                                label="Transférer vers la comptabilité"
                                onClick={handleTransferer}
                                loading={loadingSave}
                                severity="success"
                                className="p-button-lg"
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default ComptabilisationPaiePage;
