'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import Cookies from 'js-cookie';

const BASE_URL = buildApiUrl('/api/credit/applications');
const SAVINGS_ACCOUNTS_URL = buildApiUrl('/api/epargne/comptes');

export default function AnalysesListPage() {
    const [demandes, setDemandes] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadDemandes();
        loadSavingsAccounts();
    }, []);

    // Load savings accounts to map account numbers
    const loadSavingsAccounts = async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${SAVINGS_ACCOUNTS_URL}/findallactive`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include'
            });
            if (response.ok) {
                const accountsData = await response.json();
                setSavingsAccounts(Array.isArray(accountsData) ? accountsData : accountsData?.content || []);
            }
        } catch (err) {
            console.error('Error loading savings accounts:', err);
        }
    };

    useEffect(() => {
        if (data && callType === 'loadDemandes') {
            const list = Array.isArray(data) ? data : data.content || [];
            // Filter only demandes that need or have analysis (statuses after document reception)
            const analysisStatuses = [
                'DOCS_RECEIVED',
                'UNDER_ANALYSIS',
                'FIELD_VISIT',
                'VISIT_COMPLETED',
                'PENDING_COMMITTEE',
                'APPROVED',
                'APPROVED_CONDITIONS',
                'APPROUVE_MONTANT_REDUIT',
                'AJOURNE',
                'RENVOI_ANALYSE'
            ];
            setDemandes(list.filter((d: any) =>
                analysisStatuses.includes(d.status?.code)
            ));
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    }, [data, error, callType]);

    const loadDemandes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDemandes');
    };

    // Get account number from savingsAccountId
    const getAccountNumber = (savingsAccountId: number) => {
        if (!savingsAccountId) return '-';
        const account = savingsAccounts.find(a => a.id === savingsAccountId);
        return account?.accountNumber || '-';
    };

    const goToAnalysis = (rowData: any) => {
        router.push(`/credit/analyses/${rowData.id}`);
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

    const clientBodyTemplate = (rowData: any) => {
        const client = rowData.client;
        return client ? `${client.firstName} ${client.lastName}` : '-';
    };

    const accountNumberBodyTemplate = (rowData: any) => {
        return getAccountNumber(rowData.savingsAccountId);
    };

    const userActionBodyTemplate = (rowData: any) => {
        return rowData.userAction || '-';
    };

    const statusBodyTemplate = (rowData: any) => {
        const status = rowData.status;
        return status ? (
            <Tag value={status.nameFr || status.name} style={{ backgroundColor: status.color || '#6c757d' }} />
        ) : (
            <Tag value="-" severity="info" />
        );
    };

    const analysisStatusTemplate = (rowData: any) => {
        // Check if capacity analysis exists
        if (rowData.repaymentCapacity || rowData.totalMonthlyIncome) {
            return <Tag value="Complétée" severity="success" icon="pi pi-check" />;
        }
        return <Tag value="En attente" severity="warning" icon="pi pi-clock" />;
    };

    const actionsBodyTemplate = (rowData: any) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-chart-line"
                rounded
                text
                severity="info"
                onClick={() => goToAnalysis(rowData)}
                tooltip="Analyse Financière"
            />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-chart-line mr-2"></i>
                Analyses Financières en Cours
            </h5>
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

            <DataTable
                value={demandes}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucune demande en attente d'analyse"
                className="p-datatable-sm"
            >
                <Column field="applicationNumber" header="N° Dossier" sortable filter />
                <Column header="Client" body={clientBodyTemplate} sortable filter />
                <Column header="N° Compte" body={accountNumberBodyTemplate} sortable filter />
                <Column field="amountRequested" header="Montant Demandé" body={(row) => formatCurrency(row.amountRequested)} sortable />
                <Column field="applicationDate" header="Date Dépôt" body={(row) => formatDate(row.applicationDate)} sortable />
                <Column header="Statut Demande" body={statusBodyTemplate} />
                <Column header="Analyse" body={analysisStatusTemplate} />
                <Column header="Agent de Crédit" body={userActionBodyTemplate} sortable filter />
                {/*<Column header="Actions" body={actionsBodyTemplate} style={{ width: '100px' }} />*/}
            </DataTable>
        </div>
    );
}
