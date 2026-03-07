'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import Cookies from 'js-cookie';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptExercice, CptAccountingPeriod } from '../types';
import { ProtectedPage } from '@/components/ProtectedPage';

const MONTH_NAMES = [
    '', 'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

const formatDate = (value: string | undefined | null): string => {
    if (!value) return '';
    try {
        const date = new Date(value);
        return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    } catch {
        return value;
    }
};

const formatDateTime = (value: string | undefined | null): string => {
    if (!value) return '';
    try {
        const date = new Date(value);
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    } catch {
        return value;
    }
};

function PeriodesPage() {
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [periodes, setPeriodes] = useState<CptAccountingPeriod[]>([]);

    const toast = useRef<Toast>(null);

    const { data: periodesData, loading: periodesLoading, error: periodesError, fetchData: fetchPeriodes, callType: periodesCallType } = useConsumApi('');
    const { data: generateData, loading: generateLoading, error: generateError, fetchData: fetchGenerate, callType: generateCallType } = useConsumApi('');
    const { data: closeData, loading: closeLoading, error: closeError, fetchData: fetchClose, callType: closeCallType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/comptability/periodes');

    useEffect(() => {
        try {
            const cookieData = Cookies.get('currentExercice');
            if (cookieData) {
                const ex = JSON.parse(cookieData);
                setCurrentExercice(ex);
            }
        } catch (e) {
            console.error('Error parsing currentExercice cookie:', e);
        }
    }, []);

    useEffect(() => {
        if (currentExercice?.exerciceId) {
            loadPeriodes();
        }
    }, [currentExercice]);

    // Handle periodes list response
    useEffect(() => {
        if (periodesData && periodesCallType === 'getall') {
            setPeriodes(Array.isArray(periodesData) ? periodesData : []);
        }
        if (periodesError && periodesCallType === 'getall') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: periodesError.message || 'Erreur lors du chargement', life: 3000 });
        }
    }, [periodesData, periodesError, periodesCallType]);

    // Handle generate response
    useEffect(() => {
        if (generateData && generateCallType === 'generate') {
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: 'Periodes generees avec succes', life: 3000 });
            loadPeriodes();
        }
        if (generateError && generateCallType === 'generate') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: generateError.message || 'Erreur lors de la generation', life: 5000 });
        }
    }, [generateData, generateError, generateCallType]);

    // Handle close response
    useEffect(() => {
        if (closeData && closeCallType === 'close') {
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: 'Periode cloturee avec succes', life: 3000 });
            loadPeriodes();
        }
        if (closeError && closeCallType === 'close') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: closeError.message || 'Erreur lors de la cloture', life: 5000 });
        }
    }, [closeData, closeError, closeCallType]);

    const loadPeriodes = () => {
        if (currentExercice?.exerciceId) {
            fetchPeriodes(null, 'GET', `${BASE_URL}/findbyexercice/${currentExercice.exerciceId}`, 'getall');
        }
    };

    const handleGenerate = () => {
        if (!currentExercice?.exerciceId) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez selectionner un exercice comptable', life: 3000 });
            return;
        }
        confirmDialog({
            message: `Voulez-vous generer les 12 periodes comptables pour l'exercice "${currentExercice.codeExercice}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Oui, Generer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-success',
            accept: () => {
                fetchGenerate(null, 'POST', `${BASE_URL}/generate/${currentExercice.exerciceId}`, 'generate');
            }
        });
    };

    const handleClose = (periode: CptAccountingPeriod) => {
        confirmDialog({
            message: `Voulez-vous cloturer la periode "${MONTH_NAMES[periode.month]} ${periode.year}" ?\n\nAucune ecriture ne pourra plus etre saisie sur cette periode.`,
            header: 'Confirmation de cloture',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, Cloturer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () => {
                const userId = getUserAction();
                fetchClose(null, 'POST', `${BASE_URL}/close/${periode.periodId}?userId=${userId}`, 'close');
            }
        });
    };

    // Summary stats
    const openCount = periodes.filter(p => p.status === 'OPEN').length;
    const closedCount = periodes.filter(p => p.status === 'CLOSED').length;

    // Templates
    const monthBodyTemplate = (rowData: CptAccountingPeriod) => {
        return <span className="font-semibold">{MONTH_NAMES[rowData.month] || rowData.month}</span>;
    };

    const statusBodyTemplate = (rowData: CptAccountingPeriod) => {
        return (
            <Tag
                value={rowData.status === 'OPEN' ? 'Ouverte' : 'Cloturee'}
                severity={rowData.status === 'OPEN' ? 'success' : 'danger'}
                icon={rowData.status === 'OPEN' ? 'pi pi-lock-open' : 'pi pi-lock'}
            />
        );
    };

    const actionBodyTemplate = (rowData: CptAccountingPeriod) => {
        if (rowData.status === 'CLOSED') {
            return <span className="text-500 text-sm">Cloturee</span>;
        }
        return (
            <Button
                icon="pi pi-lock"
                label="Cloturer"
                size="small"
                severity="warning"
                onClick={() => handleClose(rowData)}
                loading={closeLoading}
            />
        );
    };

    const leftToolbarTemplate = () => (
        <div className="flex gap-2">
            {periodes.length === 0 && (
                <Button
                    label="Generer les periodes"
                    icon="pi pi-calendar-plus"
                    severity="success"
                    onClick={handleGenerate}
                    loading={generateLoading}
                />
            )}
            <Button
                label="Actualiser"
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                onClick={loadPeriodes}
            />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2 className="mb-4">
                <i className="pi pi-calendar mr-2"></i>
                Periodes Comptables
            </h2>

            {/* Current Exercice Banner */}
            {currentExercice ? (
                <div className="mb-4 p-3 surface-100 border-round border-1 surface-border" style={{ borderLeft: '4px solid #2196F3' }}>
                    <div className="flex align-items-center gap-3">
                        <i className="pi pi-calendar text-primary" style={{ fontSize: '1.5rem' }}></i>
                        <div>
                            <span className="font-semibold text-primary">Exercice courant : </span>
                            <span className="font-bold">{currentExercice.codeExercice}</span>
                            <span className="ml-2 text-600">- {currentExercice.description}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-4 p-3 border-round border-1" style={{ borderLeft: '4px solid #FFA726', backgroundColor: '#FFF3E0' }}>
                    <div className="flex align-items-center gap-3">
                        <i className="pi pi-exclamation-triangle text-orange-500" style={{ fontSize: '1.5rem' }}></i>
                        <span className="text-orange-700 font-semibold">Aucun exercice selectionne. Veuillez selectionner un exercice dans le module Exercices.</span>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            {periodes.length > 0 && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-4">
                        <div className="surface-card shadow-1 p-3 border-round">
                            <div className="text-500 font-medium mb-1">Total Periodes</div>
                            <div className="text-900 text-2xl font-bold">{periodes.length}</div>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="surface-card shadow-1 p-3 border-round">
                            <div className="text-500 font-medium mb-1">Ouvertes</div>
                            <div className="text-green-500 text-2xl font-bold">{openCount}</div>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="surface-card shadow-1 p-3 border-round">
                            <div className="text-500 font-medium mb-1">Cloturees</div>
                            <div className="text-red-500 text-2xl font-bold">{closedCount}</div>
                        </div>
                    </div>
                </div>
            )}

            {generateLoading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} className="mb-3" />}

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={periodes}
                loading={periodesLoading}
                paginator
                rows={12}
                emptyMessage="Aucune periode trouvee. Cliquez sur 'Generer les periodes' pour creer les 12 periodes mensuelles."
                stripedRows
                sortField="month"
                sortOrder={1}
                className="p-datatable-sm"
            >
                <Column
                    field="month"
                    header="Mois"
                    body={monthBodyTemplate}
                    sortable
                    style={{ width: '20%' }}
                />
                <Column field="year" header="Annee" sortable style={{ width: '10%' }} />
                <Column
                    field="startDate"
                    header="Date Debut"
                    body={(rowData: CptAccountingPeriod) => formatDate(rowData.startDate)}
                    style={{ width: '15%' }}
                />
                <Column
                    field="endDate"
                    header="Date Fin"
                    body={(rowData: CptAccountingPeriod) => formatDate(rowData.endDate)}
                    style={{ width: '15%' }}
                />
                <Column
                    field="status"
                    header="Statut"
                    body={statusBodyTemplate}
                    sortable
                    style={{ width: '15%' }}
                />
                <Column
                    field="closedAt"
                    header="Date Cloture"
                    body={(rowData: CptAccountingPeriod) => formatDateTime(rowData.closedAt)}
                    style={{ width: '15%' }}
                />
                <Column
                    header="Actions"
                    body={actionBodyTemplate}
                    style={{ width: '10%' }}
                />
            </DataTable>
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_VIEW']}>
            <PeriodesPage />
        </ProtectedPage>
    );
}
