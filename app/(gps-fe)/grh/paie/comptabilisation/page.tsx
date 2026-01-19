'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../../utils/apiConfig';
import { CptExercice } from '../../../comptabilite/exercice/CptExercice';
import { CptBrouillard } from '../../../comptabilite/brouillard/CptBrouillard';
import { PeriodePaie } from '../periodePaie/PeriodePaie';
import { MouvementComptable, ComptabilisationData } from './MouvementComptable';

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
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Data state
    const [mouvements, setMouvements] = useState<MouvementComptable[]>([]);
    const [totalDebit, setTotalDebit] = useState<number>(0);
    const [totalCredit, setTotalCredit] = useState<number>(0);
    const [periodLabel, setPeriodLabel] = useState<string>('');

    // Loading states
    const [loadingData, setLoadingData] = useState<boolean>(false);

    // API hooks
    const { data: exerciceData, fetchData: fetchExercices, callType: exerciceCallType } = useConsumApi('');
    const { data: brouillardData, fetchData: fetchBrouillards, callType: brouillardCallType } = useConsumApi('');
    const { data: periodeData, fetchData: fetchPeriodes, callType: periodeCallType } = useConsumApi('');
    const { data: comptaData, error: comptaError, fetchData: fetchComptaData, callType: comptaCallType } = useConsumApi('');

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
        loadPeriodes(selectedYear);
    }, []);

    // Reload periodes when year changes (after initial mount)
    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        setSelectedPeriode(null);
        loadPeriodes(year);
    };

    // Handle exercice data
    useEffect(() => {
        if (exerciceData && exerciceCallType === 'loadExercices') {
            setExercices(Array.isArray(exerciceData) ? exerciceData : [exerciceData]);
        }
    }, [exerciceData, exerciceCallType]);

    // Handle brouillard data
    useEffect(() => {
        if (brouillardData && brouillardCallType === 'loadBrouillards') {
            setBrouillards(Array.isArray(brouillardData) ? brouillardData : [brouillardData]);
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
            const data = comptaData as ComptabilisationData;
            setMouvements(data.mouvements || []);
            setTotalDebit(data.totalDebit || 0);
            setTotalCredit(data.totalCredit || 0);
            setPeriodLabel(data.periodLabel || '');
            setLoadingData(false);
            accept('success', 'Donnees chargees', 'Les mouvements comptables ont ete charges avec succes.');
        }
        if (comptaError && comptaCallType === 'loadComptaData') {
            setLoadingData(false);
            accept('error', 'Erreur', 'Impossible de charger les donnees de comptabilisation.');
        }
    }, [comptaData, comptaError, comptaCallType]);

    // Load brouillards when exercice changes
    const handleExerciceChange = (e: DropdownChangeEvent) => {
        const exercice = e.value as CptExercice;
        setSelectedExercice(exercice);
        setSelectedBrouillard(null);
        setBrouillards([]);

        if (exercice && exercice.exerciceId) {
            fetchBrouillards(null, 'Get', `${baseUrl}/brouillards/findbyexercice/${exercice.exerciceId}`, 'loadBrouillards');
        }
    };

    const handleBrouillardChange = (e: DropdownChangeEvent) => {
        setSelectedBrouillard(e.value as CptBrouillard);
    };

    const handlePeriodeChange = (e: DropdownChangeEvent) => {
        setSelectedPeriode(e.value as PeriodePaie);
    };

    const handleChargerDonnees = () => {
        if (!selectedPeriode) {
            accept('warn', 'Validation', 'Veuillez selectionner une periode de paie.');
            return;
        }

        setLoadingData(true);
        setMouvements([]);
        setTotalDebit(0);
        setTotalCredit(0);

        // Fetch comptabilisation data for the selected period
        fetchComptaData(null, 'Get', `${baseUrl}/api/grh/paie/comptabilisation/mouvements/${selectedPeriode.periodeId}`, 'loadComptaData');
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
    const debitBodyTemplate = (rowData: MouvementComptable) => {
        return formatCurrency(rowData.debit);
    };

    const creditBodyTemplate = (rowData: MouvementComptable) => {
        return formatCurrency(rowData.credit);
    };

    // Footer for totals
    const footerGroup = (
        <tr>
            <td colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                Totaux:
            </td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(totalDebit)}
            </td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(totalCredit)}
            </td>
        </tr>
    );

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h3>Comptabilisation de la Paie</h3>

                {/* Selection Form */}
                <Card className="mb-4">
                    <div className="formgrid grid">
                        {/* Year selection */}
                        <div className="field col-12 md:col-2">
                            <label htmlFor="selectedYear" className="font-bold">Annee</label>
                            <InputNumber
                                id="selectedYear"
                                value={selectedYear}
                                onValueChange={(e) => handleYearChange(e.value || new Date().getFullYear())}
                                useGrouping={false}
                                min={2020}
                                max={2100}
                                className="w-full"
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
                                emptyMessage="Aucune periode disponible"
                            />
                        </div>

                        {/* Exercice selection */}
                        <div className="field col-12 md:col-3">
                            <label htmlFor="exercice" className="font-bold">Exercice Comptable</label>
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

                        {/* Brouillard selection */}
                        <div className="field col-12 md:col-3">
                            <label htmlFor="brouillard" className="font-bold">Brouillard</label>
                            <Dropdown
                                id="brouillard"
                                value={selectedBrouillard}
                                options={brouillards}
                                onChange={handleBrouillardChange}
                                optionLabel={(b) => formatBrouillardLabel(b)}
                                placeholder="Selectionner un brouillard"
                                className="w-full"
                                filter
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
                            disabled={!selectedPeriode}
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
                    paginator
                    rows={20}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    tableStyle={{ minWidth: '50rem' }}
                    stripedRows
                    showGridlines
                    footer={mouvements.length > 0 ? footerGroup : null}
                >
                    <Column
                        field="compte"
                        header="Compte"
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

                {/* Info message about transfer functionality */}
                {mouvements.length > 0 && selectedExercice && selectedBrouillard && (
                    <div className="mt-3">
                        <div className="p-message p-message-info">
                            <div className="p-message-wrapper">
                                <span className="p-message-icon pi pi-info-circle"></span>
                                <div className="p-message-text">
                                    Le transfert vers la comptabilite sera disponible prochainement.
                                    Exercice: {selectedExercice.codeExercice}, Brouillard: {selectedBrouillard.codeBrouillard}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ComptabilisationPaiePage;
