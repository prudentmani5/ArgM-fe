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
import { exportToPDF, formatCurrency as formatCurrencyPDF, formatDate as formatDatePDF } from '../../../../../utils/pdfExport';

const MODES_PAIEMENT = [
    { label: 'Agence (Espèces)', value: 'AGENCY' },
    { label: 'Prélèvement Automatique', value: 'AUTO_DEBIT' },
    { label: 'Collecte à Domicile', value: 'HOME_COLLECTION' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' },
    { label: 'Virement Bancaire', value: 'BANK_TRANSFER' }
];

export default function RapportPaiementsPage() {
    const [paiements, setPaiements] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        mode: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/payments');

    useEffect(() => {
        loadPaiements();
    }, []);

    useEffect(() => {
        if (data) {
            setPaiements(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error]);

    const loadPaiements = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadPaiements');
    };

    const formatCurrency = (value: number) => {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0 }).format(value) + ' BIF';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getModeLabel = (rowData: any): string => {
        if (rowData.isMobileMoney) return 'Mobile Money';
        if (rowData.isBankTransfer) return 'Virement Bancaire';
        if (rowData.isAutoDebit) return 'Prélèvement Auto.';
        if (rowData.isHomeCollection) return 'Collecte Domicile';
        const mode = rowData.repaymentMode;
        if (!mode) return 'Agence';
        if (typeof mode === 'object') return mode.nameFr || mode.name || 'Agence';
        return mode;
    };

    const getModeCode = (rowData: any): string => {
        if (rowData.isMobileMoney) return 'MOBILE_MONEY';
        if (rowData.isBankTransfer) return 'BANK_TRANSFER';
        if (rowData.isAutoDebit) return 'AUTO_DEBIT';
        if (rowData.isHomeCollection) return 'HOME_COLLECTION';
        return 'AGENCY';
    };

    // Client-side filtering
    const filteredPaiements = paiements.filter((p: any) => {
        let match = true;
        if (filters.mode) {
            match = match && getModeCode(p) === filters.mode;
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const pDate = new Date(p.paymentDate);
            match = match && pDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && pDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Statistics
    const totalEncaisse = filteredPaiements.reduce((sum, p) => sum + (p.amountReceived || 0), 0);
    const totalPrincipal = filteredPaiements.reduce((sum, p) => sum + (p.allocatedToPrincipal || 0), 0);
    const totalInterests = filteredPaiements.reduce((sum, p) => sum + (p.allocatedToInterest || 0), 0);
    const totalPenalties = filteredPaiements.reduce((sum, p) => sum + (p.allocatedToPenalty || 0), 0);

    const modeBodyTemplate = (rowData: any) => {
        const label = getModeLabel(rowData);
        const code = getModeCode(rowData);
        const colors: Record<string, string> = {
            'AGENCY': 'success',
            'AUTO_DEBIT': 'info',
            'HOME_COLLECTION': 'warning',
            'MOBILE_MONEY': 'help',
            'BANK_TRANSFER': 'info'
        };
        return <Tag value={label} severity={colors[code] as any || 'info'} />;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport des Paiements',
            columns: [
                { header: 'Date', dataKey: 'paymentDate', formatter: formatDatePDF },
                { header: 'N° Paiement', dataKey: 'paymentNumber' },
                { header: 'N° Dossier', dataKey: 'applicationNumber' },
                { header: 'Client', dataKey: 'clientName' },
                { header: 'Montant', dataKey: 'amountReceived', formatter: formatCurrencyPDF },
                { header: 'Capital', dataKey: 'allocatedToPrincipal', formatter: formatCurrencyPDF },
                { header: 'Intérêts', dataKey: 'allocatedToInterest', formatter: formatCurrencyPDF },
                { header: 'Pénalités', dataKey: 'allocatedToPenalty', formatter: formatCurrencyPDF },
                { header: 'Responsable', dataKey: 'userAction' }
            ],
            data: filteredPaiements,
            filename: 'rapport_paiements.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Nombre de Paiements', value: filteredPaiements.length },
                { label: 'Total Encaissé', value: formatCurrency(totalEncaisse) },
                { label: 'Capital Remboursé', value: formatCurrency(totalPrincipal) },
                { label: 'Intérêts + Pénalités', value: formatCurrency(totalInterests + totalPenalties) }
            ]
        });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Paiements</h5>
            <div className="flex gap-2">
                <Button label="Exporter CSV" icon="pi pi-file-excel" severity="success" onClick={exportCSV} />
                <Button label="Exporter PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportPdf} />
            </div>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2 className="mb-4">
                <i className="pi pi-money-bill mr-2"></i>
                Rapport des Paiements
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-filter mr-2"></i>Filtres</h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Période</label>
                        <Calendar
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.value })}
                            selectionMode="range"
                            readOnlyInput
                            placeholder="Sélectionner une période"
                            dateFormat="dd/mm/yy"
                            showIcon
                            showButtonBar
                            className="w-full"
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Mode de Paiement</label>
                        <Dropdown
                            value={filters.mode}
                            options={MODES_PAIEMENT}
                            onChange={(e) => setFilters({ ...filters, mode: e.value })}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Tous les modes"
                            className="w-full"
                            showClear
                        />
                    </div>
                </div>
            </div>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <div className="bg-blue-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Nombre de Paiements</p>
                        <p className="text-2xl font-bold text-blue-700 m-0">{filteredPaiements.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Encaissé</p>
                        <p className="text-2xl font-bold text-green-700 m-0">{formatCurrency(totalEncaisse)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-purple-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Capital Remboursé</p>
                        <p className="text-2xl font-bold text-purple-700 m-0">{formatCurrency(totalPrincipal)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-orange-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Intérêts + Pénalités</p>
                        <p className="text-2xl font-bold text-orange-700 m-0">{formatCurrency(totalInterests + totalPenalties)}</p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredPaiements}
                loading={loading}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Aucun paiement trouvé."
                stripedRows
                header={header}
                exportFilename="rapport_paiements"
                sortField="paymentDate"
                sortOrder={-1}
                className="p-datatable-sm"
            >
                <Column field="paymentDate" header="Date" body={(row) => formatDate(row.paymentDate)} sortable />
                <Column field="paymentNumber" header="N° Paiement" sortable />
                <Column field="applicationNumber" header="N° Dossier" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="amountReceived" header="Montant" body={(row) => formatCurrency(row.amountReceived)} sortable />
                <Column header="Mode" body={modeBodyTemplate} />
                <Column field="allocatedToPrincipal" header="Capital" body={(row) => formatCurrency(row.allocatedToPrincipal)} />
                <Column field="allocatedToInterest" header="Intérêts" body={(row) => formatCurrency(row.allocatedToInterest)} />
                <Column field="userAction" header="Responsable" sortable />
            </DataTable>
        </div>
    );
}
