'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

interface RapportPaiement {
    id?: number;
    creditNumber?: string;
    clientName?: string;
    paymentDate?: string;
    amount?: number;
    paymentMode?: string;
    reference?: string;
    penaltyAmount?: number;
    interestAmount?: number;
    principalAmount?: number;
    status?: string;
}

const MODES_PAIEMENT = [
    { label: 'Tous', value: null },
    { label: 'Espèces', value: 'CASH' },
    { label: 'Virement Bancaire', value: 'BANK_TRANSFER' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' },
    { label: 'Chèque', value: 'CHECK' }
];

export default function RapportPaiementsPage() {
    const [paiements, setPaiements] = useState<RapportPaiement[]>([]);
    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateFin, setDateFin] = useState<Date | null>(null);
    const [modePaiement, setModePaiement] = useState<string | null>(null);
    const [totals, setTotals] = useState({ total: 0, penalties: 0, interests: 0, principal: 0, count: 0 });
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/reports/payments');

    useEffect(() => {
        if (data && callType === 'search') {
            setPaiements(Array.isArray(data) ? data : data.content || []);
            calculateTotals(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const calculateTotals = (data: RapportPaiement[]) => {
        const totals = data.reduce((acc, item) => ({
            total: acc.total + (item.amount || 0),
            penalties: acc.penalties + (item.penaltyAmount || 0),
            interests: acc.interests + (item.interestAmount || 0),
            principal: acc.principal + (item.principalAmount || 0),
            count: acc.count + 1
        }), { total: 0, penalties: 0, interests: 0, principal: 0, count: 0 });
        setTotals(totals);
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (dateDebut) params.append('dateDebut', dateDebut.toISOString().split('T')[0]);
        if (dateFin) params.append('dateFin', dateFin.toISOString().split('T')[0]);
        if (modePaiement) params.append('mode', modePaiement);

        fetchData(null, 'GET', `${BASE_URL}?${params.toString()}`, 'search');
    };

    const handleExport = () => {
        toast.current?.show({ severity: 'info', summary: 'Export', detail: 'Export en cours...', life: 3000 });
    };

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value);
    };

    const formatDate = (value: string | undefined) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('fr-FR');
    };

    const amountBodyTemplate = (rowData: RapportPaiement) => {
        return formatCurrency(rowData.amount);
    };

    const dateBodyTemplate = (rowData: RapportPaiement) => {
        return formatDate(rowData.paymentDate);
    };

    const modeBodyTemplate = (rowData: RapportPaiement) => {
        const mode = MODES_PAIEMENT.find(m => m.value === rowData.paymentMode);
        return mode?.label || rowData.paymentMode;
    };

    const statusBodyTemplate = (rowData: RapportPaiement) => {
        const severity = rowData.status === 'VALIDATED' ? 'success' : rowData.status === 'PENDING' ? 'warning' : 'danger';
        const label = rowData.status === 'VALIDATED' ? 'Validé' : rowData.status === 'PENDING' ? 'En attente' : rowData.status;
        return <Tag value={label} severity={severity} />;
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Liste des Paiements</h4>
            <Button label="Exporter" icon="pi pi-download" severity="help" onClick={handleExport} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2 className="mb-4">
                <i className="pi pi-money-bill mr-2"></i>
                Rapport des Paiements
            </h2>

            <Card className="mb-4">
                <div className="grid">
                    <div className="col-12 md:col-3">
                        <div className="field">
                            <label htmlFor="dateDebut" className="font-semibold">Date Début</label>
                            <Calendar
                                id="dateDebut"
                                value={dateDebut}
                                onChange={(e) => setDateDebut(e.value as Date)}
                                className="w-full"
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="field">
                            <label htmlFor="dateFin" className="font-semibold">Date Fin</label>
                            <Calendar
                                id="dateFin"
                                value={dateFin}
                                onChange={(e) => setDateFin(e.value as Date)}
                                className="w-full"
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="field">
                            <label htmlFor="modePaiement" className="font-semibold">Mode de Paiement</label>
                            <Dropdown
                                id="modePaiement"
                                value={modePaiement}
                                options={MODES_PAIEMENT}
                                onChange={(e) => setModePaiement(e.value)}
                                className="w-full"
                                placeholder="Tous les modes"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-3 flex align-items-end">
                        <Button label="Rechercher" icon="pi pi-search" onClick={handleSearch} className="w-full" />
                    </div>
                </div>
            </Card>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="bg-blue-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700">{totals.count}</div>
                            <div className="text-500">Nombre de Paiements</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-green-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">{formatCurrency(totals.total)}</div>
                            <div className="text-500">Total Encaissé</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-purple-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-700">{formatCurrency(totals.principal)}</div>
                            <div className="text-500">Capital Remboursé</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-orange-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-700">{formatCurrency(totals.interests + totals.penalties)}</div>
                            <div className="text-500">Intérêts + Pénalités</div>
                        </div>
                    </Card>
                </div>
            </div>

            <DataTable
                value={paiements}
                loading={loading && callType === 'search'}
                paginator
                rows={10}
                emptyMessage="Aucun paiement trouvé. Veuillez effectuer une recherche."
                stripedRows
                header={header}
            >
                <Column field="paymentDate" header="Date" body={dateBodyTemplate} sortable />
                <Column field="creditNumber" header="N° Crédit" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="amount" header="Montant" body={amountBodyTemplate} sortable />
                <Column field="paymentMode" header="Mode" body={modeBodyTemplate} />
                <Column field="reference" header="Référence" />
                <Column field="status" header="Statut" body={statusBodyTemplate} />
            </DataTable>
        </div>
    );
}
