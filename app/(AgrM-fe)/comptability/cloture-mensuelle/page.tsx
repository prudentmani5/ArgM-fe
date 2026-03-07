'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import Cookies from 'js-cookie';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptExercice, MonthlyClosing, MonthlyClosingPreview, ChecklistItem } from '../types';
import { ProtectedPage } from '@/components/ProtectedPage';

const MONTH_NAMES = [
    '', 'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('fr-FR');
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

function ClotureMensuellePage() {
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [closings, setClosings] = useState<MonthlyClosing[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [preview, setPreview] = useState<MonthlyClosingPreview | null>(null);
    const [previewDialogVisible, setPreviewDialogVisible] = useState(false);

    const toast = useRef<Toast>(null);

    const { data: closingsData, loading: closingsLoading, error: closingsError, fetchData: fetchClosings, callType: closingsCallType } = useConsumApi('');
    const { data: previewData, loading: previewLoading, error: previewError, fetchData: fetchPreview, callType: previewCallType } = useConsumApi('');
    const { data: executeData, loading: executeLoading, error: executeError, fetchData: fetchExecute, callType: executeCallType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/comptability/monthly-closing');

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
            loadClosings();
        }
    }, [currentExercice]);

    // Handle closings list response
    useEffect(() => {
        if (closingsData && closingsCallType === 'getall') {
            setClosings(Array.isArray(closingsData) ? closingsData : []);
        }
        if (closingsError && closingsCallType === 'getall') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: closingsError.message || 'Erreur lors du chargement', life: 3000 });
        }
    }, [closingsData, closingsError, closingsCallType]);

    // Handle preview response
    useEffect(() => {
        if (previewData && previewCallType === 'preview') {
            setPreview(previewData as MonthlyClosingPreview);
            setPreviewDialogVisible(true);
        }
        if (previewError && previewCallType === 'preview') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: previewError.message || 'Erreur lors de la preview', life: 5000 });
        }
    }, [previewData, previewError, previewCallType]);

    // Handle execute response
    useEffect(() => {
        if (executeData && executeCallType === 'execute') {
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: 'Cloture mensuelle executee avec succes', life: 5000 });
            setPreviewDialogVisible(false);
            setPreview(null);
            loadClosings();
        }
        if (executeError && executeCallType === 'execute') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: executeError.message || 'Erreur lors de l\'execution', life: 5000 });
        }
    }, [executeData, executeError, executeCallType]);

    const loadClosings = () => {
        if (currentExercice?.exerciceId) {
            fetchClosings(null, 'GET', `${BASE_URL}/findbyexercice/${currentExercice.exerciceId}`, 'getall');
        }
    };

    const handlePreview = (month: number) => {
        if (!currentExercice?.exerciceId) return;
        setSelectedMonth(month);
        fetchPreview(null, 'GET', `${BASE_URL}/preview?exerciceId=${currentExercice.exerciceId}&month=${month}`, 'preview');
    };

    const handleExecute = () => {
        if (!currentExercice?.exerciceId || !selectedMonth) return;

        confirmDialog({
            message: `Voulez-vous executer la cloture mensuelle de ${MONTH_NAMES[selectedMonth]} ?\n\nLa periode comptable sera cloturee et aucune ecriture ne pourra plus etre saisie pour ce mois.`,
            header: 'Confirmation de cloture mensuelle',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, Executer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-success',
            accept: () => {
                const userId = getUserAction();
                fetchExecute(null, 'POST', `${BASE_URL}/execute?exerciceId=${currentExercice.exerciceId}&month=${selectedMonth}&userId=${userId}`, 'execute');
            }
        });
    };

    // Build 12-month grid data
    const getMonthStatus = (month: number): { status: string; closing: MonthlyClosing | null } => {
        const closing = closings.find(c => c.month === month);
        if (closing) {
            return { status: closing.status, closing };
        }
        return { status: 'PENDING', closing: null };
    };

    const getMonthSeverity = (status: string): 'success' | 'danger' | 'warning' | 'info' => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'warning';
            case 'PENDING': return 'info';
            default: return 'info';
        }
    };

    const getMonthLabel = (status: string): string => {
        switch (status) {
            case 'COMPLETED': return 'Cloture';
            case 'IN_PROGRESS': return 'En cours';
            case 'PENDING': return 'En attente';
            default: return status;
        }
    };

    // Checklist rendering
    const renderChecklist = (checklist: ChecklistItem[]) => {
        if (!checklist || checklist.length === 0) return null;
        return (
            <div className="mt-3">
                <h5 className="mb-2">Checklist de verification</h5>
                {checklist.map((item, index) => (
                    <div key={index} className="flex align-items-center gap-3 mb-2 p-2 surface-50 border-round">
                        <i className={`pi ${item.status === 'OK' || item.status === 'PASS' ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'}`}
                           style={{ fontSize: '1.2rem' }}></i>
                        <div className="flex-1">
                            <div className="font-semibold">{item.step}</div>
                            <div className="text-600 text-sm">{item.description}</div>
                            {item.details && <div className="text-500 text-xs mt-1">{item.details}</div>}
                        </div>
                        <Tag
                            value={item.status === 'OK' || item.status === 'PASS' ? 'OK' : 'ECHEC'}
                            severity={item.status === 'OK' || item.status === 'PASS' ? 'success' : 'danger'}
                        />
                    </div>
                ))}
            </div>
        );
    };

    // Completed closings count
    const completedCount = closings.filter(c => c.status === 'COMPLETED').length;

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2 className="mb-4">
                <i className="pi pi-calendar-times mr-2"></i>
                Cloture Mensuelle
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
                            <span className="ml-3">
                                <Tag value={`${completedCount}/12 mois clotures`} severity={completedCount === 12 ? 'success' : 'info'} />
                            </span>
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

            {/* Progress Bar */}
            {closings.length > 0 && (
                <div className="mb-4">
                    <div className="flex justify-content-between mb-1">
                        <span className="text-600">Progression de cloture</span>
                        <span className="font-bold">{Math.round((completedCount / 12) * 100)}%</span>
                    </div>
                    <ProgressBar value={Math.round((completedCount / 12) * 100)} showValue={false} style={{ height: '8px' }} />
                </div>
            )}

            {/* 12-Month Grid */}
            <div className="grid mb-4">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                    const { status, closing } = getMonthStatus(month);
                    return (
                        <div key={month} className="col-12 md:col-4 lg:col-3">
                            <div
                                className="surface-card shadow-1 p-3 border-round cursor-pointer hover:shadow-3 transition-duration-200"
                                style={{ borderLeft: `4px solid ${status === 'COMPLETED' ? '#4CAF50' : status === 'IN_PROGRESS' ? '#FF9800' : '#90CAF9'}` }}
                                onClick={() => handlePreview(month)}
                            >
                                <div className="flex justify-content-between align-items-center mb-2">
                                    <span className="font-bold text-lg">{MONTH_NAMES[month]}</span>
                                    <Tag value={getMonthLabel(status)} severity={getMonthSeverity(status)} />
                                </div>
                                {closing && status === 'COMPLETED' && (
                                    <div className="text-500 text-sm">
                                        <div>Debit: {formatNumber(closing.totalDebit)} FBu</div>
                                        <div>Credit: {formatNumber(closing.totalCredit)} FBu</div>
                                        <div className="mt-1 text-xs">{formatDateTime(closing.executedAt)}</div>
                                    </div>
                                )}
                                {status === 'PENDING' && (
                                    <div className="text-500 text-sm">
                                        <i className="pi pi-search mr-1"></i> Cliquez pour voir l'apercu
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* History Table */}
            <div className="card">
                <h4 className="mb-3">
                    <i className="pi pi-history mr-2"></i>
                    Historique des clotures mensuelles
                </h4>
                <DataTable
                    value={closings}
                    loading={closingsLoading}
                    paginator
                    rows={12}
                    emptyMessage="Aucune cloture mensuelle effectuee"
                    stripedRows
                    sortField="month"
                    sortOrder={1}
                    className="p-datatable-sm"
                >
                    <Column
                        field="month"
                        header="Mois"
                        body={(rowData: MonthlyClosing) => MONTH_NAMES[rowData.month]}
                        sortable
                        style={{ width: '15%' }}
                    />
                    <Column field="year" header="Annee" sortable style={{ width: '8%' }} />
                    <Column
                        field="status"
                        header="Statut"
                        body={(rowData: MonthlyClosing) => (
                            <Tag value={getMonthLabel(rowData.status)} severity={getMonthSeverity(rowData.status)} />
                        )}
                        sortable
                        style={{ width: '12%' }}
                    />
                    <Column
                        field="totalDebit"
                        header="Total Debit"
                        body={(rowData: MonthlyClosing) => formatNumber(rowData.totalDebit) + ' FBu'}
                        style={{ width: '15%', textAlign: 'right' }}
                    />
                    <Column
                        field="totalCredit"
                        header="Total Credit"
                        body={(rowData: MonthlyClosing) => formatNumber(rowData.totalCredit) + ' FBu'}
                        style={{ width: '15%', textAlign: 'right' }}
                    />
                    <Column field="executedBy" header="Executee par" style={{ width: '12%' }} />
                    <Column
                        field="executedAt"
                        header="Date Execution"
                        body={(rowData: MonthlyClosing) => formatDateTime(rowData.executedAt)}
                        style={{ width: '15%' }}
                    />
                    <Column field="notes" header="Notes" style={{ width: '8%' }} />
                </DataTable>
            </div>

            {/* Preview Dialog */}
            <Dialog
                visible={previewDialogVisible}
                onHide={() => setPreviewDialogVisible(false)}
                header={`Apercu - Cloture ${selectedMonth ? MONTH_NAMES[selectedMonth] : ''}`}
                style={{ width: '60vw' }}
                modal
                maximizable
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Fermer" icon="pi pi-times" severity="secondary" onClick={() => setPreviewDialogVisible(false)} />
                        {preview && preview.canClose && (
                            <Button
                                label="Executer la Cloture"
                                icon="pi pi-lock"
                                severity="success"
                                onClick={handleExecute}
                                loading={executeLoading}
                            />
                        )}
                    </div>
                }
            >
                {previewLoading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} className="mb-3" />}

                {preview && (
                    <div>
                        {/* Summary */}
                        <div className="grid mb-3">
                            <div className="col-12 md:col-4">
                                <div className="surface-card shadow-1 p-3 border-round">
                                    <div className="text-500 font-medium mb-1">Clotures journalieres</div>
                                    <div className="text-900 text-xl font-bold">
                                        {preview.dailyClosingsCount} / {preview.dailyClosingsExpected}
                                    </div>
                                    <Tag
                                        value={preview.allDailyClosingsDone ? 'Complet' : 'Incomplet'}
                                        severity={preview.allDailyClosingsDone ? 'success' : 'danger'}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="surface-card shadow-1 p-3 border-round">
                                    <div className="text-500 font-medium mb-1">Periode comptable</div>
                                    <div className="text-900 text-xl font-bold">
                                        {preview.periodExists ? (preview.periodOpen ? 'Ouverte' : 'Cloturee') : 'Non generee'}
                                    </div>
                                    <Tag
                                        value={preview.periodExists && preview.periodOpen ? 'OK' : 'Probleme'}
                                        severity={preview.periodExists && preview.periodOpen ? 'success' : 'danger'}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="surface-card shadow-1 p-3 border-round">
                                    <div className="text-500 font-medium mb-1">Peut cloturer</div>
                                    <div className={`text-xl font-bold ${preview.canClose ? 'text-green-500' : 'text-red-500'}`}>
                                        {preview.canClose ? 'OUI' : 'NON'}
                                        <i className={`pi ${preview.canClose ? 'pi-check-circle' : 'pi-times-circle'} ml-2`}></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!preview.canClose && (
                            <div className="mb-3 p-3 border-round border-1" style={{ borderLeft: '4px solid #EF5350', backgroundColor: '#FFEBEE' }}>
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-exclamation-triangle text-red-500"></i>
                                    <span className="text-red-700 font-semibold">
                                        Les conditions ne sont pas remplies pour effectuer la cloture mensuelle.
                                        Verifiez les elements de la checklist ci-dessous.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Checklist */}
                        {renderChecklist(preview.checklist)}
                    </div>
                )}
            </Dialog>
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_MONTHLY_CLOSING']}>
            <ClotureMensuellePage />
        </ProtectedPage>
    );
}
