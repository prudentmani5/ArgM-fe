'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Virement, TRANSFER_TYPE_OPTIONS } from './Virement';
import { getClientDisplayName } from '@/utils/clientUtils';

interface VirementFormProps {
    virement: Virement;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    savingsAccounts: any[];
    comptesComptables: any[];
    internalAccounts?: any[];
    branches: any[];
    onSourceAccountChange?: (accountId: number) => void;
    onDestinationAccountChange?: (accountId: number) => void;
    isViewMode?: boolean;
    branchLocked?: boolean;
}

const VirementForm: React.FC<VirementFormProps> = ({
    virement,
    handleChange,
    handleDropdownChange,
    handleDateChange,
    handleNumberChange,
    savingsAccounts,
    comptesComptables,
    internalAccounts = [],
    branches,
    onSourceAccountChange,
    onDestinationAccountChange,
    isViewMode = false,
    branchLocked = false
}) => {

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const isClientSource = virement.transferType === 'CLIENT_TO_CLIENT' || virement.transferType === 'CLIENT_TO_ACCOUNT';
    const isClientDestination = virement.transferType === 'CLIENT_TO_CLIENT' || virement.transferType === 'ACCOUNT_TO_CLIENT';
    const isAccountSource = virement.transferType === 'ACCOUNT_TO_CLIENT';
    const isAccountDestination = virement.transferType === 'CLIENT_TO_ACCOUNT';

    // Get source account balance for display
    const sourceAccount = savingsAccounts.find(a => a.id === virement.sourceSavingsAccountId);
    const sourceBalance = sourceAccount?.availableBalance || sourceAccount?.currentBalance || 0;

    return (
        <div className="card p-fluid">
            {/* Type de Virement */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-arrow-right-arrow-left mr-2"></i>
                    Type de Virement
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="transferType" className="font-medium">Type de Transfert *</label>
                        <Dropdown
                            id="transferType"
                            value={virement.transferType}
                            options={TRANSFER_TYPE_OPTIONS}
                            onChange={(e) => handleDropdownChange('transferType', e.value)}
                            placeholder="Sélectionner le type"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="reference" className="font-medium">N° Virement</label>
                        <InputText
                            id="reference"
                            name="reference"
                            value={virement.reference}
                            disabled
                            placeholder="Généré automatiquement"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="dateVirement" className="font-medium">Date *</label>
                        <Calendar
                            id="dateVirement"
                            value={virement.dateVirement ? new Date(virement.dateVirement) : null}
                            onChange={(e) => handleDateChange('dateVirement', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="branchId" className="font-medium">Agence *</label>
                        <Dropdown
                            id="branchId"
                            value={virement.branchId}
                            options={branches}
                            onChange={(e) => handleDropdownChange('branchId', e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner l'agence"
                            disabled={isViewMode || branchLocked}
                            filter
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Compte Source */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-sign-out mr-2"></i>
                    Compte Source (Débit)
                </h5>
                <div className="formgrid grid">
                    {isClientSource && (
                        <div className="field col-12 md:col-6">
                            <label htmlFor="sourceSavingsAccountId" className="font-medium">Compte d'Épargne Source *</label>
                            <Dropdown
                                id="sourceSavingsAccountId"
                                value={virement.sourceSavingsAccountId}
                                options={savingsAccounts}
                                onChange={(e) => {
                                    handleDropdownChange('sourceSavingsAccountId', e.value);
                                    if (onSourceAccountChange) onSourceAccountChange(e.value);
                                }}
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
                    )}
                    {isAccountSource && (
                        <div className="field col-12 md:col-6">
                            <label htmlFor="sourceAccountCode" className="font-medium">Compte Interne Source *</label>
                            <Dropdown
                                id="sourceAccountCode"
                                value={virement.sourceAccountCode}
                                options={internalAccounts}
                                onChange={(e) => handleDropdownChange('sourceAccountCode', e.value)}
                                optionLabel="codeCompte"
                                optionValue="codeCompte"
                                placeholder="Sélectionner le compte interne..."
                                disabled={isViewMode}
                                filter
                                filterBy="codeCompte,libelle"
                                className="w-full"
                                itemTemplate={(item: any) => (
                                    <span>{item.codeCompte} - {item.libelle} (Solde: {new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(item.soldeActuel || 0)} FBU)</span>
                                )}
                                valueTemplate={(item: any, props: any) => {
                                    if (item) return <span>{item.codeCompte} - {item.libelle}</span>;
                                    return <span>{props?.placeholder}</span>;
                                }}
                            />
                        </div>
                    )}
                    {isClientSource && virement.sourceSavingsAccountId && (
                        <div className="field col-12 md:col-6">
                            <div className="mt-4 p-2 surface-50 border-round">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-wallet text-blue-500"></i>
                                    <span className="text-600">Solde disponible: <strong className="text-primary">{formatCurrency(sourceBalance)}</strong></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Compte Destination */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-sign-in mr-2"></i>
                    Compte Destination (Crédit)
                </h5>
                <div className="formgrid grid">
                    {isClientDestination && (
                        <div className="field col-12 md:col-6">
                            <label htmlFor="destinationSavingsAccountId" className="font-medium">Compte d'Épargne Destination *</label>
                            <Dropdown
                                id="destinationSavingsAccountId"
                                value={virement.destinationSavingsAccountId}
                                options={savingsAccounts}
                                onChange={(e) => {
                                    handleDropdownChange('destinationSavingsAccountId', e.value);
                                    if (onDestinationAccountChange) onDestinationAccountChange(e.value);
                                }}
                                optionLabel="accountNumber"
                                optionValue="id"
                                placeholder="Sélectionner le compte destination..."
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
                    )}
                    {isAccountDestination && (
                        <div className="field col-12 md:col-6">
                            <label htmlFor="destinationAccountCode" className="font-medium">Compte Interne Destination *</label>
                            <Dropdown
                                id="destinationAccountCode"
                                value={virement.destinationAccountCode}
                                options={internalAccounts}
                                onChange={(e) => handleDropdownChange('destinationAccountCode', e.value)}
                                optionLabel="codeCompte"
                                optionValue="codeCompte"
                                placeholder="Sélectionner le compte interne..."
                                disabled={isViewMode}
                                filter
                                filterBy="codeCompte,libelle"
                                className="w-full"
                                itemTemplate={(item: any) => (
                                    <span>{item.codeCompte} - {item.libelle} (Solde: {new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(item.soldeActuel || 0)} FBU)</span>
                                )}
                                valueTemplate={(item: any, props: any) => {
                                    if (item) return <span>{item.codeCompte} - {item.libelle}</span>;
                                    return <span>{props?.placeholder}</span>;
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Montant et Commission */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-money-bill mr-2"></i>
                    Montant et Commission
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="montant" className="font-medium">Montant du Virement *</label>
                        <InputNumber
                            id="montant"
                            value={virement.montant}
                            onValueChange={(e) => handleNumberChange('montant', e.value)}
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={2}
                            disabled={isViewMode}
                            className="w-full"
                            placeholder="0"
                            min={0}
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="commissionRate" className="font-medium">Taux Commission (%)</label>
                        <InputNumber
                            id="commissionRate"
                            value={virement.commissionRate}
                            onValueChange={(e) => handleNumberChange('commissionRate', e.value)}
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
                        <label htmlFor="commissionAmount" className="font-medium">Commission</label>
                        <InputNumber
                            id="commissionAmount"
                            value={virement.commissionAmount}
                            disabled
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={2}
                            className="w-full"
                            suffix=" FBU"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="totalDebitAmount" className="font-medium">Total Débité</label>
                        <InputNumber
                            id="totalDebitAmount"
                            value={virement.totalDebitAmount}
                            disabled
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={2}
                            className="w-full font-bold"
                            suffix=" FBU"
                        />
                    </div>
                </div>
                {isClientSource && virement.sourceSavingsAccountId && virement.totalDebitAmount > sourceBalance && (
                    <div className="mt-2 p-2 border-round bg-red-50" style={{ border: '1px solid #ef4444' }}>
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-exclamation-triangle text-red-500"></i>
                            <span className="text-red-700 font-medium">Solde insuffisant! Disponible: {formatCurrency(sourceBalance)}, Requis: {formatCurrency(virement.totalDebitAmount)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Motif et Notes */}
            <div className="surface-100 p-3 border-round">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-comment mr-2"></i>
                    Motif et Notes
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="motif" className="font-medium">Motif du Virement *</label>
                        <InputText
                            id="motif"
                            name="motif"
                            value={virement.motif || ''}
                            onChange={handleChange}
                            disabled={isViewMode}
                            placeholder="Ex: Paiement fournisseur, transfert épargne..."
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="notes" className="font-medium">Notes</label>
                        <InputTextarea
                            id="notes"
                            name="notes"
                            value={virement.notes || ''}
                            onChange={handleChange}
                            rows={2}
                            disabled={isViewMode}
                            placeholder="Observations..."
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VirementForm;
