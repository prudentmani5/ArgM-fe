'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { CompulsorySavings, CompulsorySavingsStatus } from './CompulsorySavings';

const BASE_URL = `${API_BASE_URL}/api/epargne/compulsory-savings`;

function CompulsorySavingsPage() {
    const [compulsorySavings, setCompulsorySavings] = useState<CompulsorySavings[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [selectedSavings, setSelectedSavings] = useState<CompulsorySavings | null>(null);
    const toast = useRef<Toast>(null);
    const { data, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadData':
                    setCompulsorySavings(Array.isArray(data) ? data : data.content || []);
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadData = () => {
        setLoading(true);
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadData');
        setLoading(false);
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const viewDetails = (rowData: CompulsorySavings) => {
        setSelectedSavings(rowData);
        setViewDialog(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const formatPercent = (value: number) => {
        return value.toFixed(2) + ' %';
    };

    const getStatusSeverity = (status: CompulsorySavingsStatus): 'success' | 'info' | 'warning' | 'danger' => {
        switch (status) {
            case CompulsorySavingsStatus.ACTIVE: return 'success';
            case CompulsorySavingsStatus.BLOCKED: return 'warning';
            case CompulsorySavingsStatus.RELEASED: return 'info';
            case CompulsorySavingsStatus.CLOSED: return 'danger';
            default: return 'info';
        }
    };

    const getStatusLabel = (status: CompulsorySavingsStatus): string => {
        const labels: { [key in CompulsorySavingsStatus]: string } = {
            [CompulsorySavingsStatus.ACTIVE]: 'Actif',
            [CompulsorySavingsStatus.BLOCKED]: 'Bloqué',
            [CompulsorySavingsStatus.RELEASED]: 'Débloqué',
            [CompulsorySavingsStatus.CLOSED]: 'Clôturé'
        };
        return labels[status] || status;
    };

    const statusBodyTemplate = (rowData: CompulsorySavings) => {
        return (
            <Tag
                value={getStatusLabel(rowData.status)}
                severity={getStatusSeverity(rowData.status)}
            />
        );
    };

    const blockedBodyTemplate = (rowData: CompulsorySavings) => {
        return rowData.isBlocked ? (
            <Tag value="Bloqué" severity="danger" icon="pi pi-lock" />
        ) : (
            <Tag value="Disponible" severity="success" icon="pi pi-lock-open" />
        );
    };

    const progressBodyTemplate = (rowData: CompulsorySavings) => {
        const progress = rowData.requiredAmount > 0
            ? Math.min((rowData.currentBalance / rowData.requiredAmount) * 100, 100)
            : 0;
        return (
            <div className="flex flex-column gap-1">
                <span className="text-sm">{formatPercent(progress)}</span>
                <ProgressBar
                    value={progress}
                    showValue={false}
                    style={{ height: '6px' }}
                    color={progress >= 100 ? '#22c55e' : '#f59e0b'}
                />
            </div>
        );
    };

    const actionsBodyTemplate = (rowData: CompulsorySavings) => {
        return (
            <div className="flex gap-1">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewDetails(rowData)}
                    tooltip="Voir détails"
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Épargnes Obligatoires</h5>
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

    // Statistiques
    const stats = {
        total: compulsorySavings.length,
        blocked: compulsorySavings.filter(s => s.isBlocked).length,
        released: compulsorySavings.filter(s => s.status === CompulsorySavingsStatus.RELEASED).length,
        totalAmount: compulsorySavings.reduce((sum, s) => sum + (s.currentBalance || 0), 0),
        totalInterest: compulsorySavings.reduce((sum, s) => sum + (s.accruedInterest || 0), 0)
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <h4 className="text-primary mb-4">
                <i className="pi pi-lock mr-2"></i>
                Épargne Obligatoire Liée au Crédit
            </h4>

            {/* Informations explicatives */}
            <div className="surface-100 p-3 border-round mb-4">
                <h6 className="m-0 mb-2">
                    <i className="pi pi-info-circle mr-2 text-blue-500"></i>
                    Principe de l'Épargne Obligatoire
                </h6>
                <p className="m-0 text-600 mb-2">
                    Obligation d'épargner un pourcentage du crédit obtenu comme garantie supplémentaire.
                </p>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-percentage text-green-500"></i>
                            <span><strong>Taux:</strong> 10% à 20% du crédit</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-lock text-orange-500"></i>
                            <span><strong>Blocage:</strong> Jusqu'au remboursement complet</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-chart-line text-blue-500"></i>
                            <span><strong>Rémunération:</strong> 3% annuel</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="h-full">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round p-3">
                                <i className="pi pi-list text-blue-500 text-2xl"></i>
                            </div>
                            <div>
                                <span className="block text-500 font-medium mb-1">Total Épargnes</span>
                                <span className="text-2xl font-bold">{stats.total}</span>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="h-full">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-orange-100 border-round p-3">
                                <i className="pi pi-lock text-orange-500 text-2xl"></i>
                            </div>
                            <div>
                                <span className="block text-500 font-medium mb-1">Bloquées</span>
                                <span className="text-2xl font-bold text-orange-600">{stats.blocked}</span>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="h-full">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-green-100 border-round p-3">
                                <i className="pi pi-wallet text-green-500 text-2xl"></i>
                            </div>
                            <div>
                                <span className="block text-500 font-medium mb-1">Solde Total</span>
                                <span className="text-xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="h-full">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-purple-100 border-round p-3">
                                <i className="pi pi-chart-line text-purple-500 text-2xl"></i>
                            </div>
                            <div>
                                <span className="block text-500 font-medium mb-1">Intérêts Courus</span>
                                <span className="text-xl font-bold text-purple-600">{formatCurrency(stats.totalInterest)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Tableau des données */}
            <DataTable
                value={compulsorySavings}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucune épargne obligatoire trouvée"
                stripedRows
                showGridlines
                size="small"
            >
                <Column field="referenceNumber" header="Référence" sortable />
                <Column
                    field="client"
                    header="Client"
                    sortable
                    body={(row) => row.client ? `${row.client.firstName} ${row.client.lastName}` : '-'}
                />
                <Column
                    field="loan"
                    header="N° Crédit"
                    body={(row) => row.loan?.loanNumber || '-'}
                />
                <Column
                    field="requiredPercentage"
                    header="% Requis"
                    body={(row) => formatPercent(row.requiredPercentage)}
                />
                <Column
                    field="requiredAmount"
                    header="Montant Requis"
                    body={(row) => formatCurrency(row.requiredAmount)}
                    sortable
                />
                <Column
                    field="currentBalance"
                    header="Solde Actuel"
                    body={(row) => formatCurrency(row.currentBalance)}
                    sortable
                />
                <Column header="Progression" body={progressBodyTemplate} />
                <Column
                    field="accruedInterest"
                    header="Intérêts"
                    body={(row) => formatCurrency(row.accruedInterest || 0)}
                />
                <Column header="Blocage" body={blockedBodyTemplate} />
                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                <Column header="Actions" body={actionsBodyTemplate} style={{ width: '100px' }} />
            </DataTable>

            {/* Dialog pour voir les détails */}
            <Dialog
                header="Détails de l'Épargne Obligatoire"
                visible={viewDialog}
                style={{ width: '600px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedSavings && (
                    <div className="p-fluid">
                        <div className="surface-100 p-3 border-round mb-3">
                            <h6 className="m-0 mb-2 text-primary">Informations Générales</h6>
                            <div className="grid">
                                <div className="col-6">
                                    <p className="text-500 mb-1">Référence</p>
                                    <p className="font-bold">{selectedSavings.referenceNumber}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-500 mb-1">Client</p>
                                    <p className="font-bold">
                                        {selectedSavings.client
                                            ? `${selectedSavings.client.firstName} ${selectedSavings.client.lastName}`
                                            : '-'}
                                    </p>
                                </div>
                                <div className="col-6">
                                    <p className="text-500 mb-1">N° Crédit Lié</p>
                                    <p className="font-bold">{selectedSavings.loan?.loanNumber || '-'}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-500 mb-1">Agence</p>
                                    <p className="font-bold">{selectedSavings.branch?.name || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-3">
                            <h6 className="m-0 mb-2 text-primary">Montants</h6>
                            <div className="grid">
                                <div className="col-6">
                                    <p className="text-500 mb-1">Pourcentage Requis</p>
                                    <p className="font-bold text-xl">{formatPercent(selectedSavings.requiredPercentage)}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-500 mb-1">Montant Requis</p>
                                    <p className="font-bold text-xl">{formatCurrency(selectedSavings.requiredAmount)}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-500 mb-1">Solde Actuel</p>
                                    <p className="font-bold text-xl text-green-600">{formatCurrency(selectedSavings.currentBalance)}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-500 mb-1">Intérêts Courus</p>
                                    <p className="font-bold text-xl text-blue-600">{formatCurrency(selectedSavings.accruedInterest || 0)}</p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-500 mb-1">Taux d'Intérêt</p>
                                <p className="font-bold">{formatPercent(selectedSavings.interestRate)} annuel</p>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-3">
                            <h6 className="m-0 mb-2 text-primary">Statut et Dates</h6>
                            <div className="grid">
                                <div className="col-6">
                                    <p className="text-500 mb-1">Statut</p>
                                    <Tag
                                        value={getStatusLabel(selectedSavings.status)}
                                        severity={getStatusSeverity(selectedSavings.status)}
                                    />
                                </div>
                                <div className="col-6">
                                    <p className="text-500 mb-1">Blocage</p>
                                    {selectedSavings.isBlocked ? (
                                        <Tag value="Bloqué" severity="danger" icon="pi pi-lock" />
                                    ) : (
                                        <Tag value="Disponible" severity="success" icon="pi pi-lock-open" />
                                    )}
                                </div>
                                <div className="col-6">
                                    <p className="text-500 mb-1">Date de Début</p>
                                    <p className="font-bold">{selectedSavings.startDate}</p>
                                </div>
                                {selectedSavings.unblockDate && (
                                    <div className="col-6">
                                        <p className="text-500 mb-1">Date de Déblocage</p>
                                        <p className="font-bold">{selectedSavings.unblockDate}</p>
                                    </div>
                                )}
                            </div>
                            {selectedSavings.blockedReason && (
                                <div className="mt-2">
                                    <p className="text-500 mb-1">Motif de Blocage</p>
                                    <p className="font-medium">{selectedSavings.blockedReason}</p>
                                </div>
                            )}
                        </div>

                        {/* Exemple de calcul */}
                        <div className="surface-100 p-3 border-round border-left-3 border-blue-500">
                            <h6 className="m-0 mb-2 text-blue-600">
                                <i className="pi pi-calculator mr-2"></i>
                                Exemple de Calcul
                            </h6>
                            <p className="m-0 text-600">
                                Crédit de {formatCurrency(selectedSavings.requiredAmount / (selectedSavings.requiredPercentage / 100))}
                                × {formatPercent(selectedSavings.requiredPercentage)}
                                = Épargne obligatoire de {formatCurrency(selectedSavings.requiredAmount)}
                            </p>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}

export default CompulsorySavingsPage;
