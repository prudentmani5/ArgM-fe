'use client';
import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { DepositSlip, CashDenomination, FBU_DENOMINATIONS } from './DepositSlip';

interface DepositSlipFormProps {
    depositSlip: DepositSlip;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    onDenominationsChange: (denominations: CashDenomination[], total: number) => void;
    clients: any[];
    branches: any[];
    savingsAccounts: any[];
    currencies: any[];
    onSavingsAccountChange?: (accountId: number) => void;
    isViewMode?: boolean;
}

const DepositSlipForm: React.FC<DepositSlipFormProps> = ({
    depositSlip,
    handleChange,
    handleDropdownChange,
    handleDateChange,
    handleNumberChange,
    onDenominationsChange,
    clients,
    branches,
    savingsAccounts,
    currencies,
    onSavingsAccountChange,
    isViewMode = false
}) => {
    const [denominations, setDenominations] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        // Initialize denominations from depositSlip if available
        if (depositSlip.cashDenominations && depositSlip.cashDenominations.length > 0) {
            const denoms: { [key: number]: number } = {};
            depositSlip.cashDenominations.forEach(d => {
                denoms[d.denomination] = d.quantity;
            });
            setDenominations(denoms);
        }
    }, [depositSlip.cashDenominations]);

    const handleDenominationChange = (denomination: number, quantity: number) => {
        const newDenominations = { ...denominations, [denomination]: quantity };
        setDenominations(newDenominations);

        // Calculate total and create denominations array
        let total = 0;
        const denomsArray: CashDenomination[] = [];
        FBU_DENOMINATIONS.forEach(denom => {
            const qty = newDenominations[denom] || 0;
            if (qty > 0) {
                const amount = denom * qty;
                total += amount;
                denomsArray.push({
                    denomination: denom,
                    quantity: qty,
                    totalAmount: amount
                });
            }
        });

        onDenominationsChange(denomsArray, total);
    };

    const calculateSubtotal = (denomination: number) => {
        return (denominations[denomination] || 0) * denomination;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const depositorRelationships = [
        { label: 'Titulaire du compte', value: 'TITULAIRE' },
        { label: 'Conjoint(e)', value: 'CONJOINT' },
        { label: 'Parent', value: 'PARENT' },
        { label: 'Enfant', value: 'ENFANT' },
        { label: 'Mandataire', value: 'MANDATAIRE' },
        { label: 'Autre', value: 'AUTRE' }
    ];

    return (
        <div className="card p-fluid">
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-file mr-2"></i>
                    Informations du Bordereau
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="slipNumber" className="font-medium">N° Bordereau</label>
                        <InputText
                            id="slipNumber"
                            name="slipNumber"
                            value={depositSlip.slipNumber}
                            disabled
                            placeholder="Généré automatiquement"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="depositDate" className="font-medium">Date de Dépôt *</label>
                        <Calendar
                            id="depositDate"
                            value={depositSlip.depositDate ? new Date(depositSlip.depositDate) : null}
                            onChange={(e) => handleDateChange('depositDate', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="branchId" className="font-medium">Agence *</label>
                        <Dropdown
                            id="branchId"
                            value={depositSlip.branchId}
                            options={branches}
                            onChange={(e) => handleDropdownChange('branchId', e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner l'agence"
                            disabled={isViewMode}
                            filter
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="currencyId" className="font-medium">Devise *</label>
                        <Dropdown
                            id="currencyId"
                            value={depositSlip.currencyId}
                            options={currencies}
                            onChange={(e) => handleDropdownChange('currencyId', e.value)}
                            optionLabel="code"
                            optionValue="id"
                            placeholder="Sélectionner la devise"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-user mr-2"></i>
                    Compte Bénéficiaire et Client
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="savingsAccountId" className="font-medium">Compte d'Épargne *</label>
                        <Dropdown
                            id="savingsAccountId"
                            value={depositSlip.savingsAccountId}
                            options={savingsAccounts}
                            onChange={(e) => {
                                handleDropdownChange('savingsAccountId', e.value);
                                if (onSavingsAccountChange) onSavingsAccountChange(e.value);
                            }}
                            optionLabel={(item) => `${item.accountNumber} - ${item.client?.firstName || ''} ${item.client?.lastName || ''} (${formatCurrency(item.currentBalance || 0)})`}
                            optionValue="id"
                            placeholder="Sélectionner le compte d'épargne..."
                            disabled={isViewMode}
                            filter
                            filterPlaceholder="Rechercher par numéro de compte"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="clientId" className="font-medium">Client (auto-rempli)</label>
                        <Dropdown
                            id="clientId"
                            value={depositSlip.clientId}
                            options={clients}
                            onChange={(e) => handleDropdownChange('clientId', e.value)}
                            optionLabel={(item) => `${item.firstName} ${item.lastName} - ${item.clientNumber}`}
                            optionValue="id"
                            placeholder="Sélectionnez d'abord un compte..."
                            disabled={true}
                            className="w-full"
                        />
                    </div>
                </div>
                {depositSlip.savingsAccountId && (
                    <div className="mt-2 p-2 surface-50 border-round">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span className="text-500">Le client est automatiquement récupéré depuis le compte sélectionné</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-id-card mr-2"></i>
                    Informations du Déposant
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="depositorName" className="font-medium">Nom du Déposant</label>
                        <InputText
                            id="depositorName"
                            name="depositorName"
                            value={depositSlip.depositorName || ''}
                            onChange={handleChange}
                            disabled={isViewMode}
                            placeholder="Nom complet du déposant"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="depositorRelationship" className="font-medium">Relation avec le Titulaire</label>
                        <Dropdown
                            id="depositorRelationship"
                            value={depositSlip.depositorRelationship}
                            options={depositorRelationships}
                            onChange={(e) => handleDropdownChange('depositorRelationship', e.value)}
                            placeholder="Sélectionner la relation"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="depositorPhone" className="font-medium">Téléphone</label>
                        <InputText
                            id="depositorPhone"
                            name="depositorPhone"
                            value={depositSlip.depositorPhone || ''}
                            onChange={handleChange}
                            disabled={isViewMode}
                            placeholder="Ex: +257 79 XXX XXX"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="depositorIdNumber" className="font-medium">N° Pièce d'Identité</label>
                        <InputText
                            id="depositorIdNumber"
                            name="depositorIdNumber"
                            value={depositSlip.depositorIdNumber || ''}
                            onChange={handleChange}
                            disabled={isViewMode}
                            placeholder="Numéro CNI ou passeport"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-money-bill mr-2"></i>
                    Décompte des Billets
                </h5>
                <p className="text-500 mb-3">
                    <i className="pi pi-info-circle mr-2"></i>
                    Comptez les billets en présence du client
                </p>
                <div className="grid">
                    {FBU_DENOMINATIONS.map(denomination => (
                        <div key={denomination} className="col-12 md:col-6 lg:col-4">
                            <div className="flex align-items-center gap-2 mb-2">
                                <span className="font-medium" style={{ width: '100px' }}>
                                    {formatCurrency(denomination)}
                                </span>
                                <span className="text-500">×</span>
                                <InputNumber
                                    value={denominations[denomination] || 0}
                                    onValueChange={(e) => handleDenominationChange(denomination, e.value || 0)}
                                    min={0}
                                    disabled={isViewMode}
                                    className="w-6rem"
                                    showButtons
                                    buttonLayout="horizontal"
                                    incrementButtonIcon="pi pi-plus"
                                    decrementButtonIcon="pi pi-minus"
                                />
                                <span className="text-500">=</span>
                                <span className="font-bold text-primary" style={{ width: '120px' }}>
                                    {formatCurrency(calculateSubtotal(denomination))}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <Divider />
                <div className="flex justify-content-end align-items-center gap-3">
                    <span className="text-xl font-medium">TOTAL:</span>
                    <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(depositSlip.totalAmount)}
                    </span>
                </div>
            </div>

            <div className="surface-100 p-3 border-round">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-comment mr-2"></i>
                    Notes
                </h5>
                <InputTextarea
                    id="notes"
                    name="notes"
                    value={depositSlip.notes || ''}
                    onChange={handleChange}
                    rows={3}
                    disabled={isViewMode}
                    placeholder="Observations ou commentaires..."
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default DepositSlipForm;
