'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/disbursements');

export default function DecaissementsEffectuesPage() {
    const [decaissements, setDecaissements] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadDecaissements();
    }, []);

    useEffect(() => {
        if (data && callType === 'loadDecaissements') {
            setDecaissements(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    }, [data, error, callType]);

    const loadDecaissements = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDecaissements');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const modeBodyTemplate = (rowData: any) => {
        const modeLabels: Record<string, string> = {
            'CASH': 'Espèces',
            'VIREMENT': 'Virement',
            'CHEQUE': 'Chèque',
            'MOBILE_MONEY': 'Mobile Money'
        };
        const modeColors: Record<string, string> = {
            'CASH': 'success',
            'VIREMENT': 'info',
            'CHEQUE': 'warning',
            'MOBILE_MONEY': 'help'
        };
        return <Tag value={modeLabels[rowData.disbursementMode] || rowData.disbursementMode} severity={modeColors[rowData.disbursementMode] as any || 'info'} />;
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-check-circle mr-2"></i>
                Décaissements Effectués
            </h5>
            <div className="flex gap-2 align-items-center">
                <Calendar
                    value={dateRange}
                    onChange={(e) => setDateRange(e.value as Date[])}
                    selectionMode="range"
                    readOnlyInput
                    placeholder="Période"
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="w-15rem"
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
                </span>
            </div>
        </div>
    );

    // Calculate totals
    const totalAmount = decaissements.reduce((sum, d) => sum + (d.amount || 0), 0);

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Summary Cards */}
            <div className="grid mb-4">
                <div className="col-12 md:col-4">
                    <div className="surface-100 p-3 border-round">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-money-bill text-green-500 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-500 m-0">Total Décaissé</p>
                                <p className="text-xl font-bold m-0">{formatCurrency(totalAmount)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-4">
                    <div className="surface-100 p-3 border-round">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-file text-blue-500 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-500 m-0">Nombre de Décaissements</p>
                                <p className="text-xl font-bold m-0">{decaissements.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-4">
                    <div className="surface-100 p-3 border-round">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-calculator text-purple-500 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-500 m-0">Montant Moyen</p>
                                <p className="text-xl font-bold m-0">{formatCurrency(decaissements.length > 0 ? totalAmount / decaissements.length : 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DataTable
                value={decaissements}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucun décaissement trouvé"
                className="p-datatable-sm"
            >
                <Column field="applicationNumber" header="N° Dossier" sortable filter />
                <Column field="clientName" header="Client" sortable filter />
                <Column field="amount" header="Montant" body={(row) => formatCurrency(row.amount)} sortable />
                <Column field="disbursementDate" header="Date Décaissement" body={(row) => formatDate(row.disbursementDate)} sortable />
                <Column header="Mode" body={modeBodyTemplate} />
                <Column field="reference" header="Référence" sortable filter />
                <Column field="branchName" header="Agence" sortable filter />
                <Column field="disbursedByName" header="Effectué par" sortable filter />
            </DataTable>
        </div>
    );
}
