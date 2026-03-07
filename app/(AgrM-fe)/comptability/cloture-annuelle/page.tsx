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
import { CptExercice, AnnualClosing, AnnualClosingPreview, ChecklistItem } from '../types';
import { ProtectedPage } from '@/components/ProtectedPage';

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

function ClotureAnnuellePage() {
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [closings, setClosings] = useState<AnnualClosing[]>([]);
    const [preview, setPreview] = useState<AnnualClosingPreview | null>(null);
    const [previewDialogVisible, setPreviewDialogVisible] = useState(false);

    const toast = useRef<Toast>(null);

    const { data: closingsData, loading: closingsLoading, error: closingsError, fetchData: fetchClosings, callType: closingsCallType } = useConsumApi('');
    const { data: previewData, loading: previewLoading, error: previewError, fetchData: fetchPreview, callType: previewCallType } = useConsumApi('');
    const { data: executeData, loading: executeLoading, error: executeError, fetchData: fetchExecute, callType: executeCallType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/comptability/annual-closing');

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

    // Handle closings response
    useEffect(() => {
        if (closingsData && closingsCallType === 'getall') {
            setClosings(Array.isArray(closingsData) ? closingsData : []);
        }
        if (closingsError && closingsCallType === 'getall') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: closingsError.message || 'Erreur', life: 3000 });
        }
    }, [closingsData, closingsError, closingsCallType]);

    // Handle preview response
    useEffect(() => {
        if (previewData && previewCallType === 'preview') {
            setPreview(previewData as AnnualClosingPreview);
            setPreviewDialogVisible(true);
        }
        if (previewError && previewCallType === 'preview') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: previewError.message || 'Erreur lors de la preview', life: 5000 });
        }
    }, [previewData, previewError, previewCallType]);

    // Handle execute response
    useEffect(() => {
        if (executeData && executeCallType === 'execute') {
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: 'Cloture annuelle executee avec succes. Un nouvel exercice a ete cree.', life: 8000 });
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

    const handlePreview = () => {
        if (!currentExercice?.exerciceId) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez selectionner un exercice', life: 3000 });
            return;
        }
        fetchPreview(null, 'GET', `${BASE_URL}/preview?exerciceId=${currentExercice.exerciceId}`, 'preview');
    };

    const handleExecute = () => {
        if (!currentExercice?.exerciceId) return;

        confirmDialog({
            message: 'ATTENTION: Cette operation est IRREVERSIBLE.\n\n' +
                'La cloture annuelle va:\n' +
                '- Solder les comptes de charges (classe 6) et produits (classe 7)\n' +
                '- Determiner le resultat de l\'exercice\n' +
                '- Generer les ecritures de report a nouveau (classes 1-5)\n' +
                '- Creer un nouvel exercice avec ses 12 periodes\n' +
                '- Cloturer definitivement l\'exercice courant\n\n' +
                'Voulez-vous continuer ?',
            header: 'Confirmation de Cloture Annuelle',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, Cloturer l\'exercice',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () => {
                const userId = getUserAction();
                fetchExecute(null, 'POST', `${BASE_URL}/execute?exerciceId=${currentExercice.exerciceId}&userId=${userId}`, 'execute');
            }
        });
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

    const isAlreadyClosed = closings.some(c => c.status === 'COMPLETED');

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2 className="mb-4">
                <i className="pi pi-calendar-minus mr-2"></i>
                Cloture Annuelle
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
                            {isAlreadyClosed && (
                                <Tag value="Cloture" severity="danger" className="ml-3" />
                            )}
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

            {/* Warning Banner */}
            <div className="mb-4 p-3 border-round border-1" style={{ borderLeft: '4px solid #EF5350', backgroundColor: '#FFEBEE' }}>
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-red-500" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                        <span className="text-red-700 font-bold">Operation irreversible : </span>
                        <span className="text-red-600">
                            La cloture annuelle est definitive. Assurez-vous que toutes les clotures mensuelles
                            sont effectuees et que les comptes sont correctement balances avant de proceder.
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
                <Button
                    label="Apercu de la cloture"
                    icon="pi pi-search"
                    severity="info"
                    onClick={handlePreview}
                    loading={previewLoading}
                    disabled={isAlreadyClosed}
                />
                <Button
                    label="Actualiser"
                    icon="pi pi-refresh"
                    severity="secondary"
                    outlined
                    onClick={loadClosings}
                />
            </div>

            {/* History Table */}
            <div className="card">
                <h4 className="mb-3">
                    <i className="pi pi-history mr-2"></i>
                    Historique des clotures annuelles
                </h4>
                <DataTable
                    value={closings}
                    loading={closingsLoading}
                    emptyMessage="Aucune cloture annuelle effectuee pour cet exercice"
                    stripedRows
                    className="p-datatable-sm"
                >
                    <Column field="closingId" header="ID" style={{ width: '5%' }} />
                    <Column
                        field="status"
                        header="Statut"
                        body={(rowData: AnnualClosing) => (
                            <Tag
                                value={rowData.status === 'COMPLETED' ? 'Complete' : rowData.status === 'IN_PROGRESS' ? 'En cours' : 'En attente'}
                                severity={rowData.status === 'COMPLETED' ? 'success' : rowData.status === 'IN_PROGRESS' ? 'warning' : 'info'}
                            />
                        )}
                        style={{ width: '10%' }}
                    />
                    <Column
                        field="resultNet"
                        header="Resultat Net"
                        body={(rowData: AnnualClosing) => {
                            const isPositive = rowData.resultNet >= 0;
                            return (
                                <span className={isPositive ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                    {formatNumber(rowData.resultNet)} FBu
                                    {isPositive ? ' (Benefice)' : ' (Perte)'}
                                </span>
                            );
                        }}
                        style={{ width: '20%' }}
                    />
                    <Column
                        field="resultCompte"
                        header="Compte Resultat"
                        body={(rowData: AnnualClosing) => rowData.resultCompte || '-'}
                        style={{ width: '10%' }}
                    />
                    <Column
                        field="anouveauGenerated"
                        header="A-nouveau"
                        body={(rowData: AnnualClosing) => (
                            <Tag value={rowData.anouveauGenerated ? 'Genere' : 'Non'} severity={rowData.anouveauGenerated ? 'success' : 'danger'} />
                        )}
                        style={{ width: '10%' }}
                    />
                    <Column field="executedBy" header="Executee par" style={{ width: '12%' }} />
                    <Column
                        field="executedAt"
                        header="Date Execution"
                        body={(rowData: AnnualClosing) => formatDateTime(rowData.executedAt)}
                        style={{ width: '15%' }}
                    />
                    <Column field="notes" header="Notes" style={{ width: '18%' }} />
                </DataTable>
            </div>

            {/* Preview Dialog */}
            <Dialog
                visible={previewDialogVisible}
                onHide={() => setPreviewDialogVisible(false)}
                header={`Apercu - Cloture Annuelle ${currentExercice?.codeExercice || ''}`}
                style={{ width: '60vw' }}
                modal
                maximizable
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Fermer" icon="pi pi-times" severity="secondary" onClick={() => setPreviewDialogVisible(false)} />
                        {preview && preview.canClose && (
                            <Button
                                label="Executer la Cloture Annuelle"
                                icon="pi pi-lock"
                                severity="danger"
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
                        {/* Summary Cards */}
                        <div className="grid mb-3">
                            <div className="col-12 md:col-4">
                                <div className="surface-card shadow-1 p-3 border-round">
                                    <div className="text-500 font-medium mb-1">Clotures mensuelles</div>
                                    <div className="text-900 text-xl font-bold">
                                        {preview.monthlyClosingsCount} / 12
                                    </div>
                                    <Tag
                                        value={preview.allMonthsClosed ? 'Tous les mois clotures' : 'Mois manquants'}
                                        severity={preview.allMonthsClosed ? 'success' : 'danger'}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="surface-card shadow-1 p-3 border-round">
                                    <div className="text-500 font-medium mb-1">Resultat Net</div>
                                    <div className={`text-xl font-bold ${preview.resultNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatNumber(preview.resultNet)} FBu
                                    </div>
                                    <Tag
                                        value={preview.resultNet >= 0 ? 'Benefice' : 'Perte'}
                                        severity={preview.resultNet >= 0 ? 'success' : 'danger'}
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
                                        Les conditions ne sont pas remplies pour effectuer la cloture annuelle.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* What will happen */}
                        {preview.canClose && (
                            <div className="mb-3 p-3 border-round border-1" style={{ borderLeft: '4px solid #4CAF50', backgroundColor: '#E8F5E9' }}>
                                <h5 className="text-green-800 mb-2">Operations qui seront effectuees :</h5>
                                <ul className="text-green-700 m-0 pl-4">
                                    <li>Ecritures de solde des comptes de charges (classe 6) et produits (classe 7)</li>
                                    <li>Ecriture du resultat : {formatNumber(preview.resultNet)} FBu sur le compte {preview.resultNet >= 0 ? '131 (Benefice)' : '139 (Perte)'}</li>
                                    <li>Ecritures de report a nouveau (classes 1 a 5) vers le nouvel exercice</li>
                                    <li>Creation automatique du nouvel exercice avec 12 periodes</li>
                                    <li>Cloture definitive de l'exercice {currentExercice?.codeExercice}</li>
                                </ul>
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
        <ProtectedPage requiredAuthorities={['ACCOUNTING_ANNUAL_CLOSING']}>
            <ClotureAnnuellePage />
        </ProtectedPage>
    );
}
