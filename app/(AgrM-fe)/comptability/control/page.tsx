'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import Cookies from 'js-cookie';

import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptExercice } from '../types';

// Helper: convert yyyy-mm-dd (ISO) to dd/mm/yyyy
const toDisplayDate = (isoDate: string): string => {
    if (!isoDate) return '';
    const parts = isoDate.split('T')[0].split('-');
    if (parts.length !== 3) return '';
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
};

interface UnbalancedEntry {
    codeCompte: string;
    libelle: string;
    dateEcriture: string;
    numeroPiece: string;
    debit: number;
    credit: number;
}

export default function ControlPage() {
    const [entries, setEntries] = useState<UnbalancedEntry[]>([]);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [hasChecked, setHasChecked] = useState(false);

    // Statistics
    const [stats, setStats] = useState({
        count: 0,
        totalDebit: 0,
        totalCredit: 0,
        difference: 0
    });

    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/comptability/ecritures');

    useEffect(() => {
        // Load current exercice from cookie
        try {
            const cookieData = Cookies.get('currentExercice');
            if (cookieData) {
                setCurrentExercice(JSON.parse(cookieData));
            }
        } catch (e) {
            console.error('Error parsing currentExercice cookie:', e);
        }
    }, []);

    useEffect(() => {
        if (data && callType === 'check') {
            const entriesData: UnbalancedEntry[] = Array.isArray(data) ? data : data.content || [];
            setEntries(entriesData);
            setHasChecked(true);

            // Calculate statistics
            const totalDebit = entriesData.reduce((sum, e) => sum + (e.debit || 0), 0);
            const totalCredit = entriesData.reduce((sum, e) => sum + (e.credit || 0), 0);

            setStats({
                count: entriesData.length,
                totalDebit,
                totalCredit,
                difference: Math.abs(totalDebit - totalCredit)
            });

            if (entriesData.length === 0) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Verification terminee',
                    detail: 'Aucune ecriture desequilibree trouvee. Les ecritures sont integres.',
                    life: 5000
                });
            } else {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Ecritures desequilibrees',
                    detail: `${entriesData.length} ecriture(s) desequilibree(s) trouvee(s)`,
                    life: 5000
                });
            }
        }
        if (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: error.message || 'Une erreur est survenue lors de la verification',
                life: 3000
            });
        }
    }, [data, error, callType]);

    const handleCheck = () => {
        if (!currentExercice?.exerciceId) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez selectionner un exercice courant dans la page Exercices',
                life: 3000
            });
            return;
        }

        fetchData(
            null,
            'GET',
            `${BASE_URL}/unbalanced?exercice=${currentExercice.exerciceId}`,
            'check'
        );
    };

    // Format number for display
    const formatNumber = (value: number): string => {
        return value?.toLocaleString('fr-BI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00';
    };

    // Column body templates
    const dateBodyTemplate = (rowData: UnbalancedEntry) => {
        return toDisplayDate(rowData.dateEcriture) || '-';
    };

    const debitBodyTemplate = (rowData: UnbalancedEntry) => {
        return (
            <span className="font-mono">
                {formatNumber(rowData.debit)}
            </span>
        );
    };

    const creditBodyTemplate = (rowData: UnbalancedEntry) => {
        return (
            <span className="font-mono">
                {formatNumber(rowData.credit)}
            </span>
        );
    };

    const soldeBodyTemplate = (rowData: UnbalancedEntry) => {
        const diff = (rowData.debit || 0) - (rowData.credit || 0);
        return (
            <span className={`font-mono font-bold ${diff !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatNumber(diff)}
            </span>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">
                <i className="pi pi-shield mr-2"></i>
                Ecritures Desequilibrees
            </h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2 className="mb-4">
                <i className="pi pi-shield mr-2"></i>
                Controle d'Integrite des Ecritures
            </h2>

            {/* Exercice Banner */}
            {currentExercice ? (
                <div className="mb-4 p-3 surface-100 border-round border-1 surface-border">
                    <div className="flex align-items-center gap-3">
                        <i className="pi pi-calendar text-primary" style={{ fontSize: '1.5rem' }}></i>
                        <div>
                            <span className="font-semibold text-primary">Exercice courant : </span>
                            <span className="font-bold">{currentExercice.codeExercice}</span>
                            <span className="ml-2 text-600">- {currentExercice.description}</span>
                            <span className="ml-2 text-600">
                                ({toDisplayDate(currentExercice.dateDebut)} - {toDisplayDate(currentExercice.dateFin)})
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-4 p-3 bg-yellow-50 border-round border-1 border-yellow-200">
                    <div className="flex align-items-center gap-3">
                        <i className="pi pi-exclamation-triangle text-yellow-600" style={{ fontSize: '1.5rem' }}></i>
                        <span className="text-yellow-700">
                            Aucun exercice courant selectionne. Veuillez selectionner un exercice dans la page Exercices.
                        </span>
                    </div>
                </div>
            )}

            {/* Action Button */}
            <div className="mb-4">
                <Button
                    label="Verifier l'Integrite"
                    icon="pi pi-check-circle"
                    severity="info"
                    size="large"
                    onClick={handleCheck}
                    loading={loading}
                    disabled={!currentExercice?.exerciceId}
                />
                <span className="ml-3 text-color-secondary">
                    <i className="pi pi-info-circle mr-1"></i>
                    Verifie que toutes les ecritures comptables ont un equilibre debit/credit correct
                </span>
            </div>

            {/* Statistics Cards */}
            {hasChecked && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-3">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Ecritures Desequilibrees</div>
                            <div className="text-3xl font-bold">
                                <Tag
                                    value={stats.count.toString()}
                                    severity={stats.count === 0 ? 'success' : 'danger'}
                                    style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Total Debit</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatNumber(stats.totalDebit)}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Total Credit</div>
                            <div className="text-2xl font-bold text-green-600">
                                {formatNumber(stats.totalCredit)}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Ecart Total</div>
                            <div className={`text-2xl font-bold ${stats.difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatNumber(stats.difference)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Table */}
            {hasChecked && (
                <DataTable
                    value={entries}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    globalFilter={globalFilter}
                    header={header}
                    emptyMessage="Aucune ecriture desequilibree trouvee - Les ecritures sont integres"
                    stripedRows
                    sortField="dateEcriture"
                    sortOrder={-1}
                    className="p-datatable-sm"
                >
                    <Column field="codeCompte" header="Code Compte" sortable filter style={{ width: '15%' }} />
                    <Column field="libelle" header="Libelle" sortable filter style={{ width: '25%' }} />
                    <Column
                        field="dateEcriture"
                        header="Date Ecriture"
                        body={dateBodyTemplate}
                        sortable
                        style={{ width: '12%' }}
                    />
                    <Column field="numeroPiece" header="N. Piece" sortable filter style={{ width: '12%' }} />
                    <Column
                        field="debit"
                        header="Debit"
                        body={debitBodyTemplate}
                        sortable
                        style={{ width: '12%' }}
                        alignHeader="right"
                        align="right"
                    />
                    <Column
                        field="credit"
                        header="Credit"
                        body={creditBodyTemplate}
                        sortable
                        style={{ width: '12%' }}
                        alignHeader="right"
                        align="right"
                    />
                    <Column
                        header="Ecart"
                        body={soldeBodyTemplate}
                        style={{ width: '12%' }}
                        alignHeader="right"
                        align="right"
                    />
                </DataTable>
            )}

            {/* Info Banner - shown before checking */}
            {!hasChecked && (
                <div className="mt-4 p-4 surface-100 border-round text-center">
                    <i className="pi pi-shield text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                    <h4 className="text-color-secondary">Controle d'Integrite des Ecritures Comptables</h4>
                    <p className="text-color-secondary">
                        Cliquez sur le bouton "Verifier l'Integrite" pour analyser les ecritures comptables
                        de l'exercice courant et detecter les eventuels desequilibres debit/credit.
                    </p>
                </div>
            )}
        </div>
    );
}
