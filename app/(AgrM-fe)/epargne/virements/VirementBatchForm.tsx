'use client';
import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { VirementBatch, VirementBatchDetail, DEFAULT_COMMISSION_RATE } from './Virement';
import { getClientDisplayName } from '@/utils/clientUtils';

interface VirementBatchFormProps {
    batch: VirementBatch;
    setBatch: (batch: VirementBatch) => void;
    savingsAccounts: any[];
    branches: any[];
    isViewMode?: boolean;
}

const VirementBatchForm: React.FC<VirementBatchFormProps> = ({
    batch,
    setBatch,
    savingsAccounts,
    branches,
    isViewMode = false
}) => {
    const [destAccountId, setDestAccountId] = useState<number | null>(null);
    const [destAmount, setDestAmount] = useState<number>(0);

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '0 FBU';
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    // Source account info
    const sourceAccount = savingsAccounts.find(a => a.id === batch.sourceSavingsAccountId);
    const sourceBalance = sourceAccount?.availableBalance || sourceAccount?.currentBalance || 0;

    // Calculate total allocated to destinations
    const totalAllocated = batch.details.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Commission calculation
    const commissionAmount = Math.round(totalAllocated * (batch.commissionRate || 0) / 100);
    const totalDebitAmount = totalAllocated + commissionAmount;

    // Remaining balance = source balance - total debit
    const remainingBalance = sourceBalance - totalDebitAmount;

    // Check if a destination account is already in the list
    const isDuplicate = (accountId: number) => {
        return batch.details.some(d => d.destinationSavingsAccountId === accountId);
    };

    // Check if source account is selected as destination
    const isSameAsSource = (accountId: number) => {
        return accountId === batch.sourceSavingsAccountId;
    };

    // Can add destination?
    const canAdd = destAccountId !== null
        && destAmount > 0
        && !isDuplicate(destAccountId)
        && !isSameAsSource(destAccountId)
        && destAmount <= remainingBalance
        && batch.sourceSavingsAccountId !== undefined;

    const handleSourceChange = (accountId: number) => {
        const account = savingsAccounts.find(a => a.id === accountId);
        setBatch({
            ...batch,
            sourceSavingsAccountId: accountId,
            sourceClient: account?.client,
            details: [], // Reset destinations when source changes
            totalAmount: 0,
            commissionAmount: 0,
            totalDebitAmount: 0,
            numberOfTransfers: 0
        });
        setDestAccountId(null);
        setDestAmount(0);
    };

    const handleAddDestination = () => {
        if (!canAdd || destAccountId === null) return;

        const destAccount = savingsAccounts.find(a => a.id === destAccountId);
        const newDetail: VirementBatchDetail = {
            sequenceNumber: batch.details.length + 1,
            destinationSavingsAccountId: destAccountId,
            destinationSavingsAccount: destAccount,
            destinationAccountNumber: destAccount?.accountNumber || '',
            destinationClientName: destAccount?.client
                ? getClientDisplayName(destAccount.client)
                : '',
            destinationClient: destAccount?.client,
            amount: destAmount,
            status: 'PENDING'
        };

        const newDetails = [...batch.details, newDetail];
        const newTotalAllocated = newDetails.reduce((sum, d) => sum + (d.amount || 0), 0);
        const newCommission = Math.round(newTotalAllocated * (batch.commissionRate || 0) / 100);

        setBatch({
            ...batch,
            details: newDetails,
            totalAmount: newTotalAllocated,
            commissionAmount: newCommission,
            totalDebitAmount: newTotalAllocated + newCommission,
            numberOfTransfers: newDetails.length
        });

        setDestAccountId(null);
        setDestAmount(0);
    };

    const handleRemoveDestination = (index: number) => {
        const newDetails = batch.details.filter((_, i) => i !== index)
            .map((d, i) => ({ ...d, sequenceNumber: i + 1 }));
        const newTotalAllocated = newDetails.reduce((sum, d) => sum + (d.amount || 0), 0);
        const newCommission = Math.round(newTotalAllocated * (batch.commissionRate || 0) / 100);

        setBatch({
            ...batch,
            details: newDetails,
            totalAmount: newTotalAllocated,
            commissionAmount: newCommission,
            totalDebitAmount: newTotalAllocated + newCommission,
            numberOfTransfers: newDetails.length
        });
    };

    const handleCommissionRateChange = (rate: number) => {
        const newCommission = Math.round(totalAllocated * rate / 100);
        setBatch({
            ...batch,
            commissionRate: rate,
            commissionAmount: newCommission,
            totalDebitAmount: totalAllocated + newCommission
        });
    };

    // Filter out source account and already-added accounts from destination options
    const availableDestinations = savingsAccounts.filter(a =>
        a.id !== batch.sourceSavingsAccountId
        && !batch.details.some(d => d.destinationSavingsAccountId === a.id)
    );

    return (
        <div className="card p-fluid">
            {/* Source Section */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-sign-out mr-2"></i>
                    Compte Source (Débit)
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="batchBranchId" className="font-medium">Agence *</label>
                        <Dropdown
                            id="batchBranchId"
                            value={batch.branchId}
                            options={branches}
                            onChange={(e) => setBatch({ ...batch, branchId: e.value })}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner l'agence"
                            disabled={isViewMode}
                            filter
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="batchSourceAccount" className="font-medium">Compte Source *</label>
                        <Dropdown
                            id="batchSourceAccount"
                            value={batch.sourceSavingsAccountId}
                            options={savingsAccounts}
                            onChange={(e) => handleSourceChange(e.value)}
                            optionLabel="accountNumber"
                            optionValue="id"
                            placeholder="Sélectionner le compte source..."
                            disabled={isViewMode}
                            filter
                            filterBy="accountNumber"
                            filterPlaceholder="Rechercher par numéro de compte"
                            className="w-full"
                            itemTemplate={(item: any) => (
                                <span>{item.accountNumber} - {getClientDisplayName(item.client)} ({formatCurrency(item.availableBalance || item.currentBalance || 0)})</span>
                            )}
                            valueTemplate={(item: any, props: any) => {
                                if (item) return <span>{item.accountNumber} - {getClientDisplayName(item.client)}</span>;
                                return <span>{props?.placeholder}</span>;
                            }}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="batchDate" className="font-medium">Date *</label>
                        <Calendar
                            id="batchDate"
                            value={batch.dateVirement ? new Date(batch.dateVirement) : null}
                            onChange={(e) => setBatch({ ...batch, dateVirement: e.value ? (e.value as Date).toISOString().split('T')[0] : '' })}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                        />
                    </div>
                </div>
                {batch.sourceSavingsAccountId && (
                    <div className="mt-2 p-2 surface-50 border-round">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-wallet text-blue-500"></i>
                                <span className="text-600">Solde disponible: <strong className="text-primary">{formatCurrency(sourceBalance)}</strong></span>
                            </div>
                            <span className="text-300">|</span>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-calculator text-orange-500"></i>
                                <span className="text-600">Restant après virements: <strong className={remainingBalance < 0 ? 'text-red-500' : 'text-green-600'}>{formatCurrency(remainingBalance)}</strong></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Commission Section */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-money-bill mr-2"></i>
                    Commission et Totaux
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="batchCommRate" className="font-medium">Taux Commission (%)</label>
                        <InputNumber
                            id="batchCommRate"
                            value={batch.commissionRate}
                            onValueChange={(e) => handleCommissionRateChange(e.value || 0)}
                            mode="decimal"
                            minFractionDigits={1}
                            maxFractionDigits={2}
                            disabled={isViewMode}
                            className="w-full"
                            suffix=" %"
                            min={0}
                            max={100}
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label className="font-medium">Total Virements</label>
                        <InputNumber
                            value={totalAllocated}
                            disabled
                            mode="decimal"
                            className="w-full"
                            suffix=" FBU"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label className="font-medium">Commission</label>
                        <InputNumber
                            value={commissionAmount}
                            disabled
                            mode="decimal"
                            className="w-full"
                            suffix=" FBU"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label className="font-medium">Total Débité</label>
                        <InputNumber
                            value={totalDebitAmount}
                            disabled
                            mode="decimal"
                            className="w-full font-bold"
                            suffix=" FBU"
                        />
                    </div>
                </div>
                {batch.sourceSavingsAccountId && totalDebitAmount > sourceBalance && (
                    <div className="mt-2 p-2 border-round bg-red-50" style={{ border: '1px solid #ef4444' }}>
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-exclamation-triangle text-red-500"></i>
                            <span className="text-red-700 font-medium">Solde insuffisant! Disponible: {formatCurrency(sourceBalance)}, Requis: {formatCurrency(totalDebitAmount)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Motif */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-comment mr-2"></i>
                    Motif et Notes
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="batchMotif" className="font-medium">Motif *</label>
                        <InputText
                            id="batchMotif"
                            value={batch.motif || ''}
                            onChange={(e) => setBatch({ ...batch, motif: e.target.value })}
                            disabled={isViewMode}
                            placeholder="Ex: Paiement salaires, distribution dividendes..."
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="batchNotes" className="font-medium">Notes</label>
                        <InputTextarea
                            id="batchNotes"
                            value={batch.notes || ''}
                            onChange={(e) => setBatch({ ...batch, notes: e.target.value })}
                            rows={2}
                            disabled={isViewMode}
                            placeholder="Observations..."
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Destinations Section */}
            <div className="surface-100 p-3 border-round">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-users mr-2"></i>
                    Comptes Destinataires ({batch.details.length} bénéficiaire{batch.details.length > 1 ? 's' : ''})
                </h5>

                {/* Add destination row */}
                {!isViewMode && batch.sourceSavingsAccountId && (
                    <div className="formgrid grid align-items-end mb-3 p-3 surface-50 border-round">
                        <div className="field col-12 md:col-5 mb-0">
                            <label className="font-medium">Compte Destination</label>
                            <Dropdown
                                value={destAccountId}
                                options={availableDestinations}
                                onChange={(e) => setDestAccountId(e.value)}
                                optionLabel="accountNumber"
                                optionValue="id"
                                placeholder="Sélectionner un compte..."
                                filter
                                filterBy="accountNumber"
                                filterPlaceholder="Rechercher..."
                                className="w-full"
                                itemTemplate={(item: any) => (
                                    <span>{item.accountNumber} - {getClientDisplayName(item.client)}</span>
                                )}
                                valueTemplate={(item: any, props: any) => {
                                    if (item) return <span>{item.accountNumber} - {getClientDisplayName(item.client)}</span>;
                                    return <span>{props?.placeholder}</span>;
                                }}
                            />
                        </div>
                        <div className="field col-12 md:col-4 mb-0">
                            <label className="font-medium">Montant (max: {formatCurrency(Math.max(0, remainingBalance))})</label>
                            <InputNumber
                                value={destAmount}
                                onValueChange={(e) => setDestAmount(e.value || 0)}
                                mode="decimal"
                                className="w-full"
                                suffix=" FBU"
                                min={0}
                                max={Math.max(0, remainingBalance)}
                                placeholder="0"
                            />
                        </div>
                        <div className="field col-12 md:col-3 mb-0">
                            <Button
                                label="Ajouter"
                                icon="pi pi-plus"
                                onClick={handleAddDestination}
                                disabled={!canAdd}
                                className="p-button-success w-full"
                            />
                        </div>
                    </div>
                )}

                {/* Destinations DataTable */}
                <DataTable
                    value={batch.details}
                    emptyMessage="Aucun bénéficiaire ajouté"
                    showGridlines
                    stripedRows
                    size="small"
                >
                    <Column field="sequenceNumber" header="#" style={{ width: '50px' }} />
                    <Column
                        header="N° Compte"
                        body={(row: VirementBatchDetail) => row.destinationAccountNumber || row.destinationSavingsAccount?.accountNumber || '-'}
                    />
                    <Column
                        header="Client"
                        body={(row: VirementBatchDetail) => row.destinationClientName || getClientDisplayName(row.destinationClient)}
                    />
                    <Column
                        header="Montant"
                        body={(row: VirementBatchDetail) => formatCurrency(row.amount)}
                        style={{ textAlign: 'right' }}
                    />
                    {isViewMode && (
                        <Column
                            header="Solde Avant"
                            body={(row: VirementBatchDetail) => row.destinationBalanceBefore !== undefined ? formatCurrency(row.destinationBalanceBefore) : '-'}
                            style={{ textAlign: 'right' }}
                        />
                    )}
                    {isViewMode && (
                        <Column
                            header="Solde Après"
                            body={(row: VirementBatchDetail) => row.destinationBalanceAfter !== undefined ? formatCurrency(row.destinationBalanceAfter) : '-'}
                            style={{ textAlign: 'right' }}
                        />
                    )}
                    {isViewMode && (
                        <Column
                            field="status"
                            header="Statut"
                            body={(row: VirementBatchDetail) => {
                                if (row.status === 'SUCCESS') return <span className="text-green-600 font-bold">Succès</span>;
                                if (row.status === 'FAILED') return <span className="text-red-600 font-bold">Échoué</span>;
                                return <span className="text-orange-600">En attente</span>;
                            }}
                        />
                    )}
                    {!isViewMode && (
                        <Column
                            header=""
                            style={{ width: '60px' }}
                            body={(_: any, options: any) => (
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-rounded p-button-danger p-button-sm"
                                    onClick={() => handleRemoveDestination(options.rowIndex)}
                                    tooltip="Retirer"
                                />
                            )}
                        />
                    )}
                </DataTable>

                {/* Summary */}
                {batch.details.length > 0 && (
                    <div className="mt-3 p-3 surface-50 border-round">
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-users text-blue-500"></i>
                                    <span><strong>{batch.details.length}</strong> bénéficiaire{batch.details.length > 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-money-bill text-green-500"></i>
                                    <span>Total: <strong>{formatCurrency(totalAllocated)}</strong></span>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-wallet text-orange-500"></i>
                                    <span>Restant: <strong className={remainingBalance < 0 ? 'text-red-500' : 'text-green-600'}>{formatCurrency(remainingBalance)}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VirementBatchForm;
