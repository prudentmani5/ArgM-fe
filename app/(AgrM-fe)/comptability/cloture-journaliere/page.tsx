'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ProgressBar } from 'primereact/progressbar';
import Cookies from 'js-cookie';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import {
    CptExercice,
    DailyClosing,
    DailyClosingDetail,
    DailyClosingPreview,
    PreviewEntry
} from '../types';

const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('fr-FR');
};

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

const toApiDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export default function ClotureJournalierePage() {
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [preview, setPreview] = useState<DailyClosingPreview | null>(null);
    const [closings, setClosings] = useState<DailyClosing[]>([]);
    const [selectedClosing, setSelectedClosing] = useState<DailyClosing | null>(null);
    const [closingDetails, setClosingDetails] = useState<DailyClosingDetail[]>([]);
    const [detailDialogVisible, setDetailDialogVisible] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<any>(null);

    const toast = useRef<Toast>(null);

    const { data: previewData, loading: previewLoading, error: previewError, fetchData: fetchPreview, callType: previewCallType } = useConsumApi('');
    const { data: executeData, loading: executeLoading, error: executeError, fetchData: fetchExecute, callType: executeCallType } = useConsumApi('');
    const { data: closingsData, loading: closingsLoading, error: closingsError, fetchData: fetchClosings, callType: closingsCallType } = useConsumApi('');
    const { data: detailsData, loading: detailsLoading, error: detailsError, fetchData: fetchDetails, callType: detailsCallType } = useConsumApi('');
    const { data: reverseData, loading: reverseLoading, error: reverseError, fetchData: fetchReverse, callType: reverseCallType } = useConsumApi('');
    const { data: branchesData, fetchData: fetchBranches, callType: branchesCallType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/comptability/daily-closing');
    const BRANCHES_URL = buildApiUrl('/api/reference-data/branches/findactive');

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
        loadClosings();
        fetchBranches(null, 'GET', BRANCHES_URL, 'branches');
    }, []);

    // Handle branches response
    useEffect(() => {
        if (branchesData && branchesCallType === 'branches') {
            const list = Array.isArray(branchesData) ? branchesData : [];
            setBranches(list);
        }
    }, [branchesData, branchesCallType]);

    // Handle preview response
    useEffect(() => {
        if (previewData && previewCallType === 'preview') {
            setPreview(previewData as DailyClosingPreview);
        }
        if (previewError && previewCallType === 'preview') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: previewError.message || 'Erreur lors de la preview', life: 5000 });
        }
    }, [previewData, previewError, previewCallType]);

    // Handle execute response
    useEffect(() => {
        if (executeData && executeCallType === 'execute') {
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: 'Cloture journaliere executee avec succes', life: 5000 });
            setPreview(null);
            loadClosings();
        }
        if (executeError && executeCallType === 'execute') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: executeError.message || 'Erreur lors de l\'execution', life: 5000 });
        }
    }, [executeData, executeError, executeCallType]);

    // Handle closings list response
    useEffect(() => {
        if (closingsData && closingsCallType === 'closings') {
            setClosings(Array.isArray(closingsData) ? closingsData : []);
        }
        if (closingsError && closingsCallType === 'closings') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: closingsError.message || 'Erreur lors du chargement', life: 3000 });
        }
    }, [closingsData, closingsError, closingsCallType]);

    // Handle details response
    useEffect(() => {
        if (detailsData && detailsCallType === 'details') {
            setClosingDetails(Array.isArray(detailsData) ? detailsData : []);
        }
    }, [detailsData, detailsCallType]);

    // Handle reverse response
    useEffect(() => {
        if (reverseData && reverseCallType === 'reverse') {
            toast.current?.show({ severity: 'success', summary: 'Succes', detail: 'Cloture annulee avec succes', life: 5000 });
            loadClosings();
            setPreview(null);
        }
        if (reverseError && reverseCallType === 'reverse') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: reverseError.message || 'Erreur lors de l\'annulation', life: 5000 });
        }
    }, [reverseData, reverseError, reverseCallType]);

    const loadClosings = () => {
        if (currentExercice?.exerciceId) {
            fetchClosings(null, 'GET', `${BASE_URL}/findbyexercice/${currentExercice.exerciceId}`, 'closings');
        } else {
            fetchClosings(null, 'GET', `${BASE_URL}/findall`, 'closings');
        }
    };

    const handlePreview = () => {
        if (!selectedDate) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez selectionner une date', life: 3000 });
            return;
        }
        if (!currentExercice?.exerciceId) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez selectionner un exercice comptable', life: 3000 });
            return;
        }
        const dateStr = toApiDate(selectedDate);
        let url = `${BASE_URL}/preview?date=${dateStr}&exerciceId=${currentExercice.exerciceId}`;
        if (selectedBranch?.id) {
            url += `&branchId=${selectedBranch.id}`;
        }
        fetchPreview(null, 'GET', url, 'preview');
    };

    const handleExecute = () => {
        if (!selectedDate || !currentExercice?.exerciceId) return;

        confirmDialog({
            message: `Etes-vous sur de vouloir executer la cloture journaliere du ${formatDate(toApiDate(selectedDate))} ?\n\nCette operation va generer ${preview?.totalEntries || 0} ecritures comptables.`,
            header: 'Confirmation de cloture',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, Executer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-success',
            accept: () => {
                const dateStr = toApiDate(selectedDate);
                const userId = getUserAction();
                let execUrl = `${BASE_URL}/execute?date=${dateStr}&exerciceId=${currentExercice.exerciceId}&userId=${userId}`;
                if (selectedBranch?.id) {
                    execUrl += `&branchId=${selectedBranch.id}`;
                }
                fetchExecute(null, 'POST', execUrl, 'execute');
            }
        });
    };

    const handleReverse = (closing: DailyClosing) => {
        confirmDialog({
            message: `Etes-vous sur de vouloir annuler la cloture du ${formatDate(closing.closingDate)} ?\n\nToutes les ecritures generees seront supprimees.`,
            header: 'Confirmation d\'annulation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, Annuler',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: () => {
                const userId = getUserAction();
                fetchReverse(null, 'POST', `${BASE_URL}/reverse/${closing.closingId}?userId=${userId}`, 'reverse');
            }
        });
    };

    const handleViewDetails = (closing: DailyClosing) => {
        setSelectedClosing(closing);
        fetchDetails(null, 'GET', `${BASE_URL}/details/${closing.closingId}`, 'details');
        setDetailDialogVisible(true);
    };

    // --- Template functions ---
    const statusBodyTemplate = (rowData: DailyClosing) => {
        const statusMap: Record<string, { label: string; severity: 'success' | 'danger' | 'warning' | 'info' }> = {
            'COMPLETED': { label: 'Completee', severity: 'success' },
            'FAILED': { label: 'Echouee', severity: 'danger' },
            'PENDING': { label: 'En cours', severity: 'warning' },
            'REVERSED': { label: 'Annulee', severity: 'info' }
        };
        const status = statusMap[rowData.status] || { label: rowData.status, severity: 'info' as const };
        return <Tag value={status.label} severity={status.severity} />;
    };

    const closingActionsTemplate = (rowData: DailyClosing) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-eye"
                rounded
                severity="info"
                tooltip="Voir les details"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleViewDetails(rowData)}
            />
            {rowData.status === 'COMPLETED' && (
                <Button
                    icon="pi pi-undo"
                    rounded
                    severity="danger"
                    tooltip="Annuler la cloture"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleReverse(rowData)}
                    loading={reverseLoading}
                />
            )}
        </div>
    );

    const previewEntryTable = (entries: PreviewEntry[], emptyMessage: string) => (
        <DataTable
            value={entries}
            stripedRows
            size="small"
            emptyMessage={emptyMessage}
            scrollable
            scrollHeight="300px"
            className="p-datatable-sm"
        >
            <Column field="sourceReference" header="Reference" style={{ width: '12%' }} />
            <Column field="numeroPiece" header="N. Piece" style={{ width: '10%' }} />
            <Column field="codeCompte" header="Compte" style={{ width: '10%' }} />
            <Column field="libelleCompte" header="Libelle Compte" style={{ width: '18%' }} />
            <Column field="libelle" header="Libelle" style={{ width: '20%' }} />
            <Column
                field="debit"
                header="Debit"
                style={{ width: '15%', textAlign: 'right' }}
                body={(r: PreviewEntry) => r.debit ? formatNumber(r.debit) : ''}
            />
            <Column
                field="credit"
                header="Credit"
                style={{ width: '15%', textAlign: 'right' }}
                body={(r: PreviewEntry) => r.credit ? formatNumber(r.credit) : ''}
            />
        </DataTable>
    );

    const previewTotalsForTab = (entries: PreviewEntry[]) => {
        const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
        const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
        return (
            <div className="flex gap-4 mt-2">
                <span className="font-bold">Total Debit: <span className="text-blue-500">{formatNumber(totalDebit)} FBu</span></span>
                <span className="font-bold">Total Credit: <span className="text-green-500">{formatNumber(totalCredit)} FBu</span></span>
                <span className="font-bold">Ecritures: {entries.length}</span>
            </div>
        );
    };

    const branchOptions = [
        { id: null, name: 'Toutes les agences' },
        ...branches
    ];

    const leftToolbarTemplate = () => (
        <div className="flex gap-2 align-items-center">
            <Calendar
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.value as Date)}
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="Selectionner une date"
                className="w-15rem"
            />
            <Dropdown
                value={selectedBranch}
                options={branchOptions}
                onChange={(e) => { setSelectedBranch(e.value); setPreview(null); }}
                optionLabel="name"
                placeholder="Toutes les agences"
                className="w-15rem"
                showClear
            />
            <Button
                label="Apercu"
                icon="pi pi-search"
                onClick={handlePreview}
                loading={previewLoading}
                severity="info"
            />
            {preview && !preview.alreadyClosed && preview.entries && preview.entries.length > 0 && (
                <Button
                    label="Executer la cloture"
                    icon="pi pi-lock"
                    onClick={handleExecute}
                    loading={executeLoading}
                    severity="success"
                />
            )}
        </div>
    );

    const rightToolbarTemplate = () => (
        <Button
            label="Actualiser"
            icon="pi pi-refresh"
            onClick={() => {
                const saved = Cookies.get('currentExercice');
                if (saved) {
                    try {
                        const ex = JSON.parse(saved);
                        setCurrentExercice(ex);
                    } catch {}
                }
                loadClosings();
            }}
            outlined
        />
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2 className="mb-4">
                <i className="pi pi-lock mr-2"></i>
                Cloture Journaliere
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

            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            {/* Preview Section */}
            {previewLoading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} className="mb-3" />}

            {preview && (
                <div className="card mb-4">
                    <h4 className="mb-3">
                        <i className="pi pi-eye mr-2"></i>
                        Apercu de la cloture du {formatDate(preview.date)}
                    </h4>

                    {preview.alreadyClosed && (
                        <div className="mb-3 p-3 border-round border-1" style={{ borderLeft: '4px solid #EF5350', backgroundColor: '#FFEBEE' }}>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-info-circle text-red-500"></i>
                                <span className="text-red-700 font-semibold">Cette date a deja ete cloturee.</span>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid mb-3">
                        <div className="col-12 md:col-3">
                            <div className="surface-card shadow-1 p-3 border-round">
                                <div className="text-500 font-medium mb-1">Total Ecritures</div>
                                <div className="text-900 text-2xl font-bold">{preview.totalEntries || 0}</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="surface-card shadow-1 p-3 border-round">
                                <div className="text-500 font-medium mb-1">Total Debit</div>
                                <div className="text-blue-500 text-2xl font-bold">{formatNumber(preview.totalDebit)} FBu</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="surface-card shadow-1 p-3 border-round">
                                <div className="text-500 font-medium mb-1">Total Credit</div>
                                <div className="text-green-500 text-2xl font-bold">{formatNumber(preview.totalCredit)} FBu</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="surface-card shadow-1 p-3 border-round">
                                <div className="text-500 font-medium mb-1">Equilibre</div>
                                <div className={`text-2xl font-bold ${preview.balanced ? 'text-green-500' : 'text-red-500'}`}>
                                    {preview.balanced ? 'OUI' : 'NON'}
                                    <i className={`pi ${preview.balanced ? 'pi-check-circle' : 'pi-times-circle'} ml-2`}></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs by operation type */}
                    <TabView activeIndex={activeTabIndex} onTabChange={(e) => setActiveTabIndex(e.index)}>
                        <TabPanel header={`Depots (${preview.depositsCount || 0})`} leftIcon="pi pi-arrow-down mr-2">
                            {previewEntryTable(
                                (preview.epargneEntries || []).filter(e => (e.sourceType || '').toUpperCase().includes('DEPOSIT')),
                                'Aucun depot pour cette date'
                            )}
                            {previewTotalsForTab(
                                (preview.epargneEntries || []).filter(e => (e.sourceType || '').toUpperCase().includes('DEPOSIT'))
                            )}
                        </TabPanel>
                        <TabPanel header={`Retraits (${preview.withdrawalsCount || 0})`} leftIcon="pi pi-arrow-up mr-2">
                            {previewEntryTable(
                                (preview.epargneEntries || []).filter(e => (e.sourceType || '').toUpperCase().includes('WITHDRAWAL')),
                                'Aucun retrait pour cette date'
                            )}
                            {previewTotalsForTab(
                                (preview.epargneEntries || []).filter(e => (e.sourceType || '').toUpperCase().includes('WITHDRAWAL'))
                            )}
                        </TabPanel>
                        <TabPanel header={`Decaissements (${preview.disbursementsCount || 0})`} leftIcon="pi pi-briefcase mr-2">
                            {previewEntryTable(preview.creditEntries || [], 'Aucun decaissement pour cette date')}
                            {previewTotalsForTab(preview.creditEntries || [])}
                        </TabPanel>
                        <TabPanel header={`Remboursements (${preview.repaymentsCount || 0})`} leftIcon="pi pi-replay mr-2">
                            {previewEntryTable(
                                (preview.remboursementEntries || []).filter(e => !(e.sourceType || '').toUpperCase().includes('EARLY')),
                                'Aucun remboursement pour cette date'
                            )}
                            {previewTotalsForTab(
                                (preview.remboursementEntries || []).filter(e => !(e.sourceType || '').toUpperCase().includes('EARLY'))
                            )}
                        </TabPanel>
                        <TabPanel header={`Remb. Anticipes (${preview.earlyRepaymentsCount || 0})`} leftIcon="pi pi-fast-forward mr-2">
                            {previewEntryTable(
                                (preview.remboursementEntries || []).filter(e => (e.sourceType || '').toUpperCase().includes('EARLY')),
                                'Aucun remboursement anticipe pour cette date'
                            )}
                            {previewTotalsForTab(
                                (preview.remboursementEntries || []).filter(e => (e.sourceType || '').toUpperCase().includes('EARLY'))
                            )}
                        </TabPanel>
                        <TabPanel header={`Tresorerie (${(preview.tresorerieEntries || []).length})`} leftIcon="pi pi-credit-card mr-2">
                            {previewEntryTable(preview.tresorerieEntries || [], 'Aucune operation de tresorerie pour cette date')}
                            {previewTotalsForTab(preview.tresorerieEntries || [])}
                        </TabPanel>
                        <TabPanel header={`Toutes (${(preview.entries || []).length})`} leftIcon="pi pi-list mr-2">
                            {previewEntryTable(preview.entries || [], 'Aucune ecriture a generer pour cette date')}
                            {previewTotalsForTab(preview.entries || [])}
                        </TabPanel>
                    </TabView>
                </div>
            )}

            {/* History Section */}
            <div className="card">
                <h4 className="mb-3">
                    <i className="pi pi-history mr-2"></i>
                    Historique des clotures
                </h4>

                <DataTable
                    value={closings}
                    loading={closingsLoading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    emptyMessage="Aucune cloture trouvee"
                    stripedRows
                    sortField="closingDate"
                    sortOrder={-1}
                    className="p-datatable-sm"
                    size="small"
                >
                    <Column
                        field="closingDate"
                        header="Date"
                        body={(r: DailyClosing) => formatDate(r.closingDate)}
                        sortable
                        style={{ width: '10%' }}
                    />
                    <Column field="status" header="Statut" body={statusBodyTemplate} sortable style={{ width: '10%' }} />
                    <Column
                        field="depositsCount"
                        header="Depots"
                        sortable
                        style={{ width: '7%', textAlign: 'center' }}
                    />
                    <Column
                        field="withdrawalsCount"
                        header="Retraits"
                        sortable
                        style={{ width: '7%', textAlign: 'center' }}
                    />
                    <Column
                        field="disbursementsCount"
                        header="Decaiss."
                        sortable
                        style={{ width: '7%', textAlign: 'center' }}
                    />
                    <Column
                        field="repaymentsCount"
                        header="Remb."
                        sortable
                        style={{ width: '7%', textAlign: 'center' }}
                    />
                    <Column
                        field="totalEntriesGenerated"
                        header="Ecritures"
                        sortable
                        style={{ width: '8%', textAlign: 'center' }}
                    />
                    <Column
                        field="totalDebit"
                        header="Total Debit"
                        body={(r: DailyClosing) => formatNumber(r.totalDebit)}
                        style={{ width: '12%', textAlign: 'right' }}
                    />
                    <Column
                        field="totalCredit"
                        header="Total Credit"
                        body={(r: DailyClosing) => formatNumber(r.totalCredit)}
                        style={{ width: '12%', textAlign: 'right' }}
                    />
                    <Column
                        field="executedBy"
                        header="Executee par"
                        style={{ width: '10%' }}
                    />
                    <Column header="Actions" body={closingActionsTemplate} style={{ width: '10%' }} />
                </DataTable>
            </div>

            {/* Detail Dialog */}
            <Dialog
                visible={detailDialogVisible}
                onHide={() => setDetailDialogVisible(false)}
                header={`Details de la cloture du ${selectedClosing ? formatDate(selectedClosing.closingDate) : ''}`}
                style={{ width: '80vw' }}
                modal
                maximizable
            >
                {selectedClosing && (
                    <div>
                        {/* Closing summary */}
                        <div className="grid mb-3">
                            <div className="col-12 md:col-3">
                                <div className="font-semibold text-500">Statut</div>
                                {statusBodyTemplate(selectedClosing)}
                            </div>
                            <div className="col-12 md:col-3">
                                <div className="font-semibold text-500">Ecritures generees</div>
                                <div className="text-900 font-bold">{selectedClosing.totalEntriesGenerated}</div>
                            </div>
                            <div className="col-12 md:col-3">
                                <div className="font-semibold text-500">Total Debit</div>
                                <div className="text-blue-500 font-bold">{formatNumber(selectedClosing.totalDebit)} FBu</div>
                            </div>
                            <div className="col-12 md:col-3">
                                <div className="font-semibold text-500">Total Credit</div>
                                <div className="text-green-500 font-bold">{formatNumber(selectedClosing.totalCredit)} FBu</div>
                            </div>
                        </div>

                        <div className="grid mb-3">
                            <div className="col-12 md:col-4">
                                <div className="font-semibold text-500">Executee par</div>
                                <div className="text-900">{selectedClosing.executedBy || '-'}</div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="font-semibold text-500">Date d'execution</div>
                                <div className="text-900">{formatDateTime(selectedClosing.executedAt)}</div>
                            </div>
                            {selectedClosing.notes && (
                                <div className="col-12 md:col-4">
                                    <div className="font-semibold text-500">Notes</div>
                                    <div className="text-900">{selectedClosing.notes}</div>
                                </div>
                            )}
                            {selectedClosing.errorMessage && (
                                <div className="col-12">
                                    <div className="font-semibold text-red-500">Erreur</div>
                                    <div className="text-red-700">{selectedClosing.errorMessage}</div>
                                </div>
                            )}
                        </div>

                        {/* Counters row */}
                        <div className="flex gap-3 mb-3 flex-wrap">
                            <Tag value={`Depots: ${selectedClosing.depositsCount || 0}`} severity="info" />
                            <Tag value={`Retraits: ${selectedClosing.withdrawalsCount || 0}`} severity="warning" />
                            <Tag value={`Decaissements: ${selectedClosing.disbursementsCount || 0}`} severity="success" />
                            <Tag value={`Remboursements: ${selectedClosing.repaymentsCount || 0}`} />
                            <Tag value={`Penalites: ${selectedClosing.penaltiesCount || 0}`} severity="danger" />
                            <Tag value={`Remb. Anticipes: ${selectedClosing.earlyRepaymentsCount || 0}`} severity="danger" />
                        </div>

                        {/* Details table */}
                        <DataTable
                            value={closingDetails}
                            loading={detailsLoading}
                            stripedRows
                            size="small"
                            emptyMessage="Aucun detail"
                            paginator
                            rows={15}
                            rowsPerPageOptions={[10, 15, 25, 50]}
                        >
                            <Column field="sourceModule" header="Module" style={{ width: '12%' }}
                                body={(r: DailyClosingDetail) => {
                                    const moduleMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
                                        'EPARGNE': { label: 'Epargne', severity: 'info' },
                                        'CREDIT': { label: 'Credit', severity: 'success' },
                                        'REMBOURSEMENT': { label: 'Remboursement', severity: 'warning' },
                                        'TRESORERIE': { label: 'Tresorerie', severity: 'danger' }
                                    };
                                    const m = moduleMap[r.sourceModule] || { label: r.sourceModule, severity: 'info' as const };
                                    return <Tag value={m.label} severity={m.severity} />;
                                }}
                            />
                            <Column field="sourceType" header="Type" style={{ width: '12%' }} />
                            <Column field="sourceReference" header="Reference Source" style={{ width: '15%' }} />
                            <Column field="journalCode" header="Journal" style={{ width: '8%' }} />
                            <Column field="numeroPiece" header="N. Piece" style={{ width: '10%' }} />
                            <Column field="pieceId" header="Piece ID" style={{ width: '18%' }} />
                            <Column
                                field="amount"
                                header="Montant"
                                style={{ width: '15%', textAlign: 'right' }}
                                body={(r: DailyClosingDetail) => formatNumber(r.amount)}
                            />
                        </DataTable>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
