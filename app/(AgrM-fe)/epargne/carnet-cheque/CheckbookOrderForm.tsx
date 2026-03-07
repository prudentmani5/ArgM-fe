'use client';
import React from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { CheckbookOrder } from './CheckbookOrder';
import { getClientDisplayName } from '@/utils/clientUtils';

interface CheckbookOrderFormProps {
    order: CheckbookOrder;
    setOrder: (order: CheckbookOrder) => void;
    branches: any[];
    savingsAccounts: any[];
    comptesComptables: any[];
    comptesCommission?: any[];
    onSavingsAccountChange?: (accountId: number) => void;
    isViewMode?: boolean;
}

const CheckbookOrderForm: React.FC<CheckbookOrderFormProps> = ({
    order,
    setOrder,
    branches,
    savingsAccounts,
    comptesComptables,
    comptesCommission,
    onSavingsAccountChange,
    isViewMode = false
}) => {

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '0 FBU';
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const selectedAccount = savingsAccounts.find(acc => acc.id === order.savingsAccountId);

    const accountOptionTemplate = (option: any) => {
        if (!option) return '';
        const clientName = option.client
            ? getClientDisplayName(option.client)
            : '';
        const balance = option.currentBalance != null ? formatCurrency(option.currentBalance) : '';
        return (
            <div className="flex align-items-center justify-content-between w-full">
                <span>{option.accountNumber} - {clientName}</span>
                <span className="text-green-600 font-bold ml-2">{balance}</span>
            </div>
        );
    };

    const compteOptionTemplate = (option: any) => {
        if (!option) return '';
        return (
            <div>
                <span className="font-bold">{option.codeCompte}</span> - {option.libelle}
            </div>
        );
    };

    return (
        <div>
            {/* Section 1: Compte et Client */}
            <div className="surface-100 p-3 border-round mb-3">
                <h6 className="mt-0 mb-3">
                    <i className="pi pi-user mr-2 text-blue-500"></i>
                    Compte et Client
                </h6>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="branchId" className="font-medium">Agence *</label>
                            <Dropdown
                                id="branchId"
                                value={order.branchId}
                                options={branches}
                                onChange={(e) => setOrder({ ...order, branchId: e.value })}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Sélectionner l'agence"
                                className="w-full"
                                filter
                                disabled={isViewMode}
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="savingsAccountId" className="font-medium">Compte d'Épargne *</label>
                            <Dropdown
                                id="savingsAccountId"
                                value={order.savingsAccountId}
                                options={savingsAccounts}
                                onChange={(e) => {
                                    setOrder({ ...order, savingsAccountId: e.value });
                                    if (onSavingsAccountChange) onSavingsAccountChange(e.value);
                                }}
                                optionLabel="accountNumber"
                                optionValue="id"
                                placeholder="Sélectionner le compte"
                                className="w-full"
                                filter
                                disabled={isViewMode}
                                itemTemplate={accountOptionTemplate}
                            />
                        </div>
                    </div>
                </div>
                {selectedAccount && (
                    <div className="surface-0 p-2 border-round border-1 border-blue-200">
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <small className="text-500">Client:</small>
                                <div className="font-bold">
                                    {selectedAccount.client
                                        ? getClientDisplayName(selectedAccount.client)
                                        : '-'}
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <small className="text-500">N° Compte:</small>
                                <div className="font-bold">{selectedAccount.accountNumber || '-'}</div>
                            </div>
                            <div className="col-12 md:col-4">
                                <small className="text-500">Solde actuel:</small>
                                <div className="font-bold text-green-600">{formatCurrency(selectedAccount.currentBalance)}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 2: Tarification */}
            <div className="surface-100 p-3 border-round mb-3">
                <h6 className="mt-0 mb-3">
                    <i className="pi pi-money-bill mr-2 text-green-500"></i>
                    Tarification
                </h6>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="numberOfLeaves" className="font-medium">Nombre de feuilles</label>
                            <InputNumber
                                id="numberOfLeaves"
                                value={order.numberOfLeaves}
                                onValueChange={(e) => setOrder({ ...order, numberOfLeaves: e.value || 50 })}
                                showButtons
                                min={1}
                                max={200}
                                className="w-full"
                                disabled={isViewMode}
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="unitPrice" className="font-medium">Prix du carnet (FBU) *</label>
                            <InputNumber
                                id="unitPrice"
                                value={order.unitPrice}
                                onValueChange={(e) => {
                                    const price = e.value || 5000;
                                    const fee = order.feeAmount || 0;
                                    setOrder({ ...order, unitPrice: price, totalAmount: price + fee });
                                }}
                                suffix=" FBU"
                                min={0}
                                className="w-full"
                                disabled={isViewMode}
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="feeAmount" className="font-medium">Commission bancaire (FBU)</label>
                            <InputNumber
                                id="feeAmount"
                                value={order.feeAmount}
                                onValueChange={(e) => {
                                    const fee = e.value || 0;
                                    const price = order.unitPrice || 5000;
                                    setOrder({ ...order, feeAmount: fee, totalAmount: price + fee });
                                }}
                                suffix=" FBU"
                                min={0}
                                className="w-full"
                                disabled={isViewMode}
                            />
                            <small className="text-500">Frais de service (ex: compte 706)</small>
                        </div>
                    </div>
                </div>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label className="font-medium">Prix carnet</label>
                            <div className="p-2 surface-0 border-round border-1 border-200 text-center">
                                <span className="text-lg font-bold">{formatCurrency(order.unitPrice)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label className="font-medium">+ Commission</label>
                            <div className="p-2 surface-0 border-round border-1 border-200 text-center">
                                <span className="text-lg font-bold text-orange-600">{formatCurrency(order.feeAmount || 0)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label className="font-medium">= Total à débiter</label>
                            <div className="p-3 surface-0 border-round border-1 border-green-300 text-center">
                                <span className="text-2xl font-bold text-green-600">
                                    {formatCurrency(order.totalAmount || order.unitPrice)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Comptes Comptables */}
            <div className="surface-100 p-3 border-round mb-3">
                <h6 className="mt-0 mb-3">
                    <i className="pi pi-book mr-2 text-purple-500"></i>
                    Comptes Comptables
                </h6>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="accountingAccountId" className="font-medium">Compte coût du carnet *</label>
                            <Dropdown
                                id="accountingAccountId"
                                value={order.accountingAccountId}
                                options={comptesComptables}
                                onChange={(e) => setOrder({ ...order, accountingAccountId: e.value })}
                                optionLabel="libelle"
                                optionValue="compteId"
                                placeholder="Sélectionner le compte"
                                className="w-full"
                                filter
                                filterBy="codeCompte,libelle"
                                disabled={isViewMode}
                                itemTemplate={compteOptionTemplate}
                                valueTemplate={(option) => {
                                    if (!option) return 'Sélectionner le compte';
                                    return `${option.codeCompte} - ${option.libelle}`;
                                }}
                            />
                            <small className="text-500">
                                Ex: 312 (Carnets de livrets et reçus), 603 (Carnets, livrets et formulaires)
                            </small>
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="feeAccountId" className="font-medium">Compte commission / revenus</label>
                            <Dropdown
                                id="feeAccountId"
                                value={order.feeAccountId}
                                options={comptesCommission || comptesComptables}
                                onChange={(e) => setOrder({ ...order, feeAccountId: e.value })}
                                optionLabel="libelle"
                                optionValue="compteId"
                                placeholder="Sélectionner le compte de commission"
                                className="w-full"
                                filter
                                filterBy="codeCompte,libelle"
                                disabled={isViewMode}
                                itemTemplate={compteOptionTemplate}
                                valueTemplate={(option) => {
                                    if (!option) return 'Sélectionner le compte de commission';
                                    return `${option.codeCompte} - ${option.libelle}`;
                                }}
                            />
                            <small className="text-500">
                                Ex: 706 (Frais de carte / livret)
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Motif et Notes */}
            <div className="surface-100 p-3 border-round mb-3">
                <h6 className="mt-0 mb-3">
                    <i className="pi pi-comment mr-2 text-orange-500"></i>
                    Motif et Notes
                </h6>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="motif" className="font-medium">Motif</label>
                            <InputTextarea
                                id="motif"
                                value={order.motif || ''}
                                onChange={(e) => setOrder({ ...order, motif: e.target.value })}
                                rows={2}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Motif de la commande..."
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="notes" className="font-medium">Notes</label>
                            <InputTextarea
                                id="notes"
                                value={order.notes || ''}
                                onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                                rows={2}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Notes additionnelles..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* View Mode: Balance Info */}
            {isViewMode && (order.balanceBefore !== undefined || order.balanceAfter !== undefined) && (
                <div className="surface-100 p-3 border-round mb-3">
                    <h6 className="mt-0 mb-3">
                        <i className="pi pi-chart-line mr-2 text-blue-500"></i>
                        Soldes
                    </h6>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <small className="text-500">Solde avant:</small>
                            <div className="font-bold text-lg">{formatCurrency(order.balanceBefore)}</div>
                        </div>
                        <div className="col-12 md:col-6">
                            <small className="text-500">Solde après:</small>
                            <div className="font-bold text-lg text-red-600">{formatCurrency(order.balanceAfter)}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckbookOrderForm;
