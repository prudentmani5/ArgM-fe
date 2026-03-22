'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

function RapprochementDepotsPage() {
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [selectedAccountType, setSelectedAccountType] = useState<string | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const { data: accountsData, error: accountsError, fetchData: fetchAccounts } = useConsumApi('');
    const { data: branchesData, error: branchesError, fetchData: fetchBranches } = useConsumApi('');

    const SAVINGS_URL = buildApiUrl('/api/savings-accounts');
    const BRANCHES_URL = buildApiUrl('/api/moduleCostumerGroup/branches');

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const accountTypeOptions = [
        { label: 'Tous les types', value: null },
        { label: 'Compte Régulier', value: 'REGULAR' },
        { label: 'Dépôt à Terme', value: 'TERM_DEPOSIT' },
        { label: 'Épargne Obligatoire', value: 'COMPULSORY' }
    ];

    useEffect(() => {
        fetchAccounts(null, 'GET', `${SAVINGS_URL}/findall`, 'loadAccounts');
        fetchBranches(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
    }, []);

    useEffect(() => {
        if (accountsData) {
            const arr = Array.isArray(accountsData) ? accountsData : accountsData.content || [];
            setSavingsAccounts(arr);
        }
        if (accountsError) showToast('error', 'Erreur', accountsError.message || 'Erreur de chargement des comptes');
    }, [accountsData, accountsError]);

    useEffect(() => {
        if (branchesData) {
            const arr = Array.isArray(branchesData) ? branchesData : branchesData.content || [];
            setBranches(arr);
        }
    }, [branchesData, branchesError]);

    const loadByBranch = (branchId: number | null) => {
        setSelectedBranchId(branchId);
        if (branchId) {
            fetchAccounts(null, 'GET', `${SAVINGS_URL}/findbybranch/${branchId}`, 'loadAccounts');
        } else {
            fetchAccounts(null, 'GET', `${SAVINGS_URL}/findall`, 'loadAccounts');
        }
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContents = printRef.current.innerHTML;
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html><head><title>Rapprochement des Dépôts</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px 30px; font-size: 10px; }
                        h1 { text-align: center; font-size: 16px; text-transform: uppercase; }
                        h2 { font-size: 13px; border-bottom: 2px solid #2196F3; padding-bottom: 4px; color: #1565C0; }
                        h3 { text-align: center; color: #666; font-size: 11px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                        th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; }
                        th { background-color: #E3F2FD; font-weight: 600; color: #1565C0; font-size: 9px; text-transform: uppercase; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .summary-box { border: 2px solid #1565C0; padding: 10px; margin: 10px 0; border-radius: 4px; }
                        .summary-box td { border: none; padding: 4px 8px; }
                        .dormant { background-color: #FFF3E0; }
                        .footer-note { text-align: center; margin-top: 20px; font-size: 9px; color: #999; }
                        @media print { body { margin: 10px; } }
                    </style></head><body>${printContents}</body></html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    const formatCurrency = (value: number | undefined | null) => {
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value || 0);
    };

    const formatDate = (date: string | undefined | null) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    // Filter accounts
    const filteredAccounts = savingsAccounts.filter((a: any) => {
        if (selectedAccountType && a.accountType !== selectedAccountType) return false;
        return true;
    });

    // Stats
    const totalAccounts = filteredAccounts.length;
    const activeAccounts = filteredAccounts.filter((a: any) => a.status?.code === 'ACTIVE' || a.status?.name === 'ACTIVE' || a.statusId === 1 || a.status?.id === 1).length;
    const dormantAccounts = filteredAccounts.filter((a: any) => a.isDormant).length;
    const totalBalance = filteredAccounts.reduce((sum: number, a: any) => sum + (a.currentBalance || 0), 0);
    const totalBlocked = filteredAccounts.reduce((sum: number, a: any) => sum + (a.blockedAmount || 0), 0);
    const totalAvailable = filteredAccounts.reduce((sum: number, a: any) => sum + (a.availableBalance || 0), 0);

    // Group by account type
    const byType = filteredAccounts.reduce((acc: any, a: any) => {
        const type = a.accountType || 'REGULAR';
        if (!acc[type]) acc[type] = { count: 0, balance: 0 };
        acc[type].count++;
        acc[type].balance += (a.currentBalance || 0);
        return acc;
    }, {});

    const typeLabels: Record<string, string> = {
        'REGULAR': 'Compte Régulier',
        'TERM_DEPOSIT': 'Dépôt à Terme',
        'COMPULSORY': 'Épargne Obligatoire'
    };

    const getAccountStatusCode = (account: any): string => {
        if (typeof account.status === 'string') return account.status;
        return account.status?.code || account.status?.name || '';
    };

    const isAccountActive = (account: any): boolean => {
        const code = getAccountStatusCode(account);
        return code === 'ACTIVE' || account.statusId === 1 || account.status?.id === 1;
    };

    const getStatusLabel = (account: any): string => {
        if (account.isDormant) return 'Dormant';
        if (isAccountActive(account)) return 'Actif';
        const code = getAccountStatusCode(account);
        if (code === 'CLOSED') return 'Fermé';
        if (account.status?.nameFr) return account.status.nameFr;
        if (account.status?.name && typeof account.status.name === 'string') return account.status.name;
        return 'Actif';
    };

    const getStatusSeverity = (account: any): 'success' | 'danger' | 'warning' | 'info' | null => {
        if (account.isDormant) return 'warning';
        if (isAccountActive(account)) return 'success';
        const code = getAccountStatusCode(account);
        if (code === 'CLOSED') return 'danger';
        return 'info';
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2><i className="pi pi-wallet mr-2"></i>Rapprochement des Dépôts d'Épargne</h2>
            <p className="text-500 mb-4">Vérification des soldes des comptes épargnants dans le système</p>

            {/* Summary Cards */}
            <div className="grid mb-4">
                <div className="col-12 md:col-2">
                    <Card className="shadow-1">
                        <div className="text-center">
                            <span className="block text-500 font-medium mb-1">Total Comptes</span>
                            <div className="text-900 font-bold text-2xl">{totalAccounts}</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-2">
                    <Card className="shadow-1">
                        <div className="text-center">
                            <span className="block text-500 font-medium mb-1">Actifs</span>
                            <div className="text-green-500 font-bold text-2xl">{activeAccounts}</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-2">
                    <Card className="shadow-1">
                        <div className="text-center">
                            <span className="block text-500 font-medium mb-1">Dormants</span>
                            <div className={`font-bold text-2xl ${dormantAccounts > 0 ? 'text-orange-500' : 'text-green-500'}`}>{dormantAccounts}</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="shadow-1">
                        <div className="text-center">
                            <span className="block text-500 font-medium mb-1">Solde Total</span>
                            <div className="text-blue-500 font-bold text-lg">{formatCurrency(totalBalance)}</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="shadow-1">
                        <div className="text-center">
                            <span className="block text-500 font-medium mb-1">Montant Bloqué</span>
                            <div className="text-orange-500 font-bold text-lg">{formatCurrency(totalBlocked)}</div>
                            <span className="text-xs text-500">Disponible: {formatCurrency(totalAvailable)}</span>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Filters */}
            <div className="surface-100 p-3 border-round mb-4">
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label className="font-semibold">Agence</label>
                        <Dropdown
                            value={selectedBranchId}
                            options={branches}
                            onChange={(e) => loadByBranch(e.value)}
                            optionLabel="branchName"
                            optionValue="branchId"
                            placeholder="Toutes les agences"
                            filter
                            showClear
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label className="font-semibold">Type de compte</label>
                        <Dropdown
                            value={selectedAccountType}
                            options={accountTypeOptions}
                            onChange={(e) => setSelectedAccountType(e.value)}
                            placeholder="Tous les types"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-5 flex align-items-end gap-2">
                        <Button label="Imprimer" icon="pi pi-print" onClick={handlePrint} />
                    </div>
                </div>
            </div>

            {/* Breakdown by type */}
            {Object.keys(byType).length > 0 && (
                <div className="grid mb-4">
                    {Object.entries(byType).map(([type, data]: [string, any]) => (
                        <div key={type} className="col-12 md:col-4">
                            <div className="surface-card p-3 border-round shadow-1 border-left-3 border-blue-500">
                                <div className="text-500 text-sm mb-1">{typeLabels[type] || type}</div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="font-bold text-lg">{data.count} comptes</span>
                                    <span className="text-blue-500 font-bold">{formatCurrency(data.balance)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Printable content */}
            <div ref={printRef}>
                {/* Print header (visible only in print) */}
                <div style={{ display: 'none' }}>
                    <h1>RAPPROCHEMENT DES DÉPÔTS D'ÉPARGNE</h1>
                    <h3>Date: {new Date().toLocaleDateString('fr-FR')} | Total: {totalAccounts} comptes | Solde: {formatCurrency(totalBalance)}</h3>
                </div>

                {/* Accounts Table */}
                <DataTable
                    value={filteredAccounts}
                    paginator
                    rows={15}
                    rowsPerPageOptions={[10, 15, 25, 50, 100]}
                    globalFilter={globalFilter}
                    header={
                        <div className="flex justify-content-between align-items-center">
                            <h5 className="m-0">Comptes d'épargne ({filteredAccounts.length})</h5>
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
                            </span>
                        </div>
                    }
                    className="p-datatable-sm"
                    emptyMessage="Aucun compte trouvé"
                    stripedRows
                    showGridlines
                    sortField="currentBalance"
                    sortOrder={-1}
                    rowClassName={(data) => data.isDormant ? 'bg-orange-50' : ''}
                >
                    <Column field="accountNumber" header="N° Compte" sortable filter style={{ width: '12%' }} />
                    <Column header="Client" body={(row) => {
                        const client = row.client;
                        return client ? `${client.firstName || ''} ${client.lastName || ''}` : row.clientName || '-';
                    }} sortable />
                    <Column header="Type" body={(row) => (
                        <Tag value={typeLabels[row.accountType] || row.accountType || 'Régulier'} severity="info" />
                    )} sortable sortField="accountType" style={{ width: '12%' }} />
                    <Column field="currentBalance" header="Solde Actuel" body={(row) => (
                        <span className="font-bold">{formatCurrency(row.currentBalance)}</span>
                    )} sortable style={{ width: '12%' }} />
                    <Column field="availableBalance" header="Disponible" body={(row) => formatCurrency(row.availableBalance)} sortable style={{ width: '12%' }} />
                    <Column field="blockedAmount" header="Bloqué" body={(row) => (
                        (row.blockedAmount || 0) > 0 ? <span className="text-orange-500">{formatCurrency(row.blockedAmount)}</span> : '-'
                    )} sortable style={{ width: '10%' }} />
                    <Column header="Ouverture" body={(row) => formatDate(row.openingDate)} style={{ width: '10%' }} />
                    <Column header="Statut" body={(row) => (
                        <Tag value={getStatusLabel(row)} severity={getStatusSeverity(row)} />
                    )} sortable style={{ width: '8%' }} />
                </DataTable>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_VIEW']}>
            <RapprochementDepotsPage />
        </ProtectedPage>
    );
}
